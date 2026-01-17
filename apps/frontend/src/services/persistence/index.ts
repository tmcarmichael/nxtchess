// Persistence service
export { GamePersistence, gamePersistence } from './GamePersistence';
export type { PersistedSession, PersistenceConfig } from './GamePersistence';

// Auto-persist hook
export {
  createAutoPersist,
  recoverActiveSession,
  loadPersistedSession,
  cleanupOldSessions,
} from './useAutoPersist';
export type { AutoPersistConfig, AutoPersistResult, SessionRecoveryResult } from './useAutoPersist';
