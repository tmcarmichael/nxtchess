package repositories

import (
	"context"

	"github.com/jackc/pgx/v5"
)

type DBInterface interface {
	Close()
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
}
