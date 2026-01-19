import { Show, createSignal, ParentComponent } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { StartGameOptions, GameMode } from '../../../types';
import { useGame } from '../../../store';
import { ButtonPanel, GamePanelButton, GameInfoPanel } from '../../game';
import ResignModal from '../PlayResignModal/PlayResignModal';
import ChessClock from '../../chess/ChessClock/ChessClock';
import styles from './PlayControlPanel.module.css';

const PlayControlPanel: ParentComponent = () => {
  const navigate = useNavigate();
  const { chess, engine, ui, actions, derived } = useGame();

  const [showResignModal, setShowResignModal] = createSignal(false);

  const handleResign = () => {
    if (!derived.isPlaying()) return;
    actions.resign();
    setShowResignModal(true);
  };

  const handleReplay = () => {
    const playGameConfig: StartGameOptions = {
      side: chess.derived.opponentSide(),
      mode: 'play' as GameMode,
    };
    actions.startNewGame(playGameConfig);
    setShowResignModal(false);
  };

  const handleHome = () => {
    actions.exitGame();
    navigate('/');
    setShowResignModal(false);
  };

  return (
    <div>
      <div class={styles.clockLayout}>
        <div class={styles.clockWrapper}>
          <ChessClock side={chess.derived.opponentSide()} />
        </div>
        <div class={styles.panel}>
          <ButtonPanel>
            <GamePanelButton onClick={handleResign} disabled={!derived.isPlaying()}>
              <span>Resign</span>
            </GamePanelButton>
            <GamePanelButton onClick={ui.flipBoard}>
              <span>Flip Board</span>
            </GamePanelButton>
            <GamePanelButton onClick={chess.takeBack} disabled={!derived.isPlaying()}>
              <span>Take Back</span>
            </GamePanelButton>
          </ButtonPanel>
          <GameInfoPanel
            playerColor={chess.state.playerColor}
            difficulty={engine.state.difficulty}
            material={derived.material}
            capturedWhite={chess.state.capturedWhite}
            capturedBlack={chess.state.capturedBlack}
          />
        </div>
        <div class={styles.clockWrapper}>
          <ChessClock side={chess.state.playerColor} />
        </div>
      </div>
      <Show when={showResignModal()}>
        <ResignModal
          onClose={() => setShowResignModal(false)}
          onReplay={handleReplay}
          onHome={handleHome}
        />
      </Show>
    </div>
  );
};

export default PlayControlPanel;
