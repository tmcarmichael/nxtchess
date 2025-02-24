import { createSignal, Show, ParentComponent } from 'solid-js';
import PlayBoardController from '../PlayBoardController/PlayBoardController';
import PlayControlsPanel from '../PlayControlsPanel/PlayControlsPanel';
import PlayModal from '../PlayModal/PlayModal';
import PlayNavigationPanel from '../PlayNavigationPanel/PlayNavigationPanel';
import styles from './PlayContainer.module.css';

const PlayContainer: ParentComponent = () => {
  const [showPlayModal, setShowPlayModal] = createSignal(false);

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
