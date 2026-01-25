package database

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/lib/pq"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/models"
)

// GetRandomEndgamePosition retrieves a random endgame position matching the given criteria
func GetRandomEndgamePosition(params models.EndgameQueryParams) (*models.EndgamePosition, error) {
	ctx, cancel := QueryContext()
	defer cancel()

	// Build dynamic query with filters
	query := `
		SELECT position_id, fen, COALESCE(moves, ''), rating, themes,
		       initial_eval, COALESCE(description, ''), COALESCE(source, ''), created_at
		FROM endgame_positions
		WHERE 1=1
	`
	args := []interface{}{}
	argIndex := 1

	// Rating range filter
	if params.MinRating > 0 {
		query += fmt.Sprintf(" AND rating >= $%d", argIndex)
		args = append(args, params.MinRating)
		argIndex++
	}
	if params.MaxRating > 0 {
		query += fmt.Sprintf(" AND rating <= $%d", argIndex)
		args = append(args, params.MaxRating)
		argIndex++
	}

	// Theme filter (array contains)
	if params.Theme != "" {
		query += fmt.Sprintf(" AND $%d = ANY(themes)", argIndex)
		args = append(args, params.Theme)
		argIndex++
	}

	// Side to move filter (extract from FEN)
	if params.Side == "w" || params.Side == "b" {
		// FEN format: position turn castling en-passant halfmove fullmove
		// Check if the second field is 'w' or 'b'
		query += fmt.Sprintf(" AND split_part(fen, ' ', 2) = $%d", argIndex)
		args = append(args, params.Side)
		argIndex++
	}

	// Exclude specific position (to avoid repeats on restart)
	if params.ExcludePositionID != "" {
		query += fmt.Sprintf(" AND position_id != $%d", argIndex)
		args = append(args, params.ExcludePositionID)
		argIndex++
	}

	// Filter out positions where opponent has only king (no pieces/pawns)
	// If side='w', opponent is black - check for lowercase pieces (qrbnp)
	// If side='b', opponent is white - check for uppercase pieces (QRBNP)
	if params.RequireOpponentMaterial {
		query += ` AND (
			(split_part(fen, ' ', 2) = 'w' AND split_part(fen, ' ', 1) ~ '[qrbnp]')
			OR
			(split_part(fen, ' ', 2) = 'b' AND split_part(fen, ' ', 1) ~ '[QRBNP]')
		)`
	}

	// Order by random and limit to 1
	query += " ORDER BY RANDOM() LIMIT 1"

	row := DB.QueryRowContext(ctx, query, args...)

	pos := &models.EndgamePosition{}
	var initialEval sql.NullInt32
	var themes pq.StringArray

	err := row.Scan(
		&pos.PositionID,
		&pos.FEN,
		&pos.Moves,
		&pos.Rating,
		&themes,
		&initialEval,
		&pos.Description,
		&pos.Source,
		&pos.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		logger.Error("Error getting random endgame position",
			logger.F("minRating", params.MinRating, "maxRating", params.MaxRating,
				"theme", params.Theme, "error", err.Error()))
		return nil, err
	}

	pos.Themes = []string(themes)
	if initialEval.Valid {
		eval := int(initialEval.Int32)
		pos.InitialEval = &eval
	}

	return pos, nil
}

// GetEndgamePositionCount returns the count of positions matching the criteria
func GetEndgamePositionCount(params models.EndgameQueryParams) (int, error) {
	ctx, cancel := QueryContext()
	defer cancel()

	query := `SELECT COUNT(*) FROM endgame_positions WHERE 1=1`
	args := []interface{}{}
	argIndex := 1

	if params.MinRating > 0 {
		query += fmt.Sprintf(" AND rating >= $%d", argIndex)
		args = append(args, params.MinRating)
		argIndex++
	}
	if params.MaxRating > 0 {
		query += fmt.Sprintf(" AND rating <= $%d", argIndex)
		args = append(args, params.MaxRating)
		argIndex++
	}
	if params.Theme != "" {
		query += fmt.Sprintf(" AND $%d = ANY(themes)", argIndex)
		args = append(args, params.Theme)
		argIndex++
	}
	if params.Side == "w" || params.Side == "b" {
		query += fmt.Sprintf(" AND split_part(fen, ' ', 2) = $%d", argIndex)
		args = append(args, params.Side)
		argIndex++
	}
	if params.RequireOpponentMaterial {
		query += ` AND (
			(split_part(fen, ' ', 2) = 'w' AND split_part(fen, ' ', 1) ~ '[qrbnp]')
			OR
			(split_part(fen, ' ', 2) = 'b' AND split_part(fen, ' ', 1) ~ '[QRBNP]')
		)`
	}

	var count int
	err := DB.QueryRowContext(ctx, query, args...).Scan(&count)
	if err != nil {
		logger.Error("Error counting endgame positions", logger.F("error", err.Error()))
		return 0, err
	}

	return count, nil
}

// BulkInsertEndgamePositions inserts multiple positions efficiently
// Used by import/seed scripts
func BulkInsertEndgamePositions(positions []models.EndgamePosition) error {
	if len(positions) == 0 {
		return nil
	}

	ctx, cancel := QueryContextWithTimeout(30 * 1000 * 1000 * 1000) // 30 seconds for bulk
	defer cancel()

	// Build bulk insert query
	valueStrings := make([]string, 0, len(positions))
	valueArgs := make([]interface{}, 0, len(positions)*8)

	for i, pos := range positions {
		base := i * 8
		valueStrings = append(valueStrings, fmt.Sprintf(
			"($%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d)",
			base+1, base+2, base+3, base+4, base+5, base+6, base+7, base+8,
		))
		valueArgs = append(valueArgs,
			pos.PositionID,
			pos.FEN,
			pos.Moves,
			pos.Rating,
			pq.Array(pos.Themes),
			pos.InitialEval,
			pos.Description,
			pos.Source,
		)
	}

	query := fmt.Sprintf(`
		INSERT INTO endgame_positions
			(position_id, fen, moves, rating, themes, initial_eval, description, source)
		VALUES %s
		ON CONFLICT (position_id) DO UPDATE SET
			fen = EXCLUDED.fen,
			moves = EXCLUDED.moves,
			rating = EXCLUDED.rating,
			themes = EXCLUDED.themes,
			initial_eval = EXCLUDED.initial_eval,
			description = EXCLUDED.description,
			source = EXCLUDED.source
	`, strings.Join(valueStrings, ","))

	_, err := DB.ExecContext(ctx, query, valueArgs...)
	if err != nil {
		logger.Error("Error bulk inserting endgame positions",
			logger.F("count", len(positions), "error", err.Error()))
		return err
	}

	return nil
}

// GetAvailableEndgameThemes returns the list of distinct themes in the database
func GetAvailableEndgameThemes() ([]string, error) {
	ctx, cancel := QueryContext()
	defer cancel()

	query := `
		SELECT DISTINCT unnest(themes) as theme
		FROM endgame_positions
		ORDER BY theme
	`

	rows, err := DB.QueryContext(ctx, query)
	if err != nil {
		logger.Error("Error getting available endgame themes", logger.F("error", err.Error()))
		return nil, err
	}
	defer rows.Close()

	themes := []string{}
	for rows.Next() {
		var theme string
		if err := rows.Scan(&theme); err != nil {
			return nil, err
		}
		themes = append(themes, theme)
	}

	return themes, rows.Err()
}
