package repositories

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5"
)

type mockDBPool struct{}

func (m *mockDBPool) Close() {
	log.Println("mockDBPool.Close() called (no-op)")
}

func (m *mockDBPool) QueryRow(ctx context.Context, sql string, args ...any) pgx.Row {
	log.Printf("[MockDB] QueryRow called with SQL=%q, args=%v\n", sql, args)
	return &mockRow{}
}

type mockRow struct{}

func (mr *mockRow) Scan(dest ...any) error {
	return nil
}

func NewMockDBPool() DBInterface {
	log.Println("Using mock DB pool (no real connection).")
	return &mockDBPool{}
}
