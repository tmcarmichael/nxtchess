package database

import (
	"context"
	"database/sql"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/models"
)

// HasUsername checks if a user has set a username
func HasUsername(userID string) (bool, error) {
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
	ctx, cancel := QueryContext()
	defer cancel()

	row := DB.QueryRowContext(ctx, `
        SELECT user_id, username, rating
        FROM profiles
        WHERE username = $1
    `, username)

	u := &models.Profile{}
	err := row.Scan(&u.UserID, &u.Username, &u.Rating)
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

// CreateProfileWithContext creates a new user profile using the provided context
func CreateProfileWithContext(ctx context.Context, userID string) error {
	_, err := DB.ExecContext(ctx, `INSERT INTO profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING`, userID)
	if err != nil {
		logger.Error("Error creating profile", logger.F("userID", userID, "error", err.Error()))
	}
	return err
}