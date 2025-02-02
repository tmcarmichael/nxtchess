import { For, createSignal } from 'solid-js';
import styles from './PlayModal.module.css';
import { Difficulty, Side } from '../../../types';
import { useGameStore } from '../../../store/game/GameContext';

interface PlayModalProps {
  onClose: () => void;
  onStartGame: () => void;
}

export default function PlayModal({ onClose, onStartGame }: PlayModalProps) {
  const { setTimeControl, setDifficulty, setPlayerColor, startNewGame } = useGameStore();

  const [localTimeControl, setLocalTimeControl] = createSignal(5);
  const [localDifficulty, setLocalDifficulty] = createSignal<Difficulty>('medium');
  const [localPlayerColor, setLocalPlayerColor] = createSignal<Side>('w');

  const isSelected = (val: unknown, current: unknown) => val === current;

  const timeControlOptions = [3, 5, 10];
  const difficultyOptions = ['easy', 'medium', 'hard'];
  const sideOptions = [
    { value: 'w', label: 'White' },
    { value: 'b', label: 'Black' },
  ];

  const handleStartGame = () => {
    onStartGame();
    setTimeControl(localTimeControl());
    setDifficulty(localDifficulty());
    setPlayerColor(localPlayerColor());
    startNewGame(localTimeControl(), localDifficulty(), localPlayerColor());
    onClose();
  };

  return (
    <div class={styles.modalOverlay} onClick={onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button class={styles.closeButton} onClick={onClose} aria-label="Close Modal">
          &times;
        </button>
        <h2>Game Settings</h2>
        <div class={styles.settingRow}>
          <label class={styles.label}>Time Control</label>
          <div class={styles.optionRow}>
            <For each={timeControlOptions}>
              {(option) => (
                <button
                  classList={{
                    [styles.optionButton]: true,
                    [styles.selected]: isSelected(option, localTimeControl()),
                  }}
                  onClick={() => setLocalTimeControl(option as number)}
                >
                  {option} min
                </button>
              )}
            </For>
          </div>
        </div>
        <div class={styles.settingRow}>
          <label class={styles.label}>Difficulty</label>
          <div class={styles.optionRow}>
            <For each={difficultyOptions}>
              {(option) => (
                <button
                  classList={{
                    [styles.optionButton]: true,
                    [styles.selected]: isSelected(option, localDifficulty()),
                  }}
                  onClick={() => setLocalDifficulty(option as Difficulty)}
                >
                  {option[0].toUpperCase() + option.slice(1)}
                </button>
              )}
            </For>
          </div>
        </div>
        <div class={styles.settingRow}>
          <label class={styles.label}>Play As</label>
          <div class={styles.optionRow}>
            <For each={sideOptions}>
              {(option) => (
                <button
                  classList={{
                    [styles.optionButton]: true,
                    [styles.selected]: isSelected(option.value, localPlayerColor()),
                  }}
                  onClick={() => setLocalPlayerColor(option.value as Side)}
                >
                  {option.label}
                </button>
              )}
            </For>
          </div>
        </div>
        <div class={styles.modalActions}>
          <button onClick={handleStartGame}>Start Game</button>
        </div>
      </div>
    </div>
  );
}
