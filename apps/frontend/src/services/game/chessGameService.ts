import { Chess, type Square as ChessSquare } from 'chess.js';
import { type Square, type BoardSquare, type PromotionPiece } from '../../types/chess';
import { type Side } from '../../types/game';
import { getTurnFromFen } from './fenUtils';
import { getPieceColor, makePiece } from './pieceUtils';

const CASTLING_ROOK_TO_DESTINATION: Partial<Record<Square, Partial<Record<Square, Square>>>> = {
  e1: { h1: 'g1', a1: 'c1' },
  e8: { h8: 'g8', a8: 'c8' },
};

const CASTLING_DESTINATION_TO_ROOK: Partial<Record<Square, Square>> = {
  g1: 'h1',
  c1: 'a1',
  g8: 'h8',
  c8: 'a8',
};

export const normalizeCastlingTarget = (from: Square, to: Square): Square => {
  return CASTLING_ROOK_TO_DESTINATION[from]?.[to] ?? to;
};

export const getCastlingHintSquares = (legalMoves: Square[]): Set<Square> => {
  const hints = new Set<Square>();
  for (const move of legalMoves) {
    const rookSquare = CASTLING_DESTINATION_TO_ROOK[move];
    if (rookSquare && legalMoves.includes(rookSquare)) {
      hints.add(rookSquare);
    }
  }
  return hints;
};

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
  const targets = legalMoves.map((move) => move.to as Square);

  // When a king can castle, also highlight the rook square as a valid destination
  const piece = chess.get(square as ChessSquare);
  if (piece?.type === 'k') {
    for (const target of [...targets]) {
      const rookSquare = CASTLING_DESTINATION_TO_ROOK[target];
      if (rookSquare) {
        targets.push(rookSquare);
      }
    }
  }

  return targets;
};

/**
 * Get legal moves for a piece as if it were that piece's turn.
 * Used for premove calculation when it's the opponent's turn.
 * Flips the turn in the FEN to calculate what moves would be legal.
 * Also includes:
 * - Squares occupied by own pieces (for potential recaptures)
 * - X-ray squares for sliding pieces (squares behind one blocking piece)
 */
export const getPremoveLegalMoves = (fen: string, square: Square): Square[] => {
  // Flip the turn in the FEN
  const parts = fen.split(' ');
  const pieceColor = parts[1] === 'w' ? 'b' : 'w'; // The color that will premove
  parts[1] = pieceColor;
  // Clear en passant since it won't be valid after opponent moves
  parts[3] = '-';
  const flippedFen = parts.join(' ');

  const chess = new Chess(flippedFen);
  const legalMoves = chess.moves({ square, verbose: true });
  const legalSquares = legalMoves.map((move) => move.to as Square);

  // When a king can castle, also include the rook square as a valid premove destination
  const piece = chess.get(square as ChessSquare);
  if (piece?.type === 'k') {
    for (const target of [...legalSquares]) {
      const rookSquare = CASTLING_DESTINATION_TO_ROOK[target];
      if (rookSquare) {
        legalSquares.push(rookSquare);
      }
    }
  }

  // Also add squares occupied by own pieces that this piece could theoretically reach
  // This allows premoves to target squares where your own piece might be captured
  const ownPieceSquares = getOwnPieceSquaresInRange(flippedFen, square, pieceColor);

  // Add X-ray squares for sliding pieces (queen, rook, bishop)
  // This allows premoves through one blocking piece
  const xraySquares = getXraySquares(flippedFen, square);

  // Combine and dedupe
  const allSquares = new Set([...legalSquares, ...ownPieceSquares, ...xraySquares]);
  return Array.from(allSquares);
};

/**
 * Get X-ray squares for sliding pieces (queen, rook, bishop).
 * These are squares that the piece could reach if one blocking piece moved.
 * Allows premoves through a single blocker.
 */
