import {
  createContext,
  createEffect,
  useContext,
  on,
  onCleanup,
  createMemo,
  createSignal,
  batch,
  type JSX,
} from 'solid-js';
import { pushAchievementToasts } from '../../components/common/AchievementToast/AchievementToast';
import { sessionManager } from '../../services/game/session/SessionManager';
import { startGameReview } from '../../services/review/gameReviewService';
import { saveActiveGame, clearActiveGame } from '../../services/sync/reconnectStore';
import { computeMaterialDiff } from '../../types/chess';
import { useUserStore } from '../user/UserContext';
import { createCoreActions } from './actions/createCoreActions';
import { createPlayActions } from './actions/createPlayActions';
import { createChessStore } from './stores/createChessStore';
import { createEngineStore } from './stores/createEngineStore';
import { createMultiplayerStore } from './stores/createMultiplayerStore';
import { createTimerStore } from './stores/createTimerStore';
import { createUIStore } from './stores/createUIStore';
import { UnifiedGameContextInstance, type UnifiedGameContext } from './useGameContext';
import type { PlayGameContextValue } from './types';
import type { MoveEvaluation } from '../../types/moveQuality';
import type {
  EvalPoint,
  ReviewHandle,
  ReviewPhase,
  ReviewProgress,
  ReviewSummary,
} from '../../types/review';

const PlayGameContext = createContext<PlayGameContextValue>();

