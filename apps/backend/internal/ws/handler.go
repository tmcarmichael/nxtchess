package ws

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/sessions"
)

// Handler handles WebSocket connections
type Handler struct {
	hub      *Hub
	cfg      *config.Config
	upgrader websocket.Upgrader
}

// NewHandler creates a new WebSocket handler
func NewHandler(hub *Hub, cfg *config.Config) *Handler {
	return &Handler{
		hub: hub,
		cfg: cfg,
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				origin := r.Header.Get("Origin")
				// Allow configured frontend URL
				if origin == cfg.FrontendURL {
					return true
				}
				// In development, allow localhost variants
				if !cfg.IsProd() {
					return origin == "http://localhost:5173" ||
						origin == "http://127.0.0.1:5173" ||
						origin == ""
				}
				return false
			},
		},
	}
}

// generateClientID creates a random client ID
func generateClientID() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

// ServeHTTP handles the WebSocket upgrade request
func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Try to get user ID from session cookie (optional - allows anonymous play)
	var userID string
	if cookie, err := r.Cookie("session_token"); err == nil {
		if id, ok := sessions.GetSessionUserID(cookie.Value); ok {
			userID = id
		}
	}

	// Upgrade to WebSocket
	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Error("WebSocket upgrade failed", logger.F("error", err.Error()))
		return
	}

	// Create client
	clientID := generateClientID()
	client := NewClient(clientID, userID, h.hub, conn)

	// Register client with hub
	h.hub.Register <- client

	logger.Info("WebSocket connection established", logger.F(
		"clientId", clientID,
		"userId", userID,
		"remoteAddr", r.RemoteAddr,
	))

	// Start client pumps in goroutines
	go client.WritePump()
	go client.ReadPump()
}

// GetHub returns the hub instance
func (h *Handler) GetHub() *Hub {
	return h.hub
}
