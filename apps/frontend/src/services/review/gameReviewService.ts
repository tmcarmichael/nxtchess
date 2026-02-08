import { Chess } from 'chess.js';
import { DEBUG } from '../../shared/utils/debug';
import { classifyMoveQuality } from '../../types/moveQuality';
import { StockfishEngine } from '../engine/StockfishEngine';
import type { Side } from '../../types/game';
import type { MoveEvaluation, MoveQuality } from '../../types/moveQuality';
import type {
  EvalPoint,
  QualityDistribution,
  ReviewHandle,
  ReviewProgress,
  ReviewSummary,
} from '../../types/review';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const REVIEW_EVAL_TIME_MS = 800;
const REVIEW_EVAL_TIMEOUT_MS = 10000;
const MAX_CONSECUTIVE_FAILURES = 3;

interface GameReviewConfig {
  moves: string[];
  startingFen?: string;
  playerColor: Side;
  moveTimesMs?: number[];
  onProgress: (progress: ReviewProgress) => void;
  onMoveEvaluated: (evaluation: MoveEvaluation) => void;
  onComplete: (summary: ReviewSummary) => void;
}

function createEmptyDistribution(): QualityDistribution {
  return { best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0 };
}

function cpToWinPercent(cp: number): number {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
}

function computeAccuracy(evaluations: MoveEvaluation[], side: Side): number {
  const sideMoves = evaluations.filter(
    (e) => e.side === side && e.evalBefore !== null && e.evalAfter !== null
  );
  if (sideMoves.length === 0) return 100;

  let totalAccuracy = 0;
  for (const move of sideMoves) {
    const wpBefore = cpToWinPercent(move.evalBefore! * 100);
    const wpAfter = cpToWinPercent(move.evalAfter! * 100);
    const wpLoss = Math.max(0, side === 'w' ? wpBefore - wpAfter : wpAfter - wpBefore);
    const moveAccuracy = 103.1668 * Math.exp(-0.04354 * wpLoss) - 3.1668;
    totalAccuracy += Math.max(0, Math.min(100, moveAccuracy));
  }

  return Math.round((totalAccuracy / sideMoves.length) * 10) / 10;
}

function computeSummary(
  evaluations: MoveEvaluation[],
  evalHistory: EvalPoint[]
): ReviewSummary {
  const whiteDistribution = createEmptyDistribution();
  const blackDistribution = createEmptyDistribution();

  for (const evaluation of evaluations) {
    if (evaluation.quality) {
      const dist = evaluation.side === 'w' ? whiteDistribution : blackDistribution;
      dist[evaluation.quality]++;
    }
  }

  return {
    whiteAccuracy: computeAccuracy(evaluations, 'w'),
    blackAccuracy: computeAccuracy(evaluations, 'b'),
    evaluations,
    evalHistory,
    qualityDistribution: {
      white: whiteDistribution,
      black: blackDistribution,
    },
  };
}

function getSideToMove(fen: string): 'w' | 'b' {
  const parts = fen.split(' ');
  return (parts[1] as 'w' | 'b') || 'w';
}

function evaluatePosition(engine: StockfishEngine, fen: string): Promise<number> {
  return new Promise((resolve, reject) => {
    let lastScore: number | null = null;
    const sideToMove = getSideToMove(fen);
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      removeListener();
      if (DEBUG) console.warn('[Review] Evaluation timed out for FEN:', fen.split(' ').slice(0, 2).join(' '));
      reject(new Error('Evaluation timed out'));
    }, REVIEW_EVAL_TIMEOUT_MS);

    const removeListener = engine.onMessage((data) => {
      if (settled) return;
      if (typeof data !== 'string') return;

      const lines = data.split('\n');
      for (const line of lines) {
        if (line.startsWith('info depth')) {
          const scoreCpMatch = line.match(/score cp (-?\d+)/);
          const scoreMateMatch = line.match(/score mate (-?\d+)/);
          if (scoreCpMatch) {
            lastScore = parseInt(scoreCpMatch[1], 10) / 100;
          } else if (scoreMateMatch) {
            const mateVal = parseInt(scoreMateMatch[1], 10);
            lastScore = mateVal > 0 ? 999 - mateVal : -999 - mateVal;
          }
        }
        if (line.startsWith('bestmove')) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          removeListener();
          const rawScore = lastScore ?? 0;
          const normalizedScore = sideToMove === 'b' ? -rawScore : rawScore;
          resolve(normalizedScore);
          return;
        }
      }
    });

    try {
      engine.postMessage(`position fen ${fen}`);
      engine.postMessage(`go movetime ${REVIEW_EVAL_TIME_MS}`);
    } catch (err) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        removeListener();
        reject(err);
      }
    }
  });
}

async function createReviewEngine(): Promise<StockfishEngine> {
  const engine = new StockfishEngine({
    name: 'Review Engine',
    initTimeoutMs: 15000,
    operationTimeoutMs: REVIEW_EVAL_TIMEOUT_MS,
  });
  await engine.init();
  if (DEBUG) console.warn('[Review] Engine initialized');
  return engine;
}

async function syncEngine(engine: StockfishEngine): Promise<void> {
  engine.postMessage('stop');
  await engine.waitForReady();
}

