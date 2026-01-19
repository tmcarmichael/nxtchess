import { batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
  gameSyncService,
  type SyncEvent,
  type GameCreatedData,
  type GameJoinedData,
  type GameStartedData,
  type MoveAcceptedData,
  type MoveRejectedData,
  type OpponentMoveData,
  type GameEndedData,
  type TimeUpdateData,
} from '../../../services/sync';
import type { Side, GameWinner, GameOverReason } from '../../../types';

// ============================================================================
// Callback Types for Event Handling
// ============================================================================

export interface MultiplayerEventCallbacks {
  onGameCreated: (data: { gameId: string; playerColor: Side }) => void;
  onGameJoined: (data: { gameId: string; playerColor: Side; opponent: string | null }) => void;
  onGameStarted: (data: {
    gameId: string;
    opponent: string | null;
    whiteTimeMs: number;
    blackTimeMs: number;
  }) => void;
  onMoveAccepted: (data: {
    fen: string;
    whiteTimeMs: number | undefined;
    blackTimeMs: number | undefined;
  }) => void;
  onMoveRejected: (data: { fen: string; reason: string }) => void;
  onOpponentMove: (data: {
    fen: string;
    san: string;
    from: string;
    to: string;
    whiteTimeMs: number | undefined;
    blackTimeMs: number | undefined;
    isCheck: boolean | undefined;
  }) => void;
  onTimeUpdate: (data: { whiteTimeMs: number; blackTimeMs: number }) => void;
  onGameEnded: (data: { reason: GameOverReason; winner: GameWinner }) => void;
  onOpponentLeft: () => void;
  onError: (message: string) => void;
  // Needed for game:started to start timer with current turn
  getCurrentTurn: () => Side;
  getPlayerColor: () => Side;
}

// ============================================================================
// Store Types
// ============================================================================

interface MultiplayerState {
  gameId: string | null;
  opponentUsername: string | null;
  isWaiting: boolean;
  isConnected: boolean;
}

export interface MultiplayerStore {
  state: MultiplayerState;
  connect: () => void;
  disconnect: () => void;
  createGame: (timeControl: number, increment?: number) => void;
  joinGame: (gameId: string) => void;
  sendMove: (from: string, to: string, promotion?: string) => void;
  resign: () => void;
  leave: () => void;
  // For external state updates
  setGameStarted: (gameId: string, opponent: string | null) => void;
  setGameId: (gameId: string) => void;
  setWaiting: (isWaiting: boolean) => void;
}

// ============================================================================
// Store Factory
// ============================================================================

