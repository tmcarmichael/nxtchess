import { GameSession } from '../game/session/GameSession';
import type {
  GameSessionSnapshot,
  GameSessionConfig,
  GameSessionState,
} from '../game/session/types';

export interface PersistedSession {
  sessionId: string;
  config: GameSessionConfig;
  state: GameSessionState;
  savedAt: number;
}

export interface PersistenceConfig {
  dbName: string;
  storeName: string;
  version: number;
}

const DEFAULT_CONFIG: PersistenceConfig = {
  dbName: 'nxtchess',
  storeName: 'game_sessions',
  version: 1,
};

export class GamePersistence {
  private config: PersistenceConfig;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(config: Partial<PersistenceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private async init(): Promise<void> {
    if (this.db) return;

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not available'));
        return;
      }

      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store with sessionId as keyPath
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const store = db.createObjectStore(this.config.storeName, {
            keyPath: 'sessionId',
          });

          // Create index for sorting by savedAt
          store.createIndex('savedAt', 'savedAt', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  private async getStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    await this.init();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction(this.config.storeName, mode);
    return transaction.objectStore(this.config.storeName);
  }

  async saveSession(session: GameSession): Promise<void> {
    const store = await this.getStore('readwrite');
    const snapshot = session.createSnapshot();

    const persistedSession: PersistedSession = {
      sessionId: snapshot.config.sessionId,
      config: snapshot.config,
      state: snapshot.state,
      savedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const request = store.put(persistedSession);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error(`Failed to save session: ${request.error?.message}`));
    });
  }

  async saveSnapshot(snapshot: GameSessionSnapshot): Promise<void> {
    const store = await this.getStore('readwrite');

    const persistedSession: PersistedSession = {
      sessionId: snapshot.config.sessionId,
      config: snapshot.config,
      state: snapshot.state,
      savedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const request = store.put(persistedSession);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error(`Failed to save snapshot: ${request.error?.message}`));
    });
  }

  async loadSession(sessionId: string): Promise<GameSession | null> {
    const store = await this.getStore('readonly');

    return new Promise((resolve, reject) => {
      const request = store.get(sessionId);

      request.onsuccess = () => {
        const result = request.result as PersistedSession | undefined;
        if (!result) {
          resolve(null);
          return;
        }

        const snapshot: GameSessionSnapshot = {
          config: result.config,
          state: result.state,
          createdAt: result.savedAt,
          updatedAt: result.savedAt,
        };

        const session = GameSession.fromSnapshot(snapshot);
        resolve(session);
      };

      request.onerror = () => {
        reject(new Error(`Failed to load session: ${request.error?.message}`));
      };
    });
  }

  async loadSnapshot(sessionId: string): Promise<GameSessionSnapshot | null> {
    const store = await this.getStore('readonly');

    return new Promise((resolve, reject) => {
      const request = store.get(sessionId);

      request.onsuccess = () => {
        const result = request.result as PersistedSession | undefined;
        if (!result) {
          resolve(null);
          return;
        }

        resolve({
          config: result.config,
          state: result.state,
          createdAt: result.savedAt,
          updatedAt: result.savedAt,
        });
      };

      request.onerror = () => {
        reject(new Error(`Failed to load snapshot: ${request.error?.message}`));
      };
    });
  }

  async deleteSession(sessionId: string): Promise<void> {
    const store = await this.getStore('readwrite');

    return new Promise((resolve, reject) => {
      const request = store.delete(sessionId);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error(`Failed to delete session: ${request.error?.message}`));
    });
  }

  async getActiveSessionId(): Promise<string | null> {
    const sessions = await this.getInProgressSessions();

    if (sessions.length === 0) {
      return null;
    }

    // Sort by savedAt descending and return most recent
    sessions.sort((a, b) => b.savedAt - a.savedAt);
    return sessions[0].sessionId;
  }

  async getInProgressSessions(): Promise<PersistedSession[]> {
    const store = await this.getStore('readonly');

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as PersistedSession[];
        // Filter for sessions that are not game over
        const inProgress = results.filter((session) => !session.state.isGameOver);
        resolve(inProgress);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get sessions: ${request.error?.message}`));
      };
    });
  }

  async getAllSessions(): Promise<PersistedSession[]> {
    const store = await this.getStore('readonly');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as PersistedSession[]);
      request.onerror = () =>
        reject(new Error(`Failed to get all sessions: ${request.error?.message}`));
    });
  }

  async getRecentSessions(limit: number = 10): Promise<PersistedSession[]> {
    const store = await this.getStore('readonly');
    const index = store.index('savedAt');

    return new Promise((resolve, reject) => {
      const results: PersistedSession[] = [];
      const request = index.openCursor(null, 'prev'); // Descending order

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value as PersistedSession);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to get recent sessions: ${request.error?.message}`));
      };
    });
  }

  async clearOldSessions(maxAgeMs: number): Promise<number> {
    const store = await this.getStore('readwrite');
    const cutoffTime = Date.now() - maxAgeMs;

    return new Promise((resolve, reject) => {
      let deletedCount = 0;
      const request = store.openCursor();

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const session = cursor.value as PersistedSession;
          if (session.savedAt < cutoffTime) {
            cursor.delete();
            deletedCount++;
          }
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to clear old sessions: ${request.error?.message}`));
      };
    });
  }

  async clearAllSessions(): Promise<void> {
    const store = await this.getStore('readwrite');

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error(`Failed to clear sessions: ${request.error?.message}`));
    });
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }

  async deleteDatabase(): Promise<void> {
    this.close();

    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.config.dbName);
      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new Error(`Failed to delete database: ${request.error?.message}`));
    });
  }
}

export const gamePersistence = new GamePersistence();
