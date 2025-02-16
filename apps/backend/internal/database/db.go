package database

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitPostgres() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgres://postgres:postgres@db:5432/chess_db?sslmode=disable"
		log.Println("[InitPostgres] Using default DSN:", dsn)
	} else {
		log.Println("[InitPostgres] Using DATABASE_URL from environment:", dsn)
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to open DB: %v", err)
	}

	if err = db.Ping(); err != nil {
	    log.Fatalf("Failed to ping DB: %v", err)
	}

	DB = db
	log.Println("[InitPostgres] Connected to Postgres successfully.")
}
