import { type ParentComponent } from 'solid-js';
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
      <GameInfoPanel
        playerColor={chess.state.playerColor}
        difficulty={engine.state.difficulty}
        material={derived.material}
        capturedWhite={chess.state.capturedWhite}
        capturedBlack={chess.state.capturedBlack}
        extraInfo={aiPlayStyleInfo}
      />
    </div>
  );
};

export default TrainingControlPanel;
