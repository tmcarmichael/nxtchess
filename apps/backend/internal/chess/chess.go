package chess

import (
	"fmt"
	"strings"

	"github.com/notnil/chess"
)

// GameResult represents the outcome of a game
type GameResult string

const (
	ResultNone      GameResult = ""
	ResultWhiteWins GameResult = "white"
	ResultBlackWins GameResult = "black"
	ResultDraw      GameResult = "draw"
)

// GameEndReason explains why the game ended
type GameEndReason string

const (
	ReasonNone              GameEndReason = ""
	ReasonCheckmate         GameEndReason = "checkmate"
	ReasonStalemate         GameEndReason = "stalemate"
	ReasonResignation       GameEndReason = "resignation"
	ReasonTimeout           GameEndReason = "timeout"
	ReasonDisconnection     GameEndReason = "disconnection"
	ReasonAbandonment       GameEndReason = "abandonment"
	ReasonInsufficientMaterial GameEndReason = "insufficient_material"
	ReasonThreefoldRepetition  GameEndReason = "threefold_repetition"
	ReasonFiftyMoveRule     GameEndReason = "fifty_move_rule"
	ReasonAgreement         GameEndReason = "agreement"
)

// MoveResult contains the result of attempting a move
type MoveResult struct {
	Valid       bool
	NewFEN      string
	MoveNum     int
	IsCheck     bool
	GameOver    bool
	Result      GameResult
	Reason      GameEndReason
	SAN         string // Standard Algebraic Notation (e.g., "e4", "Nxf3+")
	ErrorMsg    string
}

// Game wraps the chess library for our use case
type Game struct {
	game *chess.Game
}

// NewGame creates a new chess game from starting position
func NewGame() *Game {
	return &Game{
		game: chess.NewGame(),
	}
}

// NewGameFromFEN creates a game from a FEN string
func NewGameFromFEN(fen string) (*Game, error) {
	fenOpt, err := chess.FEN(fen)
	if err != nil {
		return nil, fmt.Errorf("invalid FEN: %w", err)
	}
	return &Game{
		game: chess.NewGame(fenOpt),
	}, nil
}

// FEN returns the current position in FEN notation
func (g *Game) FEN() string {
	return g.game.FEN()
}

// MoveNumber returns the current full move number
func (g *Game) MoveNumber() int {
	// FEN has full move number as the 6th field
	// We can count moves from the move history
	moves := g.game.Moves()
	return (len(moves) / 2) + 1
}

// Turn returns whose turn it is ("white" or "black")
func (g *Game) Turn() string {
	if g.game.Position().Turn() == chess.White {
		return "white"
	}
	return "black"
}

// IsWhiteTurn returns true if it's white's turn
func (g *Game) IsWhiteTurn() bool {
	return g.game.Position().Turn() == chess.White
}

// TryMove attempts to make a move and returns the result
// from/to are in algebraic notation (e.g., "e2", "e4")
// promotion is optional ("q", "r", "b", "n")
func (g *Game) TryMove(from, to, promotion string) MoveResult {
	// Find the matching legal move
	move := g.findMove(from, to, promotion)
	if move == nil {
		return MoveResult{
			Valid:    false,
			NewFEN:   g.FEN(),
			MoveNum:  g.MoveNumber(),
			ErrorMsg: "Illegal move",
		}
	}

	// Get SAN notation BEFORE making the move (requires position before move)
	san := chess.AlgebraicNotation{}.Encode(g.game.Position(), move)

	// Make the move
	if err := g.game.Move(move); err != nil {
		return MoveResult{
			Valid:    false,
			NewFEN:   g.FEN(),
			MoveNum:  g.MoveNumber(),
			ErrorMsg: err.Error(),
		}
	}

	// Check game state after move
	result := MoveResult{
		Valid:   true,
		NewFEN:  g.FEN(),
		MoveNum: g.MoveNumber(),
		SAN:     san,
		IsCheck: g.IsInCheck(),
	}

	// Check for game over conditions
	outcome := g.game.Outcome()
	if outcome != chess.NoOutcome {
		result.GameOver = true
		result.Result, result.Reason = g.interpretOutcome(outcome)
	}

	return result
}

