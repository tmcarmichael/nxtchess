import { Chess } from 'chess.js';
import { Square, BoardSquare, PIECE_VALUES, PromotionPiece, Side } from '../../types';

// ============================================================================
// Types
// ============================================================================

export interface MoveResult {
  success: true;
  newFen: string;
  captured: string | null;
  history: string[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  checkedKingSquare: Square | null;
}

export interface MoveError {
  success: false;
  error: string;
}

export type MoveOutcome = MoveResult | MoveError;

export interface PromotionInfo {
  from: Square;
  to: Square;
  color: Side;
}

export interface CapturedPieces {
  white: string[];
  black: string[];
}

// ============================================================================
// Board Functions
// ============================================================================

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

// ============================================================================
// Move Validation Functions
// ============================================================================

/** Check if a piece at the given square can be moved by the specified player */
export const canMovePieceAt = (
  fen: string,
  square: Square,
  playerColor: Side,
  board: BoardSquare[]
): boolean => {
  const sideToMove = fen.split(' ')[1];
  if (sideToMove !== playerColor) return false;

  const piece = board.find((sq) => sq.square === square)?.piece;
  return !!piece && piece[0] === sideToMove;
};

/** Check if a move is a pawn promotion */
export const isPawnPromotion = (piece: string | null, to: Square): boolean => {
  if (!piece || !piece.endsWith('P')) return false;
  const rank = parseInt(to[1], 10);
  return (piece.startsWith('w') && rank === 8) || (piece.startsWith('b') && rank === 1);
};

/** Get the piece color from a piece string (e.g., 'wP' -> 'w') */
export const getPieceColor = (piece: string): Side => {
  return piece[0] as Side;
};

// ============================================================================
// Capture Functions
// ============================================================================

/** Check if there's a piece to capture at the target square */
export const getCapture = (board: BoardSquare[], targetSquare: Square): string | null => {
  const piece = board.find((sq) => sq.square === targetSquare)?.piece;
  return piece || null;
};

/** Process a captured piece and return updated capture arrays (pure function) */
export const processCapturedPiece = (
  capturedPiece: string,
  currentCaptures: CapturedPieces
): CapturedPieces => {
  if (capturedPiece.startsWith('b')) {
    return {
      ...currentCaptures,
      black: [...currentCaptures.black, capturedPiece],
    };
  } else {
    return {
      ...currentCaptures,
      white: [...currentCaptures.white, capturedPiece],
    };
  }
};

// Legacy callback-based version for backwards compatibility
export const captureCheck = (target: Square, board: BoardSquare[]): string | null => {
  return getCapture(board, target);
};

// Legacy callback-based version for backwards compatibility
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

// ============================================================================
// Move Execution Functions
// ============================================================================

/** Find the king's square for the given color */
const findKingSquare = (board: BoardSquare[], color: Side): Square | null => {
  const kingPiece = color + 'K';
  const kingSquare = board.find((sq) => sq.piece === kingPiece);
  return kingSquare?.square ?? null;
};

/**
 * Execute a move on the chess instance and return the result.
 * This is a pure function that doesn't modify any external state.
 */
export const executeMove = (
  chess: Chess,
  from: Square,
  to: Square,
  board: BoardSquare[],
  promotion?: PromotionPiece
): MoveOutcome => {
  // Check for capture before making the move
  const captured = getCapture(board, to);

  // Attempt the move
  const move = chess.move({ from, to, promotion });
  if (!move) {
    return {
      success: false,
      error: `Invalid move from ${from} to ${to}${promotion ? ` (promotion=${promotion})` : ''}`,
    };
  }

  const newFen = chess.fen();
  const newBoard = fenToBoard(newFen);
  const history = chess.history();

  // Determine game state
  const isCheck = chess.isCheck();
  const isCheckmate = chess.isCheckmate();
  const isStalemate = chess.isStalemate();
  const isDraw = chess.isDraw();

  // Find checked king if in check
  let checkedKingSquare: Square | null = null;
  if (isCheck) {
    const currentTurn = newFen.split(' ')[1] as Side;
    checkedKingSquare = findKingSquare(newBoard, currentTurn);
  }

  return {
    success: true,
    newFen,
    captured,
    history,
    isCheck,
    isCheckmate,
    isStalemate,
    isDraw,
    checkedKingSquare,
  };
};

/**
 * Prepare a move - validates and checks for promotion without executing.
 * Returns promotion info if the move requires promotion.
 */
export const prepareMove = (
  from: Square,
  to: Square,
  board: BoardSquare[]
): { needsPromotion: true; promotionInfo: PromotionInfo } | { needsPromotion: false } => {
  const piece = board.find((sq) => sq.square === from)?.piece;

  if (!piece) {
    return { needsPromotion: false };
  }

  if (isPawnPromotion(piece, to)) {
    return {
      needsPromotion: true,
      promotionInfo: {
        from,
        to,
        color: getPieceColor(piece),
      },
    };
  }

  return { needsPromotion: false };
};

// ============================================================================
// Utility Functions
// ============================================================================

export const getRandomQuickPlayConfig = (): [number, number, 'w' | 'b'] => {
  const quickPlayDifficulty = Math.floor(Math.random() * (8 - 2 + 1)) + 2;
  const quickPlayTime = [3, 5, 10][Math.floor(Math.random() * 3)];
  const quickPlaySide = Math.random() < 0.5 ? 'w' : 'b';
  return [quickPlayTime, quickPlayDifficulty, quickPlaySide];
};

/** Get the opposite side */
export const getOpponentSide = (side: Side): Side => {
  return side === 'w' ? 'b' : 'w';
};
