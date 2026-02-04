package middleware

import (
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/metrics"
)

func Metrics(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		wrapped := &statusResponseWriter{ResponseWriter: w, statusCode: http.StatusOK}
		next.ServeHTTP(wrapped, r)

		route := "unknown"
		if rctx := chi.RouteContext(r.Context()); rctx != nil {
			if pattern := rctx.RoutePattern(); pattern != "" {
				route = pattern
			}
		}
		status := strconv.Itoa(wrapped.statusCode)

		metrics.HTTPRequestsTotal.WithLabelValues(r.Method, route, status).Inc()
		metrics.HTTPRequestDuration.WithLabelValues(r.Method, route).Observe(time.Since(start).Seconds())
	})
}
