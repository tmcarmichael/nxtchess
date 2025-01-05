import { Board, PieceType } from "../../types/chessboard";
import { isKingInCheck } from "./check";
import { getPieceMoveGenerator } from "./pieceMoves";
import { Move } from "../../types/pieceMoves";

export const isStalemate = (board: Board, color: "w" | "b"): boolean => {
  const kingPosition = findKing(board, color);

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

const findKing = (board: Board, color: "w" | "b"): [number, number] => {
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = board[x][y];
      if (piece?.[1] === "K" && piece[0] === color) return [x, y];
    }
  }
  throw new Error(`King for ${color} not found`);
};

const hasLegalMove = (
  board: Board,
  x: number,
  y: number,
  piece: PieceType,
  color: "w" | "b"
): boolean => {
  const moveGenerator = getPieceMoveGenerator(piece);
  return moveGenerator(board, x, y, piece).some((move: Move) => {
    const newBoard = applyMoveInPlace(board, move);
    const kingSafe = !isKingInCheck(newBoard, color, findKing(newBoard, color));
    undoMoveInPlace(board, move);
    return kingSafe;
  });
};

const applyMoveInPlace = (board: Board, move: Move): Board => {
  const { from, to } = move;
  board[to[0]][to[1]] = board[from[0]][from[1]];
  board[from[0]][from[1]] = null;
  return board;
};

const undoMoveInPlace = (board: Board, move: Move): Board => {
  const { from, to, captured } = move;
  board[from[0]][from[1]] = board[to[0]][to[1]];
  board[to[0]][to[1]] = captured || null;
  return board;
};
