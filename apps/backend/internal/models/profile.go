package models

import "time"

type Profile struct {
    UserID       string    `json:"user_id"`
    Username     string    `json:"username"`
    Rating       int       `json:"rating"`
    PuzzleRating int       `json:"puzzle_rating"`
    ProfileIcon  string    `json:"profile_icon"`
    CreatedAt    time.Time `json:"created_at"`
}

type PublicProfile struct {
    Username     string    `json:"username"`
    Rating       int       `json:"rating"`
    PuzzleRating int       `json:"puzzle_rating"`
    ProfileIcon  string    `json:"profile_icon"`
    CreatedAt    time.Time `json:"created_at"`
    GamesPlayed  int       `json:"games_played"`
    Wins         int       `json:"wins"`
    Losses       int       `json:"losses"`
    Draws        int       `json:"draws"`
}

type RatingPoint struct {
    Rating    int       `json:"rating"`
    CreatedAt time.Time `json:"created_at"`
}

type RecentGame struct {
    GameID      string    `json:"game_id"`
    Opponent    string    `json:"opponent"`
    Result      string    `json:"result"`
    PlayerColor string    `json:"player_color"`
    CreatedAt   time.Time `json:"created_at"`
}