// Sync types
export type {
  ConnectionState,
  OutboundMessage,
  InboundMessage,
  GameMoveMessage,
  GameResignMessage,
  GameJoinMessage,
  GameCreateMessage,
  PingMessage,
  GameStateMessage,
  MoveAcceptedMessage,
  MoveRejectedMessage,
  OpponentMoveMessage,
  GameEndedMessage,
  GameCreatedMessage,
  GameJoinedMessage,
  PongMessage,
  ErrorMessage,
  PendingCommand,
  SyncEventType,
  SyncEvent,
  SyncEventHandler,
  SyncServiceConfig,
} from './types';

// Sync service
export { GameSyncService, gameSyncService } from './GameSyncService';

// Sync hook
export { createGameSync, createGameSyncWithService } from './useGameSync';
export type { GameSyncHookConfig, GameSyncResult } from './useGameSync';
