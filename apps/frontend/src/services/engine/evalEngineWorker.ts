import { StockfishEngine, EngineError } from './StockfishEngine';

// Configuration
const ENGINE_EVAL_TIMEOUT_MS = 10000; // 10 seconds for evaluation
const ENGINE_EVAL_TIME_MS = 1000; // How long engine evaluates

// Re-export EngineError for backwards compatibility
export { EngineError };
// Keep EvalEngineError as alias for backwards compatibility
export { EngineError as EvalEngineError };

const evalEngine = new StockfishEngine({
  name: 'Eval Engine',
  initTimeoutMs: 10000,
  operationTimeoutMs: ENGINE_EVAL_TIMEOUT_MS,
});

export const initEvalEngine = async (): Promise<void> => {
  await evalEngine.init();
};

export const getEvaluation = async (fen: string, depth?: number): Promise<number> => {
  if (!evalEngine.isInitialized) {
    // Return 0 instead of throwing - evaluation is non-critical
    console.warn('Eval engine not initialized, returning neutral evaluation');
    return 0;
  }

  try {
    // Track the last score seen across messages
    let lastScore: number | null = null;

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
            return lastScore ?? 0;
          }
        }
        return null; // Keep waiting
      },
      ENGINE_EVAL_TIMEOUT_MS
    );

    return result;
  } catch (err) {
    // Evaluation errors are non-critical, log and return neutral
    console.warn('Evaluation failed:', err instanceof Error ? err.message : err);
    return 0;
  }
};

export const terminateEvalEngine = () => {
  evalEngine.terminate();
};

export const isEvalEngineInitialized = () => evalEngine.isInitialized;
