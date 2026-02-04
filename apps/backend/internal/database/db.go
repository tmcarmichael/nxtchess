package database

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"strconv"
	"time"

	_ "github.com/lib/pq"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
)

// DefaultQueryTimeout is the default timeout for database queries
const DefaultQueryTimeout = 5 * time.Second

var DB *sql.DB

// QueryContext returns a context with the default query timeout
func QueryContext() (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), DefaultQueryTimeout)
}

// QueryContextWithTimeout returns a context with a custom timeout
func QueryContextWithTimeout(timeout time.Duration) (context.Context, context.CancelFunc) {
	return context.WithTimeout(context.Background(), timeout)
}

func InitPostgres() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		logger.Error("DATABASE_URL environment variable is required")
		os.Exit(1)
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		logger.Error("Failed to open database", logger.F("error", err.Error()))
		os.Exit(1)
	}

	// Connection pool configuration
	maxOpenConns := getEnvInt("DB_MAX_OPEN_CONNS", 25)
	maxIdleConns := getEnvInt("DB_MAX_IDLE_CONNS", 5)
	connMaxLifetimeMins := getEnvInt("DB_CONN_MAX_LIFETIME_MINS", 5)

	db.SetMaxOpenConns(maxOpenConns)
	db.SetMaxIdleConns(maxIdleConns)
	db.SetConnMaxLifetime(time.Duration(connMaxLifetimeMins) * time.Minute)

	if err = db.Ping(); err != nil {
		logger.Error("Failed to ping database", logger.F("error", err.Error()))
		os.Exit(1)
	}

	DB = db
	logger.Info("Database connected", logger.F("maxOpen", maxOpenConns, "maxIdle", maxIdleConns, "maxLifetimeMins", connMaxLifetimeMins))
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
		logger.Info("Closing database connection")
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
