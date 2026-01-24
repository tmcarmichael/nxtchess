import { moveEvalService } from '../../../services/engine/moveEvalService';
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
// AI Move Delay Configuration for Training Mode
// ============================================================================

// Training mode uses a fixed delay range for natural pacing
// This also helps space out eval engine calls to prevent overload
const TRAINING_AI_DELAY = { min: 500, max: 1500 };

const randomDelay = (min: number, max: number): Promise<void> => {
  const delay = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, delay));
};

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
      const fenBefore = chess.state.fen;
      const moveIndex = chess.state.moveHistory.length;
      const aiSide = getOpponentSide(chess.state.playerColor);

      const move = await engine.getMove(chess.state.fen);
      if (!move) return;

      if (chess.state.fen !== fenAtStart) return;

      // Add natural delay for training mode - gives time for eval to complete
      // and provides a more natural "thinking" pace for learning
      await randomDelay(TRAINING_AI_DELAY.min, TRAINING_AI_DELAY.max);

      // Re-check game state after delay
      if (chess.state.fen !== fenAtStart || !canMakeMove(chess.state.lifecycle)) {
        return;
      }

      chess.applyMove(
        move.from as Square,
        move.to as Square,
        move.promotion as PromotionPiece | undefined
      );

      // Queue evaluation for AI move (not player move, so isPlayerMove = false)
      const fenAfter = chess.state.fen;
      const san = chess.state.moveHistory[moveIndex] || '';
      moveEvalService.queueMoveEvaluation(
        {
          moveIndex,
          san,
          fenBefore,
          fenAfter,
          side: aiSide,
          isPlayerMove: false,
        },
        (evaluation) => {
          chess.updateMoveEvaluation(evaluation);
        }
      );

      if (!chess.state.isGameOver) {
        afterMoveChecks();
      }
    } catch (err) {
      console.error('AI move failed:', err);
    }
  };

  const afterMoveChecks = async () => {
    if (chess.state.isGameOver) return;

    // Check for training opening end
    if (chess.state.mode === 'training' && chess.state.trainingGamePhase === 'opening') {
      const moveCount = chess.state.moveHistory.length;
      if (moveCount >= TRAINING_OPENING_MOVE_THRESHOLD) {
        const fenAtStart = chess.state.fen;

        // Wait for any pending move evaluations to complete first
        // This ensures the cache is populated and avoids conflicts with eval engine
        await moveEvalService.waitForPendingEvaluations();

        // Check if we already have the evaluation cached
        let score = moveEvalService.getCachedEval(fenAtStart);

        // If not cached, get it from the engine
        if (score === null) {
          score = await engine.getEval(fenAtStart);
        }

        // Verify state hasn't changed while we were waiting
        if (chess.state.fen !== fenAtStart) return;

        chess.endGame(null, null, score);
        timer.stop();
        ui.showEndModal();
      }
    }
  };

  // ============================================================================
  // Public Actions
  // ============================================================================

  const startNewGame = async (options: StartGameOptions) => {
    timer.stop();
    ui.hideEndModal();
    chess.clearMoveEvaluations();
    moveEvalService.clearCache();

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
    const fenBefore = chess.state.fen;
    const moveIndex = chess.state.moveHistory.length;
    const playerSide = chess.state.playerColor;

    const success = chess.applyMove(from, to, promotion);
    if (!success) return;

    // Queue evaluation for player move
    const fenAfter = chess.state.fen;
    const san = chess.state.moveHistory[moveIndex] || '';
    moveEvalService.queueMoveEvaluation(
      {
        moveIndex,
        san,
        fenBefore,
        fenAfter,
        side: playerSide,
        isPlayerMove: true,
      },
      (evaluation) => {
        chess.updateMoveEvaluation(evaluation);
      }
    );

    if (!chess.state.isGameOver) {
      afterMoveChecks();
    }

    if (!chess.state.isGameOver && chess.state.currentTurn !== chess.state.playerColor) {
      performAIMove();
    }
  };

  const resign = async () => {
    if (!canMakeMove(chess.state.lifecycle)) return;
    timer.stop();

    // Get current eval before ending game so it displays in the end modal
    const currentFen = chess.state.fen;
    const evalScore = await engine.getEval(currentFen).catch(() => 0);

    // Player resigns, opponent wins
    const winner = getOpponentSide(chess.state.playerColor);
    chess.endGame('resignation', winner, evalScore);
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
    // Remove evaluations for the taken-back moves
    const newMoveCount = chess.state.moveHistory.length;
    chess.removeMoveEvaluationsFromIndex(newMoveCount);
    moveEvalService.cancelPendingFromIndex(newMoveCount);
  };

  const exitGame = () => {
    timer.stop();

    if (chess.state.sessionId) {
      engine.release(chess.state.sessionId);
    }

    // coreActions.exitGame() calls chess.exitGame() which already sets lifecycle to 'idle'
    coreActions.exitGame();
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
