package repositories

import (
	"context"
	"log"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

type mockDBPool struct{}

func (m *mockDBPool) Close() {
	log.Println("[MockDB] Close() (no-op)")
}

func (m *mockDBPool) QueryRow(ctx context.Context, sql string, args ...any) pgx.Row {
	log.Printf("[MockDB] QueryRow called: SQL=%q, args=%v\n", sql, args)
	if strings.Contains(strings.ToLower(sql), "insert into profiles") {
		return &mockInsertRow{}
	} else if strings.Contains(strings.ToLower(sql), "select user_id, username, rating, created_at") {
		return &mockSelectRow{}
	}
	return &mockFallbackRow{}
}

type mockInsertRow struct{}

func (mir *mockInsertRow) Scan(dest ...any) error {
	log.Println("[MockDB] mockInsertRow.Scan called")

	if len(dest) == 1 {
		if createdAtPtr, ok := dest[0].(*time.Time); ok {
			*createdAtPtr = time.Now()
		}
	}
	return nil
}

type mockSelectRow struct{}

func (msr *mockSelectRow) Scan(dest ...any) error {
	log.Println("[MockDB] mockSelectRow.Scan called")
	if len(dest) >= 4 {
		if userIDPtr, ok := dest[0].(*string); ok {
			*userIDPtr = "mock_user_id"
		}
		if usernamePtr, ok := dest[1].(*string); ok {
			*usernamePtr = "MockUsername"
		}
		if ratingPtr, ok := dest[2].(*int); ok {
			*ratingPtr = 9999
		}
		if createdAtPtr, ok := dest[3].(*time.Time); ok {
			*createdAtPtr = time.Date(2025, 1, 1, 12, 0, 0, 0, time.UTC)
		}
	}
	return nil
}

type mockFallbackRow struct{}

func (mfr *mockFallbackRow) Scan(dest ...any) error {
	log.Println("[MockDB] mockFallbackRow.Scan called - no data set")
	return nil
}

func NewMockDBPool() DBInterface {
	log.Println("[MockDB] Using mock DB pool (no real DB).")
	return &mockDBPool{}
}
