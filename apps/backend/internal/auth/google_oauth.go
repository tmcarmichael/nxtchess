package auth

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/sessions"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/utils"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var googleOAuthConfig *oauth2.Config

func InitGoogleOAuth(cfg *config.Config) {
	callbackURL := cfg.BackendURL + "/auth/google/callback"
	googleScopeSource := "https://www.googleapis.com/auth/userinfo.profile"

	googleOAuthConfig = &oauth2.Config{
		RedirectURL:  callbackURL,
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		Scopes:       []string{googleScopeSource},
		Endpoint:     google.Endpoint,
	}

	log.Printf("[InitGoogleOAuth] Google OAuth config initialized. Callback: %s\n", callbackURL)
}

func GoogleLoginHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if googleOAuthConfig == nil {
			http.Error(w, "Google OAuth config not initialized", http.StatusInternalServerError)
			return
		}

		state, err := utils.GenerateRandomString(16)
		if err != nil {
			http.Error(w, "Failed to generate state parameter", http.StatusInternalServerError)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "oauth_state",
			Value:    state,
			Path:     "/",
			HttpOnly: true,
			Secure:   false, // prod:true
		})

		authURL := googleOAuthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
		log.Printf("[GoogleLoginHandler] Redirecting user to Google OAuth: %s", authURL)

		http.Redirect(w, r, authURL, http.StatusTemporaryRedirect)
	}
}

func GoogleCallbackHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if googleOAuthConfig == nil {
			utils.AuthRedirectWithError(w, r, "OAuth config not initialized", http.StatusInternalServerError, cfg)
			return
		}

		stateParam := r.URL.Query().Get("state")
		if stateParam == "" {
			utils.AuthRedirectWithError(w, r, "Missing OAuth state parameter", http.StatusBadRequest, cfg)
			return
		}

		stateCookie, err := r.Cookie("oauth_state")
		if err != nil {
			utils.AuthRedirectWithError(w, r, "Missing or invalid state cookie", http.StatusBadRequest, cfg)
			return
		}
		if stateParam != stateCookie.Value {
			utils.AuthRedirectWithError(w, r, "Invalid OAuth state parameter", http.StatusBadRequest, cfg)
			return
		}

		code := r.URL.Query().Get("code")
		token, err := googleOAuthConfig.Exchange(context.Background(), code)
		if err != nil {
			utils.AuthRedirectWithError(w, r, "Failed to exchange token: "+err.Error(), http.StatusBadRequest, cfg)
			return
		}

		client := googleOAuthConfig.Client(context.Background(), token)
		resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
		if err != nil {
			utils.AuthRedirectWithError(w, r, "Failed to get user info: "+err.Error(), http.StatusBadRequest, cfg)
			return
		}
		defer resp.Body.Close()

		var googleUser struct {
			ID string `json:"id"`
		}
		if decodeErr := json.NewDecoder(resp.Body).Decode(&googleUser); decodeErr != nil {
			utils.AuthRedirectWithError(w, r, "Failed to decode user info: "+decodeErr.Error(), http.StatusInternalServerError, cfg)
			return
		}

		sessionToken, err := sessions.GenerateSessionToken()
		if err != nil {
			utils.AuthRedirectWithError(w, r, "Failed to generate session token: "+err.Error(), http.StatusInternalServerError, cfg)
			return
		}

		if err := sessions.StoreSession(sessionToken, googleUser.ID); err != nil {
			utils.AuthRedirectWithError(w, r, "Failed to store session: "+err.Error(), http.StatusInternalServerError, cfg)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "session_token",
			Value:    sessionToken,
			Path:     "/",
			HttpOnly: true,
			Secure:   false, // prod:true
		})

		http.Redirect(w, r, cfg.FrontendURL+"/", http.StatusSeeOther)
	}
}
