import { createSignal, Show, onMount } from 'solid-js';
import GameBoardController from '../GameBoardController/GameBoardController';
import GameControlsPanel from '../GameControlsPanel/GameControlsPanel';
import PlayModal from '../../modals/PlayModal/PlayModal';
import NavigationPanel from '../GameNavigationPanel/GameNavigationPanel';
import styles from './GameContainer.module.css';
import { useGameStore } from '../../../store/GameContext';

const GameContainer = () => {
  const [_, actions] = useGameStore();
  const [showPlayModal, setShowPlayModal] = createSignal(false);

  const refreshPlayDifficulty = Math.floor(Math.random() * (6 - 2 + 1)) + 2;
  const refreshPlayTime = 5;
  const refreshPlaySide = Math.random() < 0.5 ? 'w' : 'b';

  onMount(() => {
    actions.startNewGame(refreshPlayTime, refreshPlayDifficulty, refreshPlaySide);
  });

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
