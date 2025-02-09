package repositories

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type dbPoolAdapter struct {
	pool *pgxpool.Pool
}

func (d *dbPoolAdapter) Close() {
	d.pool.Close()
}

func (d *dbPoolAdapter) QueryRow(ctx context.Context, sql string, args ...any) pgx.Row {
	return d.pool.QueryRow(ctx, sql, args...)
}

func NewDBPool(dsn string) DBInterface {
	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	return &dbPoolAdapter{pool: pool}
}
