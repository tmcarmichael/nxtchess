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
import { audioService } from '../../../services/audio/AudioService';
import { getEvaluation } from '../../../services/engine/evalEngineWorker';
import { getLegalMoves, prepareMove } from '../../../services/game/chessGameService';
import { useKeyboardNavigation } from '../../../shared/hooks/useKeyboardNavigation';
import { useGameContext } from '../../../store/game/useGameContext';
import { type Square, type PromotionPiece } from '../../../types/chess';
import { type Side } from '../../../types/game';
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
  const { chess, engine, multiplayer, ui, actions, derived } = useGameContext();
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
  // Track if a drag operation just ended to prevent click from interfering
  let justDragged = false;

  useKeyboardNavigation({
    onPrevious: actions.jumpToPreviousMove,
    onNext: actions.jumpToNextMove,
    onFlip: actions.flipBoard,
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

  // Update highlighted moves when FEN changes while holding a piece
  // This allows the player to keep holding their piece after opponent moves
  createEffect(
    on(
      () => chess.state.fen,
      () => {
        const dragState = draggedPiece();
        if (dragState && chess.derived.isPlayerTurn()) {
          // Recalculate legal moves for the held piece based on new position
          const newMoves = getLegalMoves(chess.state.fen, dragState.square);
          setHighlightedMoves(newMoves);
        }
      }
    )
  );

  // Play sound when a move is made (track by move history length)
  createEffect(
    on(
      () => chess.state.moveHistory.length,
      (length, prevLength) => {
        // Play sound when a new move is added
        if (length > 0 && prevLength !== undefined && length > prevLength) {
          // Check if it was a capture (SAN contains 'x')
          const lastMove = chess.state.moveHistory[length - 1];
          const isCapture = lastMove?.includes('x') ?? false;
          audioService.playMoveSound(isCapture);
        }
      }
    )
  );

  // Play sound when game starts
  createEffect(
    on(
      () => chess.state.lifecycle,
      (lifecycle, prevLifecycle) => {
        // Play game start sound when transitioning to 'playing' state
        if (lifecycle === 'playing' && prevLifecycle !== 'playing') {
          audioService.playGameStart();
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
    // Initialize audio on first interaction
    audioService.init();

    // If a drag operation just occurred, skip click handling
    // (handleMouseUp already processed the drag)
    if (justDragged) {
      justDragged = false;
      return;
    }

    resetViewIfNeeded();
    const currentSelection = selectedSquare();

    if (!currentSelection) {
      // Allow selecting player's pieces even during opponent's turn
      const piece = chess.derived.currentBoard().find((sq) => sq.square === square)?.piece;
      if (piece && isPlayerPiece(square) && !chess.state.isGameOver && !engine.state.isThinking) {
        selectSquare(square);
        // Show legal moves (will be empty if not player's turn)
        setHighlightedMoves(getLegalMoves(chess.state.fen, square));
      }
      return;
    }

    // Clicked on the same square - deselect (only for pure clicks, not drag-drop)
    if (square === currentSelection) {
      clearDraggingState();
      return;
    }

    // Try to execute move if it's valid and player's turn
    if (canMove() && highlightedMoves().includes(square)) {
      executeMove(currentSelection, square);
      clearDraggingState();
    } else if (isPlayerPiece(square) && !chess.state.isGameOver) {
      // Clicked on another player piece - select it instead
      selectSquare(square);
      setHighlightedMoves(getLegalMoves(chess.state.fen, square));
    }
    // Keep selection if clicked elsewhere during opponent's turn
  };

  const handleDragStart = (square: Square, piece: string, event: DragEvent) => {
    // Allow picking up player's pieces even during opponent's turn (premove preparation)
    if (!isPlayerPiece(square)) return;
    // Don't allow picking up during game over or when engine is thinking
    if (chess.state.isGameOver || engine.state.isThinking) return;

    // Initialize audio on first interaction
    audioService.init();

    // Mark that a drag started so handleSquareClick doesn't interfere
    justDragged = true;

    resetViewIfNeeded();
    setDraggedPiece({ square, piece });
    setCursorPosition({ x: event.clientX, y: event.clientY });
    // Show legal moves (will be empty if not player's turn, but that's fine)
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

    // Player's turn - execute valid moves, then clear
    if (canMove()) {
      if (highlightedMoves().includes(targetSquare)) {
        executeMove(dragState.square, targetSquare);
      }
      clearDraggingState();
      return;
    }

    // Check if we should keep holding (multiplayer, opponent's turn, dropped elsewhere)
    const isMultiplayerWaitingForOpponent =
      chess.state.lifecycle === 'playing' &&
      chess.state.opponentType === 'human' &&
      !chess.derived.isPlayerTurn();

    if (isMultiplayerWaitingForOpponent && targetSquare !== dragState.square) {
      // Keep holding - waiting for opponent's move in multiplayer
      return;
    }

    // All other cases - clear drag state
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
    if (derived.isMultiplayer() && actions.applyMultiplayerMove) {
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

  // Check if a piece at square belongs to the player (for picking up)
  const isPlayerPiece = (square: Square) => {
    const piece = chess.derived.currentBoard().find((sq) => sq.square === square)?.piece;
    return !!piece && piece[0] === chess.state.playerColor;
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
          <Show when={multiplayer?.state.isWaiting}>
            <div class={styles.waitingOverlay}>
              <div class={styles.waitingContent}>
                <div class={styles.spinner} />
                <h3>Waiting for Opponent</h3>
                <Show
                  when={multiplayer?.state.gameId}
                  fallback={<p class={styles.waitingHint}>Connecting to server...</p>}
                >
                  <p class={styles.waitingHint}>Share this link with your opponent:</p>
                  <div class={styles.gameUrlContainer}>
                    <code class={styles.gameUrl}>
                      {`${window.location.origin}/play/${multiplayer?.state.gameId}`}
                    </code>
                    <button
                      class={styles.copyButton}
                      onClick={() => {
                        const url = `${window.location.origin}/play/${multiplayer?.state.gameId}`;
                        navigator.clipboard.writeText(url);
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </Show>
                <button class={styles.cancelButton} onClick={actions.exitGame}>
                  Cancel
                </button>
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
