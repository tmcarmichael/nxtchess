import { GameState, VerboseMove, Square } from "../types";
import { Chess } from "chess.js";
import { debugLog } from "../utils";

export const initializeGame = (): GameState => {
  const chess = new Chess();
  return {
    fen: chess.fen(),
    isGameOver: false,
  };
};

export const getLegalMoves = (fen: string, square: Square): Square[] => {
  const chess = new Chess(fen);

  debugLog("Getting legal moves for square:", square);
  const legalMoves = chess.moves({ square, verbose: true }) as VerboseMove[];

  debugLog("Verbose Moves:", legalMoves);
  return legalMoves.map((move) => move.to as Square);
};

export const updateGameState = (state: GameState, from: string, to: string): GameState => {
  const chess = new Chess(state.fen);

  debugLog("Updating game state...");
  debugLog("From:", from, "To:", to);

  const chessMove = chess.move({ from, to });
  if (!chessMove) {
    console.error(`Move failed with FEN: ${state.fen}`);
    throw new Error(`Invalid move from ${from} to ${to}`);
  }
  return {
    fen: chess.fen(),
    isGameOver: chess.isGameOver(),
  };
};
