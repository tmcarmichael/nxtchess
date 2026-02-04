package database

import (
	"database/sql"
	"time"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/metrics"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/models"
)

// @TEST/DEBUG
func CreateGame(g *models.Game) error {
    defer metrics.ObserveQuery("CreateGame", time.Now())
    err := DB.QueryRow(`
        INSERT INTO games (pgn, playerW_id, playerB_id, stockfish_difficulty,
                           playerW_start_rating, playerB_start_rating)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING game_id, created_at
    `,
        g.PGN,
        g.PlayerWID,
        g.PlayerBID,
        g.StockfishDifficulty,
        g.PlayerWStartRating,
        g.PlayerBStartRating,
    ).Scan(&g.GameID, &g.CreatedAt)
    return err
}

// @TEST/DEBUG
func GetGameByID(id string) (*models.Game, error) {
    defer metrics.ObserveQuery("GetGameByID", time.Now())
    row := DB.QueryRow(`
        SELECT game_id, pgn, playerW_id, playerB_id, stockfish_difficulty,
               playerW_start_rating, playerB_start_rating, created_at
        FROM games
        WHERE game_id = $1
    `, id)

    var game models.Game
    var stockfishDifficulty sql.NullInt32

    err := row.Scan(
        &game.GameID,
        &game.PGN,
        &game.PlayerWID,
        &game.PlayerBID,
        &stockfishDifficulty,
        &game.PlayerWStartRating,
        &game.PlayerBStartRating,
        &game.CreatedAt,
    )
    if err == sql.ErrNoRows {
        return nil, nil
    } else if err != nil {
        return nil, err
    }

    if stockfishDifficulty.Valid {
        diff := int(stockfishDifficulty.Int32)
        game.StockfishDifficulty = &diff
    }

    return &game, nil
}
