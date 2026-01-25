import type { GamePhase, Side } from '../../types/game';

// ============================================================================
// Position Source Types
// ============================================================================

/**
 * Standard starting position (normal chess game)
 */
export interface StandardPositionSource {
  type: 'standard';
}

/**
 * Explicit FEN string position
 */
export interface FenPositionSource {
  type: 'fen';
  fen: string;
}

/**
 * Fetch position from backend API
 */
export interface BackendPositionSource {
  type: 'backend';
  endpoint: string;
  params?: Record<string, string>;
}

export type PositionSource = StandardPositionSource | FenPositionSource | BackendPositionSource;

// ============================================================================
// Termination Condition Types
// ============================================================================

/**
 * End after a specific number of half-moves (ply)
 */
export interface MoveCountTermination {
  type: 'move-count';
  maxHalfMoves: number;
}

/**
 * End when the game naturally ends (checkmate, stalemate, draw)
 */
export interface GameOverTermination {
  type: 'game-over';
}

/**
 * Combine multiple conditions with AND/OR logic
 */
export interface CombinedTermination {
  type: 'combined';
  conditions: TerminationCondition[];
  mode: 'any' | 'all';
}

export type TerminationCondition = MoveCountTermination | GameOverTermination | CombinedTermination;

// ============================================================================
// Scoring Method Types
// ============================================================================

/**
 * Score is the final position evaluation
 */
export interface FinalEvalScoring {
  type: 'final-eval';
}

/**
 * Score is the difference between end and start evaluation
 */
export interface EvalDifferentialScoring {
  type: 'eval-differential';
  /** If true, normalize evals to player's perspective (positive = good for player) */
  fromPlayerPerspective: boolean;
}

/**
 * Score based on finding the best moves (for puzzles)
 */
export interface AccuracyScoring {
  type: 'accuracy';
  expectedMoves?: string[];
}

/**
 * No scoring - just practice
 */
export interface NoScoring {
  type: 'none';
}

export type ScoringMethod =
  | FinalEvalScoring
  | EvalDifferentialScoring
  | AccuracyScoring
  | NoScoring;

// ============================================================================
// Training Scenario
// ============================================================================

/**
 * Complete training scenario configuration
 */
export interface TrainingScenario {
  phase: GamePhase;
  positionSource: PositionSource;
  terminationCondition: TerminationCondition;
  scoringMethod: ScoringMethod;
}

/**
 * Metadata about a training position (from backend or computed)
 */
export interface TrainingMetadata {
  /** Unique identifier for tracking/analytics */
  positionId?: string;
  /** Theme category (e.g., 'rook-endgame', 'pin-tactic') */
  theme?: string;
  /** Difficulty level 1-10 */
  difficulty?: number;
  /** Expected outcome from the starting position */
  expectedResult?: 'win' | 'draw' | 'loss';
  /** Initial evaluation in centipawns (from white's perspective) */
  startingEval?: number;
  /** Side to move in the starting position */
  sideToMove?: Side;
}

// ============================================================================
// Training Result
// ============================================================================

/** Reason why training ended */
export type TrainingEndReason = 'move-limit' | 'checkmate' | 'stalemate' | 'draw' | 'resignation';

/**
 * Result of a completed training session
 */
export interface TrainingResult {
  scenario: TrainingScenario;
  metadata: TrainingMetadata;
  movesPlayed: number;
  endReason: TrainingEndReason;
  finalEval: number | null;
  score: number | null;
  durationMs: number;
  playerSide: Side;
}

// ============================================================================
// Resolved Position
// ============================================================================

/**
 * A resolved position ready to use (after fetching from source)
 */
export interface ResolvedPosition {
  fen: string;
  metadata: TrainingMetadata;
}