// findMove finds a legal move matching from/to/promotion
func (g *Game) findMove(from, to, promotion string) *chess.Move {
	from = strings.ToLower(from)
	to = strings.ToLower(to)
	promotion = strings.ToLower(promotion)

	// Find matching move among legal moves by comparing square strings
	for _, move := range g.game.ValidMoves() {
		fromMatch := strings.ToLower(move.S1().String()) == from
		toMatch := strings.ToLower(move.S2().String()) == to

		if fromMatch && toMatch {
			// Check promotion matches if it's a promotion move
			if move.Promo() != chess.NoPieceType {
				promoChar := strings.ToLower(string(move.Promo().String()[0]))
				if promotion == "" {
					// Promotion required but not specified - default to queen
					if move.Promo() == chess.Queen {
						return move
					}
				} else if promoChar == promotion {
					return move
				}
			} else if promotion == "" {
				// Not a promotion move and no promotion specified
				return move
			}
		}
	}

	return nil
}

// interpretOutcome converts chess library outcome to our types
func (g *Game) interpretOutcome(outcome chess.Outcome) (GameResult, GameEndReason) {
	method := g.game.Method()

	switch outcome {
	case chess.WhiteWon:
		switch method {
		case chess.Checkmate:
			return ResultWhiteWins, ReasonCheckmate
		case chess.Resignation:
			return ResultWhiteWins, ReasonResignation
		default:
			return ResultWhiteWins, ReasonNone
		}
	case chess.BlackWon:
		switch method {
		case chess.Checkmate:
			return ResultBlackWins, ReasonCheckmate
		case chess.Resignation:
			return ResultBlackWins, ReasonResignation
		default:
			return ResultBlackWins, ReasonNone
		}
	case chess.Draw:
		switch method {
		case chess.Stalemate:
			return ResultDraw, ReasonStalemate
		case chess.InsufficientMaterial:
			return ResultDraw, ReasonInsufficientMaterial
		case chess.ThreefoldRepetition:
			return ResultDraw, ReasonThreefoldRepetition
		case chess.FiftyMoveRule:
			return ResultDraw, ReasonFiftyMoveRule
		case chess.DrawOffer:
			return ResultDraw, ReasonAgreement
		default:
			return ResultDraw, ReasonNone
		}
	}

	return ResultNone, ReasonNone
}

// IsInCheck returns true if the current player is in check
// (checks if the last move delivered check)
func (g *Game) IsInCheck() bool {
	moves := g.game.Moves()
	if len(moves) == 0 {
		return false
	}
	lastMove := moves[len(moves)-1]
	return lastMove.HasTag(chess.Check)
}

// IsGameOver returns true if the game has ended
func (g *Game) IsGameOver() bool {
	return g.game.Outcome() != chess.NoOutcome
}

// GetOutcome returns the game result and reason if game is over
func (g *Game) GetOutcome() (GameResult, GameEndReason) {
	outcome := g.game.Outcome()
	if outcome == chess.NoOutcome {
		return ResultNone, ReasonNone
	}
	return g.interpretOutcome(outcome)
}

// Resign records a resignation
func (g *Game) Resign(isWhite bool) (GameResult, GameEndReason) {
	if isWhite {
		g.game.Resign(chess.White)
		return ResultBlackWins, ReasonResignation
	}
	g.game.Resign(chess.Black)
	return ResultWhiteWins, ReasonResignation
}

// PGN returns the game in PGN format
func (g *Game) PGN() string {
	return g.game.String()
}

// Moves returns all moves made in the game in UCI format (e.g., "e2e4")
func (g *Game) Moves() []string {
	moves := g.game.Moves()
	result := make([]string, len(moves))
	for i, m := range moves {
		result[i] = m.S1().String() + m.S2().String()
		if m.Promo() != chess.NoPieceType {
			result[i] += strings.ToLower(m.Promo().String())
		}
	}
	return result
}

// LegalMoves returns all legal moves from the current position
func (g *Game) LegalMoves() []string {
	moves := g.game.ValidMoves()
	result := make([]string, len(moves))
	for i, m := range moves {
		result[i] = m.S1().String() + m.S2().String()
		if m.Promo() != chess.NoPieceType {
			result[i] += strings.ToLower(m.Promo().String())
		}
	}
	return result
}

// InnerGame returns the underlying notnil/chess Game for advanced analysis
func (g *Game) InnerGame() *chess.Game {
	return g.game
}

// Clone creates a copy of the game
func (g *Game) Clone() *Game {
	newGame, _ := NewGameFromFEN(g.FEN())
	return newGame
}
