import { createSignal, splitProps, Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useGameStore } from '../../../store/GameContext';
import { GameMode, Side, StartGameOptions } from '../../../types';
import {
  TIME_VALUES_MINUTES,
  DIFFICULTY_VALUES_ELO,
  DIFFICULTY_VALUES_LEVEL,
} from '../../../utils/constants';
import styles from './PlayModal.module.css';

interface PlayModalProps {
  onClose: () => void;
}

const PlayModal: Component<PlayModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose']);
  const [_, actions] = useGameStore();
  const navigate = useNavigate();
  const [localTimeIndex, setLocalTimeIndex] = createSignal(TIME_VALUES_MINUTES.indexOf(5));
  const [localDifficultyIndex, setLocalDifficultyIndex] = createSignal(3);
  const [localPlayerColor, setLocalPlayerColor] = createSignal<Side>('w');

  const handleStartGame = () => {
    const selectedTime = TIME_VALUES_MINUTES[localTimeIndex()];
    const selectedLevel = localDifficultyIndex() + 1;
    const chosenSide = localPlayerColor();
    const mode: GameMode = 'play';
    const playGameConfig: StartGameOptions = {
      side: chosenSide,
      mode: mode,
      newTimeControl: selectedTime,
      newDifficultyLevel: selectedLevel,
    };
    navigate('/play', { replace: true });
    actions.startNewGame(playGameConfig);
    local.onClose();
  };

  return (
    <div class={styles.modalOverlay} onClick={local.onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button class={styles.closeButton} onClick={local.onClose} aria-label="Close">
          <span class={styles.closeIcon}>&times;</span>
        </button>
        <h2>Play Against Computer</h2>
        <div class={styles.settingRow}>
          <label class={styles.rangeSliderLabel}>
            Time Control:&nbsp&nbsp&nbsp{TIME_VALUES_MINUTES[localTimeIndex()]} min
          </label>
          <div class={styles.rangeSliderContainer}>
            <input
              class={styles.rangeSlider}
              type="range"
              min="0"
              max={TIME_VALUES_MINUTES.length - 1}
              step="1"
              value={localTimeIndex()}
              onInput={(e) => setLocalTimeIndex(+e.currentTarget.value)}
            />
          </div>
        </div>
        <div class={styles.settingRow}>
          <label class={styles.rangeSliderLabel}>
            Difficulty:&nbsp&nbsp&nbsp{DIFFICULTY_VALUES_LEVEL[localDifficultyIndex()]} (ELO{' '}
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
              onInput={(e) => setLocalDifficultyIndex(+e.currentTarget.value)}
            />
          </div>
        </div>
        <div class={styles.settingRow}>
          <label class={styles.label}>Play As:</label>
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
          <button class={styles.startButton} onClick={handleStartGame}>
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayModal;
