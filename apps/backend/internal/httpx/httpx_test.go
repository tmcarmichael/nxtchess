package httpx

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
)

func TestWriteJSONError(t *testing.T) {
	w := httptest.NewRecorder()
	WriteJSONError(w, http.StatusBadRequest, "something went wrong")

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}

	ct := w.Header().Get("Content-Type")
	if ct != "application/json" {
		t.Errorf("expected Content-Type application/json, got %q", ct)
	}

	var body map[string]string
	if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
		t.Fatalf("failed to decode response body: %v", err)
	}
	if body["error"] != "something went wrong" {
		t.Errorf("expected error message %q, got %q", "something went wrong", body["error"])
	}
}

func TestWriteJSON(t *testing.T) {
	t.Run("map data", func(t *testing.T) {
		w := httptest.NewRecorder()
		data := map[string]string{"key": "value", "foo": "bar"}
		WriteJSON(w, http.StatusOK, data)

		if w.Code != http.StatusOK {
			t.Errorf("expected status %d, got %d", http.StatusOK, w.Code)
		}

		ct := w.Header().Get("Content-Type")
		if ct != "application/json" {
			t.Errorf("expected Content-Type application/json, got %q", ct)
		}

		var body map[string]string
		if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
			t.Fatalf("failed to decode response body: %v", err)
		}
		if body["key"] != "value" {
			t.Errorf("expected key=value, got key=%q", body["key"])
		}
		if body["foo"] != "bar" {
			t.Errorf("expected foo=bar, got foo=%q", body["foo"])
		}
	})

	t.Run("struct data", func(t *testing.T) {
		type respData struct {
			Name  string `json:"name"`
			Count int    `json:"count"`
		}
		w := httptest.NewRecorder()
		data := respData{Name: "test", Count: 42}
		WriteJSON(w, http.StatusCreated, data)

		if w.Code != http.StatusCreated {
			t.Errorf("expected status %d, got %d", http.StatusCreated, w.Code)
		}

		var body respData
		if err := json.NewDecoder(w.Body).Decode(&body); err != nil {
			t.Fatalf("failed to decode response body: %v", err)
		}
		if body.Name != "test" {
			t.Errorf("expected name=test, got name=%q", body.Name)
		}
		if body.Count != 42 {
			t.Errorf("expected count=42, got count=%d", body.Count)
		}
	})
}

func TestNewSecureCookie_Dev(t *testing.T) {
	cfg := &config.Config{
		Environment: "development",
	}

	cookie := NewSecureCookie(cfg, "session_id", "abc123", 3600)

	if cookie.Name != "session_id" {
		t.Errorf("expected name %q, got %q", "session_id", cookie.Name)
	}
	if cookie.Value != "abc123" {
		t.Errorf("expected value %q, got %q", "abc123", cookie.Value)
	}
	if cookie.MaxAge != 3600 {
		t.Errorf("expected maxAge %d, got %d", 3600, cookie.MaxAge)
	}
	if cookie.Path != "/" {
		t.Errorf("expected path %q, got %q", "/", cookie.Path)
	}
	if cookie.HttpOnly != true {
		t.Error("expected HttpOnly to be true")
	}
	if cookie.Secure != false {
		t.Error("expected Secure to be false in dev")
	}
	if cookie.SameSite != http.SameSiteLaxMode {
		t.Errorf("expected SameSite=Lax, got %v", cookie.SameSite)
	}
}

func TestNewSecureCookie_Prod(t *testing.T) {
	cfg := &config.Config{
		Environment: "production",
	}

	cookie := NewSecureCookie(cfg, "session_id", "abc123", 3600)

	if cookie.HttpOnly != true {
		t.Error("expected HttpOnly to be true")
	}
	if cookie.Secure != true {
		t.Error("expected Secure to be true in prod")
	}
	if cookie.SameSite != http.SameSiteLaxMode {
		t.Errorf("expected SameSite=Lax, got %v", cookie.SameSite)
	}
}

func TestGetClientIP_NoProxy(t *testing.T) {
	cfg := &config.Config{
		TrustedProxies: nil,
	}

	r := httptest.NewRequest(http.MethodGet, "/", nil)
	r.RemoteAddr = "192.168.1.100:12345"

	ip := GetClientIP(r, cfg)
	if ip != "192.168.1.100" {
		t.Errorf("expected 192.168.1.100, got %q", ip)
	}
}

