import styles from "./Piece.module.css";
import { PieceType } from "../../types/chessboard";
import { debugLog } from "../../utils";

const Piece = (props: { type: PieceType }) => {
  // debugLog("Rendering Piece:", props.type);
  const pieceSrc = `/assets/${props.type}.svg`;

  return <img src={pieceSrc} alt={props.type} class={styles.piece} />;
};

export default Piece;
