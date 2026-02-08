package ws

import "encoding/json"

// Message types for client -> server
const (
	// Connection
	MsgTypePing = "PING"

	// Game lifecycle
	MsgTypeGameCreate = "GAME_CREATE"
	MsgTypeGameJoin   = "GAME_JOIN"
	MsgTypeGameLeave  = "GAME_LEAVE"

	// Gameplay
	MsgTypeMove   = "MOVE"
	MsgTypeResign = "RESIGN"

	// Matchmaking (future)
	MsgTypeMatchmakingJoin   = "MATCHMAKING_JOIN"
	MsgTypeMatchmakingCancel = "MATCHMAKING_CANCEL"
)

// Message types for server -> client
const (
	MsgTypePong  = "PONG"
	MsgTypeError = "ERROR"

	// Game lifecycle responses
	MsgTypeGameCreated  = "GAME_CREATED"
	MsgTypeGameJoined   = "GAME_JOINED"
	MsgTypeGameStarted  = "GAME_STARTED"
	MsgTypeGameNotFound = "GAME_NOT_FOUND"
	MsgTypeGameFull     = "GAME_FULL"
	MsgTypeGameEnded    = "GAME_ENDED"

	// Gameplay responses
	MsgTypeMoveAccepted = "MOVE_ACCEPTED"
	MsgTypeMoveRejected = "MOVE_REJECTED"
	MsgTypeOpponentMove = "OPPONENT_MOVE"
	MsgTypeOpponentLeft = "OPPONENT_LEFT"
	MsgTypeTimeUpdate   = "TIME_UPDATE"

	// Matchmaking responses (future)
	MsgTypeMatchmakingWaiting = "MATCHMAKING_WAITING"
	MsgTypeMatchmakingMatched = "MATCHMAKING_MATCHED"
)

// ClientMessage represents a message from client to server
type ClientMessage struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data,omitempty"`
}

// ServerMessage represents a message from server to client
type ServerMessage struct {
	Type string      `json:"type"`
	Data interface{} `json:"data,omitempty"`
}

// Game lifecycle payloads

// GameCreateData is sent by client to create a new game
type GameCreateData struct {
	TimeControl *TimeControl `json:"timeControl,omitempty"`
}

// TimeControl represents time settings for a game
type TimeControl struct {
	InitialTime int `json:"initialTime"` // seconds
	Increment   int `json:"increment"`   // seconds per move
}

// GameJoinData is sent by client to join an existing game
type GameJoinData struct {
	GameID string `json:"gameId"`
}

// GameCreatedData is sent to client when game is created
type GameCreatedData struct {
	GameID string `json:"gameId"`
	Color  string `json:"color"` // "white" or "black"
}

// GameJoinedData is sent to client when they join a game
type GameJoinedData struct {
	GameID   string `json:"gameId"`
	Color    string `json:"color"`
	Opponent string `json:"opponent,omitempty"` // opponent's username if available
}

// GameStartedData is sent to both players when game begins
type GameStartedData struct {
	GameID      string       `json:"gameId"`
	FEN         string       `json:"fen"`
	WhitePlayer PlayerInfo   `json:"whitePlayer"`
	BlackPlayer PlayerInfo   `json:"blackPlayer"`
	TimeControl *TimeControl `json:"timeControl,omitempty"`
	WhiteTimeMs int          `json:"whiteTimeMs,omitempty"` // initial time in milliseconds
	BlackTimeMs int          `json:"blackTimeMs,omitempty"` // initial time in milliseconds
}

// PlayerInfo contains info about a player
type PlayerInfo struct {
	ID       string `json:"id"`
	Username string `json:"username,omitempty"`
	Rating   int    `json:"rating,omitempty"`
}

// GameEndedData is sent when game ends
type GameEndedData struct {
	GameID           string `json:"gameId"`
	Result           string `json:"result"` // "white", "black", "draw"
	Reason           string `json:"reason"` // "checkmate", "resignation", "timeout", "stalemate", "agreement"
	WhiteRating      *int   `json:"whiteRating,omitempty"`
	BlackRating      *int   `json:"blackRating,omitempty"`
	WhiteRatingDelta *int   `json:"whiteRatingDelta,omitempty"`
	BlackRatingDelta *int   `json:"blackRatingDelta,omitempty"`
}

// Gameplay payloads

// MoveData is sent by client to make a move
type MoveData struct {
	GameID    string `json:"gameId"`
	From      string `json:"from"`
	To        string `json:"to"`
	Promotion string `json:"promotion,omitempty"` // "q", "r", "b", "n"
}

// MoveAcceptedData confirms a move was accepted
type MoveAcceptedData struct {
	GameID      string `json:"gameId"`
	From        string `json:"from"`
	To          string `json:"to"`
	SAN         string `json:"san"` // Standard algebraic notation (e.g., "e4", "Nxf3+")
	FEN         string `json:"fen"`
	MoveNum     int    `json:"moveNum"`
	IsCheck     bool   `json:"isCheck,omitempty"`
	WhiteTimeMs int    `json:"whiteTimeMs,omitempty"` // remaining milliseconds
	BlackTimeMs int    `json:"blackTimeMs,omitempty"`
}

// MoveRejectedData indicates a move was rejected
type MoveRejectedData struct {
	GameID  string `json:"gameId"`
	Reason  string `json:"reason"`
	FEN     string `json:"fen"` // correct FEN for client to sync
	MoveNum int    `json:"moveNum"`
}

// OpponentMoveData notifies client of opponent's move
type OpponentMoveData struct {
	GameID      string `json:"gameId"`
	From        string `json:"from"`
	To          string `json:"to"`
	Promotion   string `json:"promotion,omitempty"`
	SAN         string `json:"san"` // Standard algebraic notation
	FEN         string `json:"fen"`
	MoveNum     int    `json:"moveNum"`
	IsCheck     bool   `json:"isCheck,omitempty"`
	WhiteTimeMs int    `json:"whiteTimeMs,omitempty"` // remaining milliseconds
	BlackTimeMs int    `json:"blackTimeMs,omitempty"`
}

// ResignData is sent by client to resign
type ResignData struct {
	GameID string `json:"gameId"`
}

// TimeUpdateData is sent periodically to update clocks
type TimeUpdateData struct {
	GameID    string `json:"gameId"`
	WhiteTime int    `json:"whiteTime"` // milliseconds remaining
	BlackTime int    `json:"blackTime"` // milliseconds remaining
}

// ErrorData contains error information
type ErrorData struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// NewServerMessage creates a new server message
func NewServerMessage(msgType string, data interface{}) *ServerMessage {
	return &ServerMessage{
		Type: msgType,
		Data: data,
	}
}

// NewErrorMessage creates an error message
func NewErrorMessage(code, message string) *ServerMessage {
	return &ServerMessage{
		Type: MsgTypeError,
		Data: ErrorData{
			Code:    code,
			Message: message,
		},
	}
}
