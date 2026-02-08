package ws

import (
	"encoding/json"
	"sync"
	"time"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/metrics"
)

// Hub maintains the set of active clients and broadcasts messages
type Hub struct {
	// Registered clients
	clients map[string]*Client
	mu      sync.RWMutex

	// Register requests from clients
	Register chan *Client

	// Unregister requests from clients
	Unregister chan *Client

	// Game manager for game-related operations
	games *GameManager

	// Lobby subscribers
	lobbySubscribers map[string]*Client
	lobbyMu          sync.RWMutex

	// Connection limiter callback for cleanup
	onDisconnect func(ip string)

	// Lobby broadcast batching
	lobbyUpdateCh chan LobbyUpdateData
	stopBatcher   chan struct{}
}

// NewHub creates a new Hub. onDisconnect is called when a client disconnects (may be nil).
func NewHub(onDisconnect func(ip string)) *Hub {
	h := &Hub{
		clients:          make(map[string]*Client),
		Register:         make(chan *Client),
		Unregister:       make(chan *Client),
		lobbySubscribers: make(map[string]*Client),
		lobbyUpdateCh:    make(chan LobbyUpdateData, 100),
		stopBatcher:      make(chan struct{}),
		onDisconnect:     onDisconnect,
	}
	h.games = NewGameManager(h)
	go h.runLobbyBatcher()
	return h
}

// Run starts the hub's main loop
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			h.clients[client.ID] = client
			clientCount := len(h.clients)
			h.mu.Unlock()
			metrics.WSConnectionsActive.Inc()
			logger.Info("Client connected", logger.F("clientId", client.ID, "totalClients", clientCount))

		case client := <-h.Unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				metrics.WSConnectionsActive.Dec()

				// Clean up lobby subscription BEFORE closing Send channel
				// to prevent BroadcastLobbyUpdate from writing to a closed channel
				h.lobbyMu.Lock()
				delete(h.lobbySubscribers, client.ID)
				h.lobbyMu.Unlock()

				close(client.Send)

				// Handle disconnect from any active game
				if gameID := client.GetGameID(); gameID != "" {
					h.games.HandleDisconnect(client, gameID)
				}

				// Notify connection limiter
				if h.onDisconnect != nil && client.IP != "" {
					h.onDisconnect(client.IP)
				}
			}
			clientCount := len(h.clients)
			h.mu.Unlock()
			logger.Info("Client disconnected", logger.F("clientId", client.ID, "totalClients", clientCount))
		}
	}
}

// GetClient returns a client by ID
func (h *Hub) GetClient(id string) *Client {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return h.clients[id]
}

// GetClientCount returns the number of connected clients
func (h *Hub) GetClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

// SubscribeLobby adds a client to the lobby subscriber list and sends the current game list
func (h *Hub) SubscribeLobby(client *Client) {
	h.lobbyMu.Lock()
	h.lobbySubscribers[client.ID] = client
	h.lobbyMu.Unlock()

	games := h.games.GetWaitingGames()
	client.SendMessage(NewServerMessage(MsgTypeLobbyList, LobbyListData{Games: games}))
}

// UnsubscribeLobby removes a client from the lobby subscriber list
func (h *Hub) UnsubscribeLobby(client *Client) {
	h.lobbyMu.Lock()
	delete(h.lobbySubscribers, client.ID)
	h.lobbyMu.Unlock()
}

// BroadcastLobbyUpdate queues a lobby update for batched delivery to all subscribers.
func (h *Hub) BroadcastLobbyUpdate(update LobbyUpdateData) {
	select {
	case h.lobbyUpdateCh <- update:
	default:
		logger.Warn("Lobby update channel full, dropping update")
	}
}

