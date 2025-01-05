import { Board, PieceType } from "../../../types/chessboard";
import { Move } from "../../../types/pieceMoves";

export const getPawnMoves = (board: Board, x: number, y: number, piece: PieceType): Move[] => {
  const moves: Move[] = [];
  const color = piece[0] === "w" ? "w" : "b";
  const direction = color === "w" ? -1 : 1;

  // Forward moves
  if (board[x + direction]?.[y] === null) {
    moves.push({ from: [x, y], to: [x + direction, y] });
    if ((color === "w" && x === 6) || (color === "b" && x === 1)) {
      if (board[x + 2 * direction]?.[y] === null) {
        moves.push({ from: [x, y], to: [x + 2 * direction, y] });
      }
    }
  }

  // Diagonal captures
  [-1, 1].forEach((dy) => {
    const target = board[x + direction]?.[y + dy];
    if (target && target[0] !== piece[0]) {
      moves.push({ from: [x, y], to: [x + direction, y + dy] });
    }
  });

  return moves;
};
