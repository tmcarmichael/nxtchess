import { Board, PieceType } from "../../../types/chessboard";
import { Move } from "../../../types/pieceMoves";
import { getAttackingMoves } from "../check";

export const getKingMoves = (board: Board, x: number, y: number, piece: PieceType): Move[] => {
  const moves: Move[] = [];
  const color = piece[0];
  const opponentColor = color === "w" ? "b" : "w";

  // Possible directions for the king: [dx, dy]
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  // Gather all squares attacked by opponent pieces
  const attackedSquares = board.flatMap((row, i) =>
    row.flatMap((_, j) => getAttackingMoves(board, [i, j], opponentColor).map((move) => move.to))
  );

  // Check potential moves for the king
  directions.forEach(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;

    if (
      nx >= 0 &&
      nx < 8 &&
      ny >= 0 &&
      ny < 8 &&
      !attackedSquares.some(([ax, ay]) => ax === nx && ay === ny)
    ) {
      const target = board[nx]?.[ny];
      if (!target || target[0] !== color) {
        moves.push({ from: [x, y], to: [nx, ny] });
      }
    }
  });

  return moves;
};
