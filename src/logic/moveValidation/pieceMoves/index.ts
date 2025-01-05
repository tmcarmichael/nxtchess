import { getPawnMoves } from "./pawn";
import { getRookMoves } from "./rook";
import { getKnightMoves } from "./knight";
import { getBishopMoves } from "./bishop";
import { getQueenMoves } from "./queen";
import { getKingMoves } from "./king";
import { Board, PieceType } from "../../../types/chessboard";
import { Move } from "../../../types/pieceMoves";

const moveGenerators: Record<
  string,
  (board: Board, x: number, y: number, piece: PieceType) => Move[]
> = {
  P: getPawnMoves,
  R: getRookMoves,
  N: getKnightMoves,
  B: getBishopMoves,
  Q: getQueenMoves,
  K: getKingMoves,
};

export const getPieceMoveGenerator = (
  piece: PieceType
): ((board: Board, x: number, y: number, piece: PieceType) => Move[]) => {
  const generator = moveGenerators[piece[1]];
  if (!generator) {
    throw new Error(`Unknown piece type: ${piece}`);
  }
  return generator;
};
