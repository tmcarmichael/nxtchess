import { createSignal, For } from 'solid-js';
import styles from './PlayModal.module.css';
import { PlayModalProps, Difficulty, Side } from '../../../types';

export default function PlayModal({
  onClose,
  onStartGame,
  initialSettings,
  timeControlOptions = [3, 5, 10],
  difficultyOptions = ['easy', 'medium', 'hard'],
  sideOptions = [
    { value: 'w', label: 'White' },
    { value: 'b', label: 'Black' },
  ],
}: PlayModalProps) {
  const [timeControl, setTimeControl] = createSignal(initialSettings.timeControl);
  const [difficulty, setDifficulty] = createSignal<Difficulty>(initialSettings.difficulty);
  const [side, setSide] = createSignal<Side>(initialSettings.side);
  const isSelected = (val: unknown, current: unknown) => val === current;
  const handleStartGame = () => {
    onStartGame({
      timeControl: timeControl(),
      difficulty: difficulty(),
      side: side(),
    });
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
                    [styles.selected]: isSelected(option, timeControl()),
                  }}
                  onClick={() => setTimeControl(option)}
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
                    [styles.selected]: isSelected(option, difficulty()),
                  }}
                  onClick={() => setDifficulty(option)}
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
                    [styles.selected]: isSelected(option.value, side()),
                  }}
                  onClick={() => setSide(option.value)}
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
