package ws

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/tmcarmichael/nxtchess/apps/backend/internal/achievements"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/chess"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/database"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/elo"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/logger"
	"github.com/tmcarmichael/nxtchess/apps/backend/internal/metrics"
)

// GameState represents the state of an active game
type GameState struct {
	ID              string
	WhitePlayer     *Client
	BlackPlayer     *Client
	FEN             string
	MoveHistory     []string
	MoveNum         int
	Status          string // "waiting", "active", "ended"
	Result          string // "", "white", "black", "draw"
	ResultReason    string // "checkmate", "resignation", "timeout", "stalemate", etc.
	TimeControl     *TimeControl
	WhiteTimeMs     int64     // remaining milliseconds for white
	BlackTimeMs     int64     // remaining milliseconds for black
	LastMoveAt      time.Time // when the clock started for current player
	CreatedAt       time.Time
	Rated           bool
	CreatorUsername  string
	CreatorRating   int
	chessGame       *chess.Game   // Server-side chess validation
	stopClock       chan struct{} // signal to stop the clock goroutine
	clockRunning    bool          // whether the clock is currently ticking
	mu              sync.RWMutex
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
	gm := &GameManager{
		games: make(map[string]*GameState),
		hub:   hub,
	}
	// Start garbage collection goroutine
	go gm.garbageCollect()
	return gm
}

// garbageCollect periodically removes ended games from memory
func (gm *GameManager) garbageCollect() {
	ticker := time.NewTicker(1 * time.Minute)
	for range ticker.C {
		now := time.Now()
		toDelete := []string{}

		// Phase 1: Collect candidates with read lock to minimize contention
		gm.mu.RLock()
		for id, game := range gm.games {
			game.mu.RLock()
			shouldDelete := false
			if game.Status == "ended" && now.Sub(game.LastMoveAt) > 5*time.Minute {
				shouldDelete = true
			} else if game.Status == "waiting" && now.Sub(game.CreatedAt) > 30*time.Minute {
				shouldDelete = true
			}
			game.mu.RUnlock()

			if shouldDelete {
				toDelete = append(toDelete, id)
			}
		}
		gm.mu.RUnlock()

		// Phase 2: Delete with write lock only if needed
		if len(toDelete) > 0 {
			var lobbyRemovals []string
			gm.mu.Lock()
			for _, id := range toDelete {
				if game, exists := gm.games[id]; exists {
					game.mu.RLock()
					wasWaiting := game.Status == "waiting"
					stillExpired := (game.Status == "ended" && now.Sub(game.LastMoveAt) > 5*time.Minute) ||
						(wasWaiting && now.Sub(game.CreatedAt) > 30*time.Minute)
					game.mu.RUnlock()
					if stillExpired {
						delete(gm.games, id)
						if wasWaiting {
							lobbyRemovals = append(lobbyRemovals, id)
						}
					}
				}
			}
			remaining := len(gm.games)
			gm.mu.Unlock()

			// Broadcast lobby removals for expired waiting games
			for _, id := range lobbyRemovals {
				gm.hub.BroadcastLobbyUpdate(LobbyUpdateData{
					Action: "removed",
					GameID: id,
				})
			}

			logger.Info("Game garbage collection", logger.F("removed", len(toDelete), "remaining", remaining))
		}
	}
}

// startClock starts the clock goroutine for a game
// Must be called with game.mu held
func (gm *GameManager) startClock(game *GameState) {
	if game.TimeControl == nil || game.clockRunning {
		return
	}

	game.stopClock = make(chan struct{})
	game.clockRunning = true
	game.LastMoveAt = time.Now()

	go gm.runClock(game)
}

