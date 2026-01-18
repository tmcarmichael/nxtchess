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

// GetClientIP extracts the client IP from an HTTP request.
// Checks X-Forwarded-For and X-Real-IP headers for proxy support,
// falls back to RemoteAddr with port stripped.
func GetClientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		for i := 0; i < len(xff); i++ {
			if xff[i] == ',' {
				return xff[:i]
			}
		}
		return xff
	}

	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return xri
	}

	addr := r.RemoteAddr
	for i := len(addr) - 1; i >= 0; i-- {
		if addr[i] == ':' {
			return addr[:i]
		}
	}
	return addr
}