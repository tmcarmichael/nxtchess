import { describe, it, expect } from 'vitest';
import { getTurnFromFen } from './fenUtils';

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
});
