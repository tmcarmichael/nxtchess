import { JSX, splitProps, For, Component } from 'solid-js';
import Piece from '../GamePiece/GamePiece';
import { PieceType, BoardSquare, Square, Side } from '../../../types';
import styles from './GameBoard.module.css';

interface GameBoardProps {
  board: () => BoardSquare[];
  highlightedMoves: () => Square[];
  selectedSquare: () => Square | null;
  draggedPiece: () => { square: Square; piece: string } | null;
  cursorPosition: () => { x: number; y: number };
  onSquareClick: (square: Square) => void;
  onSquareMouseUp: (square: Square) => void;
  onDragStart: (square: Square, piece: string, event: DragEvent) => void;
  lastMove: () => { from: Square; to: Square } | null;
  checkedKingSquare: () => Square | null;
  boardView: () => Side;
}

const GameBoard: Component<GameBoardProps> = (props) => {
  const [local] = splitProps(props, [
    'board',
    'highlightedMoves',
    'selectedSquare',
    'draggedPiece',
    'cursorPosition',
    'onSquareClick',
    'onSquareMouseUp',
    'onDragStart',
    'lastMove',
    'checkedKingSquare',
    'boardView',
  ]);
  const renderDraggedPiece = () => {
    const dragState = local.draggedPiece();
    if (!dragState) return null;
    const { x, y } = local.cursorPosition();
    return (
      <div class={styles.draggedPiece} style={{ top: `${y}px`, left: `${x}px` }}>
        <Piece type={dragState.piece as PieceType} />
      </div>
    );
  };

  const renderedSquares = () => {
    const view: 'w' | 'b' = local.boardView();
    const boardSquares: BoardSquare[] = view === 'b' ? [...local.board()].reverse() : local.board();
    const highlights: Square[] = local.highlightedMoves();
    const selected: Square | null = local.selectedSquare();
    const dragState = local.draggedPiece();
    const last = local.lastMove();
    const checkedSquare = local.checkedKingSquare();

    const renderSquare = ({ square, piece }: BoardSquare): JSX.Element => {
      const file = square[0];
      const rank = square[1];

      const isHighlighted = highlights.includes(square);
      const isSelected = selected === square;
      const isDragging = dragState?.square === square;
      const isLastMove = last !== null && (last.from === square || last.to === square);
      const isEnemyPiece = !!piece && !!dragState && dragState.piece[0] !== piece[0];
      const isCheckedKing = checkedSquare === square;
      const isLightSquare = (file.charCodeAt(0) - 97 + parseInt(rank, 10)) % 2 === 0;
      const showFile = (view === 'w' && rank === '1') || (view === 'b' && rank === '8');
      const showRank = (view === 'w' && file === 'h') || (view === 'b' && file === 'a');

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
          onClick={() => local.onSquareClick(square)}
          onMouseUp={() => local.onSquareMouseUp(square)}
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
              onDragStart={(e: DragEvent) => local.onDragStart(square, piece, e)}
              style={{ opacity: isDragging ? 0.5 : 1, transition: 'opacity 0.2s ease' }}
            />
          )}
        </div>
      );
    };

    return <For each={boardSquares}>{(square) => renderSquare(square)}</For>;
  };

  return (
    <div class={styles.boardContainer}>
      <div class={styles.board}>
        {renderedSquares()}
        {renderDraggedPiece()}
      </div>
    </div>
  );
};

export default GameBoard;
