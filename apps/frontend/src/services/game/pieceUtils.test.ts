import { describe, it, expect } from 'vitest';
import { getPieceColor, getPieceType, makePiece, isPieceSide } from './pieceUtils';

describe('pieceUtils', () => {
  describe('getPieceColor', () => {
    it('returns w for white pieces', () => {
      expect(getPieceColor('wK')).toBe('w');
      expect(getPieceColor('wQ')).toBe('w');
      expect(getPieceColor('wP')).toBe('w');
    });

    it('returns b for black pieces', () => {
      expect(getPieceColor('bK')).toBe('b');
      expect(getPieceColor('bQ')).toBe('b');
      expect(getPieceColor('bP')).toBe('b');
    });
  });

  describe('getPieceType', () => {
    it('returns correct piece type', () => {
      expect(getPieceType('wK')).toBe('K');
      expect(getPieceType('bQ')).toBe('Q');
      expect(getPieceType('wR')).toBe('R');
      expect(getPieceType('bN')).toBe('N');
      expect(getPieceType('wB')).toBe('B');
      expect(getPieceType('bP')).toBe('P');
    });
  });

  describe('makePiece', () => {
    it('creates white pieces', () => {
      expect(makePiece('w', 'K')).toBe('wK');
      expect(makePiece('w', 'Q')).toBe('wQ');
      expect(makePiece('w', 'P')).toBe('wP');
    });

    it('creates black pieces', () => {
      expect(makePiece('b', 'K')).toBe('bK');
      expect(makePiece('b', 'Q')).toBe('bQ');
      expect(makePiece('b', 'P')).toBe('bP');
    });
  });

  describe('isPieceSide', () => {
    it('returns true when piece matches side', () => {
      expect(isPieceSide('wK', 'w')).toBe(true);
      expect(isPieceSide('wP', 'w')).toBe(true);
      expect(isPieceSide('bQ', 'b')).toBe(true);
      expect(isPieceSide('bN', 'b')).toBe(true);
    });

    it('returns false when piece does not match side', () => {
      expect(isPieceSide('wK', 'b')).toBe(false);
      expect(isPieceSide('bQ', 'w')).toBe(false);
    });
  });
});
