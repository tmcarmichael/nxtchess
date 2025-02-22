import { Chess } from 'chess.js';
import { Square, BoardSquare, PIECE_VALUES } from '../types';

export const fenToBoard = (fen: string): BoardSquare[] => {
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
};

export const captureCheck = (target: Square, board: BoardSquare[]): string | null => {
  const piece = board.find((sq) => sq.square === target)?.piece;
  return piece || null;
};

export const getLegalMoves = (fen: string, square: Square): Square[] => {
  const chess = new Chess(fen);
  const legalMoves = chess.moves({ square, verbose: true });
  return legalMoves.map((move) => move.to as Square);
};

export const computeMaterial = (boardSquares: BoardSquare[]) => {
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
};

export const handleCapturedPiece = (
  piece: string,
  setCapturedBlack: (fn: (prev: string[]) => string[]) => void,
  setCapturedWhite: (fn: (prev: string[]) => string[]) => void
) => {
  if (piece.startsWith('b')) {
    setCapturedBlack((prev) => [...prev, piece]);
  } else {
    setCapturedWhite((prev) => [...prev, piece]);
  }
};

export const getRandomQuickPlayConfig = (): [number, number, 'w' | 'b'] => {
  const quickPlayDifficulty = Math.floor(Math.random() * (8 - 2 + 1)) + 2;
  const quickPlayTime = [3, 5, 10][Math.floor(Math.random() * 3)];
  const quickPlaySide = Math.random() < 0.5 ? 'w' : 'b';
  return [quickPlayTime, quickPlayDifficulty, quickPlaySide];
};
