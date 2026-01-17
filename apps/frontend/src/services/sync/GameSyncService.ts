import { generateSessionId } from '../../shared';
import type { GameSession } from '../game/session/GameSession';
import type { GameCommand, GameSessionState } from '../game/session/types';
import type {
  ConnectionState,
  OutboundMessage,
  InboundMessage,
  PendingCommand,
  SyncEvent,
  SyncEventHandler,
  SyncServiceConfig,
} from './types';
import type { Square, PromotionPiece, Side } from '../../types';

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: SyncServiceConfig = {
  serverUrl: '',
  reconnectAttempts: 5,
  reconnectDelayMs: 1000,
  pingIntervalMs: 30000,
  commandTimeoutMs: 10000,
};

// ============================================================================
// GameSyncService Class
// ============================================================================

export class GameSyncService {
  private config: SyncServiceConfig;
  private ws: WebSocket | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private reconnectCount = 0;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private commandTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

  // Pending commands for optimistic updates
  private pendingCommands: Map<string, PendingCommand> = new Map();

  // Event handlers
  private eventHandlers: Set<SyncEventHandler> = new Set();

  // Game session reference
  private session: GameSession | null = null;

  constructor(config: Partial<SyncServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
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
      return; // Already connected
    }

    this.setConnectionState('connecting');

