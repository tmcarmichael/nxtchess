import { useNavigate } from '@solidjs/router';
import {
  createSignal,
  createMemo,
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
  normalizeCastlingTarget,
  getCastlingHintSquares,
} from '../../../services/game/chessGameService';
import { useKeyboardNavigation } from '../../../shared/hooks/useKeyboardNavigation';
import { useGameContext } from '../../../store/game/useGameContext';
import { type Square, type PromotionPiece, type BoardArrow } from '../../../types/chess';
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
  onRestartGame?: () => void;
  /** Getter function to check if auto-restart should happen (re-evaluated at trigger time) */
  autoRestartOnEnd?: () => boolean;
}

const ChessBoardController: ParentComponent<ChessBoardControllerProps> = (props) => {
  const [local] = splitProps(props, ['onRequestNewGame', 'onRestartGame', 'autoRestartOnEnd']);
  const { chess, engine, multiplayer, timer, ui, actions, derived } = useGameContext();
  const navigate = useNavigate();
  const [highlightedMoves, setHighlightedMoves] = createSignal<Square[]>([]);
  const [selectedSquare, setSelectedSquare] = createSignal<Square | null>(null);
  const [draggedPiece, setDraggedPiece] = createSignal<{ square: Square; piece: string } | null>(
    null
  );
  const [cursorPosition, setCursorPosition] = createSignal({ x: 0, y: 0 });
  const [dragHoverSquare, setDragHoverSquare] = createSignal<Square | null>(null);
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
  const [rightClickHighlights, setRightClickHighlights] = createSignal<Set<Square>>(new Set());
  const [rightClickArrows, setRightClickArrows] = createSignal<BoardArrow[]>([]);
  const [rightClickDragStart, setRightClickDragStart] = createSignal<Square | null>(null);
  const [rightClickHoverSquare, setRightClickHoverSquare] = createSignal<Square | null>(null);
  const [gameEventAnnouncement, setGameEventAnnouncement] = createSignal('');
  // Focus mode game result toast
  const [gameResultToast, setGameResultToast] = createSignal<string | null>(null);
  const [toastFadingOut, setToastFadingOut] = createSignal(false);
  // Track if low-time warning has been played (resets each game)
  let lowTimeWarningPlayed = false;
  // Toast dismiss timer ref
  let toastDismissTimer: ReturnType<typeof setTimeout> | null = null;
  // Eval debounce timer ref - prevents rapid eval calls during fast piece movement
  let evalDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  const EVAL_DEBOUNCE_MS = 300;

  const isValidArrowMove = (from: Square, to: Square): boolean => {
    const dx = Math.abs(to.charCodeAt(0) - from.charCodeAt(0));
    const dy = Math.abs(parseInt(to[1], 10) - parseInt(from[1], 10));
    if (dx === 0 && dy === 0) return false;
    if (dx === 0 || dy === 0) return true;
    if (dx === dy) return true;
    if ((dx === 2 && dy === 1) || (dx === 1 && dy === 2)) return true;
    return false;
  };

  const castlingHintSquares = createMemo((): Set<Square> => {
    const moves = highlightedMoves();
    if (moves.length === 0) return new Set();

    const sq = selectedSquare() || draggedPiece()?.square;
    if (!sq) return new Set();

    const board = chess.derived.currentBoard();
    const piece = board.find((s) => s.square === sq)?.piece;
    if (!piece || piece[1] !== 'K') return new Set();

    return getCastlingHintSquares(moves);
  });

  const previewArrow = createMemo((): BoardArrow | null => {
    const start = rightClickDragStart();
    const hover = rightClickHoverSquare();
    if (!start || !hover || start === hover) return null;
    if (!isValidArrowMove(start, hover)) return null;
    return { from: start, to: hover };
  });

  // Pointer event tracking state
  let pointerTracking: {
    pointerId: number;
    startX: number;
    startY: number;
    square: Square;
    piece: string;
  } | null = null;
  let isPointerDragging = false;
  let latestPointerPos = { x: 0, y: 0 };
  let boardRef: HTMLElement | null = null;
  const DRAG_THRESHOLD = 8;

  // Ref for container
  let containerRef: HTMLDivElement | undefined;

  useKeyboardNavigation({
    onPrevious: actions.jumpToPreviousMove,
    onNext: actions.jumpToNextMove,
    onFirst: actions.jumpToFirstMove,
    onLast: actions.jumpToLastMove,
    onFlip: actions.flipBoard,
    enabled: () =>
      !chess.state.isGameOver ||
      chess.state.mode === 'training' ||
      chess.state.mode === 'puzzle' ||
      chess.state.mode === 'analysis',
  });

  // Only re-evaluate when FEN changes and eval bar is shown (not on every state update)
  // Skip evaluation during idle/ended states to avoid timeouts during exit
  // Debounce to prevent rapid eval calls during fast piece movement
  // Note: When derived.getEvalScore is available (Analyze mode), we use that directly
  // instead of running the evalEngineWorker
  createEffect(
    on(
      () => [chess.state.fen, derived.showEvalBar(), chess.state.lifecycle] as const,
      ([currentFen, showEval, lifecycle]) => {
        // If context provides eval score (e.g., Analyze mode), skip this effect
        // The eval bar will read from derived.getEvalScore() instead
        if (derived.getEvalScore) {
          return;
        }

        // Clear any pending eval
        if (evalDebounceTimer) {
          clearTimeout(evalDebounceTimer);
          evalDebounceTimer = null;
        }

        if (showEval && isEvalEngineInitialized() && lifecycle === 'playing') {
          evalDebounceTimer = setTimeout(() => {
            getEvaluation(currentFen)
              .then((score: number) => {
                setEvalScore(score ?? null);
              })
              .catch(() => {
                // Evaluation was cancelled by a newer request - ignore
                // The next position change will trigger a new evaluation
              });
          }, EVAL_DEBOUNCE_MS);
        }
      }
    )
  );

  // Helper to generate game result message for toast
  const getGameResultMessage = (): string => {
    const reason = chess.state.gameOverReason;
    const winner = chess.state.gameWinner;

    if (reason === 'checkmate' && winner) {
      const winnerName = winner === 'w' ? 'White' : 'Black';
      return `${winnerName} wins by checkmate`;
    }
    if (reason === 'stalemate') {
      return 'Stalemate';
    }
    if (winner === 'draw') {
      return 'Draw';
    }
    if (reason === 'resignation') {
      const winnerName = winner === 'w' ? 'White' : winner === 'b' ? 'Black' : '';
      return winnerName ? `${winnerName} wins by resignation` : 'Resignation';
    }
    return 'Game Over';
  };

  // Dismiss toast with fade-out animation
  const dismissToast = () => {
    if (toastDismissTimer) {
      clearTimeout(toastDismissTimer);
      toastDismissTimer = null;
    }
    if (gameResultToast()) {
      setToastFadingOut(true);
      setTimeout(() => {
        setGameResultToast(null);
        setToastFadingOut(false);
      }, 300); // Match CSS animation duration
    }
  };

  createEffect(
    on(
      () => chess.state.isGameOver,
      (isGameOver, wasGameOver) => {
        if (isGameOver && !wasGameOver) {
          // Game just ended - check auto-restart condition immediately
          if (local.autoRestartOnEnd?.() && local.onRestartGame) {
            // Show toast with game result in focus mode
            const message = getGameResultMessage();
            setGameResultToast(message);
            setToastFadingOut(false);

            // Auto-dismiss toast after 2.5 seconds
            toastDismissTimer = setTimeout(() => {
              dismissToast();
            }, 2500);

            // Auto-restart after brief delay to see final position
            // Re-check condition at trigger time to handle toggle during delay
            setTimeout(() => {
              if (local.autoRestartOnEnd?.()) {
                local.onRestartGame?.();
              } else {
                dismissToast();
                setShowEndModal(true);
              }
            }, 800);
          } else if (chess.state.mode === 'puzzle') {
            // Puzzle feedback handled entirely by PuzzleContainer
            // (focus mode hits the autoRestart branch above, eval mode uses PuzzleFeedbackModal)
          } else if (derived.allowBothSides()) {
            // Analyze mode: no toast or modal - user can navigate history and play alternatives
          } else {
            setShowEndModal(true);
          }
        } else if (!isGameOver) {
          setShowEndModal(false);
          // Clear toast when new game starts
          if (gameResultToast()) {
            dismissToast();
          }
        }
      }
    )
  );

  // Puzzle feedback toast (focus mode only - eval mode uses PuzzleFeedbackModal)
  createEffect(
    on(
      () => derived.getPuzzleFeedback?.(),
      (feedback) => {
        if (!feedback) return;
        if (!local.autoRestartOnEnd?.()) return;
        if (toastDismissTimer) clearTimeout(toastDismissTimer);
        setGameResultToast(feedback.message);
        setToastFadingOut(false);
        toastDismissTimer = setTimeout(() => {
          dismissToast();
        }, 2000);
      }
    )
  );

  // Update highlighted moves when FEN changes while holding a piece
  // This allows the player to keep holding their piece after opponent moves
  createEffect(
    on(
      () => [chess.state.fen, chess.state.viewFen] as const,
      () => {
        const dragState = draggedPiece();
        if (dragState && chess.derived.isPlayerTurn()) {
          // Recalculate legal moves for the held piece based on new position
          const fen = getMoveCalculationFen();
          const newMoves = getLegalMoves(fen, dragState.square);
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
            audioService.playMoveSound(true);
            setTimeout(() => audioService.playCheck(), 80);
          } else if (isCheck) {
            audioService.playCheck();
          } else {
            audioService.playMoveSound(isCapture);
          }

          if (isCheck) {
            setGameEventAnnouncement('Check');
            setTimeout(() => setGameEventAnnouncement(''), 1000);
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

  // Play sound when game starts (not in analysis mode)
  createEffect(
    on(
      () => chess.state.lifecycle,
      (lifecycle, prevLifecycle) => {
        if (chess.state.mode === 'analysis') return;
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
        // In analyze mode, don't clear state when game is over (allows history interaction)
        if (derived.allowBothSides() && isGameOver) return;
        if (isGameOver || isViewingHistory || lifecycle !== 'playing') {
          clearPremove();
          clearDraggingState();
        }
      }
    )
  );

  const resetViewIfNeeded = () => {
    // In analyze mode (allowBothSides), skip resetting view
    // The user should be able to play from historical positions
    // Truncation is handled in the analyze actions layer
    if (derived.allowBothSides()) return;

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
    setGameEventAnnouncement('Illegal move');
    setTimeout(() => setGameEventAnnouncement(''), 1000);
    const kingSquare = findPlayerKingSquare();
    if (kingSquare) {
      setFlashKingSquare(kingSquare);
      setTimeout(() => setFlashKingSquare(null), 400);
    }
  };

  // In analyze mode, allow interaction when viewing history even after game over
  const isAnalyzeHistoryOverride = () =>
    derived.allowBothSides() &&
    chess.state.isGameOver &&
    chess.state.viewMoveIndex < chess.state.moveHistory.length - 1;

  const canMove = () => {
    const isViewingHistory = chess.state.viewMoveIndex < chess.state.moveHistory.length - 1;
    const analyzeOverride = derived.allowBothSides() && isViewingHistory;
    const gameOverCheck = analyzeOverride ? true : !chess.state.isGameOver;
    const lifecycleCheck = analyzeOverride ? true : chess.state.lifecycle === 'playing';

    const baseCheck = !engine.state.isThinking && lifecycleCheck && gameOverCheck;

    if (derived.allowBothSides()) {
      return baseCheck;
    }
    return baseCheck && chess.derived.isPlayerTurn();
  };

  // Get the FEN to use for move calculations - viewFen in analyze mode, fen otherwise
  const getMoveCalculationFen = () => {
    return derived.allowBothSides() ? chess.state.viewFen : chess.state.fen;
  };

  const getSquareFromCoordinates = (clientX: number, clientY: number): Square | null => {
    if (!boardRef) return null;

    const boardRect = boardRef.getBoundingClientRect();

    if (
      clientX < boardRect.left ||
      clientX > boardRect.right ||
      clientY < boardRect.top ||
      clientY > boardRect.bottom
    ) {
      return null;
    }

    const squareSize = boardRect.width / 8;
    const col = Math.max(0, Math.min(7, Math.floor((clientX - boardRect.left) / squareSize)));
    const row = Math.max(0, Math.min(7, Math.floor((clientY - boardRect.top) / squareSize)));

    const view = ui.state.boardView;
    const file = view === 'w' ? col : 7 - col;
    const rank = view === 'w' ? 7 - row : row;

    return `${String.fromCharCode(97 + file)}${rank + 1}` as Square;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Pointer Event Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  const handlePointerDown = (e: PointerEvent) => {
    // Only handle primary button (left click / touch)
    if (e.button !== 0) return;
    // Ignore if already tracking a pointer (multi-touch rejection)
    if (pointerTracking) return;

    // Clear annotations on left-click (preventDefault on pointerdown suppresses
    // the compatibility mousedown that the document listener relies on)
    clearAnnotations();

    // Initialize audio on first interaction
    audioService.init();

    const square = getSquareFromCoordinates(e.clientX, e.clientY);
    if (!square) return;

    resetViewIfNeeded();
    const currentSelection = selectedSquare();

    // Second-tap logic: if there's already a selected square, handle the action
    if (currentSelection) {
      // Tapped same square → deselect
      if (square === currentSelection) {
        clearDraggingState();
        clearPremove();
        return;
      }

      // Valid move target → execute move
      if (canMove() && highlightedMoves().includes(square)) {
        executeMove(currentSelection, square);
        clearDraggingState();
        return;
      }

      // Valid premove target
      if (canSetPremove(currentSelection) && highlightedMoves().includes(square)) {
        setPremoveWithPromotion(currentSelection, square);
        return;
      }

      // Tapped own piece → fall through to start tracking (re-select)
      if (isPlayerPiece(square) && (!chess.state.isGameOver || isAnalyzeHistoryOverride())) {
        // Clear previous selection state before falling through
        clearPremove();
        // Fall through to start tracking below
      } else if (
        canMove() &&
        highlightedMoves().length > 0 &&
        !highlightedMoves().includes(square)
      ) {
        // Attempted illegal move
        triggerIllegalMoveFeedback();
        clearDraggingState();
        return;
      } else {
        // Invalid target - deselect
        clearDraggingState();
        return;
      }
    } else {
      // No selection yet - clear any existing premove
      clearPremove();
    }

    // Start tracking if this is the player's own piece
    const piece = chess.derived.currentBoard().find((sq) => sq.square === square)?.piece;
    if (
      !piece ||
      !isPlayerPiece(square) ||
      (chess.state.isGameOver && !isAnalyzeHistoryOverride()) ||
      engine.state.isThinking
    ) {
      return;
    }

    pointerTracking = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      square,
      piece,
    };
    isPointerDragging = false;

    // Capture pointer to receive events even if pointer leaves the element
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();

    // Immediate visual feedback — show selection and legal moves right away
    // (critical for mobile where there's no hover state)
    const fen = getMoveCalculationFen();
    const moves =
      derived.allowBothSides() || chess.derived.isPlayerTurn()
        ? getLegalMoves(fen, square)
        : getPremoveLegalMoves(chess.state.fen, square);
    batch(() => {
      setSelectedSquare(square);
      setHighlightedMoves(moves);
    });
  };

  // Activates drag mode after movement threshold exceeded
  const activatePointerDrag = (currentX: number, currentY: number) => {
    if (!pointerTracking || isPointerDragging) return;
    isPointerDragging = true;

    // Clear any existing premove when starting a new drag
    clearPremove();

    resetViewIfNeeded();
    const fen = getMoveCalculationFen();
    const moves =
      derived.allowBothSides() || chess.derived.isPlayerTurn()
        ? getLegalMoves(fen, pointerTracking.square)
        : getPremoveLegalMoves(chess.state.fen, pointerTracking.square);
    batch(() => {
      setDraggedPiece({ square: pointerTracking!.square, piece: pointerTracking!.piece });
      setCursorPosition({ x: currentX, y: currentY });
      setHighlightedMoves(moves);
      setSelectedSquare(pointerTracking!.square);
    });
  };

  // RAF-throttled pointer move
  let rafId: number | null = null;

  const handlePointerMove = (e: PointerEvent) => {
    if (!pointerTracking || e.pointerId !== pointerTracking.pointerId) return;

    latestPointerPos = { x: e.clientX, y: e.clientY };

    // Check if we should activate drag mode (movement exceeded threshold)
    if (!isPointerDragging) {
      const dx = e.clientX - pointerTracking.startX;
      const dy = e.clientY - pointerTracking.startY;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
        activatePointerDrag(e.clientX, e.clientY);
      }
      return;
    }

    // Schedule RAF-throttled position update
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      setCursorPosition(latestPointerPos);
      setDragHoverSquare(getSquareFromCoordinates(latestPointerPos.x, latestPointerPos.y));
    });
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!pointerTracking || e.pointerId !== pointerTracking.pointerId) return;

    const tracking = pointerTracking;

    if (isPointerDragging) {
      // Drag completed - handle drop
      const targetSquare = getSquareFromCoordinates(e.clientX, e.clientY);
      if (targetSquare) {
        handleDrop(targetSquare);
      } else {
        clearDraggingState();
      }
    } else {
      // Tap (no drag occurred) - select piece and show legal moves
      pointerTracking = null;
      isPointerDragging = false;
      selectSquare(tracking.square);
      const fen = getMoveCalculationFen();
      const moves =
        derived.allowBothSides() || chess.derived.isPlayerTurn()
          ? getLegalMoves(fen, tracking.square)
          : getPremoveLegalMoves(chess.state.fen, tracking.square);
      setHighlightedMoves(moves);
    }
  };

  const handlePointerCancel = (e: PointerEvent) => {
    if (!pointerTracking || e.pointerId !== pointerTracking.pointerId) return;
    clearDraggingState();
  };

  // Detect when the browser forcibly releases pointer capture
  // (e.g., system gesture, app switch, notification panel)
  const handleLostCapture = (e: PointerEvent) => {
    if (pointerTracking && e.pointerId === pointerTracking.pointerId) {
      clearDraggingState();
    }
  };

  // Register pointer event listeners on the board element via addEventListener
  // to bypass SolidJS event delegation (which can interfere with setPointerCapture)
  createEffect(() => {
    if (!containerRef) return;

    // Cache the board ref for getSquareFromCoordinates
    boardRef = containerRef.querySelector('[role="grid"]');
    if (!boardRef) return;

    const el = boardRef;

    const onPointerDown = (e: Event) => handlePointerDown(e as PointerEvent);
    const onPointerMove = (e: Event) => handlePointerMove(e as PointerEvent);
    const onPointerUp = (e: Event) => handlePointerUp(e as PointerEvent);
    const onPointerCancel = (e: Event) => handlePointerCancel(e as PointerEvent);
    const onLostCapture = (e: Event) => handleLostCapture(e as PointerEvent);

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerCancel);
    el.addEventListener('lostpointercapture', onLostCapture);

    onCleanup(() => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerCancel);
      el.removeEventListener('lostpointercapture', onLostCapture);
    });
  });

  // Clear annotations on any non-right-click anywhere on the page
  // Also clean up right-click drag if released outside board
  createEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 2) {
        clearAnnotations();
      }
    };
    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 2 && rightClickDragStart()) {
        batch(() => {
          setRightClickDragStart(null);
          setRightClickHoverSquare(null);
        });
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    onCleanup(() => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    });
  });

  // Clear annotations when a move is made (player or opponent)
  createEffect(
    on(
      () => chess.state.moveHistory.length,
      (length, prevLength) => {
        if (prevLength !== undefined && length !== prevLength) {
          clearAnnotations();
        }
      }
    )
  );

  onCleanup(() => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    if (toastDismissTimer) clearTimeout(toastDismissTimer);
    if (evalDebounceTimer) clearTimeout(evalDebounceTimer);
  });

  const handleDrop = (targetSquare: Square) => {
    if (chess.state.isGameOver && !isAnalyzeHistoryOverride()) return;
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
    const actualTo = normalizeCastlingTarget(from, to);
    const board = chess.derived.currentBoard();
    const movePrep = prepareMove(from, actualTo, board);

    if (movePrep.needsPromotion && !promotion) {
      setPendingPromotion(movePrep.promotionInfo);
      clearDraggingState();
      return;
    }

    // Use multiplayer move if this is a human vs human game
    if (derived.isMultiplayer() && actions.applyMultiplayerMove) {
      actions.applyMultiplayerMove(from, actualTo, promotion);
    } else {
      actions.applyPlayerMove(from, actualTo, promotion);
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
    if (!piece) return false;
    if (derived.allowBothSides()) {
      // In analysis mode, use the viewed position's turn (handles history navigation)
      const turn = chess.state.viewFen.split(' ')[1] as Side;
      return piece[0] === turn;
    }
    return piece[0] === chess.state.playerColor;
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
    // Premoves disabled in analysis mode - both sides move normally
    if (derived.allowBothSides()) return false;
    // In training mode, only allow premoves in Focus Mode (when eval bar is hidden)
    // This prevents eval engine overload from rapid position changes
    if (chess.state.mode === 'training' && derived.showEvalBar()) return false;
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

    // Premoves always use the current fen (not viewFen) since they execute on current position
    const legalMoves = getLegalMoves(chess.state.fen, pm.from);
    if (legalMoves.includes(pm.to)) {
      executeMove(pm.from, pm.to, pm.promotion);
    }
    clearPremove(); // Always clear after attempt
  };

  const selectSquare = (square: Square) => {
    batch(() => {
      setSelectedSquare(square);
      const fen = getMoveCalculationFen();
      setHighlightedMoves(getLegalMoves(fen, square));
    });
  };

  const clearDraggingState = () => {
    pointerTracking = null;
    isPointerDragging = false;
    batch(() => {
      setDraggedPiece(null);
      setDragHoverSquare(null);
      setSelectedSquare(null);
      setHighlightedMoves([]);
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Right-click Annotation Functions
  // ─────────────────────────────────────────────────────────────────────────────

  const clearAnnotations = () => {
    if (rightClickHighlights().size > 0 || rightClickArrows().length > 0) {
      batch(() => {
        setRightClickHighlights(new Set<Square>());
        setRightClickArrows([]);
      });
    }
  };

  const toggleArrow = (arrow: BoardArrow) => {
    setRightClickArrows((prev) => {
      const idx = prev.findIndex((a) => a.from === arrow.from && a.to === arrow.to);
      if (idx >= 0) {
        return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      }
      return [...prev, arrow];
    });
  };

  const handleSquareRightMouseDown = (square: Square) => {
    setRightClickDragStart(square);
    setRightClickHoverSquare(square);
  };

  const handleSquareRightMouseUp = (square: Square) => {
    const start = rightClickDragStart();
    batch(() => {
      setRightClickDragStart(null);
      setRightClickHoverSquare(null);
    });

    if (!start) return;

    if (start === square) {
      setRightClickHighlights((prev) => {
        const next = new Set(prev);
        if (next.has(square)) {
          next.delete(square);
        } else {
          next.add(square);
        }
        return next;
      });
    } else if (isValidArrowMove(start, square)) {
      toggleArrow({ from: start, to: square });
    }
  };

  const handleSquareMouseEnter = (square: Square) => {
    if (rightClickDragStart()) {
      setRightClickHoverSquare(square);
    }
  };

  const handlePlayAgain = () => {
    setShowEndModal(false);
    // Use restart callback if available (training mode), otherwise open new game modal
    if (local.onRestartGame) {
      local.onRestartGame();
    } else {
      local.onRequestNewGame?.();
    }
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
    // In training/puzzle mode, just close the modal so user can review moves
    if (chess.state.mode === 'training' || chess.state.mode === 'puzzle') {
      setShowEndModal(false);
      return;
    }
    // For other modes, exit and go home
    actions.exitGame();
    navigate('/');
  };

  return (
    <div ref={containerRef} class={styles.chessGameContainer}>
      <div role="status" aria-live="assertive" class="sr-only">
        {gameEventAnnouncement()}
      </div>
      <div class={styles.boardLayoutRow}>
        <div class={styles.boardWithClocks}>
          <div class={styles.evalBoardRow}>
            <Show when={derived.showEvalBar()}>
              <ChessEvalBar
                evalScore={derived.getEvalScore ? derived.getEvalScore() : evalScore()}
              />
            </Show>
            <div class={styles.chessBoardContainer}>
              <ChessBoard
                board={chess.derived.currentBoard}
                highlightedMoves={highlightedMoves}
                selectedSquare={selectedSquare}
                draggedPiece={draggedPiece}
                cursorPosition={cursorPosition}
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
                playerColor={() => chess.state.playerColor}
                rightClickHighlights={rightClickHighlights}
                rightClickArrows={rightClickArrows}
                previewArrow={previewArrow}
                castlingHintSquares={castlingHintSquares}
                dragHoverSquare={dragHoverSquare}
                onSquareRightMouseDown={handleSquareRightMouseDown}
                onSquareRightMouseUp={handleSquareRightMouseUp}
                onSquareMouseEnter={handleSquareMouseEnter}
              />
              <ChessEngineOverlay
                isLoading={derived.isEngineLoading()}
                hasError={derived.hasEngineError()}
                errorMessage={engine.state.error}
                onRetry={actions.retryEngineInit}
              />
              {/* Focus mode game result toast */}
              <Show when={gameResultToast()}>
                <div
                  class={styles.gameResultToast}
                  classList={{ [styles.toastFadeOut]: toastFadingOut() }}
                  role="status"
                  aria-live="polite"
                >
                  <span class={styles.gameResultText}>{gameResultToast()}</span>
                </div>
              </Show>
              {/* Waiting for opponent overlay for multiplayer */}
              <Show when={multiplayer?.state.isWaiting}>
                <div class={styles.waitingOverlay}>
                  <div class={styles.waitingContent}>
                    <div class={styles.waitingSpinner} />
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
                          class={styles.copyUrlButton}
                          onClick={() => {
                            const url = `${window.location.origin}/play/${multiplayer?.state.gameId}`;
                            navigator.clipboard.writeText(url);
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </Show>
                    <button class={styles.cancelWaitingButton} onClick={actions.exitGame}>
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
