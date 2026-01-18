import { createStore } from 'solid-js/store';
import type { Side, AIPlayStyle } from '../../../types';
import {
  initAiEngine,
  computeAiMove,
  terminateAiEngine,
  EngineError,
  initEvalEngine,
  getEvaluation,
  terminateEvalEngine,
  enginePool,
} from '../../../services/engine';
import { DIFFICULTY_VALUES_ELO } from '../../../shared';

export type EngineStatus = 'idle' | 'loading' | 'ready' | 'error';

interface EngineState {
  status: EngineStatus;
  error: string | null;
  isThinking: boolean;
  difficulty: number;
  aiSide: Side;
  aiPlayStyle: AIPlayStyle;
}

export interface EngineStore {
  state: EngineState;
  init: (difficulty: number, aiSide: Side, aiPlayStyle?: AIPlayStyle) => Promise<void>;
  initEval: () => Promise<void>;
  getMove: (fen: string) => Promise<{ from: string; to: string; promotion?: string } | null>;
  getEval: (fen: string) => Promise<number>;
  release: (sessionId: string) => void;
  terminate: () => void;
  setThinking: (isThinking: boolean) => void;
  retry: (onSuccess?: () => void) => Promise<void>;
}

export const createEngineStore = (): EngineStore => {
  const [state, setState] = createStore<EngineState>({
    status: 'idle',
    error: null,
    isThinking: false,
    difficulty: 3,
    aiSide: 'b',
    aiPlayStyle: 'balanced',
  });

  let pendingRetryConfig: { difficulty: number; aiSide: Side; aiPlayStyle: AIPlayStyle } | null =
    null;

  const init = async (difficulty: number, aiSide: Side, aiPlayStyle: AIPlayStyle = 'balanced') => {
    setState({ status: 'loading', error: null, difficulty, aiSide, aiPlayStyle });
    pendingRetryConfig = { difficulty, aiSide, aiPlayStyle };

    const elo = DIFFICULTY_VALUES_ELO[difficulty - 1] ?? 600;

    try {
      await initAiEngine(elo, aiPlayStyle);
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
      console.warn('Eval engine init failed (non-critical):', e);
    }
  };

  const getMove = async (
    fen: string
  ): Promise<{ from: string; to: string; promotion?: string } | null> => {
    if (state.status !== 'ready') return null;
    setState('isThinking', true);
    try {
      const move = await computeAiMove(fen);
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

  const release = (sessionId: string) => {
    enginePool.releaseGame(sessionId);
  };

  const terminate = () => {
    terminateAiEngine();
    terminateEvalEngine();
    enginePool.terminateAll();
    setState({ status: 'idle', isThinking: false, error: null });
  };

  const setThinking = (isThinking: boolean) => {
    setState('isThinking', isThinking);
  };

  const retry = async (onSuccess?: () => void) => {
    if (!pendingRetryConfig) {
      console.warn('No pending engine config to retry');
      return;
    }

    setState({ status: 'loading', error: null });

    try {
      await init(
        pendingRetryConfig.difficulty,
        pendingRetryConfig.aiSide,
        pendingRetryConfig.aiPlayStyle
      );
      onSuccess?.();
    } catch (e) {
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
    setThinking,
    retry,
  };
};
