package validation

import (
	"regexp"
	"strings"
	"unicode"
)

// ValidationError represents a validation failure
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func (e ValidationError) Error() string {
	return e.Message
}

// Username validation constants
const (
	UsernameMinLength = 3
	UsernameMaxLength = 20
)

// Reserved usernames that cannot be used
var reservedUsernames = map[string]bool{
	"admin":       true,
	"administrator": true,
	"root":        true,
	"system":      true,
	"support":     true,
	"help":        true,
	"mod":         true,
	"moderator":   true,
	"staff":       true,
	"nxtchess":    true,
	"chess":       true,
	"anonymous":   true,
	"guest":       true,
	"user":        true,
	"null":        true,
	"undefined":   true,
	"api":         true,
	"www":         true,
	"mail":        true,
	"email":       true,
	"test":        true,
	"demo":        true,
}

// Username must start with a letter, contain only alphanumeric and underscore
var usernameRegex = regexp.MustCompile(`^[a-zA-Z][a-zA-Z0-9_]*$`)

// ValidateUsername validates a username and returns an error if invalid
func ValidateUsername(username string) *ValidationError {
	// Trim whitespace
	username = strings.TrimSpace(username)

	// Check empty
	if username == "" {
		return &ValidationError{
			Field:   "username",
			Message: "Username is required",
		}
	}

	// Check length
	if len(username) < UsernameMinLength {
		return &ValidationError{
			Field:   "username",
			Message: "Username must be at least 3 characters",
		}
	}

	if len(username) > UsernameMaxLength {
		return &ValidationError{
			Field:   "username",
			Message: "Username must be at most 20 characters",
		}
	}

	// Check format (alphanumeric + underscore, starts with letter)
	if !usernameRegex.MatchString(username) {
		return &ValidationError{
			Field:   "username",
			Message: "Username must start with a letter and contain only letters, numbers, and underscores",
		}
	}

	// Check for consecutive underscores
	if strings.Contains(username, "__") {
		return &ValidationError{
			Field:   "username",
			Message: "Username cannot contain consecutive underscores",
		}
	}

	// Check reserved names (case-insensitive)
	if reservedUsernames[strings.ToLower(username)] {
		return &ValidationError{
			Field:   "username",
			Message: "This username is reserved",
		}
	}

	// Check for offensive patterns (basic check)
	lower := strings.ToLower(username)
	offensivePatterns := []string{"fuck", "shit", "ass", "dick", "porn", "sex", "nazi", "hitler"}
	for _, pattern := range offensivePatterns {
		if strings.Contains(lower, pattern) {
			return &ValidationError{
				Field:   "username",
				Message: "Username contains inappropriate content",
			}
		}
	}

	return nil
}

// SanitizeUsername normalizes a username for storage
func SanitizeUsername(username string) string {
	return strings.TrimSpace(username)
}

// ValidateEmail performs basic email validation
func ValidateEmail(email string) *ValidationError {
	email = strings.TrimSpace(email)

	if email == "" {
		return &ValidationError{
			Field:   "email",
			Message: "Email is required",
		}
	}

	// Basic format check
	atIdx := strings.LastIndex(email, "@")
	if atIdx < 1 || atIdx >= len(email)-1 {
		return &ValidationError{
			Field:   "email",
			Message: "Invalid email format",
		}
	}

	// Check domain has at least one dot
	domain := email[atIdx+1:]
	if !strings.Contains(domain, ".") {
		return &ValidationError{
			Field:   "email",
			Message: "Invalid email domain",
		}
	}

	return nil
}

// ValidateNonEmpty checks that a string field is not empty
func ValidateNonEmpty(value, field string) *ValidationError {
	if strings.TrimSpace(value) == "" {
		return &ValidationError{
			Field:   field,
			Message: field + " is required",
		}
	}
	return nil
}

// ValidateMaxLength checks that a string doesn't exceed max length
func ValidateMaxLength(value, field string, maxLen int) *ValidationError {
	if len(value) > maxLen {
		return &ValidationError{
			Field:   field,
			Message: field + " is too long",
		}
	}
	return nil
}

// IsPrintableASCII checks if string contains only printable ASCII characters
func IsPrintableASCII(s string) bool {
	for _, r := range s {
		if r > unicode.MaxASCII || !unicode.IsPrint(r) {
			return false
		}
	}
	return true
}
