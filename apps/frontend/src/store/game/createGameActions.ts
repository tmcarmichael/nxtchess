import { transition, canMakeMove, getOpponentSide } from '../../services/game';
import { TRAINING_OPENING_MOVE_THRESHOLD } from '../../shared/config/constants';
import type {
  Side,
  Square,
  PromotionPiece,
  StartGameOptions,
  MultiplayerGameOptions,
} from '../../types';
import type { ChessStore, TimerStore, EngineStore, MultiplayerStore, UIStore } from './stores';

// ============================================================================
// Types
// ============================================================================

export interface GameStores {
  chess: ChessStore;
  timer: TimerStore;
  engine: EngineStore;
  multiplayer: MultiplayerStore;
  ui: UIStore;
}

export interface GameActions {
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
}

// ============================================================================
// Factory
// ============================================================================

export const createGameActions = (stores: GameStores): GameActions => {
  const { chess, timer, engine, multiplayer, ui } = stores;

  // ============================================================================
  // Internal Helpers
  // ============================================================================

  const performAIMove = async () => {
    if (
      !canMakeMove(chess.state.lifecycle) ||
      chess.state.currentTurn === chess.state.playerColor ||
      engine.state.isThinking
    ) {
      return;
    }

    try {
      // engine.getMove() manages isThinking state internally
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
      console.error('AI move failed:', err);
    }
  };

  const afterMoveChecks = () => {
    if (chess.state.isGameOver) return;

    // Check for training opening end
    if (chess.state.mode === 'training' && chess.state.trainingGamePhase === 'opening') {
      const moveCount = chess.state.moveHistory.length;
      if (moveCount >= TRAINING_OPENING_MOVE_THRESHOLD) {
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

  // ============================================================================
  // Public Actions
  // ============================================================================

  const handleTimeOut = (winner: Side) => {
    timer.stop();
    chess.endGame('time', winner);
    ui.showEndModal();
  };

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
        getOpponentSide(side),
        trainingAIPlayStyle ?? 'balanced'
      );

      // Transition to playing state
      chess.setLifecycle(transition('initializing', 'ENGINE_READY'));

      // Start timer for play mode
      if (mode === 'play') {
        timer.start(
          () => chess.state.currentTurn,
          (loser) => handleTimeOut(getOpponentSide(loser))
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
    ui.setBoardView(side);
    timer.reset(newTimeControl);

    // Connect and create game - multiplayer store handles event subscription internally
    multiplayer.createGame(newTimeControl, increment);
  };

  const joinMultiplayerGame = (gameId: string) => {
    timer.stop();
    ui.hideEndModal();

    chess.resetForMultiplayer('play');
    // Note: playerColor will be set by onGameJoined callback when server assigns color

    // Connect and join game - multiplayer store handles event subscription internally
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

  const retryEngineInit = async () => {
    await engine.retry(() => {
      chess.setLifecycle(transition('initializing', 'ENGINE_READY'));

      // Start timer for play mode
      if (chess.state.mode === 'play') {
        timer.start(
          () => chess.state.currentTurn,
          (loser) => handleTimeOut(getOpponentSide(loser))
        );
      }

      // If player is black and game just started, AI moves first
      if (chess.state.playerColor === 'b' && chess.state.moveHistory.length === 0) {
        performAIMove();
      }
    });
  };

  return {
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
  };
};
