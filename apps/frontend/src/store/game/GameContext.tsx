import { createContext, useContext, onCleanup, type JSX } from 'solid-js';
import { sessionManager } from '../../services/game/session/SessionManager';
import { createGameActions, type GameActions } from './createGameActions';
import { createChessStore, type ChessStore } from './stores/createChessStore';
import { createEngineStore, type EngineStore } from './stores/createEngineStore';
import { createMultiplayerStore, type MultiplayerStore } from './stores/createMultiplayerStore';
import { createTimerStore, type TimerStore } from './stores/createTimerStore';
import { createUIStore, type UIStore } from './stores/createUIStore';

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

  // Create multiplayer store and subscribe to events
  const multiplayer = createMultiplayerStore();
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
    timer.sync(msToSeconds(whiteTimeMs), msToSeconds(blackTimeMs));
    timer.start(
      () => chess.state.currentTurn,
      () => {}
    );
  });

  multiplayer.on('move:accepted', ({ fen, whiteTimeMs, blackTimeMs }) => {
    chess.confirmMove(
      fen,
      whiteTimeMs ?? timer.state.whiteTime * 1000,
      blackTimeMs ?? timer.state.blackTime * 1000
    );
    if (whiteTimeMs !== undefined && blackTimeMs !== undefined) {
      timer.sync(msToSeconds(whiteTimeMs), msToSeconds(blackTimeMs));
    }
  });

  multiplayer.on('move:rejected', ({ fen, reason }) => {
    chess.rejectMove(fen, reason);
  });

  multiplayer.on('move:opponent', ({ fen, san, from, to, whiteTimeMs, blackTimeMs, isCheck }) => {
    chess.syncFromMultiplayer({ fen, san, from, to, whiteTimeMs, blackTimeMs, isCheck });
    if (whiteTimeMs !== undefined && blackTimeMs !== undefined) {
      timer.sync(msToSeconds(whiteTimeMs), msToSeconds(blackTimeMs));
    }
  });

  multiplayer.on('time:update', ({ whiteTimeMs, blackTimeMs }) => {
    timer.sync(msToSeconds(whiteTimeMs), msToSeconds(blackTimeMs));
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
