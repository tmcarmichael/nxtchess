package achievements

import (
	"time"

	"github.com/notnil/chess"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/database"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
)

type GameContext struct {
	InnerGame   *chess.Game
	Result      string
	Reason      string
	PlayerColor string
	MoveCount   int
	NewRating   int
	Won         bool
	Drew        bool
}

type PuzzleContext struct {
	Solved    bool
	NewRating int
}

func CheckGameAchievements(userID string, ctx GameContext) []AchievementUnlock {
	existing, err := database.GetUserAchievementIDs(userID)
	if err != nil {
		logger.Error("Failed to get existing achievements", logger.F("userID", userID, "error", err.Error()))
		return nil
	}

	var unlocked []AchievementUnlock

	grant := func(id string) {
		if existing[id] {
			return
		}
		a, ok := All[id]
		if !ok {
			return
		}
		granted, err := database.GrantAchievement(userID, id, a.Points)
		if err != nil {
			logger.Error("Failed to grant achievement", logger.F("userID", userID, "achievementID", id, "error", err.Error()))
			return
		}
		if granted {
			unlocked = append(unlocked, ToUnlock(a))
			existing[id] = true
		}
	}

	if ctx.Won {
		winStreak, err := database.UpdateWinStreak(userID, true)
		if err != nil {
			logger.Error("Failed to update win streak", logger.F("userID", userID, "error", err.Error()))
		} else {
			if winStreak >= 3 {
				grant("win_streak_3")
			}
			if winStreak >= 5 {
				grant("win_streak_5")
			}
			if winStreak >= 10 {
				grant("win_streak_10")
			}
			if winStreak >= 20 {
				grant("win_streak_20")
			}
		}
	} else {
		database.UpdateWinStreak(userID, false)
	}

	ratingThresholds := []struct {
		threshold int
		id        string
	}{
		{1600, "rating_1600"},
		{1800, "rating_1800"},
		{2000, "rating_2000"},
		{2200, "rating_2200"},
		{2400, "rating_2400"},
		{2600, "rating_2600"},
		{2800, "rating_2800"},
		{3000, "rating_3000"},
	}
	for _, rt := range ratingThresholds {
		if ctx.NewRating >= rt.threshold {
			grant(rt.id)
		}
	}

	if ctx.Won {
		grant("first_win")
	}

	if ctx.InnerGame != nil {
		flags := AnalyzeGame(ctx.InnerGame, ctx.PlayerColor)

		if flags.HasEnPassant {
			grant("en_passant")
		}
		if flags.HasPromotion {
			grant("promotion")
		}
		if flags.HasUnderpromotion {
			grant("underpromotion")
		}
		if ctx.Won && flags.IsBackRankMate {
			grant("back_rank_mate")
		}
		if ctx.Won && flags.IsScholarsMate {
			grant("scholars_mate")
		}
		if flags.MoveCount >= 200 {
			grant("marathon_game")
		}
	}

	if ctx.Reason == "stalemate" && ctx.InnerGame != nil {
		stalematedColor := ctx.InnerGame.Position().Turn()
		playerIsWhite := ctx.PlayerColor == "white"
		playerWasStalemated := (playerIsWhite && stalematedColor == chess.White) ||
			(!playerIsWhite && stalematedColor == chess.Black)
		if playerWasStalemated {
			grant("stalemate_receive")
		} else {
			grant("stalemate_deliver")
		}
	}

	if ctx.Won && ctx.Reason == "timeout" {
		grant("win_on_time")
	}

	gamesPlayed, err := database.GetGamesPlayedCount(userID)
	if err == nil {
		if gamesPlayed >= 10 {
			grant("games_10")
		}
		if gamesPlayed >= 50 {
			grant("games_50")
		}
		if gamesPlayed >= 100 {
			grant("games_100")
		}
		if gamesPlayed >= 500 {
			grant("games_500")
		}
		if gamesPlayed >= 1000 {
			grant("games_1000")
		}
	}

	return unlocked
}

