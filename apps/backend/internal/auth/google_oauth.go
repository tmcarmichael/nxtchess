package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/sessions"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var googleOAuthConfig *oauth2.Config

func InitGoogleOAuth(cfg *config.Config) {
	googleOAuthConfig = &oauth2.Config{
		RedirectURL:  "http://localhost:8080/auth/google/callback",
		ClientID:     cfg.GoogleClientID,
		ClientSecret: cfg.GoogleClientSecret,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}
	log.Println("[InitGoogleOAuth] Google OAuth config initialized.")
}

func GoogleLoginHandler(w http.ResponseWriter, r *http.Request) {
	if googleOAuthConfig == nil {
		http.Error(w, "OAuth config not initialized", http.StatusInternalServerError)
		return
	}

	state, err := generateRandomString(16)
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
	log.Printf("[GoogleLoginHandler] Redirecting user to: %s", authURL)
	http.Redirect(w, r, authURL, http.StatusTemporaryRedirect)
}

func GoogleCallbackHandler(w http.ResponseWriter, r *http.Request) {
	if googleOAuthConfig == nil {
		http.Error(w, "OAuth config not initialized", http.StatusInternalServerError)
		return
	}

	stateParam := r.URL.Query().Get("state")
	if stateParam == "" {
		http.Error(w, "Missing OAuth state parameter", http.StatusBadRequest)
		return
	}

	stateCookie, err := r.Cookie("oauth_state")
	if err != nil {
		http.Error(w, "Missing or invalid state cookie", http.StatusBadRequest)
		return
	}

	if stateParam != stateCookie.Value {
		http.Error(w, "Invalid OAuth state parameter", http.StatusBadRequest)
		return
	}

	code := r.URL.Query().Get("code")
	token, err := googleOAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		http.Error(w, "Failed to exchange token: "+err.Error(), http.StatusBadRequest)
		return
	}

	client := googleOAuthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		http.Error(w, "Failed to get user info: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer resp.Body.Close()

	var googleUser struct {
		ID string `json:"id"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		http.Error(w, "Failed to decode user info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("[GoogleCallbackHandler] User logged in with Google ID: %s", googleUser.ID)

	sessionToken, err := sessions.GenerateSessionToken()
	if err != nil {
		http.Error(w, "Failed to generate session token", http.StatusInternalServerError)
		return
	}

	sessions.StoreSession(sessionToken, googleUser.ID)

	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    sessionToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // prod:true
	})

	http.Redirect(w, r, "http://localhost:5173/", http.StatusSeeOther)
}

func generateRandomString(n int) (string, error) {
	b := make([]byte, n)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		return "", fmt.Errorf("generateRandomString: %w", err)
	}
	return base64.URLEncoding.EncodeToString(b), nil
}
