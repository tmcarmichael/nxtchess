package middleware

import (
	"context"
	"net/http"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/httpx"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/sessions"
)

type contextKey string

const userIDKey contextKey = "userID"

func Session(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session_token")
		if err != nil {
			httpx.WriteJSONError(w,  http.StatusUnauthorized, "Missing session cookie",)
			return
		}

		userID, found := sessions.GetSessionUserID(cookie.Value)
		if !found {
			httpx.WriteJSONError(w, http.StatusUnauthorized, "Invalid or expired session token")
			return
		}

		ctx := context.WithValue(r.Context(), userIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func UserIDFromContext(ctx context.Context) (string, bool) {
	id, ok := ctx.Value(userIDKey).(string)
	return id, ok
}
