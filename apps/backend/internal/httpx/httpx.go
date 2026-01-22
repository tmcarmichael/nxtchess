package httpx

import (
	"encoding/json"
	"log"
	"net"
	"net/http"
	"strings"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
)

// RequestIDHeader is the header name for request IDs
const RequestIDHeader = "X-Request-ID"

// WriteJSONError writes a JSON error response
func WriteJSONError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"error": msg,
	})
}

// WriteJSONErrorWithRequest writes a JSON error response including the request ID.
// The request ID is read from the X-Request-ID response header (set by RequestID middleware).
func WriteJSONErrorWithRequest(w http.ResponseWriter, r *http.Request, status int, msg string) {
	// Get request ID from response header (set by middleware)
	requestID := w.Header().Get(RequestIDHeader)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	response := map[string]string{
		"error": msg,
	}
	if requestID != "" {
		response["requestId"] = requestID
	}
	_ = json.NewEncoder(w).Encode(response)
}

// WriteJSON writes a JSON response
func WriteJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error writing JSON response: %v", err)
	}
}

// NewSecureCookie creates a cookie with secure settings based on environment
func NewSecureCookie(cfg *config.Config, name, value string, maxAge int) *http.Cookie {
	sameSite := http.SameSiteLaxMode
	if cfg.IsProd() {
		// Cross-origin cookies require SameSite=None with Secure=true
		sameSite = http.SameSiteNoneMode
	}
	return &http.Cookie{
		Name:     name,
		Value:    value,
		Path:     "/",
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   cfg.IsProd(),
		SameSite: sameSite,
	}
}

// GetClientIP extracts the client IP from an HTTP request.
// Only trusts X-Forwarded-For and X-Real-IP headers when the request
// originates from a configured trusted proxy. Falls back to RemoteAddr.
func GetClientIP(r *http.Request, cfg *config.Config) string {
	remoteIP := extractIP(r.RemoteAddr)

	// Only trust forwarded headers if request comes from a trusted proxy
	if cfg != nil && isTrustedProxy(remoteIP, cfg.TrustedProxies) {
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			// X-Forwarded-For can contain multiple IPs: client, proxy1, proxy2
			// The first untrusted IP (reading right-to-left) is the real client
			ips := strings.Split(xff, ",")
			for i := len(ips) - 1; i >= 0; i-- {
				ip := strings.TrimSpace(ips[i])
				if ip != "" && !isTrustedProxy(ip, cfg.TrustedProxies) {
					return ip
				}
			}
			// All IPs in chain are trusted, use the leftmost
			if len(ips) > 0 {
				return strings.TrimSpace(ips[0])
			}
		}

		if xri := r.Header.Get("X-Real-IP"); xri != "" {
			return strings.TrimSpace(xri)
		}
	}

	return remoteIP
}

// GetClientIPSimple extracts client IP without proxy trust validation.
// Use only in development or when proxy validation is not needed.
func GetClientIPSimple(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		if idx := strings.Index(xff, ","); idx != -1 {
			return strings.TrimSpace(xff[:idx])
		}
		return strings.TrimSpace(xff)
	}

	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return strings.TrimSpace(xri)
	}

	return extractIP(r.RemoteAddr)
}

// extractIP removes the port from an address string
func extractIP(addr string) string {
	// Handle IPv6 addresses like [::1]:8080
	if host, _, err := net.SplitHostPort(addr); err == nil {
		return host
	}
	return addr
}

// isTrustedProxy checks if an IP is in the trusted proxy list
func isTrustedProxy(ip string, trustedProxies []string) bool {
	if len(trustedProxies) == 0 {
		return false
	}

	clientIP := net.ParseIP(ip)
	if clientIP == nil {
		return false
	}

	for _, trusted := range trustedProxies {
		// Check if it's a CIDR
		if strings.Contains(trusted, "/") {
			_, network, err := net.ParseCIDR(trusted)
			if err == nil && network.Contains(clientIP) {
				return true
			}
		} else {
			// Plain IP comparison
			if trustedIP := net.ParseIP(trusted); trustedIP != nil {
				if clientIP.Equal(trustedIP) {
					return true
				}
			}
		}
	}

	return false
}