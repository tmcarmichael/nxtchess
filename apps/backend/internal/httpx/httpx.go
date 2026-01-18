package httpx

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
)

func WriteJSONError(w http.ResponseWriter, status int, msg string) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    _ = json.NewEncoder(w).Encode(map[string]string{
        "error": msg,
    })
}

func WriteJSON(w http.ResponseWriter, status int, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error writing JSON response: %v", err)
    }
}

// NewSecureCookie creates a cookie with secure settings based on environment
func NewSecureCookie(cfg *config.Config, name, value string, maxAge int) *http.Cookie {
	return &http.Cookie{
		Name:     name,
		Value:    value,
		Path:     "/",
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   cfg.IsProd(),
		SameSite: http.SameSiteLaxMode,
	}
}