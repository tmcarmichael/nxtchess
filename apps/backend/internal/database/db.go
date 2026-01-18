package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitPostgres() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("[Database] DATABASE_URL environment variable is required")
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("[Database] Failed to open: %v", err)
	}

	// Connection pool configuration
	maxOpenConns := getEnvInt("DB_MAX_OPEN_CONNS", 25)
	maxIdleConns := getEnvInt("DB_MAX_IDLE_CONNS", 5)
	connMaxLifetimeMins := getEnvInt("DB_CONN_MAX_LIFETIME_MINS", 5)

	db.SetMaxOpenConns(maxOpenConns)
	db.SetMaxIdleConns(maxIdleConns)
	db.SetConnMaxLifetime(time.Duration(connMaxLifetimeMins) * time.Minute)

	if err = db.Ping(); err != nil {
		log.Fatalf("[Database] Failed to ping: %v", err)
	}

	DB = db
	log.Printf("[Database] Connected (maxOpen=%d, maxIdle=%d, maxLifetime=%dm)",
		maxOpenConns, maxIdleConns, connMaxLifetimeMins)
}

func getEnvInt(key string, defaultVal int) int {
	if val := os.Getenv(key); val != "" {
		if i, err := strconv.Atoi(val); err == nil {
			return i
		}
	}
	return defaultVal
}

// Close closes the database connection pool
func Close() error {
	if DB != nil {
		log.Println("[Database] Closing connection...")
		return DB.Close()
	}
	return nil
}

// Ping checks database connectivity
func Ping() error {
	if DB == nil {
		return fmt.Errorf("database not initialized")
	}
	return DB.Ping()
}