export const createMultiplayerStore = (callbacks?: MultiplayerEventCallbacks): MultiplayerStore => {
  const [state, setState] = createStore<MultiplayerState>({
    gameId: null,
    opponentUsername: null,
    isWaiting: false,
    isConnected: false,
  });

  let unsubscribe: (() => void) | null = null;

  // ============================================================================
  // Internal Event Handler
  // ============================================================================

  const handleSyncEvent = (event: SyncEvent) => {
    if (!callbacks) return;

    switch (event.type) {
      case 'game:created': {
        const data = event.data as GameCreatedData;
        const playerColor: Side = data.color === 'white' ? 'w' : 'b';
        batch(() => {
          setState('gameId', data.gameId);
          setState('isWaiting', true);
          callbacks.onGameCreated({ gameId: data.gameId, playerColor });
        });
        break;
      }

      case 'game:joined': {
        const data = event.data as GameJoinedData;
        const playerColor: Side = data.color === 'white' ? 'w' : 'b';
        batch(() => {
          setState('gameId', data.gameId);
          setState('opponentUsername', data.opponent ?? null);
          setState('isWaiting', false);
          callbacks.onGameJoined({
            gameId: data.gameId,
            playerColor,
            opponent: data.opponent ?? null,
          });
        });
        break;
      }

      case 'game:started': {
        const data = event.data as GameStartedData;
        const playerIsWhite = callbacks.getPlayerColor() === 'w';
        const opponentInfo = playerIsWhite ? data.blackPlayer : data.whitePlayer;

        batch(() => {
          setState('gameId', data.gameId);
          setState('opponentUsername', opponentInfo.username ?? null);
          setState('isWaiting', false);
          callbacks.onGameStarted({
            gameId: data.gameId,
            opponent: opponentInfo.username ?? null,
            whiteTimeMs: data.whiteTimeMs,
            blackTimeMs: data.blackTimeMs,
          });
        });
        break;
      }

      case 'game:move_accepted': {
        const data = event.data as MoveAcceptedData;
        callbacks.onMoveAccepted({
          fen: data.fen,
          whiteTimeMs: data.whiteTimeMs,
          blackTimeMs: data.blackTimeMs,
        });
        break;
      }

      case 'game:move_rejected': {
        const data = event.data as MoveRejectedData;
        callbacks.onMoveRejected({ fen: data.fen, reason: data.reason });
        break;
      }

      case 'game:opponent_move': {
        const data = event.data as OpponentMoveData;
        callbacks.onOpponentMove({
          fen: data.fen,
          san: data.san,
          from: data.from,
          to: data.to,
          whiteTimeMs: data.whiteTimeMs,
          blackTimeMs: data.blackTimeMs,
          isCheck: data.isCheck,
        });
        break;
      }

      case 'game:time_update': {
        const data = event.data as TimeUpdateData;
        callbacks.onTimeUpdate({
          whiteTimeMs: data.whiteTime,
          blackTimeMs: data.blackTime,
        });
        break;
      }

      case 'game:ended': {
        const data = event.data as GameEndedData;
        let winner: GameWinner = null;
        if (data.result === 'white') winner = 'w';
        else if (data.result === 'black') winner = 'b';
        else if (data.result === 'draw') winner = 'draw';

        let reason: GameOverReason = null;
        if (data.reason === 'checkmate') reason = 'checkmate';
        else if (data.reason === 'stalemate') reason = 'stalemate';
        else if (data.reason === 'timeout') reason = 'time';
        else if (data.reason === 'resignation') reason = 'resignation';

        setState('gameId', null);
        callbacks.onGameEnded({ reason, winner });
        break;
      }

      case 'game:opponent_left': {
        callbacks.onOpponentLeft();
        break;
      }

      case 'error': {
        const data = event.data as { message: string };
        callbacks.onError(data.message);
        break;
      }
    }
  };

  // ============================================================================
  // Public Methods
  // ============================================================================

  const connect = () => {
    gameSyncService.connect();
    setState('isConnected', true);

    // Subscribe to events if callbacks provided
    if (callbacks && !unsubscribe) {
      unsubscribe = gameSyncService.onEvent(handleSyncEvent);
    }
  };

  const disconnect = () => {
    gameSyncService.disconnect();
    setState('isConnected', false);
  };

  const createGame = (timeControl: number, increment = 0) => {
    connect();
    gameSyncService.createGame({
      initialTime: timeControl * 60,
      increment,
    });
    setState('isWaiting', true);
  };

  const joinGame = (gameId: string) => {
    connect();
    gameSyncService.joinGame(gameId);
    setState({ gameId, isWaiting: true });
  };

  const sendMove = (from: string, to: string, promotion?: string) => {
    if (state.gameId) {
      gameSyncService.sendMove(state.gameId, from, to, promotion);
    }
  };

  const resign = () => {
    if (state.gameId) {
      gameSyncService.resign(state.gameId);
    }
  };

  const leave = () => {
    if (state.gameId) {
      gameSyncService.leaveGame(state.gameId);
    }
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    setState({
      gameId: null,
      opponentUsername: null,
      isWaiting: false,
      isConnected: false,
    });
  };

  const setGameStarted = (gameId: string, opponent: string | null) => {
    setState({ gameId, opponentUsername: opponent, isWaiting: false });
  };

  const setGameId = (gameId: string) => {
    setState('gameId', gameId);
  };

  const setWaiting = (isWaiting: boolean) => {
    setState('isWaiting', isWaiting);
  };

  return {
    state,
    connect,
    disconnect,
    createGame,
    joinGame,
    sendMove,
    resign,
    leave,
    setGameStarted,
    setGameId,
    setWaiting,
  };
};
