import { createSignal, Show } from 'solid-js';
import GameBoardController from '../GameBoardController/GameBoardController';
import GameControlsPanel from '../GameControlsPanel/GameControlsPanel';
import PlayModal from '../../modals/PlayModal/PlayModal';
import NavigationPanel from '../GameNavigationPanel/GameNavigationPanel';
import styles from './GameContainer.module.css';

const GameContainer = () => {
  const [showPlayModal, setShowPlayModal] = createSignal(false);

  return (
    <div class={styles.gameContainer}>
      <Show when={showPlayModal()}>
        <PlayModal onClose={() => setShowPlayModal(false)} />
      </Show>
      <div class={styles.gameLayout}>
        <div class={styles.panelWrapper}>
          <NavigationPanel />
        </div>
        <div class={styles.boardWrapper}>
          <GameBoardController />
        </div>
        <div class={styles.panelWrapper}>
          <GameControlsPanel />
        </div>
      </div>
    </div>
  );
};

export default GameContainer;
