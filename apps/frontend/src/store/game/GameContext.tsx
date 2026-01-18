import { createContext, useContext, onCleanup, JSX, batch } from 'solid-js';
import { Chess } from 'chess.js';
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
} from './stores';
import { sessionManager, transition, canMakeMove, computeMaterial } from '../../services/game';
import type {
  Side,
  Square,
  PromotionPiece,
  GameWinner,
  GameOverReason,
  StartGameOptions,
  MultiplayerGameOptions,
} from '../../types';
import type {
  SyncEvent,
  GameCreatedData,
  GameJoinedData,
  GameStartedData,
  MoveAcceptedData,
  MoveRejectedData,
  OpponentMoveData,
  GameEndedData,
  TimeUpdateData,
} from '../../services/sync';

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
  actions: {
    startNewGame: (options: StartGameOptions) => Promise<void>;
    startMultiplayerGame: (options: MultiplayerGameOptions) => Promise<void>;
    joinMultiplayerGame: (gameId: string) => void;
    applyPlayerMove: (from: Square, to: Square, promotion?: PromotionPiece) => void;
    applyMultiplayerMove: (from: Square, to: Square, promotion?: PromotionPiece) => void;
    exitGame: () => void;
    resign: () => void;
    resignMultiplayer: () => void;
    handleTimeOut: (winner: Side) => void;
    retryEngineInit: () => Promise<void>;
  };
  // Derived state that combines multiple stores
  derived: {
    isEngineReady: () => boolean;
    isEngineLoading: () => boolean;
    hasEngineError: () => boolean;
    isPlaying: () => boolean;
    isMultiplayer: () => boolean;
    isWaitingForOpponent: () => boolean;
  };
}

const GameContext = createContext<GameContextValue>();

// ============================================================================
// Game Provider
// ============================================================================