// runClock is the goroutine that manages the game clock
func (gm *GameManager) runClock(game *GameState) {
	ticker := time.NewTicker(100 * time.Millisecond) // Tick every 100ms for precision
	defer ticker.Stop()

	lastUpdate := time.Now()
	lastTick := time.Now()

	for {
		select {
		case <-game.stopClock:
			return
		case now := <-ticker.C:
			game.mu.Lock()

			if game.Status != "active" {
				game.mu.Unlock()
				return
			}

			// Calculate elapsed time since last tick
			elapsed := now.Sub(lastTick).Milliseconds()
			lastTick = now

			// Determine whose clock to decrement
			isWhiteTurn := game.chessGame.IsWhiteTurn()

			// Decrement the active player's time
			if isWhiteTurn {
				game.WhiteTimeMs -= elapsed
				if game.WhiteTimeMs < 0 {
					game.WhiteTimeMs = 0
				}
			} else {
				game.BlackTimeMs -= elapsed
				if game.BlackTimeMs < 0 {
					game.BlackTimeMs = 0
				}
			}

			// Check for timeout (flag fall)
			if (isWhiteTurn && game.WhiteTimeMs <= 0) || (!isWhiteTurn && game.BlackTimeMs <= 0) {
				// Time's up!
				winner := "black"
				if !isWhiteTurn {
					winner = "white"
				}

				game.Status = "ended"
				game.Result = winner
				game.ResultReason = "timeout"
				game.clockRunning = false
				metrics.WSGamesActive.Dec()

				logger.Info("Game ended by timeout", logger.F("gameId", game.ID, "winner", winner))

				endedData := gm.finalizeGame(game)

				if game.WhitePlayer != nil {
					game.WhitePlayer.SendMessage(NewServerMessage(MsgTypeGameEnded, endedData))
				}
				if game.BlackPlayer != nil {
					game.BlackPlayer.SendMessage(NewServerMessage(MsgTypeGameEnded, endedData))
				}

				game.mu.Unlock()
				return
			}

			// Send time update every second (or so)
			if now.Sub(lastUpdate) >= time.Second {
				lastUpdate = now
				timeUpdate := TimeUpdateData{
					GameID:    game.ID,
					WhiteTime: int(game.WhiteTimeMs),
					BlackTime: int(game.BlackTimeMs),
				}

				if game.WhitePlayer != nil {
					game.WhitePlayer.SendMessage(NewServerMessage(MsgTypeTimeUpdate, timeUpdate))
				}
				if game.BlackPlayer != nil {
					game.BlackPlayer.SendMessage(NewServerMessage(MsgTypeTimeUpdate, timeUpdate))
				}
			}

			game.mu.Unlock()
		}
	}
}

// stopClockForGame stops the clock goroutine
// Must be called with game.mu held
func (game *GameState) stopClockGoroutine() {
	if game.clockRunning && game.stopClock != nil {
		close(game.stopClock)
		game.clockRunning = false
	}
}

