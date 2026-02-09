import { batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import { gameSyncService } from '../../../services/sync/GameSyncService';
import { TypedEventEmitter } from '../../../shared/utils/EventEmitter';
import type {
  SyncEvent,
  GameCreatedData,
  GameJoinedData,
  GameStartedData,
  MoveAcceptedData,
  MoveRejectedData,
  OpponentMoveData,
  GameEndedData,
  GameEndedAchievement,
  GameReconnectedData,
  TimeUpdateData,
  TimeControl,
  PlayerInfo,
} from '../../../services/sync/types';
import type { Side, GameWinner, GameOverReason } from '../../../types/game';

export interface MultiplayerEvents {
  'game:created': { gameId: string; playerColor: Side };
  'game:joined': { gameId: string; playerColor: Side; opponent: string | null };
  'game:started': {
    gameId: string;
    opponent: string | null;
    whiteTimeMs: number;
    blackTimeMs: number;
  };
  'move:accepted': {
    fen: string;
    san: string;
    from: string;
    to: string;
    isCheck: boolean | undefined;
    whiteTimeMs: number | undefined;
    blackTimeMs: number | undefined;
  };
  'move:rejected': { fen: string; reason: string };
  'move:opponent': {
    fen: string;
    san: string;
    from: string;
    to: string;
    whiteTimeMs: number | undefined;
    blackTimeMs: number | undefined;
    isCheck: boolean | undefined;
  };
  'time:update': { whiteTimeMs: number; blackTimeMs: number };
  'game:ended': {
    reason: GameOverReason;
    winner: GameWinner;
    whiteRating?: number;
    blackRating?: number;
    whiteRatingDelta?: number;
    blackRatingDelta?: number;
    whiteNewAchievements?: GameEndedAchievement[];
    blackNewAchievements?: GameEndedAchievement[];
  };
  'game:opponent_left': void;
  'game:reconnected': {
    gameId: string;
    playerColor: Side;
    fen: string;
    moveHistory: string[];
    whiteTimeMs: number;
    blackTimeMs: number;
    timeControl?: TimeControl;
    opponent: PlayerInfo;
    rated: boolean;
  };
  'game:opponent_disconnected': void;
  'game:opponent_reconnected': void;
  'game:error': { message: string };
}

interface MultiplayerState {
  gameId: string | null;
  opponentUsername: string | null;
  isWaiting: boolean;
  isConnected: boolean;
}

export interface MultiplayerStore {
  state: MultiplayerState;
  // Event subscription
  on: <K extends keyof MultiplayerEvents>(
    event: K,
    handler: (data: MultiplayerEvents[K]) => void
  ) => () => void;
  // Connection
  connect: () => void;
  disconnect: () => void;
  // Game actions
  createGame: (timeControl: number, increment?: number, rated?: boolean) => void;
  joinGame: (gameId: string) => void;
  reconnectGame: (gameId: string) => void;
  sendMove: (from: string, to: string, promotion?: string) => void;
  resign: () => void;
  leave: () => void;
  // State setters
  setGameStarted: (gameId: string, opponent: string | null) => void;
  setGameId: (gameId: string) => void;
  setWaiting: (isWaiting: boolean) => void;
  setPlayerColorGetter: (getter: () => Side) => void;
}

export const createMultiplayerStore = (): MultiplayerStore => {
  const [state, setState] = createStore<MultiplayerState>({
    gameId: null,
    opponentUsername: null,
    isWaiting: false,
    isConnected: false,
  });

  const events = new TypedEventEmitter<MultiplayerEvents>();

  let unsubscribe: (() => void) | null = null;
  let playerColorGetter: (() => Side) | null = null;

  const handleSyncEvent = (event: SyncEvent) => {
    switch (event.type) {
      case 'game:created': {
        const data = event.data as GameCreatedData;
        const playerColor: Side = data.color === 'white' ? 'w' : 'b';
        batch(() => {
          setState('gameId', data.gameId);
          setState('isWaiting', true);
        });
        events.emit('game:created', { gameId: data.gameId, playerColor });
        break;
      }

      case 'game:joined': {
        const data = event.data as GameJoinedData;
        const playerColor: Side = data.color === 'white' ? 'w' : 'b';
        batch(() => {
          setState('gameId', data.gameId);
          setState('opponentUsername', data.opponent ?? null);
          setState('isWaiting', false);
        });
        events.emit('game:joined', {
          gameId: data.gameId,
          playerColor,
          opponent: data.opponent ?? null,
        });
        break;
      }

      case 'game:started': {
        const data = event.data as GameStartedData;
        const playerIsWhite = playerColorGetter?.() === 'w';
        const opponentInfo = playerIsWhite ? data.blackPlayer : data.whitePlayer;

        batch(() => {
          setState('gameId', data.gameId);
          setState('opponentUsername', opponentInfo.username ?? null);
          setState('isWaiting', false);
        });
        events.emit('game:started', {
          gameId: data.gameId,
          opponent: opponentInfo.username ?? null,
          whiteTimeMs: data.whiteTimeMs,
          blackTimeMs: data.blackTimeMs,
        });
        break;
      }

      case 'game:move_accepted': {
        const data = event.data as MoveAcceptedData;
        events.emit('move:accepted', {
          fen: data.fen,
          san: data.san,
          from: data.from,
          to: data.to,
          isCheck: data.isCheck,
          whiteTimeMs: data.whiteTimeMs,
          blackTimeMs: data.blackTimeMs,
        });
        break;
      }

      case 'game:move_rejected': {
        const data = event.data as MoveRejectedData;
        events.emit('move:rejected', { fen: data.fen, reason: data.reason });
        break;
      }

      case 'game:opponent_move': {
        const data = event.data as OpponentMoveData;
        events.emit('move:opponent', {
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
        events.emit('time:update', { whiteTimeMs: data.whiteTime, blackTimeMs: data.blackTime });
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
        else if (data.reason === 'disconnection') reason = 'disconnection';
        else if (data.reason === 'abandonment') reason = 'abandonment';
        else if (data.reason === 'insufficient_material') reason = 'insufficient_material';
        else if (data.reason === 'threefold_repetition') reason = 'threefold_repetition';
        else if (data.reason === 'fifty_move_rule') reason = 'fifty_move_rule';

        setState('gameId', null);
        events.emit('game:ended', {
          reason,
          winner,
          whiteRating: data.whiteRating,
          blackRating: data.blackRating,
          whiteRatingDelta: data.whiteRatingDelta,
          blackRatingDelta: data.blackRatingDelta,
          whiteNewAchievements: data.whiteNewAchievements,
          blackNewAchievements: data.blackNewAchievements,
        });
        break;
      }

      case 'game:not_found':
      case 'game:full': {
        batch(() => {
          setState('gameId', null);
          setState('isWaiting', false);
        });
        events.emit('game:error', {
          message: event.type === 'game:not_found' ? 'Game not found' : 'Game is full',
        });
        break;
      }

      case 'game:opponent_left': {
        events.emit('game:opponent_left', undefined as unknown as void);
        break;
      }

      case 'game:reconnected': {
        const data = event.data as GameReconnectedData;
        const playerColor: Side = data.color === 'white' ? 'w' : 'b';
        batch(() => {
          setState('gameId', data.gameId);
          setState('opponentUsername', data.opponent.username ?? null);
          setState('isWaiting', false);
        });
        events.emit('game:reconnected', {
          gameId: data.gameId,
          playerColor,
          fen: data.fen,
          moveHistory: data.moveHistory,
          whiteTimeMs: data.whiteTimeMs,
          blackTimeMs: data.blackTimeMs,
          timeControl: data.timeControl,
          opponent: data.opponent,
          rated: data.rated,
        });
        break;
      }

      case 'game:opponent_disconnected': {
        events.emit('game:opponent_disconnected', undefined as unknown as void);
        break;
      }

      case 'game:opponent_reconnected': {
        events.emit('game:opponent_reconnected', undefined as unknown as void);
        break;
      }

      case 'error': {
        const data = event.data as { message: string };
        events.emit('game:error', { message: data.message });
        break;
      }
    }
  };

  const connect = () => {
    gameSyncService.connect();
    setState('isConnected', true);

    // Subscribe to sync service events
    if (!unsubscribe) {
      unsubscribe = gameSyncService.onEvent(handleSyncEvent);
    }
  };

  // Event subscription method
  const on = <K extends keyof MultiplayerEvents>(
    event: K,
    handler: (data: MultiplayerEvents[K]) => void
  ): (() => void) => {
    return events.on(event, handler);
  };

  const setPlayerColorGetter = (getter: () => Side) => {
    playerColorGetter = getter;
  };

  const disconnect = () => {
    gameSyncService.disconnect();
    setState('isConnected', false);
  };

  const createGame = (timeControl: number, increment = 0, rated = false) => {
    connect();
    gameSyncService.createGame(
      {
        initialTime: timeControl * 60,
        increment,
      },
      rated
    );
    setState('isWaiting', true);
  };

  const joinGame = (gameId: string) => {
    connect();
    gameSyncService.joinGame(gameId);
    setState({ gameId, isWaiting: true });
  };

  const reconnectGame = (gameId: string) => {
    connect();
    gameSyncService.reconnectGame(gameId);
    setState({ gameId, isWaiting: false });
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
    on,
    connect,
    disconnect,
    createGame,
    joinGame,
    reconnectGame,
    sendMove,
    resign,
    leave,
    setGameStarted,
    setGameId,
    setWaiting,
    setPlayerColorGetter,
  };
};
