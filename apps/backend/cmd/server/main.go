package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/auth"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/controllers"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/sessions"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found or couldn't load it. Continuing with OS environment...")
	}

	cfg := config.Load()
	port := cfg.Port
	if port == "" {
		port = "8080"
	}

	sessions.InitRedis()

	auth.InitGoogleOAuth(cfg)
	auth.InitGitHubOAuth(cfg)
	auth.InitDiscordOAuth(cfg)

	mux := http.NewServeMux()

	// Google
	mux.HandleFunc("/auth/google/login", auth.GoogleLoginHandler(cfg))
	mux.HandleFunc("/auth/google/callback", auth.GoogleCallbackHandler(cfg))

	// Discord
	mux.HandleFunc("/auth/discord/login", auth.DiscordLoginHandler(cfg))
	mux.HandleFunc("/auth/discord/callback", auth.DiscordCallbackHandler(cfg))

	// GitHub
	mux.HandleFunc("/auth/github/login", auth.GitHubLoginHandler(cfg))
	mux.HandleFunc("/auth/github/callback", auth.GitHubCallbackHandler(cfg))

	// Protected
	mux.Handle("/profile", auth.SessionMiddleware(http.HandlerFunc(controllers.UserProfileHandler)))

	addr := ":" + port
	log.Printf("Server starting on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("ListenAndServe failed: %v", err)
	}
}
