import { TRAINING_OPENING_MOVE_THRESHOLD } from '../../shared/config/constants';
import type { TrainingScenario, PositionSource } from './types';
import type { GamePhase } from '../../types/game';

// ============================================================================
// Types
// ============================================================================

/** Non-null game phase for use as record keys */
type ValidGamePhase = Exclude<GamePhase, null>;

// ============================================================================
// Training Move Thresholds
// ============================================================================

/** Number of half-moves for endgame training (25 full moves) */
export const TRAINING_ENDGAME_MOVE_THRESHOLD = 50;

/** Number of half-moves for middlegame training (20 full moves) */
export const TRAINING_MIDDLEGAME_MOVE_THRESHOLD = 40;

// ============================================================================
// Predefined Training Scenarios
// ============================================================================

/**
 * Training scenarios indexed by game phase.
 * Each scenario defines how position is sourced, when training ends, and how to score.
 */
export const TRAINING_SCENARIOS: Record<ValidGamePhase, TrainingScenario> = {
  opening: {
    phase: 'opening',
    positionSource: { type: 'standard' },
    terminationCondition: {
      type: 'move-count',
      maxHalfMoves: TRAINING_OPENING_MOVE_THRESHOLD,
    },
    scoringMethod: { type: 'final-eval' },
  },

  endgame: {
    phase: 'endgame',
    positionSource: {
      type: 'backend',
      endpoint: '/api/training/endgame/random',
    },
    terminationCondition: {
      // No move limit - play until checkmate/stalemate/draw
      type: 'game-over',
    },
    scoringMethod: {
      type: 'eval-differential',
      fromPlayerPerspective: true,
    },
  },

  middlegame: {
    phase: 'middlegame',
    positionSource: {
      type: 'backend',
      endpoint: '/api/training/middlegame/random',
    },
    terminationCondition: {
      type: 'combined',
      conditions: [
        { type: 'move-count', maxHalfMoves: TRAINING_MIDDLEGAME_MOVE_THRESHOLD },
        { type: 'game-over' },
      ],
      mode: 'any',
    },
    scoringMethod: {
      type: 'eval-differential',
      fromPlayerPerspective: true,
    },
  },
};

// ============================================================================
// Scenario Builder
// ============================================================================

export interface ScenarioOverrides {
  /** Override difficulty level (added to backend params) */
  difficulty?: number;
  /** Override theme filter (added to backend params) */
  theme?: string;
  /** Use a specific FEN instead of the scenario's position source */
  customFen?: string;
  /** Override the side parameter for backend */
  side?: string;
  /** Exclude a specific position ID (to avoid repeats on restart) */
  excludePositionId?: string;
}

/**
 * Build a scenario with custom parameters.
 * Creates a new scenario object with overrides applied.
 */
export function buildScenario(phase: GamePhase, overrides?: ScenarioOverrides): TrainingScenario {
  if (!phase) {
    throw new Error('Training phase is required');
  }

  const base = TRAINING_SCENARIOS[phase];
  if (!base) {
    throw new Error(`Unknown training phase: ${phase}`);
  }

  // Deep clone the base scenario
  const scenario: TrainingScenario = {
    ...base,
    positionSource: { ...base.positionSource } as PositionSource,
    terminationCondition: { ...base.terminationCondition },
    scoringMethod: { ...base.scoringMethod },
  };

  if (!overrides) {
    return scenario;
  }

  // Override with custom FEN if provided
  if (overrides.customFen) {
    scenario.positionSource = {
      type: 'fen',
      fen: overrides.customFen,
    };
    return scenario;
  }

  // Add query params for backend position sources
  if (scenario.positionSource.type === 'backend') {
    const params: Record<string, string> = {
      ...scenario.positionSource.params,
    };

    if (overrides.difficulty !== undefined) {
      params.difficulty = String(overrides.difficulty);
    }
    if (overrides.theme) {
      params.theme = overrides.theme;
    }
    if (overrides.side) {
      params.side = overrides.side;
    }
    if (overrides.excludePositionId) {
      params.exclude = overrides.excludePositionId;
    }

    scenario.positionSource = {
      ...scenario.positionSource,
      params,
    };
  }

  return scenario;
}

/**
 * Get the move threshold for a given phase.
 * Returns the maximum number of half-moves before training ends.
 */
export function getMoveThreshold(phase: GamePhase): number {
  switch (phase) {
    case 'opening':
      return TRAINING_OPENING_MOVE_THRESHOLD;
    case 'endgame':
      return TRAINING_ENDGAME_MOVE_THRESHOLD;
    case 'middlegame':
      return TRAINING_MIDDLEGAME_MOVE_THRESHOLD;
    default:
      return TRAINING_OPENING_MOVE_THRESHOLD;
  }
}
