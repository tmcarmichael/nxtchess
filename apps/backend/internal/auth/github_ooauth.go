package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/sessions"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/utils"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
)

var githubOAuthConfig *oauth2.Config

func InitGitHubOAuth(cfg *config.Config) {
	githubOAuthConfig = &oauth2.Config{
		ClientID:     cfg.GitHubClientID,
		ClientSecret: cfg.GitHubClientSecret,
		RedirectURL:  "http://localhost:8080/auth/github/callback",
		Scopes:       []string{"read:user"},
		Endpoint:     github.Endpoint,
	}
	log.Println("[InitGitHubOAuth] GitHub OAuth config initialized.")
}

func GitHubLoginHandler(w http.ResponseWriter, r *http.Request) {
	if githubOAuthConfig == nil {
		http.Error(w, "OAuth config not initialized for GitHub", http.StatusInternalServerError)
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
	log.Printf("[GitHubLoginHandler] Redirecting user to: %s", authURL)
	http.Redirect(w, r, authURL, http.StatusTemporaryRedirect)
}

func GitHubCallbackHandler(w http.ResponseWriter, r *http.Request) {
	if githubOAuthConfig == nil {
		http.Error(w, "OAuth config not initialized for GitHub", http.StatusInternalServerError)
		return
	}

	stateParam := r.URL.Query().Get("state")
	if stateParam == "" {
		http.Error(w, "Missing OAuth state parameter", http.StatusBadRequest)
		return
	}

	stateCookie, err := r.Cookie("oauth_state_github")
	if err != nil {
		http.Error(w, "Missing or invalid state cookie", http.StatusBadRequest)
		return
	}

	if stateParam != stateCookie.Value {
		http.Error(w, "Invalid OAuth state parameter", http.StatusBadRequest)
		return
	}

	code := r.URL.Query().Get("code")
	token, err := githubOAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		http.Error(w, "Failed to exchange token: "+err.Error(), http.StatusBadRequest)
		return
	}

	client := githubOAuthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://api.github.com/user")
	if err != nil {
		http.Error(w, "Failed to get user info: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer resp.Body.Close()

	var ghUser struct {
		ID int `json:"id"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&ghUser); err != nil {
		http.Error(w, "Failed to decode user info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("[GitHubCallbackHandler] User logged in with GitHub ID: %d.", ghUser.ID)

	sessionToken, err := sessions.GenerateSessionToken()
	if err != nil {
		http.Error(w, "Failed to generate session token", http.StatusInternalServerError)
		return
	}

	userID := fmt.Sprintf("github_%d", ghUser.ID)
	sessions.StoreSession(sessionToken, userID)

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    sessionToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // prod:true
	})

	http.Redirect(w, r, "http://localhost:5173/", http.StatusSeeOther)
}
