import { Board, PieceType } from "../../types/chessboard";
import { isKingInCheck } from "./check";
import { findKing, hasLegalMove } from "./utils";

export const isCheckmate = (board: Board, color: "w" | "b"): boolean => {
  const kingPosition = findKing(board, color);

  // The king is in check and the player has no legal moves
  if (!isKingInCheck(board, color, kingPosition)) return false;

  return !board.some((row, x) =>
    row.some((piece, y) => {
      if (piece?.[0] !== color) return false;
      return hasLegalMove(board, x, y, piece as PieceType, color);
    })
  );
};
