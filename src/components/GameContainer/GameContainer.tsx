import { createSignal, Show } from 'solid-js';
import styles from './GameContainer.module.css';
import ChessGame from '../ChessGame/ChessGame';
import GamePanel from '../GamePanel/GamePanel';
import PlayModal from '../modals/PlayModal/PlayModal';
import { useGameStore } from '../../store/game/GameContext';

const GameContainer = () => {
  const { timeControl, startNewGame, playerColor, difficulty } = useGameStore();

  const [showPlayModal, setShowPlayModal] = createSignal(false);

  const handleStartGame = () => {
    setShowPlayModal(false);
    startNewGame(timeControl(), difficulty(), playerColor());
  };

  return (
    <div class={styles.gameContainer}>
      <Show when={showPlayModal()}>
        <PlayModal onClose={() => setShowPlayModal(false)} onStartGame={handleStartGame} />
      </Show>
      <div class={styles.gameLayout}>
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
