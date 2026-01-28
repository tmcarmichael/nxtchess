import { type ParentComponent } from 'solid-js';
import { useAnalyzeGame } from '../../../store/game/AnalyzeGameContext';
import ButtonPanel from '../../game/ButtonPanel/ButtonPanel';
import GamePanelButton from '../../game/GamePanelButton/GamePanelButton';
import styles from './AnalyzeControlPanel.module.css';

interface AnalyzeControlPanelProps {
  onImport: () => void;
}

const AnalyzeControlPanel: ParentComponent<AnalyzeControlPanelProps> = (props) => {
  const { actions } = useAnalyzeGame();

  const handleReset = () => {
    actions.resetToStart();
  };

  return (
    <div class={styles.panel}>
      <div class={styles.panelHeader}>Analysis Board</div>
      <p class={styles.description}>
        Move pieces freely for both sides. Use the evaluation bar to analyze positions.
      </p>
      <ButtonPanel>
        <GamePanelButton onClick={props.onImport}>
          <span>Import</span>
        </GamePanelButton>
        <GamePanelButton onClick={actions.flipBoard}>
          <span>Flip Board</span>
        </GamePanelButton>
        <GamePanelButton onClick={handleReset}>
          <span>Reset</span>
        </GamePanelButton>
      </ButtonPanel>
    </div>
  );
};

export default AnalyzeControlPanel;
