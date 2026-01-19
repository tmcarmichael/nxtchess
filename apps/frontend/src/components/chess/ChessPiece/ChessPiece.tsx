import { type JSX, splitProps, type Component } from 'solid-js';
import { type PieceType } from '../../../types/chess';
import styles from './ChessPiece.module.css';

interface GamePieceProps {
  type: PieceType;
  draggable?: boolean;
  onDragStart?: (event: DragEvent) => void;
  style?: JSX.CSSProperties;
}

const ChessPiece: Component<GamePieceProps> = (props: GamePieceProps) => {
  const [local] = splitProps(props, ['type', 'draggable', 'onDragStart', 'style']);
  const pieceSrc = `/assets/${local.type}.svg`;

  return (
    <img
      src={pieceSrc}
      alt={local.type}
      class={styles.piece}
      draggable={local.draggable}
      onDragStart={local.onDragStart}
      style={local.style}
    />
  );
};

export default ChessPiece;
