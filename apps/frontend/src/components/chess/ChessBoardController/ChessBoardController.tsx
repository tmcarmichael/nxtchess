import { createSignal, batch, Show, ParentComponent, createEffect, splitProps } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Square, PromotionPiece, Side } from '../../../types';
import { getLegalMoves, prepareMove, canMovePieceAt } from '../../../services/game';
import { useGameStore } from '../../../store';
import { useKeyboardNavigation } from '../../../shared';
import ChessEvalBar from '../ChessEvalBar/ChessEvalBar';
import { getEvaluation } from '../../../services/engine';
import ChessEndModal from '../ChessEndModal/ChessEndModal';
import ChessPromotionModal from '../../chess/ChessPromotionModal/ChessPromotionModal';
import ChessBoard from '../../chess/ChessBoard/ChessBoard';
import ChessEngineOverlay from '../ChessEngineOverlay/ChessEngineOverlay';
import styles from './ChessBoardController.module.css';

interface ChessBoardControllerProps {
  onRequestNewGame?: () => void;
}

const ChessBoardController: ParentComponent<ChessBoardControllerProps> = (props) => {
  const [local] = splitProps(props, ['onRequestNewGame']);
  const [state, actions, derived] = useGameStore();
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
      const newIndex = state.viewMoveIndex - 1;
      if (newIndex >= 0) {
        actions.jumpToMoveIndex(newIndex);
      }
    },
    onNext: () => {
      const newIndex = state.viewMoveIndex + 1;
      if (newIndex <= state.moveHistory.length - 1) {
        actions.jumpToMoveIndex(newIndex);
      }
    },
    onFlip: actions.flipBoardView,
    enabled: () => !state.isGameOver,
  });

  createEffect(() => {
    if (state.mode === 'training') {
      const currentFen = state.fen;
      getEvaluation(currentFen).then((score: number) => {
        setEvalScore(score ?? null);
      });
    }
  });

  createEffect(() => {
    if (state.isGameOver) {
      setShowEndModal(true);
    }
  });

  const resetViewIfNeeded = () => {
    if (derived.isViewingHistory()) {
      const hist = actions.getChessInstance().history();
      batch(() => {
        actions.setState('viewFen', state.fen);
        actions.setState('viewMoveIndex', hist.length - 1);
      });
    }
  };

  const handleSquareClick = (square: Square) => {
    if (!derived.canMove()) return;
    resetViewIfNeeded();
    const currentSelection = selectedSquare();
    if (!currentSelection) {
      const piece = derived.currentBoard().find((sq) => sq.square === square)?.piece;
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
    if (!derived.canMove() || !canMovePiece(square)) return;
    resetViewIfNeeded();
    setDraggedPiece({ square, piece });
    setCursorPosition({ x: event.clientX, y: event.clientY });
    setHighlightedMoves(getLegalMoves(state.fen, square));
    setSelectedSquare(square);
    event.dataTransfer?.setDragImage(new Image(), 0, 0);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggedPiece()) {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (targetSquare: Square) => {
    if (state.isGameOver) return;
    resetViewIfNeeded();
    const dragState = draggedPiece();
    if (!dragState) return;
    if (highlightedMoves().includes(targetSquare)) {
      executeMove(dragState.square, targetSquare);
    }
    clearDraggingState();
  };

  const executeMove = (from: Square, to: Square, promotion?: PromotionPiece) => {
    const board = derived.currentBoard();
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
    if (!derived.isPlayerTurn()) return false;
    return canMovePieceAt(state.fen, square, state.playerColor, derived.currentBoard());
  };

  const selectSquare = (square: Square) => {
    batch(() => {
      setSelectedSquare(square);
      setHighlightedMoves(getLegalMoves(state.fen, square));
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
        <Show when={state.mode === 'training'}>
          <ChessEvalBar evalScore={evalScore()} />
        </Show>

        <div class={styles.chessBoardContainer}>
          <ChessBoard
            board={derived.currentBoard}
            highlightedMoves={highlightedMoves}
            selectedSquare={selectedSquare}
            draggedPiece={draggedPiece}
            cursorPosition={cursorPosition}
            onSquareClick={handleSquareClick}
            onSquareMouseUp={handleMouseUp}
            onDragStart={handleDragStart}
            lastMove={() => state.lastMove}
            checkedKingSquare={() => state.checkedKingSquare}
            boardView={() => state.boardView}
            activePieceColor={() => state.currentTurn}
          />
          <ChessEngineOverlay
            isLoading={derived.isEngineLoading()}
            hasError={derived.hasEngineError()}
            errorMessage={state.engineError}
            onRetry={actions.retryEngineInit}
          />
          {/* Waiting for opponent overlay for multiplayer */}
          <Show when={state.isWaitingForOpponent}>
            <div class={styles.waitingOverlay}>
              <div class={styles.waitingContent}>
                <div class={styles.spinner} />
                <h3>Waiting for Opponent</h3>
                <Show
                  when={state.multiplayerGameId}
                  fallback={<p class={styles.waitingHint}>Connecting to server...</p>}
                >
                  <p class={styles.waitingHint}>Share this link with your opponent:</p>
                  <div class={styles.gameUrlContainer}>
                    <code class={styles.gameUrl}>
                      {`${window.location.origin}/play/${state.multiplayerGameId}`}
                    </code>
                    <button
                      class={styles.copyButton}
                      onClick={() => {
                        const url = `${window.location.origin}/play/${state.multiplayerGameId}`;
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
          gameOverReason={state.gameOverReason}
          gameWinner={state.gameWinner}
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
