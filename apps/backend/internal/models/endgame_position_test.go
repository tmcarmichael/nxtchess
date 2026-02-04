package models

import (
	"testing"
)

func TestDifficultyToRatingRange(t *testing.T) {
	tests := []struct {
		name       string
		difficulty int
		wantMin    int
		wantMax    int
	}{
		{"difficulty 1", 1, 0, 500},
		{"difficulty 2", 2, 400, 800},
		{"difficulty 3", 3, 700, 1100},
		{"difficulty 4", 4, 1000, 1400},
		{"difficulty 5", 5, 1300, 1700},
		{"difficulty 6", 6, 1600, 2000},
		{"difficulty 7", 7, 1900, 2300},
		{"difficulty 8", 8, 2200, 2600},
		{"difficulty 9", 9, 2500, 2800},
		{"difficulty 10", 10, 2700, 3500},

		// Default cases
		{"difficulty 0 defaults", 0, 1300, 1700},
		{"difficulty 11 defaults", 11, 1300, 1700},
		{"difficulty -1 defaults", -1, 1300, 1700},
		{"difficulty 100 defaults", 100, 1300, 1700},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotMin, gotMax := DifficultyToRatingRange(tt.difficulty)
			if gotMin != tt.wantMin || gotMax != tt.wantMax {
				t.Errorf("DifficultyToRatingRange(%d) = (%d, %d), want (%d, %d)",
					tt.difficulty, gotMin, gotMax, tt.wantMin, tt.wantMax)
			}
		})
	}
}

func TestDifficultyRatingRangeOverlap(t *testing.T) {
	// Verify that consecutive difficulty levels have overlapping rating ranges
	// to ensure a smooth difficulty curve without gaps.
	for difficulty := 1; difficulty <= 9; difficulty++ {
		_, currentMax := DifficultyToRatingRange(difficulty)
		nextMin, _ := DifficultyToRatingRange(difficulty + 1)

		if currentMax <= nextMin {
			t.Errorf("No overlap between difficulty %d (max %d) and difficulty %d (min %d): "+
				"there would be a gap in the rating curve",
				difficulty, currentMax, difficulty+1, nextMin)
		}
	}
}

func TestDifficultyRatingRangeMonotonicity(t *testing.T) {
	// Verify that difficulty levels are monotonically increasing:
	// each level's min should be greater than the previous level's min,
	// and each level's max should be greater than the previous level's max.
	for difficulty := 2; difficulty <= 10; difficulty++ {
		prevMin, prevMax := DifficultyToRatingRange(difficulty - 1)
		currMin, currMax := DifficultyToRatingRange(difficulty)

		if currMin <= prevMin {
			t.Errorf("Difficulty %d min (%d) should be greater than difficulty %d min (%d)",
				difficulty, currMin, difficulty-1, prevMin)
		}
		if currMax <= prevMax {
			t.Errorf("Difficulty %d max (%d) should be greater than difficulty %d max (%d)",
				difficulty, currMax, difficulty-1, prevMax)
		}
	}
}

func TestDifficultyRatingRangeValidity(t *testing.T) {
	// Verify that for each difficulty level, min < max.
	for difficulty := 1; difficulty <= 10; difficulty++ {
		min, max := DifficultyToRatingRange(difficulty)
		if min >= max {
			t.Errorf("DifficultyToRatingRange(%d): min (%d) should be less than max (%d)",
				difficulty, min, max)
		}
	}
}
