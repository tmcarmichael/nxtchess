package models

import "time"

type Profile struct {
	UserID    string    `json:"user_id"`
	Username  string    `json:"username"`
	Rating    int       `json:"rating"`
	CreatedAt time.Time `json:"created_at"`
}