export function startGameReview(config: GameReviewConfig): ReviewHandle {
  let aborted = false;
  let reviewEngine: StockfishEngine | null = null;
  const startingFen = config.startingFen ?? INITIAL_FEN;

  const chess = new Chess(startingFen);
  const fenPositions: string[] = [chess.fen()];

  for (const san of config.moves) {
    const result = chess.move(san);
    if (!result) {
      if (DEBUG) console.error('[Review] Invalid move in history:', san);
      config.onComplete(computeSummary([], []));
      return { abort: () => {} };
    }
    fenPositions.push(chess.fen());
  }

  const totalMoves = config.moves.length;
  if (DEBUG) console.warn(`[Review] Starting review of ${totalMoves} moves`);

  if (totalMoves === 0) {
    const summary = computeSummary([], []);
    config.onComplete(summary);
    return { abort: () => {} };
  }

  const run = async () => {
    try {
      reviewEngine = await createReviewEngine();
    } catch (err) {
      if (DEBUG) console.error('[Review] Failed to init engine:', err);
      reviewEngine = null;
      config.onComplete(computeSummary([], []));
      return;
    }

    const evalCache = new Map<string, number>();
    const allEvaluations: MoveEvaluation[] = [];
    const allEvalHistory: EvalPoint[] = [];
    let consecutiveFailures = 0;

    const getEval = async (fen: string, label: string): Promise<number | null> => {
      if (evalCache.has(fen)) {
        if (DEBUG) console.warn(`[Review] ${label}: cached = ${evalCache.get(fen)}`);
        return evalCache.get(fen)!;
      }
      if (!reviewEngine || aborted) return null;

      try {
        await syncEngine(reviewEngine);
        const score = await evaluatePosition(reviewEngine, fen);
        evalCache.set(fen, score);
        consecutiveFailures = 0;
        if (DEBUG) console.warn(`[Review] ${label}: score = ${score}`);
        return score;
      } catch (err) {
        consecutiveFailures++;
        if (DEBUG) console.warn(`[Review] ${label} failed (${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}):`, err);

        if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          if (DEBUG) console.warn('[Review] Too many failures, reinitializing engine...');
          reviewEngine.terminate();
          try {
            reviewEngine = await createReviewEngine();
            consecutiveFailures = 0;
            await syncEngine(reviewEngine);
            const score = await evaluatePosition(reviewEngine, fen);
            evalCache.set(fen, score);
            if (DEBUG) console.warn(`[Review] ${label}: score after reinit = ${score}`);
            return score;
          } catch (reinitErr) {
            if (DEBUG) console.error('[Review] Engine reinit failed:', reinitErr);
            reviewEngine = null;
            return null;
          }
        }

        return null;
      }
    };

    for (let i = 0; i < totalMoves; i++) {
      if (aborted || !reviewEngine) break;

      try {
        const side: Side = i % 2 === 0 ? 'w' : 'b';
        const isPlayerMove = side === config.playerColor;
        const san = config.moves[i];

        if (DEBUG) console.warn(`[Review] Evaluating move ${i + 1}/${totalMoves}: ${san} (${side})`);

        const evalBefore = await getEval(fenPositions[i], `move ${i + 1} before`);
        if (aborted) break;
        const evalAfter = await getEval(fenPositions[i + 1], `move ${i + 1} after`);
        if (aborted) break;

        let cpLoss: number | null = null;
        let quality: MoveQuality | null = null;

        if (evalBefore !== null && evalAfter !== null) {
          if (side === 'w') {
            cpLoss = Math.round((evalBefore - evalAfter) * 100);
          } else {
            cpLoss = Math.round((evalAfter - evalBefore) * 100);
          }
          cpLoss = Math.max(0, cpLoss);
          quality = classifyMoveQuality(cpLoss);
        }

        const evaluation: MoveEvaluation = {
          moveIndex: i,
          san,
          evalBefore,
          evalAfter,
          cpLoss,
          quality,
          isPlayerMove,
          side,
          moveTimeMs: config.moveTimesMs?.[i],
        };

        allEvaluations.push(evaluation);
        allEvalHistory.push({
          moveIndex: i,
          evalAfter,
          san,
          side,
          quality,
          moveTimeMs: config.moveTimesMs?.[i],
        });

        try {
          config.onMoveEvaluated(evaluation);
        } catch (cbErr) {
          if (DEBUG) console.warn('[Review] onMoveEvaluated callback error:', cbErr);
        }
        try {
          config.onProgress({
            currentMove: i + 1,
            totalMoves,
            percentComplete: Math.round(((i + 1) / totalMoves) * 100),
          });
        } catch (cbErr) {
          if (DEBUG) console.warn('[Review] onProgress callback error:', cbErr);
        }
      } catch (err) {
        if (DEBUG) console.warn(`[Review] Failed to evaluate move ${i}:`, err);
        try {
          config.onProgress({
            currentMove: i + 1,
            totalMoves,
            percentComplete: Math.round(((i + 1) / totalMoves) * 100),
          });
        } catch {
          // UI callback error, non-fatal
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    if (!aborted) {
      if (DEBUG) console.warn('[Review] Analysis complete');
      const summary = computeSummary(allEvaluations, allEvalHistory);
      try {
        config.onComplete(summary);
      } catch (cbErr) {
        if (DEBUG) console.warn('[Review] onComplete callback error:', cbErr);
      }
    }

    reviewEngine?.terminate();
    reviewEngine = null;
  };

  run();

  return {
    abort: () => {
      if (DEBUG) console.warn('[Review] Aborting review');
      aborted = true;
      reviewEngine?.terminate();
      reviewEngine = null;
    },
  };
}
