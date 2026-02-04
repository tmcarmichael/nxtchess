package auth

import (
	"encoding/json"
	"fmt"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
	"golang.org/x/oauth2/google"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
)

var discordEndpoint = oauth2.Endpoint{
	AuthURL:  "https://discord.com/api/oauth2/authorize",
	TokenURL: "https://discord.com/api/oauth2/token",
}

// InitOAuthProviders initializes all OAuth providers
func InitOAuthProviders(cfg *config.Config) {
	initGoogle(cfg)
	initGitHub(cfg)
	initDiscord(cfg)
}

func initGoogle(cfg *config.Config) {
	if cfg.GoogleClientID == "" || cfg.GoogleClientSecret == "" {
		logger.Info("OAuth provider not configured, skipping", logger.F("provider", "Google"))
		return
	}

	RegisterProvider(&OAuthProvider{
		Name:        "Google",
		StateCookie: "oauth_state_google",
		UserInfoURL: "https://www.googleapis.com/oauth2/v2/userinfo",
		OAuthConfig: &oauth2.Config{
			RedirectURL:  cfg.BackendURL + "/auth/google/callback",
			ClientID:     cfg.GoogleClientID,
			ClientSecret: cfg.GoogleClientSecret,
			Scopes:       []string{"https://www.googleapis.com/auth/userinfo.profile"},
			Endpoint:     google.Endpoint,
		},
		AuthCodeOpts: []oauth2.AuthCodeOption{oauth2.AccessTypeOffline},
		ExtractUserID: func(body []byte) (string, error) {
			var user struct {
				ID string `json:"id"`
			}
			if err := json.Unmarshal(body, &user); err != nil {
				return "", err
			}
			if user.ID == "" {
				return "", fmt.Errorf("empty user ID")
			}
			return user.ID, nil
		},
	})
}

func initGitHub(cfg *config.Config) {
	if cfg.GitHubClientID == "" || cfg.GitHubClientSecret == "" {
		logger.Info("OAuth provider not configured, skipping", logger.F("provider", "GitHub"))
		return
	}

	RegisterProvider(&OAuthProvider{
		Name:        "GitHub",
		StateCookie: "oauth_state_github",
		UserInfoURL: "https://api.github.com/user",
		OAuthConfig: &oauth2.Config{
			RedirectURL:  cfg.BackendURL + "/auth/github/callback",
			ClientID:     cfg.GitHubClientID,
			ClientSecret: cfg.GitHubClientSecret,
			Scopes:       []string{"read:user"},
			Endpoint:     github.Endpoint,
		},
		ExtractUserID: func(body []byte) (string, error) {
			var user struct {
				ID int `json:"id"`
			}
			if err := json.Unmarshal(body, &user); err != nil {
				return "", err
			}
			if user.ID == 0 {
				return "", fmt.Errorf("empty user ID")
			}
			return fmt.Sprintf("github_%d", user.ID), nil
		},
	})
}

func initDiscord(cfg *config.Config) {
	if cfg.DiscordClientID == "" || cfg.DiscordClientSecret == "" {
		logger.Info("OAuth provider not configured, skipping", logger.F("provider", "Discord"))
		return
	}

	RegisterProvider(&OAuthProvider{
		Name:        "Discord",
		StateCookie: "oauth_state_discord",
		UserInfoURL: "https://discord.com/api/users/@me",
		OAuthConfig: &oauth2.Config{
			RedirectURL:  cfg.BackendURL + "/auth/discord/callback",
			ClientID:     cfg.DiscordClientID,
			ClientSecret: cfg.DiscordClientSecret,
			Scopes:       []string{"identify"},
			Endpoint:     discordEndpoint,
		},
		ExtractUserID: func(body []byte) (string, error) {
			var user struct {
				ID string `json:"id"`
			}
			if err := json.Unmarshal(body, &user); err != nil {
				return "", err
			}
			if user.ID == "" {
				return "", fmt.Errorf("empty user ID")
			}
			return fmt.Sprintf("discord_%s", user.ID), nil
		},
	})
}
