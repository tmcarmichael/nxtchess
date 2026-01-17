import { createSignal, splitProps, Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useGameStore } from '../../../store';
import { GameMode, Side, StartGameOptions } from '../../../types';
import { TIME_VALUES_MINUTES } from '../../../shared';
import { preferences } from '../../../services';
import { ChessGameModal } from '../../chess/ChessGameModal';
import { ChessSideSelector } from '../../chess/ChessSideSelector';
import { ChessDifficultySlider } from '../../chess/ChessDifficultySlider';
import styles from './PlayModal.module.css';

interface PlayModalProps {
  onClose: () => void;
}

const PlayModal: Component<PlayModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose']);
  const [_, actions] = useGameStore();
  const navigate = useNavigate();

  // Load saved preferences with bounds validation
  const savedPrefs = preferences.get();
  const safeTimeIndex = Math.min(
    Math.max(0, savedPrefs.lastTimeIndex),
    TIME_VALUES_MINUTES.length - 1
  );
  const safeDifficultyIndex = Math.min(Math.max(0, savedPrefs.lastDifficultyIndex), 7);

  const [localTimeIndex, setLocalTimeIndex] = createSignal(safeTimeIndex);
  const [localDifficultyIndex, setLocalDifficultyIndex] = createSignal(safeDifficultyIndex);
  const [localPlayerColor, setLocalPlayerColor] = createSignal<Side>(savedPrefs.lastPlayerColor);

  const handleStartGame = () => {
    const selectedTime = TIME_VALUES_MINUTES[localTimeIndex()];
    const selectedLevel = localDifficultyIndex() + 1;
    const chosenSide = localPlayerColor();
    const mode: GameMode = 'play';

    // Save preferences for next session
    preferences.set({
      lastTimeIndex: localTimeIndex(),
      lastDifficultyIndex: localDifficultyIndex(),
      lastPlayerColor: chosenSide,
    });

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
    <ChessGameModal title="Play Against Computer" onClose={local.onClose}>
      <div class={styles.settingRow}>
        <label class={styles.rangeSliderLabel}>
          Time Control:&nbsp;&nbsp;&nbsp;{TIME_VALUES_MINUTES[localTimeIndex()]} min
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

      <ChessDifficultySlider
        difficultyIndex={localDifficultyIndex}
        onDifficultyChange={setLocalDifficultyIndex}
      />

      <div class={styles.settingRow}>
        <label class={styles.label}>Play As:</label>
        <ChessSideSelector selectedSide={localPlayerColor} onSideChange={setLocalPlayerColor} />
      </div>

      <div class={styles.modalActions}>
        <button class={styles.startButton} onClick={handleStartGame}>
          Start Game
        </button>
      </div>
    </ChessGameModal>
  );
};

export default PlayModal;
