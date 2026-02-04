package middleware

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
)

func TestRateLimiter_Allow(t *testing.T) {
	rl := NewRateLimiter(10, time.Minute, 3)

	t.Run("burst permits initial requests", func(t *testing.T) {
		for i := 0; i < 3; i++ {
			if !rl.Allow("client-a") {
				t.Fatalf("expected request %d to be allowed within burst", i+1)
			}
		}
	})

	t.Run("exceeding burst blocks", func(t *testing.T) {
		if rl.Allow("client-a") {
			t.Fatal("expected request beyond burst to be blocked")
		}
	})

	t.Run("different keys are independent", func(t *testing.T) {
		if !rl.Allow("client-b") {
			t.Fatal("expected different key to be allowed independently")
		}
	})
}

func TestRateLimiter_Middleware(t *testing.T) {
	rl := NewRateLimiter(10, time.Minute, 2)

	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})
	handler := rl.Middleware(inner)

	t.Run("requests within limit return 200", func(t *testing.T) {
		for i := 0; i < 2; i++ {
			req := httptest.NewRequest(http.MethodGet, "/api/test", nil)
			req.RemoteAddr = "10.0.0.1:12345"
			rr := httptest.NewRecorder()
			handler.ServeHTTP(rr, req)
			if rr.Code != http.StatusOK {
				t.Fatalf("request %d: expected 200, got %d", i+1, rr.Code)
			}
		}
	})

	t.Run("over limit returns 429 with JSON error", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/test", nil)
		req.RemoteAddr = "10.0.0.1:12345"
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)

		if rr.Code != http.StatusTooManyRequests {
			t.Fatalf("expected 429, got %d", rr.Code)
		}

		var body map[string]string
		if err := json.NewDecoder(rr.Body).Decode(&body); err != nil {
			t.Fatalf("failed to decode JSON body: %v", err)
		}
		if errMsg, ok := body["error"]; !ok {
			t.Fatal("expected 'error' key in JSON response")
		} else if errMsg == "" {
			t.Fatal("expected non-empty error message")
		}
	})
}

func TestRateLimiter_RedirectMiddleware(t *testing.T) {
	rl := NewRateLimiter(10, time.Minute, 1)
	rl.SetConfig(&config.Config{FrontendURL: "http://localhost:5173"})

	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	handler := rl.RedirectMiddleware(inner)

	req := httptest.NewRequest(http.MethodGet, "/auth/callback", nil)
	req.RemoteAddr = "10.0.0.2:12345"
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("first request: expected 200, got %d", rr.Code)
	}

	req = httptest.NewRequest(http.MethodGet, "/auth/callback", nil)
	req.RemoteAddr = "10.0.0.2:12345"
	rr = httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusTemporaryRedirect {
		t.Fatalf("expected 307 redirect, got %d", rr.Code)
	}

	loc := rr.Header().Get("Location")
	if loc == "" {
		t.Fatal("expected Location header on redirect")
	}
}

func TestNewAuthRateLimiter(t *testing.T) {
	rl := NewAuthRateLimiter()
	if rl == nil {
		t.Fatal("expected non-nil auth rate limiter")
	}
}

func TestNewAPIRateLimiter(t *testing.T) {
	rl := NewAPIRateLimiter()
	if rl == nil {
		t.Fatal("expected non-nil API rate limiter")
	}
}
