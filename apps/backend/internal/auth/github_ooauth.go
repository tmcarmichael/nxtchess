package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/sessions"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/utils"
)

var githubOAuthConfig *oauth2.Config

func InitGitHubOAuth(cfg *config.Config) {
	callbackURL := cfg.BackendURL + "/auth/github/callback"

	githubOAuthConfig = &oauth2.Config{
		RedirectURL:  callbackURL,
		ClientID:     cfg.GitHubClientID,
		ClientSecret: cfg.GitHubClientSecret,
		Scopes:       []string{"read:user"},
		Endpoint:     github.Endpoint,
	}

	log.Printf("[InitGitHubOAuth] GitHub OAuth config initialized. Callback: %s\n", callbackURL)
}

func GitHubLoginHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if githubOAuthConfig == nil {
			http.Error(w, "GitHub OAuth config not initialized", http.StatusInternalServerError)
			return
		}

		state, err := utils.GenerateRandomString(16)
		if err != nil {
			http.Error(w, "Failed to generate state parameter", http.StatusInternalServerError)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "oauth_state_github",
			Value:    state,
			Path:     "/",
			HttpOnly: true,
			Secure:   false, // prod:true
		})

		authURL := githubOAuthConfig.AuthCodeURL(state)
		log.Printf("[GitHubLoginHandler] Redirecting user to GitHub OAuth: %s", authURL)
		http.Redirect(w, r, authURL, http.StatusTemporaryRedirect)
	}
}

func GitHubCallbackHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if githubOAuthConfig == nil {
			utils.AuthRedirectWithError(w, r, "GitHub OAuth config not initialized", http.StatusInternalServerError, cfg)
			return
		}

		stateParam := r.URL.Query().Get("state")
		if stateParam == "" {
			utils.AuthRedirectWithError(w, r, "Missing OAuth state parameter", http.StatusBadRequest, cfg)
			return
		}

		stateCookie, err := r.Cookie("oauth_state_github")
		if err != nil {
			utils.AuthRedirectWithError(w, r, "Missing or invalid state cookie", http.StatusBadRequest, cfg)
			return
		}

		if stateParam != stateCookie.Value {
			utils.AuthRedirectWithError(w, r, "Invalid OAuth state parameter", http.StatusBadRequest, cfg)
			return
		}

		code := r.URL.Query().Get("code")
		token, err := githubOAuthConfig.Exchange(context.Background(), code)
		if err != nil {
			utils.AuthRedirectWithError(w, r, "Failed to exchange token: "+err.Error(), http.StatusBadRequest, cfg)
			return
		}

		client := githubOAuthConfig.Client(context.Background(), token)
		resp, err := client.Get("https://api.github.com/user")
		if err != nil {
			utils.AuthRedirectWithError(w, r, "Failed to get user info: "+err.Error(), http.StatusBadRequest, cfg)
			return
		}
		defer resp.Body.Close()

		var ghUser struct {
			ID int `json:"id"`
		}
		if decodeErr := json.NewDecoder(resp.Body).Decode(&ghUser); decodeErr != nil {
			utils.AuthRedirectWithError(w, r, "Failed to decode user info: "+decodeErr.Error(), http.StatusInternalServerError, cfg)
			return
		}

		sessionToken, err := sessions.GenerateSessionToken()
		if err != nil {
			utils.AuthRedirectWithError(w, r, "Failed to generate session token: "+err.Error(), http.StatusInternalServerError, cfg)
			return
		}

		userID := fmt.Sprintf("github_%d", ghUser.ID)
		if err := sessions.StoreSession(sessionToken, userID); err != nil {
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