func TestGetClientIP_TrustedProxy(t *testing.T) {
	cfg := &config.Config{
		TrustedProxies: []string{"10.0.0.1"},
	}

	r := httptest.NewRequest(http.MethodGet, "/", nil)
	r.RemoteAddr = "10.0.0.1:12345"
	r.Header.Set("X-Forwarded-For", "203.0.113.50, 10.0.0.1")

	ip := GetClientIP(r, cfg)
	if ip != "203.0.113.50" {
		t.Errorf("expected 203.0.113.50 (rightmost untrusted), got %q", ip)
	}
}

func TestGetClientIP_UntrustedProxy(t *testing.T) {
	cfg := &config.Config{
		TrustedProxies: []string{"10.0.0.1"},
	}

	r := httptest.NewRequest(http.MethodGet, "/", nil)
	r.RemoteAddr = "172.16.0.50:12345"
	r.Header.Set("X-Forwarded-For", "203.0.113.50")

	ip := GetClientIP(r, cfg)
	if ip != "172.16.0.50" {
		t.Errorf("expected RemoteAddr 172.16.0.50 when proxy is untrusted, got %q", ip)
	}
}

func TestGetClientIPSimple(t *testing.T) {
	t.Run("X-Forwarded-For first IP", func(t *testing.T) {
		r := httptest.NewRequest(http.MethodGet, "/", nil)
		r.RemoteAddr = "10.0.0.1:12345"
		r.Header.Set("X-Forwarded-For", "203.0.113.50, 10.0.0.1")

		ip := GetClientIPSimple(r)
		if ip != "203.0.113.50" {
			t.Errorf("expected first XFF IP 203.0.113.50, got %q", ip)
		}
	})

	t.Run("X-Real-IP fallback", func(t *testing.T) {
		r := httptest.NewRequest(http.MethodGet, "/", nil)
		r.RemoteAddr = "10.0.0.1:12345"
		r.Header.Set("X-Real-IP", "198.51.100.10")

		ip := GetClientIPSimple(r)
		if ip != "198.51.100.10" {
			t.Errorf("expected X-Real-IP 198.51.100.10, got %q", ip)
		}
	})

	t.Run("RemoteAddr fallback", func(t *testing.T) {
		r := httptest.NewRequest(http.MethodGet, "/", nil)
		r.RemoteAddr = "192.168.1.100:54321"

		ip := GetClientIPSimple(r)
		if ip != "192.168.1.100" {
			t.Errorf("expected RemoteAddr IP 192.168.1.100, got %q", ip)
		}
	})
}

func TestExtractIP(t *testing.T) {
	tests := []struct {
		name  string
		input string
		want  string
	}{
		{"IPv4 with port", "1.2.3.4:8080", "1.2.3.4"},
		{"IPv6 with port", "[::1]:8080", "::1"},
		{"bare IPv4", "1.2.3.4", "1.2.3.4"},
		{"bare IPv6", "::1", "::1"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := extractIP(tt.input)
			if got != tt.want {
				t.Errorf("extractIP(%q) = %q, want %q", tt.input, got, tt.want)
			}
		})
	}
}

func TestIsTrustedProxy(t *testing.T) {
	t.Run("CIDR match", func(t *testing.T) {
		if !isTrustedProxy("10.0.0.5", []string{"10.0.0.0/8"}) {
			t.Error("expected 10.0.0.5 to be trusted in 10.0.0.0/8")
		}
	})

	t.Run("exact IP match", func(t *testing.T) {
		if !isTrustedProxy("192.168.1.1", []string{"192.168.1.1"}) {
			t.Error("expected 192.168.1.1 to match exactly")
		}
	})

	t.Run("no match", func(t *testing.T) {
		if isTrustedProxy("172.16.0.1", []string{"10.0.0.0/8", "192.168.1.1"}) {
			t.Error("expected 172.16.0.1 to not be trusted")
		}
	})

	t.Run("empty list", func(t *testing.T) {
		if isTrustedProxy("10.0.0.1", nil) {
			t.Error("expected false for empty trusted proxy list")
		}
		if isTrustedProxy("10.0.0.1", []string{}) {
			t.Error("expected false for empty trusted proxy slice")
		}
	})
}
