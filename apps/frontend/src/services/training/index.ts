// ============================================================================
// Training Services
// ============================================================================
//
// Modular training infrastructure for opening, endgame, middlegame, and future
// training modes. Each module handles a specific concern:
//
// - types.ts: Type definitions for scenarios, positions, and results
// - scenarios.ts: Predefined training scenario configurations
// - positionSource.ts: Resolves position sources to actual FEN strings
// - terminationEvaluator.ts: Determines when training should end
// - scoringCalculator.ts: Calculates training scores
//
// ============================================================================

// Types
export type {
  PositionSource,
  StandardPositionSource,
  FenPositionSource,
  BackendPositionSource,
  TerminationCondition,
  MoveCountTermination,
  GameOverTermination,
  CombinedTermination,
  ScoringMethod,
  FinalEvalScoring,
  EvalDifferentialScoring,
  AccuracyScoring,
  NoScoring,
  TrainingScenario,
  TrainingMetadata,
  TrainingEndReason,
  TrainingResult,
  ResolvedPosition,
} from './types';

// Scenarios
export {
  TRAINING_SCENARIOS,
  TRAINING_ENDGAME_MOVE_THRESHOLD,
  TRAINING_MIDDLEGAME_MOVE_THRESHOLD,
  buildScenario,
  getMoveThreshold,
} from './scenarios';

// Position Source
export { resolvePositionSource } from './positionSource';

// Termination Evaluator
export type { GameStateForTermination, TerminationResult } from './terminationEvaluator';
export { evaluateTermination, isTerminalPosition, getGameEndReason } from './terminationEvaluator';

// Scoring Calculator
export type { ScoringInput, ScoreResult } from './scoringCalculator';
export {
  calculateScore,
  normalizeEval,
  formatEval,
  formatScoreDiff,
  determinePlayerWon,
} from './scoringCalculator';
