import { Chess } from 'chess.js';
import { describe, it, expect } from 'vitest';
import { type Square } from '../../types/chess';
import {
  getOpponentSide,
  fenToBoard,
  getLegalMoves,
  getLegalMoveCaptures,
  canMovePieceAt,
  isPawnPromotion,
  getCapture,
  processCapturedPiece,
  executeMove,
  prepareMove,
  getRandomQuickPlayConfig,
} from './chessGameService';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const AFTER_E4_FEN = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
const PROMOTION_FEN = '8/P7/8/8/8/8/8/4K2k w - - 0 1'; // White pawn on a7 ready to promote
const BLACK_PROMOTION_FEN = '4K2k/8/8/8/8/8/p7/8 b - - 0 1'; // Black pawn on a2 ready to promote
const CAPTURE_FEN = 'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2'; // e4 can capture d5
const EN_PASSANT_FEN = 'rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3'; // White pawn e5, black pawn d5 (just advanced), en passant on d6

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
    const board = fenToBoard(INITIAL_FEN);

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

  it('parses all piece types correctly', () => {
    const board = fenToBoard(INITIAL_FEN);

    // White pieces (rank 1)
    expect(board.find((sq) => sq.square === 'a1')?.piece).toBe('wR');
    expect(board.find((sq) => sq.square === 'b1')?.piece).toBe('wN');
    expect(board.find((sq) => sq.square === 'c1')?.piece).toBe('wB');
    expect(board.find((sq) => sq.square === 'd1')?.piece).toBe('wQ');
    expect(board.find((sq) => sq.square === 'e1')?.piece).toBe('wK');

    // Black pieces (rank 8)
    expect(board.find((sq) => sq.square === 'a8')?.piece).toBe('bR');
    expect(board.find((sq) => sq.square === 'b8')?.piece).toBe('bN');
    expect(board.find((sq) => sq.square === 'c8')?.piece).toBe('bB');
    expect(board.find((sq) => sq.square === 'd8')?.piece).toBe('bQ');
    expect(board.find((sq) => sq.square === 'e8')?.piece).toBe('bK');

    // Pawns
    expect(board.find((sq) => sq.square === 'e2')?.piece).toBe('wP');
    expect(board.find((sq) => sq.square === 'e7')?.piece).toBe('bP');
  });

  it('parses position after 1.e4 correctly', () => {
    const board = fenToBoard(AFTER_E4_FEN);

    expect(board.find((sq) => sq.square === 'e2')?.piece).toBeNull();
    expect(board.find((sq) => sq.square === 'e4')?.piece).toBe('wP');
  });

  it('returns squares in correct order (a8 to h1)', () => {
    const board = fenToBoard(INITIAL_FEN);

    // First square should be a8 (top-left from white's perspective)
    expect(board[0].square).toBe('a8');
    // Last square should be h1 (bottom-right)
    expect(board[63].square).toBe('h1');
  });
});

describe('getLegalMoves', () => {
  it('returns correct moves for e2 pawn at start', () => {
    const moves = getLegalMoves(INITIAL_FEN, 'e2');

    expect(moves).toContain('e3');
    expect(moves).toContain('e4');
    expect(moves).toHaveLength(2);
  });

  it('returns empty array for empty square', () => {
    const moves = getLegalMoves(INITIAL_FEN, 'e4');

    expect(moves).toHaveLength(0);
  });

  it('returns correct moves for knight', () => {
    const moves = getLegalMoves(INITIAL_FEN, 'b1');

    expect(moves).toContain('a3');
    expect(moves).toContain('c3');
    expect(moves).toHaveLength(2);
  });

  it('returns no moves for blocked pieces', () => {
    // Rook on a1 is blocked by pawn and knight
    const moves = getLegalMoves(INITIAL_FEN, 'a1');

    expect(moves).toHaveLength(0);
  });

  it('returns capture moves', () => {
    const moves = getLegalMoves(CAPTURE_FEN, 'e4');

    expect(moves).toContain('d5'); // Capture
    expect(moves).toContain('e5'); // Push
  });

  it('returns empty for opponent pieces on their turn', () => {
    // It's white's turn in INITIAL_FEN, so black pieces have no legal moves
    const moves = getLegalMoves(INITIAL_FEN, 'e7');

    expect(moves).toHaveLength(0);
  });

  it('includes en passant target square', () => {
    const moves = getLegalMoves(EN_PASSANT_FEN, 'e5');

    expect(moves).toContain('d6'); // En passant capture
    expect(moves).toContain('e6'); // Normal push
  });
});

describe('getLegalMoveCaptures', () => {
  it('returns empty set for non-capture moves', () => {
    const captures = getLegalMoveCaptures(INITIAL_FEN, 'e2');

    expect(captures.size).toBe(0);
  });

  it('includes normal captures', () => {
    const captures = getLegalMoveCaptures(CAPTURE_FEN, 'e4');

    expect(captures.has('d5' as Square)).toBe(true);
    expect(captures.size).toBe(1);
  });

  it('includes en passant as a capture', () => {
    const captures = getLegalMoveCaptures(EN_PASSANT_FEN, 'e5');

    expect(captures.has('d6' as Square)).toBe(true);
    expect(captures.size).toBe(1); // Only d6 is a capture, e6 is a push
  });
});

