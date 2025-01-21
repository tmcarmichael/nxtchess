import styles from './ChessBoard.module.css';
import Piece from '../Piece/Piece';
import { Square, PieceType } from '../../types';

const ChessBoard = ({
  board,
  highlightedMoves,
  selectedSquare,
  draggedPiece,
  cursorPosition,
  lastMove,
  onSquareClick,
  onSquareMouseUp,
  onDragStart,
  checkedKingSquare,
}: {
  board: () => { square: Square; piece: string | null }[];
  highlightedMoves: () => Square[];
  selectedSquare: () => Square | null;
  draggedPiece: () => { square: Square; piece: string } | null;
  cursorPosition: () => { x: number; y: number };
  lastMove: () => { from: Square; to: Square } | null;
  onSquareClick: (square: Square) => void;
  onSquareMouseUp: (square: Square) => void;
  onDragStart: (square: Square, piece: string, event: DragEvent) => void;
  checkedKingSquare: () => Square | null;
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
    <div class={styles['board-container']}>
      <div class={styles.board}>
        {board().map(({ square, piece }) => {
          const file = square[0];
          const rank = square[1];
          const isHighlightedMove = highlightedMoves().includes(square);
          const isSelected = selectedSquare() === square;
          const isDragging = draggedPiece()?.square === square;
          const isLastMove = Boolean(
            lastMove() && (lastMove()!.from === square || lastMove()!.to === square)
          );
          const isEnemyPiece = piece && draggedPiece()?.piece[0] !== piece[0];
          const isCheckedKing = checkedKingSquare() === square;
          const isLightSquare = (file.charCodeAt(0) - 97 + parseInt(rank, 10)) % 2 === 0;

          return (
            <div
              classList={{
                [styles.square]: true,
                [styles.light]: isLightSquare,
                [styles.dark]: !isLightSquare,
                [styles.selected]: isSelected,
                [styles.lastMove]: isLastMove,
                [styles.checkedKing]: isCheckedKing,
              }}
              onClick={() => onSquareClick(square)}
              onMouseUp={() => onSquareMouseUp(square)}
            >
              {rank === '1' && <span class={styles.fileLabel}>{file}</span>}
              {file === 'h' && <span class={styles.rankLabel}>{rank}</span>}
              {isHighlightedMove && (
                <div class={`${styles.highlightDot} ${isEnemyPiece ? styles.enemyDot : ''}`} />
              )}
              {piece && (
                <Piece
                  type={piece as PieceType}
                  draggable={true}
                  onDragStart={(e) => onDragStart(square, piece, e)}
                  style={{ opacity: isDragging ? 0.5 : 1 }}
                />
              )}
            </div>
          );
        })}
        {renderDraggedPiece()}
      </div>
    </div>
  );
};

export default ChessBoard;
