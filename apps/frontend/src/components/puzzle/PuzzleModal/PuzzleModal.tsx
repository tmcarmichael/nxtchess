import { useNavigate } from '@solidjs/router';
import { createSignal, For, Show, type ParentComponent, splitProps } from 'solid-js';
import { usePuzzleGameOptional } from '../../../store/game/PuzzleGameContext';
import { type PuzzleCategory, type StartGameOptions } from '../../../types/game';
import ChessGameModal from '../../chess/ChessGameModal/ChessGameModal';
import styles from './PuzzleModal.module.css';

interface PuzzleModalProps {
  onClose: () => void;
}

type PuzzleMode = 'casual' | 'rated';

interface CategoryOption {
  value: PuzzleCategory;
  label: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'mate-in-1', label: 'Mate in 1' },
  { value: 'mate-in-2', label: 'Mate in 2' },
  { value: 'mate-in-3', label: 'Mate in 3' },
  { value: 'random', label: 'Random' },
];

const PuzzleModal: ParentComponent<PuzzleModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose']);
  const navigate = useNavigate();
  const gameContext = usePuzzleGameOptional();

  const [puzzleMode, setPuzzleMode] = createSignal<PuzzleMode>('casual');
  const [localCategory, setLocalCategory] = createSignal<PuzzleCategory>('mate-in-1');

  const isStartDisabled = () => puzzleMode() === 'rated';

  const handleStartPuzzle = () => {
    if (isStartDisabled()) return;

    const puzzleConfig: StartGameOptions = {
      side: 'w',
      mode: 'puzzle',
      puzzleCategory: localCategory(),
    };

    if (gameContext) {
      local.onClose();
      gameContext.actions.startNewGame(puzzleConfig);
    } else {
      local.onClose();
      navigate('/puzzles', { replace: true, state: { quickStart: puzzleConfig } });
    }
  };

  return (
    <ChessGameModal title="Puzzles" onClose={local.onClose} size="sm">
      <div class={styles.puzzleSettingRow}>
        <label class={styles.settingLabel}>Mode:</label>
        <div class={styles.modeSelector}>
          <button
            class={styles.modeButton}
            classList={{
              [styles.modeButtonActive]: puzzleMode() === 'casual',
            }}
            onClick={() => setPuzzleMode('casual')}
          >
            Casual
          </button>
          <button
            class={styles.modeButton}
            classList={{
              [styles.modeButtonActive]: puzzleMode() === 'rated',
              [styles.modeButtonDisabled]: true,
            }}
            onClick={() => setPuzzleMode('rated')}
            disabled
          >
            Rated
          </button>
        </div>
      </div>

      <div class={styles.puzzleSettingRow}>
        <label class={styles.settingLabel}>Category:</label>
        <div class={styles.categoryGrid}>
          <For each={CATEGORY_OPTIONS}>
            {(option) => (
              <button
                class={styles.categoryButton}
                classList={{
                  [styles.categoryButtonActive]: localCategory() === option.value,
                }}
                onClick={() => setLocalCategory(option.value)}
              >
                {option.label}
              </button>
            )}
          </For>
        </div>
      </div>

      <div class={styles.modalActions}>
        <button
          class={styles.startButton}
          classList={{ [styles.startButtonDisabled]: isStartDisabled() }}
          onClick={handleStartPuzzle}
          disabled={isStartDisabled()}
        >
          Start Puzzle
        </button>
        <Show when={isStartDisabled()}>
          <p class={styles.comingSoonHint}>Rated puzzles coming soon</p>
        </Show>
      </div>
    </ChessGameModal>
  );
};

export default PuzzleModal;
