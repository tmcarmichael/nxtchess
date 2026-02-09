import { createStore } from 'solid-js/store';
import {
  initAiEngine,
  computeAiMove,
  terminateAiEngine,
  EngineError,
} from '../../../services/engine/aiEngineWorker';
import {
  initEvalEngine,
  getEvaluation,
  terminateEvalEngine,
} from '../../../services/engine/evalEngineWorker';
import { DIFFICULTY_VALUES_ELO, DIFFICULTY_THINK_TIME_MS } from '../../../shared/config/constants';
import { DEBUG } from '../../../shared/utils/debug';
import type { Side } from '../../../types/game';

export type EngineStatus = 'idle' | 'loading' | 'ready' | 'error';

interface EngineState {
  status: EngineStatus;
  error: string | null;
  isThinking: boolean;
  difficulty: number;
  aiSide: Side;
}

export interface EngineStore {
  state: EngineState;
  init: (difficulty: number, aiSide: Side) => Promise<void>;
  initEval: () => Promise<void>;
  getMove: (fen: string) => Promise<{ from: string; to: string; promotion?: string } | null>;
  getEval: (fen: string) => Promise<number>;
  release: (sessionId: string) => void;
  terminate: () => void;
  retry: (onSuccess?: () => void) => Promise<void>;
}

export const createEngineStore = (): EngineStore => {
  const [state, setState] = createStore<EngineState>({
    status: 'idle',
    error: null,
    isThinking: false,
    difficulty: 3,
    aiSide: 'b',
  });

  let pendingRetryConfig: { difficulty: number; aiSide: Side } | null = null;

  const init = async (difficulty: number, aiSide: Side) => {
    setState({ status: 'loading', error: null, difficulty, aiSide });
    pendingRetryConfig = { difficulty, aiSide };

    const elo = DIFFICULTY_VALUES_ELO[difficulty - 1] ?? 600;

    try {
      await initAiEngine(elo);
      setState('status', 'ready');
    } catch (e) {
      const errorMessage =
        e instanceof EngineError
          ? e.message
          : 'Failed to initialize chess engine. Please try again.';
      setState({ status: 'error', error: errorMessage });
      throw e;
    }
  };

  const initEval = async () => {
    try {
      await initEvalEngine();
    } catch (e) {
      // Eval engine is non-critical - game continues without evaluation bar
      if (DEBUG) {
        console.warn('Eval engine init failed (non-critical):', e);
      }
    }
  };

  const getMove = async (
    fen: string
  ): Promise<{ from: string; to: string; promotion?: string } | null> => {
    if (state.status !== 'ready') return null;
    setState('isThinking', true);
    try {
      const thinkTimeMs = DIFFICULTY_THINK_TIME_MS[state.difficulty - 1] ?? 1000;
      const move = await computeAiMove(fen, thinkTimeMs);
      // Convert null to undefined for promotion
      return {
        from: move.from,
        to: move.to,
        promotion: move.promotion ?? undefined,
      };
    } finally {
      setState('isThinking', false);
    }
  };

  const getEval = async (fen: string): Promise<number> => {
    return getEvaluation(fen);
  };

  // Note: The legacy singleton API doesn't support per-session release.
  // This is a no-op but kept for API compatibility.
  const release = (_sessionId: string) => {
    // Legacy singleton doesn't track sessions - actual cleanup happens in terminate()
  };

  const terminate = () => {
    terminateAiEngine();
    terminateEvalEngine();
    setState({ status: 'idle', isThinking: false, error: null });
  };

  const retry = async (onSuccess?: () => void) => {
    if (!pendingRetryConfig) {
      if (DEBUG) console.warn('No pending engine config to retry');
      return;
    }

    setState({ status: 'loading', error: null });

    try {
      await init(pendingRetryConfig.difficulty, pendingRetryConfig.aiSide);
      onSuccess?.();
    } catch {
      // Error already handled in init
    }
  };

  return {
    state,
    init,
    initEval,
    getMove,
    getEval,
    release,
    terminate,
    retry,
  };
};
