import { createSignal } from "solid-js";
import Piece from "../Piece/Piece";
import styles from "./Chessboard.module.css";
import { initializeGame, getLegalMoves, updateGameState } from "../../logic/gameState";
import { Square, PieceType } from "../../types";
import { mapFenToPieceType } from "../../logic/fenLogic";

const Chessboard = () => {
  const [gameState, setGameState] = createSignal(initializeGame());
  const [selectedSquare, setSelectedSquare] = createSignal<string | null>(null);
  const [highlightedMoves, setHighlightedMoves] = createSignal<string[]>([]);

  const handleSquareClick = (square: Square) => {
    const currentSelection = selectedSquare();

    if (currentSelection) {
      try {
        const updatedState = updateGameState(gameState(), currentSelection, square);
        setGameState(updatedState);
        setSelectedSquare(null);
        setHighlightedMoves([]);
      } catch (error: any) {
        console.error("Invalid move:", error.message);
      }
    } else {
      setSelectedSquare(square);
      const legalMoves = getLegalMoves(gameState().fen, square);
      setHighlightedMoves(legalMoves);
    }
  };

  const renderSquare = (square: Square, piece: PieceType | null) => {
    const isHighlighted = highlightedMoves().includes(square);
    const [file, rank] = square;

    return (
      <div
        class={`${styles.square} ${
          (file.charCodeAt(0) - 97 + parseInt(rank)) % 2 === 0 ? styles.light : styles.dark
        } ${isHighlighted ? styles.highlight : ""}`}
        onClick={() => handleSquareClick(square)}
      >
        {piece && <Piece type={piece} />}
      </div>
    );
  };

  const renderBoard = () => {
    try {
      const fen = gameState().fen.split(" ")[0];
      const rows = fen.split("/");

      return rows.flatMap((row, rankIndex) => {
        let fileIndex = 0;
        return row.split("").flatMap((char) => {
          if (isNaN(Number(char))) {
            const piece = mapFenToPieceType(char);
            const square = `${String.fromCharCode(97 + fileIndex)}${8 - rankIndex}` as Square;
            fileIndex += 1;
            return renderSquare(square, piece);
          } else {
            const emptySquares = Array(Number(char))
              .fill(null)
              .map(() => {
                const square = `${String.fromCharCode(97 + fileIndex)}${8 - rankIndex}` as Square;
                fileIndex += 1;
                return renderSquare(square, null);
              });
            return emptySquares;
          }
        });
      });
    } catch (error) {
      console.error("Error rendering board:", error);
      return <div>Error rendering board</div>;
    }
  };

  return <div class={styles.board}>{renderBoard()}</div>;
};

export default Chessboard;
