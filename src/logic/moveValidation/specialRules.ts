import { GameState, Move, Board } from "../../types";

export const canCastle = (
  gameState: GameState,
  side: "kingSide" | "queenSide",
  color: "w" | "b"
): boolean => {
  const rookKey = `${color}${
    side === "kingSide" ? "KingSide" : "QueenSide"
  }` as keyof GameState["hasRookMoved"];
  return !gameState.hasKingMoved[color] && !gameState.hasRookMoved[rookKey];
};

export const isEnPassantPossible = (
  gameState: GameState,
  pawnPosition: [number, number]
): boolean => {
  const target = gameState.enPassantTarget;
  return (
    target !== null && `${String.fromCharCode(97 + pawnPosition[1])}${pawnPosition[0]}` === target
  );
};

export const isPromotionEligible = (board: Board, move: Move, color: "w" | "b"): boolean => {
  const promotionRank = color === "w" ? 0 : 7;
  const pawn = board[move.from[0]][move.from[1]];
  return pawn?.[1] === "P" && move.to[0] === promotionRank;
};
