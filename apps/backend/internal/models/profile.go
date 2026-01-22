package models

import "time"

type Profile struct {
    UserID      string    `json:"user_id"`
    Username    string    `json:"username"`
    Rating      int       `json:"rating"`
    ProfileIcon string    `json:"profile_icon"`
    CreatedAt   time.Time `json:"created_at"`
}

type PublicProfile struct {
    Username    string `json:"username"`
    Rating      int    `json:"rating"`
    ProfileIcon string `json:"profile_icon"`
}