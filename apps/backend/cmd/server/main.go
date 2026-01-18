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
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/auth"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/controllers"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/database"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/middleware"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/sessions"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/ws"
)

func main() {
	if err := godotenv.Load(); err != nil {
		// Not an error - .env is optional
	}

	cfg := config.Load()

	// Initialize logger
	logger.Configure(cfg.LogLevel, cfg.LogJSON)
	logger.Info("Starting server", logger.F(
		"env", cfg.Environment,
		"port", cfg.Port,
		"logLevel", cfg.LogLevel,
	))

	database.InitPostgres()
	sessions.InitRedis()
	auth.InitOAuthProviders(cfg)

	// Initialize WebSocket hub
	wsHub := ws.NewHub()
	globalWsHub = wsHub // Store for health check
	go wsHub.Run()
	wsHandler := ws.NewHandler(wsHub, cfg)
	logger.Info("WebSocket hub started")

	// Create rate limiters
	authRateLimiter := middleware.NewAuthRateLimiter()   // 10/min for auth endpoints
	apiRateLimiter := middleware.NewAPIRateLimiter()     // 60/min for general API

	r := chi.NewRouter()

	// Global middleware
	r.Use(middleware.Recovery(cfg))
	r.Use(middleware.Security(cfg))

	// Health check endpoints (no rate limiting)
	r.Get("/health", healthHandler)
	r.Get("/health/live", livenessHandler)
	r.Get("/health/ready", readinessHandler)

	// WebSocket endpoint for multiplayer games
	r.Get("/ws", wsHandler.ServeHTTP)

	// OAuth routes with auth rate limiting
	r.Group(func(ar chi.Router) {
		ar.Use(authRateLimiter.Middleware)
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
		lr.Post("/auth/logout", controllers.LogoutHandler(cfg))
	})

	// Protected session routes with API rate limiting
	r.Group(func(pr chi.Router) {
		pr.Use(apiRateLimiter.Middleware)
		pr.Use(middleware.Session)
		pr.Get("/profile/{username}", controllers.UserProfileHandler)
		pr.Get("/check-username", controllers.CheckUsernameHandler)
		pr.Post("/set-username", controllers.SetUsernameHandler)
	})

	// Apply CORS middleware (outermost layer)
	handler := middleware.CORS(cfg)(r)

	addr := ":" + cfg.Port
	server := &http.Server{
		Addr:         addr,
		Handler:      handler,
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

// healthHandler returns overall service health
func healthHandler(w http.ResponseWriter, r *http.Request) {
	dbOK := database.Ping() == nil
	redisOK := sessions.Ping() == nil

	status := "healthy"
	httpStatus := http.StatusOK
	if !dbOK || !redisOK {
		status = "unhealthy"
		httpStatus = http.StatusServiceUnavailable
	}

	response := map[string]interface{}{
		"status":   status,
		"database": dbOK,
		"redis":    redisOK,
	}

	// Add WebSocket stats if hub is available
	if globalWsHub != nil {
		response["wsClients"] = globalWsHub.GetClientCount()
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(httpStatus)
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
