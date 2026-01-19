package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"golang.org/x/oauth2"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/database"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/httpx"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/sessions"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/utils"
)

// oauthTimeout is the timeout for OAuth token exchange and user info requests
const oauthTimeout = 30 * time.Second

// OAuthProvider defines the configuration for an OAuth provider
type OAuthProvider struct {
	Name           string
	StateCookie    string
	UserInfoURL    string
	OAuthConfig    *oauth2.Config
	AuthCodeOpts   []oauth2.AuthCodeOption
	ExtractUserID  func(body []byte) (string, error)
}

// providers stores initialized OAuth providers
var providers = make(map[string]*OAuthProvider)

// RegisterProvider registers an OAuth provider
func RegisterProvider(p *OAuthProvider) {
	providers[p.Name] = p
	log.Printf("[OAuth] Registered provider: %s", p.Name)
}

// GetProvider returns a registered provider by name
func GetProvider(name string) *OAuthProvider {
	return providers[name]
}

// LoginHandler creates a login handler for any OAuth provider
func LoginHandler(providerName string, cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		provider := GetProvider(providerName)
		if provider == nil || provider.OAuthConfig == nil {
			httpx.WriteJSONError(w, http.StatusInternalServerError, fmt.Sprintf("%s OAuth not configured", providerName))
			return
		}

		state, err := utils.GenerateRandomString(16)
		if err != nil {
			httpx.WriteJSONError(w, http.StatusInternalServerError, "Failed to generate state parameter")
			return
		}

		http.SetCookie(w, httpx.NewSecureCookie(cfg, provider.StateCookie, state, 600))

		authURL := provider.OAuthConfig.AuthCodeURL(state, provider.AuthCodeOpts...)
		log.Printf("[%sLoginHandler] Redirecting to OAuth: %s", providerName, authURL)

		http.Redirect(w, r, authURL, http.StatusTemporaryRedirect)
	}
}

// CallbackHandler creates a callback handler for any OAuth provider
func CallbackHandler(providerName string, cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		provider := GetProvider(providerName)
		if provider == nil || provider.OAuthConfig == nil {
			logger.Error("OAuth provider not configured", logger.F("provider", providerName))
			utils.AuthRedirectWithError(w, r, "Authentication service unavailable", http.StatusInternalServerError, cfg)
			return
		}

		// Validate state parameter
		stateParam := r.URL.Query().Get("state")
		if stateParam == "" {
			utils.AuthRedirectWithError(w, r, "Invalid authentication request", http.StatusBadRequest, cfg)
			return
		}

		stateCookie, err := r.Cookie(provider.StateCookie)
		if err != nil {
			utils.AuthRedirectWithError(w, r, "Authentication session expired", http.StatusBadRequest, cfg)
			return
		}
		if stateParam != stateCookie.Value {
			logger.Warn("OAuth state mismatch", logger.F("provider", providerName))
			utils.AuthRedirectWithError(w, r, "Invalid authentication request", http.StatusBadRequest, cfg)
			return
		}

		// Exchange code for token with timeout
		code := r.URL.Query().Get("code")
		ctx, cancel := context.WithTimeout(r.Context(), oauthTimeout)
		defer cancel()

		token, err := provider.OAuthConfig.Exchange(ctx, code)
		if err != nil {
			logger.Error("OAuth token exchange failed", logger.F(
				"provider", providerName,
				"error", err.Error(),
			))
			utils.AuthRedirectWithError(w, r, "Authentication failed. Please try again.", http.StatusBadRequest, cfg)
			return
		}

		// Fetch user info with timeout
		client := provider.OAuthConfig.Client(ctx, token)
		resp, err := client.Get(provider.UserInfoURL)
		if err != nil {
			logger.Error("OAuth user info fetch failed", logger.F(
				"provider", providerName,
				"error", err.Error(),
			))
			utils.AuthRedirectWithError(w, r, "Authentication failed. Please try again.", http.StatusBadRequest, cfg)
			return
		}
		defer resp.Body.Close()

		// Read response body
		var bodyBytes []byte
		bodyBytes, err = readBody(resp)
		if err != nil {
			logger.Error("OAuth user info read failed", logger.F(
				"provider", providerName,
				"error", err.Error(),
			))
			utils.AuthRedirectWithError(w, r, "Authentication failed. Please try again.", http.StatusInternalServerError, cfg)
			return
		}

		// Extract user ID using provider-specific logic
		userID, err := provider.ExtractUserID(bodyBytes)
		if err != nil {
			logger.Error("OAuth user ID extraction failed", logger.F(
				"provider", providerName,
				"error", err.Error(),
			))
			utils.AuthRedirectWithError(w, r, "Authentication failed. Please try again.", http.StatusInternalServerError, cfg)
			return
		}

		// Create session
		sessionToken, err := sessions.GenerateSessionToken()
		if err != nil {
			logger.Error("Session token generation failed", logger.F("error", err.Error()))
			utils.AuthRedirectWithError(w, r, "Authentication failed. Please try again.", http.StatusInternalServerError, cfg)
			return
		}

		if err := sessions.StoreSession(sessionToken, userID); err != nil {
			logger.Error("Session storage failed", logger.F(
				"userID", userID,
				"error", err.Error(),
			))
			utils.AuthRedirectWithError(w, r, "Authentication failed. Please try again.", http.StatusInternalServerError, cfg)
			return
		}

		http.SetCookie(w, httpx.NewSecureCookie(cfg, "session_token", sessionToken, 86400))

		// Upsert user profile (reuse the OAuth context for timeout)
		err = database.CreateProfileWithContext(ctx, userID)
		if err != nil {
			logger.Error("Profile creation failed", logger.F(
				"userID", userID,
				"error", err.Error(),
			))
			utils.AuthRedirectWithError(w, r, "Authentication failed. Please try again.", http.StatusInternalServerError, cfg)
			return
		}

		// Redirect based on username status (reuse the OAuth context)
		hasUsername, err := database.HasUsernameWithContext(ctx, userID)
		if err != nil {
			logger.Error("Username check failed", logger.F(
				"userID", userID,
				"error", err.Error(),
			))
			utils.AuthRedirectWithError(w, r, "Authentication failed. Please try again.", http.StatusInternalServerError, cfg)
			return
		}

		logger.Info("OAuth login successful", logger.F(
			"provider", providerName,
			"userID", userID,
			"hasUsername", hasUsername,
		))

		if hasUsername {
			http.Redirect(w, r, cfg.FrontendURL+"/", http.StatusSeeOther)
		} else {
			http.Redirect(w, r, cfg.FrontendURL+"/username-setup", http.StatusSeeOther)
		}
	}
}

// readBody reads the response body
func readBody(resp *http.Response) ([]byte, error) {
	var buf []byte
	buf = make([]byte, 0, 1024)
	for {
		tmp := make([]byte, 256)
		n, err := resp.Body.Read(tmp)
		buf = append(buf, tmp[:n]...)
		if err != nil {
			break
		}
	}
	return buf, nil
}

// Helper to extract string ID from JSON
func extractStringID(body []byte, field string) (string, error) {
	var data map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		return "", err
	}

	val, ok := data[field]
	if !ok {
		return "", fmt.Errorf("field %s not found", field)
	}

	switch v := val.(type) {
	case string:
		return v, nil
	case float64:
		return fmt.Sprintf("%.0f", v), nil
	default:
		return fmt.Sprintf("%v", v), nil
	}
}
