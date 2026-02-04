package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
)

func TestSecurity_SetsAllHeaders(t *testing.T) {
	cfg := &config.Config{Environment: "development"}
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	handler := Security(cfg)(inner)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	expectations := map[string]string{
		"X-Content-Type-Options": "nosniff",
		"X-Frame-Options":       "DENY",
	}

	for header, expected := range expectations {
		got := rr.Header().Get(header)
		if got != expected {
			t.Errorf("%s: expected %q, got %q", header, expected, got)
		}
	}

	mustExist := []string{
		"X-XSS-Protection",
		"Referrer-Policy",
		"Permissions-Policy",
	}
	for _, header := range mustExist {
		if rr.Header().Get(header) == "" {
			t.Errorf("expected %s header to be set", header)
		}
	}

	csp := rr.Header().Get("Content-Security-Policy")
	if !strings.Contains(csp, "default-src") {
		t.Errorf("expected Content-Security-Policy to contain 'default-src', got %q", csp)
	}
}

func TestSecurity_HSTSOnlyInProd(t *testing.T) {
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	t.Run("development has no HSTS", func(t *testing.T) {
		cfg := &config.Config{Environment: "development"}
		handler := Security(cfg)(inner)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)

		hsts := rr.Header().Get("Strict-Transport-Security")
		if hsts != "" {
			t.Errorf("expected no HSTS in development, got %q", hsts)
		}
	})

	t.Run("production has HSTS with max-age", func(t *testing.T) {
		cfg := &config.Config{Environment: "production"}
		handler := Security(cfg)(inner)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)

		hsts := rr.Header().Get("Strict-Transport-Security")
		if !strings.Contains(hsts, "max-age") {
			t.Errorf("expected HSTS with max-age in production, got %q", hsts)
		}
	})
}
