import { createSignal, createEffect, on, onCleanup, type Accessor } from 'solid-js';
import {
  getEvaluation,
  isEvalEngineInitialized,
} from '../../../../services/engine/evalEngineWorker';
import type { GameLifecycle } from '../../../../types/game';

const EVAL_DEBOUNCE_MS = 300;

export function useEvaluation(params: {
  fen: Accessor<string>;
  showEvalBar: Accessor<boolean>;
  lifecycle: Accessor<GameLifecycle>;
  getEvalScore?: () => number | null;
}): { evalScore: Accessor<number | null> } {
  const [evalScore, setEvalScore] = createSignal<number | null>(null);
  let evalDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  createEffect(
    on(
      () => [params.fen(), params.showEvalBar(), params.lifecycle()] as const,
      ([currentFen, showEval, lifecycle]) => {
        // If context provides eval score (e.g., Analyze mode), skip this effect
        if (params.getEvalScore) {
          return;
        }

        if (evalDebounceTimer) {
          clearTimeout(evalDebounceTimer);
          evalDebounceTimer = null;
        }

        if (showEval && isEvalEngineInitialized() && lifecycle === 'playing') {
          evalDebounceTimer = setTimeout(() => {
            getEvaluation(currentFen)
              .then((score: number) => {
                setEvalScore(score ?? null);
              })
              .catch(() => {});
          }, EVAL_DEBOUNCE_MS);
        }
      }
    )
  );

  onCleanup(() => {
    if (evalDebounceTimer) clearTimeout(evalDebounceTimer);
  });

  return { evalScore };
}
