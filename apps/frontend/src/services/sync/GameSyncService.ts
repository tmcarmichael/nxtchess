import { BACKEND_URL } from '../../shared/config/env';
import { ReconnectingWebSocket, type ConnectionState } from '../network/ReconnectingWebSocket';
import { MsgType as MT } from './types';
import type {
  SyncEvent,
  SyncEventHandler,
  SyncServiceConfig,
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
  TimeControl,
} from './types';

// Re-export ConnectionState for backward compatibility
export type { ConnectionState } from '../network/ReconnectingWebSocket';

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: SyncServiceConfig = {
  serverUrl: '',
  reconnectAttempts: 5,
  reconnectDelayMs: 1000,
  pingIntervalMs: 30000,
};

// ============================================================================
// Build WebSocket URL from backend URL
// ============================================================================

function buildWsUrl(backendUrl: string): string {
  if (!backendUrl) return '';
  const url = new URL(backendUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/ws';
  return url.toString();
}

// ============================================================================
// GameSyncService Class
// ============================================================================

export class GameSyncService {
  private config: SyncServiceConfig;
  private socket: ReconnectingWebSocket;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  // Current game ID
  private currentGameId: string | null = null;

  // Message queue for messages sent before connection is ready
  private messageQueue: { type: string; data?: unknown }[] = [];

  // Event handlers
  private eventHandlers: Set<SyncEventHandler> = new Set();

  constructor(config: Partial<SyncServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Auto-set server URL from env if not provided
    if (!this.config.serverUrl && BACKEND_URL) {
      this.config.serverUrl = buildWsUrl(BACKEND_URL);
    }

    // Initialize the reconnecting WebSocket
    this.socket = new ReconnectingWebSocket(this.config.serverUrl, {
      maxAttempts: this.config.reconnectAttempts,
      baseDelayMs: this.config.reconnectDelayMs,
    });

    // Set up socket callbacks
    this.socket.setCallbacks({
      onStateChange: (state, previousState) => this.handleStateChange(state, previousState),
      onMessage: (data) => this.processMessage(data as ServerMessage),
      onError: () => {
        this.emitEvent({
          type: 'error',
          data: { code: 'WS_ERROR', message: 'WebSocket error' },
          timestamp: Date.now(),
        });
      },
    });
  }

  // ============================================================================
  // Connection Management
  // ============================================================================

  connect(serverUrl?: string): void {
    if (serverUrl) {
      this.config.serverUrl = serverUrl;
      this.socket.setUrl(serverUrl);
    }

    if (!this.config.serverUrl) {
      console.error('GameSyncService: No server URL configured');
      return;
    }

    this.socket.connect();
  }

  disconnect(): void {
    this.stopPing();
    this.socket.disconnect();
    this.currentGameId = null;
    this.messageQueue = [];
  }

  getConnectionState(): ConnectionState {
    return this.socket.getState();
  }

  isConnected(): boolean {
    return this.socket.isConnected();
  }

  getCurrentGameId(): string | null {
    return this.currentGameId;
  }

  // ============================================================================
  // Game Actions
  // ============================================================================

  createGame(timeControl?: TimeControl): void {
    this.send({
      type: MT.GAME_CREATE,
      data: timeControl ? { timeControl } : undefined,
    });
  }

  joinGame(gameId: string): void {
    this.send({
      type: MT.GAME_JOIN,
      data: { gameId },
    });
  }

  leaveGame(gameId: string): void {
    this.send({
      type: MT.GAME_LEAVE,
      data: { gameId },
    });
    if (this.currentGameId === gameId) {
      this.currentGameId = null;
    }
  }

  sendMove(gameId: string, from: string, to: string, promotion?: string): void {
    this.send({
      type: MT.MOVE,
      data: { gameId, from, to, promotion },
    });
  }

  resign(gameId: string): void {
    this.send({
      type: MT.RESIGN,
      data: { gameId },
    });
  }

  // ============================================================================
  // Event Subscription
  // ============================================================================

  onEvent(handler: SyncEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  // ============================================================================
  // Private Methods - State Change Handler
  // ============================================================================

  private handleStateChange(state: ConnectionState, previousState: ConnectionState): void {
    // Emit connection state change event
    this.emitEvent({
      type: 'connection:state_changed',
      data: { previousState, currentState: state },
      timestamp: Date.now(),
    });

    if (state === 'connected') {
      this.startPing();
      this.flushMessageQueue();
    } else {
      this.stopPing();
    }
  }

  // ============================================================================
  // Private Methods - Message Processing
  // ============================================================================

  private processMessage(message: ServerMessage): void {
    const { type, data } = message;

    switch (type) {
      case MT.PONG:
        // Heartbeat response - no action needed
        break;

      case MT.GAME_CREATED: {
        const payload = data as GameCreatedData;
        this.currentGameId = payload.gameId;
        this.emitEvent({
          type: 'game:created',
          data: payload,
          timestamp: Date.now(),
        });
        break;
      }

      case MT.GAME_JOINED: {
        const payload = data as GameJoinedData;
        this.currentGameId = payload.gameId;
        this.emitEvent({
          type: 'game:joined',
          data: payload,
          timestamp: Date.now(),
        });
        break;
      }

      case MT.GAME_STARTED: {
        const payload = data as GameStartedData;
        this.currentGameId = payload.gameId;
        this.emitEvent({
          type: 'game:started',
          data: payload,
          timestamp: Date.now(),
        });
        break;
      }

      case MT.GAME_NOT_FOUND:
        this.emitEvent({
          type: 'game:not_found',
          data,
          timestamp: Date.now(),
        });
        break;

      case MT.GAME_FULL:
        this.emitEvent({
          type: 'game:full',
          data,
          timestamp: Date.now(),
        });
        break;

      case MT.GAME_ENDED: {
        const payload = data as GameEndedData;
        this.emitEvent({
          type: 'game:ended',
          data: payload,
          timestamp: Date.now(),
        });
        this.currentGameId = null;
        break;
      }

      case MT.MOVE_ACCEPTED: {
        const payload = data as MoveAcceptedData;
        this.emitEvent({
          type: 'game:move_accepted',
          data: payload,
          timestamp: Date.now(),
        });
        break;
      }

      case MT.MOVE_REJECTED: {
        const payload = data as MoveRejectedData;
        this.emitEvent({
          type: 'game:move_rejected',
          data: payload,
          timestamp: Date.now(),
        });
        break;
      }

      case MT.OPPONENT_MOVE: {
        const payload = data as OpponentMoveData;
        this.emitEvent({
          type: 'game:opponent_move',
          data: payload,
          timestamp: Date.now(),
        });
        break;
      }

      case MT.OPPONENT_LEFT: {
        const payload = data as OpponentLeftData;
        this.emitEvent({
          type: 'game:opponent_left',
          data: payload,
          timestamp: Date.now(),
        });
        break;
      }

      case MT.TIME_UPDATE: {
        const payload = data as TimeUpdateData;
        this.emitEvent({
          type: 'game:time_update',
          data: payload,
          timestamp: Date.now(),
        });
        break;
      }

      case MT.ERROR: {
        const payload = data as ErrorData;
        this.emitEvent({
          type: 'error',
          data: payload,
          timestamp: Date.now(),
        });
        break;
      }

      default:
        console.warn('GameSyncService: Unknown message type:', type);
    }
  }

  // ============================================================================
  // Private Methods - Message Sending
  // ============================================================================

  private send(message: { type: string; data?: unknown }): void {
    const sent = this.socket.send(message);

    if (!sent) {
      const state = this.socket.getState();
      if (state === 'connecting' || state === 'reconnecting') {
        // Queue message to be sent when connection opens
        this.messageQueue.push(message);
      }
      // If disconnected, message is dropped (caller should check connection state)
    }
  }

  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    for (const message of this.messageQueue) {
      this.socket.send(message);
    }
    this.messageQueue = [];
  }

  // ============================================================================
  // Private Methods - Ping/Pong Heartbeat
  // ============================================================================

  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      this.socket.send({ type: MT.PING });
    }, this.config.pingIntervalMs);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // ============================================================================
  // Private Methods - Event Emission
  // ============================================================================

  private emitEvent(event: SyncEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event);
      } catch (err) {
        console.error('GameSyncService: Event handler error:', err);
      }
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const gameSyncService = new GameSyncService();
