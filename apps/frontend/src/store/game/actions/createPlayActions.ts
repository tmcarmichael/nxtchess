import { getOpponentSide } from '../../../services/game/chessGameService';
import { transition, canMakeMove } from '../../../services/game/gameLifecycle';
import { TRAINING_OPENING_MOVE_THRESHOLD } from '../../../shared/config/constants';
import type { Square, PromotionPiece } from '../../../types/chess';
import type { Side, StartGameOptions, MultiplayerGameOptions } from '../../../types/game';
import type { ChessStore } from '../stores/createChessStore';
import type { EngineStore } from '../stores/createEngineStore';
import type { MultiplayerStore } from '../stores/createMultiplayerStore';
import type { TimerStore } from '../stores/createTimerStore';
import type { UIStore } from '../stores/createUIStore';
import type { PlayActions, CoreActions } from '../types';

// ============================================================================
// AI Move Delay Configuration
// ============================================================================

// Returns random delay in ms based on time control (in minutes)
// Shorter games = faster responses, longer games = more natural "thinking" time
const getAIMoveDelay = (timeControl: number): { min: number; max: number } => {
  switch (timeControl) {
    case 1:
      return { min: 0, max: 0 }; // No delay for bullet
    case 3:
      return { min: 0, max: 500 };
    case 5:
      return { min: 500, max: 1000 };
    case 10:
      return { min: 500, max: 1500 };
    case 15:
      return { min: 1000, max: 2000 };
    case 30:
      return { min: 1000, max: 2000 };
    default:
      return { min: 500, max: 1000 }; // Default for unknown time controls
  }
};

