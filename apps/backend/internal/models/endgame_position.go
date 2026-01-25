package models

import "time"

// EndgamePosition represents a training position for endgame practice
type EndgamePosition struct {
	PositionID  string    `json:"position_id"`
	FEN         string    `json:"fen"`
	Moves       string    `json:"moves,omitempty"`
	Rating      int       `json:"rating"`
	Themes      []string  `json:"themes"`
	InitialEval *int      `json:"initial_eval,omitempty"`
	Description string    `json:"description,omitempty"`
	Source      string    `json:"source,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

// EndgamePositionResponse is the API response for training endpoints
type EndgamePositionResponse struct {
	PositionID     string `json:"position_id"`
	FEN            string `json:"fen"`
	InitialEval    *int   `json:"initial_eval,omitempty"`
	Theme          string `json:"theme,omitempty"`
	Difficulty     int    `json:"difficulty"`
	SolutionMoves  string `json:"solution_moves,omitempty"`
	ExpectedResult string `json:"expected_result,omitempty"`
}

// EndgameQueryParams holds filter parameters for querying positions
type EndgameQueryParams struct {
	// MinRating filters positions with rating >= this value
	MinRating int
	// MaxRating filters positions with rating <= this value
	MaxRating int
	// Theme filters by specific theme (e.g., "rookEndgame")
	Theme string
	// Side filters by side to move ('w' or 'b')
	Side string
	// ExcludePositionID excludes a specific position (to avoid repeats on restart)
	ExcludePositionID string
	// RequireOpponentMaterial when true, excludes positions where opponent has only king
	RequireOpponentMaterial bool
}

// DifficultyToRatingRange maps difficulty levels (1-10) to rating ranges
// Rating scale: 0-3000 (higher = harder)
func DifficultyToRatingRange(difficulty int) (min int, max int) {
	switch difficulty {
	case 1:
		return 0, 500
	case 2:
		return 400, 800
	case 3:
		return 700, 1100
	case 4:
		return 1000, 1400
	case 5:
		return 1300, 1700
	case 6:
		return 1600, 2000
	case 7:
		return 1900, 2300
	case 8:
		return 2200, 2600
	case 9:
		return 2500, 2800
	case 10:
		return 2700, 3500
	default:
		// Default to medium difficulty
		return 1300, 1700
	}
}
