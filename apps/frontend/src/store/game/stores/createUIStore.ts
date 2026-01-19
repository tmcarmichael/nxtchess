import { createStore } from 'solid-js/store';
import { getOpponentSide } from '../../../services/game/chessGameService';
import type { Side } from '../../../types/game';

interface UIState {
  boardView: Side;
  showEndModal: boolean;
  showResignModal: boolean;
}

export interface UIStore {
  state: UIState;
  flipBoard: () => void;
  setBoardView: (view: Side) => void;
  showEndModal: () => void;
  hideEndModal: () => void;
  showResignModal: () => void;
  hideResignModal: () => void;
}

export const createUIStore = (): UIStore => {
  const [state, setState] = createStore<UIState>({
    boardView: 'w',
    showEndModal: false,
    showResignModal: false,
  });

  const flipBoard = () => setState('boardView', (v) => getOpponentSide(v));
  const setBoardView = (view: Side) => setState('boardView', view);
  const showEndModal = () => setState('showEndModal', true);
  const hideEndModal = () => setState('showEndModal', false);
  const showResignModal = () => setState('showResignModal', true);
  const hideResignModal = () => setState('showResignModal', false);

  return {
    state,
    flipBoard,
    setBoardView,
    showEndModal,
    hideEndModal,
    showResignModal,
    hideResignModal,
  };
};
