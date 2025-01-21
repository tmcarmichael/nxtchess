import styles from './PlayModal.module.css';
import { createSignal } from 'solid-js';

export const PlayModal = ({
  onClose,
  onStartGame,
}: {
  onClose: () => void;
  onStartGame: (timeControl: number, difficulty: string) => void;
}) => {
  const [timeControl, setTimeControl] = createSignal(5);
  const [difficulty, setDifficulty] = createSignal('medium');

  const handleStartGame = () => {
    onStartGame(timeControl(), difficulty());
    onClose();
  };

  return (
    <div class={styles.modalOverlay} onClick={onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Game Settings</h2>
        <div class={styles.settings}>
          <div>
            <label>Time Control:</label>
            <select
              value={timeControl()}
              onChange={(e) => setTimeControl(parseInt(e.currentTarget.value))}
            >
              <option value="3">3 Minutes</option>
              <option value="5">5 Minutes</option>
              <option value="10">10 Minutes</option>
            </select>
          </div>
          <div>
            <label>Difficulty:</label>
            <select value={difficulty()} onChange={(e) => setDifficulty(e.currentTarget.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        <div class={styles.modalActions}>
          <button onClick={handleStartGame}>Start Game</button>
          <button onClick={onClose}>Cancel</button>
        </div>
        <button class={styles.closeButton} onClick={onClose}>
          x
        </button>
      </div>
    </div>
  );
};

export default PlayModal;
