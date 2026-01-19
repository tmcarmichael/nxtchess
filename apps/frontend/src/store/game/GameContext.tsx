import { createContext, useContext, onCleanup, type JSX } from 'solid-js';
import { sessionManager } from '../../services/game';
import { createGameActions, type GameActions } from './createGameActions';
import {
  createChessStore,
  createTimerStore,
  createEngineStore,
  createMultiplayerStore,
  createUIStore,
  type ChessStore,
  type TimerStore,
  type EngineStore,
  type MultiplayerStore,
  type UIStore,
  type MultiplayerEventCallbacks,
} from './stores';

// ============================================================================
// Context Value Type
// ============================================================================

export interface GameContextValue {
  chess: ChessStore;
  timer: TimerStore;
  engine: EngineStore;
  multiplayer: MultiplayerStore;
  ui: UIStore;
  // High-level actions that coordinate across stores
  actions: GameActions;
  // Derived state that combines multiple stores
  derived: {
    isEngineReady: () => boolean;
    isEngineLoading: () => boolean;
    hasEngineError: () => boolean;
    isPlaying: () => boolean;
    isMultiplayer: () => boolean;
    isWaitingForOpponent: () => boolean;
    material: () => { diff: number };
    formattedAIPlayStyle: () => string;
  };
}

const GameContext = createContext<GameContextValue>();

// ============================================================================
// Helper: Convert ms to seconds
// ============================================================================

const msToSeconds = (ms: number) => Math.floor(ms / 1000);

// ============================================================================
// Game Provider
// ============================================================================

export const GameProvider = (props: { children: JSX.Element }) => {
  // Create stores that don't depend on others first
  const chess = createChessStore();
  const timer = createTimerStore();
  const engine = createEngineStore();
  const ui = createUIStore();

  // Create multiplayer store with callbacks that reference other stores
  const multiplayerCallbacks: MultiplayerEventCallbacks = {
    onGameCreated: ({ playerColor }) => {
      chess.setPlayerColor(playerColor);
      ui.setBoardView(playerColor);
    },

    onGameJoined: ({ playerColor }) => {
      chess.setPlayerColor(playerColor);
      ui.setBoardView(playerColor);
      // Game joined means we're the second player, game starts immediately
      chess.setLifecycle('playing');
    },

    onGameStarted: ({ whiteTimeMs, blackTimeMs }) => {
      chess.setLifecycle('playing');
      timer.sync(msToSeconds(whiteTimeMs), msToSeconds(blackTimeMs));

      // Start timer for multiplayer - server handles actual timeout, this is for display
      timer.start(
        () => chess.state.currentTurn,
        () => {} // Server sends game:ended on timeout, no client-side handling needed
      );
    },

    onMoveAccepted: ({ fen, whiteTimeMs, blackTimeMs }) => {
      chess.confirmMove(
        fen,
        whiteTimeMs ?? timer.state.whiteTime * 1000,
        blackTimeMs ?? timer.state.blackTime * 1000
      );
      if (whiteTimeMs !== undefined && blackTimeMs !== undefined) {
        timer.sync(msToSeconds(whiteTimeMs), msToSeconds(blackTimeMs));
      }
    },

    onMoveRejected: ({ fen, reason }) => {
      chess.rejectMove(fen, reason);
    },

    onOpponentMove: ({ fen, san, from, to, whiteTimeMs, blackTimeMs, isCheck }) => {
      chess.syncFromMultiplayer({
        fen,
        san,
        from,
        to,
        whiteTimeMs,
        blackTimeMs,
        isCheck,
      });

      if (whiteTimeMs !== undefined && blackTimeMs !== undefined) {
        timer.sync(msToSeconds(whiteTimeMs), msToSeconds(blackTimeMs));
      }
    },

    onTimeUpdate: ({ whiteTimeMs, blackTimeMs }) => {
      timer.sync(msToSeconds(whiteTimeMs), msToSeconds(blackTimeMs));
    },

    onGameEnded: ({ reason, winner }) => {
      timer.stop();
      chess.endGame(reason, winner);
      ui.showEndModal();
    },

    onOpponentLeft: () => {
      console.log('Opponent left the game');
    },

    onError: (message) => {
      console.error('Game sync error:', message);
    },

    getCurrentTurn: () => chess.state.currentTurn,
    getPlayerColor: () => chess.state.playerColor,
  };

  const multiplayer = createMultiplayerStore(multiplayerCallbacks);

  // ============================================================================
  // High-Level Actions (via factory)
  // ============================================================================

  const actions = createGameActions({ chess, timer, engine, multiplayer, ui });

  // ============================================================================
  // Derived State
  // ============================================================================

  // Piece values for material calculation
  const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };

  const derived = {
    isEngineReady: () => engine.state.status === 'ready',
    isEngineLoading: () => engine.state.status === 'loading',
    hasEngineError: () => engine.state.status === 'error',
    isPlaying: () => chess.state.lifecycle === 'playing',
    isMultiplayer: () => chess.state.opponentType === 'human',
    isWaitingForOpponent: () => multiplayer.state.isWaiting,
    // Material advantage (positive = white has captured more, negative = black has captured more)
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
    // Formatted AI play style (capitalized)
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

  const value: GameContextValue = {
    chess,
    timer,
    engine,
    multiplayer,
    ui,
    actions,
    derived,
  };

  return <GameContext.Provider value={value}>{props.children}</GameContext.Provider>;
};

// ============================================================================
// Hooks
// ============================================================================

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within <GameProvider>');
  }
  return ctx;
};
