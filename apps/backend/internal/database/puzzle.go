package database

import (
	"database/sql"
	"time"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/metrics"
)

func GetLastPuzzleSubmissionTime(userID string) (time.Time, error) {
	defer metrics.ObserveQuery("GetLastPuzzleSubmissionTime", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	var lastTime time.Time
	err := DB.QueryRowContext(ctx,
		`SELECT created_at FROM puzzle_rating_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`, userID,
	).Scan(&lastTime)
	if err == sql.ErrNoRows {
		return time.Time{}, nil
	}
	if err != nil {
		logger.Error("Error getting last puzzle submission time", logger.F("userID", userID, "error", err.Error()))
		return time.Time{}, err
	}
	return lastTime, nil
}

func GetPuzzleRatingInfo(userID string) (puzzleRating int, gamesPlayed int, err error) {
	defer metrics.ObserveQuery("GetPuzzleRatingInfo", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	err = DB.QueryRowContext(ctx,
		`SELECT puzzle_rating FROM profiles WHERE user_id = $1`, userID,
	).Scan(&puzzleRating)
	if err != nil {
		logger.Error("Error fetching puzzle rating", logger.F("userID", userID, "error", err.Error()))
		return 0, 0, err
	}

	err = DB.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM puzzle_rating_history WHERE user_id = $1`, userID,
	).Scan(&gamesPlayed)
	if err != nil {
		logger.Error("Error counting puzzle games", logger.F("userID", userID, "error", err.Error()))
		return 0, 0, err
	}

	return puzzleRating, gamesPlayed, nil
}

func FinalizePuzzleResult(userID string, oldRating, newRating int) error {
	defer metrics.ObserveQuery("FinalizePuzzleResult", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	tx, err := DB.BeginTx(ctx, nil)
	if err != nil {
		logger.Error("Error starting puzzle finalize transaction", logger.F("error", err.Error()))
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx, `UPDATE profiles SET puzzle_rating = $1 WHERE user_id = $2`, newRating, userID)
	if err != nil {
		logger.Error("Error updating puzzle rating", logger.F("error", err.Error()))
		return err
	}

	_, err = tx.ExecContext(ctx, `INSERT INTO puzzle_rating_history (user_id, rating) VALUES ($1, $2)`, userID, newRating)
	if err != nil {
		logger.Error("Error inserting puzzle rating history", logger.F("error", err.Error()))
		return err
	}

	if err = tx.Commit(); err != nil {
		logger.Error("Error committing puzzle finalize transaction", logger.F("error", err.Error()))
		return err
	}

	return nil
}