export const GameProvider = (props: { children: JSX.Element }) => {
  // Create individual stores
  const chess = createChessStore();
  const timer = createTimerStore();
  const engine = createEngineStore();
  const multiplayer = createMultiplayerStore();
  const ui = createUIStore();

  // ============================================================================
  // Multiplayer Event Handler
  // ============================================================================

  const handleSyncEvent = (event: SyncEvent) => {
    switch (event.type) {
      case 'game:created': {
        const data = event.data as GameCreatedData;
        batch(() => {
          multiplayer.setGameId(data.gameId);
          chess.setPlayerColor(data.color === 'white' ? 'w' : 'b');
          ui.setBoardView(data.color === 'white' ? 'w' : 'b');
          multiplayer.setWaiting(true);
        });
        break;
      }

      case 'game:joined': {
        const data = event.data as GameJoinedData;
        batch(() => {
          multiplayer.setGameId(data.gameId);
          chess.setPlayerColor(data.color === 'white' ? 'w' : 'b');
          ui.setBoardView(data.color === 'white' ? 'w' : 'b');
          multiplayer.setGameStarted(data.gameId, data.opponent ?? null);
        });
        break;
      }

      case 'game:started': {
        const data = event.data as GameStartedData;
        const playerIsWhite = chess.state.playerColor === 'w';
        const opponentInfo = playerIsWhite ? data.blackPlayer : data.whitePlayer;

        batch(() => {
          chess.setLifecycle('playing');
          multiplayer.setGameStarted(data.gameId, opponentInfo.username ?? null);
          timer.sync(Math.floor(data.whiteTimeMs / 1000), Math.floor(data.blackTimeMs / 1000));
        });
        break;
      }

      case 'game:move_accepted': {
        const data = event.data as MoveAcceptedData;
        chess.confirmMove(
          data.fen,
          data.whiteTimeMs ?? timer.state.whiteTime * 1000,
          data.blackTimeMs ?? timer.state.blackTime * 1000
        );
        if (data.whiteTimeMs !== undefined && data.blackTimeMs !== undefined) {
          timer.sync(Math.floor(data.whiteTimeMs / 1000), Math.floor(data.blackTimeMs / 1000));
        }
        break;
      }

      case 'game:move_rejected': {
        const data = event.data as MoveRejectedData;
        chess.rejectMove(data.fen, data.reason);
        break;
      }

      case 'game:opponent_move': {
        const data = event.data as OpponentMoveData;

        // Captured pieces are handled within syncFromMultiplayer
        chess.syncFromMultiplayer({
          fen: data.fen,
          san: data.san,
          from: data.from,
          to: data.to,
          whiteTimeMs: data.whiteTimeMs,
          blackTimeMs: data.blackTimeMs,
          isCheck: data.isCheck,
        });

        if (data.whiteTimeMs !== undefined && data.blackTimeMs !== undefined) {
          timer.sync(Math.floor(data.whiteTimeMs / 1000), Math.floor(data.blackTimeMs / 1000));
        }
        break;
      }

      case 'game:time_update': {
        const data = event.data as TimeUpdateData;
        timer.sync(Math.floor(data.whiteTime / 1000), Math.floor(data.blackTime / 1000));
        break;
      }

      case 'game:ended': {
        const data = event.data as GameEndedData;
        let winner: GameWinner = null;
        if (data.result === 'white') winner = 'w';
        else if (data.result === 'black') winner = 'b';
        else if (data.result === 'draw') winner = 'draw';

        let reason: GameOverReason = null;
        if (data.reason === 'checkmate') reason = 'checkmate';
        else if (data.reason === 'stalemate') reason = 'stalemate';
        else if (data.reason === 'timeout') reason = 'time';
        else if (data.reason === 'resignation') reason = 'resignation';

        timer.stop();
        chess.endGame(reason, winner);
        ui.showEndModal();
        break;
      }

      case 'game:opponent_left': {
        // Opponent disconnected - for now just log
        console.log('Opponent left the game');
        break;
      }

      case 'error': {
        const data = event.data as { message: string };
        console.error('Game sync error:', data.message);
        break;
      }
    }
  };

  // ============================================================================
  // High-Level Actions
  // ============================================================================

  const startNewGame = async (options: StartGameOptions) => {
    timer.stop();
    ui.hideEndModal();

    const {
      side,
      mode = 'play',
      newTimeControl = 5,
      newDifficultyLevel = 3,
      trainingIsRated = false,
      trainingAIPlayStyle = 'balanced',
      trainingGamePhase = 'opening',
      trainingAvailableHints = 0,
    } = options;

    // Start the game session
    chess.startGame({
      mode,
      playerColor: side,
      opponentType: 'ai',
      timeControl: newTimeControl,
      difficulty: newDifficultyLevel,
      trainingIsRated,
      trainingAIPlayStyle,
      trainingGamePhase,
      trainingAvailableHints,
    });

    // Reset timer
    timer.reset(newTimeControl);
    ui.setBoardView(side);

    // Set lifecycle to initializing
    chess.setLifecycle(transition('idle', 'START_GAME'));

    // Initialize eval engine for training mode (non-blocking)
    if (mode !== 'play') {
      engine.initEval().catch((err) => {
        console.warn('Eval engine init failed (non-critical):', err);
      });
    }

    try {
      // Initialize AI engine
      await engine.init(
        newDifficultyLevel,
        side === 'w' ? 'b' : 'w',
        trainingAIPlayStyle ?? 'balanced'
      );

      // Transition to playing state
      chess.setLifecycle(transition('initializing', 'ENGINE_READY'));

      // Start timer for play mode
      if (mode === 'play') {
        timer.start(
          () => chess.state.currentTurn,
          (side) => handleTimeOut(side === 'w' ? 'b' : 'w')
        );
      }

      // If player is black, AI moves first
      if (side === 'b') {
        performAIMove();
      }
    } catch (err) {
      console.error('Engine initialization failed:', err);
    }
  };

  const startMultiplayerGame = async (options: MultiplayerGameOptions) => {
    timer.stop();
    ui.hideEndModal();

    const { side, mode = 'play', newTimeControl = 5, increment = 0 } = options;

    chess.resetForMultiplayer(mode);
    chess.setPlayerColor(side);
    chess.setOpponentType('human');
    ui.setBoardView(side);
    timer.reset(newTimeControl);

    // Subscribe to sync events
    multiplayer.subscribe(handleSyncEvent);

    // Connect and create game
    multiplayer.createGame(newTimeControl, increment);
  };

  const joinMultiplayerGame = (gameId: string) => {
    timer.stop();
    ui.hideEndModal();

    chess.resetForMultiplayer('play');
    chess.setOpponentType('human');

    // Subscribe to sync events
    multiplayer.subscribe(handleSyncEvent);

    // Connect and join game
    multiplayer.joinGame(gameId);
  };

  const applyPlayerMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    const success = chess.applyMove(from, to, promotion);
    if (!success) return;

    if (!chess.state.isGameOver) {
      afterMoveChecks();
    }

    // Trigger AI move if it's AI's turn
    if (!chess.state.isGameOver && chess.state.currentTurn !== chess.state.playerColor) {
      performAIMove();
    }
  };

  const applyMultiplayerMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    if (chess.state.opponentType !== 'human' || !multiplayer.state.gameId) {
      return;
    }

    // Send move to server
    multiplayer.sendMove(from, to, promotion);

    // Optimistic update
    chess.applyOptimisticMove(from, to, promotion);
  };

  const performAIMove = async () => {
    if (
      !canMakeMove(chess.state.lifecycle) ||
      chess.state.currentTurn === chess.state.playerColor ||
      engine.state.isThinking
    ) {
      return;
    }

    engine.setThinking(true);
    try {
      const fenAtStart = chess.state.fen;
      const move = await engine.getMove(chess.state.fen);
      if (!move) return;

      // Guard against stale response
      if (chess.state.fen !== fenAtStart) return;

      chess.applyMove(
        move.from as Square,
        move.to as Square,
        move.promotion as PromotionPiece | undefined
      );

      if (!chess.state.isGameOver) {
        afterMoveChecks();
      }
    } catch (err) {
      console.error('AI move error:', err);
    } finally {
      engine.setThinking(false);
    }
  };

  const afterMoveChecks = () => {
    if (chess.state.isGameOver) return;

    // Check for training opening end
    if (chess.state.mode === 'training' && chess.state.trainingGamePhase === 'opening') {
      const moveCount = chess.state.moveHistory.length;
      if (moveCount >= 20) {
        const fenAtStart = chess.state.fen;
        engine.getEval(chess.state.fen).then((score: number) => {
          if (chess.state.fen !== fenAtStart) return;
          chess.endGame(null, null, score);
          timer.stop();
          ui.showEndModal();
        });
      }
    }
  };

  const exitGame = () => {
    timer.stop();

    // Clean up multiplayer
    if (multiplayer.state.gameId) {
      multiplayer.leave();
    }

    // Clean up engine
    if (chess.state.sessionId) {
      engine.release(chess.state.sessionId);
    }

    chess.exitGame();
    chess.setLifecycle(transition(chess.state.lifecycle, 'EXIT_GAME'));
  };

  const resign = () => {
    if (!canMakeMove(chess.state.lifecycle)) return;
    timer.stop();
    chess.resign();
    ui.showEndModal();
  };

  const resignMultiplayer = () => {
    if (multiplayer.state.gameId) {
      multiplayer.resign();
    }
  };

  const handleTimeOut = (winner: Side) => {
    timer.stop();
    chess.endGame('time', winner);
    ui.showEndModal();
  };

  const retryEngineInit = async () => {
    await engine.retry(() => {
      chess.setLifecycle(transition('initializing', 'ENGINE_READY'));

      // Start timer for play mode
      if (chess.state.mode === 'play') {
        timer.start(
          () => chess.state.currentTurn,
          (side) => handleTimeOut(side === 'w' ? 'b' : 'w')
        );
      }

      // If player is black and game just started, AI moves first
      if (chess.state.playerColor === 'b' && chess.state.moveHistory.length === 0) {
        performAIMove();
      }
    });
  };

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
    actions: {
      startNewGame,
      startMultiplayerGame,
      joinMultiplayerGame,
      applyPlayerMove,
      applyMultiplayerMove,
      exitGame,
      resign,
      resignMultiplayer,
      handleTimeOut,
      retryEngineInit,
    },
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

