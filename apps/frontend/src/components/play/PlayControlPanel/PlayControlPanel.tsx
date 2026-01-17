import { Show, createSignal, ParentComponent } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { StartGameOptions, GameMode } from '../../../types';
import { useGameStore } from '../../../store';
import Piece from '../../chess/ChessPiece/ChessPiece';
import { ChessMaterialDisplay } from '../../chess/ChessMaterialDisplay';
import ResignModal from '../PlayResignModal/PlayResignModal';
import ChessClock from '../../chess/ChessClock/ChessClock';
import { DIFFICULTY_VALUES_ELO } from '../../../shared';
import styles from './PlayControlPanel.module.css';

const PlayControlPanel: ParentComponent = () => {
  const navigate = useNavigate();
  const [state, actions, derived] = useGameStore();

  const [showResignModal, setShowResignModal] = createSignal(false);

  const handleResign = () => {
    // Only allow resign during active game
    if (!derived.isPlaying()) return;
    actions.resign();
    setShowResignModal(true);
  };

  const handleReplay = () => {
    const playGameConfig: StartGameOptions = {
      side: derived.opponentSide(),
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
          <ChessClock side={derived.opponentSide()} />
        </div>
        <div class={styles.panel}>
          <div class={styles.buttonPanel}>
            <button
              onClick={handleResign}
              class={styles.gamePanelButton}
              disabled={!derived.isPlaying()}
            >
              <span>Resign</span>
            </button>
            <button onClick={actions.flipBoardView} class={styles.gamePanelButton}>
              <span>Flip Board</span>
            </button>
            <button
              onClick={actions.takeBack}
              class={styles.gamePanelButton}
              disabled={!derived.isPlaying()}
            >
              <span>Take Back</span>
            </button>
          </div>
          <Show when={state.playerColor === 'w'}>
            <div class={styles.playerInfo}>
              <span>You play White pieces </span>
              <Piece type="wN" style={{ width: '32px', height: '32px' }} />
            </div>
          </Show>
          <Show when={state.playerColor === 'b'}>
            <div class={styles.playerInfo}>
              <span>You play Black pieces </span>
              <Piece type="bN" style={{ width: '32px', height: '32px' }} />
            </div>
          </Show>
          <div class={styles.difficulty}>
            <span class={styles.difficultyLabel}>Difficulty: </span>
            <span>{` ${DIFFICULTY_VALUES_ELO[state.difficulty - 1]} ELO`}</span>
          </div>
          <ChessMaterialDisplay
            material={derived.material}
            capturedWhite={state.capturedWhite}
            capturedBlack={state.capturedBlack}
          />
        </div>
        <div class={styles.clockWrapper}>
          <ChessClock side={state.playerColor} />
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
