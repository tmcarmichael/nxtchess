package database

import (
	"time"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/metrics"
)

func GetPlayerRatingInfo(userID string) (rating int, gamesPlayed int, err error) {
	defer metrics.ObserveQuery("GetPlayerRatingInfo", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	err = DB.QueryRowContext(ctx,
		`SELECT rating FROM profiles WHERE user_id = $1`, userID,
	).Scan(&rating)
	if err != nil {
		logger.Error("Error fetching player rating", logger.F("userID", userID, "error", err.Error()))
		return 0, 0, err
	}

	err = DB.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM games WHERE playerW_id = $1 OR playerB_id = $1`, userID,
	).Scan(&gamesPlayed)
	if err != nil {
		logger.Error("Error counting player games", logger.F("userID", userID, "error", err.Error()))
		return 0, 0, err
	}

	return rating, gamesPlayed, nil
}

func FinalizeGameResult(whiteUID, blackUID, pgn, resultPGN string, whiteOld, blackOld, whiteNew, blackNew int) error {
	defer metrics.ObserveQuery("FinalizeGameResult", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	tx, err := DB.BeginTx(ctx, nil)
	if err != nil {
		logger.Error("Error starting finalize transaction", logger.F("error", err.Error()))
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx, `
		INSERT INTO games (pgn, playerW_id, playerB_id, playerW_start_rating, playerB_start_rating, result)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, pgn, whiteUID, blackUID, whiteOld, blackOld, resultPGN)
	if err != nil {
		logger.Error("Error inserting game", logger.F("error", err.Error()))
		return err
	}

	_, err = tx.ExecContext(ctx, `UPDATE profiles SET rating = $1 WHERE user_id = $2`, whiteNew, whiteUID)
	if err != nil {
		logger.Error("Error updating white rating", logger.F("error", err.Error()))
		return err
	}

	_, err = tx.ExecContext(ctx, `UPDATE profiles SET rating = $1 WHERE user_id = $2`, blackNew, blackUID)
	if err != nil {
		logger.Error("Error updating black rating", logger.F("error", err.Error()))
		return err
	}

	_, err = tx.ExecContext(ctx, `INSERT INTO rating_history (user_id, rating) VALUES ($1, $2)`, whiteUID, whiteNew)
	if err != nil {
		logger.Error("Error inserting white rating history", logger.F("error", err.Error()))
		return err
	}

	_, err = tx.ExecContext(ctx, `INSERT INTO rating_history (user_id, rating) VALUES ($1, $2)`, blackUID, blackNew)
	if err != nil {
		logger.Error("Error inserting black rating history", logger.F("error", err.Error()))
		return err
	}

	if err = tx.Commit(); err != nil {
		logger.Error("Error committing finalize transaction", logger.F("error", err.Error()))
		return err
	}

	return nil
}
