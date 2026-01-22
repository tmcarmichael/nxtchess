import { useContext, createContext } from 'solid-js';
import type { ChessStore } from './stores/createChessStore';
import type { MultiplayerStore } from './stores/createMultiplayerStore';
import type { UIStore } from './stores/createUIStore';
import type { Square, PromotionPiece } from '../../types/chess';

// ============================================================================
// Unified Game Context Interface
// ============================================================================

/**
 * This interface provides a unified view for components that need to work
 * across both Play and Training modes. Components like ChessBoardController
 * use this to avoid mode-specific coupling.
 */
export interface UnifiedGameContext {
  chess: ChessStore;
  ui: UIStore;
  engine: {
    state: {
      isThinking: boolean;
      error: string | null;
    };
  };
  // Timer info for animation decisions and low-time warnings
  timer: {
    timeControl: number; // in minutes (1 = bullet, 3 = blitz, etc.)
    whiteTime?: number; // milliseconds remaining (optional, only in timed games)
    blackTime?: number; // milliseconds remaining (optional, only in timed games)
  };
  // Multiplayer is optional - only available in Play mode
  multiplayer: MultiplayerStore | null;

  // Unified actions that work across modes
  actions: {
    jumpToPreviousMove: () => void;
    jumpToNextMove: () => void;
    flipBoard: () => void;
    exitGame: () => void;
    retryEngineInit: () => Promise<void>;
    applyPlayerMove: (from: Square, to: Square, promotion?: PromotionPiece) => void;
    applyMultiplayerMove?: (from: Square, to: Square, promotion?: PromotionPiece) => void;
  };

  // Unified derived state
  derived: {
    isEngineLoading: () => boolean;
    hasEngineError: () => boolean;
    isMultiplayer: () => boolean;
  };
}

// ============================================================================
// Context for Unified Access
// ============================================================================

export const UnifiedGameContextInstance = createContext<UnifiedGameContext>();

// ============================================================================
// Hook
// ============================================================================

export const useGameContext = (): UnifiedGameContext => {
  const ctx = useContext(UnifiedGameContextInstance);
  if (!ctx) {
    throw new Error('useGameContext must be used within a game provider (Play or Training)');
  }
  return ctx;
};
