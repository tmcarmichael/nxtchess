package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRequestID_GeneratesID(t *testing.T) {
	var capturedID string
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedID = RequestIDFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	})
	handler := RequestID(inner)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	responseID := rr.Header().Get("X-Request-ID")
	if responseID == "" {
		t.Fatal("expected X-Request-ID header in response")
	}
	if capturedID == "" {
		t.Fatal("expected request ID in context")
	}
	if responseID != capturedID {
		t.Errorf("response header ID %q does not match context ID %q", responseID, capturedID)
	}
}

func TestRequestID_PreservesExisting(t *testing.T) {
	var capturedID string
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedID = RequestIDFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	})
	handler := RequestID(inner)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("X-Request-ID", "existing-id")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if capturedID != "existing-id" {
		t.Errorf("expected context ID to be 'existing-id', got %q", capturedID)
	}

	responseID := rr.Header().Get("X-Request-ID")
	if responseID != "existing-id" {
		t.Errorf("expected response header ID to be 'existing-id', got %q", responseID)
	}
}

func TestRequestIDFromContext(t *testing.T) {
	t.Run("context with ID returns it", func(t *testing.T) {
		var capturedID string
		inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			capturedID = RequestIDFromContext(r.Context())
			w.WriteHeader(http.StatusOK)
		})
		handler := RequestID(inner)

		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.Header.Set("X-Request-ID", "test-id-123")
		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)

		if capturedID != "test-id-123" {
			t.Errorf("expected 'test-id-123', got %q", capturedID)
		}
	})

	t.Run("empty context returns empty string", func(t *testing.T) {
		id := RequestIDFromContext(context.Background())
		if id != "" {
			t.Errorf("expected empty string for background context, got %q", id)
		}
	})
}

func TestStatusResponseWriter(t *testing.T) {
	t.Run("WriteHeader captures status code", func(t *testing.T) {
		rr := httptest.NewRecorder()
		sw := &statusResponseWriter{ResponseWriter: rr}
		sw.WriteHeader(http.StatusNotFound)

		if sw.statusCode != http.StatusNotFound {
			t.Errorf("expected status 404, got %d", sw.statusCode)
		}
	})

	t.Run("Write without WriteHeader uses initialized default", func(t *testing.T) {
		rr := httptest.NewRecorder()
		sw := &statusResponseWriter{ResponseWriter: rr, statusCode: http.StatusOK}
		sw.Write([]byte("hello"))

		if sw.statusCode != http.StatusOK {
			t.Errorf("expected default status 200, got %d", sw.statusCode)
		}
		if !sw.written {
			t.Error("expected written to be true after Write")
		}
	})
}
