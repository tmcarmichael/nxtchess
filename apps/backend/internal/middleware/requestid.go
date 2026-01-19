package middleware

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"net/http"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
)

// requestIDKey is the context key for request IDs
type requestIDKey struct{}

// RequestIDHeader is the HTTP header name for request IDs
const RequestIDHeader = "X-Request-ID"

// RequestID is middleware that assigns a unique ID to each request.
// The ID is added to the request context and response headers for tracing.
func RequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check if request already has an ID (from upstream proxy)
		requestID := r.Header.Get(RequestIDHeader)
		if requestID == "" {
			// Generate a new request ID
			requestID = generateRequestID()
		}

		// Add to response headers for client tracing
		w.Header().Set(RequestIDHeader, requestID)

		// Add to request context
		ctx := context.WithValue(r.Context(), requestIDKey{}, requestID)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequestIDFromContext extracts the request ID from a context.
// Returns empty string if no request ID is present.
func RequestIDFromContext(ctx context.Context) string {
	if id, ok := ctx.Value(requestIDKey{}).(string); ok {
		return id
	}
	return ""
}

// generateRequestID creates a random 16-character hex string
func generateRequestID() string {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		// Fallback to timestamp-based ID if crypto/rand fails
		return "fallback-id"
	}
	return hex.EncodeToString(bytes)
}

// RequestLogger is middleware that logs requests with their request ID.
// Should be used after RequestID middleware.
func RequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := RequestIDFromContext(r.Context())

		// Log the incoming request
		logger.Info("Request started",
			logger.F(
				"requestId", requestID,
				"method", r.Method,
				"path", r.URL.Path,
				"remoteAddr", r.RemoteAddr,
			),
		)

		// Wrap response writer to capture status code
		wrapped := &statusResponseWriter{ResponseWriter: w, statusCode: http.StatusOK}

		next.ServeHTTP(wrapped, r)

		// Log the response
		logger.Info("Request completed",
			logger.F(
				"requestId", requestID,
				"method", r.Method,
				"path", r.URL.Path,
				"status", wrapped.statusCode,
			),
		)
	})
}

// statusResponseWriter wraps http.ResponseWriter to capture the status code
type statusResponseWriter struct {
	http.ResponseWriter
	statusCode int
	written    bool
}

func (w *statusResponseWriter) WriteHeader(code int) {
	if !w.written {
		w.statusCode = code
		w.written = true
	}
	w.ResponseWriter.WriteHeader(code)
}

func (w *statusResponseWriter) Write(b []byte) (int, error) {
	if !w.written {
		w.written = true
	}
	return w.ResponseWriter.Write(b)
}

// LogFieldsWithRequestID returns logger fields including the request ID from context.
// Use this to add request ID to error logs within handlers.
func LogFieldsWithRequestID(ctx context.Context, keyvals ...interface{}) map[string]interface{} {
	fields := logger.F(keyvals...)
	if requestID := RequestIDFromContext(ctx); requestID != "" {
		fields["requestId"] = requestID
	}
	return fields
}
