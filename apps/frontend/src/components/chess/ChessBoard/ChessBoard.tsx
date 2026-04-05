import {
  splitProps,
  Index,
  Show,
  type Component,
  createMemo,
  createSignal,
  createRenderEffect,
  on,
} from 'solid-js';
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
  captureSquares: () => Set<Square>;
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
  castlingHintSquares: () => Set<Square>;
  dragHoverSquare: () => Square | null;
  onSquareRightMouseDown: (square: Square) => void;
  onSquareRightMouseUp: (square: Square) => void;
  onSquareMouseEnter: (square: Square) => void;
}

const ANIMATION_DURATION = 500; // ms

const ChessBoard: Component<ChessBoardProps> = (props) => {
  const [local] = splitProps(props, [
    'board',
    'highlightedMoves',
    'captureSquares',
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
    'castlingHintSquares',
    'dragHoverSquare',
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

  createRenderEffect(
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

  // Ghost piece rendering is handled inline with <Show> for fine-grained
  // reactivity — only the transform style updates per frame, no DOM churn.

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
          <Index each={memoizedBoardSquares()}>
            {(sq) => {
              const isLightSquare = () => {
                const f = sq().square[0];
                const r = sq().square[1];
                return (f.charCodeAt(0) - 97 + parseInt(r, 10)) % 2 === 0;
              };

              const showFile = () => {
                const r = sq().square[1];
                const v = local.boardView();
                return (v === 'w' && r === '1') || (v === 'b' && r === '8');
              };

              const showRank = () => {
                const f = sq().square[0];
                const v = local.boardView();
                return (v === 'w' && f === 'h') || (v === 'b' && f === 'a');
              };

              const pieceOpacity = () => {
                if (local.draggedPiece()?.square === sq().square) return 0.5;
                if (local.animatingMove()?.to === sq().square) return 0;
                return 1;
              };

              const squareLabel = () => {
                const piece = sq().piece;
                const name = piece ? PIECE_NAMES[piece] || piece : null;
                return name ? `${sq().square}, ${name}` : `${sq().square}, empty`;
              };

              return (
                <div
                  data-square={sq().square}
                  role="gridcell"
                  aria-label={squareLabel()}
                  aria-selected={local.selectedSquare() === sq().square}
                  tabIndex={local.selectedSquare() === sq().square ? 0 : -1}
                  classList={{
                    [styles.square]: true,
                    [styles.lightSquare]: isLightSquare(),
                    [styles.darkSquare]: !isLightSquare(),
                    [styles.selectedSquare]: local.selectedSquare() === sq().square,
                    [styles.lastMoveHighlight]: (() => {
                      const last = local.lastMove();
                      return (
                        last !== null && (last.from === sq().square || last.to === sq().square)
                      );
                    })(),
                    [styles.checkedKing]: local.checkedKingSquare() === sq().square,
                    [styles.flashKing]: local.flashKingSquare() === sq().square,
                    [styles.premoveHighlight]: (() => {
                      const pm = local.premoveSquares();
                      return pm !== null && (pm.from === sq().square || pm.to === sq().square);
                    })(),
                    [styles.castlingHint]: local.castlingHintSquares().has(sq().square),
                    [styles.castlingHintHover]:
                      local.castlingHintSquares().has(sq().square) &&
                      local.dragHoverSquare() === sq().square,
                    [styles.rightClickHighlight]: local.rightClickHighlights().has(sq().square),
                  }}
                  onMouseDown={(e) => {
                    if (e.button === 2) local.onSquareRightMouseDown(sq().square);
                  }}
                  onMouseUp={(e) => {
                    if (e.button === 2) local.onSquareRightMouseUp(sq().square);
                  }}
                  onMouseEnter={() => local.onSquareMouseEnter(sq().square)}
                >
                  {showFile() && <span class={styles.fileLabel}>{sq().square[0]}</span>}
                  {showRank() && <span class={styles.rankLabel}>{sq().square[1]}</span>}
                  {highlightSet().has(sq().square) &&
                    !local.castlingHintSquares().has(sq().square) && (
                      <div
                        class={`${styles.legalMoveIndicator} ${local.captureSquares().has(sq().square) ? styles.captureIndicator : ''}`}
                      />
                    )}
                  {sq().piece && (
                    <Piece type={sq().piece as PieceType} style={{ opacity: pieceOpacity() }} />
                  )}
                </div>
              );
            }}
          </Index>
          <ChessBoardArrows
            arrows={local.rightClickArrows}
            previewArrow={local.previewArrow}
            boardView={local.boardView}
          />
          {renderAnimatingPiece()}
        </div>
        <Show when={local.draggedPiece()}>
          {(dragState) => (
            <div
              class={styles.draggedPiece}
              style={{
                transform: `translate3d(${local.cursorPosition().x}px, ${local.cursorPosition().y}px, 0) translate(-50%, -50%)`,
              }}
            >
              <Piece type={dragState().piece as PieceType} />
            </div>
          )}
        </Show>
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
