package middleware

import (
	"net/http"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
)

// Security returns a middleware that sets security headers
func Security(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Prevent MIME type sniffing
			w.Header().Set("X-Content-Type-Options", "nosniff")

			// Prevent clickjacking
			w.Header().Set("X-Frame-Options", "DENY")

			// XSS protection (legacy, but still useful for older browsers)
			w.Header().Set("X-XSS-Protection", "1; mode=block")

			// Referrer policy - don't leak URLs to other domains
			w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")

			// Permissions policy - disable unnecessary browser features
			w.Header().Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

			// In production, add HSTS header for HTTPS enforcement
			if cfg.IsProd() {
				// max-age=31536000 = 1 year, includeSubDomains for all subdomains
				w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
			}

			// Content Security Policy - restrict resource loading
			// This is a basic policy; adjust based on your frontend needs
			csp := "default-src 'self'; " +
				"script-src 'self'; " +
				"style-src 'self' 'unsafe-inline'; " +
				"img-src 'self' data: https:; " +
				"font-src 'self'; " +
				"connect-src 'self' " + cfg.FrontendURL + "; " +
				"frame-ancestors 'none'; " +
				"form-action 'self'"
			w.Header().Set("Content-Security-Policy", csp)

			next.ServeHTTP(w, r)
		})
	}
}
