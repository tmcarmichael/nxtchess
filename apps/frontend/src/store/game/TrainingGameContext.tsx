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
    hasEngineError: () => engine.state.status === 'error' || chess.state.initError !== null,
    isPlaying: () => chess.state.lifecycle === 'playing',
    material: () => {
      // capturedWhite = white pieces captured by black (material black gained)
      // capturedBlack = black pieces captured by white (material white gained)
      const blackGained = chess.state.capturedWhite.reduce(
        (sum, p) => sum + (PIECE_VALUES[p[1]?.toLowerCase()] ?? 0),
        0
      );
      const whiteGained = chess.state.capturedBlack.reduce(
        (sum, p) => sum + (PIECE_VALUES[p[1]?.toLowerCase()] ?? 0),
        0
      );
      // Positive diff = white is ahead, negative = black is ahead
      return { diff: whiteGained - blackGained };
    },
  };

  // ============================================================================
  // Cleanup
  // ============================================================================

  onCleanup(() => {
    timer.stop();
    engine.terminate();
    ui.cleanup();
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
        error: chess.state.initError || engine.state.error,
      },
    },
    timer: {
      timeControl: timer.state.timeControl,
    },
    multiplayer: null, // Training mode has no multiplayer
    actions: {
      jumpToFirstMove: actions.jumpToFirstMove,
      jumpToPreviousMove: actions.jumpToPreviousMove,
      jumpToNextMove: actions.jumpToNextMove,
      jumpToLastMove: actions.jumpToLastMove,
      flipBoard: actions.flipBoard,
      exitGame: actions.exitGame,
      retryEngineInit: actions.retryEngineInit,
      applyPlayerMove: actions.applyPlayerMove,
    },
    derived: {
      isEngineLoading: derived.isEngineLoading,
      hasEngineError: derived.hasEngineError,
      isMultiplayer: () => false,
      showEvalBar: () => !ui.state.trainingFocusMode,
      allowBothSides: () => false,
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
