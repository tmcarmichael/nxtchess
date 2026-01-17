import type { Square, PromotionPiece, Side } from '../../types';
import type { GameSessionState, GameCommand } from '../game/session/types';

// ============================================================================
// Connection State
// ============================================================================

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

// ============================================================================
// Outbound Messages (Client → Server)
// ============================================================================

export interface GameMoveMessage {
  type: 'GAME:MOVE';
  payload: {
    gameId: string;
    commandId: string;
    from: Square;
    to: Square;
    promotion?: PromotionPiece;
    timestamp: number;
  };
}

export interface GameResignMessage {
  type: 'GAME:RESIGN';
  payload: {
    gameId: string;
    resigningSide: Side;
  };
}

export interface GameJoinMessage {
  type: 'GAME:JOIN';
  payload: {
    gameId: string;
    userId?: string;
  };
}

export interface GameCreateMessage {
  type: 'GAME:CREATE';
  payload: {
    timeControl: number;
    increment?: number;
    playerColor?: Side;
  };
}

export interface PingMessage {
  type: 'PING';
  payload: {
    timestamp: number;
  };
}

export type OutboundMessage =
  | GameMoveMessage
  | GameResignMessage
  | GameJoinMessage
  | GameCreateMessage
  | PingMessage;

// ============================================================================
// Inbound Messages (Server → Client)
// ============================================================================

export interface GameStateMessage {
  type: 'GAME:STATE';
  payload: {
    gameId: string;
    state: Partial<GameSessionState>;
  };
}

export interface MoveAcceptedMessage {
  type: 'GAME:MOVE_ACCEPTED';
  payload: {
    gameId: string;
    commandId: string;
    serverTimestamp: number;
  };
}

export interface MoveRejectedMessage {
  type: 'GAME:MOVE_REJECTED';
  payload: {
    gameId: string;
    commandId: string;
    reason: string;
    correctState: Partial<GameSessionState>;
  };
}

export interface OpponentMoveMessage {
  type: 'GAME:OPPONENT_MOVE';
  payload: {
    gameId: string;
    from: Square;
    to: Square;
    promotion?: PromotionPiece;
    newFen: string;
    serverTimestamp: number;
  };
}

export interface GameEndedMessage {
  type: 'GAME:ENDED';
  payload: {
    gameId: string;
    reason: string;
    winner: Side | 'draw' | null;
    finalState: Partial<GameSessionState>;
  };
}

export interface GameCreatedMessage {
  type: 'GAME:CREATED';
  payload: {
    gameId: string;
    playerColor: Side;
    opponentId?: string;
    opponentUsername?: string;
  };
}

export interface GameJoinedMessage {
  type: 'GAME:JOINED';
  payload: {
    gameId: string;
    playerColor: Side;
    opponentId?: string;
    opponentUsername?: string;
    state: Partial<GameSessionState>;
  };
}

export interface PongMessage {
  type: 'PONG';
  payload: {
    timestamp: number;
    serverTimestamp: number;
  };
}

export interface ErrorMessage {
  type: 'ERROR';
  payload: {
    code: string;
    message: string;
    gameId?: string;
  };
}

export type InboundMessage =
  | GameStateMessage
  | MoveAcceptedMessage
  | MoveRejectedMessage
  | OpponentMoveMessage
  | GameEndedMessage
  | GameCreatedMessage
  | GameJoinedMessage
  | PongMessage
  | ErrorMessage;

// ============================================================================
// Pending Command Tracking (for optimistic updates)
// ============================================================================

export interface PendingCommand {
  id: string;
  gameId: string;
  command: GameCommand;
  optimisticState: GameSessionState;
  sentAt: number;
  retryCount: number;
}

// ============================================================================
// Sync Service Events
// ============================================================================

export type SyncEventType =
  | 'connection:state_changed'
  | 'game:move_accepted'
  | 'game:move_rejected'
  | 'game:opponent_move'
  | 'game:state_sync'
  | 'game:ended'
  | 'game:created'
  | 'game:joined'
  | 'error';

export interface SyncEvent {
  type: SyncEventType;
  data: unknown;
  timestamp: number;
}

export type SyncEventHandler = (event: SyncEvent) => void;

// ============================================================================
// Sync Service Configuration
// ============================================================================

export interface SyncServiceConfig {
  serverUrl: string;
  reconnectAttempts: number;
  reconnectDelayMs: number;
  pingIntervalMs: number;
  commandTimeoutMs: number;
}
