import { engineService } from './engineService';
import { StockfishEngine, EngineError } from './StockfishEngine';

// Configuration
const ENGINE_THINK_TIME_MS = 1000; // How long engine thinks per move
const ENGINE_MOVE_TIMEOUT_MS = 15000; // 15 seconds for computing a move

// Re-export EngineError for backwards compatibility
export { EngineError };

// Legacy singleton engine for backward compatibility
const aiEngine = new StockfishEngine({
  name: 'AI Engine',
  initTimeoutMs: 10000,
  operationTimeoutMs: ENGINE_MOVE_TIMEOUT_MS,
});

// Mutex to prevent concurrent initAiEngine calls from racing
// (e.g., pre-warm at 600 ELO vs actual game at 2400 ELO)
let initMutex: Promise<void> = Promise.resolve();

/**
 * Initialize the AI engine for single-game mode (backward compatibility).
 * For multi-game support, use engineService.initAiEngine(gameId, elo).
 *
 * Uses a proper mutex to prevent race conditions when multiple callers try to
 * initialize with different ELO values (e.g., pre-warm vs actual game).
 */
export const initAiEngine = async (elo: number): Promise<void> => {
  // Chain this init after any pending init completes
  // This ensures proper serialization even with multiple waiters
  const previousInit = initMutex;

  let releaseMutex: () => void;
  initMutex = new Promise((resolve) => {
    releaseMutex = resolve;
  });

  // Wait for previous init to complete
  await previousInit;

  try {
    if (!aiEngine.isInitialized) {
      await aiEngine.init();
    } else {
      aiEngine.postMessage('ucinewgame');
      // Wait for ucinewgame to be processed before setting options
      await aiEngine.waitForReady();
    }

    // Configure AI with ELO-limited strength
    // Must set UCI_LimitStrength BEFORE UCI_Elo for proper effect
    aiEngine.postMessage('setoption name UCI_LimitStrength value true');
    aiEngine.postMessage(`setoption name UCI_Elo value ${elo}`);

    // Ensure options are fully applied before returning
    await aiEngine.waitForReady();
  } finally {
    // Release the mutex for next caller
    releaseMutex!();
  }
};

const getBestMove = (fen: string): Promise<string> => {
  return aiEngine.sendCommand(
    [`position fen ${fen}`, `go movetime ${ENGINE_THINK_TIME_MS}`],
    (data) => {
      if (data.startsWith('bestmove')) {
        const [, best] = data.split(' ');
        return best;
      }
      return null;
    },
    ENGINE_MOVE_TIMEOUT_MS
  );
};

const parseMoveString = (moveStr: string) => {
  const from = moveStr.slice(0, 2);
  const to = moveStr.slice(2, 4);
  const promotion = moveStr.length === 5 ? moveStr[4] : null;
  return { from, to, promotion };
};

/**
 * Compute an AI move for single-game mode (backward compatibility).
 * For multi-game support, use engineService.computeAiMove(gameId, fen).
 */
export const computeAiMove = async (fen: string) => {
  const moveStr = await getBestMove(fen);
  return parseMoveString(moveStr);
};

/**
 * Terminate the AI engine for single-game mode (backward compatibility).
 * For multi-game support, use engineService.releaseAiEngine(gameId).
 */
export const terminateAiEngine = () => {
  aiEngine.terminate();
};

/**
 * Check if the AI engine is initialized for single-game mode.
 * For multi-game support, use engineService.isAiEngineInitialized(gameId).
 */
export const isAiEngineInitialized = () => aiEngine.isInitialized;

// ============================================================================
// Multi-game API (forwards to engineService)
// ============================================================================

/**
 * Initialize AI engine for a specific game.
 */
export const initAiEngineForGame = async (gameId: string, elo: number): Promise<void> => {
  return engineService.initAiEngine(gameId, elo);
};

/**
 * Compute AI move for a specific game.
 */
export const computeAiMoveForGame = async (gameId: string, fen: string) => {
  return engineService.computeAiMove(gameId, fen);
};

/**
 * Release AI engine for a specific game.
 */
export const releaseAiEngineForGame = (gameId: string) => {
  engineService.releaseAiEngine(gameId);
};
