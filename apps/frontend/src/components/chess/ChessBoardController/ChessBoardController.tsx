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
import {
  getLegalMoves,
  getPremoveLegalMoves,
  prepareMove,
} from '../../../services/game/chessGameService';
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
  const { chess, engine, multiplayer, timer, ui, actions, derived } = useGameContext();
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
  // Premove state
  const [premove, setPremove] = createSignal<{
    from: Square;
    to: Square;
    promotion?: PromotionPiece;
  } | null>(null);
  const [pendingPremovePromotion, setPendingPremovePromotion] = createSignal<{
    from: Square;
    to: Square;
    color: Side;
  } | null>(null);
  // Track animating piece for smooth move transitions
  const [animatingMove, setAnimatingMove] = createSignal<{
    from: Square;
    to: Square;
    piece: string;
  } | null>(null);
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

  // Animate piece movement when a move is made
  const ANIMATION_DURATION = 500;
  createEffect(
    on(
      () => chess.state.moveHistory.length,
      (length, prevLength) => {
        // Only animate when a NEW move is added (not initial load or navigation)
        if (prevLength === undefined || length <= prevLength) return;
        // Don't animate during history navigation
        if (chess.derived.isViewingHistory()) return;
        // Skip animation in bullet mode (1 min) - every ms counts
        if (timer.timeControl === 1) return;

        const lastMove = chess.state.lastMove;
        if (!lastMove) return;

        // Get the piece at the destination (it's already moved there)
        const board = chess.derived.currentBoard();
        const piece = board.find((sq) => sq.square === lastMove.to)?.piece;
        if (!piece) return;

        setAnimatingMove({ from: lastMove.from, to: lastMove.to, piece });

        // Clear animation after duration
        setTimeout(() => setAnimatingMove(null), ANIMATION_DURATION);
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

  // Execute premove when it becomes player's turn
  createEffect(
    on(
      () => [chess.derived.isPlayerTurn(), chess.state.fen] as const,
      ([isPlayerTurn], prev) => {
        // Only execute when turn changes to player's turn AND a premove exists
        if (isPlayerTurn && prev && !prev[0] && premove()) {
          queueMicrotask(() => tryExecutePremove());
        }
      }
    )
  );

  // Clear premove when game ends, viewing history, or game lifecycle changes
  createEffect(
    on(
      () =>
        [chess.state.isGameOver, chess.derived.isViewingHistory(), chess.state.lifecycle] as const,
      ([isGameOver, isViewingHistory, lifecycle]) => {
        if (isGameOver || isViewingHistory || lifecycle !== 'playing') {
          clearPremove();
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
      // Clear any existing premove when selecting a new piece
      clearPremove();
      // Allow selecting player's pieces even during opponent's turn
      const piece = chess.derived.currentBoard().find((sq) => sq.square === square)?.piece;
      if (piece && isPlayerPiece(square) && !chess.state.isGameOver && !engine.state.isThinking) {
        selectSquare(square);
        // Use premove-aware moves when it's not player's turn
        const moves = chess.derived.isPlayerTurn()
          ? getLegalMoves(chess.state.fen, square)
          : getPremoveLegalMoves(chess.state.fen, square);
        setHighlightedMoves(moves);
      }
      return;
    }

    // Clicked on the same square - deselect (only for pure clicks, not drag-drop)
    if (square === currentSelection) {
      clearDraggingState();
      clearPremove();
      return;
    }

    // Try to execute move if it's valid and player's turn
    if (canMove() && highlightedMoves().includes(square)) {
      executeMove(currentSelection, square);
      clearDraggingState();
    } else if (canSetPremove(currentSelection) && highlightedMoves().includes(square)) {
      // Set premove during opponent's turn
      setPremoveWithPromotion(currentSelection, square);
    } else if (isPlayerPiece(square) && !chess.state.isGameOver) {
      // Clicked on another player piece - select it instead
      clearPremove();
      selectSquare(square);
      const moves = chess.derived.isPlayerTurn()
        ? getLegalMoves(chess.state.fen, square)
        : getPremoveLegalMoves(chess.state.fen, square);
      setHighlightedMoves(moves);
    }
    // Keep selection if clicked elsewhere during opponent's turn
  };

  const handleDragStart = (square: Square, piece: string, event: DragEvent) => {
    // Allow picking up player's pieces even during opponent's turn (premove preparation)
    if (!isPlayerPiece(square)) return;
    // Don't allow picking up during game over or when engine is thinking
    if (chess.state.isGameOver || engine.state.isThinking) return;

    // Clear any existing premove when starting a new drag
    clearPremove();

    // Initialize audio on first interaction
    audioService.init();

    // Mark that a drag started so handleSquareClick doesn't interfere
    justDragged = true;

    resetViewIfNeeded();
    setDraggedPiece({ square, piece });
    setCursorPosition({ x: event.clientX, y: event.clientY });
    // Use premove-aware moves when it's not player's turn
    const moves = chess.derived.isPlayerTurn()
      ? getLegalMoves(chess.state.fen, square)
      : getPremoveLegalMoves(chess.state.fen, square);
    setHighlightedMoves(moves);
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

    // Set premove during opponent's turn
    if (
      canSetPremove(dragState.square) &&
      highlightedMoves().includes(targetSquare) &&
      targetSquare !== dragState.square
    ) {
      setPremoveWithPromotion(dragState.square, targetSquare);
      return;
    }

    // Dropped on original square or invalid target - clear
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Premove Functions
  // ─────────────────────────────────────────────────────────────────────────────

  const clearPremove = () => {
    batch(() => {
      setPremove(null);
      setPendingPremovePromotion(null);
    });
  };

  const canSetPremove = (from: Square): boolean => {
    if (chess.derived.isViewingHistory()) return false;
    if (chess.derived.isPlayerTurn()) return false; // Use normal move instead
    if (chess.state.isGameOver || chess.state.lifecycle !== 'playing') return false;
    if (!isPlayerPiece(from)) return false;
    return true;
  };

  const setPremoveWithPromotion = (from: Square, to: Square) => {
    const board = chess.derived.currentBoard();
    const piece = board.find((sq) => sq.square === from)?.piece;

    // Check if this is a pawn promotion move
    if (piece && piece.endsWith('P')) {
      const rank = parseInt(to[1], 10);
      const isPromotion =
        (piece.startsWith('w') && rank === 8) || (piece.startsWith('b') && rank === 1);
      if (isPromotion) {
        // Show promotion modal for premove
        setPendingPremovePromotion({ from, to, color: piece[0] as Side });
        clearDraggingState();
        return;
      }
    }

    // Regular premove (no promotion)
    setPremove({ from, to });
    clearDraggingState();
  };

  const tryExecutePremove = () => {
    const pm = premove();
    if (!pm) return;

    const legalMoves = getLegalMoves(chess.state.fen, pm.from);
    if (legalMoves.includes(pm.to)) {
      executeMove(pm.from, pm.to, pm.promotion);
    }
    clearPremove(); // Always clear after attempt
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

  const handlePremovePromotionChoice = (pieceType: PromotionPiece) => {
    const promo = pendingPremovePromotion();
    if (!promo) return;
    setPremove({ from: promo.from, to: promo.to, promotion: pieceType });
    setPendingPremovePromotion(null);
    clearDraggingState();
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
            premoveSquares={() => {
              const pm = premove();
              return pm ? { from: pm.from, to: pm.to } : null;
            }}
            animatingMove={animatingMove}
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

      <Show when={pendingPremovePromotion()}>
        <ChessPromotionModal
          color={pendingPremovePromotion()!.color}
          onPromote={handlePremovePromotionChoice}
          onClose={() => setPendingPremovePromotion(null)}
        />
      </Show>
    </div>
  );
};

export default ChessBoardController;
