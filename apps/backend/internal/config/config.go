package config

import (
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
}

func Load() *Config {
	cfg := &Config{
		Port:                os.Getenv("PORT"),
		GoogleClientID:      os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret:  os.Getenv("GOOGLE_CLIENT_SECRET"),
		GitHubClientID:      os.Getenv("GITHUB_CLIENT_ID"),
		GitHubClientSecret:  os.Getenv("GITHUB_CLIENT_SECRET"),
		DiscordClientID:     os.Getenv("DISCORD_CLIENT_ID"),
		DiscordClientSecret: os.Getenv("DISCORD_CLIENT_SECRET"),
	}

	if cfg.GoogleClientID == "" || cfg.GoogleClientSecret == "" {
		log.Fatal("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment.")
	}
	if cfg.DiscordClientID == "" || cfg.DiscordClientSecret == "" {
		log.Fatal("Missing DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET in environment.")
	}
	if cfg.DiscordClientID == "" || cfg.DiscordClientSecret == "" {
		log.Fatal("Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET in environment.")
	}

	return cfg
}
