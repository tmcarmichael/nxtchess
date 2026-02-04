package controllers

import (
	"net/http"
	"strconv"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/database"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/httpx"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/models"
)

// GetRandomEndgamePosition returns a random endgame training position
// GET /api/training/endgame/random
// Query params:
//   - difficulty: 1-10 (maps to rating ranges)
//   - theme: specific endgame theme (e.g., "rookEndgame", "pawnEndgame")
//   - side: 'w' or 'b' (filter by side to move)
func GetRandomEndgamePosition(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	params := models.EndgameQueryParams{}

	// Difficulty parameter (1-10)
	if diffStr := r.URL.Query().Get("difficulty"); diffStr != "" {
		diff, err := strconv.Atoi(diffStr)
		if err != nil || diff < 1 || diff > 10 {
			httpx.WriteJSONError(w, http.StatusBadRequest, "difficulty must be between 1 and 10")
			return
		}
		params.MinRating, params.MaxRating = models.DifficultyToRatingRange(diff)
	}

	// Theme parameter
	theme := r.URL.Query().Get("theme")
	if theme != "" {
		// Validate theme is a recognized endgame theme
		validThemes := map[string]bool{
			"pawnEndgame":      true,
			"rookEndgame":      true,
			"bishopEndgame":    true,
			"knightEndgame":    true,
			"queenEndgame":     true,
			"queenRookEndgame": true,
			"basicMate":        true,
			"opposition":       true,
			"lucena":           true,
			"philidor":         true,
		}
		if !validThemes[theme] {
			httpx.WriteJSONError(w, http.StatusBadRequest, "invalid endgame theme")
			return
		}
		params.Theme = theme
	}

	// Side parameter
	side := r.URL.Query().Get("side")
	if side != "" && side != "w" && side != "b" {
		httpx.WriteJSONError(w, http.StatusBadRequest, "side must be 'w' or 'b'")
		return
	}
	params.Side = side

	// Exclude position (to avoid returning the same position on restart)
	params.ExcludePositionID = r.URL.Query().Get("exclude")

	// Require opponent to have material (filter out trivial K vs K+pieces positions)
	// Default to true unless explicitly set to false, OR if theme is basicMate
	// (basicMate positions are specifically K+piece vs lone K)
	requireMaterial := r.URL.Query().Get("requireOpponentMaterial")
	if theme == "basicMate" {
		params.RequireOpponentMaterial = false
	} else {
		params.RequireOpponentMaterial = requireMaterial != "false"
	}

	// For knight and bishop endgames, require at least one pawn for the side to move
	// A lone knight or bishop cannot force checkmate (K+N vs K and K+B vs K are draws)
	if theme == "knightEndgame" || theme == "bishopEndgame" {
		params.RequirePawnForSideToMove = true
	}

	// Get random position from database
	pos, err := database.GetRandomEndgamePosition(params)
	if err != nil {
		logger.Error("Failed to get random endgame position",
			logger.F("difficulty", r.URL.Query().Get("difficulty"),
				"theme", theme, "side", side, "error", err.Error()))
		httpx.WriteJSONError(w, http.StatusInternalServerError, "Failed to get training position")
		return
	}

	if pos == nil {
		httpx.WriteJSONError(w, http.StatusNotFound, "No positions found matching criteria")
		return
	}

	// Determine primary theme for response
	primaryTheme := getPrimaryEndgameTheme(pos.Themes)

	// Build response matching frontend expectations
	resp := models.EndgamePositionResponse{
		PositionID:    pos.PositionID,
		FEN:           pos.FEN,
		InitialEval:   pos.InitialEval,
		Theme:         primaryTheme,
		Difficulty:    ratingToDifficulty(pos.Rating),
		SolutionMoves: pos.Moves,
	}

	httpx.WriteJSON(w, http.StatusOK, resp)
}

// GetEndgameThemes returns available endgame themes
// GET /api/training/endgame/themes
func GetEndgameThemes(w http.ResponseWriter, r *http.Request) {
	themes, err := database.GetAvailableEndgameThemes()
	if err != nil {
		logger.Error("Failed to get endgame themes", logger.F("error", err.Error()))
		httpx.WriteJSONError(w, http.StatusInternalServerError, "Failed to get themes")
		return
	}

	httpx.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"themes": themes,
	})
}

// GetEndgameStats returns statistics about available positions
// GET /api/training/endgame/stats
func GetEndgameStats(w http.ResponseWriter, r *http.Request) {
	// Get counts for different difficulty levels
	stats := make(map[string]int)

	for diff := 1; diff <= 10; diff++ {
		minRating, maxRating := models.DifficultyToRatingRange(diff)
		count, err := database.GetEndgamePositionCount(models.EndgameQueryParams{
			MinRating: minRating,
			MaxRating: maxRating,
		})
		if err != nil {
			logger.Error("Failed to get endgame stats", logger.F("difficulty", diff, "error", err.Error()))
			continue
		}
		stats[strconv.Itoa(diff)] = count
	}

	// Get total count
	total, err := database.GetEndgamePositionCount(models.EndgameQueryParams{})
	if err != nil {
		logger.Error("Failed to get total endgame count", logger.F("error", err.Error()))
		httpx.WriteJSONError(w, http.StatusInternalServerError, "Failed to get training statistics")
		return
	}

	httpx.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"total":        total,
		"byDifficulty": stats,
	})
}

// Helper: Get the most specific endgame theme from a list of themes
func getPrimaryEndgameTheme(themes []string) string {
	// Priority order: specific endgame types first
	priority := []string{
		"pawnEndgame",
		"rookEndgame",
		"bishopEndgame",
		"knightEndgame",
		"queenEndgame",
		"queenRookEndgame",
		"basicMate",
		"opposition",
		"lucena",
		"philidor",
	}

	themeSet := make(map[string]bool)
	for _, t := range themes {
		themeSet[t] = true
	}

	for _, p := range priority {
		if themeSet[p] {
			return p
		}
	}

	if len(themes) > 0 {
		return themes[0]
	}
	return ""
}

// Helper: Convert rating back to difficulty scale (1-10)
func ratingToDifficulty(rating int) int {
	switch {
	case rating < 500:
		return 1
	case rating < 800:
		return 2
	case rating < 1100:
		return 3
	case rating < 1400:
		return 4
	case rating < 1700:
		return 5
	case rating < 2000:
		return 6
	case rating < 2300:
		return 7
	case rating < 2600:
		return 8
	case rating < 2800:
		return 9
	default:
		return 10
	}
}
