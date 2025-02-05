import { createSignal } from 'solid-js';
import styles from './PlayModal.module.css';
import { Side } from '../../../types';
import { useGameStore } from '../../../store/game/GameContext';

const PlayModal = ({ onClose, onStartGame }: { onClose: () => void; onStartGame: () => void }) => {
  const { setTimeControl, setDifficulty, setPlayerColor, startNewGame } = useGameStore();

  const timeValues = [1, 2, 3, 5, 10, 15, 30];
  const difficultyValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const difficultyEloMap = [400, 500, 600, 800, 1000, 1200, 1400, 1700, 2000, 2400];

  const [localTimeIndex, setLocalTimeIndex] = createSignal(timeValues.indexOf(5));
  const [localDifficultyIndex, setLocalDifficultyIndex] = createSignal(4);

  const [localPlayerColor, setLocalPlayerColor] = createSignal<Side>('w');

  const handleStartGame = () => {
    onStartGame();
    const selectedTime = timeValues[localTimeIndex()];
    const selectedElo = difficultyEloMap[localDifficultyIndex()];
    setTimeControl(selectedTime);
    setDifficulty(selectedElo);
    setPlayerColor(localPlayerColor());
    startNewGame(selectedTime, selectedElo, localPlayerColor());
    onClose();
  };

  return (
    <div class={styles.modalOverlay} onClick={onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button class={styles.closeButton} onClick={onClose} aria-label="Close Modal">
          &times;
        </button>
        <h2>Play Against Computer</h2>
        <div class={styles.settingRow}>
          <label class={styles.rangeSliderLabel}>
            Time Control: {timeValues[localTimeIndex()]} min
          </label>
          <div class={styles.rangeSliderContainer}>
            <input
              class={styles.rangeSlider}
              type="range"
              min="0"
              max={timeValues.length - 1}
              step="1"
              value={localTimeIndex()}
              onInput={(e) => {
                const idx = +e.currentTarget.value;
                setLocalTimeIndex(idx);
              }}
            />
          </div>
        </div>
        <div class={styles.settingRow}>
          <label class={styles.rangeSliderLabel}>
            Difficulty: {difficultyValues[localDifficultyIndex()]} (ELO{' '}
            {difficultyEloMap[localDifficultyIndex()]})
          </label>
          <div class={styles.rangeSliderContainer}>
            <input
              class={styles.rangeSlider}
              type="range"
              min="0"
              max={difficultyValues.length - 1}
              step="1"
              value={localDifficultyIndex()}
              onInput={(e) => {
                const idx = +e.currentTarget.value;
                setLocalDifficultyIndex(idx);
              }}
            />
          </div>
        </div>
        <div class={styles.settingRow}>
          <label class={styles.label}>Play As</label>
          <div class={styles.knightSelector}>
            <div
              classList={{
                [styles.knightButton]: true,
                [styles.selectedKnight]: localPlayerColor() === 'w',
              }}
              onClick={() => setLocalPlayerColor('w')}
            >
              <img src="/assets/wN.svg" alt="White Knight" />
            </div>

            <div
              classList={{
                [styles.knightButton]: true,
                [styles.selectedKnight]: localPlayerColor() === 'b',
              }}
              onClick={() => setLocalPlayerColor('b')}
            >
              <img src="/assets/bN.svg" alt="Black Knight" />
            </div>
          </div>
        </div>
        <div class={styles.modalActions}>
          <button onClick={handleStartGame}>Start Game</button>
        </div>
      </div>
    </div>
  );
};

export default PlayModal;
