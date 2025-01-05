import { Board, PieceType } from "../../../types/chessboard";
import { Move } from "../../../types/pieceMoves";

export const getKnightMoves = (board: Board, x: number, y: number, piece: PieceType): Move[] => {
  const moves: Move[] = [];
  const color = piece[0];

  // Possible "L" shape moves for a knight: [dx, dy]
  const deltas = [
    [2, 1],
    [2, -1],
    [-2, 1],
    [-2, -1],
    [1, 2],
    [1, -2],
    [-1, 2],
    [-1, -2],
  ];

  deltas.forEach(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;

    if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
      const target = board[nx]?.[ny];
      if (!target || target[0] !== color) {
        moves.push({ from: [x, y], to: [nx, ny] });
      }
    }
  });

  return moves;
};
