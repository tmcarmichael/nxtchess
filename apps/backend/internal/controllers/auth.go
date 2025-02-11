package controllers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var googleOAuthConfig = &oauth2.Config{
	RedirectURL:  "http://localhost:8080/auth/google/callback",
	ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
	ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
	Scopes: []string{
		"https://www.googleapis.com/auth/userinfo.profile",
	},
	Endpoint: google.Endpoint,
}

// TODO: Generate a secure random string for prod
var oauthStateString = "mock_random_string"

type OAuthController struct {
	// TODO Supabase controller
}

func NewOAuthController() *OAuthController {
	return &OAuthController{}
}

// GET /auth/google
// 302 Redirect user to Google OAuth 2.0
func (oc *OAuthController) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	url := googleOAuthConfig.AuthCodeURL(oauthStateString, oauth2.AccessTypeOffline)
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// GET /auth/google/callback
// Exchange code for a token, pass to Supabase, set a secure session cookie.
func (oc *OAuthController) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	state := r.URL.Query().Get("state")
	if state != oauthStateString {
		http.Error(w, "Invalid state parameter", http.StatusBadRequest)
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
		http.Error(w, "Failed to get Google user info: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer resp.Body.Close()

	// No PII, corrolate user id with Supabase table.
	var googleUser struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		http.Error(w, "Failed to decode user info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("Google OAuth success. Google user ID: %s\n", googleUser.ID)

	// TODO: Supabase upsert
	// supabaseUserID, err := oc.supabaseClient.AuthUpsertWithGoogleID(googleUser.ID)
	// if err != nil {}

	// Secure HTTP-only session cookie, JWT from Supabase
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "some-generated-session-id-or-supabase-jwt",
		Path:     "/",
		HttpOnly: true,
		Secure:   true, // https
		SameSite: http.SameSiteLaxMode,
	})

	http.Redirect(w, r, "/", http.StatusSeeOther)
}
