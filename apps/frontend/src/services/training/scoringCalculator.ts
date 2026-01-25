import type { ScoringMethod, TrainingMetadata, TrainingEndReason } from './types';
import type { Side } from '../../types/game';

// ============================================================================
// Constants
// ============================================================================

/** Centipawn value representing checkmate */
const MATE_SCORE = 10000;

// ============================================================================
// Scoring Input
// ============================================================================

/**
 * Input data needed to calculate the training score
 */
export interface ScoringInput {
  /** The scoring method to use */
  method: ScoringMethod;
  /** Metadata about the training position */
  metadata: TrainingMetadata;
  /** Final position evaluation in centipawns (from white's perspective) */
  finalEval: number | null;
  /** Which side the player was playing */
  playerSide: Side;
  /** How the training ended */
  endReason: TrainingEndReason;
  /** Whether the player won (true), lost (false), or drew/ongoing (null) */
  playerWon: boolean | null;
}

// ============================================================================
// Score Result
// ============================================================================

/**
 * Result of score calculation with formatted display values
 */
export interface ScoreResult {
  /** Raw score value (null if scoring method is 'none') */
  score: number | null;
  /** Formatted score for display (e.g., "+150 cp", "Checkmate!") */
  displayScore: string;
  /** Whether the score is positive (good for player) */
  isPositive: boolean;
  /** Description of the scoring (e.g., "Improved position by 150 centipawns") */
  description: string;
}

// ============================================================================
// Main Calculator
// ============================================================================

/**
 * Calculates the training score based on the scoring method.
 *
 * @param input - All data needed for score calculation
 * @returns ScoreResult with raw and formatted scores
 */
export function calculateScore(input: ScoringInput): ScoreResult {
  const { method } = input;

  switch (method.type) {
    case 'none':
      return {
        score: null,
        displayScore: '-',
        isPositive: true,
        description: 'Practice mode - no scoring',
      };

    case 'final-eval':
      return calculateFinalEvalScore(input);

    case 'eval-differential':
      return calculateEvalDifferentialScore(input, method.fromPlayerPerspective);

    case 'accuracy':
      // Accuracy scoring requires move-by-move analysis (future enhancement)
      return {
        score: null,
        displayScore: '-',
        isPositive: true,
        description: 'Accuracy scoring not yet implemented',
      };

    default: {
      const exhaustiveCheck: never = method;
      throw new Error(`Unknown scoring method: ${(exhaustiveCheck as ScoringMethod).type}`);
    }
  }
}

// ============================================================================
// Scoring Implementations
// ============================================================================

/**
 * Score is simply the final position evaluation
 */
function calculateFinalEvalScore(input: ScoringInput): ScoreResult {
  const { finalEval, playerSide, endReason, playerWon } = input;

  // Handle game-ending positions
  if (endReason === 'checkmate') {
    const score = playerWon ? MATE_SCORE : -MATE_SCORE;
    return {
      score,
      displayScore: playerWon ? 'Checkmate!' : 'Checkmated',
      isPositive: playerWon ?? false,
      description: playerWon ? 'You delivered checkmate!' : 'You were checkmated',
    };
  }

  if (endReason === 'stalemate' || endReason === 'draw') {
    return {
      score: 0,
      displayScore: 'Draw',
      isPositive: true,
      description: 'Game ended in a draw',
    };
  }

  if (finalEval === null) {
    return {
      score: null,
      displayScore: '-',
      isPositive: true,
      description: 'Could not evaluate position',
    };
  }

  // Normalize to player's perspective
  const playerEval = normalizeEval(finalEval, playerSide);
  const isPositive = playerEval >= 0;

  return {
    score: playerEval,
    displayScore: formatEval(playerEval),
    isPositive,
    description: isPositive
      ? `Favorable position: ${formatEval(playerEval)}`
      : `Unfavorable position: ${formatEval(playerEval)}`,
  };
}

/**
 * Score is the difference between final and starting evaluation
 */
function calculateEvalDifferentialScore(
  input: ScoringInput,
  fromPlayerPerspective: boolean
): ScoreResult {
  const { metadata, finalEval, playerSide, endReason, playerWon } = input;
  const startEval = metadata.startingEval ?? 0;

  // Handle game-ending positions
  if (endReason === 'checkmate') {
    const endScore = playerWon ? MATE_SCORE : -MATE_SCORE;
    const startNormalized = fromPlayerPerspective
      ? normalizeEval(startEval, playerSide)
      : startEval;
    const endNormalized = fromPlayerPerspective ? endScore : playerWon ? MATE_SCORE : -MATE_SCORE;
    const diff = endNormalized - startNormalized;

    return {
      score: diff,
      displayScore: playerWon ? 'Checkmate!' : 'Checkmated',
      isPositive: playerWon ?? false,
      description: playerWon
        ? `Checkmate! Score: ${formatScoreDiff(diff)}`
        : `Checkmated. Score: ${formatScoreDiff(diff)}`,
    };
  }

  if (endReason === 'stalemate' || endReason === 'draw') {
    const startNormalized = fromPlayerPerspective
      ? normalizeEval(startEval, playerSide)
      : startEval;
    const diff = 0 - startNormalized;

    return {
      score: diff,
      displayScore: 'Draw',
      isPositive: diff >= 0,
      description:
        diff >= 0
          ? `Draw achieved. Score: ${formatScoreDiff(diff)}`
          : `Draw from winning position. Score: ${formatScoreDiff(diff)}`,
    };
  }

  if (finalEval === null) {
    return {
      score: null,
      displayScore: '-',
      isPositive: true,
      description: 'Could not evaluate final position',
    };
  }

  // Calculate differential
  let diff: number;
  if (fromPlayerPerspective) {
    const playerStartEval = normalizeEval(startEval, playerSide);
    const playerEndEval = normalizeEval(finalEval, playerSide);
    diff = playerEndEval - playerStartEval;
  } else {
    diff = finalEval - startEval;
  }

  const isPositive = diff >= 0;

  return {
    score: diff,
    displayScore: formatScoreDiff(diff),
    isPositive,
    description: isPositive
      ? `Improved position by ${Math.abs(diff)} centipawns`
      : `Lost ${Math.abs(diff)} centipawns`,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Normalizes evaluation to be from the specified player's perspective.
 * Positive = good for player, Negative = bad for player.
 *
 * @param evalCp - Evaluation in centipawns (from white's perspective)
 * @param playerSide - Which side the player is playing
 * @returns Evaluation from player's perspective
 */
export function normalizeEval(evalCp: number, playerSide: Side): number {
  return playerSide === 'w' ? evalCp : -evalCp;
}

/**
 * Formats an evaluation for display
 */
export function formatEval(evalCp: number): string {
  if (Math.abs(evalCp) >= MATE_SCORE - 100) {
    return evalCp > 0 ? 'M+' : 'M-';
  }

  const pawns = evalCp / 100;
  const sign = pawns >= 0 ? '+' : '';
  return `${sign}${pawns.toFixed(2)}`;
}

/**
 * Formats a score differential for display
 */
export function formatScoreDiff(diff: number): string {
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${diff} cp`;
}

/**
 * Determines if the player won based on game state
 */
export function determinePlayerWon(
  endReason: TrainingEndReason,
  playerSide: Side,
  gameWinner: Side | 'draw' | null
): boolean | null {
  if (endReason === 'stalemate' || endReason === 'draw') {
    return null;
  }
  if (endReason === 'move-limit') {
    return null;
  }
  if (gameWinner === 'draw') {
    return null;
  }
  if (gameWinner === null) {
    return null;
  }
  return gameWinner === playerSide;
}
