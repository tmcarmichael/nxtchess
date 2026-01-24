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
import { getEvaluation, isEvalEngineInitialized } from '../../../services/engine/evalEngineWorker';
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
import ChessClock from '../../chess/ChessClock/ChessClock';
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
  // Flash king square when illegal move attempted
  const [flashKingSquare, setFlashKingSquare] = createSignal<Square | null>(null);
  // Track if low-time warning has been played (resets each game)
  let lowTimeWarningPlayed = false;
  // Track if a drag operation just ended to prevent click from interfering
  let justDragged = false;

  useKeyboardNavigation({
    onPrevious: actions.jumpToPreviousMove,
    onNext: actions.jumpToNextMove,
    onFlip: actions.flipBoard,
    enabled: () => !chess.state.isGameOver || chess.state.mode === 'training',
  });

  // Only re-evaluate when FEN changes and eval bar is shown (not on every state update)
  // Skip evaluation during idle/ended states to avoid timeouts during exit
  createEffect(
    on(
      () => [chess.state.fen, derived.showEvalBar(), chess.state.lifecycle] as const,
      ([currentFen, showEval, lifecycle]) => {
        if (showEval && isEvalEngineInitialized() && lifecycle === 'playing') {
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
        setShowEndModal(isGameOver);
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
          const lastMove = chess.state.moveHistory[length - 1];
          const isCapture = lastMove?.includes('x') ?? false;
          const isCheck = chess.state.checkedKingSquare !== null;

          if (isCapture && isCheck) {
            // Capture + check: play capture sound, then check sound
            audioService.playMoveSound(true);
            setTimeout(() => audioService.playCheck(), 80);
          } else if (isCheck) {
            // Check only: play check sound
            audioService.playCheck();
          } else {
            // Normal move or capture
            audioService.playMoveSound(isCapture);
          }
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
        // Play game end sound when game ends
        if (lifecycle === 'ended' && prevLifecycle === 'playing') {
          audioService.playGameEnd();
        }
      }
    )
  );

  // Low time warning (10 seconds remaining)
  const LOW_TIME_THRESHOLD = 10000; // 10 seconds in ms
  createEffect(
    on(
      () => chess.state.lifecycle,
      (lifecycle) => {
        // Reset warning flag when new game starts
        if (lifecycle === 'playing') {
          lowTimeWarningPlayed = false;
        }
      }
    )
  );

  createEffect(
    on(
      () => {
        const playerColor = chess.state.playerColor;
        const playerTime = playerColor === 'w' ? timer.whiteTime : timer.blackTime;
        return playerTime;
      },
      (playerTime, prevTime) => {
        // Only trigger if:
        // - Timer values are available (timed game)
        // - Game is playing
        // - Warning hasn't been played yet
        // - Time crossed below threshold (was above, now at or below)
        if (
          playerTime !== undefined &&
          prevTime !== undefined &&
          chess.state.lifecycle === 'playing' &&
          !lowTimeWarningPlayed &&
          prevTime > LOW_TIME_THRESHOLD &&
          playerTime <= LOW_TIME_THRESHOLD
        ) {
          audioService.playLowTime();
          lowTimeWarningPlayed = true;
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

  // Clear premove and dragging state when game ends, viewing history, or game lifecycle changes
  createEffect(
    on(
      () =>
        [chess.state.isGameOver, chess.derived.isViewingHistory(), chess.state.lifecycle] as const,
      ([isGameOver, isViewingHistory, lifecycle]) => {
        if (isGameOver || isViewingHistory || lifecycle !== 'playing') {
          clearPremove();
          clearDraggingState();
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

  // Find the player's king square for illegal move feedback
  const findPlayerKingSquare = (): Square | null => {
    const playerColor = chess.state.playerColor;
    const kingPiece = playerColor === 'w' ? 'wK' : 'bK';
    const board = chess.derived.currentBoard();
    const kingSquare = board.find((sq) => sq.piece === kingPiece);
    return kingSquare?.square ?? null;
  };

  // Trigger illegal move feedback (sound + king flash)
  const triggerIllegalMoveFeedback = () => {
    audioService.playIllegalMove();
    const kingSquare = findPlayerKingSquare();
    if (kingSquare) {
      setFlashKingSquare(kingSquare);
      // Clear flash after animation duration (400ms)
      setTimeout(() => setFlashKingSquare(null), 400);
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
    } else if (canMove() && highlightedMoves().length > 0 && !highlightedMoves().includes(square)) {
      // Attempted illegal move - play error sound and flash king
      triggerIllegalMoveFeedback();
      clearDraggingState();
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

  // Touch event handling for mobile
  // Track touch start position to distinguish tap vs drag
  let touchStartPos: { x: number; y: number; square: Square; piece: string } | null = null;
  let isTouchDragging = false;
  const DRAG_THRESHOLD = 10; // pixels - movement beyond this activates drag

  const handleTouchStart = (square: Square, piece: string, event: TouchEvent) => {
    // Allow picking up player's pieces even during opponent's turn (premove preparation)
    if (!isPlayerPiece(square)) return;
    // Don't allow picking up during game over or when engine is thinking
    if (chess.state.isGameOver || engine.state.isThinking) return;

    // Initialize audio on first interaction
    audioService.init();

    // Record touch start - don't activate drag yet (let tap-to-select work)
    const touch = event.touches[0];
    if (!touch) return;
    touchStartPos = { x: touch.clientX, y: touch.clientY, square, piece };
    isTouchDragging = false;
  };

  // Activates drag mode after movement threshold exceeded
  const activateTouchDrag = () => {
    if (!touchStartPos || isTouchDragging) return;
    isTouchDragging = true;

    // Clear any existing premove when starting a new drag
    clearPremove();

    // Mark that a drag started so handleSquareClick doesn't interfere
    justDragged = true;

    resetViewIfNeeded();
    setDraggedPiece({ square: touchStartPos.square, piece: touchStartPos.piece });
    setCursorPosition({ x: touchStartPos.x, y: touchStartPos.y });
    // Use premove-aware moves when it's not player's turn
    const moves = chess.derived.isPlayerTurn()
      ? getLegalMoves(chess.state.fen, touchStartPos.square)
      : getPremoveLegalMoves(chess.state.fen, touchStartPos.square);
    setHighlightedMoves(moves);
    setSelectedSquare(touchStartPos.square);
  };

  // RAF-throttled mouse/touch move to prevent 60+ style recalcs/second
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

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    // Check if we should activate drag mode (movement exceeded threshold)
    if (touchStartPos && !isTouchDragging) {
      const dx = touch.clientX - touchStartPos.x;
      const dy = touch.clientY - touchStartPos.y;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        activateTouchDrag();
      }
    }

    // Only track position if actively dragging
    if (isTouchDragging && draggedPiece()) {
      if (rafId !== null) return; // Skip if RAF pending
      rafId = requestAnimationFrame(() => {
        setCursorPosition({ x: touch.clientX, y: touch.clientY });
        rafId = null;
      });
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    // If we were dragging, handle the drop
    if (isTouchDragging && draggedPiece()) {
      const touch = e.changedTouches[0];
      if (touch) {
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

        // Find the square element (either the target or a parent with data-square)
        let squareElement = targetElement as HTMLElement | null;
        while (squareElement && !squareElement.dataset?.square) {
          squareElement = squareElement.parentElement;
        }

        if (squareElement?.dataset?.square) {
          const targetSquare = squareElement.dataset.square as Square;
          handleMouseUp(targetSquare);
        } else {
          // Dropped outside the board - clear dragging state
          clearDraggingState();
        }
      } else {
        clearDraggingState();
      }
    }
    // If not dragging (was a tap), let the click event handle selection naturally

    // Reset touch tracking state
    touchStartPos = null;
    isTouchDragging = false;
  };

  // Handle touch cancel (e.g., incoming call, palm rejection)
  const handleTouchCancel = () => {
    if (isTouchDragging) {
      clearDraggingState();
    }
    touchStartPos = null;
    isTouchDragging = false;
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

    // Dropped on invalid target (not original square) - illegal move attempt
    if (
      targetSquare !== dragState.square &&
      highlightedMoves().length > 0 &&
      !highlightedMoves().includes(targetSquare)
    ) {
      triggerIllegalMoveFeedback();
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
    // Disable premoves in training mode - eval engine can't handle rapid position changes
    if (chess.state.mode === 'training') return false;
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
        justDragged = false;
        return;
      }
    }

    // Regular premove (no promotion)
    setPremove({ from, to });
    clearDraggingState();
    // Reset justDragged so next click can cancel premove
    justDragged = false;
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
    // In training mode, just close the modal so user can review moves
    if (chess.state.mode === 'training') {
      setShowEndModal(false);
      return;
    }
    // For other modes, exit and go home
    actions.exitGame();
    navigate('/');
  };

  // Ref for container to add non-passive touch listeners
  let containerRef: HTMLDivElement | undefined;

  // Add non-passive touchmove listener to allow preventDefault (stop scrolling while dragging)
  createEffect(() => {
    if (!containerRef) return;

    const onTouchMove = (e: TouchEvent) => {
      // Prevent scrolling as soon as user touches a piece and starts moving
      // Must prevent early - if we wait until drag activates, browser may have
      // already started a scroll gesture and taken over the touch events
      if (touchStartPos) {
        e.preventDefault();
      }
      handleTouchMove(e);
    };

    // Must use { passive: false } to allow preventDefault
    containerRef.addEventListener('touchmove', onTouchMove, { passive: false });

    onCleanup(() => {
      containerRef?.removeEventListener('touchmove', onTouchMove);
    });
  });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      class={styles.chessGameContainer}
    >
      <div class={styles.rowWrapper}>
        <div class={styles.boardWithClocks}>
          <div class={styles.evalBoardRow}>
            <Show when={derived.showEvalBar()}>
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
                onTouchStart={handleTouchStart}
                lastMove={() => chess.state.lastMove}
                checkedKingSquare={() => chess.state.checkedKingSquare}
                boardView={() => ui.state.boardView}
                activePieceColor={() => chess.state.currentTurn}
                premoveSquares={() => {
                  const pm = premove();
                  return pm ? { from: pm.from, to: pm.to } : null;
                }}
                animatingMove={animatingMove}
                flashKingSquare={flashKingSquare}
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
          {/* Clock column - anchored to right side of board */}
          <Show when={timer.whiteTime !== undefined && timer.blackTime !== undefined}>
            <div class={styles.clockColumn}>
              <div class={styles.clockTop}>
                <ChessClock
                  timeMs={() => (ui.state.boardView === 'w' ? timer.blackTime! : timer.whiteTime!)}
                  isActive={() => chess.state.currentTurn !== ui.state.boardView}
                />
              </div>
              <div class={styles.clockBottom}>
                <ChessClock
                  timeMs={() => (ui.state.boardView === 'w' ? timer.whiteTime! : timer.blackTime!)}
                  isActive={() => chess.state.currentTurn === ui.state.boardView}
                />
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