// generateGameID creates a random game ID
func generateGameID() string {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		logger.Error("Failed to generate game ID", logger.F("error", err.Error()))
		return fmt.Sprintf("fallback-%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(bytes)
}

func (gm *GameManager) finalizeGame(game *GameState) GameEndedData {
	endedData := GameEndedData{
		GameID: game.ID,
		Result: game.Result,
		Reason: game.ResultReason,
	}

	whiteUID := ""
	blackUID := ""
	if game.WhitePlayer != nil {
		whiteUID = game.WhitePlayer.UserID
	}
	if game.BlackPlayer != nil {
		blackUID = game.BlackPlayer.UserID
	}

	if whiteUID == "" || blackUID == "" || !game.Rated {
		return endedData
	}

	whiteRating, whiteGames, err := database.GetPlayerRatingInfo(whiteUID)
	if err != nil {
		logger.Error("Failed to get white player rating", logger.F("userID", whiteUID, "error", err.Error()))
		return endedData
	}

	blackRating, blackGames, err := database.GetPlayerRatingInfo(blackUID)
	if err != nil {
		logger.Error("Failed to get black player rating", logger.F("userID", blackUID, "error", err.Error()))
		return endedData
	}

	result := elo.ResultFromWinner(game.Result)
	rc := elo.Calculate(whiteRating, blackRating, result, whiteGames, blackGames)

	pgn := strings.Join(game.MoveHistory, " ")
	resultPGN := elo.ResultToPGN(game.Result)

	if err := database.FinalizeGameResult(whiteUID, blackUID, pgn, resultPGN, rc.WhiteOld, rc.BlackOld, rc.WhiteNew, rc.BlackNew); err != nil {
		logger.Error("Failed to finalize game result", logger.F("gameId", game.ID, "error", err.Error()))
		return endedData
	}

	endedData.WhiteRating = &rc.WhiteNew
	endedData.BlackRating = &rc.BlackNew
	endedData.WhiteRatingDelta = &rc.WhiteDelta
	endedData.BlackRatingDelta = &rc.BlackDelta

	logger.Info("Game finalized with ratings", logger.F(
		"gameId", game.ID,
		"whiteOld", rc.WhiteOld, "whiteNew", rc.WhiteNew,
		"blackOld", rc.BlackOld, "blackNew", rc.BlackNew,
	))

	whiteWon := game.Result == "white"
	blackWon := game.Result == "black"
	isDraw := game.Result == "draw"

	moveCount := len(game.MoveHistory)

	whiteCtx := achievements.GameContext{
		InnerGame:   game.chessGame.InnerGame(),
		Result:      game.Result,
		Reason:      game.ResultReason,
		PlayerColor: "white",
		MoveCount:   moveCount,
		NewRating:   rc.WhiteNew,
		Won:         whiteWon,
		Drew:        isDraw,
	}
	endedData.WhiteNewAchievements = achievements.CheckGameAchievements(whiteUID, whiteCtx)

	blackCtx := achievements.GameContext{
		InnerGame:   game.chessGame.InnerGame(),
		Result:      game.Result,
		Reason:      game.ResultReason,
		PlayerColor: "black",
		MoveCount:   moveCount,
		NewRating:   rc.BlackNew,
		Won:         blackWon,
		Drew:        isDraw,
	}
	endedData.BlackNewAchievements = achievements.CheckGameAchievements(blackUID, blackCtx)

	return endedData
}

// CreateGame creates a new game and adds the creator as white
func (gm *GameManager) CreateGame(client *Client, data *GameCreateData) {
	gameID := generateGameID()

	// Initialize server-side chess game for validation
	chessGame := chess.NewGame()

	creatorUsername := client.Username
	if creatorUsername == "" {
		creatorUsername = "Anonymous"
	}

	var creatorRating int
	if client.UserID != "" {
		if r, err := database.GetRatingByID(client.UserID); err == nil {
			creatorRating = r
		}
	}

	rated := false
	if data != nil && data.Rated && client.UserID != "" {
		rated = true
	}

	game := &GameState{
		ID:             gameID,
		WhitePlayer:    client,
		FEN:            initialFEN,
		MoveHistory:    make([]string, 0),
		MoveNum:        1,
		Status:         "waiting",
		CreatedAt:      time.Now(),
		Rated:          rated,
		CreatorUsername: creatorUsername,
		CreatorRating:  creatorRating,
		chessGame:      chessGame,
	}

	// Set time control if provided (convert seconds to milliseconds)
	if data != nil && data.TimeControl != nil {
		tc := data.TimeControl
		if tc.InitialTime < 60 || tc.InitialTime > 10800 || tc.Increment < 0 || tc.Increment > 300 {
			client.SendMessage(NewErrorMessage("INVALID_TIME_CONTROL", "Time control out of valid range"))
			return
		}
		game.TimeControl = tc
		game.WhiteTimeMs = int64(tc.InitialTime) * 1000
		game.BlackTimeMs = int64(tc.InitialTime) * 1000
	}

	gm.mu.Lock()
	gm.games[gameID] = game
	gm.mu.Unlock()

	// Associate client with game
	client.SetGameID(gameID)

	logger.Info("Game created", logger.F("gameId", gameID, "clientId", client.ID, "rated", rated))

	// Send confirmation to creator
	client.SendMessage(NewServerMessage(MsgTypeGameCreated, GameCreatedData{
		GameID: gameID,
		Color:  "white",
	}))

	// Broadcast to lobby subscribers
	gm.hub.BroadcastLobbyUpdate(LobbyUpdateData{
		Action: "added",
		Game: &LobbyGameInfo{
			GameID:        gameID,
			Creator:       creatorUsername,
			CreatorRating: creatorRating,
			TimeControl:   game.TimeControl,
			Rated:         rated,
			CreatedAt:     game.CreatedAt.UnixMilli(),
		},
	})
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
	// For authenticated users, check UserID (persists across reconnects)
	// For anonymous users, check connection ID
	isSamePlayer := false
	if game.WhitePlayer != nil {
		if client.UserID != "" && game.WhitePlayer.UserID != "" {
			// Both authenticated - compare UserID
			isSamePlayer = game.WhitePlayer.UserID == client.UserID
		} else {
			// At least one anonymous - compare connection ID
			isSamePlayer = game.WhitePlayer.ID == client.ID
		}
	}
	if isSamePlayer {
		client.SendMessage(NewErrorMessage("SAME_PLAYER", "Cannot join your own game"))
		return
	}

	// Add as black player
	game.BlackPlayer = client
	game.Status = "active"
	game.LastMoveAt = time.Now()
	metrics.WSGamesActive.Inc()

	// Associate client with game
	client.SetGameID(gameID)

	logger.Info("Player joined game", logger.F("gameId", gameID, "clientId", client.ID))

	// Remove from lobby
	gm.hub.BroadcastLobbyUpdate(LobbyUpdateData{
		Action: "removed",
		GameID: gameID,
	})

	// Build player info
	whiteInfo := PlayerInfo{ID: game.WhitePlayer.ID, Username: game.CreatorUsername, Rating: game.CreatorRating}
	if game.WhitePlayer.UserID != "" {
		whiteInfo.ID = game.WhitePlayer.UserID
	}

	joinerUsername := client.Username
	if joinerUsername == "" {
		joinerUsername = "Anonymous"
	}
	var joinerRating int
	if client.UserID != "" {
		if r, err := database.GetRatingByID(client.UserID); err == nil {
			joinerRating = r
		}
	}
	blackInfo := PlayerInfo{ID: client.ID, Username: joinerUsername, Rating: joinerRating}
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
		WhiteTimeMs: int(game.WhiteTimeMs),
		BlackTimeMs: int(game.BlackTimeMs),
	}

	game.WhitePlayer.SendMessage(NewServerMessage(MsgTypeGameStarted, startedData))
	client.SendMessage(NewServerMessage(MsgTypeGameStarted, startedData))

	// Start the clock if time control is set
	gm.startClock(game)
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
			GameID:  data.GameID,
			Reason:  "Game is not active",
			FEN:     game.FEN,
			MoveNum: game.MoveNum,
		}))
		return
	}

	// Determine if it's this player's turn using the chess library
	isWhiteTurn := game.chessGame.IsWhiteTurn()
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

	// Validate move with chess library
	result := game.chessGame.TryMove(data.From, data.To, data.Promotion)

	if !result.Valid {
		client.SendMessage(NewServerMessage(MsgTypeMoveRejected, MoveRejectedData{
			GameID:  data.GameID,
			Reason:  result.ErrorMsg,
			FEN:     game.FEN,
			MoveNum: game.MoveNum,
		}))
		return
	}

	// Move was valid - update game state
	moveNotation := data.From + data.To
	if data.Promotion != "" {
		moveNotation += data.Promotion
	}
	game.MoveHistory = append(game.MoveHistory, moveNotation)
	game.FEN = result.NewFEN
	game.MoveNum = result.MoveNum
	game.LastMoveAt = time.Now()

	// Add increment to the player who just moved (if time control is set)
	if game.TimeControl != nil && game.TimeControl.Increment > 0 {
		incrementMs := int64(game.TimeControl.Increment) * 1000
		if isWhitePlayer {
			game.WhiteTimeMs += incrementMs
		} else {
			game.BlackTimeMs += incrementMs
		}
	}

	logger.Debug("Move made", logger.F(
		"gameId", data.GameID,
		"move", moveNotation,
		"san", result.SAN,
		"moveNum", game.MoveNum,
		"isCheck", result.IsCheck,
		"gameOver", result.GameOver,
		"whiteTimeMs", game.WhiteTimeMs,
		"blackTimeMs", game.BlackTimeMs,
	))

	// Get opponent reference
	var opponent *Client
	if isWhitePlayer {
		opponent = game.BlackPlayer
	} else {
		opponent = game.WhitePlayer
	}

	// Send acceptance to moving player
	client.SendMessage(NewServerMessage(MsgTypeMoveAccepted, MoveAcceptedData{
		GameID:      data.GameID,
		From:        data.From,
		To:          data.To,
		SAN:         result.SAN,
		FEN:         game.FEN,
		MoveNum:     game.MoveNum,
		IsCheck:     result.IsCheck,
		WhiteTimeMs: int(game.WhiteTimeMs),
		BlackTimeMs: int(game.BlackTimeMs),
	}))

	// Send move to opponent
	if opponent != nil {
		opponent.SendMessage(NewServerMessage(MsgTypeOpponentMove, OpponentMoveData{
			GameID:      data.GameID,
			From:        data.From,
			To:          data.To,
			Promotion:   data.Promotion,
			SAN:         result.SAN,
			FEN:         game.FEN,
			MoveNum:     game.MoveNum,
			IsCheck:     result.IsCheck,
			WhiteTimeMs: int(game.WhiteTimeMs),
			BlackTimeMs: int(game.BlackTimeMs),
		}))
	}

	// Check for game over (checkmate, stalemate, draw conditions)
	if result.GameOver {
		game.Status = "ended"
		game.Result = string(result.Result)
		game.ResultReason = string(result.Reason)
		metrics.WSGamesActive.Dec()

		// Stop the clock
		game.stopClockGoroutine()

		logger.Info("Game ended", logger.F(
			"gameId", data.GameID,
			"result", game.Result,
			"reason", game.ResultReason,
		))

		endedData := gm.finalizeGame(game)

		if game.WhitePlayer != nil {
			game.WhitePlayer.SendMessage(NewServerMessage(MsgTypeGameEnded, endedData))
		}
		if game.BlackPlayer != nil {
			game.BlackPlayer.SendMessage(NewServerMessage(MsgTypeGameEnded, endedData))
		}
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
	metrics.WSGamesActive.Dec()

	// Stop the clock
	game.stopClockGoroutine()

	logger.Info("Game ended by resignation", logger.F("gameId", gameID, "winner", winner))

	endedData := gm.finalizeGame(game)

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

		// Remove from lobby
		gm.hub.BroadcastLobbyUpdate(LobbyUpdateData{
			Action: "removed",
			GameID: gameID,
		})
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
		metrics.WSGamesActive.Dec()

		// Stop the clock
		game.stopClockGoroutine()

		endedData := gm.finalizeGame(game)

		var opponent *Client
		if isWhitePlayer {
			opponent = game.BlackPlayer
		} else {
			opponent = game.WhitePlayer
		}

		if opponent != nil {
			opponent.SendMessage(NewServerMessage(MsgTypeGameEnded, endedData))
		}
	}

	client.SetGameID("")
}

