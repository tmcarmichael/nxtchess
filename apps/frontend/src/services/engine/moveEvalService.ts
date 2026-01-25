import {
  classifyMoveQuality,
  type MoveEvaluation,
  type MoveQuality,
} from '../../types/moveQuality';
import { getEvaluation } from './evalEngineWorker';
import type { Side } from '../../types/game';

/**
 * Request for move evaluation
 */
interface EvalRequest {
  moveIndex: number;
  san: string;
  fenBefore: string;
  fenAfter: string;
  side: Side;
  isPlayerMove: boolean;
  callback: (evaluation: MoveEvaluation) => void;
}

/**
 * Service for computing move evaluations in the background
 * - Queues async evaluation requests (non-blocking)
 * - Caches FEN → eval mappings to avoid redundant computations
 * - Computes cpLoss and classifies move quality
 */
class MoveEvalService {
  private evalCache: Map<string, number> = new Map();
  private pendingRequests: EvalRequest[] = [];
  private isProcessing = false;

  /**
   * Queue a move for evaluation
   * The callback will be called when evaluation is complete
   */
  queueMoveEvaluation(
    request: Omit<EvalRequest, 'callback'>,
    callback: (evaluation: MoveEvaluation) => void
  ): void {
    this.pendingRequests.push({ ...request, callback });
    this.processQueue();
  }

  /**
   * Process the evaluation queue sequentially
   * Evaluations are non-blocking but processed one at a time to avoid overloading the engine
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.pendingRequests.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.pendingRequests.length > 0) {
      const request = this.pendingRequests.shift();
      if (!request) break;

      try {
        const evaluation = await this.evaluateMove(request);
        request.callback(evaluation);
      } catch {
        // On error, return evaluation without quality classification
        request.callback({
          moveIndex: request.moveIndex,
          san: request.san,
          evalBefore: null,
          evalAfter: null,
          cpLoss: null,
          quality: null,
          isPlayerMove: request.isPlayerMove,
          side: request.side,
        });
      }
    }

    this.isProcessing = false;
  }

  /**
   * Evaluate a single move
   */
  private async evaluateMove(request: EvalRequest): Promise<MoveEvaluation> {
    const { moveIndex, san, fenBefore, fenAfter, side, isPlayerMove } = request;

    // Get cached or compute evaluations
    const evalBefore = await this.getEval(fenBefore);
    const evalAfter = await this.getEval(fenAfter);

    // Calculate centipawn loss
    // Stockfish returns scores from white's perspective (positive = white winning)
    // For white moves: cpLoss = (evalBefore - evalAfter) * 100
    // For black moves: cpLoss = (evalAfter - evalBefore) * 100
    let cpLoss: number | null = null;
    let quality: MoveQuality | null = null;

    if (evalBefore !== null && evalAfter !== null) {
      // Convert from pawns to centipawns
      if (side === 'w') {
        // White wants eval to increase or stay same
        cpLoss = Math.round((evalBefore - evalAfter) * 100);
      } else {
        // Black wants eval to decrease or stay same (more negative)
        cpLoss = Math.round((evalAfter - evalBefore) * 100);
      }
      // Clamp to 0 if move actually improved position (cpLoss should be non-negative)
      cpLoss = Math.max(0, cpLoss);
      quality = classifyMoveQuality(cpLoss);
    }

    return {
      moveIndex,
      san,
      evalBefore,
      evalAfter,
      cpLoss,
      quality,
      isPlayerMove,
      side,
    };
  }

  /**
   * Get evaluation from cache or compute it
   */
  private async getEval(fen: string): Promise<number | null> {
    if (this.evalCache.has(fen)) {
      return this.evalCache.get(fen)!;
    }

    try {
      const score = await getEvaluation(fen);
      this.evalCache.set(fen, score);
      return score;
    } catch {
      return null;
    }
  }

  /**
   * Clear all cached evaluations (call on game restart)
   */
  clearCache(): void {
    this.evalCache.clear();
    this.pendingRequests = [];
  }

  /**
   * Remove evaluations for moves at or after the given index
   * Used when taking back moves
   */
  cancelPendingFromIndex(moveIndex: number): void {
    this.pendingRequests = this.pendingRequests.filter((request) => request.moveIndex < moveIndex);
  }

  /**
   * Get cached evaluation for a FEN if available
   * Returns null if not in cache
   */
  getCachedEval(fen: string): number | null {
    return this.evalCache.get(fen) ?? null;
  }

  /**
   * Check if there are pending evaluations
   */
  hasPendingEvaluations(): boolean {
    return this.isProcessing || this.pendingRequests.length > 0;
  }

  /**
   * Wait for all pending evaluations to complete
   * Times out after maxWaitMs to prevent indefinite hangs
   */
  async waitForPendingEvaluations(maxWaitMs: number = 5000): Promise<void> {
    const startTime = Date.now();

    // Wait for the current processing cycle to complete
    while (this.isProcessing || this.pendingRequests.length > 0) {
      // Check for timeout to prevent indefinite hang if engine gets stuck
      if (Date.now() - startTime > maxWaitMs) {
        console.warn('waitForPendingEvaluations timed out, forcing clear');
        // Force clear pending state to prevent hang
        this.pendingRequests = [];
        this.isProcessing = false;
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}

// Export singleton instance
export const moveEvalService = new MoveEvalService();
