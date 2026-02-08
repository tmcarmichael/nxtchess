package elo

import "math"

type RatingChange struct {
	WhiteOld, BlackOld     int
	WhiteNew, BlackNew     int
	WhiteDelta, BlackDelta int
}

func kFactor(gamesPlayed int) float64 {
	if gamesPlayed < 10 {
		return 40
	}
	return 32
}

func expectedScore(ratingA, ratingB int) float64 {
	return 1.0 / (1.0 + math.Pow(10, float64(ratingB-ratingA)/400.0))
}

func clamp(val, min, max int) int {
	if val < min {
		return min
	}
	if val > max {
		return max
	}
	return val
}

func Calculate(whiteRating, blackRating int, result float64, whiteGames, blackGames int) RatingChange {
	whiteExpected := expectedScore(whiteRating, blackRating)
	blackExpected := 1.0 - whiteExpected

	whiteK := kFactor(whiteGames)
	blackK := kFactor(blackGames)

	whiteDelta := int(math.Round(whiteK * (result - whiteExpected)))
	blackDelta := int(math.Round(blackK * ((1.0 - result) - blackExpected)))

	whiteNew := clamp(whiteRating+whiteDelta, 0, 4000)
	blackNew := clamp(blackRating+blackDelta, 0, 4000)

	return RatingChange{
		WhiteOld:   whiteRating,
		BlackOld:   blackRating,
		WhiteNew:   whiteNew,
		BlackNew:   blackNew,
		WhiteDelta: whiteNew - whiteRating,
		BlackDelta: blackNew - blackRating,
	}
}

type PuzzleRatingChange struct {
	PlayerOld, PlayerNew, PlayerDelta int
}

func CalculatePuzzle(playerRating, puzzleRating int, solved bool, puzzleGamesPlayed int) PuzzleRatingChange {
	var result float64
	if solved {
		result = 1.0
	}

	expected := expectedScore(playerRating, puzzleRating)
	k := kFactor(puzzleGamesPlayed)
	delta := int(math.Round(k * (result - expected)))
	newRating := clamp(playerRating+delta, 0, 4000)

	return PuzzleRatingChange{
		PlayerOld:   playerRating,
		PlayerNew:   newRating,
		PlayerDelta: newRating - playerRating,
	}
}

func ResultFromWinner(winner string) float64 {
	switch winner {
	case "white":
		return 1.0
	case "black":
		return 0.0
	default:
		return 0.5
	}
}

func ResultToPGN(winner string) string {
	switch winner {
	case "white":
		return "1-0"
	case "black":
		return "0-1"
	case "draw":
		return "1/2-1/2"
	default:
		return "*"
	}
}
