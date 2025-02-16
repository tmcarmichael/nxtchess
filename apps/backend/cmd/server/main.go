package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/auth"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/controllers"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/database"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/middleware"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/sessions"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, continuing with OS environment.")
	}

	cfg := config.Load()
	port := cfg.Port

	database.InitPostgres()
	sessions.InitRedis()
	auth.InitGoogleOAuth(cfg)
	auth.InitGitHubOAuth(cfg)
	auth.InitDiscordOAuth(cfg)

	r := chi.NewRouter()
	r.Use(middleware.Recovery)

	// OAuth
	r.Get("/auth/google/login", auth.GoogleLoginHandler(cfg))
	r.Get("/auth/google/callback", auth.GoogleCallbackHandler(cfg))
	r.Get("/auth/discord/login", auth.DiscordLoginHandler(cfg))
	r.Get("/auth/discord/callback", auth.DiscordCallbackHandler(cfg))
	r.Get("/auth/github/login", auth.GitHubLoginHandler(cfg))
	r.Get("/auth/github/callback", auth.GitHubCallbackHandler(cfg))

	// Protected session routes
	r.Group(func(pr chi.Router) {
		pr.Use(middleware.Session)
		pr.Get("/profile/{username}", controllers.UserProfileHandler)
		pr.Get("/check-username", controllers.CheckUsernameHandler)
		pr.Post("/set-username", controllers.SetUsernameHandler)
	})

	corsWrappedMux := middleware.CORS(r)

	addr := ":" + port
	log.Printf("Server starting on %s", addr)
	if err := http.ListenAndServe(addr, corsWrappedMux); err != nil {
		log.Fatalf("ListenAndServe failed: %v", err)
	}
}
