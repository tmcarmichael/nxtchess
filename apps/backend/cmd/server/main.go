package main

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/auth"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/controllers"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/database"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/httpx"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/metrics"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/middleware"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/migrate"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/sessions"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/ws"
)

func main() {
	if err := godotenv.Load(); err != nil {
		// Not an error - .env is optional
	}

	cfg, configWarnings := config.Load()

	// Initialize logger
	logger.Configure(cfg.LogLevel, cfg.LogJSON)
	for _, w := range configWarnings {
		logger.Info(w)
	}
	logger.Info("Starting server", logger.F(
		"env", cfg.Environment,
		"port", cfg.Port,
		"logLevel", cfg.LogLevel,
	))

	database.InitPostgres()

	if os.Getenv("SKIP_MIGRATIONS") != "true" {
		if err := migrate.Run(database.DB); err != nil {
			logger.Error("Migration failed", logger.F("error", err.Error()))
			os.Exit(1)
		}
	} else {
		logger.Info("Skipping migrations (SKIP_MIGRATIONS=true)")
	}

	sessions.InitRedis()
	auth.InitOAuthProviders(cfg)

	// Initialize WebSocket hub with connection limiter
	connLimit, onDisconnect := ws.NewConnectionLimiterForHub()
	wsHub := ws.NewHub(onDisconnect)
	globalWsHub = wsHub // Store for health check (set before server starts)
	go wsHub.Run()
	wsHandler := ws.NewHandler(wsHub, cfg, connLimit)
	logger.Info("WebSocket hub started")

	// Create rate limiters with config for trusted proxy validation
	authRateLimiter := middleware.NewAuthRateLimiter(cfg)
	apiRateLimiter := middleware.NewAPIRateLimiter(cfg)

	metrics.Register()

	r := chi.NewRouter()

	// Global middleware (order matters - outermost to innermost)
	r.Use(middleware.RequestID)        // Add request ID for tracing (outermost)
	r.Use(middleware.Metrics)          // Prometheus HTTP metrics
	r.Use(middleware.RequestLogger)    // Request logging with duration
	r.Use(middleware.Recovery(cfg))    // Panic recovery
	r.Use(middleware.Security(cfg))    // Security headers
	r.Use(middleware.DefaultBodyLimit) // 1MB default body limit

	// Health check and metrics endpoints (no rate limiting)
	r.Get("/health", healthHandler)
	r.Get("/health/live", livenessHandler)
	r.Get("/health/ready", readinessHandler)
	r.Group(func(internal chi.Router) {
		internal.Use(middleware.InternalOnly(cfg))
		internal.Handle("/metrics", promhttp.Handler())
	})

	// WebSocket endpoint for multiplayer games (no body limit needed)
	r.Get("/ws", wsHandler.ServeHTTP)

	// OAuth routes with auth rate limiting (redirect on limit for browser navigation)
	r.Group(func(ar chi.Router) {
		ar.Use(authRateLimiter.RedirectMiddleware)
		ar.Get("/auth/google/login", auth.LoginHandler("Google", cfg))
		ar.Get("/auth/google/callback", auth.CallbackHandler("Google", cfg))
		ar.Get("/auth/github/login", auth.LoginHandler("GitHub", cfg))
		ar.Get("/auth/github/callback", auth.CallbackHandler("GitHub", cfg))
		ar.Get("/auth/discord/login", auth.LoginHandler("Discord", cfg))
		ar.Get("/auth/discord/callback", auth.CallbackHandler("Discord", cfg))
	})

	// Logout endpoint (rate limited, no session required)
	r.Group(func(lr chi.Router) {
		lr.Use(authRateLimiter.Middleware)
		lr.Use(middleware.SmallBodyLimit) // 64KB limit for JSON
		lr.Post("/auth/logout", controllers.LogoutHandler(cfg))
	})

	// Public API routes (no session required)
	r.Group(func(pub chi.Router) {
		pub.Use(apiRateLimiter.Middleware)
		pub.Use(middleware.SmallBodyLimit) // 64KB limit for JSON API
		pub.Get("/api/profile/{username}", controllers.UserProfileHandler)
		pub.Get("/api/profile/{username}/rating-history", controllers.UserRatingHistoryHandler)
		pub.Get("/api/profile/{username}/recent-games", controllers.UserRecentGamesHandler)
		pub.Get("/api/profile/{username}/achievements", controllers.UserAchievementsHandler)
		pub.Get("/api/achievements", controllers.AchievementCatalogHandler)

		// Training API routes
		pub.Get("/api/training/endgame/random", controllers.GetRandomEndgamePosition)
		pub.Get("/api/training/endgame/themes", controllers.GetEndgameThemes)
		pub.Get("/api/training/endgame/stats", controllers.GetEndgameStats)
	})

	// Optional session routes (returns different response for anon vs logged in)
	r.Group(func(opt chi.Router) {
		opt.Use(apiRateLimiter.Middleware)
		opt.Use(middleware.SmallBodyLimit)
		opt.Use(middleware.OptionalSession)
		opt.Get("/check-username", controllers.CheckUsernameHandler)
	})

	// Protected session routes with API rate limiting
	r.Group(func(pr chi.Router) {
		pr.Use(apiRateLimiter.Middleware)
		pr.Use(middleware.SmallBodyLimit) // 64KB limit for JSON API
		pr.Use(middleware.Session)
		pr.Post("/set-username", controllers.SetUsernameHandler)
		pr.Post("/set-profile-icon", controllers.SetProfileIconHandler)
		pr.Post("/api/puzzle/result", controllers.SubmitPuzzleResultHandler)
	})

	addr := ":" + cfg.Port
	server := &http.Server{
		Addr:         addr,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		logger.Info("HTTP server listening", logger.F("addr", addr))
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("Server failed", logger.F("error", err.Error()))
			os.Exit(1)
		}
	}()

	// Wait for interrupt signal for graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	// Create shutdown context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	// Shutdown HTTP server
	if err := server.Shutdown(ctx); err != nil {
		logger.Error("Server forced to shutdown", logger.F("error", err.Error()))
	}

	// Close database connection
	if err := database.Close(); err != nil {
		logger.Error("Error closing database", logger.F("error", err.Error()))
	}

	// Close Redis connection
	if err := sessions.Close(); err != nil {
		logger.Error("Error closing Redis", logger.F("error", err.Error()))
	}

	logger.Info("Server shutdown complete")
}

