package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"golang.org/x/oauth2"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/sessions"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/utils"
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

	callbackURL := cfg.BackendURL + "/auth/discord/callback"

	discordOAuthConfig = &oauth2.Config{
		ClientID:     cfg.DiscordClientID,
		ClientSecret: cfg.DiscordClientSecret,
		RedirectURL:  callbackURL,
		Scopes:       []string{"identify"},
		Endpoint:     discordEndpoint,
	}

	log.Printf("[InitDiscordOAuth] Discord OAuth config initialized. Callback: %s\n", callbackURL)
}

func DiscordLoginHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
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
		log.Printf("[DiscordLoginHandler] Redirecting user to Discord OAuth: %s", authURL)

		http.Redirect(w, r, authURL, http.StatusTemporaryRedirect)
	}
}

func DiscordCallbackHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if discordOAuthConfig == nil {
			utils.AuthRedirectWithError(w, r, "Discord OAuth config not initialized", http.StatusInternalServerError, cfg)
			return
		}

		stateParam := r.URL.Query().Get("state")
		if stateParam == "" {
			utils.AuthRedirectWithError(w, r, "Missing OAuth state parameter", http.StatusBadRequest, cfg)
			return
		}

		stateCookie, err := r.Cookie("oauth_state_discord")
		if err != nil {
			utils.AuthRedirectWithError(w, r, "Missing or invalid state cookie", http.StatusBadRequest, cfg)
			return
		}
		if stateParam != stateCookie.Value {
			utils.AuthRedirectWithError(w, r, "Invalid OAuth state parameter", http.StatusBadRequest, cfg)
			return
		}

		code := r.URL.Query().Get("code")
		token, err := discordOAuthConfig.Exchange(context.Background(), code)
		if err != nil {
			utils.AuthRedirectWithError(w, r, "Failed to exchange token: "+err.Error(), http.StatusBadRequest, cfg)
			return
		}

		discordUserURL := "https://discord.com/api/users/@me"
		client := discordOAuthConfig.Client(context.Background(), token)
		resp, err := client.Get(discordUserURL)
		if err != nil {
			utils.AuthRedirectWithError(w, r, "Failed to get user info: "+err.Error(), http.StatusBadRequest, cfg)
			return
		}
		defer resp.Body.Close()

		var discordUser struct {
			ID string `json:"id"`
		}
		if decodeErr := json.NewDecoder(resp.Body).Decode(&discordUser); decodeErr != nil {
			utils.AuthRedirectWithError(w, r, "Failed to decode Discord user info: "+decodeErr.Error(), http.StatusInternalServerError, cfg)
			return
		}

		sessionToken, err := sessions.GenerateSessionToken()
		if err != nil {
			utils.AuthRedirectWithError(w, r, "Failed to generate session token: "+err.Error(), http.StatusInternalServerError, cfg)
			return
		}

		userID := fmt.Sprintf("discord_%s", discordUser.ID)

		if storeErr := sessions.StoreSession(sessionToken, userID); storeErr != nil {
			utils.AuthRedirectWithError(w, r, "Failed to store session: "+storeErr.Error(), http.StatusInternalServerError, cfg)
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
