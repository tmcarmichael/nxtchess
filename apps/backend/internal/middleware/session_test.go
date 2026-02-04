package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestSession_ValidCookie(t *testing.T) {
	original := sessionLookup
	sessionLookup = func(token string) (string, bool) {
		if token == "valid-token" {
			return "user-123", true
		}
		return "", false
	}
	defer func() { sessionLookup = original }()

	var capturedUserID string
	var found bool
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedUserID, found = UserIDFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	})
	handler := Session(inner)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.AddCookie(&http.Cookie{Name: "session_token", Value: "valid-token"})
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
	if !found {
		t.Fatal("expected userID to be found in context")
	}
	if capturedUserID != "user-123" {
		t.Errorf("expected userID 'user-123', got %q", capturedUserID)
	}
}

func TestSession_MissingCookie(t *testing.T) {
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	handler := Session(inner)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
	if !strings.Contains(rr.Body.String(), "Missing session cookie") {
		t.Errorf("expected 'Missing session cookie' in body, got %q", rr.Body.String())
	}
}

func TestSession_InvalidToken(t *testing.T) {
	original := sessionLookup
	sessionLookup = func(token string) (string, bool) {
		return "", false
	}
	defer func() { sessionLookup = original }()

	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	handler := Session(inner)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.AddCookie(&http.Cookie{Name: "session_token", Value: "bad-token"})
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
	if !strings.Contains(rr.Body.String(), "Invalid or expired") {
		t.Errorf("expected 'Invalid or expired' in body, got %q", rr.Body.String())
	}
}

func TestOptionalSession_ValidCookie(t *testing.T) {
	original := sessionLookup
	sessionLookup = func(token string) (string, bool) {
		if token == "valid-token" {
			return "user-456", true
		}
		return "", false
	}
	defer func() { sessionLookup = original }()

	var capturedUserID string
	var found bool
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedUserID, found = UserIDFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	})
	handler := OptionalSession(inner)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.AddCookie(&http.Cookie{Name: "session_token", Value: "valid-token"})
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
	if !found || capturedUserID != "user-456" {
		t.Errorf("expected userID 'user-456', got %q (found=%v)", capturedUserID, found)
	}
}

func TestOptionalSession_NoCookie(t *testing.T) {
	inner := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, found := UserIDFromContext(r.Context())
		if found {
			t.Error("expected no userID in context when no cookie provided")
		}
		w.WriteHeader(http.StatusOK)
	})
	handler := OptionalSession(inner)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200 even without cookie, got %d", rr.Code)
	}
}
