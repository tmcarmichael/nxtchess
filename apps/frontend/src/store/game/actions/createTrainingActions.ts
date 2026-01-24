import { getOpponentSide } from '../../../services/game/chessGameService';
import { transition, canMakeMove } from '../../../services/game/gameLifecycle';
import { TRAINING_OPENING_MOVE_THRESHOLD } from '../../../shared/config/constants';
import type { Square, PromotionPiece } from '../../../types/chess';
import type { Side, StartGameOptions } from '../../../types/game';
import type { ChessStore } from '../stores/createChessStore';
import type { EngineStore } from '../stores/createEngineStore';
import type { TimerStore } from '../stores/createTimerStore';
import type { UIStore } from '../stores/createUIStore';
import type { TrainingActions, CoreActions } from '../types';

// ============================================================================
// Training Mode Stores Interface
// ============================================================================

export interface TrainingStores {
  chess: ChessStore;
  timer: TimerStore;
  engine: EngineStore;
  ui: UIStore;
}

// ============================================================================
// Factory
// ============================================================================

export const createTrainingActions = (
  stores: TrainingStores,
  coreActions: CoreActions
): TrainingActions => {
  const { chess, timer, engine, ui } = stores;

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

  const startNewGame = async (options: StartGameOptions) => {
    timer.stop();
    ui.hideEndModal();

    const {
      side,
      mode = 'training',
      newTimeControl = 5,
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

    timer.reset(newTimeControl);
    ui.setBoardView(side);
    chess.setLifecycle(transition('idle', 'START_GAME'));

    try {
      // Initialize both engines in parallel - eval engine is non-critical so we catch its errors
      await Promise.all([
        engine.initEval().catch(() => {}), // Eval failure is non-critical
        engine.init(newDifficultyLevel, getOpponentSide(side), trainingAIPlayStyle ?? 'balanced'),
      ]);

      chess.setLifecycle(transition('initializing', 'ENGINE_READY'));

      // Training mode typically doesn't use timer, but support it if needed
      // Timer not started for training mode

      if (side === 'b') {
        performAIMove();
      }
    } catch (err) {
      console.error('Engine initialization failed:', err);
      chess.setLifecycle(transition('initializing', 'ENGINE_ERROR'));
    }
  };

  const applyPlayerMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    const success = chess.applyMove(from, to, promotion);
    if (!success) return;

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

      if (chess.state.playerColor === 'b' && chess.state.moveHistory.length === 0) {
        performAIMove();
      }
    });
  };

  const takeBack = () => {
    chess.takeBack();
  };

  const exitGame = () => {
    timer.stop();

    if (chess.state.sessionId) {
      engine.release(chess.state.sessionId);
    }

    coreActions.exitGame();
    chess.setLifecycle(transition(chess.state.lifecycle, 'EXIT_GAME'));
  };

  return {
    // Core actions
    ...coreActions,

    // Training actions
    startNewGame,
    applyPlayerMove,
    resign,
    retryEngineInit,
    handleTimeOut,
    takeBack,

    // Override exitGame
    exitGame,
  };
};
