import { type Square } from '../../types/chess';
import { type Side } from '../../types/game';

/**
 * FEN (Forsyth–Edwards Notation) utility functions.
 * FEN string format: "position turn castling en-passant halfmove fullmove"
 * Example: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
 */

/** Extract the current turn (side to move) from a FEN string */
export const getTurnFromFen = (fen: string): Side => fen.split(' ')[1] as Side;

/** Find a king's square by scanning the FEN placement string directly */
export const findKingSquareFromFen = (fen: string, color: Side): Square | null => {
  const target = color === 'w' ? 'K' : 'k';
  const placement = fen.split(' ')[0];
  const ranks = placement.split('/');

  for (let row = 0; row < 8; row++) {
    const rankNumber = 8 - row;
    let col = 0;
    for (const ch of ranks[row]) {
      if (ch >= '1' && ch <= '8') {
        col += ch.charCodeAt(0) - 48;
      } else {
        if (ch === target) {
          const file = String.fromCharCode(97 + col);
          return (file + rankNumber) as Square;
        }
        col++;
      }
    }
  }

  return null;
};
