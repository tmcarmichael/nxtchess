import { PieceType } from '../../../types';
import { JSX, splitProps } from 'solid-js';
import styles from './GamePiece.module.css';

interface GamePieceProps {
  type: PieceType;
  draggable?: boolean;
  onDragStart?: (event: DragEvent) => void;
  style?: JSX.CSSProperties;
}

const GamePiece = (props: GamePieceProps) => {
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

export default GamePiece;
