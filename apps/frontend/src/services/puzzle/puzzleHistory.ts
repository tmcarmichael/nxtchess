import type { PuzzleCategory } from '../../types/game';

export interface PuzzleAttempt {
  puzzleId: string;
  category: Exclude<PuzzleCategory, 'random'>;
  fen: string;
  result: 'pass' | 'fail';
  rated: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'nxtchess:puzzle-history';
const SOLVED_KEY = 'nxtchess:puzzle-solved';
const MAX_ENTRIES = 20;

export const puzzleHistory = {
  get(filterRated?: boolean): PuzzleAttempt[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      const all = parsed.slice(0, MAX_ENTRIES) as PuzzleAttempt[];
      if (filterRated === undefined) return all;
      return all.filter((a) => (a.rated ?? false) === filterRated);
    } catch {
      return [];
    }
  },

  record(attempt: PuzzleAttempt): void {
    try {
      const history = this.get();
      history.unshift(attempt);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_ENTRIES)));
    } catch {
      // localStorage unavailable
    }
  },
};

const getSolvedSet = (rated: boolean): Set<string> => {
  try {
    const stored = localStorage.getItem(SOLVED_KEY);
    if (!stored) return new Set();
    const parsed = JSON.parse(stored);
    const key = rated ? 'rated' : 'casual';
    if (Array.isArray(parsed[key])) return new Set(parsed[key] as string[]);
    return new Set();
  } catch {
    return new Set();
  }
};

const saveSolvedSet = (rated: boolean, ids: Set<string>): void => {
  try {
    const stored = localStorage.getItem(SOLVED_KEY);
    const data = stored ? JSON.parse(stored) : {};
    const key = rated ? 'rated' : 'casual';
    data[key] = [...ids];
    localStorage.setItem(SOLVED_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable
  }
};

export const solvedPuzzleTracker = {
  getSolvedIds(rated: boolean): Set<string> {
    return getSolvedSet(rated);
  },

  markSolved(puzzleId: string, rated: boolean): void {
    const ids = getSolvedSet(rated);
    ids.add(puzzleId);
    saveSolvedSet(rated, ids);
  },
};
