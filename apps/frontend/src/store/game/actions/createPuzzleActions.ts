import { Chess } from 'chess.js';
import { moveEvalService } from '../../../services/engine/moveEvalService';
import { getOpponentSide } from '../../../services/game/chessGameService';
import { transition } from '../../../services/game/gameLifecycle';
import { getRandomPuzzle, uciToFromTo, type PuzzleDefinition } from '../../../services/puzzle';
import type { Square, PromotionPiece } from '../../../types/chess';
import type { Side, StartGameOptions, PuzzleCategory } from '../../../types/game';
import type { ChessStore } from '../stores/createChessStore';
import type { EngineStore } from '../stores/createEngineStore';
import type { TimerStore } from '../stores/createTimerStore';
import type { UIStore } from '../stores/createUIStore';
import type { PuzzleActions, CoreActions } from '../types';

const OPPONENT_MOVE_DELAY = { min: 300, max: 600 };

const randomDelay = (min: number, max: number): Promise<void> => {
  const delay = min + Math.random() * (max - min);
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export interface PuzzleStores {
  chess: ChessStore;
  timer: TimerStore;
  engine: EngineStore;
  ui: UIStore;
}

export const createPuzzleActions = (
  stores: PuzzleStores,
  coreActions: CoreActions
): PuzzleActions => {
  const { chess, timer, engine, ui } = stores;

  let currentPuzzle: PuzzleDefinition | null = null;
  let currentGameGeneration = 0;

  const performOpponentMove = async (generation: number) => {
    if (!currentPuzzle) return;

    const solIdx = chess.state.puzzleSolutionIndex;
    if (solIdx >= currentPuzzle.solutionUci.length) return;

    await randomDelay(OPPONENT_MOVE_DELAY.min, OPPONENT_MOVE_DELAY.max);

    if (generation !== currentGameGeneration) return;
    if (chess.state.isGameOver || chess.state.lifecycle !== 'playing') return;

    const uci = currentPuzzle.solutionUci[solIdx];
    const move = uciToFromTo(uci);
    const fenBefore = chess.state.fen;
    const moveIndex = chess.state.moveHistory.length;
    const opponentSide = getOpponentSide(chess.state.playerColor);

    chess.applyMove(
      move.from as Square,
      move.to as Square,
      move.promotion as PromotionPiece | undefined
    );

    chess.setPuzzleSolutionIndex(solIdx + 1);

    const fenAfter = chess.state.fen;
    const san = chess.state.moveHistory[moveIndex] || '';
    moveEvalService.queueMoveEvaluation(
      {
        moveIndex,
        san,
        fenBefore,
        fenAfter,
        side: opponentSide,
        isPlayerMove: false,
      },
      (evaluation) => {
        chess.updateMoveEvaluation(evaluation);
      }
    );
  };

  const startNewGame = async (options: StartGameOptions) => {
    currentGameGeneration++;
    const thisGeneration = currentGameGeneration;

    timer.stop();
    ui.hideEndModal();
    chess.clearMoveEvaluations();
    moveEvalService.clearCache();

    const { puzzleCategory = 'mate-in-1' } = options;
    const category = puzzleCategory as PuzzleCategory;

    const puzzle = getRandomPuzzle(category, chess.state.puzzleId ?? undefined);
    currentPuzzle = puzzle;

    chess.setLifecycle(transition('idle', 'START_GAME'));

    try {
      chess.startGame({
        mode: 'puzzle',
        playerColor: puzzle.playerSide,
        opponentType: 'ai',
        timeControl: 0,
        puzzleCategory: puzzle.category,
        puzzleId: puzzle.id,
        puzzleStartFen: puzzle.fen,
        fen: puzzle.fen,
      });

      timer.reset(0);
      ui.setBoardView(puzzle.playerSide);

      // Init eval engine (non-critical)
      await engine.initEval().catch(() => {});

      if (thisGeneration !== currentGameGeneration) return;

      chess.setLifecycle(transition('initializing', 'ENGINE_READY'));

      // If the first move in the solution belongs to the opponent, auto-play it
      const fenTurn = puzzle.fen.split(' ')[1] as Side;
      if (fenTurn !== puzzle.playerSide && puzzle.solutionUci.length > 0) {
        await performOpponentMove(thisGeneration);
      }
    } catch (err) {
      console.error('Puzzle initialization failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start puzzle';
      chess.setInitError(errorMessage);
      chess.setLifecycle(transition('initializing', 'ENGINE_ERROR'));
      currentPuzzle = null;
    }
  };

  const applyPlayerMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    if (!currentPuzzle) return;

    const solIdx = chess.state.puzzleSolutionIndex;
    if (solIdx >= currentPuzzle.solutionUci.length) return;

    const expectedUci = currentPuzzle.solutionUci[solIdx];
    const playerUci = `${from}${to}${promotion ?? ''}`;

    if (playerUci !== expectedUci) {
      // Incorrect move - get SAN for feedback message
      let incorrectSan = `${from}${to}`;
      try {
        const tempChess = new Chess(chess.state.fen);
        const result = tempChess.move({ from, to, promotion });
        if (result) {
          incorrectSan = result.san;
        }
      } catch {
        // Use UCI notation as fallback
      }

      chess.setPuzzleFeedback({
        type: 'incorrect',
        message: `${incorrectSan} is not the correct move. Try again!`,
        incorrectMoveSan: incorrectSan,
      });
      return;
    }

    // Correct move - apply it
    const fenBefore = chess.state.fen;
    const moveIndex = chess.state.moveHistory.length;
    const playerSide = chess.state.playerColor;

    const success = chess.applyMove(from, to, promotion);
    if (!success) return;

    chess.setPuzzleSolutionIndex(solIdx + 1);

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

    // Check if puzzle is complete
    const newSolIdx = solIdx + 1;
    if (newSolIdx >= currentPuzzle.solutionUci.length) {
      const winnerSide = chess.state.playerColor;
      const winnerName = winnerSide === 'w' ? 'White' : 'Black';
      chess.endGame('checkmate', winnerSide);
      chess.setPuzzleFeedback({
        type: 'complete',
        message: `${winnerName} wins by checkmate.`,
      });
      return;
    }

    // More moves to go - auto-play opponent response
    const generation = currentGameGeneration;
    performOpponentMove(generation);
  };

  const loadNextPuzzle = async () => {
    const category = (chess.state.puzzleCategory as PuzzleCategory) ?? 'mate-in-1';
    await startNewGame({
      side: 'w', // Will be overridden by puzzle.playerSide
      mode: 'puzzle',
      puzzleCategory: category,
    });
  };

  const retryEngineInit = async () => {
    if (chess.state.initError) {
      chess.setInitError(null);
      chess.setLifecycle(transition('error', 'EXIT_GAME'));
      return;
    }

    chess.setLifecycle(transition('error', 'RETRY_ENGINE'));
    await engine.retry(() => {
      chess.setLifecycle(transition('initializing', 'ENGINE_READY'));
    });
  };

  const dismissFeedback = () => {
    chess.setPuzzleFeedback(null);
  };

  const exitGame = () => {
    timer.stop();
    if (chess.state.sessionId) {
      engine.release(chess.state.sessionId);
    }
    currentPuzzle = null;
    coreActions.exitGame();
  };

  return {
    ...coreActions,
    startNewGame,
    applyPlayerMove,
    loadNextPuzzle,
    retryEngineInit,
    dismissFeedback,
    exitGame,
  };
};
