import { Board } from "../../types/chessboard";
import { Move } from "../../types/pieceMoves";

export const applyMove = (board: Board, move: Move): Board => {
  const newBoard = board.map((row) => [...row]);
  newBoard[move.to[0]][move.to[1]] = newBoard[move.from[0]][move.from[1]];
  newBoard[move.from[0]][move.from[1]] = null;
  return newBoard;
};

export const undoMove = (board: Board, move: Move): Board => {
  const newBoard = board.map((row) => [...row]);
  newBoard[move.from[0]][move.from[1]] = newBoard[move.to[0]][move.to[1]];
  newBoard[move.to[0]][move.to[1]] = move.captured || null;
  return newBoard;
};

export const findKing = (board: Board, color: "w" | "b"): [number, number] => {
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = board[x][y];
      if (piece?.[1] === "K" && piece[0] === color) return [x, y];
    }
  }
  throw new Error(`King for ${color} not found`);
};
