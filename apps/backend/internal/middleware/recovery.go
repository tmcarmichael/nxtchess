package middleware

import (
	"fmt"
	"net/http"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/httpx"
)

func Recovery(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if rec := recover(); rec != nil {
                httpx.WriteJSONError(w, http.StatusInternalServerError, fmt.Sprintf("panic: %v", rec))
            }
        }()
        next.ServeHTTP(w, r)
    })
}
