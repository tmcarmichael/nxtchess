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
	CreatorUsername string
	CreatorRating   int
	chessGame       *chess.Game   // Server-side chess validation
	stopClock       chan struct{} // signal to stop the clock goroutine
	clockRunning    bool          // whether the clock is currently ticking
	mu              sync.RWMutex
}

// Initial FEN for standard chess
const initialFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

const (
	endedGameTimeout      = 5 * time.Minute
	waitingGameTimeout    = 5 * time.Minute
	maxGames              = 1000
	gameCreateCooldown    = 10 * time.Second
	maxActiveGamesPerUser = 2
)

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
			if game.Status == "ended" && now.Sub(game.LastMoveAt) > endedGameTimeout {
				shouldDelete = true
			} else if game.Status == "waiting" && now.Sub(game.CreatedAt) > waitingGameTimeout {
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
					stillExpired := (game.Status == "ended" && now.Sub(game.LastMoveAt) > endedGameTimeout) ||
						(wasWaiting && now.Sub(game.CreatedAt) > waitingGameTimeout)
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

// runClock is the goroutine that manages the game clock.
// State is read/written under game.mu, then the lock is released
// before performing any I/O (sending messages, finalizing ratings).
func (gm *GameManager) runClock(game *GameState) {
	ticker := time.NewTicker(100 * time.Millisecond)
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

			elapsed := now.Sub(lastTick).Milliseconds()
			lastTick = now

			isWhiteTurn := game.chessGame.IsWhiteTurn()

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
				winner := "black"
				if !isWhiteTurn {
					winner = "white"
				}

				game.Status = "ended"
				game.Result = winner
				game.ResultReason = "timeout"
				game.clockRunning = false
				metrics.WSGamesActive.Dec()

				info := captureGameEndInfo(game)
				whitePlayer := game.WhitePlayer
				blackPlayer := game.BlackPlayer
				game.mu.Unlock()

				logger.Info("Game ended by timeout", logger.F("gameId", info.gameID, "winner", winner))

				endedData := gm.finalizeGame(info)

				if whitePlayer != nil {
					whitePlayer.SendMessage(NewServerMessage(MsgTypeGameEnded, endedData))
				}
				if blackPlayer != nil {
					blackPlayer.SendMessage(NewServerMessage(MsgTypeGameEnded, endedData))
				}

				return
			}

			// Capture time update data under lock, send after release
			var timeUpdate *TimeUpdateData
			var whitePlayer, blackPlayer *Client
			if now.Sub(lastUpdate) >= time.Second {
				lastUpdate = now
				timeUpdate = &TimeUpdateData{
					GameID:    game.ID,
					WhiteTime: int(game.WhiteTimeMs),
					BlackTime: int(game.BlackTimeMs),
				}
				whitePlayer = game.WhitePlayer
				blackPlayer = game.BlackPlayer
			}

			game.mu.Unlock()

			if timeUpdate != nil {
				msg := NewServerMessage(MsgTypeTimeUpdate, *timeUpdate)
				if whitePlayer != nil {
					whitePlayer.SendMessage(msg)
				}
				if blackPlayer != nil {
					blackPlayer.SendMessage(msg)
				}
			}
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

// gameEndInfo captures the state needed for post-game finalization
// (rating updates, achievements) without holding the game mutex.
type gameEndInfo struct {
	gameID       string
	result       string
	resultReason string
	rated        bool
	whiteUID     string
	blackUID     string
	moveHistory  []string
	chessGame    *chess.Game
}

// captureGameEndInfo snapshots game state for finalization.
// Must be called with game.mu held. The caller releases the lock
// before passing the snapshot to finalizeGame.
func captureGameEndInfo(game *GameState) gameEndInfo {
	info := gameEndInfo{
		gameID:       game.ID,
		result:       game.Result,
		resultReason: game.ResultReason,
		rated:        game.Rated,
		chessGame:    game.chessGame,
	}
	if game.WhitePlayer != nil {
		info.whiteUID = game.WhitePlayer.UserID
	}
	if game.BlackPlayer != nil {
		info.blackUID = game.BlackPlayer.UserID
	}
	info.moveHistory = make([]string, len(game.MoveHistory))
	copy(info.moveHistory, game.MoveHistory)
	return info
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

// finalizeGame performs post-game work (rating updates, achievements, DB persistence).
// It must be called WITHOUT holding game.mu since it performs blocking I/O.
func (gm *GameManager) finalizeGame(info gameEndInfo) GameEndedData {
	endedData := GameEndedData{
		GameID: info.gameID,
		Result: info.result,
		Reason: info.resultReason,
	}

	if info.whiteUID == "" || info.blackUID == "" || !info.rated {
		return endedData
	}

	whiteRating, whiteGames, err := database.GetPlayerRatingInfo(info.whiteUID)
	if err != nil {
		logger.Error("Failed to get white player rating", logger.F("userID", info.whiteUID, "error", err.Error()))
		return endedData
	}

	blackRating, blackGames, err := database.GetPlayerRatingInfo(info.blackUID)
	if err != nil {
		logger.Error("Failed to get black player rating", logger.F("userID", info.blackUID, "error", err.Error()))
		return endedData
	}

	result := elo.ResultFromWinner(info.result)
	rc := elo.Calculate(whiteRating, blackRating, result, whiteGames, blackGames)

	pgn := strings.Join(info.moveHistory, " ")
	resultPGN := elo.ResultToPGN(info.result)

	if err := database.FinalizeGameResult(info.whiteUID, info.blackUID, pgn, resultPGN, rc.WhiteOld, rc.BlackOld, rc.WhiteNew, rc.BlackNew); err != nil {
		logger.Error("Failed to finalize game result", logger.F("gameId", info.gameID, "error", err.Error()))
		return endedData
	}

	endedData.WhiteRating = &rc.WhiteNew
	endedData.BlackRating = &rc.BlackNew
	endedData.WhiteRatingDelta = &rc.WhiteDelta
	endedData.BlackRatingDelta = &rc.BlackDelta

	logger.Info("Game finalized with ratings", logger.F(
		"gameId", info.gameID,
		"whiteOld", rc.WhiteOld, "whiteNew", rc.WhiteNew,
		"blackOld", rc.BlackOld, "blackNew", rc.BlackNew,
	))

	whiteWon := info.result == "white"
	blackWon := info.result == "black"
	isDraw := info.result == "draw"

	moveCount := len(info.moveHistory)

	whiteCtx := achievements.GameContext{
		InnerGame:   info.chessGame.InnerGame(),
		Result:      info.result,
		Reason:      info.resultReason,
		PlayerColor: "white",
		MoveCount:   moveCount,
		NewRating:   rc.WhiteNew,
		Won:         whiteWon,
		Drew:        isDraw,
	}
	endedData.WhiteNewAchievements = achievements.CheckGameAchievements(info.whiteUID, whiteCtx)

	blackCtx := achievements.GameContext{
		InnerGame:   info.chessGame.InnerGame(),
		Result:      info.result,
		Reason:      info.resultReason,
		PlayerColor: "black",
		MoveCount:   moveCount,
		NewRating:   rc.BlackNew,
		Won:         blackWon,
		Drew:        isDraw,
	}
	endedData.BlackNewAchievements = achievements.CheckGameAchievements(info.blackUID, blackCtx)

	return endedData
}

// countActiveGamesByIdentity counts waiting/active games for a given user identity.
// For authenticated users, identity is the UserID; for anonymous users, it's the IP.
func (gm *GameManager) countActiveGamesByIdentity(identity string, byUserID bool) int {
	gm.mu.RLock()
	defer gm.mu.RUnlock()
	return gm.countActiveGamesLocked(identity, byUserID)
}

// countActiveGamesLocked counts waiting/active games. Caller must hold gm.mu (read or write).
func (gm *GameManager) countActiveGamesLocked(identity string, byUserID bool) int {
	count := 0
	for _, game := range gm.games {
		game.mu.RLock()
		if game.Status == "waiting" || game.Status == "active" {
			if byUserID {
				if (game.WhitePlayer != nil && game.WhitePlayer.UserID == identity) ||
					(game.BlackPlayer != nil && game.BlackPlayer.UserID == identity) {
					count++
				}
			} else {
				if (game.WhitePlayer != nil && game.WhitePlayer.IP == identity) ||
					(game.BlackPlayer != nil && game.BlackPlayer.IP == identity) {
					count++
				}
			}
		}
		game.mu.RUnlock()
	}
	return count
}

// CreateGame creates a new game and adds the creator as white
func (gm *GameManager) CreateGame(client *Client, data *GameCreateData) {
	// Per-client cooldown: max 1 game creation per 10 seconds
	if time.Since(client.GetLastGameCreatedAt()) < gameCreateCooldown {
		client.SendMessage(NewErrorMessage("GAME_CREATE_COOLDOWN", "Please wait before creating another game"))
		return
	}

	// Per-user active game limit: max 2 waiting/active games
	identity := client.IP
	byUserID := false
	if client.UserID != "" {
		identity = client.UserID
		byUserID = true
	}
	if gm.countActiveGamesByIdentity(identity, byUserID) >= maxActiveGamesPerUser {
		client.SendMessage(NewErrorMessage("GAME_LIMIT_REACHED", "You already have the maximum number of active games"))
		return
	}

	// Validate time control early (before expensive ops)
	if data != nil && data.TimeControl != nil {
		tc := data.TimeControl
		if tc.InitialTime < 60 || tc.InitialTime > 10800 || tc.Increment < 0 || tc.Increment > 300 {
			client.SendMessage(NewErrorMessage("INVALID_TIME_CONTROL", "Time control out of valid range"))
			return
		}
	}

	// Check game ceiling early to avoid wasted work when at capacity
	gm.mu.RLock()
	atCapacity := len(gm.games) >= maxGames
	gm.mu.RUnlock()
	if atCapacity {
		client.SendMessage(NewErrorMessage("SERVER_FULL", "Server is at capacity, please try again later"))
		return
	}

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
		ID:              gameID,
		WhitePlayer:     client,
		FEN:             initialFEN,
		MoveHistory:     make([]string, 0),
		MoveNum:         1,
		Status:          "waiting",
		CreatedAt:       time.Now(),
		Rated:           rated,
		CreatorUsername: creatorUsername,
		CreatorRating:   creatorRating,
		chessGame:       chessGame,
	}

	if data != nil && data.TimeControl != nil {
		game.TimeControl = data.TimeControl
		game.WhiteTimeMs = int64(data.TimeControl.InitialTime) * 1000
		game.BlackTimeMs = int64(data.TimeControl.InitialTime) * 1000
	}

	// Double-check ceiling under write lock to prevent TOCTOU race
	gm.mu.Lock()
	if len(gm.games) >= maxGames {
		gm.mu.Unlock()
		client.SendMessage(NewErrorMessage("SERVER_FULL", "Server is at capacity, please try again later"))
		return
	}
	if gm.countActiveGamesLocked(identity, byUserID) >= maxActiveGamesPerUser {
		gm.mu.Unlock()
		client.SendMessage(NewErrorMessage("GAME_LIMIT_REACHED", "You already have the maximum number of active games"))
		return
	}
	gm.games[gameID] = game
	client.SetLastGameCreatedAt(time.Now())
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
	gm.mu.Unlock()

	// Check if game is joinable
	if game.Status != "waiting" {
		game.mu.Unlock()
		client.SendMessage(NewServerMessage(MsgTypeGameFull, nil))
		return
	}

	// Check if it's the same player trying to join their own game
	isSamePlayer := false
	if game.WhitePlayer != nil {
		if client.UserID != "" && game.WhitePlayer.UserID != "" {
			isSamePlayer = game.WhitePlayer.UserID == client.UserID
		} else {
			isSamePlayer = game.WhitePlayer.ID == client.ID
		}
	}
	if isSamePlayer {
		game.mu.Unlock()
		client.SendMessage(NewErrorMessage("SAME_PLAYER", "Cannot join your own game"))
		return
	}

	// Transition state under lock
	game.BlackPlayer = client
	game.Status = "active"
	game.LastMoveAt = time.Now()
	metrics.WSGamesActive.Inc()
	client.SetGameID(gameID)

	// Start the clock (sets fields on game, spawns goroutine — must hold lock)
	gm.startClock(game)

	// Capture data for messages before releasing lock
	whitePlayer := game.WhitePlayer
	whiteInfo := PlayerInfo{ID: whitePlayer.ID, Username: game.CreatorUsername, Rating: game.CreatorRating}
	if whitePlayer.UserID != "" {
		whiteInfo.ID = whitePlayer.UserID
	}
	fen := game.FEN
	timeControl := game.TimeControl
	whiteTimeMs := int(game.WhiteTimeMs)
	blackTimeMs := int(game.BlackTimeMs)

	game.mu.Unlock()

	logger.Info("Player joined game", logger.F("gameId", gameID, "clientId", client.ID))

	gm.hub.BroadcastLobbyUpdate(LobbyUpdateData{
		Action: "removed",
		GameID: gameID,
	})

	// DB call for joiner rating outside lock
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

	client.SendMessage(NewServerMessage(MsgTypeGameJoined, GameJoinedData{
		GameID: gameID,
		Color:  "black",
	}))

	startedData := GameStartedData{
		GameID:      gameID,
		FEN:         fen,
		WhitePlayer: whiteInfo,
		BlackPlayer: blackInfo,
		TimeControl: timeControl,
		WhiteTimeMs: whiteTimeMs,
		BlackTimeMs: blackTimeMs,
	}

	whitePlayer.SendMessage(NewServerMessage(MsgTypeGameStarted, startedData))
	client.SendMessage(NewServerMessage(MsgTypeGameStarted, startedData))
}

// HandleMove processes a move from a client
func (gm *GameManager) HandleMove(client *Client, data *MoveData) {
	gm.mu.RLock()
	game, exists := gm.games[data.GameID]
	if !exists {
		gm.mu.RUnlock()
		client.SendMessage(NewServerMessage(MsgTypeGameNotFound, nil))
		return
	}
	game.mu.Lock()
	gm.mu.RUnlock()

	// Check game is active
	if game.Status != "active" {
		rejectData := MoveRejectedData{
			GameID:  data.GameID,
			Reason:  "Game is not active",
			FEN:     game.FEN,
			MoveNum: game.MoveNum,
		}
		game.mu.Unlock()
		client.SendMessage(NewServerMessage(MsgTypeMoveRejected, rejectData))
		return
	}

	// Determine if it's this player's turn using the chess library
	isWhiteTurn := game.chessGame.IsWhiteTurn()
	isWhitePlayer := game.WhitePlayer != nil && game.WhitePlayer.ID == client.ID
	isBlackPlayer := game.BlackPlayer != nil && game.BlackPlayer.ID == client.ID

	if (isWhiteTurn && !isWhitePlayer) || (!isWhiteTurn && !isBlackPlayer) {
		rejectData := MoveRejectedData{
			GameID:  data.GameID,
			Reason:  "Not your turn",
			FEN:     game.FEN,
			MoveNum: game.MoveNum,
		}
		game.mu.Unlock()
		client.SendMessage(NewServerMessage(MsgTypeMoveRejected, rejectData))
		return
	}

	// Validate move with chess library (CPU-only, no I/O)
	result := game.chessGame.TryMove(data.From, data.To, data.Promotion)

	if !result.Valid {
		rejectData := MoveRejectedData{
			GameID:  data.GameID,
			Reason:  result.ErrorMsg,
			FEN:     game.FEN,
			MoveNum: game.MoveNum,
		}
		game.mu.Unlock()
		client.SendMessage(NewServerMessage(MsgTypeMoveRejected, rejectData))
		return
	}

	// Move was valid — update game state under lock
	moveNotation := data.From + data.To
	if data.Promotion != "" {
		moveNotation += data.Promotion
	}
	game.MoveHistory = append(game.MoveHistory, moveNotation)
	game.FEN = result.NewFEN
	game.MoveNum = result.MoveNum
	game.LastMoveAt = time.Now()

	if game.TimeControl != nil && game.TimeControl.Increment > 0 {
		incrementMs := int64(game.TimeControl.Increment) * 1000
		if isWhitePlayer {
			game.WhiteTimeMs += incrementMs
		} else {
			game.BlackTimeMs += incrementMs
		}
	}

	// Capture data for messages
	accepted := MoveAcceptedData{
		GameID:      data.GameID,
		From:        data.From,
		To:          data.To,
		SAN:         result.SAN,
		FEN:         game.FEN,
		MoveNum:     game.MoveNum,
		IsCheck:     result.IsCheck,
		WhiteTimeMs: int(game.WhiteTimeMs),
		BlackTimeMs: int(game.BlackTimeMs),
	}

	opponentMoveData := OpponentMoveData{
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
	}

	var opponent *Client
	if isWhitePlayer {
		opponent = game.BlackPlayer
	} else {
		opponent = game.WhitePlayer
	}

	var gameOver bool
	var info gameEndInfo
	var whitePlayer, blackPlayer *Client

	if result.GameOver {
		game.Status = "ended"
		game.Result = string(result.Result)
		game.ResultReason = string(result.Reason)
		metrics.WSGamesActive.Dec()
		game.stopClockGoroutine()

		info = captureGameEndInfo(game)
		whitePlayer = game.WhitePlayer
		blackPlayer = game.BlackPlayer
		gameOver = true
	}

	game.mu.Unlock()

	// All I/O below — no locks held

	logger.Debug("Move made", logger.F(
		"gameId", data.GameID,
		"move", moveNotation,
		"san", result.SAN,
		"moveNum", accepted.MoveNum,
		"isCheck", result.IsCheck,
		"gameOver", result.GameOver,
		"whiteTimeMs", accepted.WhiteTimeMs,
		"blackTimeMs", accepted.BlackTimeMs,
	))

	client.SendMessage(NewServerMessage(MsgTypeMoveAccepted, accepted))

	if opponent != nil {
		opponent.SendMessage(NewServerMessage(MsgTypeOpponentMove, opponentMoveData))
	}

	if gameOver {
		logger.Info("Game ended", logger.F(
			"gameId", data.GameID,
			"result", info.result,
			"reason", info.resultReason,
		))

		endedData := gm.finalizeGame(info)

		if whitePlayer != nil {
			whitePlayer.SendMessage(NewServerMessage(MsgTypeGameEnded, endedData))
		}
		if blackPlayer != nil {
			blackPlayer.SendMessage(NewServerMessage(MsgTypeGameEnded, endedData))
		}
	}
}

// HandleResign processes a resignation
func (gm *GameManager) HandleResign(client *Client, gameID string) {
	gm.mu.RLock()
	game, exists := gm.games[gameID]
	if !exists {
		gm.mu.RUnlock()
		client.SendMessage(NewServerMessage(MsgTypeGameNotFound, nil))
		return
	}
	game.mu.Lock()
	gm.mu.RUnlock()

	if game.Status != "active" {
		game.mu.Unlock()
		return
	}

	isWhitePlayer := game.WhitePlayer != nil && game.WhitePlayer.ID == client.ID
	winner := "white"
	if isWhitePlayer {
		winner = "black"
	}

	game.Status = "ended"
	game.Result = winner
	game.ResultReason = "resignation"
	metrics.WSGamesActive.Dec()
	game.stopClockGoroutine()

	info := captureGameEndInfo(game)
	whitePlayer := game.WhitePlayer
	blackPlayer := game.BlackPlayer
	game.mu.Unlock()

	logger.Info("Game ended by resignation", logger.F("gameId", gameID, "winner", winner))

	endedData := gm.finalizeGame(info)

	if whitePlayer != nil {
		whitePlayer.SendMessage(NewServerMessage(MsgTypeGameEnded, endedData))
	}
	if blackPlayer != nil {
		blackPlayer.SendMessage(NewServerMessage(MsgTypeGameEnded, endedData))
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

	if game.Status == "waiting" {
		delete(gm.games, gameID)
		game.mu.Unlock()
		gm.mu.Unlock()
		client.SetGameID("")
		logger.Info("Game cancelled", logger.F("gameId", gameID))

		gm.hub.BroadcastLobbyUpdate(LobbyUpdateData{
			Action: "removed",
			GameID: gameID,
		})
		return
	}
	gm.mu.Unlock()

	var info gameEndInfo
	var opponent *Client
	shouldFinalize := false

	if game.Status == "active" {
		isWhitePlayer := game.WhitePlayer != nil && game.WhitePlayer.ID == client.ID
		winner := "white"
		if isWhitePlayer {
			winner = "black"
		}

		game.Status = "ended"
		game.Result = winner
		game.ResultReason = "abandonment"
		metrics.WSGamesActive.Dec()
		game.stopClockGoroutine()

		info = captureGameEndInfo(game)
		if isWhitePlayer {
			opponent = game.BlackPlayer
		} else {
			opponent = game.WhitePlayer
		}
		shouldFinalize = true
	}

	game.mu.Unlock()

	if shouldFinalize {
		endedData := gm.finalizeGame(info)
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

	// If game is waiting (creator disconnected before anyone joined), clean it up
	if game.Status == "waiting" {
		delete(gm.games, gameID)
		game.mu.Unlock()
		gm.mu.Unlock()
		logger.Info("Waiting game removed on disconnect", logger.F("gameId", gameID))

		gm.hub.BroadcastLobbyUpdate(LobbyUpdateData{
			Action: "removed",
			GameID: gameID,
		})
		return
	}
	gm.mu.Unlock()

	var opponent *Client
	isWhitePlayer := game.WhitePlayer != nil && game.WhitePlayer.ID == client.ID

	if isWhitePlayer {
		opponent = game.BlackPlayer
	} else {
		opponent = game.WhitePlayer
	}

	var info gameEndInfo
	shouldFinalize := false

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
		game.stopClockGoroutine()

		info = captureGameEndInfo(game)
		shouldFinalize = true
	}

	game.mu.Unlock()

	if opponent != nil && shouldFinalize {
		opponent.SendMessage(NewServerMessage(MsgTypeOpponentLeft, map[string]string{
			"gameId": gameID,
		}))
	}

	if shouldFinalize {
		endedData := gm.finalizeGame(info)
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
		g.mu.RLock()
		active := g.Status == "active"
		g.mu.RUnlock()
		if active {
			count++
		}
	}
	return count
}
