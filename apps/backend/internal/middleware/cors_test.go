package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
)

func TestCORS_SetsHeaders(t *testing.T) {
	cfg := &config.Config{FrontendURL: "http://localhost:5173"}
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	handler := CORS(cfg)(inner)

	req := httptest.NewRequest(http.MethodGet, "/api/test", nil)
	req.Header.Set("Origin", "http://localhost:5173")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	origin := rr.Header().Get("Access-Control-Allow-Origin")
	if origin != "http://localhost:5173" {
		t.Errorf("expected Access-Control-Allow-Origin=%q, got %q", "http://localhost:5173", origin)
	}

	creds := rr.Header().Get("Access-Control-Allow-Credentials")
	if creds != "true" {
		t.Errorf("expected Access-Control-Allow-Credentials=true, got %q", creds)
	}

	methods := rr.Header().Get("Access-Control-Allow-Methods")
	if methods == "" {
		t.Error("expected Access-Control-Allow-Methods to be set")
	}

	headers := rr.Header().Get("Access-Control-Allow-Headers")
	if headers == "" {
		t.Error("expected Access-Control-Allow-Headers to be set")
	}

	maxAge := rr.Header().Get("Access-Control-Max-Age")
	if maxAge == "" {
		t.Error("expected Access-Control-Max-Age to be set")
	}
}

func TestCORS_PreflightReturns200(t *testing.T) {
	cfg := &config.Config{FrontendURL: "http://localhost:5173"}
	innerCalled := false
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		innerCalled = true
		w.WriteHeader(http.StatusOK)
	})
	handler := CORS(cfg)(inner)

	req := httptest.NewRequest(http.MethodOptions, "/api/test", nil)
	req.Header.Set("Origin", "http://localhost:5173")
	req.Header.Set("Access-Control-Request-Method", "POST")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected preflight to return 200, got %d", rr.Code)
	}

	if innerCalled {
		t.Error("expected inner handler NOT to be called on preflight")
	}
}
