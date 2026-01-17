// AI Engine (for computing moves)
export {
  initAiEngine,
  computeAiMove,
  terminateAiEngine,
  isAiEngineInitialized,
  EngineError,
  // Multi-game API
  initAiEngineForGame,
  computeAiMoveForGame,
  releaseAiEngineForGame,
} from './aiEngineWorker';

// Eval Engine (for position evaluation)
export {
  initEvalEngine,
  getEvaluation,
  terminateEvalEngine,
  isEvalEngineInitialized,
  // Multi-game API
  initEvalEngineForGame,
  getEvaluationForGame,
  releaseEvalEngineForGame,
} from './evalEngineWorker';

// Base engine class (for advanced usage)
export { StockfishEngine } from './StockfishEngine';
export type { EngineConfig, EngineErrorCode } from './StockfishEngine';

// Resilient engine with auto-recovery (recommended for production)
export { ResilientEngine } from './ResilientEngine';
export type {
  EngineState,
  EngineEventType,
  EngineEvent,
  EngineEventHandler,
  ResilientEngineConfig,
} from './ResilientEngine';

// Engine Pool (for managing multiple engines)
export { EnginePool, enginePool } from './EnginePool';
export type { EnginePurpose, EngineAllocation, PoolConfig, PoolStats } from './EnginePool';

// Engine Service (high-level facade)
export { engineService } from './engineService';
export type { AiMoveResult, EngineServiceConfig } from './engineService';
