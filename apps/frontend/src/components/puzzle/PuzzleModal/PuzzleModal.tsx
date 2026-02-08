import { useNavigate } from '@solidjs/router';
import { createSignal, createMemo, For, Show, type ParentComponent, splitProps } from 'solid-js';
import { usePuzzleGameOptional } from '../../../store/game/PuzzleGameContext';
import { useUserStore } from '../../../store/user/UserContext';
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

const RATED_CATEGORIES: PuzzleCategory[] = ['mate-in-2', 'mate-in-3'];

const PuzzleModal: ParentComponent<PuzzleModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose']);
  const navigate = useNavigate();
  const gameContext = usePuzzleGameOptional();
  const [userState] = useUserStore();

  const [puzzleMode, setPuzzleMode] = createSignal<PuzzleMode>('casual');
  const [localCategory, setLocalCategory] = createSignal<PuzzleCategory>('mate-in-1');

  const canPlayRated = () => userState.isLoggedIn;

  const availableCategories = createMemo(() => {
    if (puzzleMode() === 'rated') {
      return CATEGORY_OPTIONS.filter((opt) => RATED_CATEGORIES.includes(opt.value));
    }
    return CATEGORY_OPTIONS;
  });

  const handleModeChange = (mode: PuzzleMode) => {
    if (mode === 'rated' && !canPlayRated()) return;
    setPuzzleMode(mode);
    if (mode === 'rated') {
      const current = localCategory();
      if (!RATED_CATEGORIES.includes(current)) {
        setLocalCategory('mate-in-2');
      }
    }
  };

  const handleStartPuzzle = () => {
    const puzzleConfig: StartGameOptions = {
      side: 'w',
      mode: 'puzzle',
      puzzleCategory: localCategory(),
      puzzleRated: puzzleMode() === 'rated',
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
    <ChessGameModal title="Puzzles" onClose={local.onClose}>
      <div class={styles.puzzleSettingRow}>
        <label class={styles.settingLabel}>Mode:</label>
        <div class={styles.modeSelector}>
          <button
            class={styles.modeButton}
            classList={{
              [styles.modeButtonActive]: puzzleMode() === 'casual',
            }}
            onClick={() => handleModeChange('casual')}
          >
            Casual
          </button>
          <button
            class={styles.modeButton}
            classList={{
              [styles.modeButtonActive]: puzzleMode() === 'rated',
              [styles.modeButtonDisabled]: !canPlayRated(),
            }}
            onClick={() => handleModeChange('rated')}
            disabled={!canPlayRated()}
          >
            Rated
          </button>
        </div>
        <Show when={!canPlayRated()}>
          <p class={styles.comingSoonHint}>Sign in to play rated</p>
        </Show>
      </div>

      <div class={styles.puzzleSettingRow}>
        <label class={styles.settingLabel}>Category:</label>
        <div class={styles.categoryGrid}>
          <For each={availableCategories()}>
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
        <button class={styles.startButton} onClick={handleStartPuzzle}>
          Start Puzzle
        </button>
      </div>
    </ChessGameModal>
  );
};

export default PuzzleModal;
