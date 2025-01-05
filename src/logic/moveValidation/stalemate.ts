import { Board, PieceType } from "../../types/chessboard";
import { isKingInCheck } from "./check";
import { findKing, hasLegalMove } from "./utils";

export const isStalemate = (board: Board, color: "w" | "b"): boolean => {
  const kingPosition = findKing(board, color);
  if (isInsufficientMaterial(board)) return true;

  // The king is NOT in check and the player has no legal moves
  return (
    !isKingInCheck(board, color, kingPosition) &&
    !board.some((row, x) =>
      row.some(
        (piece, y) => piece?.[0] === color && hasLegalMove(board, x, y, piece as PieceType, color)
      )
    )
  );
};

const isInsufficientMaterial = (board: Board): boolean => {
  const pieces = board.flat().filter((piece) => piece);
  if (pieces.length <= 2) return true;
  if (pieces.length === 3) {
    const singlePiece = pieces.find((piece) => piece?.[1] !== "K");
    return singlePiece?.[1] === "B" || singlePiece?.[1] === "N";
  }
  return false;
};
