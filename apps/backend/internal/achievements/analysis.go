package achievements

import (
	"github.com/notnil/chess"
)

type GameFlags struct {
	HasPromotion      bool
	HasUnderpromotion bool
	HasEnPassant      bool
	IsBackRankMate    bool
	IsScholarsMate    bool
	MoveCount         int
}

func AnalyzeGame(g *chess.Game, winnerColor string) GameFlags {
	moves := g.Moves()
	flags := GameFlags{
		MoveCount: len(moves),
	}

	for _, move := range moves {
		if move.HasTag(chess.EnPassant) {
			flags.HasEnPassant = true
		}
		if move.Promo() != chess.NoPieceType {
			flags.HasPromotion = true
			if move.Promo() != chess.Queen {
				flags.HasUnderpromotion = true
			}
		}
	}

	if g.Method() == chess.Checkmate {
		flags.IsBackRankMate = checkBackRankMate(g)
		flags.IsScholarsMate = checkScholarsMate(moves)
	}

	return flags
}

func checkBackRankMate(g *chess.Game) bool {
	pos := g.Position()
	board := pos.Board()

	loserColor := pos.Turn()

	var backRank chess.Rank
	if loserColor == chess.White {
		backRank = chess.Rank1
	} else {
		backRank = chess.Rank8
	}

	var kingPiece chess.Piece
	if loserColor == chess.White {
		kingPiece = chess.WhiteKing
	} else {
		kingPiece = chess.BlackKing
	}

	sqMap := board.SquareMap()
	kingOnBackRank := false
	for sq, piece := range sqMap {
		if piece == kingPiece && sq.Rank() == backRank {
			kingOnBackRank = true
			break
		}
	}

	return kingOnBackRank
}

func checkScholarsMate(moves []*chess.Move) bool {
	return len(moves) <= 7 && len(moves) >= 4
}
