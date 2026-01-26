import { Chess } from 'chess.js';
import { moveEvalService } from '../../../services/engine/moveEvalService';
import { getOpponentSide } from '../../../services/game/chessGameService';
import { transition, canMakeMove } from '../../../services/game/gameLifecycle';
import {
  buildScenario,
  resolvePositionSource,
  evaluateTermination,
  calculateScore,
  determinePlayerWon,
  type TrainingScenario,
  type TrainingMetadata,
  type GameStateForTermination,
} from '../../../services/training';
import type { Square, PromotionPiece } from '../../../types/chess';
import type { Side, StartGameOptions, GamePhase } from '../../../types/game';
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

// Maximum number of retries when fetching positions that turn out to be invalid
// Increased to handle various invalid position types (adjacent kings, illegal checks, etc.)
const MAX_POSITION_FETCH_RETRIES = 5;

/**
 * Find the square of a king in the position.
 * Returns null if king not found.
 */
function findKingSquare(fen: string, color: 'w' | 'b'): { file: number; rank: number } | null {
  const board = fen.split(' ')[0];
  const rows = board.split('/');
  const kingChar = color === 'w' ? 'K' : 'k';

  for (let rank = 0; rank < 8; rank++) {
    let file = 0;
    for (const char of rows[rank]) {
      if (char >= '1' && char <= '8') {
        file += parseInt(char, 10);
      } else {
        if (char === kingChar) {
          return { file, rank };
        }
        file++;
      }
    }
  }
  return null;
}

/**
 * Check if two kings are adjacent (illegal position).
 */
function areKingsAdjacent(fen: string): boolean {
  const whiteKing = findKingSquare(fen, 'w');
  const blackKing = findKingSquare(fen, 'b');

  if (!whiteKing || !blackKing) {
    return false; // Missing king is a different error
  }

  const fileDiff = Math.abs(whiteKing.file - blackKing.file);
  const rankDiff = Math.abs(whiteKing.rank - blackKing.rank);

  // Kings are adjacent if they differ by at most 1 in both file and rank
  return fileDiff <= 1 && rankDiff <= 1;
}

/**
 * Check if the side NOT to move is in check (illegal position).
 * In a legal position, only the side to move can be in check.
 */
function isOpponentInCheck(fen: string): boolean {
  try {
    // Get the side to move from FEN
    const parts = fen.split(' ');
    const sideToMove = parts[1] as 'w' | 'b';

    // Create a position with the OTHER side to move
    const flippedFen = parts.slice();
    flippedFen[1] = sideToMove === 'w' ? 'b' : 'w';
    const flippedChess = new Chess(flippedFen.join(' '));

    // If the flipped position has the "current" side (originally opponent) in check,
    // then the original position was illegal
    return flippedChess.isCheck();
  } catch {
    return false; // Can't determine, let other validation handle it
  }
}

/**
 * Validates that a position has legal moves and is playable.
 * Returns an error message if invalid, or null if valid.
 */
