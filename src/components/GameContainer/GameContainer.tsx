import { createSignal, Show } from 'solid-js';
import styles from './GameContainer.module.css';
import ChessGame from '../ChessGame/ChessGame';
import GamePanel from '../GamePanel/GamePanel';
import PlayModal from '../modals/PlayModal/PlayModal';
import NavigationPanel from '../NavigationPanel/NavigationPanel';

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
          <ChessGame />
        </div>
        <div class={styles.panelWrapper}>
          <GamePanel />
        </div>
      </div>
    </div>
  );
};

export default GameContainer;
