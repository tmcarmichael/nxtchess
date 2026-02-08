package database

import (
	"context"
	"database/sql"
	"time"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/metrics"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/models"
)

// HasUsername checks if a user has set a username
func HasUsername(userID string) (bool, error) {
	defer metrics.ObserveQuery("HasUsername", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	var username sql.NullString
	err := DB.QueryRowContext(ctx, `SELECT username FROM profiles WHERE user_id = $1`, userID).Scan(&username)

	if err == sql.ErrNoRows {
		return false, nil
	} else if err != nil {
		logger.Error("Error checking username", logger.F("userID", userID, "error", err.Error()))
		return false, err
	}

	if !username.Valid || username.String == "" {
		return false, nil
	}
	return true, nil
}

// HasUsernameWithContext checks if a user has set a username using the provided context
func HasUsernameWithContext(ctx context.Context, userID string) (bool, error) {
	defer metrics.ObserveQuery("HasUsernameWithContext", time.Now())
	var username sql.NullString
	err := DB.QueryRowContext(ctx, `SELECT username FROM profiles WHERE user_id = $1`, userID).Scan(&username)

	if err == sql.ErrNoRows {
		return false, nil
	} else if err != nil {
		logger.Error("Error checking username", logger.F("userID", userID, "error", err.Error()))
		return false, err
	}

	if !username.Valid || username.String == "" {
		return false, nil
	}
	return true, nil
}

// GetUsernameByID retrieves a username by user ID
func GetUsernameByID(userID string) (string, error) {
	defer metrics.ObserveQuery("GetUsernameByID", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	var username sql.NullString
	err := DB.QueryRowContext(ctx, "SELECT username FROM profiles WHERE user_id = $1", userID).Scan(&username)
	if err == sql.ErrNoRows {
		return "", nil
	} else if err != nil {
		logger.Error("Error getting username", logger.F("userID", userID, "error", err.Error()))
		return "", err
	}

	if !username.Valid || username.String == "" {
		return "", nil
	}
	return username.String, nil
}

// GetUserProfileByUsername retrieves a user profile by username
func GetUserProfileByUsername(username string) (*models.Profile, error) {
	defer metrics.ObserveQuery("GetUserProfileByUsername", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	row := DB.QueryRowContext(ctx, `
        SELECT user_id, username, rating, puzzle_rating, COALESCE(profile_icon, 'white-pawn'), created_at
        FROM profiles
        WHERE username = $1
    `, username)

	u := &models.Profile{}
	err := row.Scan(&u.UserID, &u.Username, &u.Rating, &u.PuzzleRating, &u.ProfileIcon, &u.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	} else if err != nil {
		logger.Error("Error getting profile", logger.F("username", username, "error", err.Error()))
		return nil, err
	}
	return u, nil
}

// UsernameExists checks if a username is already taken
func UsernameExists(username string) (bool, error) {
	defer metrics.ObserveQuery("UsernameExists", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	var exists bool
	err := DB.QueryRowContext(ctx, `
        SELECT EXISTS (SELECT 1 FROM profiles WHERE username = $1)
    `, username).Scan(&exists)
	if err != nil {
		logger.Error("Error checking username exists", logger.F("username", username, "error", err.Error()))
	}
	return exists, err
}

// UpsertUsername creates or updates a user's username
func UpsertUsername(userID, newUsername string) error {
	defer metrics.ObserveQuery("UpsertUsername", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	_, err := DB.ExecContext(ctx, `
        INSERT INTO profiles (user_id, username)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE
        SET username = EXCLUDED.username
    `, userID, newUsername)
	if err != nil {
		logger.Error("Error upserting username", logger.F("userID", userID, "username", newUsername, "error", err.Error()))
	}
	return err
}

// UpsertUsernameWithRating creates or updates a user's username and sets their starting rating.
// It also inserts the first rating_history row as an origin point for the rating graph.
func UpsertUsernameWithRating(userID, newUsername string, rating int) error {
	defer metrics.ObserveQuery("UpsertUsernameWithRating", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	tx, err := DB.BeginTx(ctx, nil)
	if err != nil {
		logger.Error("Error starting transaction", logger.F("userID", userID, "error", err.Error()))
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx, `
		INSERT INTO profiles (user_id, username, rating)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id) DO UPDATE
		SET username = EXCLUDED.username, rating = EXCLUDED.rating
	`, userID, newUsername, rating)
	if err != nil {
		logger.Error("Error upserting username with rating", logger.F("userID", userID, "username", newUsername, "rating", rating, "error", err.Error()))
		return err
	}

	_, err = tx.ExecContext(ctx, `
		INSERT INTO rating_history (user_id, rating)
		VALUES ($1, $2)
	`, userID, rating)
	if err != nil {
		logger.Error("Error inserting initial rating history", logger.F("userID", userID, "rating", rating, "error", err.Error()))
		return err
	}

	if err = tx.Commit(); err != nil {
		logger.Error("Error committing transaction", logger.F("userID", userID, "error", err.Error()))
		return err
	}

	return nil
}

// CreateProfileWithContext creates a new user profile using the provided context
func CreateProfileWithContext(ctx context.Context, userID string) error {
	defer metrics.ObserveQuery("CreateProfileWithContext", time.Now())
	_, err := DB.ExecContext(ctx, `INSERT INTO profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING`, userID)
	if err != nil {
		logger.Error("Error creating profile", logger.F("userID", userID, "error", err.Error()))
	}
	return err
}

func GetRatingByID(userID string) (int, error) {
	defer metrics.ObserveQuery("GetRatingByID", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	var rating int
	err := DB.QueryRowContext(ctx, `SELECT rating FROM profiles WHERE user_id = $1`, userID).Scan(&rating)
	if err != nil {
		logger.Error("Error getting rating", logger.F("userID", userID, "error", err.Error()))
		return 0, err
	}
	return rating, nil
}

func GetPuzzleRatingByID(userID string) (int, error) {
	defer metrics.ObserveQuery("GetPuzzleRatingByID", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	var rating int
	err := DB.QueryRowContext(ctx, `SELECT puzzle_rating FROM profiles WHERE user_id = $1`, userID).Scan(&rating)
	if err != nil {
		logger.Error("Error getting puzzle rating", logger.F("userID", userID, "error", err.Error()))
		return 0, err
	}
	return rating, nil
}

// GetProfileIcon retrieves a user's profile icon by user ID
func GetProfileIcon(userID string) (string, error) {
	defer metrics.ObserveQuery("GetProfileIcon", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	var icon sql.NullString
	err := DB.QueryRowContext(ctx, `SELECT profile_icon FROM profiles WHERE user_id = $1`, userID).Scan(&icon)
	if err == sql.ErrNoRows {
		return "white-pawn", nil
	} else if err != nil {
		logger.Error("Error getting profile icon", logger.F("userID", userID, "error", err.Error()))
		return "", err
	}

	if !icon.Valid || icon.String == "" {
		return "white-pawn", nil
	}
	return icon.String, nil
}

// SetProfileIcon updates a user's profile icon
func SetProfileIcon(userID, icon string) error {
	defer metrics.ObserveQuery("SetProfileIcon", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	_, err := DB.ExecContext(ctx, `
        UPDATE profiles
        SET profile_icon = $2
        WHERE user_id = $1
    `, userID, icon)
	if err != nil {
		logger.Error("Error setting profile icon", logger.F("userID", userID, "icon", icon, "error", err.Error()))
	}
	return err
}

func GetProfileCreatedAt(userID string) (time.Time, error) {
	defer metrics.ObserveQuery("GetProfileCreatedAt", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	var createdAt time.Time
	err := DB.QueryRowContext(ctx, `SELECT created_at FROM profiles WHERE user_id = $1`, userID).Scan(&createdAt)
	if err == sql.ErrNoRows {
		return time.Time{}, nil
	}
	if err != nil {
		logger.Error("Error getting profile created_at", logger.F("userID", userID, "error", err.Error()))
		return time.Time{}, err
	}
	return createdAt, nil
}

func GetGameStatsByUserID(userID string) (gamesPlayed, wins, losses, draws int, err error) {
	defer metrics.ObserveQuery("GetGameStatsByUserID", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	err = DB.QueryRowContext(ctx, `
		SELECT
			COUNT(*),
			COUNT(*) FILTER (WHERE
				(playerW_id = $1 AND result = '1-0') OR
				(playerB_id = $1 AND result = '0-1')
			),
			COUNT(*) FILTER (WHERE
				(playerW_id = $1 AND result = '0-1') OR
				(playerB_id = $1 AND result = '1-0')
			),
			COUNT(*) FILTER (WHERE result = '1/2-1/2')
		FROM games
		WHERE (playerW_id = $1 OR playerB_id = $1)
			AND result IS NOT NULL
			AND result != '*'
	`, userID).Scan(&gamesPlayed, &wins, &losses, &draws)
	if err != nil {
		logger.Error("Error getting game stats", logger.F("userID", userID, "error", err.Error()))
		return 0, 0, 0, 0, err
	}
	return gamesPlayed, wins, losses, draws, nil
}

func GetRatingHistoryByUsername(username string) ([]models.RatingPoint, []models.RatingPoint, error) {
	defer metrics.ObserveQuery("GetRatingHistoryByUsername", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	gameRows, err := DB.QueryContext(ctx, `
		SELECT rating, created_at FROM rating_history
		WHERE user_id = (SELECT user_id FROM profiles WHERE username = $1)
		ORDER BY created_at ASC
		LIMIT 100
	`, username)
	if err != nil {
		logger.Error("Error getting game rating history", logger.F("username", username, "error", err.Error()))
		return nil, nil, err
	}
	defer gameRows.Close()

	var gameHistory []models.RatingPoint
	for gameRows.Next() {
		var p models.RatingPoint
		if err := gameRows.Scan(&p.Rating, &p.CreatedAt); err != nil {
			logger.Error("Error scanning game rating point", logger.F("error", err.Error()))
			return nil, nil, err
		}
		gameHistory = append(gameHistory, p)
	}
	if err := gameRows.Err(); err != nil {
		logger.Error("Error iterating game rating rows", logger.F("error", err.Error()))
		return nil, nil, err
	}

	puzzleRows, err := DB.QueryContext(ctx, `
		SELECT rating, created_at FROM puzzle_rating_history
		WHERE user_id = (SELECT user_id FROM profiles WHERE username = $1)
		ORDER BY created_at ASC
		LIMIT 100
	`, username)
	if err != nil {
		logger.Error("Error getting puzzle rating history", logger.F("username", username, "error", err.Error()))
		return nil, nil, err
	}
	defer puzzleRows.Close()

	var puzzleHistory []models.RatingPoint
	for puzzleRows.Next() {
		var p models.RatingPoint
		if err := puzzleRows.Scan(&p.Rating, &p.CreatedAt); err != nil {
			logger.Error("Error scanning puzzle rating point", logger.F("error", err.Error()))
			return nil, nil, err
		}
		puzzleHistory = append(puzzleHistory, p)
	}
	if err := puzzleRows.Err(); err != nil {
		logger.Error("Error iterating puzzle rating rows", logger.F("error", err.Error()))
		return nil, nil, err
	}

	return gameHistory, puzzleHistory, nil
}

func GetRecentGamesByUsername(username string) ([]models.RecentGame, error) {
	defer metrics.ObserveQuery("GetRecentGamesByUsername", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	rows, err := DB.QueryContext(ctx, `
		WITH target AS (
			SELECT user_id FROM profiles WHERE username = $1
		)
		SELECT
			g.game_id,
			g.created_at,
			CASE
				WHEN g.playerW_id = t.user_id THEN 'white'
				ELSE 'black'
			END,
			CASE
				WHEN g.playerW_id = t.user_id THEN COALESCE(opp_b.username, 'Unknown')
				ELSE COALESCE(opp_w.username, 'Unknown')
			END,
			CASE
				WHEN (g.playerW_id = t.user_id AND g.result = '1-0')
					OR (g.playerB_id = t.user_id AND g.result = '0-1') THEN 'win'
				WHEN g.result = '1/2-1/2' THEN 'draw'
				ELSE 'loss'
			END
		FROM games g
		CROSS JOIN target t
		LEFT JOIN profiles opp_b ON g.playerB_id = opp_b.user_id
		LEFT JOIN profiles opp_w ON g.playerW_id = opp_w.user_id
		WHERE (g.playerW_id = t.user_id OR g.playerB_id = t.user_id)
			AND g.result IS NOT NULL
			AND g.result != '*'
		ORDER BY g.created_at DESC
		LIMIT 10
	`, username)
	if err != nil {
		logger.Error("Error getting recent games", logger.F("username", username, "error", err.Error()))
		return nil, err
	}
	defer rows.Close()

	var games []models.RecentGame
	for rows.Next() {
		var g models.RecentGame
		if err := rows.Scan(&g.GameID, &g.CreatedAt, &g.PlayerColor, &g.Opponent, &g.Result); err != nil {
			logger.Error("Error scanning recent game", logger.F("error", err.Error()))
			return nil, err
		}
		games = append(games, g)
	}
	if err := rows.Err(); err != nil {
		logger.Error("Error iterating recent game rows", logger.F("error", err.Error()))
		return nil, err
	}

	return games, nil
}