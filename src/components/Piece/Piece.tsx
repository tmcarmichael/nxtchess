import styles from "./Piece.module.css";
import { PieceType } from "../../types";
import { JSX } from "solid-js";

const Piece = ({
  type,
  draggable = false,
  onDragStart,
  style,
}: {
  type: PieceType;
  draggable?: boolean;
  onDragStart?: (event: DragEvent) => void;
  style?: JSX.CSSProperties;
}) => {
  const pieceSrc = `/assets/${type}.svg`;

  return (
    <img
      src={pieceSrc}
      alt={type}
      class={styles.piece}
      draggable={draggable}
      onDragStart={onDragStart}
      style={style}
    />
  );
};

export default Piece;