function validatePosition(fen: string): string | null {
  try {
    // Check for adjacent kings (illegal position that chess.js may not catch)
    if (areKingsAdjacent(fen)) {
      return 'Invalid position: kings are adjacent';
    }

    // Check if opponent is in check (illegal - can't leave king in check)
    if (isOpponentInCheck(fen)) {
      return 'Invalid position: opponent king is in check';
    }

    const chess = new Chess(fen);
    const moves = chess.moves();

    if (moves.length === 0) {
      if (chess.isCheckmate()) {
        return 'Position is already checkmate';
      }
      if (chess.isStalemate()) {
        return 'Position is already stalemate';
      }
      return 'Position has no legal moves';
    }

    return null; // Position is valid
  } catch {
    return 'Invalid FEN position';
  }
}

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

  // Current training scenario (set during startNewGame)
  let currentScenario: TrainingScenario | null = null;
  let currentMetadata: TrainingMetadata = {};

  // Generation counter to prevent stale async completions from executing
  // Incremented at the start of each startNewGame call
  let currentGameGeneration = 0;

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

      // Re-check game state after delay - game could have ended, user could have exited,
      // or a new game could have started during the delay
      if (
        chess.state.fen !== fenAtStart ||
        !canMakeMove(chess.state.lifecycle) ||
        chess.state.isGameOver ||
        chess.state.lifecycle !== 'playing'
      ) {
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

  /**
   * Build the game state object for termination evaluation
   */
  const buildGameStateForTermination = (): GameStateForTermination => {
    const session = chess.getSession();
    return {
      halfMoveCount: chess.state.moveHistory.length,
      isCheckmate: session?.isCheckmate() ?? false,
      isStalemate: session?.isStalemate() ?? false,
      isDraw: session?.isDraw() ?? false,
    };
  };

  /**
   * End the training session with proper scoring
   */
  const endTrainingSession = async (
    reason: 'move-limit' | 'checkmate' | 'stalemate' | 'draw' | 'resignation'
  ) => {
    const fenAtEnd = chess.state.fen;

    // Wait for pending evaluations first
    await moveEvalService.waitForPendingEvaluations();

    // Get final evaluation
    let finalEval = moveEvalService.getCachedEval(fenAtEnd);
    if (finalEval === null) {
      finalEval = await engine.getEval(fenAtEnd).catch(() => null);
    }

    // Determine if player won (for checkmate scenarios)
    const playerWon = determinePlayerWon(reason, chess.state.playerColor, chess.state.gameWinner);

    // Calculate score using the scoring method
    if (currentScenario) {
      const scoreResult = calculateScore({
        method: currentScenario.scoringMethod,
        metadata: currentMetadata,
        finalEval,
        playerSide: chess.state.playerColor,
        endReason: reason,
        playerWon,
      });

      // Map training end reasons to GameOverReason
      // 'draw' and 'move-limit' map to null (no specific game-over reason)
      const gameOverReason =
        reason === 'checkmate'
          ? 'checkmate'
          : reason === 'stalemate'
            ? 'stalemate'
            : reason === 'resignation'
              ? 'resignation'
              : null;

      const gameWinner =
        reason === 'checkmate'
          ? playerWon
            ? chess.state.playerColor
            : getOpponentSide(chess.state.playerColor)
          : null;

      chess.endGame(gameOverReason, gameWinner, scoreResult.score ?? undefined);
    } else {
      // Fallback for legacy behavior
      chess.endGame(null, null, finalEval ?? undefined);
    }

    timer.stop();
    // Note: Modal display and auto-restart logic is handled by ChessBoardController
    // based on the autoRestartOnEnd prop passed from TrainingContainer
  };

  const afterMoveChecks = async () => {
    if (chess.state.isGameOver) return;

    // Use the training scenario's termination condition
    if (currentScenario) {
      const gameState = buildGameStateForTermination();
      const termination = evaluateTermination(currentScenario.terminationCondition, gameState);

      if (termination.shouldEnd && termination.reason) {
        await endTrainingSession(termination.reason);
        return;
      }
    }
  };

  // ============================================================================
  // Public Actions
  // ============================================================================

  const startNewGame = async (options: StartGameOptions) => {
    // Increment generation to invalidate any in-flight async operations from previous calls
    currentGameGeneration++;
    const thisGeneration = currentGameGeneration;

    // Reset scenario state immediately to prevent stale data
    currentScenario = null;
    currentMetadata = {};

    timer.stop();
    ui.hideEndModal();
    chess.clearMoveEvaluations();
    moveEvalService.clearCache();

    const {
      side,
      mode = 'training',
      newTimeControl = 5,
      newDifficultyLevel = 3,
      trainingGamePhase = 'opening',
      trainingAvailableHints = 0,
      trainingTheme,
      trainingExcludePositionId,
    } = options;

    // Build scenario for the selected phase
    // Note: difficulty is NOT passed here - it only affects engine strength, not position selection
    const scenario = buildScenario(trainingGamePhase as GamePhase, {
      theme: trainingTheme,
      side: side,
      excludePositionId: trainingExcludePositionId,
    });

    // Set loading state for position fetch (for backend sources)
    chess.setLifecycle(transition('idle', 'START_GAME'));

    try {
      // Resolve the starting position with retry logic for invalid positions
      const excludeIds: string[] = trainingExcludePositionId ? [trainingExcludePositionId] : [];
      let validPosition: { fen: string; metadata: TrainingMetadata } | null = null;

      for (let retryCount = 0; retryCount <= MAX_POSITION_FETCH_RETRIES; retryCount++) {
        // Rebuild scenario with updated exclusions on retry
        const currentScenarioForFetch =
          retryCount === 0
            ? scenario
            : buildScenario(trainingGamePhase as GamePhase, {
                theme: trainingTheme,
                side: side,
                excludePositionId: excludeIds.join(','),
              });

        const resolved = await resolvePositionSource(currentScenarioForFetch.positionSource);

        // Check if a newer startNewGame call has superseded this one
        if (thisGeneration !== currentGameGeneration) {
          return; // Abort - a newer game initialization is in progress
        }

        // Validate the position has legal moves
        const validationError = validatePosition(resolved.fen);
        if (!validationError) {
          // Position is valid
          validPosition = { fen: resolved.fen, metadata: resolved.metadata };
          break;
        }

        // Position is invalid - add to exclusion list and retry
        console.warn(
          `Invalid position fetched (${validationError}), retrying...`,
          resolved.metadata.positionId
        );
        if (resolved.metadata.positionId) {
          excludeIds.push(resolved.metadata.positionId);
        }
      }

      if (!validPosition) {
        throw new Error(
          `Failed to find valid position after ${MAX_POSITION_FETCH_RETRIES} attempts`
        );
      }

      const { fen, metadata } = validPosition;

      // Now safe to set module-level state
      currentScenario = scenario;
      currentMetadata = metadata;

      // Start the game with the resolved position
      chess.startGame({
        mode,
        playerColor: side,
        opponentType: 'ai',
        timeControl: newTimeControl,
        difficulty: newDifficultyLevel,
        trainingGamePhase,
        trainingAvailableHints,
        trainingStartEval: metadata.startingEval,
        trainingPositionId: metadata.positionId,
        trainingTheme: metadata.theme,
        fen,
      });

      timer.reset(newTimeControl);
      ui.setBoardView(side);

      // Initialize both engines in parallel - eval engine is non-critical so we catch its errors
      await Promise.all([
        engine.initEval().catch(() => {}), // Eval failure is non-critical
        engine.init(newDifficultyLevel, getOpponentSide(side)),
      ]);

      // Check again after engine init - another startNewGame may have been called
      if (thisGeneration !== currentGameGeneration) {
        return;
      }

      chess.setLifecycle(transition('initializing', 'ENGINE_READY'));

      // Training mode typically doesn't use timer, but support it if needed
      // Timer not started for training mode

      // If player is black OR if the starting position has white to move and player is white,
      // we may need to trigger AI move
      const positionSideToMove = metadata.sideToMove ?? 'w';
      if (positionSideToMove !== side) {
        // AI moves first
        performAIMove();
      }
    } catch (err) {
      console.error('Training initialization failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start training';
      chess.setInitError(errorMessage);
      chess.setLifecycle(transition('initializing', 'ENGINE_ERROR'));
      // Reset scenario on error
      currentScenario = null;
      currentMetadata = {};
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

    await endTrainingSession('resignation');
  };

  const retryEngineInit = async () => {
    // If there was an init error (e.g., position fetch failed), reset to idle
    // so the training modal reopens for user to try again
    if (chess.state.initError) {
      chess.setInitError(null);
      chess.setLifecycle(transition('error', 'EXIT_GAME'));
      return;
    }

    chess.setLifecycle(transition('error', 'RETRY_ENGINE'));

    await engine.retry(() => {
      chess.setLifecycle(transition('initializing', 'ENGINE_READY'));

      // Check if AI should move first based on position
      const sideToMove = currentMetadata.sideToMove ?? 'w';
      if (sideToMove !== chess.state.playerColor && chess.state.moveHistory.length === 0) {
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

    // Clear scenario state
    currentScenario = null;
    currentMetadata = {};

    // coreActions.exitGame() calls chess.exitGame() which already sets lifecycle to 'idle'
    coreActions.exitGame();
  };

  /**
   * Restart with the same training settings (for "Play Again" button)
   */
  const restartGame = async () => {
    // Capture current position ID before starting new game (to exclude it)
    const excludePositionId = chess.state.trainingPositionId ?? undefined;

    // Build options from current state
    const options: StartGameOptions = {
      side: chess.state.playerColor,
      mode: 'training',
      newDifficultyLevel: engine.state.difficulty,
      trainingGamePhase: chess.state.trainingGamePhase ?? 'endgame',
      trainingAvailableHints: chess.state.trainingAvailableHints,
      trainingTheme: chess.state.trainingTheme ?? undefined,
      trainingExcludePositionId: excludePositionId,
    };

    await startNewGame(options);
  };

  return {
    // Core actions
    ...coreActions,

    // Training actions
    startNewGame,
    restartGame,
    applyPlayerMove,
    resign,
    retryEngineInit,
    handleTimeOut,
    takeBack,

    // Override exitGame
    exitGame,
  };
};
