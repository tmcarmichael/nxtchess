import { Chess, type Square as ChessSquare, type PieceSymbol, type Color } from 'chess.js';
import type { Square, BoardSquare } from '../../types/chess';
import type { Side } from '../../types/game';

export interface CachedPiece {
  type: PieceSymbol;
  color: Color;
  /** Pre-computed string representation (e.g., 'wK', 'bP') */
  symbol: string;
}

export interface MaterialCount {
  white: number;
  black: number;
  diff: number;
}

export interface BoardCacheState {
  fen: string;
  turn: Side;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  checkedKingSquare: Square | null;
  material: MaterialCount;
}

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

// Pre-computed square indices for O(1) lookup
const SQUARE_TO_INDEX: Record<Square, number> = {} as Record<Square, number>;
const INDEX_TO_SQUARE: Square[] = [];

// Initialize square mappings
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];
for (let rank = 7; rank >= 0; rank--) {
  for (let file = 0; file < 8; file++) {
    const square = (FILES[file] + RANKS[rank]) as Square;
    const index = (7 - rank) * 8 + file;
    SQUARE_TO_INDEX[square] = index;
    INDEX_TO_SQUARE[index] = square;
  }
}

/**
 * Efficient cached board representation.
 * - O(1) piece lookups via array index
 * - Cached legal moves per square
 * - Incremental material calculation
 * - Single Chess instance, reused
 */
