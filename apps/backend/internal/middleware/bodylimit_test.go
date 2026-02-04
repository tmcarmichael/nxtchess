package middleware

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestBodyLimit_SkipsGET(t *testing.T) {
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})
	handler := BodyLimitHandler(1)(inner)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected GET to pass through with 200, got %d", rr.Code)
	}
}

func TestBodyLimit_AllowsSmallPOST(t *testing.T) {
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})
	handler := BodyLimitHandler(1 << 20)(inner)

	body := bytes.NewReader([]byte(`{"key":"value"}`))
	req := httptest.NewRequest(http.MethodPost, "/", body)
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected small POST to return 200, got %d", rr.Code)
	}
}

func TestBodyLimit_RejectsByContentLength(t *testing.T) {
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	maxBytes := int64(64 << 10)
	handler := BodyLimitHandler(maxBytes)(inner)

	req := httptest.NewRequest(http.MethodPost, "/", nil)
	req.ContentLength = maxBytes + 1
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("expected 413, got %d", rr.Code)
	}
}

func TestSmallBodyLimit(t *testing.T) {
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	handler := SmallBodyLimit(inner)

	req := httptest.NewRequest(http.MethodPost, "/", nil)
	req.ContentLength = (64 << 10) + 1
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("expected SmallBodyLimit to reject oversized POST with 413, got %d", rr.Code)
	}
}

func TestDefaultBodyLimit(t *testing.T) {
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	handler := DefaultBodyLimit(inner)

	req := httptest.NewRequest(http.MethodPost, "/", nil)
	req.ContentLength = (1 << 20) + 1
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("expected DefaultBodyLimit to reject oversized POST with 413, got %d", rr.Code)
	}
}
