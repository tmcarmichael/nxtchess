import { describe, it, expect } from 'vitest';
import { getOpponentSide, fenToBoard, getLegalMoves } from './chessGameService';

describe('chessGameService', () => {
  describe('getOpponentSide', () => {
    it('returns black when given white', () => {
      expect(getOpponentSide('w')).toBe('b');
    });

    it('returns white when given black', () => {
      expect(getOpponentSide('b')).toBe('w');
    });
  });

  describe('fenToBoard', () => {
    it('parses initial position correctly', () => {
      const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const board = fenToBoard(initialFen);

      expect(board).toHaveLength(64);

      // Check corners
      const a1 = board.find((sq) => sq.square === 'a1');
      const h1 = board.find((sq) => sq.square === 'h1');
      const a8 = board.find((sq) => sq.square === 'a8');
      const h8 = board.find((sq) => sq.square === 'h8');

      expect(a1?.piece).toBe('wR');
      expect(h1?.piece).toBe('wR');
      expect(a8?.piece).toBe('bR');
      expect(h8?.piece).toBe('bR');

      // Check empty squares
      const e4 = board.find((sq) => sq.square === 'e4');
      expect(e4?.piece).toBeNull();
    });
  });

  describe('getLegalMoves', () => {
    it('returns correct moves for e2 pawn at start', () => {
      const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const moves = getLegalMoves(initialFen, 'e2');

      expect(moves).toContain('e3');
      expect(moves).toContain('e4');
      expect(moves).toHaveLength(2);
    });

    it('returns empty array for empty square', () => {
      const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const moves = getLegalMoves(initialFen, 'e4');

      expect(moves).toHaveLength(0);
    });
  });
});