export class BoardCache {
  private chess: Chess;
  private pieces: (CachedPiece | null)[];
  private legalMovesCache: Map<Square, Square[]>;
  private _state: BoardCacheState;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
    this.pieces = new Array(64).fill(null);
    this.legalMovesCache = new Map();
    this._state = this.createEmptyState();
    this.syncFromChess();
  }

  // ============================================================================
  // Public Getters
  // ============================================================================

  get fen(): string {
    return this._state.fen;
  }

  get turn(): Side {
    return this._state.turn;
  }

  get isCheck(): boolean {
    return this._state.isCheck;
  }

  get isCheckmate(): boolean {
    return this._state.isCheckmate;
  }

  get isStalemate(): boolean {
    return this._state.isStalemate;
  }

  get isDraw(): boolean {
    return this._state.isDraw;
  }

  get checkedKingSquare(): Square | null {
    return this._state.checkedKingSquare;
  }

  get material(): MaterialCount {
    return this._state.material;
  }

  get state(): Readonly<BoardCacheState> {
    return this._state;
  }

  // ============================================================================
  // Piece Access - O(1)
  // ============================================================================

  getPieceAt(square: Square): CachedPiece | null {
    return this.pieces[SQUARE_TO_INDEX[square]];
  }

  getPieceSymbol(square: Square): string | null {
    return this.pieces[SQUARE_TO_INDEX[square]]?.symbol ?? null;
  }

  isSquareOccupied(square: Square): boolean {
    return this.pieces[SQUARE_TO_INDEX[square]] !== null;
  }

  isPieceColor(square: Square, color: Side): boolean {
    const piece = this.pieces[SQUARE_TO_INDEX[square]];
    return piece !== null && piece.color === color;
  }

  // ============================================================================
  // Legal Moves - Cached
  // ============================================================================

  getLegalMoves(square: Square): Square[] {
    // Check cache first
    const cached = this.legalMovesCache.get(square);
    if (cached) return cached;

    // Compute and cache
    const moves = this.chess.moves({ square: square as ChessSquare, verbose: true });
    const targets = moves.map((m) => m.to as Square);
    this.legalMovesCache.set(square, targets);

    return targets;
  }

  hasLegalMoves(square: Square): boolean {
    return this.getLegalMoves(square).length > 0;
  }

  // ============================================================================
  // Board Conversion - For UI rendering
  // ============================================================================

  /**
   * Convert to BoardSquare[] format for UI compatibility.
   * This is computed fresh but uses cached piece data.
   */
  toBoardSquares(): BoardSquare[] {
    const result: BoardSquare[] = new Array(64);
    for (let i = 0; i < 64; i++) {
      const piece = this.pieces[i];
      result[i] = {
        square: INDEX_TO_SQUARE[i],
        piece: piece?.symbol ?? null,
      };
    }
    return result;
  }

  /**
   * Get board as a Map for O(1) lookups in external code.
   */
  toMap(): Map<Square, string> {
    const map = new Map<Square, string>();
    for (let i = 0; i < 64; i++) {
      const piece = this.pieces[i];
      if (piece) {
        map.set(INDEX_TO_SQUARE[i], piece.symbol);
      }
    }
    return map;
  }

  // ============================================================================
  // State Mutations
  // ============================================================================

  /**
   * Load a new position from FEN.
   */
  load(fen: string): void {
    this.chess.load(fen);
    this.syncFromChess();
  }

  /**
   * Reset to starting position.
   */
  reset(): void {
    this.chess.reset();
    this.syncFromChess();
  }

  /**
   * Apply a move and update cache incrementally.
   * Returns the captured piece symbol if any.
   */
  move(from: Square, to: Square, promotion?: string): string | null {
    // Get captured piece before move
    const capturedPiece = this.getPieceSymbol(to);

    // Apply move via chess.js
    const result = this.chess.move({
      from: from as ChessSquare,
      to: to as ChessSquare,
      promotion: promotion as PieceSymbol | undefined,
    });

    if (!result) {
      return null; // Invalid move
    }

    // Full sync after move (incremental update would be more complex)
    this.syncFromChess();

    return capturedPiece;
  }

  /**
   * Undo the last move.
   */
  undo(): boolean {
    const result = this.chess.undo();
    if (!result) return false;

    this.syncFromChess();
    return true;
  }

  // ============================================================================
  // Chess.js Delegation
  // ============================================================================

  getHistory(): string[] {
    return this.chess.history();
  }

  getChessInstance(): Chess {
    return this.chess;
  }

  // ============================================================================
  // King Finding - O(n) but cached via state
  // ============================================================================

  findKingSquare(color: Side): Square | null {
    const kingSymbol = color === 'w' ? 'wK' : 'bK';
    for (let i = 0; i < 64; i++) {
      if (this.pieces[i]?.symbol === kingSymbol) {
        return INDEX_TO_SQUARE[i];
      }
    }
    return null;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private syncFromChess(): void {
    // Clear caches
    this.legalMovesCache.clear();

    // Sync pieces from chess.js board
    const board = this.chess.board();
    let whiteMaterial = 0;
    let blackMaterial = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const index = row * 8 + col;
        const cell = board[row][col];

        if (cell) {
          const symbol = cell.color + cell.type.toUpperCase();
          this.pieces[index] = {
            type: cell.type,
            color: cell.color,
            symbol,
          };

          // Accumulate material
          const value = PIECE_VALUES[cell.type];
          if (cell.color === 'w') {
            whiteMaterial += value;
          } else {
            blackMaterial += value;
          }
        } else {
          this.pieces[index] = null;
        }
      }
    }

    // Update state
    const turn = this.chess.turn() as Side;
    const isCheck = this.chess.isCheck();

    this._state = {
      fen: this.chess.fen(),
      turn,
      isCheck,
      isCheckmate: this.chess.isCheckmate(),
      isStalemate: this.chess.isStalemate(),
      isDraw: this.chess.isDraw(),
      checkedKingSquare: isCheck ? this.findKingSquare(turn) : null,
      material: {
        white: whiteMaterial,
        black: blackMaterial,
        diff: whiteMaterial - blackMaterial,
      },
    };
  }

  private createEmptyState(): BoardCacheState {
    return {
      fen: '',
      turn: 'w',
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      checkedKingSquare: null,
      material: { white: 0, black: 0, diff: 0 },
    };
  }
}

/**
 * Convert square string to array index.
 */
export function squareToIndex(square: Square): number {
  return SQUARE_TO_INDEX[square];
}

/**
 * Convert array index to square string.
 */
export function indexToSquare(index: number): Square {
  return INDEX_TO_SQUARE[index];
}

/**
 * Create piece symbol from color and type.
 */
export function createPieceSymbol(color: Side, type: string): string {
  return color + type.toUpperCase();
}
