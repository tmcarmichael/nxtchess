package ws

import (
	"encoding/json"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
)

const (
	// Time allowed to write a message to the peer
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer
	pongWait = 60 * time.Second

	// Send pings to peer with this period (must be less than pongWait)
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer
	maxMessageSize = 4096

	// Message rate limiting
	msgRateLimit    = 30               // max messages per interval
	msgRateInterval = 10 * time.Second // rate limit window
	msgRateBurst    = 10               // burst allowance
)

// MessageRateLimiter tracks message rates per client using token bucket
type MessageRateLimiter struct {
	mu          sync.Mutex
	tokens      int
	maxTokens   int
	refillRate  int           // tokens per interval
	interval    time.Duration // refill interval
	lastRefill  time.Time
	violations  int       // count of rate limit violations
	blockedAt   time.Time // when client was blocked (if at all)
	blockPeriod time.Duration
}

// NewMessageRateLimiter creates a rate limiter for WebSocket messages
func NewMessageRateLimiter() *MessageRateLimiter {
	return &MessageRateLimiter{
		tokens:      msgRateBurst,
		maxTokens:   msgRateBurst,
		refillRate:  msgRateLimit,
		interval:    msgRateInterval,
		lastRefill:  time.Now(),
		blockPeriod: 30 * time.Second, // block for 30s after repeated violations
	}
}

// Allow checks if a message should be allowed
func (r *MessageRateLimiter) Allow() bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now()

	// Check if client is blocked
	if !r.blockedAt.IsZero() && now.Sub(r.blockedAt) < r.blockPeriod {
		return false
	}

	// Refill tokens based on elapsed time
	elapsed := now.Sub(r.lastRefill)
	if elapsed >= r.interval {
		tokensToAdd := int(elapsed/r.interval) * r.refillRate
		r.tokens += tokensToAdd
		if r.tokens > r.maxTokens {
			r.tokens = r.maxTokens
		}
		r.lastRefill = now

		// Reset violations if tokens are full (client behaved)
		if r.tokens == r.maxTokens {
			r.violations = 0
			r.blockedAt = time.Time{}
		}
	}

	if r.tokens > 0 {
		r.tokens--
		return true
	}

	// Rate limit exceeded
	r.violations++

	// Block client after 3 violations
	if r.violations >= 3 {
		r.blockedAt = now
		logger.Warn("Client blocked for repeated rate limit violations")
	}

	return false
}

// IsBlocked returns true if the client is currently blocked
func (r *MessageRateLimiter) IsBlocked() bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	return !r.blockedAt.IsZero() && time.Since(r.blockedAt) < r.blockPeriod
}

// Client represents a single WebSocket connection
type Client struct {
	ID        string
	UserID    string // Empty for anonymous users
	Username  string // Empty for anonymous users
	IP        string // Client IP for connection limiting
	Hub       *Hub
	Conn      *websocket.Conn
	Send      chan []byte
	done      chan struct{} // closed when client is shutting down
	closeOnce sync.Once

	// Current game this client is in (if any)
	GameID string
	mu     sync.RWMutex

	// Rate limiting for incoming messages
	rateLimiter *MessageRateLimiter

	// Game creation cooldown tracking
	lastGameCreatedAt time.Time
}

// NewClient creates a new client
func NewClient(id string, userID string, hub *Hub, conn *websocket.Conn) *Client {
	return &Client{
		ID:          id,
		UserID:      userID,
		Hub:         hub,
		Conn:        conn,
		Send:        make(chan []byte, 256),
		done:        make(chan struct{}),
		rateLimiter: NewMessageRateLimiter(),
	}
}

// Close signals the client to stop accepting messages.
// Safe to call multiple times from any goroutine.
func (c *Client) Close() {
	c.closeOnce.Do(func() {
		close(c.done)
	})
}

// GetGameID returns the current game ID (thread-safe)
func (c *Client) GetGameID() string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.GameID
}

// SetGameID sets the current game ID (thread-safe)
func (c *Client) SetGameID(gameID string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.GameID = gameID
}

// GetLastGameCreatedAt returns the timestamp of the last game creation (thread-safe)
func (c *Client) GetLastGameCreatedAt() time.Time {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.lastGameCreatedAt
}

// SetLastGameCreatedAt records the timestamp of a game creation (thread-safe)
func (c *Client) SetLastGameCreatedAt(t time.Time) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.lastGameCreatedAt = t
}

// ReadPump pumps messages from the WebSocket connection to the hub
func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(maxMessageSize)
	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				logger.Warn("WebSocket unexpected close", logger.F("clientId", c.ID, "error", err.Error()))
			}
			break
		}

		// Check message rate limit
		if !c.rateLimiter.Allow() {
			if c.rateLimiter.IsBlocked() {
				logger.Warn("Client blocked for rate limit abuse", logger.F("clientId", c.ID, "ip", c.IP))
				c.SendMessage(NewErrorMessage("RATE_LIMITED", "Too many messages. You have been temporarily blocked."))
				// Close connection for blocked clients
				break
			}
			logger.Debug("Message rate limited", logger.F("clientId", c.ID))
			c.SendMessage(NewErrorMessage("RATE_LIMITED", "Too many messages. Please slow down."))
			continue
		}

		// Parse the message
		var msg ClientMessage
		if err := json.Unmarshal(message, &msg); err != nil {
			logger.Warn("Invalid message format", logger.F("clientId", c.ID, "error", err.Error()))
			c.SendMessage(NewErrorMessage("INVALID_FORMAT", "Invalid message format"))
			continue
		}

		// Handle the message
		c.Hub.HandleMessage(c, &msg)
	}
}

// WritePump pumps messages from the hub to the WebSocket connection
func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case <-c.done:
			c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
			return

		case message := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				logger.Debug("WritePump write error", logger.F("clientId", c.ID, "error", err.Error()))
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				logger.Debug("WritePump ping error", logger.F("clientId", c.ID, "error", err.Error()))
				return
			}
		}
	}
}

// trySend attempts to send data to the client's send buffer.
// Returns immediately if the client is closed or the buffer is full.
func (c *Client) trySend(data []byte) {
	select {
	case <-c.done:
	case c.Send <- data:
	default:
		logger.Warn("Client send buffer full", logger.F("clientId", c.ID))
	}
}

// SendMessage sends a server message to this client
func (c *Client) SendMessage(msg *ServerMessage) {
	data, err := json.Marshal(msg)
	if err != nil {
		logger.Error("Failed to marshal message", logger.F("error", err.Error()))
		return
	}
	c.trySend(data)
}

// SendJSON sends raw JSON data to this client
func (c *Client) SendJSON(data []byte) {
	c.trySend(data)
}
