import { createSignal } from "solid-js";
import Piece from "../Piece/Piece";
import styles from "./Chessboard.module.css";
import { PieceType, Square } from "../../types/chessboard";

const initialBoardState = (): (PieceType | null)[][] => [
  ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
  ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
  ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"],
];

const Chessboard = () => {
  const [board, setBoard] = createSignal<(PieceType | null)[][]>(initialBoardState());
  const [selectedSquare, setSelectedSquare] = createSignal<Square | null>(null);

  // TODO: handleSquareClick actions
  const handleSquareClick = (row: number, col: number) => {
    const piece = board()[row][col];

    if (selectedSquare()) {
      const newBoard = board().map((r) => [...r]);
      newBoard[row][col] = newBoard[selectedSquare()!.row][selectedSquare()!.col];
      newBoard[selectedSquare()!.row][selectedSquare()!.col] = null;
      setBoard(newBoard);
      setSelectedSquare(null);
    } else if (piece) {
      setSelectedSquare({ row, col });
    }
  };

  return (
    <div class={styles.board}>
      {board().map((row, rowIndex) =>
        row.map((piece, colIndex) => (
          <div
            class={`${styles.square} ${
              (rowIndex + colIndex) % 2 === 0 ? styles.light : styles.dark
            }`}
          >
            {piece && <Piece type={piece} />}
          </div>
        ))
      )}
    </div>
  );
};

export default Chessboard;
