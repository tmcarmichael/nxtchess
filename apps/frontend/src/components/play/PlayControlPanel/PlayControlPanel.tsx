import { useNavigate } from '@solidjs/router';
import { Show, createSignal, type ParentComponent } from 'solid-js';
import { usePlayGame } from '../../../store/game/PlayGameContext';
import { type StartGameOptions, type GameMode } from '../../../types/game';
import ChessClock from '../../chess/ChessClock/ChessClock';
import ButtonPanel from '../../game/ButtonPanel/ButtonPanel';
import GameInfoPanel from '../../game/GameInfoPanel/GameInfoPanel';
import GamePanelButton from '../../game/GamePanelButton/GamePanelButton';
import ResignModal from '../PlayResignModal/PlayResignModal';
import styles from './PlayControlPanel.module.css';

const PlayControlPanel: ParentComponent = () => {
  const navigate = useNavigate();
  const { chess, engine, actions, derived } = usePlayGame();

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
          resignedSide={chess.state.playerColor}
        />
      </Show>
    </div>
  );
};

export default PlayControlPanel;
