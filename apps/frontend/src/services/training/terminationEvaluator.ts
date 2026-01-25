import type { TerminationCondition, TrainingEndReason } from './types';

// ============================================================================
// Game State for Termination Check
// ============================================================================

/**
 * Current game state needed to evaluate termination conditions
 */
export interface GameStateForTermination {
  /** Number of half-moves (ply) played so far */
  halfMoveCount: number;
  /** Whether the current position is checkmate */
  isCheckmate: boolean;
  /** Whether the current position is stalemate */
  isStalemate: boolean;
  /** Whether the current position is a draw (50-move, repetition, insufficient material) */
  isDraw: boolean;
}

// ============================================================================
// Termination Result
// ============================================================================

/**
 * Result of evaluating termination conditions
 */
export interface TerminationResult {
  /** Whether the training session should end */
  shouldEnd: boolean;
  /** Reason for ending, if shouldEnd is true */
  reason: TrainingEndReason | null;
}

// ============================================================================
// Main Evaluator
// ============================================================================

/**
 * Evaluates whether the training session should end based on termination conditions.
 *
 * @param condition - The termination condition to evaluate
 * @param state - Current game state
 * @returns TerminationResult indicating whether to end and why
 */
export function evaluateTermination(
  condition: TerminationCondition,
  state: GameStateForTermination
): TerminationResult {
  switch (condition.type) {
    case 'move-count':
      return evaluateMoveCount(condition.maxHalfMoves, state.halfMoveCount);

    case 'game-over':
      return evaluateGameOver(state);

    case 'combined':
      return evaluateCombined(condition.conditions, condition.mode, state);

    default: {
      // Exhaustive check
      const exhaustiveCheck: never = condition;
      throw new Error(
        `Unknown termination type: ${(exhaustiveCheck as TerminationCondition).type}`
      );
    }
  }
}

// ============================================================================
// Condition Evaluators
// ============================================================================

/**
 * Check if move count threshold has been reached
 */
function evaluateMoveCount(maxHalfMoves: number, currentHalfMoves: number): TerminationResult {
  if (currentHalfMoves >= maxHalfMoves) {
    return { shouldEnd: true, reason: 'move-limit' };
  }
  return { shouldEnd: false, reason: null };
}

/**
 * Check if the game has naturally ended
 */
function evaluateGameOver(state: GameStateForTermination): TerminationResult {
  if (state.isCheckmate) {
    return { shouldEnd: true, reason: 'checkmate' };
  }
  if (state.isStalemate) {
    return { shouldEnd: true, reason: 'stalemate' };
  }
  if (state.isDraw) {
    return { shouldEnd: true, reason: 'draw' };
  }
  return { shouldEnd: false, reason: null };
}

/**
 * Evaluate combined conditions with AND/OR logic
 */
function evaluateCombined(
  conditions: TerminationCondition[],
  mode: 'any' | 'all',
  state: GameStateForTermination
): TerminationResult {
  if (conditions.length === 0) {
    return { shouldEnd: false, reason: null };
  }

  const results = conditions.map((c) => evaluateTermination(c, state));

  if (mode === 'any') {
    // Return first matching condition (OR logic)
    const match = results.find((r) => r.shouldEnd);
    return match ?? { shouldEnd: false, reason: null };
  } else {
    // All conditions must match (AND logic)
    const allMatch = results.every((r) => r.shouldEnd);
    if (allMatch) {
      // Return the first reason (they all matched)
      return results[0];
    }
    return { shouldEnd: false, reason: null };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a game state represents a terminal position
 * (checkmate, stalemate, or draw)
 */
export function isTerminalPosition(state: GameStateForTermination): boolean {
  return state.isCheckmate || state.isStalemate || state.isDraw;
}

/**
 * Get the natural game end reason if the position is terminal
 */
export function getGameEndReason(state: GameStateForTermination): TrainingEndReason | null {
  if (state.isCheckmate) return 'checkmate';
  if (state.isStalemate) return 'stalemate';
  if (state.isDraw) return 'draw';
  return null;
}
