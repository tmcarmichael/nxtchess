import { createSignal, Show, For } from 'solid-js';
import styles from './PlayModal.module.css';

type Difficulty = 'easy' | 'medium' | 'hard';
type Side = 'w' | 'b';
const TIME_CONTROL_OPTIONS = [3, 5, 10];
const DIFFICULTY_OPTIONS: Difficulty[] = ['easy', 'medium', 'hard'];
const SIDE_OPTIONS: { value: Side; label: string }[] = [
  { value: 'w', label: 'White' },
  { value: 'b', label: 'Black' },
];

export interface PlayModalProps {
  onClose: () => void;
  onStartGame: (timeControl: number, difficulty: Difficulty, side: Side) => void;
}

export default function PlayModal(props: PlayModalProps) {
  const [timeControl, setTimeControl] = createSignal<number>(5);
  const [difficulty, setDifficulty] = createSignal<Difficulty>('medium');
  const [side, setSide] = createSignal<Side>('w');

  const handleStartGame = () => {
    props.onStartGame(timeControl(), difficulty(), side());
    props.onClose();
  };
  const isSelected = (currentVal: any, signalVal: any) => currentVal === signalVal;

  return (
    <div class={styles.modalOverlay} onClick={props.onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Game Settings</h2>
        <Show when={TIME_CONTROL_OPTIONS.length > 0}>
          <div class={styles.settingRow}>
            <label class={styles.label}>Time Control</label>
            <div class={styles.optionRow}>
              <For each={TIME_CONTROL_OPTIONS}>
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
        </Show>
        <Show when={DIFFICULTY_OPTIONS.length > 0}>
          <div class={styles.settingRow}>
            <label class={styles.label}>Difficulty</label>
            <div class={styles.optionRow}>
              <For each={DIFFICULTY_OPTIONS}>
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
        </Show>
        <Show when={SIDE_OPTIONS.length > 0}>
          <div class={styles.settingRow}>
            <label class={styles.label}>Play As</label>
            <div class={styles.optionRow}>
              <For each={SIDE_OPTIONS}>
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
        </Show>
        <div class={styles.modalActions}>
          <button onClick={handleStartGame}>Start Game</button>
        </div>
        <button class={styles.closeButton} onClick={props.onClose}>
          &times;
        </button>
      </div>
    </div>
  );
}
