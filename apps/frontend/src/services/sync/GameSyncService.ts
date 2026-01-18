import { BACKEND_URL } from '../../shared/config/env';
import type {
  ConnectionState,
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
  MsgType,
} from './types';
import { MsgType as MT } from './types';

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
  // Convert http(s) to ws(s)
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
  private ws: WebSocket | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private reconnectCount = 0;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

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
  }

  // ============================================================================
  // Connection Management
  // ============================================================================

  connect(serverUrl?: string): void {
    if (serverUrl) {
      this.config.serverUrl = serverUrl;
    }

    if (!this.config.serverUrl) {
      console.error('GameSyncService: No server URL configured');
      return;
    }

    if (this.ws && this.connectionState === 'connected') {
      return;
    }

    this.setConnectionState('connecting');

    try {
      this.ws = new WebSocket(this.config.serverUrl);

      this.ws.onopen = () => this.handleOpen();
      this.ws.onclose = (event) => this.handleClose(event);
      this.ws.onerror = (event) => this.handleError(event);
      this.ws.onmessage = (event) => this.handleMessage(event);
    } catch (err) {
      console.error('GameSyncService: Failed to create WebSocket:', err);
      this.setConnectionState('disconnected');
    }
  }

  disconnect(): void {
    this.stopPing();
    this.clearReconnectTimeout();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setConnectionState('disconnected');
    this.reconnectCount = 0;
    this.currentGameId = null;
    this.messageQueue = [];
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  isConnected(): boolean {
    return this.connectionState === 'connected';
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
  // Private Methods - Connection Handlers
  // ============================================================================

  private handleOpen(): void {
    this.setConnectionState('connected');
    this.reconnectCount = 0;
    this.startPing();
    this.flushMessageQueue();
  }

  private handleClose(event: CloseEvent): void {
    this.stopPing();
    this.ws = null;

    if (event.wasClean) {
      this.setConnectionState('disconnected');
    } else {
      this.attemptReconnect();
    }
  }

  private handleError(event: Event): void {
    console.error('GameSyncService: WebSocket error:', event);
    this.emitEvent({
      type: 'error',
      data: { code: 'WS_ERROR', message: 'WebSocket error' },
      timestamp: Date.now(),
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as ServerMessage;
      this.processMessage(message);
    } catch (err) {
      console.error('GameSyncService: Failed to parse message:', err);
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
  // Private Methods - Utilities
  // ============================================================================

  private send(message: { type: string; data?: unknown }): void {
    if (this.ws && this.connectionState === 'connected') {
      this.ws.send(JSON.stringify(message));
    } else if (this.connectionState === 'connecting') {
      // Queue message to be sent when connection opens
      this.messageQueue.push(message);
    } else {
      // Not connected and not connecting - message will be lost
    }
  }

  private flushMessageQueue(): void {
    if (this.messageQueue.length > 0 && this.ws && this.connectionState === 'connected') {
      for (const message of this.messageQueue) {
        this.ws.send(JSON.stringify(message));
      }
      this.messageQueue = [];
    }
  }

  private setConnectionState(newState: ConnectionState): void {
    const previousState = this.connectionState;
    this.connectionState = newState;

    if (previousState !== newState) {
      this.emitEvent({
        type: 'connection:state_changed',
        data: { previousState, currentState: newState },
        timestamp: Date.now(),
      });
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectCount >= this.config.reconnectAttempts) {
      this.setConnectionState('disconnected');
      return;
    }

    this.setConnectionState('reconnecting');
    this.reconnectCount++;

    const delay = this.config.reconnectDelayMs * Math.pow(2, this.reconnectCount - 1);

    this.reconnectTimeout = setTimeout(() => {
      if (this.connectionState === 'reconnecting') {
        this.connect();
      }
    }, delay);
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      this.send({ type: MT.PING });
    }, this.config.pingIntervalMs);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

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
