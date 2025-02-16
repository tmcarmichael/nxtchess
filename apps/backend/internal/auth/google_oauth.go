package auth

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/database"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/httpx"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/sessions"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/utils"
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
			httpx.WriteJSONError(w, http.StatusInternalServerError, "Google OAuth config not initialized")
			return
		}

		state, err := utils.GenerateRandomString(16)
		if err != nil {
			httpx.WriteJSONError(w, http.StatusInternalServerError, "Failed to generate state parameter")
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "oauth_state",
			Value:    state,
			Path:     "/",
			HttpOnly: true,
			Secure:   false,
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

		if sessionErr := sessions.StoreSession(sessionToken, googleUser.ID); sessionErr != nil {
			utils.AuthRedirectWithError(w, r, "Failed to store session: "+sessionErr.Error(), http.StatusInternalServerError, cfg)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "session_token",
			Value:    sessionToken,
			Path:     "/",
			HttpOnly: true,
			Secure:   false,
		})

		_, err = database.DB.Exec("INSERT INTO profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING", googleUser.ID)
		if err != nil {
			utils.AuthRedirectWithError(w, r, "Failed to insert user row: "+err.Error(), http.StatusInternalServerError, cfg)
			return
		}

		hasUsername, err := database.HasUsername(googleUser.ID)
		if err != nil {
			utils.AuthRedirectWithError(w, r, "Database error: "+err.Error(), http.StatusInternalServerError, cfg)
			return
		}

		if hasUsername {
			http.Redirect(w, r, cfg.FrontendURL+"/", http.StatusSeeOther)
		} else {
			http.Redirect(w, r, cfg.FrontendURL+"/username-setup", http.StatusSeeOther)
		}
	}
}
