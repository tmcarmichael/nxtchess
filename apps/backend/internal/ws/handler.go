package ws

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/config"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/httpx"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/sessions"
)

// ConnectionLimiter tracks WebSocket connections per IP
type ConnectionLimiter struct {
	mu          sync.Mutex
	connections map[string]int
	maxPerIP    int
	rateLimit   map[string]time.Time // last connection attempt per IP
	ratePeriod  time.Duration        // minimum time between connections
}

// NewConnectionLimiter creates a connection limiter
func NewConnectionLimiter(maxPerIP int, ratePeriod time.Duration) *ConnectionLimiter {
	cl := &ConnectionLimiter{
		connections: make(map[string]int),
		maxPerIP:    maxPerIP,
		rateLimit:   make(map[string]time.Time),
		ratePeriod:  ratePeriod,
	}
	go cl.cleanupLoop()
	return cl
}

// cleanupLoop removes stale rate limit and connection entries
func (cl *ConnectionLimiter) cleanupLoop() {
	ticker := time.NewTicker(5 * time.Minute)
	for range ticker.C {
		cl.mu.Lock()
		cutoff := time.Now().Add(-5 * time.Minute)
		for ip, t := range cl.rateLimit {
			if t.Before(cutoff) {
				delete(cl.rateLimit, ip)
				delete(cl.connections, ip)
			}
		}
		cl.mu.Unlock()
	}
}

// TryConnect attempts to allow a new connection from the given IP
func (cl *ConnectionLimiter) TryConnect(ip string) bool {
	cl.mu.Lock()
	defer cl.mu.Unlock()

	// Check rate limit
	if lastAttempt, exists := cl.rateLimit[ip]; exists {
		if time.Since(lastAttempt) < cl.ratePeriod {
			return false
		}
	}
	cl.rateLimit[ip] = time.Now()

	// Check connection limit
	if cl.connections[ip] >= cl.maxPerIP {
		return false
	}

	cl.connections[ip]++
	return true
}

// Disconnect decrements the connection count for an IP
func (cl *ConnectionLimiter) Disconnect(ip string) {
	cl.mu.Lock()
	defer cl.mu.Unlock()
	if cl.connections[ip] > 0 {
		cl.connections[ip]--
	}
	if cl.connections[ip] == 0 {
		delete(cl.connections, ip)
	}
}

// Handler handles WebSocket connections
type Handler struct {
	hub       *Hub
	cfg       *config.Config
	upgrader  websocket.Upgrader
	connLimit *ConnectionLimiter
}

// NewHandler creates a new WebSocket handler
func NewHandler(hub *Hub, cfg *config.Config) *Handler {
	// Allow max 5 connections per IP, with 200ms between connection attempts
	connLimit := NewConnectionLimiter(5, 200*time.Millisecond)

	// Set up disconnect callback for connection limiting
	hub.SetOnDisconnect(connLimit.Disconnect)

	return &Handler{
		hub:       hub,
		cfg:       cfg,
		connLimit: connLimit,
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
	// Get client IP for rate limiting (validates trusted proxy headers)
	clientIP := httpx.GetClientIP(r, h.cfg)

	// Check connection rate limit
	if !h.connLimit.TryConnect(clientIP) {
		logger.Warn("WebSocket connection rate limited", logger.F("ip", clientIP))
		http.Error(w, "Too many connections", http.StatusTooManyRequests)
		return
	}

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
		h.connLimit.Disconnect(clientIP) // Release the connection slot
		return
	}

	// Create client
	clientID := generateClientID()
	client := NewClient(clientID, userID, h.hub, conn)
	client.IP = clientIP // Store IP for disconnection tracking

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
