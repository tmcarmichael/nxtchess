package database

import (
	"database/sql"
	"log"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/models"
)

func HasUsername(userID string) (bool, error) {
	var username sql.NullString
	err := DB.QueryRow(`SELECT username FROM profiles WHERE user_id = $1`, userID).Scan(&username)

	if err == sql.ErrNoRows {
		return false, nil
	} else if err != nil {
		log.Printf("[Database] Error checking username: %v", err)
		return false, err
	}

	if !username.Valid || username.String == "" {
		return false, nil
	}
	return true, nil
}

func GetUsernameByID(userID string) (string, error) {
	var username sql.NullString
	err := DB.QueryRow("SELECT username FROM profiles WHERE user_id = $1", userID).Scan(&username)
	if err == sql.ErrNoRows {
		return "", nil
	} else if err != nil {
		log.Printf("[Database] Error getting username: %v", err)
		return "", err
	}

	if !username.Valid || username.String == "" {
		return "", nil
	}
	return username.String, nil
}

func GetUserProfileByUsername(username string) (*models.Profile, error) {
	row := DB.QueryRow(`
        SELECT user_id, username, rating
        FROM profiles
        WHERE username = $1
    `, username)

	u := &models.Profile{}
	err := row.Scan(&u.UserID, &u.Username, &u.Rating)
	if err == sql.ErrNoRows {
		return nil, nil
	} else if err != nil {
		return nil, err
	}
	return u, nil
}

func UsernameExists(username string) (bool, error) {
	var exists bool
	err := DB.QueryRow(`
        SELECT EXISTS (SELECT 1 FROM profiles WHERE username = $1)
    `, username).Scan(&exists)
	return exists, err
}

func UpsertUsername(userID, newUsername string) error {
	_, err := DB.Exec(`
        INSERT INTO profiles (user_id, username)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE
        SET username = EXCLUDED.username
    `, userID, newUsername)
	return err
}