// runLobbyBatcher aggregates lobby updates over 250ms windows, deduplicating
// add+remove of the same game within a single window.
func (h *Hub) runLobbyBatcher() {
	ticker := time.NewTicker(250 * time.Millisecond)
	defer ticker.Stop()

	pending := make(map[string]LobbyUpdateData)

	for {
		select {
		case update := <-h.lobbyUpdateCh:
			gameID := update.GameID
			if update.Game != nil {
				gameID = update.Game.GameID
			}
			if gameID == "" {
				continue
			}

			if existing, ok := pending[gameID]; ok {
				if existing.Action != update.Action {
					delete(pending, gameID)
					continue
				}
			}
			pending[gameID] = update

		case <-ticker.C:
			if len(pending) == 0 {
				continue
			}

			h.lobbyMu.RLock()
			if len(h.lobbySubscribers) == 0 {
				h.lobbyMu.RUnlock()
				for k := range pending {
					delete(pending, k)
				}
				continue
			}

			for _, update := range pending {
				msg := NewServerMessage(MsgTypeLobbyUpdate, update)
				data, err := json.Marshal(msg)
				if err != nil {
					logger.Error("Failed to marshal batched lobby update", logger.F("error", err.Error()))
					continue
				}
				for _, client := range h.lobbySubscribers {
					client.SendJSON(data)
				}
			}
			h.lobbyMu.RUnlock()

			for k := range pending {
				delete(pending, k)
			}

		case <-h.stopBatcher:
			return
		}
	}
}

// HandleMessage routes a message to the appropriate handler
func (h *Hub) HandleMessage(client *Client, msg *ClientMessage) {
	logger.Debug("Message received", logger.F("clientId", client.ID, "type", msg.Type))

	switch msg.Type {
	case MsgTypePing:
		client.SendMessage(NewServerMessage(MsgTypePong, nil))

	case MsgTypeGameCreate:
		var data GameCreateData
		if msg.Data != nil {
			if err := json.Unmarshal(msg.Data, &data); err != nil {
				client.SendMessage(NewErrorMessage("INVALID_DATA", "Invalid game create data"))
				return
			}
		}
		h.games.CreateGame(client, &data)

	case MsgTypeGameJoin:
		var data GameJoinData
		if err := json.Unmarshal(msg.Data, &data); err != nil {
			client.SendMessage(NewErrorMessage("INVALID_DATA", "Invalid game join data"))
			return
		}
		h.games.JoinGame(client, data.GameID)

	case MsgTypeMove:
		var data MoveData
		if err := json.Unmarshal(msg.Data, &data); err != nil {
			client.SendMessage(NewErrorMessage("INVALID_DATA", "Invalid move data"))
			return
		}
		h.games.HandleMove(client, &data)

	case MsgTypeResign:
		var data ResignData
		if err := json.Unmarshal(msg.Data, &data); err != nil {
			client.SendMessage(NewErrorMessage("INVALID_DATA", "Invalid resign data"))
			return
		}
		h.games.HandleResign(client, data.GameID)

	case MsgTypeGameLeave:
		var data GameJoinData // reuse for gameId
		if err := json.Unmarshal(msg.Data, &data); err != nil {
			client.SendMessage(NewErrorMessage("INVALID_DATA", "Invalid game leave data"))
			return
		}
		h.games.LeaveGame(client, data.GameID)

	case MsgTypeLobbySubscribe:
		h.SubscribeLobby(client)

	case MsgTypeLobbyUnsubscribe:
		h.UnsubscribeLobby(client)

	default:
		client.SendMessage(NewErrorMessage("UNKNOWN_TYPE", "Unknown message type: "+msg.Type))
	}
}

// BroadcastToGame sends a message to all clients in a game
func (h *Hub) BroadcastToGame(gameID string, msg *ServerMessage, exclude *Client) {
	data, err := json.Marshal(msg)
	if err != nil {
		logger.Error("Failed to marshal broadcast message", logger.F("error", err.Error()))
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, client := range h.clients {
		if client.GetGameID() == gameID && client != exclude {
			client.SendJSON(data)
		}
	}
}
