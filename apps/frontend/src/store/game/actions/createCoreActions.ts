import type { ChessStore } from '../stores/createChessStore';
import type { UIStore } from '../stores/createUIStore';
import type { CoreActions } from '../types';

// ============================================================================
// Core Stores Interface
// ============================================================================

export interface CoreStores {
  chess: ChessStore;
  ui: UIStore;
}

// ============================================================================
// Factory
// ============================================================================

export const createCoreActions = (stores: CoreStores): CoreActions => {
  const { chess, ui } = stores;

  // ============================================================================
  // Navigation & UI Actions
  // ============================================================================

  const jumpToMove = (index: number) => {
    chess.jumpToMoveIndex(index);
  };

  const jumpToPreviousMove = () => {
    const newIndex = chess.state.viewMoveIndex - 1;
    if (newIndex >= 0) {
      chess.jumpToMoveIndex(newIndex);
    }
  };

  const jumpToNextMove = () => {
    const newIndex = chess.state.viewMoveIndex + 1;
    if (newIndex <= chess.state.moveHistory.length - 1) {
      chess.jumpToMoveIndex(newIndex);
    }
  };

  const flipBoard = () => {
    ui.flipBoard();
  };

  // ============================================================================
  // Game Lifecycle
  // ============================================================================

  const exitGame = () => {
    chess.exitGame();
  };

  return {
    jumpToMove,
    jumpToPreviousMove,
    jumpToNextMove,
    flipBoard,
    exitGame,
  };
};
