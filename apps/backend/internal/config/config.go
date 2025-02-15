package config

import (
	"fmt"
	"log"
	"os"
)

type Config struct {
	Port                string
	GoogleClientID      string
	GoogleClientSecret  string
	GitHubClientID      string
	GitHubClientSecret  string
	DiscordClientID     string
	DiscordClientSecret string
	FrontendURL         string
	BackendURL          string
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	cfg := &Config{
		Port:                os.Getenv("PORT"),
		GoogleClientID:      os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret:  os.Getenv("GOOGLE_CLIENT_SECRET"),
		GitHubClientID:      os.Getenv("GITHUB_CLIENT_ID"),
		GitHubClientSecret:  os.Getenv("GITHUB_CLIENT_SECRET"),
		DiscordClientID:     os.Getenv("DISCORD_CLIENT_ID"),
		DiscordClientSecret: os.Getenv("DISCORD_CLIENT_SECRET"),
		FrontendURL:         os.Getenv("FRONTEND_URL"),
		BackendURL:          os.Getenv("BACKEND_URL"),
	}

	// AUTH
	if cfg.GoogleClientID == "" || cfg.GoogleClientSecret == "" {
		log.Fatal("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment.")
	}
	if cfg.DiscordClientID == "" || cfg.DiscordClientSecret == "" {
		log.Printf("Missing DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET in environment.")
	}
	if cfg.GitHubClientID == "" || cfg.GitHubClientSecret == "" {
		log.Printf("Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET in environment.")
	}

	// FE, BE
	if cfg.BackendURL == "" {
		cfg.BackendURL = fmt.Sprintf("http://localhost:%s", port)
	}
	if cfg.FrontendURL == "" {
		cfg.FrontendURL = "http://localhost:5173"
	}
	log.Printf("[Config] Loaded Configuration: FRONTEND_URL=%s, BACKEND_URL=%s, PORT=%s", cfg.FrontendURL, cfg.BackendURL, port)

	return cfg
}
