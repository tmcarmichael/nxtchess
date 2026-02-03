import {
  type JSX,
  splitProps,
  Index,
  Show,
  type Component,
  createMemo,
  createSignal,
  createEffect,
  on,
} from 'solid-js';
import { isPieceSide } from '../../../services/game/pieceUtils';
import {
  type PieceType,
  type BoardSquare,
  type Square,
  type BoardArrow,
} from '../../../types/chess';
import { type Side } from '../../../types/game';
import ChessBoardArrows from '../ChessBoardArrows/ChessBoardArrows';
import Piece from '../ChessPiece/ChessPiece';
import styles from './ChessBoard.module.css';

// Piece names for screen reader announcements
const PIECE_NAMES: Record<string, string> = {
  wP: 'white pawn',
  wN: 'white knight',
  wB: 'white bishop',
  wR: 'white rook',
  wQ: 'white queen',
  wK: 'white king',
  bP: 'black pawn',
  bN: 'black knight',
  bB: 'black bishop',
  bR: 'black rook',
  bQ: 'black queen',
  bK: 'black king',
};

interface ChessBoardProps {
  board: () => BoardSquare[];
  highlightedMoves: () => Square[];
  selectedSquare: () => Square | null;
  draggedPiece: () => { square: Square; piece: string } | null;
  cursorPosition: () => { x: number; y: number };
  lastMove: () => { from: Square; to: Square } | null;
  checkedKingSquare: () => Square | null;
  boardView: () => Side;
  activePieceColor: () => Side;
  premoveSquares: () => { from: Square; to: Square } | null;
  animatingMove: () => { from: Square; to: Square; piece: string } | null;
  flashKingSquare: () => Square | null;
  playerColor: () => Side | null;
  rightClickHighlights: () => Set<Square>;
  rightClickArrows: () => BoardArrow[];
  previewArrow: () => BoardArrow | null;
  onSquareRightMouseDown: (square: Square) => void;
  onSquareRightMouseUp: (square: Square) => void;
  onSquareMouseEnter: (square: Square) => void;
}

const ANIMATION_DURATION = 500; // ms

