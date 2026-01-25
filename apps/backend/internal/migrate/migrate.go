package migrate

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
)

// Run executes all pending database migrations.
// It uses the migrations from the specified directory.
// Returns nil if migrations succeed or no migrations are pending.
func Run(db *sql.DB, migrationsPath string) error {
	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return fmt.Errorf("failed to create postgres driver: %w", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		fmt.Sprintf("file://%s", migrationsPath),
		"postgres",
		driver,
	)
	if err != nil {
		return fmt.Errorf("failed to create migrate instance: %w", err)
	}

	// Get current version for logging
	version, dirty, _ := m.Version()
	logger.Info("Migration status", logger.F("currentVersion", version, "dirty", dirty))

	if dirty {
		return errors.New("database is in dirty state - manual intervention required")
	}

	// Run all pending migrations
	err = m.Up()
	if err != nil {
		if errors.Is(err, migrate.ErrNoChange) {
			logger.Info("No pending migrations")
			return nil
		}
		return fmt.Errorf("migration failed: %w", err)
	}

	// Get new version after migration
	newVersion, _, _ := m.Version()
	logger.Info("Migrations complete", logger.F("newVersion", newVersion))

	return nil
}