const randomDelay = (min: number, max: number): Promise<void> => {
  if (max <= 0) return Promise.resolve();
  const delay = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// ============================================================================
// Play Mode Stores Interface
// ============================================================================

export interface PlayStores {
  chess: ChessStore;
  timer: TimerStore;
  engine: EngineStore;
  multiplayer: MultiplayerStore;
  ui: UIStore;
}

// ============================================================================
// Factory
// ============================================================================

export const createPlayActions = (stores: PlayStores, coreActions: CoreActions): PlayActions => {
  const { chess, timer, engine, multiplayer, ui } = stores;

  // ============================================================================
  // Internal Helpers
  // ============================================================================

  const handleTimeOut = (winner: Side) => {
    timer.stop();
    chess.endGame('time', winner);
    ui.showEndModal();
  };

  const performAIMove = async () => {
    if (
      !canMakeMove(chess.state.lifecycle) ||
      chess.state.currentTurn === chess.state.playerColor ||
      engine.state.isThinking
    ) {
      return;
    }

    try {
      const fenAtStart = chess.state.fen;
      const move = await engine.getMove(chess.state.fen);
      if (!move) return;

      if (chess.state.fen !== fenAtStart) return;

      // Add natural delay based on time control (only in play mode)
      if (chess.state.mode === 'play') {
        const { min, max } = getAIMoveDelay(timer.state.timeControl);
        await randomDelay(min, max);

        // Re-check game state after delay
        if (chess.state.fen !== fenAtStart || !canMakeMove(chess.state.lifecycle)) {
          return;
        }
      }

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
  // Single Player Actions
  // ============================================================================

  const startNewGame = async (options: StartGameOptions) => {
    timer.stop();
    ui.hideEndModal();

    const {
      side,
      mode = 'play',
      newTimeControl = 5,
      newIncrement = 0,
      newDifficultyLevel = 3,
      trainingIsRated = false,
      trainingAIPlayStyle = 'balanced',
      trainingGamePhase = 'opening',
      trainingAvailableHints = 0,
    } = options;

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

    timer.reset(newTimeControl, newIncrement);
    ui.setBoardView(side);
    chess.setLifecycle(transition('idle', 'START_GAME'));

    if (mode !== 'play') {
      engine.initEval().catch((err) => {
        console.warn('Eval engine init failed (non-critical):', err);
      });
    }

    try {
      await engine.init(
        newDifficultyLevel,
        getOpponentSide(side),
        trainingAIPlayStyle ?? 'balanced'
      );

      chess.setLifecycle(transition('initializing', 'ENGINE_READY'));

      if (mode === 'play') {
        timer.start(
          () => chess.state.currentTurn,
          (loser) => handleTimeOut(getOpponentSide(loser))
        );
      }

      if (side === 'b') {
        performAIMove();
      }
    } catch (err) {
      console.error('Engine initialization failed:', err);
      chess.setLifecycle(transition('initializing', 'ENGINE_ERROR'));
    }
  };

  const applyPlayerMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    const playerSide = chess.state.playerColor;
    const success = chess.applyMove(from, to, promotion);
    if (!success) return;

    // Add increment after successful move (single-player only)
    if (chess.state.opponentType === 'ai' && chess.state.mode === 'play' && playerSide) {
      timer.addIncrement(playerSide);
    }

    if (!chess.state.isGameOver) {
      afterMoveChecks();
    }

    if (!chess.state.isGameOver && chess.state.currentTurn !== chess.state.playerColor) {
      performAIMove();
    }
  };

  const resign = () => {
    if (!canMakeMove(chess.state.lifecycle)) return;
    timer.stop();
    chess.resign();
    ui.showEndModal();
  };

  const retryEngineInit = async () => {
    chess.setLifecycle(transition('error', 'RETRY_ENGINE'));

    await engine.retry(() => {
      chess.setLifecycle(transition('initializing', 'ENGINE_READY'));

      if (chess.state.mode === 'play') {
        timer.start(
          () => chess.state.currentTurn,
          (loser) => handleTimeOut(getOpponentSide(loser))
        );
      }

      if (chess.state.playerColor === 'b' && chess.state.moveHistory.length === 0) {
        performAIMove();
      }
    });
  };

  const takeBack = () => {
    chess.takeBack();
  };

  // ============================================================================
  // Multiplayer Actions
  // ============================================================================

  const startMultiplayerGame = async (options: MultiplayerGameOptions) => {
    timer.stop();
    ui.hideEndModal();

    const { side, mode = 'play', newTimeControl = 5, increment = 0 } = options;

    chess.resetForMultiplayer(mode);
    chess.setPlayerColor(side);
    ui.setBoardView(side);
    timer.reset(newTimeControl);

    multiplayer.createGame(newTimeControl, increment);
  };

  const joinMultiplayerGame = (gameId: string) => {
    timer.stop();
    ui.hideEndModal();

    chess.resetForMultiplayer('play');
    multiplayer.joinGame(gameId);
  };

  const applyMultiplayerMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    if (chess.state.opponentType !== 'human' || !multiplayer.state.gameId) {
      return;
    }

    multiplayer.sendMove(from, to, promotion);
    chess.applyOptimisticMove(from, to, promotion);
  };

  const resignMultiplayer = () => {
    if (multiplayer.state.gameId) {
      multiplayer.resign();
    }
  };

  // ============================================================================
  // Lifecycle
  // ============================================================================

  const exitGame = () => {
    timer.stop();

    // Clean up multiplayer state if in a game OR waiting for opponent
    if (multiplayer.state.gameId || multiplayer.state.isWaiting) {
      multiplayer.leave();
    }

    if (chess.state.sessionId) {
      engine.release(chess.state.sessionId);
    }

    coreActions.exitGame();
    chess.setLifecycle(transition(chess.state.lifecycle, 'EXIT_GAME'));
  };

  return {
    // Core actions
    ...coreActions,

    // Single player actions
    startNewGame,
    applyPlayerMove,
    resign,
    retryEngineInit,
    handleTimeOut,
    takeBack,

    // Multiplayer actions
    startMultiplayerGame,
    joinMultiplayerGame,
    applyMultiplayerMove,
    resignMultiplayer,

    // Override exitGame
    exitGame,
  };
};
