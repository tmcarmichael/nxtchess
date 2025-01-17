import styles from "./ChessBoard.module.css";
import Piece from "../Piece/Piece";
import { Square, PieceType } from "../../types";
import { debugLog } from "../../utils";

const ChessBoard = ({
  board,
  highlightedMoves,
  selectedSquare,
  onSquareClick,
}: {
  board: () => { square: Square; piece: string | null }[];
  highlightedMoves: () => Square[];
  selectedSquare: Square | null;
  onSquareClick: (square: Square) => void;
}) => {
  return (
    <div class={styles.board}>
      {board().map(({ square, piece }) => {
        const isHighlightedMove = highlightedMoves().includes(square);
        const isSelected = selectedSquare === square;
        const [file, rank] = square;
        // debugLog("Rendering square:", square, "Is Selected:", isSelected);
        return (
          <div
            class={`${styles.square} ${
              (file.charCodeAt(0) - 97 + parseInt(rank)) % 2 === 0 ? styles.light : styles.dark
            } ${isSelected ? styles.selected : ""}`}
            onClick={() => onSquareClick(square)}
          >
            {isHighlightedMove && <div class={styles.highlightDot}></div>}{" "}
            {piece && <Piece type={piece as PieceType} />}
          </div>
        );
      })}
    </div>
  );
};

export default ChessBoard;
