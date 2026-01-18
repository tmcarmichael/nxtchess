package config

import (
	"fmt"
	"log"
	"os"
	"strings"
)

type Config struct {
	Port                string
	Environment         string // "development" or "production"
	LogLevel            string // "DEBUG", "INFO", "WARN", "ERROR"
	LogJSON             bool   // true for JSON output (production)
	GoogleClientID      string
	GoogleClientSecret  string
	GitHubClientID      string
	GitHubClientSecret  string
	DiscordClientID     string
	DiscordClientSecret string
	FrontendURL         string
	BackendURL          string
}

// IsProd returns true if running in production environment
func (c *Config) IsProd() bool {
	return c.Environment == "production"
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	env := strings.ToLower(os.Getenv("ENV"))
	if env == "" {
		env = "development"
	}

	logLevel := strings.ToUpper(os.Getenv("LOG_LEVEL"))
	if logLevel == "" {
		if env == "production" {
			logLevel = "INFO"
		} else {
			logLevel = "DEBUG"
		}
	}

	logJSON := os.Getenv("LOG_JSON") == "true" || env == "production"

	cfg := &Config{
		Port:                port,
		Environment:         env,
		LogLevel:            logLevel,
		LogJSON:             logJSON,
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
		log.Printf("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment.")
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
	log.Printf("[Config] Loaded: ENV=%s, FRONTEND_URL=%s, BACKEND_URL=%s, PORT=%s", cfg.Environment, cfg.FrontendURL, cfg.BackendURL, cfg.Port)

	return cfg
}
