import { type JSX, splitProps, For, type Component, createMemo } from 'solid-js';
import { isPieceSide } from '../../../services/game/pieceUtils';
import { type PieceType, type BoardSquare, type Square } from '../../../types/chess';
import { type Side } from '../../../types/game';
import Piece from '../ChessPiece/ChessPiece';
import styles from './ChessBoard.module.css';

interface ChessBoardProps {
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
  activePieceColor: () => Side;
}

const ChessBoard: Component<ChessBoardProps> = (props) => {
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
    'activePieceColor',
  ]);

  const highlightSet = createMemo(() => new Set(local.highlightedMoves()));

  const memoizedBoardSquares = createMemo(() => {
    const view = local.boardView();
    const rawBoard = local.board();
    return view === 'b' ? [...rawBoard].reverse() : rawBoard;
  });

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
    const selected = local.selectedSquare();
    const dragState = local.draggedPiece();
    const last = local.lastMove();
    const checkedSquare = local.checkedKingSquare();
    const squares = memoizedBoardSquares();

    const renderSquare = (props: BoardSquare): JSX.Element => {
      const file = props.square[0];
      const rank = props.square[1];
      const isHighlighted = highlightSet().has(props.square);
      const isSelected = selected === props.square;
      const isDragging = dragState?.square === props.square;
      const isLastMove = last !== null && (last.from === props.square || last.to === props.square);
      const isEnemyPiece =
        isHighlighted &&
        !!props.piece &&
        !!local.activePieceColor() &&
        !isPieceSide(props.piece, local.activePieceColor());
      const isCheckedKing = checkedSquare === props.square;
      const isLightSquare = (file.charCodeAt(0) - 97 + parseInt(rank, 10)) % 2 === 0;
      const view = local.boardView();
      const showFile = (view === 'w' && rank === '1') || (view === 'b' && rank === '8');
      const showRank = (view === 'w' && file === 'h') || (view === 'b' && file === 'a');

      return (
        <div
          data-square={props.square}
          classList={{
            [styles.square]: true,
            [styles.light]: isLightSquare,
            [styles.dark]: !isLightSquare,
            [styles.selected]: isSelected,
            [styles.lastMove]: isLastMove,
            [styles.checkedKing]: isCheckedKing,
          }}
          onClick={() => local.onSquareClick(props.square)}
          onMouseUp={() => local.onSquareMouseUp(props.square)}
        >
          {showFile && <span class={styles.fileLabel}>{file}</span>}
          {showRank && <span class={styles.rankLabel}>{rank}</span>}
          {isHighlighted && (
            <div class={`${styles.highlightDot} ${isEnemyPiece ? styles.enemyDot : ''}`} />
          )}
          {props.piece && (
            <Piece
              type={props.piece as PieceType}
              draggable
              onDragStart={(e: DragEvent) => local.onDragStart(props.square, props.piece!, e)}
              style={{ opacity: isDragging ? 0.5 : 1, transition: 'opacity 0.2s ease' }}
            />
          )}
        </div>
      );
    };

    return <For each={squares}>{(square) => renderSquare(square)}</For>;
  };

  return (
    <div class={styles.boardContainer} onContextMenu={(e) => e.preventDefault()}>
      <div class={styles.board}>
        {renderedSquares()}
        {renderDraggedPiece()}
      </div>
    </div>
  );
};

export default ChessBoard;
