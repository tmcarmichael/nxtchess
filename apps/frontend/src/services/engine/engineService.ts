import { PLAYSTYLE_PRESETS } from '../../shared/config/constants';
import { DEBUG } from '../../shared/utils/debug';
import { enginePool } from './EnginePool';
import { type ResilientEngine } from './ResilientEngine';
import { EngineError } from './StockfishEngine';
import type { AIPlayStyle } from '../../types/game';

// ============================================================================
// Configuration
// ============================================================================

const ENGINE_THINK_TIME_MS = 1000;
const ENGINE_MOVE_TIMEOUT_MS = 15000;
const ENGINE_EVAL_TIME_MS = 1000;
const ENGINE_EVAL_TIMEOUT_MS = 10000;

// ============================================================================
// Engine Service Types
// ============================================================================

export interface AiMoveResult {
  from: string;
  to: string;
  promotion: string | null;
}

export interface EngineServiceConfig {
  gameId: string;
  elo?: number;
  style?: AIPlayStyle;
}

// ============================================================================
// Engine Service Class
// ============================================================================

class EngineService {
  // ============================================================================
  // AI Engine Operations
  // ============================================================================

  async initAiEngine(gameId: string, elo: number, style: AIPlayStyle = 'balanced'): Promise<void> {
    const engine = await enginePool.acquire('ai', gameId);

    // Initialize if not already
    if (!engine.isInitialized) {
      await engine.init();
    }

    // Configure AI-specific options
    const styleKey = style ?? 'balanced';
    const { contempt, aggressiveness } = PLAYSTYLE_PRESETS[styleKey];

    // Apply config through ResilientEngine so it persists through recovery
    await engine.applyConfig([
      'setoption name UCI_LimitStrength value true',
      `setoption name UCI_Elo value ${elo}`,
      `setoption name Contempt value ${contempt}`,
      `setoption name Aggressiveness value ${aggressiveness}`,
    ]);
  }

  async computeAiMove(gameId: string, fen: string): Promise<AiMoveResult> {
    const engine = await this.getOrInitAiEngine(gameId);

    const moveStr = await engine.sendCommand(
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

    return this.parseMoveString(moveStr);
  }

  // ============================================================================
  // Eval Engine Operations
  // ============================================================================

  async initEvalEngine(gameId: string): Promise<void> {
    const engine = await enginePool.acquire('eval', gameId);

    if (!engine.isInitialized) {
      await engine.init();
    }
  }

  async getEvaluation(gameId: string, fen: string, depth?: number): Promise<number> {
    const engine = await this.getOrInitEvalEngine(gameId);

    if (!engine.isInitialized) {
      if (DEBUG) {
        console.warn('Eval engine not initialized, returning neutral evaluation');
      }
      return 0;
    }

    try {
      let lastScore: number | null = null;
      const goCommand = depth ? `go depth ${depth}` : `go movetime ${ENGINE_EVAL_TIME_MS}`;

      const result = await engine.sendCommand(
        [`position fen ${fen}`, goCommand],
        (data) => {
          const lines = data.split('\n');
          for (const line of lines) {
            if (line.startsWith('info depth')) {
              const scoreCpMatch = line.match(/score cp (-?\d+)/);
              const scoreMateMatch = line.match(/score mate (-?\d+)/);
              if (scoreCpMatch) {
                const scoreCp = parseInt(scoreCpMatch[1], 10);
                lastScore = scoreCp / 100;
              } else if (scoreMateMatch) {
                const mateVal = parseInt(scoreMateMatch[1], 10);
                if (mateVal > 0) {
                  lastScore = 999 - mateVal;
                } else {
                  lastScore = -999 - mateVal;
                }
              }
            }
            if (line.startsWith('bestmove')) {
              return lastScore ?? 0;
            }
          }
          return null;
        },
        ENGINE_EVAL_TIMEOUT_MS
      );

      return result;
    } catch (err) {
      if (DEBUG) {
        console.warn('Evaluation failed:', err instanceof Error ? err.message : err);
      }
      return 0;
    }
  }

  // ============================================================================
  // Engine Lifecycle Management
  // ============================================================================

  releaseEngines(gameId: string): void {
    enginePool.releaseGame(gameId);
  }

  releaseAiEngine(gameId: string): void {
    enginePool.release('ai', gameId);
  }

  releaseEvalEngine(gameId: string): void {
    enginePool.release('eval', gameId);
  }

  terminateAllEngines(): void {
    enginePool.terminateAll();
  }

  // ============================================================================
  // Status Methods
  // ============================================================================

  isAiEngineInitialized(gameId: string): boolean {
    const allocation = enginePool.getAllocationInfo('ai', gameId);
    return allocation?.engine.isInitialized ?? false;
  }

  isEvalEngineInitialized(gameId: string): boolean {
    const allocation = enginePool.getAllocationInfo('eval', gameId);
    return allocation?.engine.isInitialized ?? false;
  }

  getPoolStatus(): { allocated: number; idle: number; total: number } {
    return {
      allocated: enginePool.getAllocatedCount(),
      idle: enginePool.getIdleCount(),
      total: enginePool.getTotalCount(),
    };
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private async getOrInitAiEngine(gameId: string): Promise<ResilientEngine> {
    const engine = await enginePool.acquire('ai', gameId);

    if (!engine.isInitialized) {
      throw new EngineError('AI engine not initialized for this game', 'NOT_INITIALIZED');
    }

    return engine;
  }

  private async getOrInitEvalEngine(gameId: string): Promise<ResilientEngine> {
    const engine = await enginePool.acquire('eval', gameId);

    if (!engine.isInitialized) {
      await engine.init();
    }

    return engine;
  }

  private parseMoveString(moveStr: string): AiMoveResult {
    const from = moveStr.slice(0, 2);
    const to = moveStr.slice(2, 4);
    const promotion = moveStr.length === 5 ? moveStr[4] : null;
    return { from, to, promotion };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const engineService = new EngineService();
