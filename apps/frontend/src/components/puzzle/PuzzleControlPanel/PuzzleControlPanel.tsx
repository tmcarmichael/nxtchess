import { Show, type ParentComponent } from 'solid-js';
import { usePuzzleGame } from '../../../store/game/PuzzleGameContext';
import ButtonPanel from '../../game/ButtonPanel/ButtonPanel';
import GamePanelButton from '../../game/GamePanelButton/GamePanelButton';
import PuzzleHistoryStrip from '../PuzzleHistoryStrip/PuzzleHistoryStrip';
import styles from './PuzzleControlPanel.module.css';

const CATEGORY_LABELS: Record<string, string> = {
  'mate-in-1': 'Mate in 1',
  'mate-in-2': 'Mate in 2',
  'mate-in-3': 'Mate in 3',
};

const PuzzleControlPanel: ParentComponent = () => {
  const { chess, ui, actions } = usePuzzleGame();

  const getCategoryLabel = (): string => {
    const cat = chess.state.puzzleCategory;
    if (!cat) return '';
    return CATEGORY_LABELS[cat] || cat;
  };

  return (
    <div class={styles.puzzleControlPanel}>
      <div class={styles.modeToggle}>
        <button
          classList={{
            [styles.modeButton]: true,
            [styles.modeButtonActive]: ui.state.trainingFocusMode,
          }}
          onClick={() => ui.setFocusMode(true)}
        >
          Focus Mode
        </button>
        <button
          classList={{
            [styles.modeButton]: true,
            [styles.modeButtonActive]: !ui.state.trainingFocusMode,
          }}
          onClick={() => ui.setFocusMode(false)}
        >
          Eval Mode
        </button>
      </div>
      <ButtonPanel>
        <GamePanelButton onClick={() => actions.loadNextPuzzle()}>
          <span>New Puzzle</span>
        </GamePanelButton>
        <GamePanelButton onClick={actions.flipBoard}>
          <span>Flip Board</span>
        </GamePanelButton>
      </ButtonPanel>
      <Show when={chess.state.lifecycle === 'playing' || chess.state.lifecycle === 'ended'}>
        <div class={styles.puzzleInfo}>
          <div class={styles.puzzleInfoRow}>
            <span class={styles.puzzleInfoLabel}>Playing as:</span>
            <span>{chess.state.playerColor === 'w' ? 'White' : 'Black'}</span>
          </div>
          <Show when={getCategoryLabel()}>
            <div class={styles.puzzleInfoRow}>
              <span class={styles.puzzleInfoLabel}>Category:</span>
              <span class={styles.puzzleInfoValue}>{getCategoryLabel()}</span>
            </div>
          </Show>
        </div>
      </Show>
      <PuzzleHistoryStrip refreshTrigger={chess.state.puzzleFeedback} />
    </div>
  );
};

export default PuzzleControlPanel;
