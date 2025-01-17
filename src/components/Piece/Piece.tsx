import styles from "./Piece.module.css";
import { PieceType } from "../../types";

const Piece = ({
  type,
  draggable = false,
  onDragStart,
}: {
  type: PieceType;
  draggable?: boolean;
  onDragStart?: (event: DragEvent) => void;
}) => {
  const pieceSrc = `/assets/${type}.svg`;

  return (
    <img
      src={pieceSrc}
      alt={type}
      class={styles.piece}
      draggable={draggable}
      onDragStart={onDragStart}
    />
  );
};

export default Piece;
