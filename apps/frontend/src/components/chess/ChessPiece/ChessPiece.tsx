import { type JSX, splitProps, type Component } from 'solid-js';
import { type PieceType } from '../../../types/chess';
import styles from './ChessPiece.module.css';

interface GamePieceProps {
  type: PieceType;
  draggable?: boolean;
  onDragStart?: (event: DragEvent) => void;
  onTouchStart?: (event: TouchEvent) => void;
  style?: JSX.CSSProperties;
}

const ChessPiece: Component<GamePieceProps> = (props: GamePieceProps) => {
  const [local] = splitProps(props, ['type', 'draggable', 'onDragStart', 'onTouchStart', 'style']);
  const pieceSrc = `/assets/${local.type}.svg`;

  return (
    <img
      src={pieceSrc}
      alt={local.type}
      class={styles.chessPiece}
      draggable={local.draggable}
      onDragStart={local.onDragStart}
      onTouchStart={local.onTouchStart}
      style={local.style}
    />
  );
};

export default ChessPiece;
