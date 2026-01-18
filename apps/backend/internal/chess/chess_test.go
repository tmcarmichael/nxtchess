package chess

import (
	"testing"
)

func TestNewGame(t *testing.T) {
	g := NewGame()
	if g == nil {
		t.Fatal("NewGame returned nil")
	}

	expectedFEN := "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
	if g.FEN() != expectedFEN {
		t.Errorf("Initial FEN = %q, want %q", g.FEN(), expectedFEN)
	}

	if !g.IsWhiteTurn() {
		t.Error("Expected white's turn")
	}

	if g.MoveNumber() != 1 {
		t.Errorf("MoveNumber = %d, want 1", g.MoveNumber())
	}
}

func TestTryMove_Valid(t *testing.T) {
	g := NewGame()

	// Test valid opening move e2-e4
	result := g.TryMove("e2", "e4", "")
	if !result.Valid {
		t.Fatalf("Move e2-e4 should be valid: %s", result.ErrorMsg)
	}
	if result.SAN != "e4" {
		t.Errorf("SAN = %q, want %q", result.SAN, "e4")
	}
	if result.MoveNum != 1 {
		t.Errorf("MoveNum = %d, want 1", result.MoveNum)
	}
	if result.GameOver {
		t.Error("Game should not be over")
	}

	// Now it's black's turn
	if g.IsWhiteTurn() {
		t.Error("Expected black's turn after e4")
	}

	// Black plays e7-e5
	result = g.TryMove("e7", "e5", "")
	if !result.Valid {
		t.Fatalf("Move e7-e5 should be valid: %s", result.ErrorMsg)
	}
	if result.SAN != "e5" {
		t.Errorf("SAN = %q, want %q", result.SAN, "e5")
	}
}

func TestTryMove_Invalid(t *testing.T) {
	g := NewGame()

	// Test invalid move - can't move pawn 3 squares
	result := g.TryMove("e2", "e5", "")
	if result.Valid {
		t.Error("Move e2-e5 should be invalid")
	}
	if result.ErrorMsg == "" {
		t.Error("Expected error message for invalid move")
	}

	// Test invalid move - wrong turn (black can't move first)
	result = g.TryMove("e7", "e5", "")
	if result.Valid {
		t.Error("Black should not be able to move first")
	}
}

func TestTryMove_Check(t *testing.T) {
	// Scholar's mate setup - white delivers check
	g := NewGame()
	g.TryMove("e2", "e4", "")
	g.TryMove("e7", "e5", "")
	g.TryMove("f1", "c4", "")
	g.TryMove("b8", "c6", "")
	g.TryMove("d1", "h5", "")
	g.TryMove("g8", "f6", "") // Black defends

	// Qxf7+ is check
	result := g.TryMove("h5", "f7", "")
	if !result.Valid {
		t.Fatalf("Move Qxf7+ should be valid: %s", result.ErrorMsg)
	}
	if !result.IsCheck {
		t.Error("Qxf7+ should be check")
	}
	if !result.GameOver {
		t.Error("Expected checkmate")
	}
	if result.Result != ResultWhiteWins {
		t.Errorf("Result = %q, want %q", result.Result, ResultWhiteWins)
	}
	if result.Reason != ReasonCheckmate {
		t.Errorf("Reason = %q, want %q", result.Reason, ReasonCheckmate)
	}
}

func TestTryMove_Promotion(t *testing.T) {
	// Set up a position where pawn can promote (king not on queen's lines)
	fen := "8/P7/8/8/8/2k5/8/4K3 w - - 0 1"
	g, err := NewGameFromFEN(fen)
	if err != nil {
		t.Fatalf("Failed to create game from FEN: %v", err)
	}

	// Promote to queen
	result := g.TryMove("a7", "a8", "q")
	if !result.Valid {
		t.Fatalf("Promotion should be valid: %s", result.ErrorMsg)
	}
	if result.SAN != "a8=Q" {
		t.Errorf("SAN = %q, want %q", result.SAN, "a8=Q")
	}
}

func TestResign(t *testing.T) {
	g := NewGame()
	g.TryMove("e2", "e4", "")

	result, reason := g.Resign(true) // White resigns
	if result != ResultBlackWins {
		t.Errorf("Result = %q, want %q", result, ResultBlackWins)
	}
	if reason != ReasonResignation {
		t.Errorf("Reason = %q, want %q", reason, ReasonResignation)
	}

	if !g.IsGameOver() {
		t.Error("Game should be over after resignation")
	}
}

func TestLegalMoves(t *testing.T) {
	g := NewGame()
	moves := g.LegalMoves()

	// Initial position has 20 legal moves (16 pawn + 4 knight)
	if len(moves) != 20 {
		t.Errorf("Initial position has %d legal moves, want 20", len(moves))
	}

	// Verify e2e4 is among legal moves
	found := false
	for _, m := range moves {
		if m == "e2e4" {
			found = true
			break
		}
	}
	if !found {
		t.Error("e2e4 should be a legal move")
	}
}
