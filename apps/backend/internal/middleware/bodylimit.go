package middleware

import (
	"net/http"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/httpx"
)

// Default body size limits
const (
	DefaultMaxBodySize = 1 << 20  // 1 MB
	SmallMaxBodySize   = 64 << 10 // 64 KB (for JSON API endpoints)
	LargeMaxBodySize   = 10 << 20 // 10 MB (for file uploads if needed)
)

// BodyLimit returns middleware that limits the size of request bodies.
// If the body exceeds maxBytes, the request is rejected with 413 Payload Too Large.
func BodyLimit(maxBytes int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip body limit for GET, HEAD, OPTIONS (no body expected)
			if r.Method == http.MethodGet || r.Method == http.MethodHead || r.Method == http.MethodOptions {
				next.ServeHTTP(w, r)
				return
			}

			// Wrap the body with a max bytes reader
			// http.MaxBytesReader will return an error if the body exceeds maxBytes
			r.Body = http.MaxBytesReader(w, r.Body, maxBytes)

			next.ServeHTTP(w, r)
		})
	}
}

// BodyLimitHandler is a middleware that limits request body size and returns
// a proper JSON error response if exceeded.
func BodyLimitHandler(maxBytes int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip body limit for GET, HEAD, OPTIONS (no body expected)
			if r.Method == http.MethodGet || r.Method == http.MethodHead || r.Method == http.MethodOptions {
				next.ServeHTTP(w, r)
				return
			}

			// Check Content-Length header first for early rejection
			if r.ContentLength > maxBytes {
				httpx.WriteJSONError(w, http.StatusRequestEntityTooLarge, "Request body too large")
				return
			}

			// Wrap the body with a max bytes reader for streaming bodies
			r.Body = http.MaxBytesReader(w, r.Body, maxBytes)

			next.ServeHTTP(w, r)
		})
	}
}

// SmallBodyLimit is a convenience function for JSON API endpoints (64KB limit)
func SmallBodyLimit(next http.Handler) http.Handler {
	return BodyLimitHandler(SmallMaxBodySize)(next)
}

// DefaultBodyLimit is a convenience function with 1MB limit
func DefaultBodyLimit(next http.Handler) http.Handler {
	return BodyLimitHandler(DefaultMaxBodySize)(next)
}
