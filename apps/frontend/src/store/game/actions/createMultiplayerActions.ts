import { transition } from '../../../services/game/gameLifecycle';
import type { Square, PromotionPiece } from '../../../types/chess';
import type { Side, MultiplayerGameOptions } from '../../../types/game';
import type { ChessStore } from '../stores/createChessStore';
import type { MultiplayerStore } from '../stores/createMultiplayerStore';
import type { TimerStore } from '../stores/createTimerStore';
import type { UIStore } from '../stores/createUIStore';
import type { MultiplayerActions, CoreActions } from '../types';

export interface MultiplayerStores {
  chess: ChessStore;
  timer: TimerStore;
  multiplayer: MultiplayerStore;
  ui: UIStore;
}

export const createMultiplayerActions = (
  stores: MultiplayerStores,
  coreActions: CoreActions
): MultiplayerActions => {
  const { chess, timer, multiplayer, ui } = stores;

  const handleTimeOut = (winner: Side) => {
    timer.stop();
    chess.endGame('time', winner);
    ui.showEndModal();
  };

  const startMultiplayerGame = async (options: MultiplayerGameOptions) => {
    timer.stop();
    ui.hideEndModal();

    const { side, mode = 'play', newTimeControl = 5, increment = 0, rated = false } = options;

    chess.resetForMultiplayer(mode);
    chess.setPlayerColor(side);
    ui.setBoardView(side);
    timer.reset(newTimeControl);

    // Connect and create game
    multiplayer.createGame(newTimeControl, increment, rated);
  };

  const joinMultiplayerGame = (gameId: string) => {
    timer.stop();
    ui.hideEndModal();

    chess.resetForMultiplayer('play');

    // Connect and join game
    multiplayer.joinGame(gameId);
  };

  const applyMultiplayerMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    if (chess.state.opponentType !== 'human' || !multiplayer.state.gameId) {
      return;
    }

    // Send move to server
    multiplayer.sendMove(from, to, promotion);

    // Optimistic update
    chess.applyOptimisticMove(from, to, promotion);
  };

  const resignMultiplayer = () => {
    if (multiplayer.state.gameId) {
      multiplayer.resign();
    }
  };

  const exitGame = () => {
    timer.stop();

    if (multiplayer.state.gameId) {
      multiplayer.leave();
    }

    coreActions.exitGame();
    chess.setLifecycle(transition(chess.state.lifecycle, 'EXIT_GAME'));
  };

  return {
    // Core actions
    ...coreActions,

    // Multiplayer actions
    startMultiplayerGame,
    joinMultiplayerGame,
    applyMultiplayerMove,
    resignMultiplayer,
    handleTimeOut,

    // Override exitGame to add cleanup
    exitGame,
  };
};
