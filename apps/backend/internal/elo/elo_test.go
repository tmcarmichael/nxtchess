package elo

import (
	"testing"
)

func TestCalculateEqualRatingsWhiteWins(t *testing.T) {
	rc := Calculate(1200, 1200, 1.0, 20, 20)
	if rc.WhiteDelta != 16 {
		t.Errorf("expected white delta 16, got %d", rc.WhiteDelta)
	}
	if rc.BlackDelta != -16 {
		t.Errorf("expected black delta -16, got %d", rc.BlackDelta)
	}
}

func TestCalculateEqualRatingsDraw(t *testing.T) {
	rc := Calculate(1200, 1200, 0.5, 20, 20)
	if rc.WhiteDelta != 0 {
		t.Errorf("expected white delta 0, got %d", rc.WhiteDelta)
	}
	if rc.BlackDelta != 0 {
		t.Errorf("expected black delta 0, got %d", rc.BlackDelta)
	}
}

func TestCalculateEqualRatingsBlackWins(t *testing.T) {
	rc := Calculate(1200, 1200, 0.0, 20, 20)
	if rc.WhiteDelta != -16 {
		t.Errorf("expected white delta -16, got %d", rc.WhiteDelta)
	}
	if rc.BlackDelta != 16 {
		t.Errorf("expected black delta 16, got %d", rc.BlackDelta)
	}
}

func TestCalculateUnderdogWins(t *testing.T) {
	// 1000 rated beats 1800 rated - should get a large swing
	rc := Calculate(1000, 1800, 1.0, 20, 20)
	if rc.WhiteDelta <= 16 {
		t.Errorf("expected underdog white delta > 16, got %d", rc.WhiteDelta)
	}
	if rc.BlackDelta >= -16 {
		t.Errorf("expected favored black delta < -16, got %d", rc.BlackDelta)
	}
}

func TestCalculateHigherRatedWins(t *testing.T) {
	// 1800 rated beats 1000 rated - should get a small swing
	rc := Calculate(1800, 1000, 1.0, 20, 20)
	if rc.WhiteDelta >= 16 {
		t.Errorf("expected favored white delta < 16, got %d", rc.WhiteDelta)
	}
}

func TestCalculateNewPlayerKFactor(t *testing.T) {
	// New player (<10 games) gets K=40
	rc := Calculate(1200, 1200, 1.0, 5, 20)
	if rc.WhiteDelta != 20 {
		t.Errorf("expected white delta 20 with K=40, got %d", rc.WhiteDelta)
	}
	if rc.BlackDelta != -16 {
		t.Errorf("expected black delta -16 with K=32, got %d", rc.BlackDelta)
	}
}

func TestCalculateBothNewPlayers(t *testing.T) {
	rc := Calculate(1200, 1200, 1.0, 3, 5)
	if rc.WhiteDelta != 20 {
		t.Errorf("expected white delta 20 with K=40, got %d", rc.WhiteDelta)
	}
	if rc.BlackDelta != -20 {
		t.Errorf("expected black delta -20 with K=40, got %d", rc.BlackDelta)
	}
}

func TestCalculateFloorAtZero(t *testing.T) {
	rc := Calculate(10, 1200, 0.0, 20, 20)
	if rc.WhiteNew < 0 {
		t.Errorf("rating should not go below 0, got %d", rc.WhiteNew)
	}
	if rc.WhiteDelta != rc.WhiteNew-10 {
		t.Errorf("delta should reflect clamped value")
	}
}

func TestCalculateCeilingAt4000(t *testing.T) {
	rc := Calculate(3995, 1200, 1.0, 20, 20)
	if rc.WhiteNew > 4000 {
		t.Errorf("rating should not exceed 4000, got %d", rc.WhiteNew)
	}
}

func TestCalculatePuzzleSolvedEqualRating(t *testing.T) {
	rc := CalculatePuzzle(1200, 1200, true, 20)
	if rc.PlayerDelta != 16 {
		t.Errorf("expected player delta 16, got %d", rc.PlayerDelta)
	}
}

func TestCalculatePuzzleFailedEqualRating(t *testing.T) {
	rc := CalculatePuzzle(1200, 1200, false, 20)
	if rc.PlayerDelta != -16 {
		t.Errorf("expected player delta -16, got %d", rc.PlayerDelta)
	}
}

func TestCalculatePuzzleSolvedHarderPuzzle(t *testing.T) {
	rc := CalculatePuzzle(1200, 1800, true, 20)
	if rc.PlayerDelta <= 16 {
		t.Errorf("expected player delta > 16 for harder puzzle, got %d", rc.PlayerDelta)
	}
}

func TestCalculatePuzzleFailedEasierPuzzle(t *testing.T) {
	rc := CalculatePuzzle(1800, 1200, false, 20)
	if rc.PlayerDelta >= -16 {
		t.Errorf("expected player delta < -16 for easier puzzle fail, got %d", rc.PlayerDelta)
	}
}

func TestCalculatePuzzleNewPlayerKFactor(t *testing.T) {
	rc := CalculatePuzzle(1200, 1200, true, 5)
	if rc.PlayerDelta != 20 {
		t.Errorf("expected player delta 20 with K=40, got %d", rc.PlayerDelta)
	}
}

func TestResultFromWinner(t *testing.T) {
	if ResultFromWinner("white") != 1.0 {
		t.Error("white should be 1.0")
	}
	if ResultFromWinner("black") != 0.0 {
		t.Error("black should be 0.0")
	}
	if ResultFromWinner("draw") != 0.5 {
		t.Error("draw should be 0.5")
	}
}

func TestResultToPGN(t *testing.T) {
	if ResultToPGN("white") != "1-0" {
		t.Error("white should be 1-0")
	}
	if ResultToPGN("black") != "0-1" {
		t.Error("black should be 0-1")
	}
	if ResultToPGN("draw") != "1/2-1/2" {
		t.Error("draw should be 1/2-1/2")
	}
	if ResultToPGN("") != "*" {
		t.Error("empty should be *")
	}
}
