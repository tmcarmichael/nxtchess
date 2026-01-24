import { createContext, useContext, onCleanup, type JSX } from 'solid-js';
import { sessionManager } from '../../services/game/session/SessionManager';
import { createCoreActions } from './actions/createCoreActions';
import { createPlayActions } from './actions/createPlayActions';
import { createChessStore } from './stores/createChessStore';
import { createEngineStore } from './stores/createEngineStore';
import { createMultiplayerStore } from './stores/createMultiplayerStore';
import { createTimerStore } from './stores/createTimerStore';
import { createUIStore } from './stores/createUIStore';
import { UnifiedGameContextInstance, type UnifiedGameContext } from './useGameContext';
import type { PlayGameContextValue } from './types';

// ============================================================================
// Context
// ============================================================================

const PlayGameContext = createContext<PlayGameContextValue>();

// ============================================================================
// Piece Values for Material Calculation
// ============================================================================

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };

// ============================================================================
// Play Game Provider
// ============================================================================

export const PlayGameProvider = (props: { children: JSX.Element }) => {
  // Create all stores
  const chess = createChessStore();
  const timer = createTimerStore();
  const engine = createEngineStore();
  const ui = createUIStore();
  const multiplayer = createMultiplayerStore();

  // Set up multiplayer event handlers
  multiplayer.setPlayerColorGetter(() => chess.state.playerColor);

  multiplayer.on('game:created', ({ playerColor }) => {
    chess.setPlayerColor(playerColor);
    ui.setBoardView(playerColor);
  });

  multiplayer.on('game:joined', ({ playerColor }) => {
    chess.setPlayerColor(playerColor);
    ui.setBoardView(playerColor);
    chess.setLifecycle('playing');
  });

  multiplayer.on('game:started', ({ whiteTimeMs, blackTimeMs }) => {
    chess.setLifecycle('playing');
    timer.sync(whiteTimeMs, blackTimeMs);
    // Don't start local timer for multiplayer - server TIME_UPDATE is authoritative
  });

  multiplayer.on('move:accepted', ({ fen, san, from, to, isCheck, whiteTimeMs, blackTimeMs }) => {
    chess.confirmMove({
      serverFen: fen,
      san,
      from,
      to,
      isCheck,
      whiteTimeMs: whiteTimeMs ?? timer.state.whiteTime,
      blackTimeMs: blackTimeMs ?? timer.state.blackTime,
    });
    if (whiteTimeMs !== undefined && blackTimeMs !== undefined) {
      timer.sync(whiteTimeMs, blackTimeMs);
    }
  });

  multiplayer.on('move:rejected', ({ fen, reason }) => {
    chess.rejectMove(fen, reason);
  });

  multiplayer.on('move:opponent', ({ fen, san, from, to, whiteTimeMs, blackTimeMs, isCheck }) => {
    chess.syncFromMultiplayer({ fen, san, from, to, whiteTimeMs, blackTimeMs, isCheck });
    if (whiteTimeMs !== undefined && blackTimeMs !== undefined) {
      timer.sync(whiteTimeMs, blackTimeMs);
    }
  });

  multiplayer.on('time:update', ({ whiteTimeMs, blackTimeMs }) => {
    timer.sync(whiteTimeMs, blackTimeMs);
  });

  multiplayer.on('game:ended', ({ reason, winner }) => {
    timer.stop();
    chess.endGame(reason, winner);
    ui.showEndModal();
  });

  multiplayer.on('game:opponent_left', () => {
    console.log('Opponent left the game');
  });

  multiplayer.on('game:error', ({ message }) => {
    console.error('Game sync error:', message);
  });

  // ============================================================================
  // Create Actions
  // ============================================================================

  const coreActions = createCoreActions({ chess, ui });
  const actions = createPlayActions({ chess, timer, engine, multiplayer, ui }, coreActions);

  // ============================================================================
  // Derived State
  // ============================================================================

  const derived = {
    isEngineReady: () => engine.state.status === 'ready',
    isEngineLoading: () => engine.state.status === 'loading',
    hasEngineError: () => engine.state.status === 'error',
    isPlaying: () => chess.state.lifecycle === 'playing',
    isMultiplayer: () => chess.state.opponentType === 'human',
    isWaitingForOpponent: () => multiplayer.state.isWaiting,
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

  const value: PlayGameContextValue = {
    chess,
    timer,
    ui,
    engine,
    multiplayer,
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
      get whiteTime() {
        return timer.state.whiteTime;
      },
      get blackTime() {
        return timer.state.blackTime;
      },
    },
    multiplayer,
    actions: {
      jumpToPreviousMove: actions.jumpToPreviousMove,
      jumpToNextMove: actions.jumpToNextMove,
      flipBoard: actions.flipBoard,
      exitGame: actions.exitGame,
      retryEngineInit: actions.retryEngineInit,
      applyPlayerMove: actions.applyPlayerMove,
      applyMultiplayerMove: actions.applyMultiplayerMove,
    },
    derived: {
      isEngineLoading: derived.isEngineLoading,
      hasEngineError: derived.hasEngineError,
      isMultiplayer: derived.isMultiplayer,
      showEvalBar: () => false,
    },
  };

  return (
    <PlayGameContext.Provider value={value}>
      <UnifiedGameContextInstance.Provider value={unifiedValue}>
        {props.children}
      </UnifiedGameContextInstance.Provider>
    </PlayGameContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export const usePlayGame = () => {
  const ctx = useContext(PlayGameContext);
  if (!ctx) {
    throw new Error('usePlayGame must be used within <PlayGameProvider>');
  }
  return ctx;
};

/**
 * Optional variant that returns null when outside provider.
 * Use this when component may render outside PlayGameProvider (e.g., modals in header).
 */
export const usePlayGameOptional = (): PlayGameContextValue | null => {
  return useContext(PlayGameContext) ?? null;
};