// wsHub is stored here so healthHandler can access it
var globalWsHub *ws.Hub

// healthHandler returns overall service health.
// Internal/private requests get full details; external requests get minimal status only.
func healthHandler(w http.ResponseWriter, r *http.Request) {
	dbOK := database.Ping() == nil
	redisOK := sessions.Ping() == nil

	status := "healthy"
	httpStatus := http.StatusOK
	if !dbOK || !redisOK {
		status = "unhealthy"
		httpStatus = http.StatusServiceUnavailable
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(httpStatus)

	if !httpx.IsPrivateIP(r.RemoteAddr) {
		json.NewEncoder(w).Encode(map[string]string{"status": status})
		return
	}

	response := map[string]interface{}{
		"status":   status,
		"database": dbOK,
		"redis":    redisOK,
	}
	if globalWsHub != nil {
		response["wsClients"] = globalWsHub.GetClientCount()
	}
	json.NewEncoder(w).Encode(response)
}

// livenessHandler for k8s liveness probe - just checks if server is running
func livenessHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ok"))
}

// readinessHandler for k8s readiness probe - checks if ready to serve traffic
func readinessHandler(w http.ResponseWriter, r *http.Request) {
	if database.Ping() != nil || sessions.Ping() != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		w.Write([]byte("not ready"))
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("ready"))
}
