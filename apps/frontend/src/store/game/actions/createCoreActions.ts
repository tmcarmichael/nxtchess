import type { ChessStore } from '../stores/createChessStore';
import type { UIStore } from '../stores/createUIStore';
import type { CoreActions } from '../types';

export interface CoreStores {
  chess: ChessStore;
  ui: UIStore;
}

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
    if (newIndex >= -1) {
      chess.jumpToMoveIndex(newIndex);
    }
  };

  const jumpToNextMove = () => {
    const newIndex = chess.state.viewMoveIndex + 1;
    if (newIndex <= chess.state.moveHistory.length - 1) {
      chess.jumpToMoveIndex(newIndex);
    }
  };

  const jumpToFirstMove = () => {
    chess.jumpToMoveIndex(-1);
  };

  const jumpToLastMove = () => {
    const lastIndex = chess.state.moveHistory.length - 1;
    if (lastIndex >= 0) {
      chess.jumpToMoveIndex(lastIndex);
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
    jumpToFirstMove,
    jumpToLastMove,
    flipBoard,
    exitGame,
  };
};
