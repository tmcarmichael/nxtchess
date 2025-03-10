import { For, Show, createMemo, ParentComponent } from 'solid-js';
import { computeMaterial } from '../../../services/chessGameService';
import { PieceType } from '../../../types';
import { useGameStore } from '../../../store/GameContext';
import Piece from '../../chess/ChessPiece/ChessPiece';
import { DIFFICULTY_VALUES_ELO } from '../../../utils';
import styles from './TrainingControlPanel.module.css';

const TrainingControlPanel: ParentComponent = () => {
  const [state, actions] = useGameStore();
  const material = createMemo(() => computeMaterial(actions.boardSquares()));
  const flipBoardView = () => {
    actions.setBoardView((c) => (c === 'w' ? 'b' : 'w'));
  };
  const formattedAIPlayStyle = state.trainingAIPlayStyle
    ? state.trainingAIPlayStyle.charAt(0).toUpperCase() + state.trainingAIPlayStyle.slice(1)
    : '';
  console.log(formattedAIPlayStyle);

  return (
    <div>
      <div class={styles.panel}>
        <div class={styles.buttonPanel}>
          <button onClick={flipBoardView} class={styles.gamePanelButton}>
            <span>Flip Board 🔄</span>
          </button>
        </div>
        <Show when={actions.playerColor() === 'w'}>
          <div class={styles.playerInfo}>
            <span>You play White pieces </span>
            <Piece type="wN" style={{ width: '32px', height: '32px' }} />
          </div>
        </Show>
        <Show when={actions.playerColor() === 'b'}>
          <div class={styles.playerInfo}>
            <span>You play Black pieces </span>
            <Piece type="bN" style={{ width: '32px', height: '32px' }} />
          </div>
        </Show>
        <div class={styles.AIPlayStyle}>
          <span class={styles.AIPlayStyleLabel}>AI Playstyle:</span>
          <span>{` ${formattedAIPlayStyle}`}</span>
        </div>
        <div class={styles.difficulty}>
          <span class={styles.difficultyLabel}>Difficulty: </span>
          <span>{` ${DIFFICULTY_VALUES_ELO[actions.difficulty() - 1]} ELO`}</span>
        </div>
        <div class={styles.materialContainer}>
          <div class={styles.materialDiff}>
            <Show when={material().diff !== 0}>
              <span>
                {material().diff > 0 ? `White +${material().diff}` : `Black +${-material().diff}`}
              </span>
            </Show>
            <Show when={material().diff === 0}>
              <span>Material equal</span>
            </Show>
          </div>
          <div class={styles.capturesContainer}>
            <div class="capturesRow">
              <For each={actions.capturedBlack()}>
                {(cap) => (
                  <span class={styles.capturedPiece}>
                    <Piece type={cap as PieceType} style={{ width: '24px', height: '24px' }} />
                  </span>
                )}
              </For>
            </div>
            <div class="capturesRow">
              <For each={actions.capturedWhite()}>
                {(cap) => (
                  <span class={styles.capturedPiece}>
                    <Piece type={cap as PieceType} style={{ width: '24px', height: '24px' }} />
                  </span>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingControlPanel;