export const PlayGameProvider = (props: { children: JSX.Element }) => {
  // Create all stores
  const chess = createChessStore();
  const timer = createTimerStore();
  const engine = createEngineStore();
  const ui = createUIStore();
  const multiplayer = createMultiplayerStore();

  // Set up multiplayer event handlers
  multiplayer.setPlayerColorGetter(() => chess.state.playerColor);

  multiplayer.on('game:created', ({ playerColor }) => {
    batch(() => {
      chess.setPlayerColor(playerColor);
      ui.setBoardView(playerColor);
    });
  });

  multiplayer.on('game:joined', ({ playerColor }) => {
    batch(() => {
      chess.setPlayerColor(playerColor);
      ui.setBoardView(playerColor);
      chess.setLifecycle('playing');
    });
  });

  multiplayer.on('game:started', ({ gameId, whiteTimeMs, blackTimeMs }) => {
    batch(() => {
      chess.setLifecycle('playing');
      timer.sync(whiteTimeMs, blackTimeMs);
    });
    saveActiveGame({ gameId, playerColor: chess.state.playerColor });
    // Don't start local timer for multiplayer - server TIME_UPDATE is authoritative
  });

  multiplayer.on('move:accepted', ({ fen, san, from, to, isCheck, whiteTimeMs, blackTimeMs }) => {
    batch(() => {
      chess.confirmMove({
        serverFen: fen,
        san,
        from,
        to,
        isCheck,
        whiteTimeMs: whiteTimeMs ?? timer.state.whiteTime,
        blackTimeMs: blackTimeMs ?? timer.state.blackTime,
      });
      if (whiteTimeMs !== undefined && blackTimeMs !== undefined) {
        timer.sync(whiteTimeMs, blackTimeMs);
      }
    });
  });

  multiplayer.on('move:rejected', ({ fen, reason }) => {
    chess.rejectMove(fen, reason);
  });

  multiplayer.on('move:opponent', ({ fen, san, from, to, whiteTimeMs, blackTimeMs, isCheck }) => {
    batch(() => {
      chess.syncFromMultiplayer({ fen, san, from, to, whiteTimeMs, blackTimeMs, isCheck });
      if (whiteTimeMs !== undefined && blackTimeMs !== undefined) {
        timer.sync(whiteTimeMs, blackTimeMs);
      }
    });
  });

  multiplayer.on('time:update', ({ whiteTimeMs, blackTimeMs }) => {
    timer.sync(whiteTimeMs, blackTimeMs);
  });

  const [userState, userActions] = useUserStore();

  multiplayer.on(
    'game:ended',
    ({
      reason,
      winner,
      whiteRating,
      blackRating,
      whiteRatingDelta,
      blackRatingDelta,
      whiteNewAchievements,
      blackNewAchievements,
    }) => {
      clearActiveGame();
      batch(() => {
        timer.stop();
        chess.endGame(reason, winner);
        ui.setOpponentDisconnected(false);

        if (
          whiteRating !== undefined &&
          blackRating !== undefined &&
          whiteRatingDelta !== undefined &&
          blackRatingDelta !== undefined
        ) {
          chess.setRatingChange({ whiteRating, blackRating, whiteRatingDelta, blackRatingDelta });

          if (userState.isLoggedIn) {
            const playerRating = chess.state.playerColor === 'w' ? whiteRating : blackRating;
            userActions.setRating(playerRating);
          }
        }
      });

      const playerAchievements =
        chess.state.playerColor === 'w' ? whiteNewAchievements : blackNewAchievements;
      if (playerAchievements && playerAchievements.length > 0) {
        pushAchievementToasts(playerAchievements);
      }
    }
  );

  multiplayer.on('game:opponent_left', () => {});

  multiplayer.on(
    'game:reconnected',
    ({ gameId, playerColor, fen, moveHistory, whiteTimeMs, blackTimeMs }) => {
      batch(() => {
        chess.setPlayerColor(playerColor);
        ui.setBoardView(playerColor);
        chess.hydrateFromReconnect(fen, moveHistory);
        timer.sync(whiteTimeMs, blackTimeMs);
      });
      saveActiveGame({ gameId, playerColor });
    }
  );

  multiplayer.on('game:opponent_disconnected', () => {
    ui.setOpponentDisconnected(true);
  });

  multiplayer.on('game:opponent_reconnected', () => {
    ui.setOpponentDisconnected(false);
  });

  multiplayer.on('game:error', () => {});

  const coreActions = createCoreActions({ chess, ui });
  const actions = createPlayActions({ chess, timer, engine, multiplayer, ui }, coreActions);

  const material = createMemo(() =>
    computeMaterialDiff(chess.state.capturedWhite, chess.state.capturedBlack)
  );

  const derived = {
    isEngineReady: () => engine.state.status === 'ready',
    isEngineLoading: () => engine.state.status === 'loading',
    hasEngineError: () => engine.state.status === 'error',
    isPlaying: () => chess.state.lifecycle === 'playing',
    isMultiplayer: () => chess.state.opponentType === 'human',
    isWaitingForOpponent: () => multiplayer.state.isWaiting,
    material,
  };

  const [reviewPhase, setReviewPhase] = createSignal<ReviewPhase>('idle');
  const [reviewProgress, setReviewProgress] = createSignal<ReviewProgress | null>(null);
  const [reviewSummary, setReviewSummary] = createSignal<ReviewSummary | null>(null);
  const [reviewEvaluations, setReviewEvaluations] = createSignal<MoveEvaluation[]>([]);
  const [reviewEvalHistory, setReviewEvalHistory] = createSignal<EvalPoint[]>([]);
  let reviewHandle: ReviewHandle | null = null;

  const [moveTimesMs, setMoveTimesMs] = createSignal<number[]>([]);
  let lastMoveTimestamp = 0;

  createEffect(
    on(
      () => chess.state.lifecycle,
      (lifecycle) => {
        if (lifecycle === 'playing') {
          lastMoveTimestamp = Date.now();
          setMoveTimesMs([]);
        }
        if (lifecycle !== 'ended' && reviewPhase() !== 'idle') {
          reviewHandle?.abort();
          reviewHandle = null;
          batch(() => {
            setReviewPhase('idle');
            setReviewProgress(null);
            setReviewSummary(null);
            setReviewEvaluations([]);
            setReviewEvalHistory([]);
          });
        }
      }
    )
  );

  createEffect(
    on(
      () => chess.state.moveHistory.length,
      (newLen, prevLen) => {
        if (prevLen !== undefined && newLen > prevLen && lastMoveTimestamp > 0) {
          const delta = Date.now() - lastMoveTimestamp;
          setMoveTimesMs((prev) => [...prev, delta]);
          lastMoveTimestamp = Date.now();
        }
      }
    )
  );

  const startReview = () => {
    ui.hideEndModal();
    setReviewPhase('analyzing');
    setReviewProgress(null);
    setReviewSummary(null);
    setReviewEvaluations([]);
    setReviewEvalHistory([]);
    chess.jumpToMoveIndex(0);

    reviewHandle = startGameReview({
      moves: [...chess.state.moveHistory],
      playerColor: chess.state.playerColor,
      moveTimesMs: moveTimesMs(),
      onProgress: (progress) => setReviewProgress(progress),
      onMoveEvaluated: (evaluation) => {
        batch(() => {
          setReviewEvaluations((prev) => [...prev, evaluation]);
          setReviewEvalHistory((prev) => [
            ...prev,
            {
              moveIndex: evaluation.moveIndex,
              evalAfter: evaluation.evalAfter,
              san: evaluation.san,
              side: evaluation.side,
              quality: evaluation.quality,
              moveTimeMs: evaluation.moveTimeMs,
            },
          ]);
        });
        chess.jumpToMoveIndex(evaluation.moveIndex);
      },
      onComplete: (summary) => {
        batch(() => {
          setReviewPhase('complete');
          setReviewSummary(summary);
        });
      },
    });
  };

  const exitReview = () => {
    reviewHandle?.abort();
    reviewHandle = null;
    chess.jumpToMoveIndex(chess.state.moveHistory.length - 1);
    ui.showEndModal();
    batch(() => {
      setReviewPhase('idle');
      setReviewProgress(null);
      setReviewSummary(null);
      setReviewEvaluations([]);
      setReviewEvalHistory([]);
    });
  };

  const review = {
    phase: reviewPhase,
    progress: reviewProgress,
    summary: reviewSummary,
    evaluations: reviewEvaluations,
    evalHistory: reviewEvalHistory,
    startReview,
    exitReview,
  };

  onCleanup(() => {
    reviewHandle?.abort();
    timer.stop();
    engine.terminate();
    ui.cleanup();
    sessionManager.destroyAllSessions();
  });

  const value: PlayGameContextValue = {
    chess,
    timer,
    ui,
    engine,
    multiplayer,
    actions,
    derived,
    review,
  };

  // Unified context for shared components like ChessBoardController
  const unifiedValue: UnifiedGameContext = {
    chess,
    ui,
    engine: {
      state: {
        isThinking: engine.state.isThinking,
        error: engine.state.error,
      },
    },
    timer: {
      timeControl: timer.state.timeControl,
      get whiteTime() {
        return timer.state.whiteTime;
      },
      get blackTime() {
        return timer.state.blackTime;
      },
    },
    multiplayer,
    actions: {
      jumpToFirstMove: actions.jumpToFirstMove,
      jumpToPreviousMove: actions.jumpToPreviousMove,
      jumpToNextMove: actions.jumpToNextMove,
      jumpToLastMove: actions.jumpToLastMove,
      flipBoard: actions.flipBoard,
      exitGame: actions.exitGame,
      retryEngineInit: actions.retryEngineInit,
      applyPlayerMove: actions.applyPlayerMove,
      applyMultiplayerMove: actions.applyMultiplayerMove,
    },
    derived: {
      isEngineLoading: derived.isEngineLoading,
      hasEngineError: derived.hasEngineError,
      isMultiplayer: derived.isMultiplayer,
      showEvalBar: () => reviewPhase() !== 'idle',
      allowBothSides: () => false,
      isReviewing: () => reviewPhase() !== 'idle',
      getEvalScore: () => {
        if (reviewPhase() === 'idle') return null;
        const viewIndex = chess.state.viewMoveIndex;
        const evals = reviewEvaluations();
        const evalForMove = evals.find((e) => e.moveIndex === viewIndex);
        return evalForMove?.evalAfter ?? null;
      },
    },
  };

  return (
    <PlayGameContext.Provider value={value}>
      <UnifiedGameContextInstance.Provider value={unifiedValue}>
        {props.children}
      </UnifiedGameContextInstance.Provider>
    </PlayGameContext.Provider>
  );
};

export const usePlayGame = () => {
  const ctx = useContext(PlayGameContext);
  if (!ctx) {
    throw new Error('usePlayGame must be used within <PlayGameProvider>');
  }
  return ctx;
};

/**
 * Optional variant that returns null when outside provider.
 * Use this when component may render outside PlayGameProvider (e.g., modals in header).
 */
export const usePlayGameOptional = (): PlayGameContextValue | null => {
  return useContext(PlayGameContext) ?? null;
};
