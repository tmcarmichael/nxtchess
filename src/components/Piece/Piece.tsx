import styles from "./Piece.module.css";
import { PieceType } from "../../types/chessboard";

const Piece = (props: { type: PieceType }) => {
  const pieceSrc = `/assets/${props.type}.svg`;

  return <img src={pieceSrc} alt={props.type} class={styles.piece} />;
};

export default Piece;
