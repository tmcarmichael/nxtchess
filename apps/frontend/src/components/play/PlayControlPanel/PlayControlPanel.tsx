import { usePlayGame } from '../../../store/game/PlayGameContext';
import ButtonPanel from '../../game/ButtonPanel/ButtonPanel';
import GameInfoPanel from '../../game/GameInfoPanel/GameInfoPanel';
import GamePanelButton from '../../game/GamePanelButton/GamePanelButton';
import styles from './PlayControlPanel.module.css';
import type { ParentComponent } from 'solid-js';

const PlayControlPanel: ParentComponent = () => {
  const { chess, engine, actions, derived } = usePlayGame();

  const handleResign = () => {
    if (!derived.isPlaying()) return;
    actions.resign();
  };

  return (
    <div>
      <div class={styles.panel}>
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
          difficulty={derived.isMultiplayer() ? undefined : engine.state.difficulty}
          material={derived.material}
          capturedWhite={chess.state.capturedWhite}
          capturedBlack={chess.state.capturedBlack}
        />
      </div>
    </div>
  );
};

export default PlayControlPanel;
