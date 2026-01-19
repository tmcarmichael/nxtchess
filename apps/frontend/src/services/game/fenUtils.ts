import { type Side } from '../../types';

/**
 * FEN (Forsyth–Edwards Notation) utility functions.
 * FEN string format: "position turn castling en-passant halfmove fullmove"
 * Example: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
 */

/** Extract the current turn (side to move) from a FEN string */
export const getTurnFromFen = (fen: string): Side => fen.split(' ')[1] as Side;
