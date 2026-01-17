import { createEffect, onCleanup, createSignal, Accessor } from 'solid-js';
import { gamePersistence } from './GamePersistence';
import { GameSession } from '../game/session/GameSession';

// ============================================================================
// Types
// ============================================================================

export interface AutoPersistConfig {
  /** Interval for periodic saves (in ms). Default: 5000 */
  saveInterval: number;
  /** Debounce time for state change saves (in ms). Default: 1000 */
  debounceMs: number;
  /** Whether auto-persist is enabled. Default: true */
  enabled: boolean;
}

export interface AutoPersistResult {
  /** Whether the persistence system is enabled */
  isEnabled: Accessor<boolean>;
  /** Force a save immediately */
  saveNow: () => Promise<void>;
  /** Enable/disable auto-persist */
  setEnabled: (enabled: boolean) => void;
  /** Last save timestamp */
  lastSaved: Accessor<number | null>;
  /** Any error from the last save attempt */
  lastError: Accessor<Error | null>;
}

// ============================================================================
// Default Config
// ============================================================================

const DEFAULT_CONFIG: AutoPersistConfig = {
  saveInterval: 5000,
  debounceMs: 1000,
  enabled: true,
};

// ============================================================================
// useAutoPersist Hook
// ============================================================================

export function createAutoPersist(
  getSession: () => GameSession | null,
  config: Partial<AutoPersistConfig> = {}
): AutoPersistResult {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  const [isEnabled, setEnabled] = createSignal(mergedConfig.enabled);
  const [lastSaved, setLastSaved] = createSignal<number | null>(null);
  const [lastError, setLastError] = createSignal<Error | null>(null);

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
  let lastSavedState: string | null = null;

  const saveNow = async (): Promise<void> => {
    const session = getSession();
    if (!session) return;

    try {
      // Check if state has actually changed
      const currentState = JSON.stringify(session.currentState);
      if (currentState === lastSavedState) {
        return; // No changes to save
      }

      await gamePersistence.saveSession(session);
      lastSavedState = currentState;
      setLastSaved(Date.now());
      setLastError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown save error');
      setLastError(error);
      console.error('Auto-persist save failed:', error);
    }
  };

  const debouncedSave = () => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(() => {
      saveNow();
      debounceTimeout = null;
    }, mergedConfig.debounceMs);
  };

  // Start periodic saves when enabled
  createEffect(() => {
    if (isEnabled()) {
      // Set up periodic save interval
      intervalId = setInterval(() => {
        saveNow();
      }, mergedConfig.saveInterval);
    } else {
      // Clear interval when disabled
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  });

  // Save on state changes (via effect on session state)
  createEffect(() => {
    const session = getSession();
    if (!session || !isEnabled()) return;

    // Access state to track reactively (void prevents unused warning)
    void session.currentState;

    // Debounced save on state change
    debouncedSave();
  });

  // Cleanup on unmount
  onCleanup(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Final save on unmount
    const session = getSession();
    if (session && isEnabled()) {
      gamePersistence.saveSession(session).catch((err) => {
        console.error('Failed to save session on cleanup:', err);
      });
    }
  });

  return {
    isEnabled,
    saveNow,
    setEnabled,
    lastSaved,
    lastError,
  };
}

// ============================================================================
// Session Recovery Helper
// ============================================================================

export interface SessionRecoveryResult {
  session: GameSession | null;
  wasRecovered: boolean;
}

/**
 * Attempt to recover the most recent in-progress session from persistence.
 */
export async function recoverActiveSession(): Promise<SessionRecoveryResult> {
  try {
    const sessionId = await gamePersistence.getActiveSessionId();
    if (!sessionId) {
      return { session: null, wasRecovered: false };
    }

    const session = await gamePersistence.loadSession(sessionId);
    return {
      session,
      wasRecovered: session !== null,
    };
  } catch (err) {
    console.error('Failed to recover session:', err);
    return { session: null, wasRecovered: false };
  }
}

/**
 * Load a specific session from persistence by ID.
 */
export async function loadPersistedSession(sessionId: string): Promise<GameSession | null> {
  try {
    return await gamePersistence.loadSession(sessionId);
  } catch (err) {
    console.error('Failed to load persisted session:', err);
    return null;
  }
}

/**
 * Delete old sessions from persistence.
 * @param maxAgeMs Maximum age in milliseconds (default: 7 days)
 */
export async function cleanupOldSessions(
  maxAgeMs: number = 7 * 24 * 60 * 60 * 1000
): Promise<number> {
  try {
    return await gamePersistence.clearOldSessions(maxAgeMs);
  } catch (err) {
    console.error('Failed to cleanup old sessions:', err);
    return 0;
  }
}
