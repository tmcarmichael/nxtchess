import { createContext, useContext, onCleanup, createMemo, batch, type JSX } from 'solid-js';
import { sessionManager } from '../../services/game/session/SessionManager';
import { DEBUG } from '../../shared/utils/debug';
import { computeMaterialDiff } from '../../types/chess';
import { createCoreActions } from './actions/createCoreActions';
import { createPlayActions } from './actions/createPlayActions';
import { createChessStore } from './stores/createChessStore';
import { createEngineStore } from './stores/createEngineStore';
import { createMultiplayerStore } from './stores/createMultiplayerStore';
import { createTimerStore } from './stores/createTimerStore';
import { createUIStore } from './stores/createUIStore';
import { UnifiedGameContextInstance, type UnifiedGameContext } from './useGameContext';
import type { PlayGameContextValue } from './types';

const PlayGameContext = createContext<PlayGameContextValue>();

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
    batch(() => {
      chess.setPlayerColor(playerColor);
      ui.setBoardView(playerColor);
    });
  });

  multiplayer.on('game:joined', ({ playerColor }) => {
    batch(() => {
      chess.setPlayerColor(playerColor);
      ui.setBoardView(playerColor);
      chess.setLifecycle('playing');
    });
  });

  multiplayer.on('game:started', ({ whiteTimeMs, blackTimeMs }) => {
    batch(() => {
      chess.setLifecycle('playing');
      timer.sync(whiteTimeMs, blackTimeMs);
    });
    // Don't start local timer for multiplayer - server TIME_UPDATE is authoritative
  });

  multiplayer.on('move:accepted', ({ fen, san, from, to, isCheck, whiteTimeMs, blackTimeMs }) => {
    batch(() => {
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
  });

  multiplayer.on('move:rejected', ({ fen, reason }) => {
    chess.rejectMove(fen, reason);
  });

  multiplayer.on('move:opponent', ({ fen, san, from, to, whiteTimeMs, blackTimeMs, isCheck }) => {
    batch(() => {
      chess.syncFromMultiplayer({ fen, san, from, to, whiteTimeMs, blackTimeMs, isCheck });
      if (whiteTimeMs !== undefined && blackTimeMs !== undefined) {
        timer.sync(whiteTimeMs, blackTimeMs);
      }
    });
  });

  multiplayer.on('time:update', ({ whiteTimeMs, blackTimeMs }) => {
    timer.sync(whiteTimeMs, blackTimeMs);
  });

  multiplayer.on('game:ended', ({ reason, winner }) => {
    batch(() => {
      timer.stop();
      chess.endGame(reason, winner);
      ui.showEndModal();
    });
  });

  multiplayer.on('game:opponent_left', () => {
    if (DEBUG) console.warn('Opponent left the game');
  });

  multiplayer.on('game:error', ({ message }) => {
    if (DEBUG) console.error('Game sync error:', message);
  });

  const coreActions = createCoreActions({ chess, ui });
  const actions = createPlayActions({ chess, timer, engine, multiplayer, ui }, coreActions);

  const material = createMemo(() =>
    computeMaterialDiff(chess.state.capturedWhite, chess.state.capturedBlack)
  );

  const derived = {
    isEngineReady: () => engine.state.status === 'ready',
    isEngineLoading: () => engine.state.status === 'loading',
    hasEngineError: () => engine.state.status === 'error',
    isPlaying: () => chess.state.lifecycle === 'playing',
    isMultiplayer: () => chess.state.opponentType === 'human',
    isWaitingForOpponent: () => multiplayer.state.isWaiting,
    material,
  };

  onCleanup(() => {
    timer.stop();
    engine.terminate();
    ui.cleanup();
    sessionManager.destroyAllSessions();
  });

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
      jumpToFirstMove: actions.jumpToFirstMove,
      jumpToPreviousMove: actions.jumpToPreviousMove,
      jumpToNextMove: actions.jumpToNextMove,
      jumpToLastMove: actions.jumpToLastMove,
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
      allowBothSides: () => false,
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