const ChessBoard: Component<ChessBoardProps> = (props) => {
  const [local] = splitProps(props, [
    'board',
    'highlightedMoves',
    'selectedSquare',
    'draggedPiece',
    'cursorPosition',
    'lastMove',
    'checkedKingSquare',
    'boardView',
    'activePieceColor',
    'premoveSquares',
    'animatingMove',
    'flashKingSquare',
    'playerColor',
    'rightClickHighlights',
    'rightClickArrows',
    'previewArrow',
    'onSquareRightMouseDown',
    'onSquareRightMouseUp',
    'onSquareMouseEnter',
  ]);

  const highlightSet = createMemo(() => new Set(local.highlightedMoves()));

  const memoizedBoardSquares = createMemo(() => {
    const view = local.boardView();
    const rawBoard = local.board();
    return view === 'b' ? [...rawBoard].reverse() : rawBoard;
  });

  // Convert square name to board coordinates (0-7)
  const squareToCoords = (square: Square, view: Side): { x: number; y: number } => {
    const file = square.charCodeAt(0) - 97; // a=0, h=7
    const rank = parseInt(square[1], 10) - 1; // 1=0, 8=7
    if (view === 'w') {
      return { x: file, y: 7 - rank };
    } else {
      return { x: 7 - file, y: rank };
    }
  };

  // Animation state: starts at 'from' position, transitions to 'to'
  const [animationOffset, setAnimationOffset] = createSignal<{ x: number; y: number } | null>(null);
  const [animatingPiece, setAnimatingPiece] = createSignal<{ to: Square; piece: string } | null>(
    null
  );

  createEffect(
    on(
      () => local.animatingMove(),
      (anim) => {
        if (!anim) {
          setAnimatingPiece(null);
          setAnimationOffset(null);
          return;
        }

        const view = local.boardView();
        const fromCoords = squareToCoords(anim.from, view);
        const toCoords = squareToCoords(anim.to, view);

        // Calculate offset in grid units (each square = 1 unit = 12.5%)
        const offsetX = fromCoords.x - toCoords.x;
        const offsetY = fromCoords.y - toCoords.y;

        // Set initial offset (piece appears at source)
        setAnimationOffset({ x: offsetX, y: offsetY });
        setAnimatingPiece({ to: anim.to, piece: anim.piece });

        // Trigger transition to destination (offset = 0)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimationOffset({ x: 0, y: 0 });
          });
        });
      }
    )
  );

  const renderDraggedPiece = () => {
    const dragState = local.draggedPiece();
    if (!dragState) return null;
    const { x, y } = local.cursorPosition();
    return (
      <div
        class={styles.draggedPiece}
        style={{ transform: `translate(${x}px, ${y}px) translate(-50%, -50%)` }}
      >
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
    const premove = local.premoveSquares();
    const animPiece = animatingPiece();
    const flashSquare = local.flashKingSquare();
    const rightClickSet = local.rightClickHighlights();

    const renderSquare = (sq: BoardSquare): JSX.Element => {
      const file = sq.square[0];
      const rank = sq.square[1];
      const isHighlighted = highlightSet().has(sq.square);
      const isSelected = selected === sq.square;
      const isDragging = dragState?.square === sq.square;
      const isAnimating = animPiece?.to === sq.square;
      const isLastMove = last !== null && (last.from === sq.square || last.to === sq.square);
      const isEnemyPiece =
        isHighlighted &&
        !!sq.piece &&
        !!local.activePieceColor() &&
        !isPieceSide(sq.piece, local.activePieceColor());
      const isCheckedKing = checkedSquare === sq.square;
      const isFlashingKing = flashSquare === sq.square;
      const isRightClickHighlighted = rightClickSet.has(sq.square);
      const isPremove =
        premove !== null && (premove.from === sq.square || premove.to === sq.square);
      const isLightSquare = (file.charCodeAt(0) - 97 + parseInt(rank, 10)) % 2 === 0;
      const view = local.boardView();
      const showFile = (view === 'w' && rank === '1') || (view === 'b' && rank === '8');
      const showRank = (view === 'w' && file === 'h') || (view === 'b' && file === 'a');

      const pieceOpacity = isDragging ? 0.5 : isAnimating ? 0 : 1;

      const pieceName = sq.piece ? PIECE_NAMES[sq.piece] || sq.piece : null;
      const squareLabel = pieceName ? `${sq.square}, ${pieceName}` : `${sq.square}, empty`;

      return (
        <div
          data-square={sq.square}
          role="gridcell"
          aria-label={squareLabel}
          aria-selected={isSelected}
          tabIndex={isSelected ? 0 : -1}
          classList={{
            [styles.square]: true,
            [styles.lightSquare]: isLightSquare,
            [styles.darkSquare]: !isLightSquare,
            [styles.selectedSquare]: isSelected,
            [styles.lastMoveHighlight]: isLastMove,
            [styles.checkedKing]: isCheckedKing,
            [styles.flashKing]: isFlashingKing,
            [styles.premoveHighlight]: isPremove,
            [styles.rightClickHighlight]: isRightClickHighlighted,
          }}
          onMouseDown={(e) => {
            if (e.button === 2) local.onSquareRightMouseDown(sq.square);
          }}
          onMouseUp={(e) => {
            if (e.button === 2) local.onSquareRightMouseUp(sq.square);
          }}
          onMouseEnter={() => local.onSquareMouseEnter(sq.square)}
        >
          {showFile && <span class={styles.fileLabel}>{file}</span>}
          {showRank && <span class={styles.rankLabel}>{rank}</span>}
          {isHighlighted && (
            <div
              class={`${styles.legalMoveIndicator} ${isEnemyPiece ? styles.captureIndicator : ''}`}
            />
          )}
          {sq.piece && (
            <Piece
              type={sq.piece as PieceType}
              style={{ opacity: pieceOpacity, transition: 'opacity 0.05s ease' }}
            />
          )}
        </div>
      );
    };

    // eslint-disable-next-line solid/reactivity -- square() is called within Index's tracked callback
    return <Index each={squares}>{(square) => renderSquare(square())}</Index>;
  };

  const renderAnimatingPiece = () => {
    const animPiece = animatingPiece();
    const offset = animationOffset();
    if (!animPiece || !offset) return null;

    const view = local.boardView();
    const toCoords = squareToCoords(animPiece.to, view);
    const leftPercent = toCoords.x * 12.5;
    const topPercent = toCoords.y * 12.5;

    return (
      <div
        class={styles.animatingPiece}
        style={{
          left: `${leftPercent}%`,
          top: `${topPercent}%`,
          transform: `translate(${offset.x * 100}%, ${offset.y * 100}%)`,
          transition:
            offset.x === 0 && offset.y === 0
              ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`
              : 'none',
        }}
      >
        <Piece type={animPiece.piece as PieceType} />
      </div>
    );
  };

  // Generate announcement for last move
  const lastMoveAnnouncement = createMemo(() => {
    const last = local.lastMove();
    if (!last) return '';

    const board = local.board();
    const toSquareData = board.find((sq) => sq.square === last.to);
    const pieceName = toSquareData?.piece ? PIECE_NAMES[toSquareData.piece] : 'piece';

    return `${pieceName} moved from ${last.from} to ${last.to}`;
  });

  return (
    <div class={styles.boardContainer} onContextMenu={(e) => e.preventDefault()}>
      {/* Screen reader announcement for moves */}
      <div role="status" aria-live="polite" class="sr-only">
        {lastMoveAnnouncement()}
      </div>
      <div class={styles.boardWrapper}>
        <div class={styles.board} role="grid" aria-label="Chess board">
          {renderedSquares()}
          <ChessBoardArrows
            arrows={local.rightClickArrows}
            previewArrow={local.previewArrow}
            boardView={local.boardView}
          />
          {renderAnimatingPiece()}
          {renderDraggedPiece()}
        </div>
        <Show when={local.playerColor()}>
          <div
            classList={{
              [styles.playerColorIndicator]: true,
              [styles.playerColorWhite]: local.playerColor() === 'w',
              [styles.playerColorBlack]: local.playerColor() === 'b',
            }}
            aria-label={`Playing as ${local.playerColor() === 'w' ? 'white' : 'black'}`}
          />
        </Show>
      </div>
    </div>
  );
};

export default ChessBoard;
