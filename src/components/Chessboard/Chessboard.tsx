import styles from "./ChessBoard.module.css";
import Piece from "../Piece/Piece";
import { fenToBoard } from "../../logic/fenLogic";
import { Square } from "../../types";

const ChessBoard = ({
  fen,
  highlightedMoves,
  onSquareClick,
}: {
  fen: string;
  highlightedMoves: Square[];
  onSquareClick: (square: Square) => void;
}) => {
  const board = fenToBoard(fen);

  return (
    <div class={styles.board}>
      {board.map(({ square, piece }) => {
        const isHighlighted = highlightedMoves.includes(square);
        const [file, rank] = square;

        return (
          <div
            class={`${styles.square} ${
              (file.charCodeAt(0) - 97 + parseInt(rank)) % 2 === 0 ? styles.light : styles.dark
            } ${isHighlighted ? styles.highlight : ""}`}
            onClick={() => onSquareClick(square)}
          >
            {piece && <Piece type={piece} />}
          </div>
        );
      })}
    </div>
  );
};

export default ChessBoard;
