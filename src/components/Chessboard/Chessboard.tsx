import { createMemo } from 'solid-js';
import styles from './ChessBoard.module.css';
import Piece from '../Piece/Piece';
import { PieceType, BoardSquare, Square, Side } from '../../types';

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
  playerColor,
}: {
  board: () => BoardSquare[];
  highlightedMoves: () => Square[];
  selectedSquare: () => Square | null;
  draggedPiece: () => { square: Square; piece: string } | null;
  cursorPosition: () => { x: number; y: number };
  lastMove: () => { from: Square; to: Square } | null;
  onSquareClick: (square: Square) => void;
  onSquareMouseUp: (square: Square) => void;
  onDragStart: (square: Square, piece: string, event: DragEvent) => void;
  checkedKingSquare: () => Square | null;
  playerColor: () => Side;
}) => {
  const renderDraggedPiece = () => {
    const dragState = draggedPiece();
    if (!dragState) return null;
    const { x, y } = cursorPosition();
    return (
      <div
        class={styles.draggedPiece}
        style={{
          top: `${y}px`,
          left: `${x}px`,
        }}
      >
        <Piece type={dragState.piece as PieceType} />
      </div>
    );
  };

  const squares = createMemo(() => {
    const squaresToRender = playerColor() === 'b' ? [...board()].reverse() : board();
    return squaresToRender.map(({ square, piece }: BoardSquare) => {
      const file = square[0];
      const rank = square[1];
      const isHighlighted = highlightedMoves().includes(square);
      const isSelected = selectedSquare() === square;
      const isDragging = draggedPiece()?.square === square;
      const isLastMove = lastMove() && (lastMove()!.from === square || lastMove()!.to === square);
      const isEnemyPiece = piece && draggedPiece()?.piece[0] !== piece[0];
      const isCheckedKing = checkedKingSquare() === square;
      const isLightSquare = (file.charCodeAt(0) - 97 + parseInt(rank, 10)) % 2 === 0;
      const showFile =
        (playerColor() === 'w' && rank === '1') || (playerColor() === 'b' && rank === '8');
      const showRank =
        (playerColor() === 'w' && file === 'h') || (playerColor() === 'b' && file === 'a');

      return (
        <div
          classList={{
            [styles.square]: true,
            [styles.light]: isLightSquare,
            [styles.dark]: !isLightSquare,
            [styles.selected]: isSelected,
            [styles.lastMove]: Boolean(isLastMove),
            [styles.checkedKing]: isCheckedKing,
          }}
          onClick={() => onSquareClick(square)}
          onMouseUp={() => onSquareMouseUp(square)}
        >
          {showFile && <span class={styles.fileLabel}>{file}</span>}
          {showRank && <span class={styles.rankLabel}>{rank}</span>}
          {isHighlighted && (
            <div class={`${styles.highlightDot} ${isEnemyPiece ? styles.enemyDot : ''}`} />
          )}
          {piece && (
            <Piece
              type={piece as PieceType}
              draggable
              onDragStart={(e) => onDragStart(square, piece!, e)}
              style={{ opacity: isDragging ? 0.5 : 1 }}
            />
          )}
        </div>
      );
    });
  });

  return (
    <div class={styles.boardContainer}>
      <div class={styles.board}>
        {squares()}
        {renderDraggedPiece()}
      </div>
    </div>
  );
};

export default ChessBoard;
