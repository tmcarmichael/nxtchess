import type { Side } from './game';
import type { MoveEvaluation, MoveQuality } from './moveQuality';

export type ReviewPhase = 'idle' | 'analyzing' | 'complete';

export interface ReviewProgress {
  currentMove: number;
  totalMoves: number;
  percentComplete: number;
}

export interface EvalPoint {
  moveIndex: number;
  evalAfter: number | null;
  san: string;
  side: Side;
  quality: MoveQuality | null;
  moveTimeMs?: number;
}

export type QualityDistribution = Record<MoveQuality, number>;

export interface ReviewSummary {
  whiteAccuracy: number;
  blackAccuracy: number;
  evaluations: MoveEvaluation[];
  evalHistory: EvalPoint[];
  qualityDistribution: {
    white: QualityDistribution;
    black: QualityDistribution;
  };
}

export interface ReviewHandle {
  abort: () => void;
}
