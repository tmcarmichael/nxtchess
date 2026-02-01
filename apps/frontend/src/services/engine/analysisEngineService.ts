import { Chess } from 'chess.js';
import { DEBUG } from '../../shared/utils/debug';
import { StockfishEngine, detectEngineVariant, type EngineVariant } from './StockfishEngine';

// ============================================================================
// Types
// ============================================================================

export interface EngineLine {
  /** Score in centipawns from white's perspective */
  score: number;
  /** Mate in N moves (positive = white mates, negative = black mates) */
  mate: number | null;
  /** Principal variation in UCI format (e.g., ["e2e4", "e7e5"]) */
  pv: string[];
  /** Principal variation in SAN format (e.g., ["e4", "e5"]) */
  pvSan: string[];
}

export interface EngineAnalysis {
  /** Best score from white's perspective */
  score: number;
  /** Mate in N if applicable */
  mate: number | null;
  /** Current search depth */
  depth: number;
  /** Top N lines (MultiPV) */
  lines: EngineLine[];
  /** Whether the engine is currently thinking */
  isThinking: boolean;
}

export interface EngineInfo {
  /** Human-readable engine name */
  name: string;
  /** Engine variant being used */
  variant: EngineVariant;
  /** Whether multi-threaded */
  isMultiThreaded: boolean;
}

// ============================================================================
// Analysis Options
// ============================================================================

export interface AnalyzeOptions {
  /** Time to analyze in milliseconds (default: 10000 = 10 seconds) */
  timeMs?: number;
  /** Callback for real-time progress updates as engine thinks deeper */
  onProgress?: (analysis: EngineAnalysis) => void;
}

// ============================================================================
// Configuration
// ============================================================================

const ENGINE_ANALYSIS_TIMEOUT_MS = 30000;
const DEFAULT_MULTI_PV = 5;
const DEFAULT_TIME_MS = 10000; // 10 seconds

// ============================================================================
// Analysis Engine Service
// ============================================================================

class AnalysisEngineService {
  private engine: StockfishEngine;
  private isInitialized = false;
  private multiPV = DEFAULT_MULTI_PV;
  private currentAnalysis: EngineAnalysis | null = null;

