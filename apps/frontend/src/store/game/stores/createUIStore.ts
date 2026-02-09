import { createStore } from 'solid-js/store';
import { getOpponentSide } from '../../../services/game/chessGameService';
import type { Side } from '../../../types/game';

interface UIState {
  boardView: Side;
  showEndModal: boolean;
  showResignModal: boolean;
  trainingFocusMode: boolean;
  opponentDisconnected: boolean;
}

export interface UIStore {
  state: UIState;
  flipBoard: () => void;
  setBoardView: (view: Side) => void;
  showEndModal: () => void;
  hideEndModal: () => void;
  showResignModal: () => void;
  hideResignModal: () => void;
  setFocusMode: (enabled: boolean) => void;
  setOpponentDisconnected: (disconnected: boolean) => void;
  cleanup: () => void;
}

const FOCUS_MODE_DEBOUNCE_MS = 500;

export interface UIStoreOptions {
  initialFocusMode?: boolean;
}

export const createUIStore = (options?: UIStoreOptions): UIStore => {
  const [state, setState] = createStore<UIState>({
    boardView: 'w',
    showEndModal: false,
    showResignModal: false,
    trainingFocusMode: options?.initialFocusMode ?? false,
    opponentDisconnected: false,
  });

  let focusModeDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  const flipBoard = () => setState('boardView', (v) => getOpponentSide(v));
  const setBoardView = (view: Side) => setState('boardView', view);
  const showEndModal = () => setState('showEndModal', true);
  const hideEndModal = () => setState('showEndModal', false);
  const showResignModal = () => setState('showResignModal', true);
  const hideResignModal = () => setState('showResignModal', false);

  const setOpponentDisconnected = (disconnected: boolean) =>
    setState('opponentDisconnected', disconnected);

  const setFocusMode = (enabled: boolean) => {
    // Debounce to prevent rapid toggle spam
    if (focusModeDebounceTimer) {
      clearTimeout(focusModeDebounceTimer);
    }
    focusModeDebounceTimer = setTimeout(() => {
      setState('trainingFocusMode', enabled);
      focusModeDebounceTimer = null;
    }, FOCUS_MODE_DEBOUNCE_MS);
  };

  const cleanup = () => {
    if (focusModeDebounceTimer) {
      clearTimeout(focusModeDebounceTimer);
      focusModeDebounceTimer = null;
    }
  };

  return {
    state,
    flipBoard,
    setBoardView,
    showEndModal,
    hideEndModal,
    showResignModal,
    hideResignModal,
    setFocusMode,
    setOpponentDisconnected,
    cleanup,
  };
};
