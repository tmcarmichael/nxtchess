package middleware

import (
	"fmt"
	"net/http"
	"net/url"
	"sync"
	"time"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/httpx"
)

// RateLimiter implements a token bucket rate limiter
type RateLimiter struct {
	mu       sync.Mutex
	clients  map[string]*bucket
	rate     int            // tokens per interval
	interval time.Duration  // refill interval
	burst    int            // max tokens (burst capacity)
	cleanup  time.Duration  // cleanup old entries interval
	cfg      *config.Config // for trusted proxy validation
}

type bucket struct {
	tokens    int
	lastCheck time.Time
}

// NewRateLimiter creates a new rate limiter
// rate: requests allowed per interval
// interval: time period for rate (e.g., time.Minute)
// burst: maximum burst capacity
func NewRateLimiter(rate int, interval time.Duration, burst int) *RateLimiter {
	rl := &RateLimiter{
		clients:  make(map[string]*bucket),
		rate:     rate,
		interval: interval,
		burst:    burst,
		cleanup:  5 * time.Minute,
	}

	// Start cleanup goroutine
	go rl.cleanupLoop()

	return rl
}

// cleanupLoop removes stale entries periodically
func (rl *RateLimiter) cleanupLoop() {
	ticker := time.NewTicker(rl.cleanup)
	for range ticker.C {
		rl.mu.Lock()
		cutoff := time.Now().Add(-rl.cleanup)
		for ip, b := range rl.clients {
			if b.lastCheck.Before(cutoff) {
				delete(rl.clients, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// Allow checks if a request from the given key should be allowed
func (rl *RateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	b, exists := rl.clients[key]

	if !exists {
		rl.clients[key] = &bucket{
			tokens:    rl.burst - 1, // consume one token
			lastCheck: now,
		}
		return true
	}

	// Calculate tokens to add based on elapsed time
	elapsed := now.Sub(b.lastCheck)
	tokensToAdd := int(elapsed / rl.interval) * rl.rate
	b.tokens += tokensToAdd
	if b.tokens > rl.burst {
		b.tokens = rl.burst
	}
	b.lastCheck = now

	if b.tokens > 0 {
		b.tokens--
		return true
	}

	return false
}

// Middleware returns an HTTP middleware that rate limits requests
func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := httpx.GetClientIP(r, rl.cfg)

		if !rl.Allow(key) {
			w.Header().Set("Retry-After", "60")
			httpx.WriteJSONError(w, http.StatusTooManyRequests, "Rate limit exceeded. Please try again later.")
			return
		}

		next.ServeHTTP(w, r)
	})
}

// RedirectMiddleware returns an HTTP middleware that rate limits requests
// and redirects to the frontend with an error query parameter on limit exceeded.
// Use this for browser-navigated routes (e.g. OAuth) where a JSON response
// would be displayed as raw text.
func (rl *RateLimiter) RedirectMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := httpx.GetClientIP(r, rl.cfg)

		if !rl.Allow(key) {
			errMsg := "Rate limit exceeded. Please try again later."
			redirectURL := fmt.Sprintf("%s/?error=%s", rl.cfg.FrontendURL, url.QueryEscape(errMsg))
			http.Redirect(w, r, redirectURL, http.StatusTemporaryRedirect)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// SetConfig sets the config for trusted proxy validation
func (rl *RateLimiter) SetConfig(cfg *config.Config) {
	rl.cfg = cfg
}

// Common rate limiter presets

// NewAuthRateLimiter creates a rate limiter suitable for auth endpoints
// 10 requests per minute with burst of 5
func NewAuthRateLimiter() *RateLimiter {
	return NewRateLimiter(10, time.Minute, 5)
}

// NewAPIRateLimiter creates a rate limiter for general API endpoints
// 60 requests per minute with burst of 20
func NewAPIRateLimiter() *RateLimiter {
	return NewRateLimiter(60, time.Minute, 20)
}

// NewStrictRateLimiter creates a stricter rate limiter for sensitive endpoints
// 5 requests per minute with burst of 3
func NewStrictRateLimiter() *RateLimiter {
	return NewRateLimiter(5, time.Minute, 3)
}
