import type { Side, PuzzleCategory } from '../../types/game';

export interface PuzzleAttempt {
  puzzleId: string;
  category: Exclude<PuzzleCategory, 'random'>;
  fen: string;
  playerSide: Side;
  result: 'pass' | 'fail';
  rated: boolean;
  timestamp: number;
}

const MAX_ENTRIES = 20;

let sessionHistory: PuzzleAttempt[] = [];
const sessionSolved: { rated: Set<string>; casual: Set<string> } = {
  rated: new Set(),
  casual: new Set(),
};

export const puzzleHistory = {
  get(filterRated?: boolean): PuzzleAttempt[] {
    const all = sessionHistory.slice(0, MAX_ENTRIES);
    if (filterRated === undefined) return all;
    return all.filter((a) => (a.rated ?? false) === filterRated);
  },

  record(attempt: PuzzleAttempt): void {
    sessionHistory.unshift(attempt);
    if (sessionHistory.length > MAX_ENTRIES) {
      sessionHistory = sessionHistory.slice(0, MAX_ENTRIES);
    }
  },
};

export const solvedPuzzleTracker = {
  getSolvedIds(rated: boolean): Set<string> {
    return rated ? sessionSolved.rated : sessionSolved.casual;
  },

  markSolved(puzzleId: string, rated: boolean): void {
    if (rated) {
      sessionSolved.rated.add(puzzleId);
    } else {
      sessionSolved.casual.add(puzzleId);
    }
  },
};
