import { useNavigate } from '@solidjs/router';
import {
  createSignal,
  batch,
  Show,
  type ParentComponent,
  createEffect,
  splitProps,
  on,
  onCleanup,
} from 'solid-js';
import { getEvaluation } from '../../../services/engine';
import { getLegalMoves, prepareMove, canMovePieceAt } from '../../../services/game';
import { useKeyboardNavigation } from '../../../shared';
import { useGame } from '../../../store';
import { type Square, type PromotionPiece, type Side } from '../../../types';
import ChessBoard from '../../chess/ChessBoard/ChessBoard';
import ChessPromotionModal from '../../chess/ChessPromotionModal/ChessPromotionModal';
import ChessEndModal from '../ChessEndModal/ChessEndModal';
import ChessEngineOverlay from '../ChessEngineOverlay/ChessEngineOverlay';
import ChessEvalBar from '../ChessEvalBar/ChessEvalBar';
import styles from './ChessBoardController.module.css';

interface ChessBoardControllerProps {
  onRequestNewGame?: () => void;
}

const ChessBoardController: ParentComponent<ChessBoardControllerProps> = (props) => {
  const [local] = splitProps(props, ['onRequestNewGame']);
  const { chess, engine, multiplayer, ui, actions, derived } = useGame();
  const navigate = useNavigate();
  const [highlightedMoves, setHighlightedMoves] = createSignal<Square[]>([]);
  const [selectedSquare, setSelectedSquare] = createSignal<Square | null>(null);
  const [draggedPiece, setDraggedPiece] = createSignal<{ square: Square; piece: string } | null>(
    null
  );
  const [cursorPosition, setCursorPosition] = createSignal({ x: 0, y: 0 });
  const [pendingPromotion, setPendingPromotion] = createSignal<{
    from: Square;
    to: Square;
    color: Side;
  } | null>(null);
  const [evalScore, setEvalScore] = createSignal<number | null>(null);
  const [showEndModal, setShowEndModal] = createSignal(false);

  useKeyboardNavigation({
    onPrevious: () => {
      const newIndex = chess.state.viewMoveIndex - 1;
      if (newIndex >= 0) {
        chess.jumpToMoveIndex(newIndex);
      }
    },
    onNext: () => {
      const newIndex = chess.state.viewMoveIndex + 1;
      if (newIndex <= chess.state.moveHistory.length - 1) {
        chess.jumpToMoveIndex(newIndex);
      }
    },
    onFlip: ui.flipBoard,
    enabled: () => !chess.state.isGameOver,
  });

  // Only re-evaluate when FEN or mode changes (not on every state update)
  createEffect(
    on(
      () => [chess.state.fen, chess.state.mode] as const,
      ([currentFen, mode]) => {
        if (mode === 'training') {
          getEvaluation(currentFen).then((score: number) => {
            setEvalScore(score ?? null);
          });
        }
      }
    )
  );

  createEffect(
    on(
      () => chess.state.isGameOver,
      (isGameOver) => {
        if (isGameOver) {
          setShowEndModal(true);
        }
      }
    )
  );

  const resetViewIfNeeded = () => {
    if (chess.derived.isViewingHistory()) {
      // Jump to latest move to reset view
      chess.jumpToMoveIndex(chess.state.moveHistory.length - 1);
    }
  };

  const canMove = () => chess.derived.canMove() && !engine.state.isThinking;

  const handleSquareClick = (square: Square) => {
    if (!canMove()) return;
    resetViewIfNeeded();
    const currentSelection = selectedSquare();
    if (!currentSelection) {
      const piece = chess.derived.currentBoard().find((sq) => sq.square === square)?.piece;
      if (piece && canMovePiece(square)) {
        selectSquare(square);
      }
      return;
    }
    if (highlightedMoves().includes(square)) {
      executeMove(currentSelection, square);
    } else {
      clearDraggingState();
    }
  };

  const handleDragStart = (square: Square, piece: string, event: DragEvent) => {
    if (!canMove() || !canMovePiece(square)) return;
    resetViewIfNeeded();
    setDraggedPiece({ square, piece });
    setCursorPosition({ x: event.clientX, y: event.clientY });
    setHighlightedMoves(getLegalMoves(chess.state.fen, square));
    setSelectedSquare(square);
    event.dataTransfer?.setDragImage(new Image(), 0, 0);
  };

  // RAF-throttled mouse move to prevent 60+ style recalcs/second
  let rafId: number | null = null;
  const handleMouseMove = (e: MouseEvent) => {
    if (draggedPiece()) {
      if (rafId !== null) return; // Skip if RAF pending
      rafId = requestAnimationFrame(() => {
        setCursorPosition({ x: e.clientX, y: e.clientY });
        rafId = null;
      });
    }
  };
  onCleanup(() => {
    if (rafId !== null) cancelAnimationFrame(rafId);
  });

  const handleMouseUp = (targetSquare: Square) => {
    if (chess.state.isGameOver) return;
    resetViewIfNeeded();
    const dragState = draggedPiece();
    if (!dragState) return;
    if (highlightedMoves().includes(targetSquare)) {
      executeMove(dragState.square, targetSquare);
    }
    clearDraggingState();
  };

  const executeMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    const board = chess.derived.currentBoard();
    const movePrep = prepareMove(from, to, board);

    if (movePrep.needsPromotion && !promotion) {
      setPendingPromotion(movePrep.promotionInfo);
      clearDraggingState();
      return;
    }

    // Use multiplayer move if this is a human vs human game
    if (derived.isMultiplayer()) {
      actions.applyMultiplayerMove(from, to, promotion);
    } else {
      actions.applyPlayerMove(from, to, promotion);
    }
    clearDraggingState();
  };

  const finalizePromotion = (from: Square, to: Square, promoPiece: PromotionPiece) => {
    executeMove(from, to, promoPiece);
    setPendingPromotion(null);
  };

  const canMovePiece = (square: Square) => {
    if (!chess.derived.isPlayerTurn()) return false;
    return canMovePieceAt(
      chess.state.fen,
      square,
      chess.state.playerColor,
      chess.derived.currentBoard()
    );
  };

  const selectSquare = (square: Square) => {
    batch(() => {
      setSelectedSquare(square);
      setHighlightedMoves(getLegalMoves(chess.state.fen, square));
    });
  };

  const clearDraggingState = () => {
    batch(() => {
      setDraggedPiece(null);
      setSelectedSquare(null);
      setHighlightedMoves([]);
    });
  };

  const handlePlayAgain = () => {
    setShowEndModal(false);
    local.onRequestNewGame?.();
  };

  const handlePromotionChoice = (pieceType: PromotionPiece) => {
    const promo = pendingPromotion();
    if (!promo) return;
    finalizePromotion(promo.from, promo.to, pieceType);
  };

  const handleCloseEndGame = () => {
    actions.exitGame();
    navigate('/');
  };

  return (
    <div onMouseMove={handleMouseMove} class={styles.chessGameContainer}>
      <div class={styles.rowWrapper}>
        <Show when={chess.state.mode === 'training'}>
          <ChessEvalBar evalScore={evalScore()} />
        </Show>

        <div class={styles.chessBoardContainer}>
          <ChessBoard
            board={chess.derived.currentBoard}
            highlightedMoves={highlightedMoves}
            selectedSquare={selectedSquare}
            draggedPiece={draggedPiece}
            cursorPosition={cursorPosition}
            onSquareClick={handleSquareClick}
            onSquareMouseUp={handleMouseUp}
            onDragStart={handleDragStart}
            lastMove={() => chess.state.lastMove}
            checkedKingSquare={() => chess.state.checkedKingSquare}
            boardView={() => ui.state.boardView}
            activePieceColor={() => chess.state.currentTurn}
          />
          <ChessEngineOverlay
            isLoading={derived.isEngineLoading()}
            hasError={derived.hasEngineError()}
            errorMessage={engine.state.error}
            onRetry={actions.retryEngineInit}
          />
          {/* Waiting for opponent overlay for multiplayer */}
          <Show when={multiplayer.state.isWaiting}>
            <div class={styles.waitingOverlay}>
              <div class={styles.waitingContent}>
                <div class={styles.spinner} />
                <h3>Waiting for Opponent</h3>
                <Show
                  when={multiplayer.state.gameId}
                  fallback={<p class={styles.waitingHint}>Connecting to server...</p>}
                >
                  <p class={styles.waitingHint}>Share this link with your opponent:</p>
                  <div class={styles.gameUrlContainer}>
                    <code class={styles.gameUrl}>
                      {`${window.location.origin}/play/${multiplayer.state.gameId}`}
                    </code>
                    <button
                      class={styles.copyButton}
                      onClick={() => {
                        const url = `${window.location.origin}/play/${multiplayer.state.gameId}`;
                        navigator.clipboard.writeText(url);
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </Show>
              </div>
            </div>
          </Show>
        </div>
      </div>

      <Show when={showEndModal()}>
        <ChessEndModal
          onClose={handleCloseEndGame}
          onPlayAgain={handlePlayAgain}
          gameOverReason={chess.state.gameOverReason}
          gameWinner={chess.state.gameWinner}
        />
      </Show>

      <Show when={pendingPromotion()}>
        <ChessPromotionModal
          color={pendingPromotion()!.color}
          onPromote={handlePromotionChoice}
          onClose={() => setPendingPromotion(null)}
        />
      </Show>
    </div>
  );
};

export default ChessBoardController;
