package validation

import (
	"strings"
	"testing"
)

func TestValidateUsername(t *testing.T) {
	tests := []struct {
		name      string
		username  string
		wantError bool
	}{
		// Valid usernames
		{"valid simple", "alice", false},
		{"valid with numbers", "alice123", false},
		{"valid with underscore", "alice_bob", false},
		{"valid min length", "abc", false},
		{"valid max length", "abcdefghijklmnopqrst", false},
		{"valid single underscore", "a_b", false},
		{"valid starts with uppercase", "Alice", false},
		{"valid mixed case", "AlIcE", false},
		{"valid trailing number", "player1", false},
		{"valid underscore mid", "chess_master99", false},

		// Too short
		{"empty string", "", true},
		{"one char", "a", true},
		{"two chars", "ab", true},

		// Too long
		{"21 chars", "abcdefghijklmnopqrstu", true},
		{"30 chars", strings.Repeat("a", 30), true},

		// Bad format: starts with number
		{"starts with number", "1alice", true},
		{"starts with zero", "0player", true},

		// Bad format: special characters
		{"contains space", "alice bob", true},
		{"contains dash", "alice-bob", true},
		{"contains dot", "alice.bob", true},
		{"contains at", "alice@bob", true},
		{"contains exclamation", "alice!", true},
		{"contains hash", "alice#1", true},

		// Consecutive underscores
		{"double underscore", "alice__bob", true},
		{"triple underscore", "a___b", true},

		// Starts with underscore
		{"starts with underscore", "_alice", true},

		// Reserved names (case-insensitive)
		{"reserved admin", "admin", true},
		{"reserved Admin uppercase", "Admin", true},
		{"reserved ADMIN all caps", "ADMIN", true},
		{"reserved root", "root", true},
		{"reserved system", "system", true},
		{"reserved nxtchess", "nxtchess", true},
		{"reserved chess", "chess", true},
		{"reserved test", "test", true},

		// Offensive content (case-insensitive, substring match)
		{"offensive fuck", "fuck", true},
		{"offensive contains fuck", "abcfuckdef", true},
		{"offensive shit", "shit", true},
		{"offensive uppercase", "FUCK", true},
		{"offensive mixed case", "FuCk", true},
		{"offensive ass", "asshole", true},
		{"offensive dick", "dick", true},
		{"offensive porn", "porn", true},
		{"offensive sex", "sexyman", true},
		{"offensive nazi", "nazi", true},
		{"offensive hitler", "hitler", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateUsername(tt.username)
			if (err != nil) != tt.wantError {
				t.Errorf("ValidateUsername(%q) error = %v, wantError %v", tt.username, err, tt.wantError)
			}
		})
	}
}

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		name      string
		email     string
		wantError bool
	}{
		{"valid email", "user@example.com", false},
		{"valid with subdomain", "user@mail.example.com", false},
		{"valid with plus", "user+tag@example.com", false},
		{"valid with dots", "first.last@example.com", false},
		{"empty string", "", true},
		{"missing at sign", "userexample.com", true},
		{"missing domain dot", "user@examplecom", true},
		{"just at sign", "@", true},
		{"at sign only parts", "user@", true},
		{"no local part", "@example.com", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateEmail(tt.email)
			if (err != nil) != tt.wantError {
				t.Errorf("ValidateEmail(%q) error = %v, wantError %v", tt.email, err, tt.wantError)
			}
		})
	}
}

func TestValidateProfileIcon(t *testing.T) {
	validIcons := []string{
		"white-king", "white-queen", "white-rook", "white-bishop", "white-knight", "white-pawn",
		"black-king", "black-queen", "black-rook", "black-bishop", "black-knight", "black-pawn",
	}

	for _, icon := range validIcons {
		t.Run("valid_"+icon, func(t *testing.T) {
			err := ValidateProfileIcon(icon)
			if err != nil {
				t.Errorf("ValidateProfileIcon(%q) returned unexpected error: %v", icon, err)
			}
		})
	}

	invalidIcons := []struct {
		name string
		icon string
	}{
		{"empty string", ""},
		{"invalid piece", "white-amazon"},
		{"wrong format", "king"},
		{"wrong separator", "white_king"},
		{"uppercase", "White-King"},
		{"extra text", "white-king-extra"},
		{"random string", "foobar"},
	}

	for _, tt := range invalidIcons {
		t.Run("invalid_"+tt.name, func(t *testing.T) {
			err := ValidateProfileIcon(tt.icon)
			if err == nil {
				t.Errorf("ValidateProfileIcon(%q) expected error but got nil", tt.icon)
			}
		})
	}
}

func TestSanitizeUsername(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"no whitespace", "alice", "alice"},
		{"leading space", "  alice", "alice"},
		{"trailing space", "alice  ", "alice"},
		{"both sides", "  alice  ", "alice"},
		{"tabs", "\talice\t", "alice"},
		{"mixed whitespace", " \t alice \t ", "alice"},
		{"empty string", "", ""},
		{"only whitespace", "   ", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := SanitizeUsername(tt.input)
			if result != tt.expected {
				t.Errorf("SanitizeUsername(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestIsPrintableASCII(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected bool
	}{
		{"empty string", "", true},
		{"lowercase letters", "hello", true},
		{"uppercase letters", "HELLO", true},
		{"digits", "12345", true},
		{"printable symbols", "!@#$%^&*()", true},
		{"space", "hello world", true},
		{"tilde", "~", true},
		{"all printable range", " ~", true},
		{"tab control char", "hello\tworld", false},
		{"newline", "hello\nworld", false},
		{"null byte", "hello\x00world", false},
		{"bell char", "\x07", false},
		{"DEL char", "\x7f", false},
		{"unicode emoji", "hello\U0001F600", false},
		{"unicode letter", "caf\u00e9", false},
		{"unicode chinese", "\u4f60\u597d", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := IsPrintableASCII(tt.input)
			if result != tt.expected {
				t.Errorf("IsPrintableASCII(%q) = %v, want %v", tt.input, result, tt.expected)
			}
		})
	}
}

func TestValidateNonEmpty(t *testing.T) {
	tests := []struct {
		name      string
		value     string
		field     string
		wantError bool
	}{
		{"non-empty value", "hello", "name", false},
		{"empty value", "", "name", true},
		{"whitespace only value", "   ", "name", true}, // trimmed before check
		{"single char", "a", "field", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateNonEmpty(tt.value, tt.field)
			if (err != nil) != tt.wantError {
				t.Errorf("ValidateNonEmpty(%q, %q) error = %v, wantError %v", tt.value, tt.field, err, tt.wantError)
			}
		})
	}
}

func TestValidateMaxLength(t *testing.T) {
	tests := []struct {
		name      string
		value     string
		field     string
		maxLen    int
		wantError bool
	}{
		{"under max", "hello", "name", 10, false},
		{"at max", "hello", "name", 5, false},
		{"over max", "hello world", "name", 5, true},
		{"empty string", "", "name", 5, false},
		{"max zero with empty", "", "name", 0, false},
		{"max zero with content", "a", "name", 0, true},
		{"exactly one over", "abcdef", "name", 5, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateMaxLength(tt.value, tt.field, tt.maxLen)
			if (err != nil) != tt.wantError {
				t.Errorf("ValidateMaxLength(%q, %q, %d) error = %v, wantError %v", tt.value, tt.field, tt.maxLen, err, tt.wantError)
			}
		})
	}
}
