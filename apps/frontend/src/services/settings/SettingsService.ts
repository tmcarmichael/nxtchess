const STORAGE_KEY = 'nxtchess:settings';

export interface AppSettings {
  theme: 'dark' | 'light';
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  soundEnabled: true,
};

export const settings = {
  get(): AppSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(stored);

      if (parsed.theme !== 'dark' && parsed.theme !== 'light') {
        parsed.theme = DEFAULT_SETTINGS.theme;
      }
      if (typeof parsed.soundEnabled !== 'boolean') {
        parsed.soundEnabled = DEFAULT_SETTINGS.soundEnabled;
      }

      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  set(update: Partial<AppSettings>): void {
    try {
      const current = this.get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...update }));
    } catch {
      // localStorage unavailable
    }
  },
};
