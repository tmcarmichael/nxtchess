import { For, Show, type Component, type Accessor } from 'solid-js';
import { type PieceType } from '../../../types/chess';
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

// Piece order for display: pawns, knights, bishops, rooks, queens
const PIECE_ORDER = ['P', 'N', 'B', 'R', 'Q'] as const;

/**
 * Organize captured pieces by type in fixed order.
 * Returns pieces grouped: pawns first, then knights, bishops, rooks, queens.
 */
const organizePiecesByType = (pieces: string[]): string[] => {
  const grouped: Record<string, string[]> = {
    P: [],
    N: [],
    B: [],
    R: [],
    Q: [],
  };

  for (const piece of pieces) {
    const type = piece[1]?.toUpperCase();
    if (type && type in grouped) {
      grouped[type].push(piece);
    }
  }

  return PIECE_ORDER.flatMap((type) => grouped[type]);
};

const ChessMaterialDisplay: Component<ChessMaterialDisplayProps> = (props) => {
  const organizedWhite = () => organizePiecesByType(props.capturedWhite);
  const organizedBlack = () => organizePiecesByType(props.capturedBlack);

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
        {/* Black pieces captured by white */}
        <div class={styles.capturesRow}>
          <For each={organizedBlack()}>
            {(piece) => (
              <span class={styles.capturedPiece}>
                <Piece type={piece as PieceType} style={{ width: '24px', height: '24px' }} />
              </span>
            )}
          </For>
        </div>
        {/* White pieces captured by black */}
        <div class={styles.capturesRow}>
          <For each={organizedWhite()}>
            {(piece) => (
              <span class={styles.capturedPiece}>
                <Piece type={piece as PieceType} style={{ width: '24px', height: '24px' }} />
              </span>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default ChessMaterialDisplay;
