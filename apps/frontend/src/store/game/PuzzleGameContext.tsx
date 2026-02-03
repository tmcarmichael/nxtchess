import { createContext, useContext, onCleanup, type JSX } from 'solid-js';
import { sessionManager } from '../../services/game/session/SessionManager';
import { createCoreActions } from './actions/createCoreActions';
import { createPuzzleActions } from './actions/createPuzzleActions';
import { createChessStore } from './stores/createChessStore';
import { createEngineStore } from './stores/createEngineStore';
import { createTimerStore } from './stores/createTimerStore';
import { createUIStore } from './stores/createUIStore';
import { UnifiedGameContextInstance, type UnifiedGameContext } from './useGameContext';
import type { PuzzleGameContextValue } from './types';

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };

const PuzzleGameContext = createContext<PuzzleGameContextValue>();

export const PuzzleGameProvider = (props: { children: JSX.Element }) => {
  const chess = createChessStore();
  const timer = createTimerStore();
  const engine = createEngineStore();
  const ui = createUIStore({ initialFocusMode: true });

  const coreActions = createCoreActions({ chess, ui });
  const actions = createPuzzleActions({ chess, timer, engine, ui }, coreActions);

  const derived = {
    isEngineReady: () => engine.state.status === 'ready',
    isEngineLoading: () => engine.state.status === 'loading',
    hasEngineError: () => engine.state.status === 'error' || chess.state.initError !== null,
    isPlaying: () => chess.state.lifecycle === 'playing',
    material: () => {
      const blackGained = chess.state.capturedWhite.reduce(
        (sum, p) => sum + (PIECE_VALUES[p[1]?.toLowerCase()] ?? 0),
        0
      );
      const whiteGained = chess.state.capturedBlack.reduce(
        (sum, p) => sum + (PIECE_VALUES[p[1]?.toLowerCase()] ?? 0),
        0
      );
      return { diff: whiteGained - blackGained };
    },
  };

  onCleanup(() => {
    timer.stop();
    engine.terminate();
    ui.cleanup();
    sessionManager.destroyAllSessions();
  });

  const value: PuzzleGameContextValue = {
    chess,
    timer,
    ui,
    engine,
    actions,
    derived,
  };

  const unifiedValue: UnifiedGameContext = {
    chess,
    ui,
    engine: {
      state: {
        isThinking: false,
        error: chess.state.initError || engine.state.error,
      },
    },
    timer: {
      timeControl: 0,
    },
    multiplayer: null,
    actions: {
      jumpToPreviousMove: actions.jumpToPreviousMove,
      jumpToNextMove: actions.jumpToNextMove,
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
      getPuzzleFeedback: () => chess.state.puzzleFeedback,
      clearPuzzleFeedback: () => chess.setPuzzleFeedback(null),
    },
  };

  return (
    <PuzzleGameContext.Provider value={value}>
      <UnifiedGameContextInstance.Provider value={unifiedValue}>
        {props.children}
      </UnifiedGameContextInstance.Provider>
    </PuzzleGameContext.Provider>
  );
};

export const usePuzzleGame = () => {
  const ctx = useContext(PuzzleGameContext);
  if (!ctx) {
    throw new Error('usePuzzleGame must be used within <PuzzleGameProvider>');
  }
  return ctx;
};

export const usePuzzleGameOptional = (): PuzzleGameContextValue | null => {
  return useContext(PuzzleGameContext) ?? null;
};
