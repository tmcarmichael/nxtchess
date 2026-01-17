import { ParentComponent } from 'solid-js';
import { useGameStore } from '../../../store';
import { ButtonPanel, GamePanelButton, GameInfoPanel } from '../../game';
import styles from './TrainingControlPanel.module.css';

const TrainingControlPanel: ParentComponent = () => {
  const [state, actions, derived] = useGameStore();

  const aiPlayStyleInfo = (
    <div class={styles.AIPlayStyle}>
      <span class={styles.AIPlayStyleLabel}>AI Playstyle:</span>
      <span>{` ${derived.formattedAIPlayStyle()}`}</span>
    </div>
  );

  return (
    <div class={styles.panel}>
      <ButtonPanel>
        <GamePanelButton onClick={actions.flipBoardView}>
          <span>Flip Board</span>
        </GamePanelButton>
      </ButtonPanel>
      <GameInfoPanel
        playerColor={state.playerColor}
        difficulty={state.difficulty}
        material={derived.material}
        capturedWhite={state.capturedWhite}
        capturedBlack={state.capturedBlack}
        extraInfo={aiPlayStyleInfo}
      />
    </div>
  );
};

export default TrainingControlPanel;
