import { Side, PieceType } from '../../types';

/**
 * Piece string utilities.
 * Piece strings are 2-character codes: color + type (e.g., 'wK' = white king, 'bP' = black pawn)
 */

/** Extract the color (side) from a piece string (e.g., 'wK' -> 'w') */
export const getPieceColor = (piece: string): Side => piece[0] as Side;

/** Extract the piece type from a piece string (e.g., 'wK' -> 'K') */
export const getPieceType = (piece: string): string => piece[1];

/** Create a piece string from color and type (e.g., ('w', 'K') -> 'wK') */
export const makePiece = (color: Side, type: string): PieceType => (color + type) as PieceType;

/** Check if a piece belongs to a specific side */
export const isPieceSide = (piece: string, side: Side): boolean => piece[0] === side;
