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
)

// Client represents a single WebSocket connection
type Client struct {
	ID     string
	UserID string // Empty for anonymous users
	Hub    *Hub
	Conn   *websocket.Conn
	Send   chan []byte

	// Current game this client is in (if any)
	GameID string
	mu     sync.RWMutex
}

// NewClient creates a new client
func NewClient(id string, userID string, hub *Hub, conn *websocket.Conn) *Client {
	return &Client{
		ID:     id,
		UserID: userID,
		Hub:    hub,
		Conn:   conn,
		Send:   make(chan []byte, 256),
	}
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
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// Hub closed the channel
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Drain queued messages to same write
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// SendMessage sends a server message to this client
func (c *Client) SendMessage(msg *ServerMessage) {
	data, err := json.Marshal(msg)
	if err != nil {
		logger.Error("Failed to marshal message", logger.F("error", err.Error()))
		return
	}

	select {
	case c.Send <- data:
	default:
		// Buffer full, client is slow
		logger.Warn("Client send buffer full", logger.F("clientId", c.ID))
	}
}

// SendJSON sends raw JSON data to this client
func (c *Client) SendJSON(data []byte) {
	select {
	case c.Send <- data:
	default:
		logger.Warn("Client send buffer full", logger.F("clientId", c.ID))
	}
}
