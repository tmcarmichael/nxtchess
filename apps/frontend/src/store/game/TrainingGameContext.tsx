import { createContext, useContext, onCleanup, type JSX } from 'solid-js';
import { sessionManager } from '../../services/game/session/SessionManager';
import { createCoreActions } from './actions/createCoreActions';
import { createTrainingActions } from './actions/createTrainingActions';
import { createChessStore } from './stores/createChessStore';
import { createEngineStore } from './stores/createEngineStore';
import { createTimerStore } from './stores/createTimerStore';
import { createUIStore } from './stores/createUIStore';
import { UnifiedGameContextInstance, type UnifiedGameContext } from './useGameContext';
import type { TrainingGameContextValue } from './types';

// ============================================================================
// Context
// ============================================================================

const TrainingGameContext = createContext<TrainingGameContextValue>();

// ============================================================================
// Piece Values for Material Calculation
// ============================================================================

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };

// ============================================================================
// Training Game Provider
// ============================================================================

export const TrainingGameProvider = (props: { children: JSX.Element }) => {
  // Create stores (no multiplayer needed for training)
  const chess = createChessStore();
  const timer = createTimerStore();
  const engine = createEngineStore();
  const ui = createUIStore();

  // ============================================================================
  // Create Actions
  // ============================================================================

  const coreActions = createCoreActions({ chess, ui });
  const actions = createTrainingActions({ chess, timer, engine, ui }, coreActions);

  // ============================================================================
  // Derived State
  // ============================================================================

  const derived = {
    isEngineReady: () => engine.state.status === 'ready',
    isEngineLoading: () => engine.state.status === 'loading',
    hasEngineError: () => engine.state.status === 'error',
    isPlaying: () => chess.state.lifecycle === 'playing',
    material: () => {
      const whiteCaptured = chess.state.capturedWhite.reduce(
        (sum, p) => sum + (PIECE_VALUES[p.toLowerCase()] ?? 0),
        0
      );
      const blackCaptured = chess.state.capturedBlack.reduce(
        (sum, p) => sum + (PIECE_VALUES[p.toLowerCase()] ?? 0),
        0
      );
      return { diff: whiteCaptured - blackCaptured };
    },
    formattedAIPlayStyle: () => {
      const style = chess.state.trainingAIPlayStyle;
      if (!style) return '';
      return style.charAt(0).toUpperCase() + style.slice(1);
    },
  };

  // ============================================================================
  // Cleanup
  // ============================================================================

  onCleanup(() => {
    timer.stop();
    engine.terminate();
    sessionManager.destroyAllSessions();
  });

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: TrainingGameContextValue = {
    chess,
    timer,
    ui,
    engine,
    actions,
    derived,
  };

  // Unified context for shared components like ChessBoardController
  const unifiedValue: UnifiedGameContext = {
    chess,
    ui,
    engine: {
      state: {
        isThinking: engine.state.isThinking,
        error: engine.state.error,
      },
    },
    timer: {
      timeControl: timer.state.timeControl,
    },
    multiplayer: null, // Training mode has no multiplayer
    actions: {
      jumpToPreviousMove: actions.jumpToPreviousMove,
      jumpToNextMove: actions.jumpToNextMove,
      flipBoard: actions.flipBoard,
      exitGame: actions.exitGame,
      retryEngineInit: actions.retryEngineInit,
      applyPlayerMove: actions.applyPlayerMove,
      // No multiplayer moves in training mode
    },
    derived: {
      isEngineLoading: derived.isEngineLoading,
      hasEngineError: derived.hasEngineError,
      isMultiplayer: () => false,
    },
  };

  return (
    <TrainingGameContext.Provider value={value}>
      <UnifiedGameContextInstance.Provider value={unifiedValue}>
        {props.children}
      </UnifiedGameContextInstance.Provider>
    </TrainingGameContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export const useTrainingGame = () => {
  const ctx = useContext(TrainingGameContext);
  if (!ctx) {
    throw new Error('useTrainingGame must be used within <TrainingGameProvider>');
  }
  return ctx;
};

/**
 * Optional variant that returns null when outside provider.
 * Use this when component may render outside TrainingGameProvider (e.g., modals in header).
 */
export const useTrainingGameOptional = (): TrainingGameContextValue | null => {
  return useContext(TrainingGameContext) ?? null;
};
