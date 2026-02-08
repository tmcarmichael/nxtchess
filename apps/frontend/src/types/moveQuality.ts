import type { Side } from './game';

/**
 * Move quality classification based on centipawn loss
 */
export type MoveQuality = 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

/**
 * Evaluation data for a single move
 */
export interface MoveEvaluation {
  moveIndex: number;
  san: string;
  evalBefore: number | null;
  evalAfter: number | null;
  cpLoss: number | null;
  quality: MoveQuality | null;
  isPlayerMove: boolean;
  side: Side;
  moveTimeMs?: number;
}

/**
 * Thresholds for move quality classification (in centipawns)
 * - Best: cpLoss = 0
 * - Excellent: cpLoss 1-20
 * - Good: cpLoss 21-50
 * - Inaccuracy: cpLoss 51-100
 * - Mistake: cpLoss 101-200
 * - Blunder: cpLoss > 200
 */
export const QUALITY_THRESHOLDS = {
  excellent: 20,
  good: 50,
  inaccuracy: 100,
  mistake: 200,
} as const;

/**
 * Border colors for each quality level
 */
export const QUALITY_COLORS: Record<MoveQuality, string> = {
  best: '#22c55e',
  excellent: '#4ade80',
  good: '#a3e635',
  inaccuracy: '#facc15',
  mistake: '#f97316',
  blunder: '#ef4444',
};

/**
 * Classify move quality based on centipawn loss
 * Returns null if cpLoss is null (evaluation not yet computed)
 */
export function classifyMoveQuality(cpLoss: number | null): MoveQuality | null {
  if (cpLoss === null) return null;

  if (cpLoss <= 0) return 'best';
  if (cpLoss <= QUALITY_THRESHOLDS.excellent) return 'excellent';
  if (cpLoss <= QUALITY_THRESHOLDS.good) return 'good';
  if (cpLoss <= QUALITY_THRESHOLDS.inaccuracy) return 'inaccuracy';
  if (cpLoss <= QUALITY_THRESHOLDS.mistake) return 'mistake';
  return 'blunder';
}
