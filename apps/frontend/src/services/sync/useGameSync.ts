import { createSignal, onCleanup, Accessor } from 'solid-js';
import { gameSyncService, GameSyncService } from './GameSyncService';
import type { GameSession } from '../game/session/GameSession';
import type { ConnectionState, SyncEvent } from './types';
import type { Square, PromotionPiece, Side } from '../../types';

// ============================================================================
// Types
// ============================================================================

export interface GameSyncHookConfig {
  serverUrl: string;
  autoConnect?: boolean;
}

export interface GameSyncResult {
  // Connection state
  connectionState: Accessor<ConnectionState>;
  isConnected: Accessor<boolean>;
  isConnecting: Accessor<boolean>;
  isReconnecting: Accessor<boolean>;

  // Connection controls
  connect: () => void;
  disconnect: () => void;

  // Game actions
  sendMove: (from: Square, to: Square, promotion?: PromotionPiece) => void;
  resign: () => void;
  joinGame: (gameId: string) => void;
  createGame: (timeControl: number, increment?: number, playerColor?: Side) => void;

  // Event subscription
  onSyncEvent: (handler: (event: SyncEvent) => void) => () => void;

  // Last error
  lastError: Accessor<string | null>;
}

// ============================================================================
// createGameSync Hook
// ============================================================================

export function createGameSync(
  getSession: () => GameSession | null,
  config: GameSyncHookConfig
): GameSyncResult {
  const [connectionState, setConnectionState] = createSignal<ConnectionState>('disconnected');
  const [lastError, setLastError] = createSignal<string | null>(null);

  // Subscribe to connection state changes
  const unsubscribe = gameSyncService.onEvent((event) => {
    if (event.type === 'connection:state_changed') {
      const data = event.data as { currentState: ConnectionState };
      setConnectionState(data.currentState);
    }

    if (event.type === 'error') {
      const data = event.data as { message: string };
      setLastError(data.message);
    }

    if (event.type === 'game:move_rejected') {
      const data = event.data as { reason: string };
      setLastError(data.reason);
    }
  });

  // Bind/unbind session
  const bindCurrentSession = () => {
    const session = getSession();
    if (session) {
      gameSyncService.bindSession(session);
    }
  };

  // Connect
  const connect = () => {
    bindCurrentSession();
    gameSyncService.connect(config.serverUrl);
  };

  // Disconnect
  const disconnect = () => {
    gameSyncService.disconnect();
    gameSyncService.unbindSession();
  };

  // Auto-connect if configured
  if (config.autoConnect) {
    connect();
  }

  // Cleanup on unmount
  onCleanup(() => {
    disconnect();
    unsubscribe();
  });

  // Game actions
  const sendMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    const session = getSession();
    if (!session) {
      console.warn('useGameSync: No session available');
      return;
    }
    gameSyncService.sendMove(session.sessionId, from, to, promotion);
  };

  const resign = () => {
    const session = getSession();
    if (!session) {
      console.warn('useGameSync: No session available');
      return;
    }
    const playerColor = session.config.playerColor;
    gameSyncService.sendResign(session.sessionId, playerColor);
  };

  const joinGame = (gameId: string) => {
    gameSyncService.joinGame(gameId);
  };

  const createGame = (timeControl: number, increment?: number, playerColor?: Side) => {
    gameSyncService.createGame(timeControl, increment, playerColor);
  };

  const onSyncEvent = (handler: (event: SyncEvent) => void) => {
    return gameSyncService.onEvent(handler);
  };

  return {
    connectionState,
    isConnected: () => connectionState() === 'connected',
    isConnecting: () => connectionState() === 'connecting',
    isReconnecting: () => connectionState() === 'reconnecting',
    connect,
    disconnect,
    sendMove,
    resign,
    joinGame,
    createGame,
    onSyncEvent,
    lastError,
  };
}

// ============================================================================
// Alternative: Factory for custom GameSyncService instance
// ============================================================================

export function createGameSyncWithService(
  service: GameSyncService,
  getSession: () => GameSession | null,
  config: GameSyncHookConfig
): GameSyncResult {
  const [connectionState, setConnectionState] = createSignal<ConnectionState>('disconnected');
  const [lastError, setLastError] = createSignal<string | null>(null);

  const unsubscribe = service.onEvent((event) => {
    if (event.type === 'connection:state_changed') {
      const data = event.data as { currentState: ConnectionState };
      setConnectionState(data.currentState);
    }

    if (event.type === 'error') {
      const data = event.data as { message: string };
      setLastError(data.message);
    }

    if (event.type === 'game:move_rejected') {
      const data = event.data as { reason: string };
      setLastError(data.reason);
    }
  });

  const bindCurrentSession = () => {
    const session = getSession();
    if (session) {
      service.bindSession(session);
    }
  };

  const connect = () => {
    bindCurrentSession();
    service.connect(config.serverUrl);
  };

  const disconnect = () => {
    service.disconnect();
    service.unbindSession();
  };

  if (config.autoConnect) {
    connect();
  }

  onCleanup(() => {
    disconnect();
    unsubscribe();
  });

  const sendMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    const session = getSession();
    if (!session) return;
    service.sendMove(session.sessionId, from, to, promotion);
  };

  const resign = () => {
    const session = getSession();
    if (!session) return;
    service.sendResign(session.sessionId, session.config.playerColor);
  };

  const joinGame = (gameId: string) => {
    service.joinGame(gameId);
  };

  const createGame = (timeControl: number, increment?: number, playerColor?: Side) => {
    service.createGame(timeControl, increment, playerColor);
  };

  const onSyncEvent = (handler: (event: SyncEvent) => void) => {
    return service.onEvent(handler);
  };

  return {
    connectionState,
    isConnected: () => connectionState() === 'connected',
    isConnecting: () => connectionState() === 'connecting',
    isReconnecting: () => connectionState() === 'reconnecting',
    connect,
    disconnect,
    sendMove,
    resign,
    joinGame,
    createGame,
    onSyncEvent,
    lastError,
  };
}
