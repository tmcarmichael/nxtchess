import { createSignal, createMemo, batch, onMount, onCleanup, Show, createEffect } from 'solid-js';
import { Square, PromotionPiece, Difficulty, Side, ChessGameProps } from '../../types';
import { fenToBoard } from '../../logic/fenLogic';
import {
  initializeGame,
  getLegalMoves,
  updateGameState,
  isInCheck,
  isCheckmate,
  isStalemate,
} from '../../logic/gameState';
import { debugLog } from '../../utils';
import ChessBoard from '../ChessBoard/ChessBoard';
import GameEndModal from '../GameEndModal/GameEndModal';
import PromotionModal from '../PromotionModal/PromotionModal';
import styles from './ChessGame.module.css';

const ChessGame = (props: ChessGameProps) => {
  const { timeControl, difficulty, side } = props;
  const [prevProps, setPrevProps] = createSignal<ChessGameProps>({
    timeControl,
    difficulty,
    side,
  });
  const [fen, setFen] = createSignal(initializeGame().fen);
  const [highlightedMoves, setHighlightedMoves] = createSignal<Square[]>([]);
  const [selectedSquare, setSelectedSquare] = createSignal<Square | null>(null);
  const [draggedPiece, setDraggedPiece] = createSignal<{ square: Square; piece: string } | null>(
    null
  );
  const [cursorPosition, setCursorPosition] = createSignal({ x: 0, y: 0 });
  const [lastMove, setLastMove] = createSignal<{ from: Square; to: Square } | null>(null);
  const [whiteTime, setWhiteTime] = createSignal(timeControl * 60);
  const [blackTime, setBlackTime] = createSignal(timeControl * 60);
  const [currentPlayer, setCurrentPlayer] = createSignal<Side>('w');
  const [isGameOver, setIsGameOver] = createSignal(false);
  const [gameOverReason, setGameOverReason] = createSignal<
    'checkmate' | 'stalemate' | 'time' | null
  >(null);
  const [gameWinner, setGameWinner] = createSignal<Side | 'draw' | null>(null);
  const [checkedKingSquare, setCheckedKingSquare] = createSignal<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = createSignal<{
    from: Square;
    to: Square;
    color: Side;
  } | null>(null);
  const [orientation, setOrientation] = createSignal<Side>(side);
  const [aiDifficulty, setAiDifficulty] = createSignal<Difficulty>(difficulty);

  const board = createMemo(() => fenToBoard(fen()));

  let timerId: number | undefined;

  const reInitializeGame = (newTime: number, newDiff: Difficulty, newSide: Side) => {
    if (timerId) clearInterval(timerId);

    batch(() => {
      setFen(initializeGame().fen);
      setWhiteTime(newTime * 60);
      setBlackTime(newTime * 60);
      setOrientation(newSide);
      setAiDifficulty(newDiff);
      setCurrentPlayer('w');
      setLastMove(null);
      setIsGameOver(false);
      setGameOverReason(null);
      setGameWinner(null);
      setCheckedKingSquare(null);
      setDraggedPiece(null);
      setSelectedSquare(null);
      setHighlightedMoves([]);
    });

    startTimer();
    debugLog('Reinitialized game with props:', {
      timeControl: newTime,
      difficulty: newDiff,
      side: newSide,
    });
  };

  const startTimer = () => {
    if (timerId) clearInterval(timerId);

    timerId = setInterval(() => {
      if (isGameOver()) {
        clearInterval(timerId);
        return;
      }
      if (currentPlayer() === 'w') {
        setWhiteTime((t) => Math.max(0, t - 1));
        if (whiteTime() <= 1) handleTimeOut('b');
      } else {
        setBlackTime((t) => Math.max(0, t - 1));
        if (blackTime() <= 1) handleTimeOut('w');
      }
    }, 1000) as unknown as number;
  };

  onMount(() => {
    reInitializeGame(timeControl, difficulty, side);
  });

  onCleanup(() => {
    if (timerId) clearInterval(timerId);
  });

  createEffect(() => {
    const { timeControl: newTime, difficulty: newDiff, side: newSide } = props;
    const old = prevProps();
    if (old.timeControl === newTime && old.difficulty === newDiff && old.side === newSide) {
      return;
    }
    setPrevProps({ timeControl: newTime, difficulty: newDiff, side: newSide });
    reInitializeGame(newTime, newDiff, newSide);
  });

  debugLog('ChessGame => Currently loaded props:', {
    timeControl: props.timeControl,
    difficulty: props.difficulty,
    side: props.side,
  });

  const handleTimeOut = (winnerColor: Side) => {
    if (timerId) clearInterval(timerId);
    setIsGameOver(true);
    setGameOverReason('time');
    setGameWinner(winnerColor);
    debugLog(`${winnerColor === 'w' ? 'White' : 'Black'} wins on time!`);
  };

  const checkGameEnd = (newFen: string) => {
    if (isCheckmate(newFen)) {
      const winner = currentPlayer() === 'w' ? 'b' : 'w';
      setGameWinner(winner);
      setIsGameOver(true);
      setGameOverReason('checkmate');
      if (timerId) clearInterval(timerId);
      debugLog('Checkmate');
    } else if (isStalemate(newFen)) {
      setGameWinner('draw');
      setIsGameOver(true);
      setGameOverReason('stalemate');
      if (timerId) clearInterval(timerId);
      debugLog('Stalemate!');
    }
  };

  const handleSquareClick = (square: Square) => {
    if (isGameOver()) return;
    const currentSelection = selectedSquare();
    if (!currentSelection) {
      const piece = board().find(({ square: sq }) => sq === square)?.piece;
      if (piece && isPlayerTurn(square)) {
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
    if (isGameOver()) return;
    if (!isPlayerTurn(square)) return;
    setDraggedPiece({ square, piece });
    setCursorPosition({ x: event.clientX, y: event.clientY });
    setHighlightedMoves(getLegalMoves(fen(), square));
    setSelectedSquare(square);
    event.dataTransfer?.setDragImage(new Image(), 0, 0);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (draggedPiece()) {
      setCursorPosition({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMouseUp = (targetSquare: Square) => {
    if (isGameOver()) return;
    const dragState = draggedPiece();
    if (!dragState) return;
    if (highlightedMoves().includes(targetSquare)) {
      executeMove(dragState.square, targetSquare);
    }
    clearDraggingState();
  };

  const executeMove = (from: Square, to: Square) => {
    const movingPiece = board().find((sq) => sq.square === from)?.piece;
    if (!movingPiece) {
      console.error(`No piece found at square ${from}`);
      clearDraggingState();
      return;
    }
    if (isPawnPromotion(movingPiece, to)) {
      setPendingPromotion({ from, to, color: movingPiece[0] as Side });
      clearDraggingState();
      return;
    }
    try {
      const updatedState = updateGameState({ fen: fen(), isGameOver: false }, from, to);
      batch(() => {
        setFen(updatedState.fen);
        setLastMove({ from, to });
        debugLog('Last Move Updated:', { from, to });
      });

      switchPlayer();
      if (isInCheck(updatedState.fen)) {
        const kingSquare = board().find(({ piece }) => piece === currentPlayer() + 'K')?.square;
        setCheckedKingSquare(kingSquare ?? null);
      } else {
        setCheckedKingSquare(null);
      }
      checkGameEnd(updatedState.fen);
    } catch (error: any) {
      console.error('Invalid move:', error.message);
    } finally {
      clearDraggingState();
    }
  };

  const isPlayerTurn = (square: Square) => {
    const currentTurn = fen().split(' ')[1];
    const piece = board().find(({ square: sq }) => sq === square)?.piece;
    return piece && piece[0] === currentTurn;
  };

  const selectSquare = (square: Square) => {
    batch(() => {
      setSelectedSquare(square);
      setHighlightedMoves(getLegalMoves(fen(), square));
    });
  };

  const clearDraggingState = () => {
    batch(() => {
      setDraggedPiece(null);
      clearSelection();
    });
  };

  const clearSelection = () => {
    batch(() => {
      setSelectedSquare(null);
      setHighlightedMoves([]);
    });
  };

  const isPawnPromotion = (piece: string | null, to: Square): boolean => {
    if (!piece || !piece.endsWith('P')) return false;
    const rank = parseInt(to[1], 10);
    if (piece.startsWith('w') && rank === 8) return true;
    if (piece.startsWith('b') && rank === 1) return true;
    return false;
  };

  const finalizePromotion = (from: Square, to: Square, promotion: PromotionPiece) => {
    try {
      const updatedState = updateGameState({ fen: fen(), isGameOver: false }, from, to, promotion);
      batch(() => {
        setFen(updatedState.fen);
        setLastMove({ from, to });
        debugLog('Promotion Move Completed:', { from, to, promotion });
      });
      switchPlayer();
      if (isInCheck(updatedState.fen)) {
        const kingSquare = board().find(({ piece }) => piece === currentPlayer() + 'K')?.square;
        setCheckedKingSquare(kingSquare ?? null);
      } else {
        setCheckedKingSquare(null);
      }
      checkGameEnd(updatedState.fen);
    } catch (error: any) {
      console.error('Invalid promotion move:', error.message);
    } finally {
      clearDraggingState();
      setPendingPromotion(null);
    }
  };

  const handlePromotionChoice = (pieceType: PromotionPiece) => {
    const promo = pendingPromotion();
    if (!promo) return;
    finalizePromotion(promo.from, promo.to, pieceType);
  };

  const switchPlayer = () => {
    setCurrentPlayer((p) => (p === 'w' ? 'b' : 'w'));
  };

  const resetGame = (newTimeControl?: number) => {
    if (timerId) clearInterval(timerId);
    const finalTimeControl = newTimeControl ?? timeControl;
    reInitializeGame(finalTimeControl, aiDifficulty(), orientation());
  };

  const flipOrientation = () => {
    setOrientation((o) => (o === 'w' ? 'b' : 'w'));
  };

  return (
    <div onMouseMove={handleMouseMove} class={styles.chessGameContainer}>
      <div class={styles.gameInfoDebug}>
        <div>White Time: {whiteTime()} seconds</div>
        <div>Black Time: {blackTime()} seconds</div>
        <div>Difficulty: {aiDifficulty()}</div>
        <div>Side: {orientation() === 'w' ? 'white' : 'black'}</div>
      </div>
      <button onClick={flipOrientation} class={styles.flipButton}>
        <span>Flip Board 🔄</span>
      </button>
      <div class={styles.chessboardContainer}>
        <ChessBoard
          board={board}
          highlightedMoves={highlightedMoves}
          selectedSquare={selectedSquare}
          draggedPiece={draggedPiece}
          cursorPosition={cursorPosition}
          lastMove={lastMove}
          onSquareClick={handleSquareClick}
          onSquareMouseUp={handleMouseUp}
          onDragStart={handleDragStart}
          checkedKingSquare={checkedKingSquare}
          orientation={orientation}
        />
      </div>
      <Show when={isGameOver()}>
        <GameEndModal
          onClose={() => resetGame()}
          onRestart={() => resetGame()}
          gameOverReason={gameOverReason()}
          gameWinner={gameWinner()}
        />
      </Show>
      <Show when={pendingPromotion()}>
        <PromotionModal
          color={pendingPromotion()!.color}
          onPromote={handlePromotionChoice}
          onClose={() => setPendingPromotion(null)}
        />
      </Show>
    </div>
  );
};

export default ChessGame;
