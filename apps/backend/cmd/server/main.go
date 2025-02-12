package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/auth"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/controllers"
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

	auth.InitGoogleOAuth(cfg)

	mux := http.NewServeMux()

	mux.HandleFunc("/auth/google", auth.GoogleLoginHandler)
	mux.HandleFunc("/auth/google/callback", auth.GoogleCallbackHandler)

	// Protected
	mux.Handle("/profile", auth.SessionMiddleware(http.HandlerFunc(controllers.UserProfileHandler)))

	addr := ":" + port
	log.Printf("Server starting on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("ListenAndServe failed: %v", err)
	}
}
