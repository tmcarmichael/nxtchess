import styles from './GamePanel.module.css';
import { For, Show, createMemo } from 'solid-js';
import { computeMaterial } from '../../logic/gameState';
import Piece from '../Piece/Piece';
import { PieceType } from '../../types';
import { useGameStore } from '../../store/game/GameContext';

const GamePanel = () => {
  const { boardSquares, capturedWhite, capturedBlack } = useGameStore();

  const handleResign = () => {
    alert('Resign button clicked - Placeholder functionality.');
  };

  const material = createMemo(() => computeMaterial(boardSquares()));

  return (
    <div class={styles.panel}>
      <div class={styles.materialContainer}>
        <div class="capturesRow">
          <For each={capturedBlack()}>
            {(cap) => (
              <span class={styles.capturedPiece}>
                <Piece type={cap as PieceType} style={{ width: '20px', height: '20px' }} />
              </span>
            )}
          </For>
        </div>
        <div class="capturesRow">
          <For each={capturedWhite()}>
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
