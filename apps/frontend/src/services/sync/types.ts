export type { ConnectionState } from '../network/ReconnectingWebSocket';

export interface PlayerInfo {
  id: string;
  username?: string;
  rating?: number;
}

export interface TimeControl {
  initialTime: number; // seconds
  increment: number; // seconds per move
}

export interface ClientMessage {
  type: string;
  data?: unknown;
}

export interface GameCreateData {
  timeControl?: TimeControl;
}

export interface GameJoinData {
  gameId: string;
}

export interface MoveData {
  gameId: string;
  from: string;
  to: string;
  promotion?: string; // "q", "r", "b", "n"
}

export interface ResignData {
  gameId: string;
}

export interface GameCreatedData {
  gameId: string;
  color: 'white' | 'black';
}

export interface GameJoinedData {
  gameId: string;
  color: 'white' | 'black';
  opponent?: string;
}

export interface GameStartedData {
  gameId: string;
  fen: string;
  whitePlayer: PlayerInfo;
  blackPlayer: PlayerInfo;
  timeControl?: TimeControl;
  whiteTimeMs: number;
  blackTimeMs: number;
}

export interface MoveAcceptedData {
  gameId: string;
  from: string;
  to: string;
  san: string;
  fen: string;
  moveNum: number;
  isCheck?: boolean;
  whiteTimeMs?: number;
  blackTimeMs?: number;
}

export interface MoveRejectedData {
  gameId: string;
  reason: string;
  fen: string;
  moveNum: number;
}

export interface OpponentMoveData {
  gameId: string;
  from: string;
  to: string;
  promotion?: string;
  san: string;
  fen: string;
  moveNum: number;
  isCheck?: boolean;
  whiteTimeMs?: number;
  blackTimeMs?: number;
}

export interface GameEndedData {
  gameId: string;
  result: 'white' | 'black' | 'draw';
  reason: 'checkmate' | 'resignation' | 'timeout' | 'stalemate' | 'agreement';
  whiteRating?: number;
  blackRating?: number;
  whiteRatingDelta?: number;
  blackRatingDelta?: number;
}

export interface TimeUpdateData {
  gameId: string;
  whiteTime: number; // milliseconds
  blackTime: number; // milliseconds
}

export interface OpponentLeftData {
  gameId: string;
}

export interface ErrorData {
  code: string;
  message: string;
}

export interface ServerMessage {
  type: string;
  data?: unknown;
}

// Message type constants (matching backend)
export const MsgType = {
  // Client → Server
  PING: 'PING',
  GAME_CREATE: 'GAME_CREATE',
  GAME_JOIN: 'GAME_JOIN',
  GAME_LEAVE: 'GAME_LEAVE',
  MOVE: 'MOVE',
  RESIGN: 'RESIGN',

  // Server → Client
  PONG: 'PONG',
  ERROR: 'ERROR',
  GAME_CREATED: 'GAME_CREATED',
  GAME_JOINED: 'GAME_JOINED',
  GAME_STARTED: 'GAME_STARTED',
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  GAME_FULL: 'GAME_FULL',
  GAME_ENDED: 'GAME_ENDED',
  MOVE_ACCEPTED: 'MOVE_ACCEPTED',
  MOVE_REJECTED: 'MOVE_REJECTED',
  OPPONENT_MOVE: 'OPPONENT_MOVE',
  OPPONENT_LEFT: 'OPPONENT_LEFT',
  TIME_UPDATE: 'TIME_UPDATE',
} as const;

export type SyncEventType =
  | 'connection:state_changed'
  | 'game:created'
  | 'game:joined'
  | 'game:started'
  | 'game:not_found'
  | 'game:full'
  | 'game:ended'
  | 'game:move_accepted'
  | 'game:move_rejected'
  | 'game:opponent_move'
  | 'game:opponent_left'
  | 'game:time_update'
  | 'error';

export interface SyncEvent {
  type: SyncEventType;
  data: unknown;
  timestamp: number;
}

export type SyncEventHandler = (event: SyncEvent) => void;

export interface SyncServiceConfig {
  serverUrl: string;
  reconnectAttempts: number;
  reconnectDelayMs: number;
  pingIntervalMs: number;
}
