package config

import (
	"log"
	"os"
)

type Config struct {
	Port               string
	GoogleClientID     string
	GoogleClientSecret string
}

func Load() *Config {
	cfg := &Config{
		Port:               os.Getenv("PORT"),
		GoogleClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
	}

	if cfg.GoogleClientID == "" || cfg.GoogleClientSecret == "" {
		log.Fatal("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment.")
	}
	return cfg
}
