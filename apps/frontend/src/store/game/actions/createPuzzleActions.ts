import { Chess } from 'chess.js';
import { moveEvalService } from '../../../services/engine/moveEvalService';
import { getOpponentSide } from '../../../services/game/chessGameService';
import { transition } from '../../../services/game/gameLifecycle';
import {
  getRandomPuzzle,
  uciToFromTo,
  computeSetupMove,
  puzzleHistory,
  solvedPuzzleTracker,
  type PuzzleDefinition,
} from '../../../services/puzzle';
import { BACKEND_URL } from '../../../shared/config/env';
import { DEBUG } from '../../../shared/utils/debug';
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

const nextFrame = (): Promise<void> =>
  new Promise((resolve) => requestAnimationFrame(() => resolve()));

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
  let hasRecordedResult = false;

  const submitPuzzleResult = async (
    solved: boolean
  ): Promise<{ new_rating: number; rating_delta: number; old_rating: number } | null> => {
    if (!currentPuzzle || !chess.state.puzzleRated) return null;
    try {
      const res = await fetch(`${BACKEND_URL}/api/puzzle/result`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzle_id: currentPuzzle.id,
          category: currentPuzzle.category,
          solved,
        }),
      });
      if (res.ok) return res.json();
      return null;
    } catch {
      return null;
    }
  };

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
    hasRecordedResult = false;

    timer.stop();
    ui.hideEndModal();
    chess.clearMoveEvaluations();
    moveEvalService.clearCache();

    const { puzzleCategory = 'mate-in-1' } = options;
    const category = puzzleCategory as PuzzleCategory;

    const puzzle = getRandomPuzzle(
      category,
      chess.state.puzzleId ?? undefined,
      options.puzzleRated
    );
    currentPuzzle = puzzle;

    chess.setLifecycle(transition('idle', 'START_GAME'));

    try {
      const fenTurn = puzzle.fen.split(' ')[1] as Side;
      const isOpponentFirst = fenTurn !== puzzle.playerSide;

      let gameFen: string;
      let setupMoveUci: string | null = null;
      let setupIsFromSolution = false;

      if (isOpponentFirst && puzzle.solutionUci.length > 0) {
        gameFen = puzzle.fen;
        setupMoveUci = puzzle.solutionUci[0];
        setupIsFromSolution = true;
      } else {
        const computed = computeSetupMove(puzzle.fen, puzzle.playerSide);
        if (computed) {
          gameFen = computed.setupFen;
          setupMoveUci = computed.setupMoveUci;
        } else {
          gameFen = puzzle.fen;
        }
      }

      chess.startGame({
        mode: 'puzzle',
        playerColor: puzzle.playerSide,
        opponentType: 'ai',
        timeControl: 0,
        puzzleCategory: puzzle.category,
        puzzleId: puzzle.id,
        puzzleRated: options.puzzleRated,
        puzzleStartFen: puzzle.fen,
        fen: gameFen,
      });

      timer.reset(0);
      ui.setBoardView(puzzle.playerSide);

      // Init eval engine in background (non-blocking)
      engine.initEval().catch(() => {});

      if (thisGeneration !== currentGameGeneration) return;

      chess.setLifecycle(transition('initializing', 'ENGINE_READY'));

      // Animate the setup move immediately
      if (setupMoveUci) {
        await nextFrame();
        if (thisGeneration !== currentGameGeneration) return;

        const move = uciToFromTo(setupMoveUci);
        chess.applyMove(
          move.from as Square,
          move.to as Square,
          move.promotion as PromotionPiece | undefined
        );

        if (setupIsFromSolution) {
          chess.setPuzzleSolutionIndex(1);
        }
      }
    } catch (err) {
      if (DEBUG) console.error('Puzzle initialization failed:', err);
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

      if (chess.state.puzzleRated) {
        chess.endGame('checkmate', getOpponentSide(chess.state.playerColor));
        submitPuzzleResult(false).then((data) => {
          chess.setPuzzleFeedback({
            type: 'incorrect',
            message: `${incorrectSan} is not the correct move.`,
            incorrectMoveSan: incorrectSan,
            ratingDelta: data?.rating_delta,
            newRating: data?.new_rating,
          });
        });
      } else {
        chess.setPuzzleFeedback({
          type: 'incorrect',
          message: `${incorrectSan} is not the correct move. Try again!`,
          incorrectMoveSan: incorrectSan,
        });
      }

      if (!hasRecordedResult && currentPuzzle) {
        hasRecordedResult = true;
        const isRated = chess.state.puzzleRated;
        puzzleHistory.record({
          puzzleId: currentPuzzle.id,
          category: currentPuzzle.category,
          fen: currentPuzzle.fen,
          result: 'fail',
          rated: isRated,
          timestamp: Date.now(),
        });
        solvedPuzzleTracker.markSolved(currentPuzzle.id, isRated);
      }
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

    const newSolIdx = solIdx + 1;
    if (newSolIdx >= currentPuzzle.solutionUci.length) {
      const winnerSide = chess.state.playerColor;
      const winnerName = winnerSide === 'w' ? 'White' : 'Black';
      chess.endGame('checkmate', winnerSide);

      if (chess.state.puzzleRated) {
        submitPuzzleResult(true).then((data) => {
          chess.setPuzzleFeedback({
            type: 'complete',
            message: `${winnerName} wins by checkmate.`,
            ratingDelta: data?.rating_delta,
            newRating: data?.new_rating,
          });
        });
      } else {
        chess.setPuzzleFeedback({
          type: 'complete',
          message: `${winnerName} wins by checkmate.`,
        });
      }

      if (!hasRecordedResult && currentPuzzle) {
        hasRecordedResult = true;
        const isRated = chess.state.puzzleRated;
        puzzleHistory.record({
          puzzleId: currentPuzzle.id,
          category: currentPuzzle.category,
          fen: currentPuzzle.fen,
          result: 'pass',
          rated: isRated,
          timestamp: Date.now(),
        });
        solvedPuzzleTracker.markSolved(currentPuzzle.id, isRated);
      }
      return;
    }

    // More moves to go - auto-play opponent response
    const generation = currentGameGeneration;
    performOpponentMove(generation);
  };

  const loadNextPuzzle = async () => {
    const category = (chess.state.puzzleCategory as PuzzleCategory) ?? 'mate-in-1';
    const isRated = chess.state.puzzleRated;
    await startNewGame({
      side: 'w',
      mode: 'puzzle',
      puzzleCategory: category,
      puzzleRated: isRated,
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
