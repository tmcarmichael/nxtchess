import { createStore } from 'solid-js/store';
import { gameSyncService } from '../../../services/sync/GameSyncService';
import type {
  LobbyGameInfo,
  LobbyListData,
  LobbyUpdateData,
  SyncEvent,
} from '../../../services/sync/types';

interface LobbyState {
  games: LobbyGameInfo[];
  isSubscribed: boolean;
  isLoading: boolean;
}

export interface LobbyStore {
  state: LobbyState;
  subscribe: () => void;
  unsubscribe: () => void;
}

export const createLobbyStore = (): LobbyStore => {
  const [state, setState] = createStore<LobbyState>({
    games: [],
    isSubscribed: false,
    isLoading: true,
  });

  let unsubscribeEvents: (() => void) | null = null;
  let loadingTimeoutId: ReturnType<typeof setTimeout> | null = null;

  const clearLoadingTimeout = () => {
    if (loadingTimeoutId !== null) {
      clearTimeout(loadingTimeoutId);
      loadingTimeoutId = null;
    }
  };

  const handleEvent = (event: SyncEvent) => {
    switch (event.type) {
      case 'lobby:list': {
        clearLoadingTimeout();
        const data = event.data as LobbyListData;
        setState({ games: data.games ?? [], isLoading: false });
        break;
      }
      case 'lobby:update': {
        const data = event.data as LobbyUpdateData;
        if (data.action === 'added' && data.game) {
          const newGame = data.game;
          setState('games', (prev) => [...prev, newGame]);
        } else if (data.action === 'removed' && data.gameId) {
          const removedId = data.gameId;
          setState('games', (prev) => prev.filter((g) => g.gameId !== removedId));
        }
        break;
      }
    }
  };

  const subscribe = () => {
    if (state.isSubscribed) return;

    gameSyncService.connect();
    setState({ isSubscribed: true, isLoading: true });

    if (!unsubscribeEvents) {
      unsubscribeEvents = gameSyncService.onEvent(handleEvent);
    }

    gameSyncService.subscribeLobby();

    clearLoadingTimeout();
    loadingTimeoutId = setTimeout(() => {
      if (state.isLoading) {
        setState({ isLoading: false });
      }
    }, 5000);
  };

  const unsubscribe = () => {
    if (!state.isSubscribed) return;

    clearLoadingTimeout();
    gameSyncService.unsubscribeLobby();

    if (unsubscribeEvents) {
      unsubscribeEvents();
      unsubscribeEvents = null;
    }

    setState({ isSubscribed: false, games: [], isLoading: false });
  };

  return { state, subscribe, unsubscribe };
};