  constructor() {
    this.engine = new StockfishEngine({
      name: 'Analysis Engine',
      initTimeoutMs: 15000,
      operationTimeoutMs: ENGINE_ANALYSIS_TIMEOUT_MS,
    });
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  async init(): Promise<void> {
    if (this.isInitialized) return;

    await this.engine.init();

    // Configure for analysis mode
    this.engine.postMessage('setoption name UCI_AnalyseMode value true');
    this.engine.postMessage(`setoption name MultiPV value ${this.multiPV}`);

    this.isInitialized = true;
  }

  // ============================================================================
  // Analysis
  // ============================================================================

  /**
   * Start position analysis. Returns analysis result when complete.
   * Use stopAnalysis() to cancel.
   *
   * @param fen - Position to analyze
   * @param options - Analysis options including depth and progress callback
   */
  async analyze(fen: string, options: AnalyzeOptions = {}): Promise<EngineAnalysis> {
    const { timeMs = DEFAULT_TIME_MS, onProgress } = options;

    if (!this.isInitialized) {
      await this.init();
    }

    // Cancel any existing analysis
    this.stopAnalysis();

    const sideToMove = this.getSideToMove(fen);

    // Track lines by multipv index
    const lines: Map<number, EngineLine> = new Map();
    let currentDepth = 0;
    let lastReportedDepth = 0;

    try {
      await this.engine.sendCommand(
        [`position fen ${fen}`, `go movetime ${timeMs}`],
        (data) => {
          const dataLines = data.split('\n');
          for (const line of dataLines) {
            // Parse info lines
            if (line.startsWith('info depth')) {
              const parsed = this.parseInfoLine(line, fen, sideToMove);
              if (parsed) {
                lines.set(parsed.multipv, parsed.line);
                currentDepth = Math.max(currentDepth, parsed.depth);

                // Report progress when we receive the last multiPV line for a new depth
                // This ensures all 3 lines are available before updating the display
                // UCI protocol sends multipv lines in order: multipv 1, 2, 3 for each depth
                const hasAllLinesForDepth = parsed.multipv === this.multiPV;
                const isNewDepth = parsed.depth > lastReportedDepth;

                if (onProgress && hasAllLinesForDepth && isNewDepth) {
                  lastReportedDepth = parsed.depth;
                  const sortedLines = Array.from(lines.entries())
                    .sort((a, b) => a[0] - b[0])
                    .map(([, l]) => l);

                  const bestLine = sortedLines[0];
                  const progressAnalysis: EngineAnalysis = {
                    score: bestLine?.score ?? 0,
                    mate: bestLine?.mate ?? null,
                    depth: parsed.depth,
                    lines: sortedLines,
                    isThinking: true,
                  };
                  onProgress(progressAnalysis);
                }
              }
            }

            // Analysis complete
            if (line.startsWith('bestmove')) {
              const sortedLines = Array.from(lines.entries())
                .sort((a, b) => a[0] - b[0])
                .map(([, line]) => line);

              const bestLine = sortedLines[0];
              this.currentAnalysis = {
                score: bestLine?.score ?? 0,
                mate: bestLine?.mate ?? null,
                depth: currentDepth,
                lines: sortedLines,
                isThinking: false,
              };

              return this.currentAnalysis;
            }
          }
          return null;
        },
        ENGINE_ANALYSIS_TIMEOUT_MS
      );
    } catch (err) {
      if (DEBUG) {
        console.warn('Analysis error:', err);
      }
    }

    return (
      this.currentAnalysis ?? {
        score: 0,
        mate: null,
        depth: 0,
        lines: [],
        isThinking: false,
      }
    );
  }

  /**
   * Stop current analysis.
   */
  stopAnalysis(): void {
    this.engine.postMessage('stop');
  }

  // ============================================================================
  // Engine Info
  // ============================================================================

  getEngineInfo(): EngineInfo {
    const variant = detectEngineVariant();
    return {
      name: this.getEngineName(variant),
      variant,
      isMultiThreaded: variant === 'full-mt',
    };
  }

  private getEngineName(variant: EngineVariant): string {
    switch (variant) {
      case 'full-mt':
        return 'Stockfish 16.1 NNUE (Multi-threaded)';
      case 'full-st':
        return 'Stockfish 16.1 NNUE';
      case 'lite-st':
        return 'Stockfish 16.1 Lite NNUE';
    }
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  setMultiPV(count: number): void {
    this.multiPV = Math.max(1, Math.min(5, count));
    if (this.isInitialized) {
      this.engine.postMessage(`setoption name MultiPV value ${this.multiPV}`);
    }
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  terminate(): void {
    this.stopAnalysis();
    this.engine.terminate();
    this.isInitialized = false;
  }

  get initialized(): boolean {
    return this.isInitialized;
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private getSideToMove(fen: string): 'w' | 'b' {
    const parts = fen.split(' ');
    return (parts[1] as 'w' | 'b') || 'w';
  }

  /**
   * Validate that a string is a valid UCI move format (e.g., "e2e4", "e7e8q")
   */
  private isValidUciMove(move: string): boolean {
    if (move.length < 4 || move.length > 5) return false;
    const files = 'abcdefgh';
    const ranks = '12345678';
    const from = move.slice(0, 2);
    const to = move.slice(2, 4);
    if (!files.includes(from[0]) || !ranks.includes(from[1])) return false;
    if (!files.includes(to[0]) || !ranks.includes(to[1])) return false;
    if (move.length === 5) {
      const promo = move[4];
      if (!['q', 'r', 'b', 'n'].includes(promo)) return false;
    }
    return true;
  }

  private parseInfoLine(
    line: string,
    fen: string,
    sideToMove: 'w' | 'b'
  ): { multipv: number; depth: number; line: EngineLine } | null {
    // Extract multipv index (default to 1 if not present)
    const multipvMatch = line.match(/multipv (\d+)/);
    const multipv = multipvMatch ? parseInt(multipvMatch[1], 10) : 1;

    // Extract depth
    const depthMatch = line.match(/depth (\d+)/);
    if (!depthMatch) return null;
    const depth = parseInt(depthMatch[1], 10);

    // Extract score
    let score = 0;
    let mate: number | null = null;

    const scoreCpMatch = line.match(/score cp (-?\d+)/);
    const scoreMateMatch = line.match(/score mate (-?\d+)/);

    if (scoreCpMatch) {
      score = parseInt(scoreCpMatch[1], 10) / 100;
      // Normalize to white's perspective
      if (sideToMove === 'b') score = -score;
    } else if (scoreMateMatch) {
      mate = parseInt(scoreMateMatch[1], 10);
      // Normalize to white's perspective
      if (sideToMove === 'b') mate = -mate;
      // Set score to large value for sorting
      score = mate > 0 ? 999 - Math.abs(mate) : -999 + Math.abs(mate);
    }

    // Extract PV - filter to only valid UCI moves (e.g., "e2e4", "e7e8q")
    const pvMatch = line.match(/pv (.+)$/);
    if (!pvMatch) return null;

    const pv = pvMatch[1].split(' ').filter((m) => this.isValidUciMove(m));
    if (pv.length === 0) return null; // No valid moves found

    const pvSan = this.convertPvToSan(fen, pv);

    return {
      multipv,
      depth,
      line: { score, mate, pv, pvSan },
    };
  }

  private convertPvToSan(fen: string, pv: string[]): string[] {
    try {
      const chess = new Chess(fen);
      const sanMoves: string[] = [];

      for (const uciMove of pv) {
        const from = uciMove.slice(0, 2);
        const to = uciMove.slice(2, 4);
        const promotion = uciMove.length === 5 ? uciMove[4] : undefined;

        const move = chess.move({ from, to, promotion });
        if (move) {
          sanMoves.push(move.san);
        } else {
          break; // Invalid move, stop conversion
        }
      }

      return sanMoves;
    } catch {
      return pv; // Fallback to UCI notation
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const analysisEngine = new AnalysisEngineService();
