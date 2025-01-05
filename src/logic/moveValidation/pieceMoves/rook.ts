import { Board, PieceType } from "../../../types/chessboard";
import { Move } from "../../../types/pieceMoves";

export const getRookMoves = (board: Board, x: number, y: number, piece: PieceType): Move[] => {
  const moves: Move[] = [];
  const color = piece[0];

  // Directions for rook movement: [dx, dy]
  const directions = [
    [1, 0], // Down
    [-1, 0], // Up
    [0, 1], // Right
    [0, -1], // Left
  ];

  directions.forEach(([dx, dy]) => {
    let nx = x + dx;
    let ny = y + dy;

    while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
      const target = board[nx]?.[ny];
      if (!target) {
        moves.push({ from: [x, y], to: [nx, ny] });
      } else {
        if (target[0] !== color) {
          moves.push({ from: [x, y], to: [nx, ny] });
        }
        break;
      }
      nx += dx;
      ny += dy;
    }
  });

  return moves;
};