    try {
      this.ws = new WebSocket(this.config.serverUrl);

      this.ws.onopen = () => {
        this.handleOpen();
      };

      this.ws.onclose = (event) => {
        this.handleClose(event);
      };

      this.ws.onerror = (event) => {
        this.handleError(event);
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event);
      };
    } catch (err) {
      console.error('GameSyncService: Failed to create WebSocket:', err);
      this.setConnectionState('disconnected');
    }
  }

  disconnect(): void {
    this.stopPing();
    this.clearAllTimeouts();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setConnectionState('disconnected');
    this.reconnectCount = 0;
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  // ============================================================================
  // Session Binding
  // ============================================================================

  bindSession(session: GameSession): void {
    this.session = session;
  }

  unbindSession(): void {
    this.session = null;
  }

  // ============================================================================
  // Command Sending with Optimistic Updates
  // ============================================================================

  sendMove(gameId: string, from: Square, to: Square, promotion?: PromotionPiece): void {
    if (!this.session) {
      console.error('GameSyncService: No session bound');
      return;
    }

    const commandId = generateSessionId();
    const previousState = { ...this.session.currentState };

    // Optimistic update
    const command: GameCommand = {
      type: 'APPLY_MOVE',
      payload: { from, to, promotion },
    };

    const result = this.session.applyCommand(command);

    if (!result.success) {
      console.error('GameSyncService: Optimistic move failed:', result.error);
      return;
    }

    // Store pending command for potential rollback
    this.pendingCommands.set(commandId, {
      id: commandId,
      gameId,
      command,
      optimisticState: previousState,
      sentAt: Date.now(),
      retryCount: 0,
    });

    // Set timeout for command
    this.setCommandTimeout(commandId);

    // Send to server
    this.send({
      type: 'GAME:MOVE',
      payload: {
        gameId,
        commandId,
        from,
        to,
        promotion,
        timestamp: Date.now(),
      },
    });
  }

  sendResign(gameId: string, resigningSide: Side): void {
    this.send({
      type: 'GAME:RESIGN',
      payload: { gameId, resigningSide },
    });
  }

  joinGame(gameId: string, userId?: string): void {
    this.send({
      type: 'GAME:JOIN',
      payload: { gameId, userId },
    });
  }

  createGame(timeControl: number, increment?: number, playerColor?: Side): void {
    this.send({
      type: 'GAME:CREATE',
      payload: { timeControl, increment, playerColor },
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
      data: { message: 'WebSocket error' },
      timestamp: Date.now(),
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as InboundMessage;
      this.processMessage(message);
    } catch (err) {
      console.error('GameSyncService: Failed to parse message:', err);
    }
  }

  // ============================================================================
  // Private Methods - Message Processing
  // ============================================================================

  private processMessage(message: InboundMessage): void {
    switch (message.type) {
      case 'GAME:MOVE_ACCEPTED':
        this.handleMoveAccepted(message.payload);
        break;

      case 'GAME:MOVE_REJECTED':
        this.handleMoveRejected(message.payload);
        break;

      case 'GAME:OPPONENT_MOVE':
        this.handleOpponentMove(message.payload);
        break;

      case 'GAME:STATE':
        this.handleStateSync(message.payload);
        break;

      case 'GAME:ENDED':
        this.handleGameEnded(message.payload);
        break;

      case 'GAME:CREATED':
        this.emitEvent({
          type: 'game:created',
          data: message.payload,
          timestamp: Date.now(),
        });
        break;

      case 'GAME:JOINED':
        this.emitEvent({
          type: 'game:joined',
          data: message.payload,
          timestamp: Date.now(),
        });
        break;

      case 'PONG':
        // Latency measurement could be done here
        break;

      case 'ERROR':
        this.emitEvent({
          type: 'error',
          data: message.payload,
          timestamp: Date.now(),
        });
        break;
    }
  }

  private handleMoveAccepted(payload: {
    gameId: string;
    commandId: string;
    serverTimestamp: number;
  }): void {
    const { commandId } = payload;

    // Clear timeout
    this.clearCommandTimeout(commandId);

    // Remove from pending
    this.pendingCommands.delete(commandId);

    this.emitEvent({
      type: 'game:move_accepted',
      data: payload,
      timestamp: Date.now(),
    });
  }

  private handleMoveRejected(payload: {
    gameId: string;
    commandId: string;
    reason: string;
    correctState: Partial<GameSessionState>;
  }): void {
    const { commandId, correctState } = payload;

    // Clear timeout
    this.clearCommandTimeout(commandId);

    // Get pending command
    const pending = this.pendingCommands.get(commandId);
    this.pendingCommands.delete(commandId);

    // Rollback to server state
    if (this.session) {
      this.session.applyCommand({
        type: 'SYNC_STATE',
        payload: { state: correctState },
      });
    }

    this.emitEvent({
      type: 'game:move_rejected',
      data: { ...payload, rolledBackFrom: pending?.optimisticState },
      timestamp: Date.now(),
    });
  }

  private handleOpponentMove(payload: {
    gameId: string;
    from: Square;
    to: Square;
    promotion?: PromotionPiece;
    newFen: string;
    serverTimestamp: number;
  }): void {
    const { from, to, promotion } = payload;

    if (this.session) {
      this.session.applyCommand({
        type: 'APPLY_MOVE',
        payload: { from, to, promotion },
      });
    }

    this.emitEvent({
      type: 'game:opponent_move',
      data: payload,
      timestamp: Date.now(),
    });
  }

  private handleStateSync(payload: { gameId: string; state: Partial<GameSessionState> }): void {
    if (this.session) {
      this.session.applyCommand({
        type: 'SYNC_STATE',
        payload: { state: payload.state },
      });
    }

    this.emitEvent({
      type: 'game:state_sync',
      data: payload,
      timestamp: Date.now(),
    });
  }

  private handleGameEnded(payload: {
    gameId: string;
    reason: string;
    winner: Side | 'draw' | null;
    finalState: Partial<GameSessionState>;
  }): void {
    if (this.session) {
      this.session.applyCommand({
        type: 'SYNC_STATE',
        payload: { state: payload.finalState },
      });
    }

    this.emitEvent({
      type: 'game:ended',
      data: payload,
      timestamp: Date.now(),
    });
  }

  // ============================================================================
  // Private Methods - Utilities
  // ============================================================================

  private send(message: OutboundMessage): void {
    if (this.ws && this.connectionState === 'connected') {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('GameSyncService: Cannot send message - not connected');
    }
  }

  private setConnectionState(state: ConnectionState): void {
    const previousState = this.connectionState;
    this.connectionState = state;

    if (previousState !== state) {
      this.emitEvent({
        type: 'connection:state_changed',
        data: { previousState, currentState: state },
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

    setTimeout(() => {
      if (this.connectionState === 'reconnecting') {
        this.connect();
      }
    }, delay);
  }

  private startPing(): void {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      this.send({
        type: 'PING',
        payload: { timestamp: Date.now() },
      });
    }, this.config.pingIntervalMs);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private setCommandTimeout(commandId: string): void {
    const timeout = setTimeout(() => {
      this.handleCommandTimeout(commandId);
    }, this.config.commandTimeoutMs);

    this.commandTimeouts.set(commandId, timeout);
  }

  private clearCommandTimeout(commandId: string): void {
    const timeout = this.commandTimeouts.get(commandId);
    if (timeout) {
      clearTimeout(timeout);
      this.commandTimeouts.delete(commandId);
    }
  }

  private clearAllTimeouts(): void {
    for (const timeout of this.commandTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.commandTimeouts.clear();
  }

  private handleCommandTimeout(commandId: string): void {
    const pending = this.pendingCommands.get(commandId);
    if (!pending) return;

    // Rollback optimistic update
    if (this.session) {
      this.session.applyCommand({
        type: 'SYNC_STATE',
        payload: { state: pending.optimisticState },
      });
    }

    this.pendingCommands.delete(commandId);

    this.emitEvent({
      type: 'game:move_rejected',
      data: {
        commandId,
        reason: 'Command timed out',
        rolledBackFrom: pending.optimisticState,
      },
      timestamp: Date.now(),
    });
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
