import { describe, it, expect } from 'vitest';
import { getTurnFromFen, findKingSquareFromFen } from './fenUtils';

describe('fenUtils', () => {
  describe('getTurnFromFen', () => {
    it('returns white for initial position', () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      expect(getTurnFromFen(fen)).toBe('w');
    });

    it('returns black after white moves', () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      expect(getTurnFromFen(fen)).toBe('b');
    });

    it('handles positions with no castling rights', () => {
      const fen = 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w - - 0 1';
      expect(getTurnFromFen(fen)).toBe('w');
    });

    it('handles endgame positions', () => {
      const fen = '8/8/8/4k3/8/4K3/8/8 b - - 0 50';
      expect(getTurnFromFen(fen)).toBe('b');
    });
  });

  describe('findKingSquareFromFen', () => {
    it('finds white king in initial position', () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      expect(findKingSquareFromFen(fen, 'w')).toBe('e1');
    });

    it('finds black king in initial position', () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      expect(findKingSquareFromFen(fen, 'b')).toBe('e8');
    });

    it('finds king after FEN digit (king behind empty squares)', () => {
      const fen = '4k3/8/8/8/8/8/8/4K3 w - - 0 1';
      expect(findKingSquareFromFen(fen, 'w')).toBe('e1');
      expect(findKingSquareFromFen(fen, 'b')).toBe('e8');
    });

    it('finds king on a-file', () => {
      const fen = 'k7/8/8/8/8/8/8/K7 w - - 0 1';
      expect(findKingSquareFromFen(fen, 'w')).toBe('a1');
      expect(findKingSquareFromFen(fen, 'b')).toBe('a8');
    });

    it('finds king on h-file', () => {
      const fen = '7k/8/8/8/8/8/8/7K w - - 0 1';
      expect(findKingSquareFromFen(fen, 'w')).toBe('h1');
      expect(findKingSquareFromFen(fen, 'b')).toBe('h8');
    });

    it('finds king in complex middlegame position', () => {
      const fen = 'r1bq1rk1/ppppbppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w - - 6 5';
      expect(findKingSquareFromFen(fen, 'w')).toBe('g1');
      expect(findKingSquareFromFen(fen, 'b')).toBe('g8');
    });

    it('finds king after mixed digits and pieces in same rank', () => {
      const fen = 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1';
      expect(findKingSquareFromFen(fen, 'w')).toBe('e1');
      expect(findKingSquareFromFen(fen, 'b')).toBe('e8');
    });

    it('finds king in center of board', () => {
      const fen = '8/8/8/3k4/3K4/8/8/8 w - - 0 1';
      expect(findKingSquareFromFen(fen, 'w')).toBe('d4');
      expect(findKingSquareFromFen(fen, 'b')).toBe('d5');
    });
  });
});
