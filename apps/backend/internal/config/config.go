package config

import (
	"fmt"
	"os"
	"strings"
)

type Config struct {
	Port                string
	Environment         string   // "development" or "production"
	LogLevel            string   // "DEBUG", "INFO", "WARN", "ERROR"
	LogJSON             bool     // true for JSON output (production)
	GoogleClientID      string
	GoogleClientSecret  string
	GitHubClientID      string
	GitHubClientSecret  string
	DiscordClientID     string
	DiscordClientSecret string
	FrontendURL         string
	TrustedProxies      []string // CIDRs or IPs of trusted reverse proxies
}

// IsProd returns true if running in production environment
func (c *Config) IsProd() bool {
	return c.Environment == "production"
}

func Load() (*Config, []string) {
	var warnings []string

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

	// Parse trusted proxies (comma-separated CIDRs or IPs)
	var trustedProxies []string
	if tp := os.Getenv("TRUSTED_PROXIES"); tp != "" {
		for _, p := range strings.Split(tp, ",") {
			if trimmed := strings.TrimSpace(p); trimmed != "" {
				trustedProxies = append(trustedProxies, trimmed)
			}
		}
	}

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
		TrustedProxies:      trustedProxies,
	}

	if cfg.GoogleClientID == "" || cfg.GoogleClientSecret == "" {
		warnings = append(warnings, "Google OAuth credentials not set")
	}
	if cfg.DiscordClientID == "" || cfg.DiscordClientSecret == "" {
		warnings = append(warnings, "Discord OAuth credentials not set")
	}
	if cfg.GitHubClientID == "" || cfg.GitHubClientSecret == "" {
		warnings = append(warnings, "GitHub OAuth credentials not set")
	}

	if cfg.FrontendURL == "" {
		cfg.FrontendURL = "http://localhost:5173"
	}

	warnings = append(warnings, fmt.Sprintf("Config loaded: ENV=%s, FRONTEND_URL=%s, PORT=%s",
		cfg.Environment, cfg.FrontendURL, cfg.Port))

	return cfg, warnings
}