describe('canMovePieceAt', () => {
  it('returns true when player can move their piece', () => {
    const board = fenToBoard(INITIAL_FEN);

    expect(canMovePieceAt(INITIAL_FEN, 'e2', 'w', board)).toBe(true);
  });

  it('returns false when trying to move opponent piece', () => {
    const board = fenToBoard(INITIAL_FEN);

    expect(canMovePieceAt(INITIAL_FEN, 'e7', 'w', board)).toBe(false);
  });

  it('returns false when not player turn', () => {
    const board = fenToBoard(AFTER_E4_FEN); // Black's turn

    expect(canMovePieceAt(AFTER_E4_FEN, 'e4', 'w', board)).toBe(false);
  });

  it('returns false for empty square', () => {
    const board = fenToBoard(INITIAL_FEN);

    expect(canMovePieceAt(INITIAL_FEN, 'e4', 'w', board)).toBe(false);
  });

  it('returns true for black piece on black turn', () => {
    const board = fenToBoard(AFTER_E4_FEN);

    expect(canMovePieceAt(AFTER_E4_FEN, 'e7', 'b', board)).toBe(true);
  });
});

describe('isPawnPromotion', () => {
  it('returns true for white pawn moving to 8th rank', () => {
    expect(isPawnPromotion('wP', 'a8')).toBe(true);
    expect(isPawnPromotion('wP', 'h8')).toBe(true);
  });

  it('returns true for black pawn moving to 1st rank', () => {
    expect(isPawnPromotion('bP', 'a1')).toBe(true);
    expect(isPawnPromotion('bP', 'h1')).toBe(true);
  });

  it('returns false for white pawn not on 8th rank', () => {
    expect(isPawnPromotion('wP', 'e7')).toBe(false);
    expect(isPawnPromotion('wP', 'e4')).toBe(false);
  });

  it('returns false for black pawn not on 1st rank', () => {
    expect(isPawnPromotion('bP', 'e2')).toBe(false);
    expect(isPawnPromotion('bP', 'e5')).toBe(false);
  });

  it('returns false for non-pawn pieces', () => {
    expect(isPawnPromotion('wQ', 'a8')).toBe(false);
    expect(isPawnPromotion('bR', 'a1')).toBe(false);
    expect(isPawnPromotion('wK', 'e8')).toBe(false);
  });

  it('returns false for null piece', () => {
    expect(isPawnPromotion(null, 'a8')).toBe(false);
  });
});

describe('getCapture', () => {
  it('returns piece when square is occupied', () => {
    const board = fenToBoard(INITIAL_FEN);

    expect(getCapture(board, 'e2')).toBe('wP');
    expect(getCapture(board, 'e7')).toBe('bP');
    expect(getCapture(board, 'd8')).toBe('bQ');
  });

  it('returns null for empty square', () => {
    const board = fenToBoard(INITIAL_FEN);

    expect(getCapture(board, 'e4')).toBeNull();
    expect(getCapture(board, 'd5')).toBeNull();
  });
});

describe('processCapturedPiece', () => {
  const emptyCaptures = { white: [], black: [] };

  it('adds black piece to black captures', () => {
    const result = processCapturedPiece('bP', emptyCaptures);

    expect(result.black).toContain('bP');
    expect(result.white).toHaveLength(0);
  });

  it('adds white piece to white captures', () => {
    const result = processCapturedPiece('wN', emptyCaptures);

    expect(result.white).toContain('wN');
    expect(result.black).toHaveLength(0);
  });

  it('preserves existing captures', () => {
    const existing = { white: ['wP'], black: ['bN'] };
    const result = processCapturedPiece('bQ', existing);

    expect(result.black).toEqual(['bN', 'bQ']);
    expect(result.white).toEqual(['wP']);
  });

  it('does not mutate original captures object', () => {
    const original = { white: ['wP'], black: [] };
    processCapturedPiece('bR', original);

    expect(original.white).toEqual(['wP']);
    expect(original.black).toEqual([]);
  });
});