// HandleDisconnect handles a client disconnecting
func (gm *GameManager) HandleDisconnect(client *Client, gameID string) {
	gm.mu.Lock()
	game, exists := gm.games[gameID]
	if !exists {
		gm.mu.Unlock()
		return
	}

	game.mu.Lock()
	defer game.mu.Unlock()

	// If game is waiting (creator disconnected before anyone joined), clean it up
	if game.Status == "waiting" {
		delete(gm.games, gameID)
		gm.mu.Unlock()
		logger.Info("Waiting game removed on disconnect", logger.F("gameId", gameID))

		gm.hub.BroadcastLobbyUpdate(LobbyUpdateData{
			Action: "removed",
			GameID: gameID,
		})
		return
	}
	gm.mu.Unlock()

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
		metrics.WSGamesActive.Dec()

		// Stop the clock
		game.stopClockGoroutine()

		endedData := gm.finalizeGame(game)

		if opponent != nil {
			opponent.SendMessage(NewServerMessage(MsgTypeGameEnded, endedData))
		}
	}
}

// GetWaitingGames returns info about all games in "waiting" status for the lobby
func (gm *GameManager) GetWaitingGames() []LobbyGameInfo {
	gm.mu.RLock()
	defer gm.mu.RUnlock()

	games := make([]LobbyGameInfo, 0)
	for _, game := range gm.games {
		game.mu.RLock()
		if game.Status == "waiting" {
			games = append(games, LobbyGameInfo{
				GameID:        game.ID,
				Creator:       game.CreatorUsername,
				CreatorRating: game.CreatorRating,
				TimeControl:   game.TimeControl,
				Rated:         game.Rated,
				CreatedAt:     game.CreatedAt.UnixMilli(),
			})
		}
		game.mu.RUnlock()
	}
	return games
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
