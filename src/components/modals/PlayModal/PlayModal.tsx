import { createSignal } from 'solid-js';
import { useGameStore } from '../../../store/game/GameContext';
import { Side } from '../../../types';
import {
  TIME_VALUES_MINUTES,
  DIFFICULTY_VALUES_ELO,
  DIFFICULTY_VALUES_LEVEL,
} from '../../../utils';
import styles from './PlayModal.module.css';

const PlayModal = ({ onClose, onStartGame }: { onClose: () => void; onStartGame: () => void }) => {
  const [_, { setTimeControl, setDifficulty, setPlayerColor, startNewGame }] = useGameStore();

  const [localTimeIndex, setLocalTimeIndex] = createSignal(TIME_VALUES_MINUTES.indexOf(5));
  const [localDifficultyIndex, setLocalDifficultyIndex] = createSignal(4);
  const [localPlayerColor, setLocalPlayerColor] = createSignal<Side>('w');

  const handleStartGame = () => {
    onStartGame();
    const selectedTime = TIME_VALUES_MINUTES[localTimeIndex()];
    const selectedElo = DIFFICULTY_VALUES_ELO[localDifficultyIndex()];
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
            Time Control: {TIME_VALUES_MINUTES[localTimeIndex()]} min
          </label>
          <div class={styles.rangeSliderContainer}>
            <input
              class={styles.rangeSlider}
              type="range"
              min="0"
              max={TIME_VALUES_MINUTES.length - 1}
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
            Difficulty: {DIFFICULTY_VALUES_LEVEL[localDifficultyIndex()]} (ELO{' '}
            {DIFFICULTY_VALUES_ELO[localDifficultyIndex()]})
          </label>
          <div class={styles.rangeSliderContainer}>
            <input
              class={styles.rangeSlider}
              type="range"
              min="0"
              max={DIFFICULTY_VALUES_LEVEL.length - 1}
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
