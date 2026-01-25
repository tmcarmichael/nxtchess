import { Show, type ParentComponent } from 'solid-js';
import { useTrainingGame } from '../../../store/game/TrainingGameContext';
import ButtonPanel from '../../game/ButtonPanel/ButtonPanel';
import GameInfoPanel from '../../game/GameInfoPanel/GameInfoPanel';
import GamePanelButton from '../../game/GamePanelButton/GamePanelButton';
import styles from './TrainingControlPanel.module.css';

const TrainingControlPanel: ParentComponent = () => {
  const { chess, engine, ui, actions, derived } = useTrainingGame();

  const handleResign = () => {
    if (!derived.isPlaying()) return;
    actions.resign();
  };

  const aiPlayStyleInfo = (
    <div class={styles.AIPlayStyle}>
      <span class={styles.AIPlayStyleLabel}>AI Playstyle:</span>
      <span>{` ${derived.formattedAIPlayStyle()}`}</span>
    </div>
  );

  return (
    <div class={styles.panel}>
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
          extraInfo={aiPlayStyleInfo}
        />
      </Show>
      <Show when={chess.state.trainingGamePhase === 'endgame'}>
        <div class={styles.endgameInfo}>
          <div class={styles.infoRow}>
            <span class={styles.infoLabel}>Playing as:</span>
            <span>{chess.state.playerColor === 'w' ? 'White' : 'Black'}</span>
          </div>
          <div class={styles.infoRow}>
            <span class={styles.infoLabel}>Difficulty:</span>
            <span>{engine.state.difficulty}</span>
          </div>
          <Show when={chess.state.trainingTheme}>
            <div class={styles.infoRow}>
              <span class={styles.infoLabel}>Theme:</span>
              <span class={styles.themeValue}>{chess.state.trainingTheme}</span>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default TrainingControlPanel;
