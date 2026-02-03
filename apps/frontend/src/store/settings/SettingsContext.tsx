import { createContext, useContext, type JSX } from 'solid-js';
import { createStore } from 'solid-js/store';
import { audioService } from '../../services/audio/AudioService';
import { settings, type AppSettings } from '../../services/settings/SettingsService';

interface SettingsActions {
  toggleTheme: () => void;
  toggleSound: () => void;
}

type SettingsContextValue = [AppSettings, SettingsActions];

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider = (props: { children: JSX.Element }) => {
  const initial = settings.get();
  const [state, setState] = createStore<AppSettings>(initial);

  audioService.setEnabled(initial.soundEnabled);

  const actions: SettingsActions = {
    toggleTheme() {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      setState('theme', next);
      settings.set({ theme: next });

      if (next === 'light') {
        document.body.setAttribute('data-theme', 'light');
      } else {
        document.body.removeAttribute('data-theme');
      }

      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', next === 'light' ? '#e8e1d6' : '#0a0a0a');
      }
    },
    toggleSound() {
      const next = !state.soundEnabled;
      setState('soundEnabled', next);
      settings.set({ soundEnabled: next });
      audioService.setEnabled(next);
    },
  };

  if (initial.theme === 'light') {
    document.body.setAttribute('data-theme', 'light');
  }

  return (
    <SettingsContext.Provider value={[state, actions]}>{props.children}</SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within <SettingsProvider>');
  }
  return ctx;
};
