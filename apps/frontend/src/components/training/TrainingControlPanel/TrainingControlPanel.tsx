import { type ParentComponent } from 'solid-js';
import { useGame } from '../../../store';
import { ButtonPanel, GamePanelButton, GameInfoPanel } from '../../game';
import styles from './TrainingControlPanel.module.css';

const TrainingControlPanel: ParentComponent = () => {
  const { chess, engine, ui, derived } = useGame();

  const aiPlayStyleInfo = (
    <div class={styles.AIPlayStyle}>
      <span class={styles.AIPlayStyleLabel}>AI Playstyle:</span>
      <span>{` ${derived.formattedAIPlayStyle()}`}</span>
    </div>
  );

  return (
    <div class={styles.panel}>
      <ButtonPanel>
        <GamePanelButton onClick={ui.flipBoard}>
          <span>Flip Board</span>
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
