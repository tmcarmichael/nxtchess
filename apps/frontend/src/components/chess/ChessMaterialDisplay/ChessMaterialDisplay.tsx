import { For, Show, type Component, type Accessor } from 'solid-js';
import { type PieceType } from '../../../types';
import Piece from '../ChessPiece/ChessPiece';
import styles from './ChessMaterialDisplay.module.css';

interface MaterialData {
  diff: number;
}

interface ChessMaterialDisplayProps {
  material: Accessor<MaterialData>;
  capturedWhite: string[];
  capturedBlack: string[];
}

const ChessMaterialDisplay: Component<ChessMaterialDisplayProps> = (props) => {
  return (
    <div class={styles.materialContainer}>
      <div class={styles.materialDiff}>
        <Show when={props.material().diff !== 0}>
          <span>
            {props.material().diff > 0
              ? `White +${props.material().diff}`
              : `Black +${-props.material().diff}`}
          </span>
        </Show>
        <Show when={props.material().diff === 0}>
          <span>Material equal</span>
        </Show>
      </div>
      <div class={styles.capturesContainer}>
        <div class={styles.capturesRow}>
          <For each={props.capturedBlack}>
            {(cap) => (
              <span class={styles.capturedPiece}>
                <Piece type={cap as PieceType} style={{ width: '24px', height: '24px' }} />
              </span>
            )}
          </For>
        </div>
        <div class={styles.capturesRow}>
          <For each={props.capturedWhite}>
            {(cap) => (
              <span class={styles.capturedPiece}>
                <Piece type={cap as PieceType} style={{ width: '24px', height: '24px' }} />
              </span>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default ChessMaterialDisplay;
