import { GameState, Move, Board } from "../../types";
import { getAttackingMoves } from "./check";

export const canCastle = (
  gameState: GameState,
  board: Board,
  side: "kingSide" | "queenSide",
  color: "w" | "b"
): boolean => {
  const rookKey = `${color}${
    side === "kingSide" ? "KingSide" : "QueenSide"
  }` as keyof GameState["hasRookMoved"];
  if (gameState.hasKingMoved[color] || gameState.hasRookMoved[rookKey]) return false;

  const row = color === "w" ? 7 : 0;
  const cols = side === "kingSide" ? [5, 6] : [1, 2, 3];
  if (cols.some((col) => board[row][col] !== null)) return false;

  const opponentColor = color === "w" ? "b" : "w";
  const attackingMoves = board.flatMap((_, x) =>
    board[x].flatMap((piece, y) =>
      piece?.[0] === opponentColor ? getAttackingMoves(board, [x, y], opponentColor) : []
    )
  );

  const kingSquares =
    side === "kingSide"
      ? [
          [row, 4],
          [row, 5],
          [row, 6],
        ]
      : [
          [row, 4],
          [row, 3],
          [row, 2],
        ];
  if (
    kingSquares.some(([x, y]) =>
      attackingMoves.some((move) => move.to[0] === x && move.to[1] === y)
    )
  )
    return false;

  return true;
};

export const isEnPassantPossible = (
  gameState: GameState,
  pawnPosition: [number, number],
  color: "w" | "b"
): boolean => {
  const target = gameState.enPassantTarget;
  if (!target) return false;

  const attackRank = color === "w" ? 3 : 4;
  const targetRank = color === "w" ? 2 : 5;

  return (
    pawnPosition[0] === attackRank &&
    target === `${String.fromCharCode(97 + pawnPosition[1])}${targetRank}`
  );
};

export const isPromotionEligible = (board: Board, move: Move, color: "w" | "b"): boolean => {
  const promotionRank = color === "w" ? 0 : 7;
  const pawn = board[move.from[0]][move.from[1]];
  return (
    pawn?.[1] === "P" &&
    move.to[0] === promotionRank &&
    ["Q", "R", "B", "N"].includes(move.promotion || "")
  );
};