describe('executeMove', () => {
  it('executes valid move and returns success', () => {
    const chess = new Chess(INITIAL_FEN);
    const board = fenToBoard(INITIAL_FEN);

    const result = executeMove(chess, 'e2', 'e4', board);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newFen).toContain('4P3'); // Pawn on e4
      expect(result.captured).toBeNull();
      expect(result.isCheck).toBe(false);
      expect(result.isCheckmate).toBe(false);
      expect(result.history).toContain('e4');
    }
  });

  it('throws for invalid move (chess.js behavior)', () => {
    const chess = new Chess(INITIAL_FEN);
    const board = fenToBoard(INITIAL_FEN);

    // chess.js throws for invalid moves rather than returning null
    expect(() => executeMove(chess, 'e2', 'e5', board)).toThrow();
  });

  it('detects captures', () => {
    const chess = new Chess(CAPTURE_FEN);
    const board = fenToBoard(CAPTURE_FEN);

    const result = executeMove(chess, 'e4', 'd5', board);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.captured).toBe('bP');
    }
  });

  it('detects en passant captures', () => {
    const chess = new Chess(EN_PASSANT_FEN);
    const board = fenToBoard(EN_PASSANT_FEN);

    const result = executeMove(chess, 'e5', 'd6', board);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.captured).toBe('bP');
      // White pawn moved to d6, black d5 pawn removed
      expect(result.newFen).toContain('3P4'); // White pawn on d6 (rank 6)
    }
  });

  it('detects check', () => {
    // Move queen to h5 for check
    const queenCheckFen = 'rnbqkbnr/ppppp2p/5p2/6p1/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1';
    const chess3 = new Chess(queenCheckFen);
    const board3 = fenToBoard(queenCheckFen);

    const result = executeMove(chess3, 'd1', 'h5', board3);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.isCheck).toBe(true);
      expect(result.checkedKingSquare).toBe('e8');
    }
  });

  it('detects checkmate', () => {
    // Fool's mate position - black can deliver checkmate
    const foolsMate = 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2';
    const chess = new Chess(foolsMate);
    const board = fenToBoard(foolsMate);

    const result = executeMove(chess, 'd8', 'h4', board);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.isCheckmate).toBe(true);
      expect(result.isCheck).toBe(true);
    }
  });

  it('handles promotion', () => {
    const chess = new Chess(PROMOTION_FEN);
    const board = fenToBoard(PROMOTION_FEN);

    const result = executeMove(chess, 'a7', 'a8', board, 'q');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newFen).toContain('Q'); // Promoted to queen
    }
  });

  it('throws for promotion without promotion piece (chess.js behavior)', () => {
    const chess = new Chess(PROMOTION_FEN);
    const board = fenToBoard(PROMOTION_FEN);

    // chess.js throws for promotion moves without a promotion piece
    expect(() => executeMove(chess, 'a7', 'a8', board)).toThrow();
  });
});

describe('prepareMove', () => {
  it('detects white pawn promotion', () => {
    const board = fenToBoard(PROMOTION_FEN);

    const result = prepareMove('a7', 'a8', board);

    expect(result.needsPromotion).toBe(true);
    if (result.needsPromotion) {
      expect(result.promotionInfo.from).toBe('a7');
      expect(result.promotionInfo.to).toBe('a8');
      expect(result.promotionInfo.color).toBe('w');
    }
  });

  it('detects black pawn promotion', () => {
    const board = fenToBoard(BLACK_PROMOTION_FEN);

    const result = prepareMove('a2', 'a1', board);

    expect(result.needsPromotion).toBe(true);
    if (result.needsPromotion) {
      expect(result.promotionInfo.from).toBe('a2');
      expect(result.promotionInfo.to).toBe('a1');
      expect(result.promotionInfo.color).toBe('b');
    }
  });

  it('returns false for non-promotion pawn move', () => {
    const board = fenToBoard(INITIAL_FEN);

    const result = prepareMove('e2', 'e4', board);

    expect(result.needsPromotion).toBe(false);
  });

  it('returns false for non-pawn moves', () => {
    const board = fenToBoard(INITIAL_FEN);

    const result = prepareMove('b1', 'c3', board);

    expect(result.needsPromotion).toBe(false);
  });

  it('returns false for empty source square', () => {
    const board = fenToBoard(INITIAL_FEN);

    const result = prepareMove('e4', 'e5', board);

    expect(result.needsPromotion).toBe(false);
  });
});

describe('getRandomQuickPlayConfig', () => {
  it('returns array of [time, difficulty, side]', () => {
    const config = getRandomQuickPlayConfig();

    expect(config).toHaveLength(3);
    expect(typeof config[0]).toBe('number'); // time
    expect(typeof config[1]).toBe('number'); // difficulty
    expect(['w', 'b']).toContain(config[2]); // side
  });

  it('returns time from valid options', () => {
    // Run multiple times to check randomness
    for (let i = 0; i < 20; i++) {
      const [time] = getRandomQuickPlayConfig();
      expect([3, 5, 10]).toContain(time);
    }
  });

  it('returns difficulty in valid range (2-8)', () => {
    for (let i = 0; i < 20; i++) {
      const [, difficulty] = getRandomQuickPlayConfig();
      expect(difficulty).toBeGreaterThanOrEqual(2);
      expect(difficulty).toBeLessThanOrEqual(8);
    }
  });

  it('returns valid side', () => {
    for (let i = 0; i < 20; i++) {
      const [, , side] = getRandomQuickPlayConfig();
      expect(['w', 'b']).toContain(side);
    }
  });
});
