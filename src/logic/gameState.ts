// gameState.ts
import { Chess } from 'chess.js';
import { debugLog } from '../utils';
import { GameState, Square, BoardSquare, PromotionPiece, PIECE_VALUES } from '../types';

export function fenToBoard(fen: string): BoardSquare[] {
  const chess = new Chess(fen);
  const rawBoard = chess.board();
  const squares: BoardSquare[] = [];
  for (let row = 0; row < 8; row++) {
    const rankNumber = 8 - row;
    for (let col = 0; col < 8; col++) {
      const file = String.fromCharCode('a'.charCodeAt(0) + col);
      const cell = rawBoard[row][col];
      let piece: string | null = null;
      if (cell) {
        piece = cell.color + cell.type.toUpperCase();
      }
      const squareId = (file + rankNumber) as Square;
      squares.push({
        square: squareId,
        piece,
      });
    }
  }
  return squares;
}

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
  promotion?: PromotionPiece
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

export function computeMaterial(boardSquares: BoardSquare[]) {
  let whiteTotal = 0;
  let blackTotal = 0;
  for (const sq of boardSquares) {
    if (!sq.piece) continue;
    const color = sq.piece[0];
    const type = sq.piece[1];
    const val = PIECE_VALUES[type] || 0;
    if (color === 'w') whiteTotal += val;
    else blackTotal += val;
  }
  return { whiteTotal, blackTotal, diff: whiteTotal - blackTotal };
}
