package middleware

import (
	"net/http"
	"runtime/debug"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/httpx"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
)

// Recovery returns a middleware that recovers from panics
func Recovery(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if rec := recover(); rec != nil {
					// Log the panic with stack trace
					stack := debug.Stack()
					logger.Error("Panic recovered", logger.F(
						"panic", rec,
						"method", r.Method,
						"path", r.URL.Path,
						"stack", string(stack),
					))

					// In production, don't expose panic details
					if cfg.IsProd() {
						httpx.WriteJSONError(w, http.StatusInternalServerError, "Internal server error")
					} else {
						// In development, show the panic message (but not full stack in response)
						httpx.WriteJSONError(w, http.StatusInternalServerError, "Internal server error: panic occurred")
					}
				}
			}()
			next.ServeHTTP(w, r)
		})
	}
}
