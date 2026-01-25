import { DEBUG } from '../../shared/utils/debug';
import { engineService } from './engineService';
import { StockfishEngine, EngineError } from './StockfishEngine';

// Configuration
const ENGINE_EVAL_TIMEOUT_MS = 10000; // 10 seconds for evaluation
const ENGINE_EVAL_TIME_MS = 1000; // How long engine evaluates

// Re-export EngineError for backwards compatibility
export { EngineError };
// Keep EvalEngineError as alias for backwards compatibility
export { EngineError as EvalEngineError };

// Legacy singleton engine for backward compatibility
const evalEngine = new StockfishEngine({
  name: 'Eval Engine',
  initTimeoutMs: 10000,
  operationTimeoutMs: ENGINE_EVAL_TIMEOUT_MS,
});

// Serialization state to prevent concurrent eval requests crashing WASM
let evalInProgress = false;
let pendingEval: {
  fen: string;
  depth?: number;
  resolve: (score: number) => void;
  reject: (reason: Error) => void;
} | null = null;

// Error thrown when an eval request is cancelled by a newer request
class EvalCancelledError extends Error {
  constructor() {
    super('Evaluation cancelled by newer request');
    this.name = 'EvalCancelledError';
  }
}

/**
 * Initialize the eval engine for single-game mode (backward compatibility).
 * For multi-game support, use engineService.initEvalEngine(gameId).
 */
export const initEvalEngine = async (): Promise<void> => {
  // Reset serialization state on init
  if (pendingEval) {
    pendingEval.reject(new EvalCancelledError());
    pendingEval = null;
  }
  evalInProgress = false;

  if (!evalEngine.isInitialized) {
    await evalEngine.init();
  } else {
    evalEngine.postMessage('ucinewgame');
    await evalEngine.waitForReady();
  }
};

/**
 * Extract whose turn it is from a FEN string.
 * Returns 'w' for white's turn, 'b' for black's turn.
 */
const getSideToMove = (fen: string): 'w' | 'b' => {
  const parts = fen.split(' ');
  return (parts[1] as 'w' | 'b') || 'w';
};

/**
 * Internal function to perform the actual evaluation.
 * Should only be called when no other eval is in progress.
 *
 * Stockfish reports scores from the perspective of the side to move.
 * We normalize to always return scores from white's perspective:
 * - Positive = white is winning
 * - Negative = black is winning
 */
const performEvaluation = async (fen: string, depth?: number): Promise<number> => {
  try {
    // Track the last score seen across messages
    let lastScore: number | null = null;

    // Determine whose turn it is for score normalization
    const sideToMove = getSideToMove(fen);

    const goCommand = depth ? `go depth ${depth}` : `go movetime ${ENGINE_EVAL_TIME_MS}`;

    const result = await evalEngine.sendCommand(
      [`position fen ${fen}`, goCommand],
      (data) => {
        const lines = data.split('\n');
        for (const line of lines) {
          // Parse score from info lines
          // e.g. "info depth 13 seldepth 20 score cp 33"
          // e.g. "info depth 9 score mate 3"
          if (line.startsWith('info depth')) {
            const scoreCpMatch = line.match(/score cp (-?\d+)/);
            const scoreMateMatch = line.match(/score mate (-?\d+)/);
            if (scoreCpMatch) {
              const scoreCp = parseInt(scoreCpMatch[1], 10);
              lastScore = scoreCp / 100;
            } else if (scoreMateMatch) {
              const mateVal = parseInt(scoreMateMatch[1], 10);
              if (mateVal > 0) {
                lastScore = 999 - mateVal;
              } else {
                lastScore = -999 - mateVal;
              }
            }
          }
          // Return the accumulated score when we see bestmove
          if (line.startsWith('bestmove')) {
            // Normalize to white's perspective
            // If it's black's turn, negate the score
            const rawScore = lastScore ?? 0;
            return sideToMove === 'b' ? -rawScore : rawScore;
          }
        }
        return null; // Keep waiting
      },
      ENGINE_EVAL_TIMEOUT_MS
    );

    return result;
  } catch (err) {
    // Evaluation errors are non-critical, return neutral score
    if (DEBUG) {
      console.warn('Evaluation failed:', err instanceof Error ? err.message : err);
    }
    return 0;
  }
};

/**
 * Process any pending evaluation request.
 * Called after an evaluation completes.
 */
const processPendingEval = async () => {
  if (pendingEval) {
    const { fen, depth, resolve } = pendingEval;
    pendingEval = null;

    evalInProgress = true;
    try {
      const score = await performEvaluation(fen, depth);
      resolve(score);
    } finally {
      evalInProgress = false;
      // Check if another request came in while we were evaluating
      processPendingEval();
    }
  }
};

/**
 * Get position evaluation for single-game mode (backward compatibility).
 * For multi-game support, use engineService.getEvaluation(gameId, fen, depth).
 *
 * This function serializes eval requests to prevent concurrent WASM access.
 * If an eval is in progress, the new request replaces any pending request
 * (latest-wins policy to always show current position's eval).
 */
export const getEvaluation = async (fen: string, depth?: number): Promise<number> => {
  if (!evalEngine.isInitialized) {
    // Return 0 instead of throwing - evaluation is non-critical
    if (DEBUG) {
      console.warn('Eval engine not initialized, returning neutral evaluation');
    }
    return 0;
  }

  // If an eval is already in progress, queue this one (replacing any previous pending)
  if (evalInProgress) {
    // Cancel any previous pending request by rejecting it
    // This ensures cancelled requests don't get cached as 0
    if (pendingEval) {
      pendingEval.reject(new EvalCancelledError());
    }

    // Create a new pending request
    return new Promise<number>((resolve, reject) => {
      pendingEval = { fen, depth, resolve, reject };
    });
  }

  // No eval in progress, start one
  evalInProgress = true;
  try {
    return await performEvaluation(fen, depth);
  } finally {
    evalInProgress = false;
    // Process any pending request that came in while we were evaluating
    processPendingEval();
  }
};

/**
 * Terminate the eval engine for single-game mode (backward compatibility).
 * For multi-game support, use engineService.releaseEvalEngine(gameId).
 */
export const terminateEvalEngine = () => {
  // Reset serialization state on terminate
  if (pendingEval) {
    pendingEval.reject(new EvalCancelledError());
    pendingEval = null;
  }
  evalInProgress = false;

  evalEngine.terminate();
};

/**
 * Check if the eval engine is initialized for single-game mode.
 * For multi-game support, use engineService.isEvalEngineInitialized(gameId).
 */
export const isEvalEngineInitialized = () => evalEngine.isInitialized;

// ============================================================================
// Multi-game API (forwards to engineService)
// ============================================================================

/**
 * Initialize eval engine for a specific game.
 */
export const initEvalEngineForGame = async (gameId: string): Promise<void> => {
  return engineService.initEvalEngine(gameId);
};

/**
 * Get position evaluation for a specific game.
 */
export const getEvaluationForGame = async (
  gameId: string,
  fen: string,
  depth?: number
): Promise<number> => {
  return engineService.getEvaluation(gameId, fen, depth);
};

/**
 * Release eval engine for a specific game.
 */
export const releaseEvalEngineForGame = (gameId: string) => {
  engineService.releaseEvalEngine(gameId);
};
