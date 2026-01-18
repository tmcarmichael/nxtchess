package models

import "time"

type Game struct {
    GameID              string    `json:"game_id"`
    PGN                 string    `json:"pgn"`
    PlayerWID           string    `json:"player_w_id"`
    PlayerBID           string    `json:"player_b_id"`
    StockfishDifficulty *int      `json:"stockfish_difficulty,omitempty"`
    PlayerWStartRating  int       `json:"player_w_start_rating"`
    PlayerBStartRating  int       `json:"player_b_start_rating"`
    Result              string    `json:"result"` // "1-0", "0-1", "1/2-1/2", "*" (ongoing)
    CreatedAt           time.Time `json:"created_at"`
}