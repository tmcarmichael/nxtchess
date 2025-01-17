import { GameState, VerboseMove, Square } from "../types";
import { Chess } from "chess.js";

export const initializeGame = (): GameState => {
  const chess = new Chess();
  return {
    fen: chess.fen(),
    isGameOver: false,
  };
};

export const getLegalMoves = (fen: string, square: Square): string[] => {
  const chess = new Chess(fen);
  const legalMoves = chess.moves({ square, verbose: true }) as VerboseMove[];
  return legalMoves.map((move) => move.to);
};

export const updateGameState = (state: GameState, from: string, to: string): GameState => {
  const chess = new Chess(state.fen);
  const chessMove = chess.move({ from, to });
  if (!chessMove) throw new Error("Invalid move");
  return {
    fen: chess.fen(),
    isGameOver: chess.isGameOver(),
  };
};
