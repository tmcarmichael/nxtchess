import { Chess } from 'chess.js';
import type { Square, PromotionPiece } from '../../../types/chess';
import type { ChessStore } from '../stores/createChessStore';
import type { UIStore } from '../stores/createUIStore';
import type { AnalyzeActions, CoreActions } from '../types';

// ============================================================================
// Analyze Stores Interface
// ============================================================================

export interface AnalyzeStores {
  chess: ChessStore;
  ui: UIStore;
}

// ============================================================================
// Constants
// ============================================================================

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// ============================================================================
// Factory
// ============================================================================

export const createAnalyzeActions = (
  stores: AnalyzeStores,
  coreActions: CoreActions
): AnalyzeActions => {
  const { chess } = stores;

  // ============================================================================
  // FEN/PGN Loading
  // ============================================================================

  const loadFen = (fen: string): boolean => {
    try {
      // Validate FEN with chess.js
      new Chess(fen);

      chess.startGame({
        mode: 'analysis',
        playerColor: 'w',
        opponentType: 'ai',
        timeControl: 0,
        fen,
      });
      chess.setLifecycle('playing');
      return true;
    } catch {
      return false;
    }
  };

  const loadPgn = (pgn: string): boolean => {
    try {
      const tempChess = new Chess();
      tempChess.loadPgn(pgn);

      // Start with the initial position
      chess.startGame({
        mode: 'analysis',
        playerColor: 'w',
        opponentType: 'ai',
        timeControl: 0,
      });
      chess.setLifecycle('playing');

      // Apply all moves from the PGN
      const history = tempChess.history({ verbose: true });
      for (const move of history) {
        chess.applyMove(move.from as Square, move.to as Square, move.promotion as PromotionPiece);
      }

      return true;
    } catch {
      return false;
    }
  };

  const resetToStart = () => {
    loadFen(INITIAL_FEN);
  };

  // ============================================================================
  // Move Application
  // ============================================================================

  const applyMove = (from: Square, to: Square, promotion?: PromotionPiece): boolean => {
    if (chess.state.lifecycle !== 'playing') return false;

    // If viewing history, truncate to current view position first
    // This allows playing alternative lines from any point in the game
    if (chess.derived.isViewingHistory()) {
      chess.truncateToViewPosition();
    }

    return chess.applyMove(from, to, promotion);
  };

  return {
    ...coreActions,
    loadFen,
    loadPgn,
    resetToStart,
    applyMove,
  };
};
