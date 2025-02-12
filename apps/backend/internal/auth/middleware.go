package auth

import (
	"context"
	"net/http"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/sessions"
)

func SessionMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session_token")
		if err != nil {
			http.Error(w, "Missing session cookie", http.StatusUnauthorized)
			return
		}

		userID, found := sessions.GetSessionUserID(cookie.Value)
		if !found {
			http.Error(w, "Invalid or expired session token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "userID", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
