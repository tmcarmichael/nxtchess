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

func TestCastling_Kingside(t *testing.T) {
	// Position where white can castle kingside
	fen := "r1bqk2r/ppppbppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4"
	g, err := NewGameFromFEN(fen)
	if err != nil {
		t.Fatalf("Failed to create game from FEN: %v", err)
	}

	result := g.TryMove("e1", "g1", "")
	if !result.Valid {
		t.Fatalf("Kingside castling should be valid: %s", result.ErrorMsg)
	}
	if result.SAN != "O-O" {
		t.Errorf("SAN = %q, want %q", result.SAN, "O-O")
	}
}

func TestCastling_Queenside(t *testing.T) {
	// Position where white can castle queenside
	fen := "r3kbnr/pppqpppp/2n5/3p1b2/3P1B2/2N5/PPPQPPPP/R3KBNR w KQkq - 6 5"
	g, err := NewGameFromFEN(fen)
	if err != nil {
		t.Fatalf("Failed to create game from FEN: %v", err)
	}

	result := g.TryMove("e1", "c1", "")
	if !result.Valid {
		t.Fatalf("Queenside castling should be valid: %s", result.ErrorMsg)
	}
	if result.SAN != "O-O-O" {
		t.Errorf("SAN = %q, want %q", result.SAN, "O-O-O")
	}
}

func TestEnPassant(t *testing.T) {
	// Position after 1.e4 d5 2.e5 f5 — white can capture en passant on f6
	fen := "rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 3"
	g, err := NewGameFromFEN(fen)
	if err != nil {
		t.Fatalf("Failed to create game from FEN: %v", err)
	}

	result := g.TryMove("e5", "f6", "")
	if !result.Valid {
		t.Fatalf("En passant should be valid: %s", result.ErrorMsg)
	}
	if result.SAN != "exf6" {
		t.Errorf("SAN = %q, want %q", result.SAN, "exf6")
	}
}

func TestPromotion_AllPieces(t *testing.T) {
	fen := "8/P7/8/8/8/2k5/8/4K3 w - - 0 1"

	tests := []struct {
		promo   string
		wantSAN string
	}{
		{"q", "a8=Q"},
		{"r", "a8=R"},
		{"b", "a8=B"},
		{"n", "a8=N"},
	}

	for _, tt := range tests {
		t.Run("promote_to_"+tt.promo, func(t *testing.T) {
			g, err := NewGameFromFEN(fen)
			if err != nil {
				t.Fatalf("Failed to create game from FEN: %v", err)
			}

			result := g.TryMove("a7", "a8", tt.promo)
			if !result.Valid {
				t.Fatalf("Promotion to %s should be valid: %s", tt.promo, result.ErrorMsg)
			}
			if result.SAN != tt.wantSAN {
				t.Errorf("SAN = %q, want %q", result.SAN, tt.wantSAN)
			}
		})
	}
}

func TestStalemate(t *testing.T) {
	// Black to move, no legal moves, not in check = stalemate
	fen := "k7/8/1K1Q4/8/8/8/8/8 b - - 0 1"
	g, err := NewGameFromFEN(fen)
	if err != nil {
		t.Fatalf("Failed to create game from FEN: %v", err)
	}

	if !g.IsGameOver() {
		t.Fatal("Expected stalemate (game should be over)")
	}

	result, reason := g.GetOutcome()
	if result != ResultDraw {
		t.Errorf("Result = %q, want %q", result, ResultDraw)
	}
	if reason != ReasonStalemate {
		t.Errorf("Reason = %q, want %q", reason, ReasonStalemate)
	}
}

func TestInsufficientMaterial(t *testing.T) {
	// King vs King — insufficient material
	fen := "4k3/8/8/8/8/8/8/4K3 w - - 0 1"
	g, err := NewGameFromFEN(fen)
	if err != nil {
		t.Fatalf("Failed to create game from FEN: %v", err)
	}

	if !g.IsGameOver() {
		t.Fatal("Expected draw by insufficient material")
	}

	result, reason := g.GetOutcome()
	if result != ResultDraw {
		t.Errorf("Result = %q, want %q", result, ResultDraw)
	}
	if reason != ReasonInsufficientMaterial {
		t.Errorf("Reason = %q, want %q", reason, ReasonInsufficientMaterial)
	}
}

func TestNewGameFromFEN_Invalid(t *testing.T) {
	_, err := NewGameFromFEN("not a valid fen")
	if err == nil {
		t.Error("Expected error for invalid FEN")
	}
}

func TestClone(t *testing.T) {
	g := NewGame()
	g.TryMove("e2", "e4", "")

	clone := g.Clone()
	if clone.FEN() != g.FEN() {
		t.Errorf("Clone FEN = %q, want %q", clone.FEN(), g.FEN())
	}

	// Moves on clone shouldn't affect original
	clone.TryMove("e7", "e5", "")
	if clone.FEN() == g.FEN() {
		t.Error("Clone and original should have different FEN after diverging moves")
	}
}

func TestMovesHistory(t *testing.T) {
	g := NewGame()
	g.TryMove("e2", "e4", "")
	g.TryMove("e7", "e5", "")
	g.TryMove("g1", "f3", "")

	moves := g.Moves()
	if len(moves) != 3 {
		t.Fatalf("Expected 3 moves in history, got %d", len(moves))
	}

	expected := []string{"e2e4", "e7e5", "g1f3"}
	for i, want := range expected {
		if moves[i] != want {
			t.Errorf("Move %d = %q, want %q", i, moves[i], want)
		}
	}
}
