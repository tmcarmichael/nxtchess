import { createStore } from 'solid-js/store';
import { gameSyncService, type SyncEventHandler } from '../../../services/sync';

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
  subscribe: (handler: SyncEventHandler) => () => void;
  leave: () => void;
  setGameStarted: (gameId: string, opponent: string | null) => void;
  setGameId: (gameId: string) => void;
  setWaiting: (isWaiting: boolean) => void;
}

export const createMultiplayerStore = (): MultiplayerStore => {
  const [state, setState] = createStore<MultiplayerState>({
    gameId: null,
    opponentUsername: null,
    isWaiting: false,
    isConnected: false,
  });

  let unsubscribe: (() => void) | null = null;

  const connect = () => {
    gameSyncService.connect();
    setState('isConnected', true);
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

  const subscribe = (handler: SyncEventHandler): (() => void) => {
    if (unsubscribe) {
      unsubscribe();
    }
    unsubscribe = gameSyncService.onEvent(handler);
    return unsubscribe;
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
    subscribe,
    leave,
    setGameStarted,
    setGameId,
    setWaiting,
  };
};