/**
 * Legacy hook for backward compatibility.
 * Returns [state, actions, derived] tuple matching the old API.
 * @deprecated Use useGame() instead for new code.
 */
export const useGameStore = () => {
  const game = useGame();

  // Use getters to maintain SolidJS reactivity.
  // Without getters, values are captured once and updates don't trigger re-renders.
  const state = {
    // From chess store
    get currentSessionId() {
      return game.chess.state.sessionId;
    },
    get lifecycle() {
      return game.chess.state.lifecycle;
    },
    get fen() {
      return game.chess.state.fen;
    },
    get currentTurn() {
      return game.chess.state.currentTurn;
    },
    get playerColor() {
      return game.chess.state.playerColor;
    },
    get isGameOver() {
      return game.chess.state.isGameOver;
    },
    get gameOverReason() {
      return game.chess.state.gameOverReason;
    },
    get gameWinner() {
      return game.chess.state.gameWinner;
    },
    get capturedWhite() {
      return game.chess.state.capturedWhite;
    },
    get capturedBlack() {
      return game.chess.state.capturedBlack;
    },
    get lastMove() {
      return game.chess.state.lastMove;
    },
    get checkedKingSquare() {
      return game.chess.state.checkedKingSquare;
    },
    get moveHistory() {
      return game.chess.state.moveHistory;
    },
    get viewMoveIndex() {
      return game.chess.state.viewMoveIndex;
    },
    get viewFen() {
      return game.chess.state.viewFen;
    },
    get mode() {
      return game.chess.state.mode;
    },
    get opponentType() {
      return game.chess.state.opponentType;
    },
    // Training state
    get trainingIsRated() {
      return game.chess.state.trainingIsRated;
    },
    get trainingAIPlayStyle() {
      return game.chess.state.trainingAIPlayStyle;
    },
    get trainingGamePhase() {
      return game.chess.state.trainingGamePhase;
    },
    get trainingAvailableHints() {
      return game.chess.state.trainingAvailableHints;
    },
    get trainingUsedHints() {
      return game.chess.state.trainingUsedHints;
    },
    get trainingEvalScore() {
      return game.chess.state.trainingEvalScore;
    },
    // From timer store
    get whiteTime() {
      return game.timer.state.whiteTime;
    },
    get blackTime() {
      return game.timer.state.blackTime;
    },
    get timeControl() {
      return game.timer.state.timeControl;
    },
    // From engine store
    get difficulty() {
      return game.engine.state.difficulty;
    },
    get aiSide() {
      return game.engine.state.aiSide;
    },
    get isAiThinking() {
      return game.engine.state.isThinking;
    },
    get engineStatus() {
      return game.engine.state.status;
    },
    get engineError() {
      return game.engine.state.error;
    },
    // From UI store
    get boardView() {
      return game.ui.state.boardView;
    },
    // From multiplayer store
    get multiplayerGameId() {
      return game.multiplayer.state.gameId;
    },
    get isWaitingForOpponent() {
      return game.multiplayer.state.isWaiting;
    },
    get opponentUsername() {
      return game.multiplayer.state.opponentUsername;
    },
    // Legacy compatibility
    get boardSquares() {
      return game.chess.derived.currentBoard();
    },
  };

  const actions = {
    startNewGame: game.actions.startNewGame,
    startMultiplayerGame: game.actions.startMultiplayerGame,
    joinMultiplayerGame: game.actions.joinMultiplayerGame,
    applyPlayerMove: game.actions.applyPlayerMove,
    applyMultiplayerMove: game.actions.applyMultiplayerMove,
    exitGame: game.actions.exitGame,
    resign: game.actions.resign,
    resignMultiplayer: game.actions.resignMultiplayer,
    handleTimeOut: game.actions.handleTimeOut,
    retryEngineInit: game.actions.retryEngineInit,
    flipBoardView: game.ui.flipBoard,
    takeBack: game.chess.takeBack,
    jumpToMoveIndex: game.chess.jumpToMoveIndex,
    clearGameTimer: game.timer.stop,
    performAIMove: () => {}, // Handled internally now
    getChessInstance: () => game.chess.getSession()?.getChessInstance() ?? new Chess(),
    setState: () => {}, // Legacy - no longer supported
    getCurrentSession: game.chess.getSession,
    getSessionManager: () => sessionManager,
  };

  const derived = {
    opponentSide: game.chess.derived.opponentSide,
    currentBoard: game.chess.derived.currentBoard,
    isPlayerTurn: game.chess.derived.isPlayerTurn,
    canMove: () => game.chess.derived.canMove() && !game.engine.state.isThinking,
    isViewingHistory: game.chess.derived.isViewingHistory,
    formattedAIPlayStyle: () => {
      const style = game.chess.state.trainingAIPlayStyle;
      if (!style) return '';
      return style.charAt(0).toUpperCase() + style.slice(1);
    },
    material: () => {
      const mat = computeMaterial(game.chess.derived.currentBoard());
      return { diff: mat.diff };
    },
    playerTime: () =>
      game.chess.state.playerColor === 'w'
        ? game.timer.state.whiteTime
        : game.timer.state.blackTime,
    opponentTime: () =>
      game.chess.state.playerColor === 'w'
        ? game.timer.state.blackTime
        : game.timer.state.whiteTime,
    isEngineReady: game.derived.isEngineReady,
    isEngineLoading: game.derived.isEngineLoading,
    hasEngineError: game.derived.hasEngineError,
    isPlaying: game.derived.isPlaying,
    isIdle: () => game.chess.state.lifecycle === 'idle',
    isEnded: () => game.chess.state.lifecycle === 'ended',
    isInitializing: () => game.chess.state.lifecycle === 'initializing',
    currentSession: game.chess.getSession,
    isMultiplayer: game.derived.isMultiplayer,
    isWaitingForOpponent: game.derived.isWaitingForOpponent,
  };

  return [state, actions, derived] as const;
};
