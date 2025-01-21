import { GameState, Square } from '../types';
import { Chess } from 'chess.js';
import { debugLog } from '../utils';

export const initializeGame = (): GameState => {
  const chess = new Chess();
  return {
    fen: chess.fen(),
    isGameOver: false,
  };
};

export const getLegalMoves = (fen: string, square: Square): Square[] => {
  const chess = new Chess(fen);
  debugLog('Getting legal moves for square:', square);
  const legalMoves = chess.moves({ square, verbose: true });
  debugLog('Verbose Moves:', legalMoves);
  return legalMoves.map((move) => move.to as Square);
};

export const updateGameState = (
  state: GameState,
  from: Square,
  to: Square,
  promotion?: 'q' | 'r' | 'n' | 'b'
): GameState => {
  const chess = new Chess(state.fen);
  const move = chess.move({ from, to, promotion });
  if (!move) throw new Error(`Invalid move from ${from} to ${to} (promotion=${promotion})`);
  return {
    fen: chess.fen(),
    isGameOver: chess.isGameOver(),
  };
};

export const isInCheck = (fen: string) => {
  return new Chess(fen).isCheck();
};

export const isCheckmate = (fen: string) => {
  return new Chess(fen).isCheckmate();
};

export const isStalemate = (fen: string) => {
  return new Chess(fen).isStalemate();
};
