package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
)

func TestRecovery_NoPanic(t *testing.T) {
	cfg := &config.Config{Environment: "development"}
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})
	handler := Recovery(cfg)(inner)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
	if rr.Body.String() != "ok" {
		t.Fatalf("expected body 'ok', got %q", rr.Body.String())
	}
}

func TestRecovery_CatchesPanic(t *testing.T) {
	cfg := &config.Config{Environment: "development"}
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		panic("something went wrong")
	})
	handler := Recovery(cfg)(inner)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", rr.Code)
	}

	body := rr.Body.String()
	if !strings.Contains(body, "error") {
		t.Fatalf("expected JSON error in body, got %q", body)
	}
}

func TestRecovery_HidesDetailsInProd(t *testing.T) {
	cfg := &config.Config{Environment: "production"}
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		panic("panic occurred")
	})
	handler := Recovery(cfg)(inner)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", rr.Code)
	}

	body := rr.Body.String()
	if !strings.Contains(body, "Internal server error") {
		t.Errorf("expected 'Internal server error' in body, got %q", body)
	}
	if strings.Contains(body, "panic occurred") {
		t.Errorf("expected panic details to be hidden in production, but found them in body")
	}
}
