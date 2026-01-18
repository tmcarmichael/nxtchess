package ws

import (
	"crypto/rand"
	"encoding/hex"
	"sync"
	"time"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
)

// GameState represents the state of an active game
type GameState struct {
	ID          string
	WhitePlayer *Client
	BlackPlayer *Client
	FEN         string
	MoveHistory []string
	MoveNum     int
	Status      string // "waiting", "active", "ended"
	Result      string // "", "white", "black", "draw"
	ResultReason string // "checkmate", "resignation", "timeout", "stalemate", etc.
	TimeControl *TimeControl
	WhiteTime   int // remaining seconds
	BlackTime   int
	LastMoveAt  time.Time
	CreatedAt   time.Time
	mu          sync.RWMutex
}

// Initial FEN for standard chess
const initialFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

// GameManager manages all active games
type GameManager struct {
	games map[string]*GameState
	mu    sync.RWMutex
	hub   *Hub
}

// NewGameManager creates a new game manager
func NewGameManager(hub *Hub) *GameManager {
	return &GameManager{
		games: make(map[string]*GameState),
		hub:   hub,
	}
}

// generateGameID creates a random game ID
func generateGameID() string {
	bytes := make([]byte, 8)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

// CreateGame creates a new game and adds the creator as white
func (gm *GameManager) CreateGame(client *Client, data *GameCreateData) {
	gameID := generateGameID()

	game := &GameState{
		ID:          gameID,
		WhitePlayer: client,
		FEN:         initialFEN,
		MoveHistory: make([]string, 0),
		MoveNum:     1,
		Status:      "waiting",
		CreatedAt:   time.Now(),
	}

	// Set time control if provided
	if data != nil && data.TimeControl != nil {
		game.TimeControl = data.TimeControl
		game.WhiteTime = data.TimeControl.InitialTime
		game.BlackTime = data.TimeControl.InitialTime
	}

	gm.mu.Lock()
	gm.games[gameID] = game
	gm.mu.Unlock()

	// Associate client with game
	client.SetGameID(gameID)

	logger.Info("Game created", logger.F("gameId", gameID, "clientId", client.ID))

	// Send confirmation to creator
	client.SendMessage(NewServerMessage(MsgTypeGameCreated, GameCreatedData{
		GameID: gameID,
		Color:  "white",
	}))
}

// JoinGame adds a player to an existing game
func (gm *GameManager) JoinGame(client *Client, gameID string) {
	gm.mu.Lock()
	game, exists := gm.games[gameID]
	if !exists {
		gm.mu.Unlock()
		client.SendMessage(NewServerMessage(MsgTypeGameNotFound, nil))
		return
	}

	game.mu.Lock()
	defer game.mu.Unlock()
	gm.mu.Unlock()

	// Check if game is joinable
	if game.Status != "waiting" {
		client.SendMessage(NewServerMessage(MsgTypeGameFull, nil))
		return
	}

	// Check if it's the same player trying to join their own game
	if game.WhitePlayer != nil && game.WhitePlayer.ID == client.ID {
		client.SendMessage(NewErrorMessage("SAME_PLAYER", "Cannot join your own game"))
		return
	}

	// Add as black player
	game.BlackPlayer = client
	game.Status = "active"
	game.LastMoveAt = time.Now()

	// Associate client with game
	client.SetGameID(gameID)

	logger.Info("Player joined game", logger.F("gameId", gameID, "clientId", client.ID))

	// Build player info
	whiteInfo := PlayerInfo{ID: game.WhitePlayer.ID}
	if game.WhitePlayer.UserID != "" {
		whiteInfo.ID = game.WhitePlayer.UserID
	}

	blackInfo := PlayerInfo{ID: client.ID}
	if client.UserID != "" {
		blackInfo.ID = client.UserID
	}

	// Notify the joining player
	client.SendMessage(NewServerMessage(MsgTypeGameJoined, GameJoinedData{
		GameID: gameID,
		Color:  "black",
	}))

	// Notify both players that game has started
	startedData := GameStartedData{
		GameID:      gameID,
		FEN:         game.FEN,
		WhitePlayer: whiteInfo,
		BlackPlayer: blackInfo,
		TimeControl: game.TimeControl,
	}

	game.WhitePlayer.SendMessage(NewServerMessage(MsgTypeGameStarted, startedData))
	client.SendMessage(NewServerMessage(MsgTypeGameStarted, startedData))
}

// HandleMove processes a move from a client
func (gm *GameManager) HandleMove(client *Client, data *MoveData) {
	gm.mu.RLock()
	game, exists := gm.games[data.GameID]
	gm.mu.RUnlock()

	if !exists {
		client.SendMessage(NewServerMessage(MsgTypeGameNotFound, nil))
		return
	}

	game.mu.Lock()
	defer game.mu.Unlock()

	// Check game is active
	if game.Status != "active" {
		client.SendMessage(NewServerMessage(MsgTypeMoveRejected, MoveRejectedData{
			GameID: data.GameID,
			Reason: "Game is not active",
			FEN:    game.FEN,
			MoveNum: game.MoveNum,
		}))
		return
	}

	// Determine if it's this player's turn
	isWhiteTurn := game.MoveNum%2 == 1 // Odd moves are white's
	isWhitePlayer := game.WhitePlayer != nil && game.WhitePlayer.ID == client.ID
	isBlackPlayer := game.BlackPlayer != nil && game.BlackPlayer.ID == client.ID

	if (isWhiteTurn && !isWhitePlayer) || (!isWhiteTurn && !isBlackPlayer) {
		client.SendMessage(NewServerMessage(MsgTypeMoveRejected, MoveRejectedData{
			GameID:  data.GameID,
			Reason:  "Not your turn",
			FEN:     game.FEN,
			MoveNum: game.MoveNum,
		}))
		return
	}

	// TODO: Validate move with chess library
	// For now, we trust the client and just relay the move
	// In Phase 2, we'll add notnil/chess for server-side validation

	// Record the move
	moveNotation := data.From + data.To
	if data.Promotion != "" {
		moveNotation += data.Promotion
	}
	game.MoveHistory = append(game.MoveHistory, moveNotation)
	game.MoveNum++
	game.LastMoveAt = time.Now()

	// Note: FEN update should come from chess library validation
	// For now, client will track FEN - this is temporary
	// game.FEN = newFEN // TODO: Update from chess lib

	logger.Debug("Move made", logger.F(
		"gameId", data.GameID,
		"move", moveNotation,
		"moveNum", game.MoveNum,
	))

	// Send acceptance to moving player
	client.SendMessage(NewServerMessage(MsgTypeMoveAccepted, MoveAcceptedData{
		GameID:    data.GameID,
		From:      data.From,
		To:        data.To,
		FEN:       game.FEN,
		MoveNum:   game.MoveNum,
		WhiteTime: game.WhiteTime,
		BlackTime: game.BlackTime,
	}))

	// Send move to opponent
	var opponent *Client
	if isWhitePlayer {
		opponent = game.BlackPlayer
	} else {
		opponent = game.WhitePlayer
	}

	if opponent != nil {
		opponent.SendMessage(NewServerMessage(MsgTypeOpponentMove, OpponentMoveData{
			GameID:    data.GameID,
			From:      data.From,
			To:        data.To,
			Promotion: data.Promotion,
			FEN:       game.FEN,
			MoveNum:   game.MoveNum,
			WhiteTime: game.WhiteTime,
			BlackTime: game.BlackTime,
		}))
	}
}

// HandleResign processes a resignation
func (gm *GameManager) HandleResign(client *Client, gameID string) {
	gm.mu.RLock()
	game, exists := gm.games[gameID]
	gm.mu.RUnlock()

	if !exists {
		client.SendMessage(NewServerMessage(MsgTypeGameNotFound, nil))
		return
	}

	game.mu.Lock()
	defer game.mu.Unlock()

	if game.Status != "active" {
		return
	}

	// Determine winner
	isWhitePlayer := game.WhitePlayer != nil && game.WhitePlayer.ID == client.ID
	winner := "white"
	if isWhitePlayer {
		winner = "black"
	}

	game.Status = "ended"
	game.Result = winner
	game.ResultReason = "resignation"

	logger.Info("Game ended by resignation", logger.F("gameId", gameID, "winner", winner))

	// Notify both players
	endedData := GameEndedData{
		GameID: gameID,
		Result: winner,
		Reason: "resignation",
	}

	if game.WhitePlayer != nil {
		game.WhitePlayer.SendMessage(NewServerMessage(MsgTypeGameEnded, endedData))
	}
	if game.BlackPlayer != nil {
		game.BlackPlayer.SendMessage(NewServerMessage(MsgTypeGameEnded, endedData))
	}
}

// LeaveGame removes a player from a game
func (gm *GameManager) LeaveGame(client *Client, gameID string) {
	gm.mu.Lock()
	game, exists := gm.games[gameID]
	if !exists {
		gm.mu.Unlock()
		return
	}

	game.mu.Lock()
	defer game.mu.Unlock()

	// If game hasn't started, just delete it
	if game.Status == "waiting" {
		delete(gm.games, gameID)
		gm.mu.Unlock()
		client.SetGameID("")
		logger.Info("Game cancelled", logger.F("gameId", gameID))
		return
	}
	gm.mu.Unlock()

	// If game is active, treat as resignation
	if game.Status == "active" {
		// Determine winner
		isWhitePlayer := game.WhitePlayer != nil && game.WhitePlayer.ID == client.ID
		winner := "white"
		if isWhitePlayer {
			winner = "black"
		}

		game.Status = "ended"
		game.Result = winner
		game.ResultReason = "abandonment"

		// Notify opponent
		var opponent *Client
		if isWhitePlayer {
			opponent = game.BlackPlayer
		} else {
			opponent = game.WhitePlayer
		}

		if opponent != nil {
			opponent.SendMessage(NewServerMessage(MsgTypeGameEnded, GameEndedData{
				GameID: gameID,
				Result: winner,
				Reason: "abandonment",
			}))
		}
	}

	client.SetGameID("")
}

// HandleDisconnect handles a client disconnecting
func (gm *GameManager) HandleDisconnect(client *Client, gameID string) {
	gm.mu.RLock()
	game, exists := gm.games[gameID]
	gm.mu.RUnlock()

	if !exists {
		return
	}

	game.mu.Lock()
	defer game.mu.Unlock()

	// Notify opponent of disconnect
	var opponent *Client
	isWhitePlayer := game.WhitePlayer != nil && game.WhitePlayer.ID == client.ID

	if isWhitePlayer {
		opponent = game.BlackPlayer
	} else {
		opponent = game.WhitePlayer
	}

	if opponent != nil && game.Status == "active" {
		opponent.SendMessage(NewServerMessage(MsgTypeOpponentLeft, map[string]string{
			"gameId": gameID,
		}))
	}

	// For now, treat disconnect as immediate forfeit
	// TODO: Add reconnection grace period
	if game.Status == "active" {
		winner := "white"
		if isWhitePlayer {
			winner = "black"
		}

		game.Status = "ended"
		game.Result = winner
		game.ResultReason = "disconnection"

		if opponent != nil {
			opponent.SendMessage(NewServerMessage(MsgTypeGameEnded, GameEndedData{
				GameID: gameID,
				Result: winner,
				Reason: "disconnection",
			}))
		}
	}
}

// GetGame returns a game by ID
func (gm *GameManager) GetGame(gameID string) *GameState {
	gm.mu.RLock()
	defer gm.mu.RUnlock()
	return gm.games[gameID]
}

// GetActiveGameCount returns the number of active games
func (gm *GameManager) GetActiveGameCount() int {
	gm.mu.RLock()
	defer gm.mu.RUnlock()
	count := 0
	for _, g := range gm.games {
		if g.Status == "active" {
			count++
		}
	}
	return count
}
