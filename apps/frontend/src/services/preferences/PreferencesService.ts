import type { Side } from '../../types/game';

const STORAGE_KEY = 'nxtchess:prefs';

export interface GamePreferences {
  lastTimeMinutes: number;
  lastDifficultyLevel: number;
  lastPlayerColor: Side;
  boardFlipped: boolean;
}

const DEFAULT_PREFERENCES: GamePreferences = {
  lastTimeMinutes: 5,
  lastDifficultyLevel: 4, // Medium
  lastPlayerColor: 'w',
  boardFlipped: false,
};

export const preferences = {
  get(): GamePreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return { ...DEFAULT_PREFERENCES };
      const parsed = JSON.parse(stored);

      // Validate Side type
      if (
        parsed.lastPlayerColor &&
        parsed.lastPlayerColor !== 'w' &&
        parsed.lastPlayerColor !== 'b'
      ) {
        parsed.lastPlayerColor = DEFAULT_PREFERENCES.lastPlayerColor;
      }

      return { ...DEFAULT_PREFERENCES, ...parsed };
    } catch {
      return { ...DEFAULT_PREFERENCES };
    }
  },

  set(prefs: Partial<GamePreferences>): void {
    try {
      const current = this.get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...prefs }));
    } catch {
      // localStorage unavailable, silently fail
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable, silently fail
    }
  },
};
