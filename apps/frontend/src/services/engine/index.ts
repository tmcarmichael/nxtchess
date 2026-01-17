// AI Engine (for computing moves)
export {
  initAiEngine,
  computeAiMove,
  terminateAiEngine,
  isAiEngineInitialized,
  EngineError,
} from './aiEngineWorker';

// Eval Engine (for position evaluation)
export {
  initEvalEngine,
  getEvaluation,
  terminateEvalEngine,
  isEvalEngineInitialized,
} from './evalEngineWorker';

// Base engine class (for advanced usage)
export { StockfishEngine } from './StockfishEngine';
export type { EngineConfig, EngineErrorCode } from './StockfishEngine';
