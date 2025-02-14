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
)

var discordEndpoint = oauth2.Endpoint{
	AuthURL:  "https://discord.com/api/oauth2/authorize",
	TokenURL: "https://discord.com/api/oauth2/token",
}

var discordOAuthConfig *oauth2.Config

func InitDiscordOAuth(cfg *config.Config) {
	if cfg.DiscordClientID == "" || cfg.DiscordClientSecret == "" {
		log.Println("[InitDiscordOAuth] Discord ClientID/Secret not set. Skipping Discord OAuth init.")
		return
	}

	discordOAuthConfig = &oauth2.Config{
		ClientID:     cfg.DiscordClientID,
		ClientSecret: cfg.DiscordClientSecret,
		RedirectURL:  "http://localhost:8080/auth/discord/callback",
		Scopes:       []string{"identify"},
		Endpoint:     discordEndpoint,
	}
	log.Println("[InitDiscordOAuth] Discord OAuth config initialized.")
}

func DiscordLoginHandler(w http.ResponseWriter, r *http.Request) {
	if discordOAuthConfig == nil {
		http.Error(w, "Discord OAuth config not initialized", http.StatusInternalServerError)
		return
	}

	state, err := utils.GenerateRandomString(16)
	if err != nil {
		http.Error(w, "Failed to generate state parameter", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "oauth_state_discord",
		Value:    state,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // prod:true
	})

	authURL := discordOAuthConfig.AuthCodeURL(state)
	log.Printf("[DiscordLoginHandler] Redirecting user to: %s", authURL)
	http.Redirect(w, r, authURL, http.StatusTemporaryRedirect)
}

func DiscordCallbackHandler(w http.ResponseWriter, r *http.Request) {
	if discordOAuthConfig == nil {
		http.Error(w, "Discord OAuth config not initialized", http.StatusInternalServerError)
		return
	}

	stateParam := r.URL.Query().Get("state")
	if stateParam == "" {
		http.Error(w, "Missing OAuth state parameter", http.StatusBadRequest)
		return
	}

	stateCookie, err := r.Cookie("oauth_state_discord")
	if err != nil {
		http.Error(w, "Missing or invalid state cookie", http.StatusBadRequest)
		return
	}

	if stateParam != stateCookie.Value {
		http.Error(w, "Invalid OAuth state parameter", http.StatusBadRequest)
		return
	}

	code := r.URL.Query().Get("code")
	token, err := discordOAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		http.Error(w, "Failed to exchange token: "+err.Error(), http.StatusBadRequest)
		return
	}

	client := discordOAuthConfig.Client(context.Background(), token)

	resp, err := client.Get("https://discord.com/api/users/@me")
	if err != nil {
		http.Error(w, "Failed to get user info: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer resp.Body.Close()

	var discordUser struct {
		ID string `json:"id"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&discordUser); err != nil {
		http.Error(w, "Failed to decode Discord user info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("[DiscordCallbackHandler] User logged in with Discord ID: %s",
		discordUser.ID)

	sessionToken, err := sessions.GenerateSessionToken()
	if err != nil {
		http.Error(w, "Failed to generate session token", http.StatusInternalServerError)
		return
	}

	userID := fmt.Sprintf("discord_%s", discordUser.ID)
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
