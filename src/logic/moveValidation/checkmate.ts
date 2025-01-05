import { Board } from "../../types/chessboard";
import { Move } from "../../types/pieceMoves";
import { isKingInCheck } from "./check";
import { getPieceMoveGenerator } from "./pieceMoves";

export const isCheckmate = (board: Board, color: "w" | "b"): boolean => {
  const kingPosition = findKing(board, color);
  if (!isKingInCheck(board, color, kingPosition)) return false;

  return !hasLegalMoves(board, color, kingPosition);
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

const hasLegalMoves = (board: Board, color: "w" | "b", kingPosition: [number, number]): boolean => {
  return board.some((row, x) =>
    row.some((piece, y) => {
      if (piece?.[0] !== color) return false;

      const moveGenerator = getPieceMoveGenerator(piece);
      return moveGenerator(board, x, y, piece).some((move: Move) => {
        const newBoard = applyMoveInPlace(board, move);
        const kingSafe = !isKingInCheck(newBoard, color, kingPosition);
        undoMoveInPlace(board, move);
        return kingSafe;
      });
    })
  );
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