func CheckPuzzleAchievements(userID string, ctx PuzzleContext) []AchievementUnlock {
	existing, err := database.GetUserAchievementIDs(userID)
	if err != nil {
		logger.Error("Failed to get existing achievements for puzzle check", logger.F("userID", userID, "error", err.Error()))
		return nil
	}

	var unlocked []AchievementUnlock

	grant := func(id string) {
		if existing[id] {
			return
		}
		a, ok := All[id]
		if !ok {
			return
		}
		granted, err := database.GrantAchievement(userID, id, a.Points)
		if err != nil {
			logger.Error("Failed to grant puzzle achievement", logger.F("userID", userID, "achievementID", id, "error", err.Error()))
			return
		}
		if granted {
			unlocked = append(unlocked, ToUnlock(a))
			existing[id] = true
		}
	}

	puzzleStreak, err := database.UpdatePuzzleStreak(userID, ctx.Solved)
	if err != nil {
		logger.Error("Failed to update puzzle streak", logger.F("userID", userID, "error", err.Error()))
	} else if ctx.Solved {
		if puzzleStreak >= 3 {
			grant("puzzle_streak_3")
		}
		if puzzleStreak >= 5 {
			grant("puzzle_streak_5")
		}
		if puzzleStreak >= 10 {
			grant("puzzle_streak_10")
		}
		if puzzleStreak >= 20 {
			grant("puzzle_streak_20")
		}
	}

	puzzleRatingThresholds := []struct {
		threshold int
		id        string
	}{
		{1400, "puzzle_rating_1400"},
		{1600, "puzzle_rating_1600"},
		{1800, "puzzle_rating_1800"},
		{2000, "puzzle_rating_2000"},
		{2200, "puzzle_rating_2200"},
		{2400, "puzzle_rating_2400"},
		{2600, "puzzle_rating_2600"},
		{2800, "puzzle_rating_2800"},
		{3000, "puzzle_rating_3000"},
	}
	for _, rt := range puzzleRatingThresholds {
		if ctx.NewRating >= rt.threshold {
			grant(rt.id)
		}
	}

	if ctx.Solved {
		grant("first_puzzle")
	}

	puzzlesSolved, err := database.GetPuzzlesSolvedCount(userID)
	if err == nil {
		if puzzlesSolved >= 10 {
			grant("puzzles_10")
		}
		if puzzlesSolved >= 50 {
			grant("puzzles_50")
		}
		if puzzlesSolved >= 100 {
			grant("puzzles_100")
		}
		if puzzlesSolved >= 500 {
			grant("puzzles_500")
		}
	}

	return unlocked
}

func CheckLoyaltyAchievements(userID string, createdAt time.Time) []AchievementUnlock {
	existing, err := database.GetUserAchievementIDs(userID)
	if err != nil {
		logger.Error("Failed to get existing achievements for loyalty check", logger.F("userID", userID, "error", err.Error()))
		return nil
	}

	var unlocked []AchievementUnlock

	grant := func(id string) {
		if existing[id] {
			return
		}
		a, ok := All[id]
		if !ok {
			return
		}
		granted, err := database.GrantAchievement(userID, id, a.Points)
		if err != nil {
			logger.Error("Failed to grant loyalty achievement", logger.F("userID", userID, "achievementID", id, "error", err.Error()))
			return
		}
		if granted {
			unlocked = append(unlocked, ToUnlock(a))
			existing[id] = true
		}
	}

	membershipDuration := time.Since(createdAt)

	loyaltyMilestones := []struct {
		duration time.Duration
		id       string
	}{
		{365 * 24 * time.Hour, "loyalty_1yr"},
		{2 * 365 * 24 * time.Hour, "loyalty_2yr"},
		{3 * 365 * 24 * time.Hour, "loyalty_3yr"},
		{5 * 365 * 24 * time.Hour, "loyalty_5yr"},
	}

	for _, lm := range loyaltyMilestones {
		if membershipDuration >= lm.duration {
			grant(lm.id)
		}
	}

	return unlocked
}
