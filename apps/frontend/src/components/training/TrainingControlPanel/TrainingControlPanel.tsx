import { Show, type ParentComponent } from 'solid-js';
import { useTrainingGame } from '../../../store/game/TrainingGameContext';
import ButtonPanel from '../../game/ButtonPanel/ButtonPanel';
import GameInfoPanel from '../../game/GameInfoPanel/GameInfoPanel';
import GamePanelButton from '../../game/GamePanelButton/GamePanelButton';
import styles from './TrainingControlPanel.module.css';

// Map difficulty level to human-readable label
const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Easy',
  3: 'Easy+',
  4: 'Medium',
  5: 'Medium+',
  6: 'Hard',
  7: 'Hard+',
  8: 'Expert',
  9: 'Expert+',
  10: 'Grandmaster',
};

// Map theme values to human-readable labels
const THEME_LABELS: Record<string, string> = {
  basicMate: 'Basic Mates',
  pawnEndgame: 'Pawn Endgame',
  rookEndgame: 'Rook Endgame',
  bishopEndgame: 'Bishop Endgame',
  knightEndgame: 'Knight Endgame',
  queenEndgame: 'Queen Endgame',
  queenRookEndgame: 'Queen & Rook Endgame',
  opposition: 'Opposition',
  lucena: 'Lucena Position',
  philidor: 'Philidor Position',
  zugzwang: 'Zugzwang',
};

const getDifficultyLabel = (level: number): string => DIFFICULTY_LABELS[level] || `Level ${level}`;
const getThemeLabel = (theme: string): string => THEME_LABELS[theme] || theme;

const TrainingControlPanel: ParentComponent = () => {
  const { chess, engine, ui, actions, derived } = useTrainingGame();

  const handleResign = () => {
    if (!derived.isPlaying()) return;
    actions.resign();
  };

  return (
    <div class={styles.trainingControlPanel}>
      <div class={styles.modeToggle}>
        <button
          classList={{
            [styles.modeButton]: true,
            [styles.modeButtonActive]: !ui.state.trainingFocusMode,
          }}
          onClick={() => ui.setFocusMode(false)}
        >
          Eval Mode
        </button>
        <button
          classList={{
            [styles.modeButton]: true,
            [styles.modeButtonActive]: ui.state.trainingFocusMode,
          }}
          onClick={() => ui.setFocusMode(true)}
        >
          Focus Mode
        </button>
      </div>
      <ButtonPanel>
        <GamePanelButton onClick={handleResign} disabled={!derived.isPlaying()}>
          <span>Resign</span>
        </GamePanelButton>
        <GamePanelButton onClick={actions.flipBoard}>
          <span>Flip Board</span>
        </GamePanelButton>
        <GamePanelButton onClick={actions.takeBack} disabled={!derived.isPlaying()}>
          <span>Take Back</span>
        </GamePanelButton>
      </ButtonPanel>
      {/* Hide material display for endgame training - positions start with pieces off board */}
      <Show when={chess.state.trainingGamePhase !== 'endgame'}>
        <GameInfoPanel
          playerColor={chess.state.playerColor}
          difficulty={engine.state.difficulty}
          material={derived.material}
          capturedWhite={chess.state.capturedWhite}
          capturedBlack={chess.state.capturedBlack}
        />
      </Show>
      <Show when={chess.state.trainingGamePhase === 'endgame'}>
        <div class={styles.endgameInfo}>
          <div class={styles.endgameInfoRow}>
            <span class={styles.endgameInfoLabel}>Playing as:</span>
            <span>{chess.state.playerColor === 'w' ? 'White' : 'Black'}</span>
          </div>
          <div class={styles.endgameInfoRow}>
            <span class={styles.endgameInfoLabel}>Difficulty:</span>
            <span>{getDifficultyLabel(engine.state.difficulty)}</span>
          </div>
          <Show when={chess.state.trainingTheme}>
            <div class={styles.endgameInfoRow}>
              <span class={styles.endgameInfoLabel}>Theme:</span>
              <span class={styles.themeValue}>{getThemeLabel(chess.state.trainingTheme!)}</span>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default TrainingControlPanel;
