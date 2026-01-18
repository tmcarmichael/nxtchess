package controllers

import (
	"net/http"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/httpx"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/sessions"
)

// LogoutHandler handles user logout by clearing the session
func LogoutHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get session token from cookie
		cookie, err := r.Cookie("session_token")
		if err != nil {
			// No session cookie - already logged out
			httpx.WriteJSON(w, http.StatusOK, map[string]string{
				"message": "Already logged out",
			})
			return
		}

		// Delete session from Redis
		if err := sessions.DeleteSession(cookie.Value); err != nil {
			logger.Error("Failed to delete session", logger.F("error", err.Error()))
			// Continue anyway - we'll clear the cookie
		}

		// Clear the session cookie
		http.SetCookie(w, &http.Cookie{
			Name:     "session_token",
			Value:    "",
			Path:     "/",
			MaxAge:   -1, // Delete cookie
			HttpOnly: true,
			Secure:   cfg.IsProd(),
			SameSite: http.SameSiteLaxMode,
		})

		logger.Info("User logged out")
		httpx.WriteJSON(w, http.StatusOK, map[string]string{
			"message": "Logged out successfully",
		})
	}
}
