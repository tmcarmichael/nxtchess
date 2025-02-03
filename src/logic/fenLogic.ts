import { PieceType, Square } from '../types';

export const fenToBoard = (fen: string): { square: Square; piece: PieceType | null }[] => {
  const rows = fen.split(' ')[0].split('/');
  const board: { square: Square; piece: PieceType | null }[] = [];
  rows.forEach((row, rankIndex) => {
    let fileIndex = 0;
    row.split('').forEach((char) => {
      const emptyCount = Number(char);
      if (!isNaN(emptyCount)) {
        for (let i = 0; i < emptyCount; i++) {
          const sq = `${String.fromCharCode(97 + fileIndex)}${8 - rankIndex}` as Square;
          board.push({ square: sq, piece: null });
          fileIndex++;
        }
      } else {
        const piece = mapFenToPieceType(char);
        const sq = `${String.fromCharCode(97 + fileIndex)}${8 - rankIndex}` as Square;
        board.push({ square: sq, piece });
        fileIndex++;
      }
    });
  });
  return board;
};

export const mapFenToPieceType = (char: string): PieceType | null => {
  const pieceMap: Record<string, PieceType> = {
    p: 'bP',
    r: 'bR',
    n: 'bN',
    b: 'bB',
    q: 'bQ',
    k: 'bK',
    P: 'wP',
    R: 'wR',
    N: 'wN',
    B: 'wB',
    Q: 'wQ',
    K: 'wK',
  };
  return pieceMap[char] || null;
};
