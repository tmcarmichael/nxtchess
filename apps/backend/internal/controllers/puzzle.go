package controllers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/achievements"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/database"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/elo"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/httpx"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/middleware"
)

var puzzleRatingByCategory = map[string]int{
	"mate-in-1": 800,
	"mate-in-2": 1200,
	"mate-in-3": 1600,
}

func SubmitPuzzleResultHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok || userID == "" {
		httpx.WriteJSONError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req struct {
		PuzzleID string `json:"puzzle_id"`
		Category string `json:"category"`
		Solved   bool   `json:"solved"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpx.WriteJSONError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	puzzleRating, validCategory := puzzleRatingByCategory[req.Category]
	if !validCategory {
		httpx.WriteJSONError(w, http.StatusBadRequest, "Category must be mate-in-1, mate-in-2, or mate-in-3")
		return
	}

	if req.PuzzleID == "" {
		httpx.WriteJSONError(w, http.StatusBadRequest, "puzzle_id is required")
		return
	}

	lastSubmission, err := database.GetLastPuzzleSubmissionTime(userID)
	if err != nil {
		logger.Error("Failed to check last puzzle submission", logger.F("userID", userID, "error", err.Error()))
		httpx.WriteJSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}
	if !lastSubmission.IsZero() && time.Since(lastSubmission) < 3*time.Second {
		httpx.WriteJSONError(w, http.StatusTooManyRequests, "Please wait before submitting another result")
		return
	}

	playerRating, gamesPlayed, err := database.GetPuzzleRatingInfo(userID)
	if err != nil {
		logger.Error("Failed to get puzzle rating info", logger.F("userID", userID, "error", err.Error()))
		httpx.WriteJSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	rc := elo.CalculatePuzzle(playerRating, puzzleRating, req.Solved, gamesPlayed)

	if err := database.FinalizePuzzleResult(userID, rc.PlayerOld, rc.PlayerNew); err != nil {
		logger.Error("Failed to finalize puzzle result", logger.F("userID", userID, "error", err.Error()))
		httpx.WriteJSONError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	logger.Info("Puzzle result submitted", logger.F(
		"userID", userID,
		"puzzleID", req.PuzzleID,
		"category", req.Category,
		"solved", req.Solved,
		"oldRating", rc.PlayerOld,
		"newRating", rc.PlayerNew,
		"delta", rc.PlayerDelta,
	))

	puzzleCtx := achievements.PuzzleContext{
		Solved:    req.Solved,
		NewRating: rc.PlayerNew,
	}
	newAchievements := achievements.CheckPuzzleAchievements(userID, puzzleCtx)

	httpx.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"new_rating":       rc.PlayerNew,
		"rating_delta":     rc.PlayerDelta,
		"old_rating":       rc.PlayerOld,
		"new_achievements": newAchievements,
	})
}
