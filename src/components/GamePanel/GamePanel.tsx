import styles from './GamePanel.module.css';
import { For, Show, createMemo } from 'solid-js';
import { computeMaterial } from '../../logic/gameState';
import Piece from '../Piece/Piece';
import { PieceType } from '../../types';

const GamePanel = (props: {
  capturedWhite: () => string[];
  capturedBlack: () => string[];
  board: () => import('../../types').BoardSquare[];
}) => {
  const handleResign = () => {
    alert('Resign button clicked - Placeholder functionality.');
  };

  const material = createMemo(() => {
    return computeMaterial(props.board());
  });

  return (
    <div class={styles.panel}>
      <div class={styles.materialContainer}>
        <div class="capturesRow">
          {/* <span class={styles.capturedLabel}></span> */}
          <For each={props.capturedBlack()}>
            {(cap) => (
              <span class={styles.capturedPiece}>
                <Piece type={cap as PieceType} style={{ width: '20px', height: '20px' }} />
              </span>
            )}
          </For>
        </div>
        <div class="capturesRow">
          {/* <span class={styles.capturedLabel}></span> */}
          <For each={props.capturedWhite()}>
            {(cap) => (
              <span class={styles.capturedPiece}>
                <Piece type={cap as PieceType} style={{ width: '20px', height: '20px' }} />
              </span>
            )}
          </For>
        </div>
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
      </div>
      <div>
        <button class={styles.panelButton} onClick={handleResign}>
          <span>Resign</span>
        </button>
      </div>
    </div>
  );
};

export default GamePanel;
