import { Board, PieceType } from "../../types/chessboard";
import { Move } from "../../types/pieceMoves";
import { getPieceMoveGenerator } from "./pieceMoves";
import { isKingInCheck } from "./check";

export const findKing = (board: Board, color: "w" | "b"): [number, number] => {
  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      const piece = board[x][y];
      if (piece?.[1] === "K" && piece[0] === color) {
        return [x, y];
      }
    }
  }
  throw new Error(`King for ${color} not found`);
};

export const applyMoveInPlace = (board: Board, move: Move): Board => {
  const { from, to } = move;
  const newBoard = board.map((row) => [...row]);

  newBoard[to[0]][to[1]] = newBoard[from[0]][from[1]];
  newBoard[from[0]][from[1]] = null;

  return newBoard;
};

export const undoMoveInPlace = (board: Board, move: Move): Board => {
  const { from, to, captured } = move;
  const newBoard = board.map((row) => [...row]);

  newBoard[from[0]][from[1]] = newBoard[to[0]][to[1]];
  newBoard[to[0]][to[1]] = captured || null;

  return newBoard;
};

export const hasLegalMove = (
  board: Board,
  x: number,
  y: number,
  piece: PieceType,
  color: "w" | "b"
): boolean => {
  const moveGenerator = getPieceMoveGenerator(piece);
  const kingPosition: [number, number] = piece[1] === "K" ? [x, y] : findKing(board, color);

  return moveGenerator(board, x, y, piece).some((move: Move) => {
    const newBoard = applyMoveInPlace(board, move);
    const kingSafe = !isKingInCheck(newBoard, color, kingPosition);
    undoMoveInPlace(board, move);
    return kingSafe;
  });
};
