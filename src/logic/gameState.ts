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

export const updateGameState = (state: GameState, from: Square, to: Square): GameState => {
  const chess = new Chess(state.fen);
  debugLog('Updating game state...', 'From:', from, 'To:', to);
  const chessMove = chess.move({ from, to });
  if (!chessMove) {
    console.error(`Invalid move from ${from} to ${to}, FEN: ${state.fen}`);
    throw new Error(`Invalid move from ${from} to ${to}`);
  }
  const newFen = chess.fen();
  debugLog('New FEN after move:', newFen);
  return {
    fen: newFen,
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
