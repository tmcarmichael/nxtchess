package config

import (
	"log"
	"os"
)

type Config struct {
	DATABASE_URL         string
	PORT                 string
	GOOGLE_CLIENT_ID     string
	GOOGLE_CLIENT_SECRET string
	SUPABASE_URL         string
	SUPABASE_KEY         string
}

func LoadConfig() *Config {
	cfg := &Config{
		DATABASE_URL:         os.Getenv("DATABASE_URL"),
		PORT:                 getEnv("PORT", "8080"),
		GOOGLE_CLIENT_ID:     os.Getenv("GOOGLE_CLIENT_ID"),
		GOOGLE_CLIENT_SECRET: os.Getenv("GOOGLE_CLIENT_SECRET"),
		SUPABASE_URL:         os.Getenv("SUPABASE_URL"),
		SUPABASE_KEY:         os.Getenv("SUPABASE_KEY"),
	}
	if cfg.DATABASE_URL == "" {
		log.Fatal("DATABASE_URL is required for DB connections")
	}
	return cfg
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
