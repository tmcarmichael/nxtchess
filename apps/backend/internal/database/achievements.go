package database

import (
	"database/sql"
	"time"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/metrics"
)

type UserAchievement struct {
	AchievementID string    `json:"achievement_id"`
	UnlockedAt    time.Time `json:"unlocked_at"`
}

func GetUserAchievementIDs(userID string) (map[string]bool, error) {
	defer metrics.ObserveQuery("GetUserAchievementIDs", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	rows, err := DB.QueryContext(ctx,
		`SELECT achievement_id FROM user_achievements WHERE user_id = $1`, userID,
	)
	if err != nil {
		logger.Error("Error getting user achievement IDs", logger.F("userID", userID, "error", err.Error()))
		return nil, err
	}
	defer rows.Close()

	result := make(map[string]bool)
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		result[id] = true
	}
	return result, rows.Err()
}

func GetUserAchievements(userID string) ([]UserAchievement, error) {
	defer metrics.ObserveQuery("GetUserAchievements", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	rows, err := DB.QueryContext(ctx,
		`SELECT achievement_id, unlocked_at FROM user_achievements WHERE user_id = $1 ORDER BY unlocked_at DESC`, userID,
	)
	if err != nil {
		logger.Error("Error getting user achievements", logger.F("userID", userID, "error", err.Error()))
		return nil, err
	}
	defer rows.Close()

	var result []UserAchievement
	for rows.Next() {
		var a UserAchievement
		if err := rows.Scan(&a.AchievementID, &a.UnlockedAt); err != nil {
			return nil, err
		}
		result = append(result, a)
	}
	return result, rows.Err()
}

func GetUserAchievementsByUsername(username string) ([]UserAchievement, int, error) {
	defer metrics.ObserveQuery("GetUserAchievementsByUsername", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	rows, err := DB.QueryContext(ctx,
		`SELECT ua.achievement_id, ua.unlocked_at
		 FROM user_achievements ua
		 JOIN profiles p ON p.user_id = ua.user_id
		 WHERE p.username = $1
		 ORDER BY ua.unlocked_at DESC`, username,
	)
	if err != nil {
		logger.Error("Error getting user achievements by username", logger.F("username", username, "error", err.Error()))
		return nil, 0, err
	}
	defer rows.Close()

	var result []UserAchievement
	for rows.Next() {
		var a UserAchievement
		if err := rows.Scan(&a.AchievementID, &a.UnlockedAt); err != nil {
			return nil, 0, err
		}
		result = append(result, a)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	var points int
	err = DB.QueryRowContext(ctx,
		`SELECT COALESCE(achievement_points, 0) FROM profiles WHERE username = $1`, username,
	).Scan(&points)
	if err != nil {
		return result, 0, err
	}

	return result, points, nil
}

func GrantAchievement(userID, achievementID string, points int) (bool, error) {
	defer metrics.ObserveQuery("GrantAchievement", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	tx, err := DB.BeginTx(ctx, nil)
	if err != nil {
		return false, err
	}
	defer tx.Rollback()

	var insertedID int
	err = tx.QueryRowContext(ctx,
		`INSERT INTO user_achievements (user_id, achievement_id)
		 VALUES ($1, $2)
		 ON CONFLICT (user_id, achievement_id) DO NOTHING
		 RETURNING id`, userID, achievementID,
	).Scan(&insertedID)

	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		logger.Error("Error granting achievement", logger.F("userID", userID, "achievementID", achievementID, "error", err.Error()))
		return false, err
	}

	_, err = tx.ExecContext(ctx,
		`UPDATE profiles SET achievement_points = achievement_points + $1 WHERE user_id = $2`,
		points, userID,
	)
	if err != nil {
		logger.Error("Error updating achievement points", logger.F("userID", userID, "error", err.Error()))
		return false, err
	}

	if err = tx.Commit(); err != nil {
		return false, err
	}

	return true, nil
}

func UpdateWinStreak(userID string, won bool) (int, error) {
	defer metrics.ObserveQuery("UpdateWinStreak", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	var newStreak int
	if won {
		err := DB.QueryRowContext(ctx,
			`UPDATE profiles SET win_streak = win_streak + 1 WHERE user_id = $1 RETURNING win_streak`,
			userID,
		).Scan(&newStreak)
		if err != nil {
			logger.Error("Error incrementing win streak", logger.F("userID", userID, "error", err.Error()))
			return 0, err
		}
	} else {
		_, err := DB.ExecContext(ctx,
			`UPDATE profiles SET win_streak = 0 WHERE user_id = $1`, userID,
		)
		if err != nil {
			logger.Error("Error resetting win streak", logger.F("userID", userID, "error", err.Error()))
			return 0, err
		}
		newStreak = 0
	}
	return newStreak, nil
}

func UpdatePuzzleStreak(userID string, solved bool) (int, error) {
	defer metrics.ObserveQuery("UpdatePuzzleStreak", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	var newStreak int
	if solved {
		err := DB.QueryRowContext(ctx,
			`UPDATE profiles SET puzzle_streak = puzzle_streak + 1 WHERE user_id = $1 RETURNING puzzle_streak`,
			userID,
		).Scan(&newStreak)
		if err != nil {
			logger.Error("Error incrementing puzzle streak", logger.F("userID", userID, "error", err.Error()))
			return 0, err
		}
	} else {
		_, err := DB.ExecContext(ctx,
			`UPDATE profiles SET puzzle_streak = 0 WHERE user_id = $1`, userID,
		)
		if err != nil {
			logger.Error("Error resetting puzzle streak", logger.F("userID", userID, "error", err.Error()))
			return 0, err
		}
		newStreak = 0
	}
	return newStreak, nil
}

func GetGamesPlayedCount(userID string) (int, error) {
	defer metrics.ObserveQuery("GetGamesPlayedCount", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	var count int
	err := DB.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM games WHERE "playerW_id" = $1 OR "playerB_id" = $1`, userID,
	).Scan(&count)
	if err != nil {
		logger.Error("Error counting games played", logger.F("userID", userID, "error", err.Error()))
		return 0, err
	}
	return count, nil
}

func GetPuzzlesSolvedCount(userID string) (int, error) {
	defer metrics.ObserveQuery("GetPuzzlesSolvedCount", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	var count int
	err := DB.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM puzzle_rating_history WHERE user_id = $1`, userID,
	).Scan(&count)
	if err != nil {
		logger.Error("Error counting puzzles solved", logger.F("userID", userID, "error", err.Error()))
		return 0, err
	}
	return count, nil
}

func GetAchievementPoints(userID string) (int, error) {
	defer metrics.ObserveQuery("GetAchievementPoints", time.Now())
	ctx, cancel := QueryContext()
	defer cancel()

	var points int
	err := DB.QueryRowContext(ctx,
		`SELECT COALESCE(achievement_points, 0) FROM profiles WHERE user_id = $1`, userID,
	).Scan(&points)
	if err != nil {
		logger.Error("Error getting achievement points", logger.F("userID", userID, "error", err.Error()))
		return 0, err
	}
	return points, nil
}
