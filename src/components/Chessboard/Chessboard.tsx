import styles from "./ChessBoard.module.css";
import Piece from "../Piece/Piece";
import { Square, PieceType } from "../../types";

const ChessBoard = ({
  board,
  highlightedMoves,
  selectedSquare,
  draggedPiece,
  cursorPosition,
  onSquareClick,
  onSquareMouseUp,
  onDragStart,
}: {
  board: () => { square: Square; piece: string | null }[];
  highlightedMoves: () => Square[];
  selectedSquare: () => Square | null;
  draggedPiece: () => { square: Square; piece: string } | null;
  cursorPosition: () => { x: number; y: number };
  onSquareClick: (square: Square) => void;
  onSquareMouseUp: (square: Square) => void;
  onDragStart: (square: Square, piece: string, event: DragEvent) => void;
}) => {
  const renderDraggedPiece = () => {
    const dragState = draggedPiece();
    const cursor = cursorPosition();
    if (!dragState) return null;

    return (
      <div
        class={styles.draggedPiece}
        style={{
          top: `${cursor.y}px`,
          left: `${cursor.x}px`,
        }}
      >
        <Piece type={dragState.piece as PieceType} />
      </div>
    );
  };

  return (
    <div class={styles.board}>
      {board().map(({ square, piece }) => {
        const isHighlightedMove = highlightedMoves().includes(square);
        const isSelected = selectedSquare() === square;

        return (
          <div
            class={`${styles.square} ${
              (square[0].charCodeAt(0) - 97 + parseInt(square[1])) % 2 === 0
                ? styles.light
                : styles.dark
            } ${isSelected ? styles.selected : ""}`}
            onClick={() => onSquareClick(square)}
            onMouseUp={() => onSquareMouseUp(square)}
          >
            {isHighlightedMove && <div class={styles.highlightDot}></div>}
            {piece && (
              <Piece
                type={piece as PieceType}
                draggable={true}
                onDragStart={(e) => onDragStart(square, piece!, e)}
              />
            )}
          </div>
        );
      })}
      {renderDraggedPiece()}
    </div>
  );
};

export default ChessBoard;
