import { Show, ParentComponent } from 'solid-js';
import { useGameStore } from '../../../store';
import Piece from '../../chess/ChessPiece/ChessPiece';
import { ChessMaterialDisplay } from '../../chess/ChessMaterialDisplay';
import { DIFFICULTY_VALUES_ELO } from '../../../shared';
import styles from './TrainingControlPanel.module.css';

const TrainingControlPanel: ParentComponent = () => {
  const [state, actions, derived] = useGameStore();

  return (
    <div>
      <div class={styles.panel}>
        <div class={styles.buttonPanel}>
          <button onClick={actions.flipBoardView} class={styles.gamePanelButton}>
            <span>Flip Board</span>
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
        <div class={styles.AIPlayStyle}>
          <span class={styles.AIPlayStyleLabel}>AI Playstyle:</span>
          <span>{` ${derived.formattedAIPlayStyle()}`}</span>
        </div>
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
    </div>
  );
};

export default TrainingControlPanel;