const getXraySquares = (fen: string, square: Square): Square[] => {
  const chess = new Chess(fen);
  const piece = chess.get(square);
  if (!piece) return [];

  // Only sliding pieces have X-ray
  if (!['q', 'r', 'b'].includes(piece.type)) return [];

  const board = chess.board();
  const xraySquares: Square[] = [];

  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = 8 - parseInt(square[1], 10);

  // Define ray directions based on piece type
  const directions: [number, number][] = [];
  if (piece.type === 'r' || piece.type === 'q') {
    directions.push([0, 1], [0, -1], [1, 0], [-1, 0]); // Straight lines
  }
  if (piece.type === 'b' || piece.type === 'q') {
    directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]); // Diagonals
  }

  for (const [dRow, dCol] of directions) {
    let blockerFound = false;
    let currentRow = rank + dRow;
    let currentCol = file + dCol;

    while (currentRow >= 0 && currentRow < 8 && currentCol >= 0 && currentCol < 8) {
      const cell = board[currentRow][currentCol];
      const targetFile = String.fromCharCode('a'.charCodeAt(0) + currentCol);
      const targetRank = 8 - currentRow;
      const targetSquare = `${targetFile}${targetRank}` as Square;

      if (cell) {
        if (!blockerFound) {
          // First piece encountered - this is the blocker
          blockerFound = true;
        } else {
          // Second piece encountered - this is an X-ray target
          xraySquares.push(targetSquare);
          break; // Stop after finding first X-ray target in this direction
        }
      } else if (blockerFound) {
        // Empty square after blocker - valid X-ray target
        xraySquares.push(targetSquare);
      }

      currentRow += dRow;
      currentCol += dCol;
    }
  }

  return xraySquares;
};

/**
 * Get squares occupied by own pieces that the piece at `square` could theoretically move to.
 * Used for premove targeting - allows recapturing on squares where your piece might be taken.
 */
const getOwnPieceSquaresInRange = (fen: string, square: Square, pieceColor: Side): Square[] => {
  const chess = new Chess(fen);
  const piece = chess.get(square);
  if (!piece) return [];

  const board = chess.board();
  const ownPieceSquares: Square[] = [];

  // Find all squares with own pieces
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = board[row][col];
      if (cell && cell.color === pieceColor) {
        const file = String.fromCharCode('a'.charCodeAt(0) + col);
        const rank = 8 - row;
        const targetSquare = `${file}${rank}` as Square;

        // Skip the source square itself
        if (targetSquare === square) continue;

        // Check if the piece could theoretically reach this square
        if (canPieceReach(piece.type, square, targetSquare, pieceColor, board)) {
          ownPieceSquares.push(targetSquare);
        }
      }
    }
  }

  return ownPieceSquares;
};

/**
 * Check if a piece type can theoretically reach from source to target.
 * This is a simplified check for premove purposes - doesn't validate blocking pieces
 * since those might be captured/moved by the time the premove executes.
 */
const canPieceReach = (
  pieceType: string,
  from: Square,
  to: Square,
  color: Side,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _board: any[][]
): boolean => {
  const fromFile = from.charCodeAt(0) - 'a'.charCodeAt(0);
  const fromRank = parseInt(from[1], 10) - 1;
  const toFile = to.charCodeAt(0) - 'a'.charCodeAt(0);
  const toRank = parseInt(to[1], 10) - 1;

  const fileDiff = Math.abs(toFile - fromFile);
  const rankDiff = Math.abs(toRank - fromRank);

  switch (pieceType) {
    case 'p': {
      // Pawns can only capture diagonally
      const direction = color === 'w' ? 1 : -1;
      const rankMove = toRank - fromRank;
      return fileDiff === 1 && rankMove === direction;
    }
    case 'n':
      // Knight: L-shape
      return (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);
    case 'b':
      // Bishop: diagonal
      return fileDiff === rankDiff && fileDiff > 0;
    case 'r':
      // Rook: straight lines
      return (fileDiff === 0 || rankDiff === 0) && (fileDiff > 0 || rankDiff > 0);
    case 'q':
      // Queen: diagonal or straight
      return (
        (fileDiff === rankDiff && fileDiff > 0) ||
        ((fileDiff === 0 || rankDiff === 0) && (fileDiff > 0 || rankDiff > 0))
      );
    case 'k':
      // King: one square in any direction
      return fileDiff <= 1 && rankDiff <= 1 && (fileDiff > 0 || rankDiff > 0);
    default:
      return false;
  }
};

/** Check if a piece at the given square can be moved by the specified player */
export const canMovePieceAt = (
  fen: string,
  square: Square,
  playerColor: Side,
  board: BoardSquare[]
): boolean => {
  const sideToMove = getTurnFromFen(fen);
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

// getPieceColor is now imported from pieceUtils.ts
export { getPieceColor } from './pieceUtils';

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

/** Find the king's square for the given color */
const findKingSquare = (board: BoardSquare[], color: Side): Square | null => {
  const kingPiece = makePiece(color, 'K');
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
    const currentTurn = getTurnFromFen(newFen);
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
