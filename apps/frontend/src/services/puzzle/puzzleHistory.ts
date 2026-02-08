import type { PuzzleCategory } from '../../types/game';

export interface PuzzleAttempt {
  puzzleId: string;
  category: Exclude<PuzzleCategory, 'random'>;
  fen: string;
  result: 'pass' | 'fail';
  timestamp: number;
}

const STORAGE_KEY = 'nxtchess:puzzle-history';
const MAX_ENTRIES = 20;

export const puzzleHistory = {
  get(): PuzzleAttempt[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed.slice(0, MAX_ENTRIES);
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
