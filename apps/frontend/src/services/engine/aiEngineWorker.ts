import { PLAYSTYLE_PRESETS } from '../../shared';
import { AIPlayStyle } from './../../types';
import { StockfishEngine, EngineError } from './StockfishEngine';

// Configuration
const ENGINE_THINK_TIME_MS = 1000; // How long engine thinks per move
const ENGINE_MOVE_TIMEOUT_MS = 15000; // 15 seconds for computing a move

// Re-export EngineError for backwards compatibility
export { EngineError };

const aiEngine = new StockfishEngine({
  name: 'AI Engine',
  initTimeoutMs: 10000,
  operationTimeoutMs: ENGINE_MOVE_TIMEOUT_MS,
});

export const initAiEngine = async (elo: number, style: AIPlayStyle = 'balanced'): Promise<void> => {
  // Initialize base engine (handles worker creation and UCI setup)
  await aiEngine.init();

  // Configure AI-specific options
  const styleKey = style ?? 'balanced';
  const { contempt, aggressiveness } = PLAYSTYLE_PRESETS[styleKey];

  aiEngine.postMessage('setoption name UCI_LimitStrength value true');
  aiEngine.postMessage(`setoption name UCI_Elo value ${elo}`);
  aiEngine.postMessage(`setoption name Contempt value ${contempt}`);
  aiEngine.postMessage(`setoption name Aggressiveness value ${aggressiveness}`);

  // Wait for options to be applied
  await aiEngine.waitForReady();
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

export const computeAiMove = async (fen: string) => {
  const moveStr = await getBestMove(fen);
  return parseMoveString(moveStr);
};

export const terminateAiEngine = () => {
  aiEngine.terminate();
};

export const isAiEngineInitialized = () => aiEngine.isInitialized;
