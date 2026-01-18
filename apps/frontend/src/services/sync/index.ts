// Sync types
export type {
  ConnectionState,
  PlayerInfo,
  TimeControl,
  ClientMessage,
  GameCreateData,
  GameJoinData,
  MoveData,
  ResignData,
  ServerMessage,
  GameCreatedData,
  GameJoinedData,
  GameStartedData,
  MoveAcceptedData,
  MoveRejectedData,
  OpponentMoveData,
  GameEndedData,
  TimeUpdateData,
  OpponentLeftData,
  ErrorData,
  SyncEventType,
  SyncEvent,
  SyncEventHandler,
  SyncServiceConfig,
} from './types';

export { MsgType } from './types';

// Sync service
export { GameSyncService, gameSyncService } from './GameSyncService';

// Sync hook
export { useGameSync } from './useGameSync';
export type { UseGameSyncResult } from './useGameSync';
