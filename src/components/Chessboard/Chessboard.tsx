import { JSX } from 'solid-js';
import styles from './ChessBoard.module.css';
import Piece from '../Piece/Piece';
import { PieceType, BoardSquare, Square } from '../../types';
import { useGameStore } from '../../store/game/GameContext';

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
  board: () => BoardSquare[];
  highlightedMoves: () => Square[];
  selectedSquare: () => Square | null;
  draggedPiece: () => { square: Square; piece: string } | null;
  cursorPosition: () => { x: number; y: number };
  onSquareClick: (square: Square) => void;
  onSquareMouseUp: (square: Square) => void;
  onDragStart: (square: Square, piece: string, event: DragEvent) => void;
}) => {
  const [state, _] = useGameStore();

  const lastMove = () => state.lastMove;
  const checkedKingSquare = () => state.checkedKingSquare;
  const boardView = () => state.boardView;

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

  const renderedSquares = () => {
    const view: 'w' | 'b' = boardView();
    const boardSquares: BoardSquare[] = view === 'b' ? [...board()].reverse() : board();
    const highlights: Square[] = highlightedMoves();
    const selected: Square | null = selectedSquare();
    const dragState: { square: Square; piece: string } | null = draggedPiece();
    const last: { from: Square; to: Square } | null = lastMove();
    const checkedSquare: Square | null = checkedKingSquare();

    const renderSquare = ({ square, piece }: BoardSquare): JSX.Element => {
      const file: string = square[0];
      const rank: string = square[1];

      const isHighlighted: boolean = highlights.includes(square);
      const isSelected: boolean = selected === square;
      const isDragging: boolean = dragState?.square === square;
      const isLastMove: boolean = last !== null && (last.from === square || last.to === square);
      const isEnemyPiece: boolean = !!piece && !!dragState && dragState.piece[0] !== piece[0];
      const isCheckedKing: boolean = checkedSquare === square;
      const isLightSquare: boolean = (file.charCodeAt(0) - 97 + parseInt(rank, 10)) % 2 === 0;
      const showFile: boolean = (view === 'w' && rank === '1') || (view === 'b' && rank === '8');
      const showRank: boolean = (view === 'w' && file === 'h') || (view === 'b' && file === 'a');

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
          {showFile && <span class={styles.fileLabel}>{file}</span>}
          {showRank && <span class={styles.rankLabel}>{rank}</span>}
          {isHighlighted && (
            <div class={`${styles.highlightDot} ${isEnemyPiece ? styles.enemyDot : ''}`} />
          )}
          {piece && (
            <Piece
              type={piece as PieceType}
              draggable
              onDragStart={(e: DragEvent) => onDragStart(square, piece, e)}
              style={{ opacity: isDragging ? 0.5 : 1 }}
            />
          )}
        </div>
      );
    };

    return boardSquares.map(renderSquare);
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

export default ChessBoard;
