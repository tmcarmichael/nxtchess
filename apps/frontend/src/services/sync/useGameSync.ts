import { createSignal, onCleanup, type Accessor } from 'solid-js';
import { gameSyncService } from './GameSyncService';
import type { ConnectionState, SyncEvent, TimeControl } from './types';
import type { Square, PromotionPiece } from '../../types/chess';

// ============================================================================
// Types
// ============================================================================

export interface UseGameSyncResult {
  // Connection state
  connectionState: Accessor<ConnectionState>;
  isConnected: Accessor<boolean>;
  isConnecting: Accessor<boolean>;
  isReconnecting: Accessor<boolean>;

  // Game state
  currentGameId: Accessor<string | null>;

  // Connection controls
  connect: () => void;
  disconnect: () => void;

  // Game actions
  createGame: (timeControl?: TimeControl) => void;
  joinGame: (gameId: string) => void;
  leaveGame: () => void;
  sendMove: (from: Square, to: Square, promotion?: PromotionPiece) => void;
  resign: () => void;

  // Event subscription
  onSyncEvent: (handler: (event: SyncEvent) => void) => () => void;

  // Last error
  lastError: Accessor<string | null>;
}

// ============================================================================
// useGameSync Hook
// ============================================================================

export function useGameSync(): UseGameSyncResult {
  const [connectionState, setConnectionState] = createSignal<ConnectionState>(
    gameSyncService.getConnectionState()
  );
  const [currentGameId, setCurrentGameId] = createSignal<string | null>(
    gameSyncService.getCurrentGameId()
  );
  const [lastError, setLastError] = createSignal<string | null>(null);

  // Subscribe to events
  const unsubscribe = gameSyncService.onEvent((event) => {
    switch (event.type) {
      case 'connection:state_changed': {
        const data = event.data as { currentState: ConnectionState };
        setConnectionState(data.currentState);
        break;
      }

      case 'game:created':
      case 'game:joined':
      case 'game:started': {
        const data = event.data as { gameId: string };
        setCurrentGameId(data.gameId);
        setLastError(null);
        break;
      }

      case 'game:ended':
        setCurrentGameId(null);
        break;

      case 'game:not_found':
        setLastError('Game not found');
        break;

      case 'game:full':
        setLastError('Game is full');
        break;

      case 'game:move_rejected': {
        const data = event.data as { reason: string };
        setLastError(data.reason);
        break;
      }

      case 'error': {
        const data = event.data as { message: string };
        setLastError(data.message);
        break;
      }
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    unsubscribe();
  });

  // Connection controls
  const connect = () => {
    gameSyncService.connect();
  };

  const disconnect = () => {
    gameSyncService.disconnect();
    setCurrentGameId(null);
  };

  // Game actions
  const createGame = (timeControl?: TimeControl) => {
    gameSyncService.createGame(timeControl);
  };

  const joinGame = (gameId: string) => {
    gameSyncService.joinGame(gameId);
  };

  const leaveGame = () => {
    const gameId = currentGameId();
    if (gameId) {
      gameSyncService.leaveGame(gameId);
      setCurrentGameId(null);
    }
  };

  const sendMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    const gameId = currentGameId();
    if (gameId) {
      gameSyncService.sendMove(gameId, from, to, promotion);
    } else {
      console.warn('useGameSync: No active game');
    }
  };

  const resign = () => {
    const gameId = currentGameId();
    if (gameId) {
      gameSyncService.resign(gameId);
    }
  };

  const onSyncEvent = (handler: (event: SyncEvent) => void) => {
    return gameSyncService.onEvent(handler);
  };

  return {
    connectionState,
    isConnected: () => connectionState() === 'connected',
    isConnecting: () => connectionState() === 'connecting',
    isReconnecting: () => connectionState() === 'reconnecting',
    currentGameId,
    connect,
    disconnect,
    createGame,
    joinGame,
    leaveGame,
    sendMove,
    resign,
    onSyncEvent,
    lastError,
  };
}
