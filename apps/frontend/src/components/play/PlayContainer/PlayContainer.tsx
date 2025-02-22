import { createSignal, onMount, Show, ParentComponent } from 'solid-js';
import { getRandomQuickPlayConfig } from '../../../services/chessGameService';
import { useGameStore } from '../../../store/GameContext';
import PlayBoardController from '../PlayBoardController/PlayBoardController';
import PlayControlsPanel from '../PlayControlsPanel/PlayControlsPanel';
import PlayModal from '../PlayModal/PlayModal';
import PlayNavigationPanel from '../PlayNavigationPanel/PlayNavigationPanel';
import styles from './PlayContainer.module.css';

const PlayContainer: ParentComponent = () => {
  const [showPlayModal, setShowPlayModal] = createSignal(false);
  const [state, actions] = useGameStore();

  const inactiveGame = () => {
    return (
      !state.isGameOver &&
      state.moveHistory.length === 0 &&
      state.whiteTime === state.timeControl * 60
    );
  };

  const [quickPlayTime, quickPlayDifficulty, quickPlaySide] = getRandomQuickPlayConfig();
  onMount(() => {
    if (inactiveGame()) {
      actions.startNewGame(quickPlayTime, quickPlayDifficulty, quickPlaySide);
    }
  });

  return (
    <div class={styles.gameContainer}>
      <Show when={showPlayModal()}>
        <PlayModal onClose={() => setShowPlayModal(false)} />
      </Show>
      <div class={styles.gameLayout}>
        <div class={styles.panelWrapper}>
          <PlayNavigationPanel />
        </div>
        <div class={styles.boardWrapper}>
          <PlayBoardController />
        </div>
        <div class={styles.panelWrapper}>
          <PlayControlsPanel />
        </div>
      </div>
    </div>
  );
};

export default PlayContainer;
