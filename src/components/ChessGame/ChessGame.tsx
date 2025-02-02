import { createSignal, createMemo, batch, onMount, onCleanup, Show, createEffect } from 'solid-js';
import { Square, PromotionPiece, Difficulty, Side, BoardSquare } from '../../types';
import {
  fenToBoard,
  initializeGame,
  getLegalMoves,
  updateGameState,
  isInCheck,
  isCheckmate,
  isStalemate,
} from '../../logic/gameState';
import { debugLog } from '../../utils';
import ChessBoard from '../ChessBoard/ChessBoard';
import GameEndModal from '../modals/GameEndModal/GameEndModal';
import PromotionModal from '../modals/PromotionModal/PromotionModal';
import styles from './ChessGame.module.css';
import { initEngine, getBestMove } from '../../store/ai/stockfishService';

const ChessGame = ({
  timeControl,
  difficulty,
  side,
  onCapturedWhiteChange,
  onCapturedBlackChange,
  onBoardChange,
}: {
  timeControl: number;
  difficulty: Difficulty;
  side: Side;
  onCapturedWhiteChange?: (updater: (prev: string[]) => string[]) => void;
  onCapturedBlackChange?: (updater: (prev: string[]) => string[]) => void;
  onBoardChange?: (squares: BoardSquare[]) => void;
}) => {
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
  const [playerColor, setPlayerColor] = createSignal<Side>(side);
  const [aiDifficulty, setAiDifficulty] = createSignal<Difficulty>(difficulty);

  const board = createMemo(() => fenToBoard(fen()));

  const aiSide = side === 'w' ? 'b' : 'w';
  let timerId: number | undefined;

  const reInitializeGame = (newTime: number, newDiff: Difficulty, newSide: Side) => {
    if (timerId) clearInterval(timerId);
    if (newSide === 'b') {
      setCurrentPlayer('b');
    } else {
      setCurrentPlayer('w');
    }

    batch(() => {
      setFen(initializeGame().fen);
      setWhiteTime(newTime * 60);
      setBlackTime(newTime * 60);
      setPlayerColor(newSide);
      setAiDifficulty(newDiff);
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
    const elo = { easy: 800, medium: 1400, hard: 2000 }[newDiff];
    initEngine(elo).then(() => {
      if (newSide === 'b') {
        handleAIMove();
      }
    });
    onBoardChange?.(fenToBoard(initializeGame().fen));
    onCapturedWhiteChange?.(() => []);
    onCapturedBlackChange?.(() => []);
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
    reInitializeGame(timeControl, difficulty, side);
  });

  const captureCheck = (target: Square): string | null => {
    const piece = board().find((sq) => sq.square === target)?.piece;
    return piece || null;
  };

  const handleCapturedPiece = (piece: string) => {
    if (piece[0] === 'b') {
      onCapturedBlackChange?.((prev) => [...prev, piece]);
    } else {
      onCapturedWhiteChange?.((prev) => [...prev, piece]);
    }
  };

  const updateParentBoard = (newFen: string) => {
    onBoardChange?.(fenToBoard(newFen));
  };

  const handleAIMove = async () => {
    if (isGameOver() || currentPlayer() !== aiSide) return;
    try {
      const bestMove = await getBestMove(fen());
      if (!bestMove) return;
      const from = bestMove.slice(0, 2) as Square;
      const to = bestMove.slice(2, 4) as Square;
      const promo = bestMove.length === 5 ? bestMove[4] : null;

      if (promo) {
        const updatedState = updateGameState(
          { fen: fen(), isGameOver: false },
          from,
          to,
          promo as PromotionPiece
        );
        batch(() => {
          const captured = captureCheck(to);
          if (captured) handleCapturedPiece(captured);
          setFen(updatedState.fen);
          setLastMove({ from, to });
        });
        updateParentBoard(updatedState.fen);
        switchPlayer();
        afterMoveChecks(updatedState.fen);
      } else {
        executeMove(from, to);
      }
    } catch (err) {
      console.error('Engine error:', err);
    }
  };

  const handleTimeOut = (winnerColor: Side) => {
    if (timerId) clearInterval(timerId);
    setIsGameOver(true);
    setGameOverReason('time');
    setGameWinner(winnerColor);
  };

  const checkGameEnd = (newFen: string) => {
    if (isCheckmate(newFen)) {
      const winner = currentPlayer() === 'w' ? 'b' : 'w';
      setGameWinner(winner);
      setIsGameOver(true);
      setGameOverReason('checkmate');
    } else if (isStalemate(newFen)) {
      setGameWinner('draw');
      setIsGameOver(true);
      setGameOverReason('stalemate');
    }
  };

  const handleSquareClick = (square: Square) => {
    if (isGameOver()) return;
    const currentSelection = selectedSquare();
    if (!currentSelection) {
      const piece = board().find((sq) => sq.square === square)?.piece;
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

  const handleMouseMove = (e: MouseEvent) => {
    if (draggedPiece()) {
      setCursorPosition({ x: e.clientX, y: e.clientY });
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
      clearDraggingState();
      return;
    }
    if (isPawnPromotion(movingPiece, to)) {
      setPendingPromotion({ from, to, color: movingPiece[0] as Side });
      clearDraggingState();
      return;
    }
    try {
      const captured = captureCheck(to);
      const updatedState = updateGameState({ fen: fen(), isGameOver: false }, from, to);
      batch(() => {
        if (captured) handleCapturedPiece(captured);
        setFen(updatedState.fen);
        setLastMove({ from, to });
      });
      updateParentBoard(updatedState.fen);
      switchPlayer();
      afterMoveChecks(updatedState.fen);
    } catch (err: any) {
      console.error('Invalid move:', err.message);
    } finally {
      clearDraggingState();
    }
  };

  const afterMoveChecks = (newFen: string) => {
    if (isInCheck(newFen)) {
      const kingSquare = board().find(({ piece }) => piece === currentPlayer() + 'K')?.square;
      setCheckedKingSquare(kingSquare ?? null);
    } else {
      setCheckedKingSquare(null);
    }
    checkGameEnd(newFen);
    if (!isGameOver() && currentPlayer() === aiSide) {
      handleAIMove();
    }
  };

  const isPlayerTurn = (square: Square) => {
    if (currentPlayer() !== side) return false;
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

  const isPawnPromotion = (piece: string | null, to: Square) => {
    if (!piece || !piece.endsWith('P')) return false;
    const rank = parseInt(to[1], 10);
    if (piece.startsWith('w') && rank === 8) return true;
    if (piece.startsWith('b') && rank === 1) return true;
    return false;
  };

  const finalizePromotion = (from: Square, to: Square, promoPiece: PromotionPiece) => {
    try {
      const captured = captureCheck(to);
      const updatedState = updateGameState({ fen: fen(), isGameOver: false }, from, to, promoPiece);
      batch(() => {
        if (captured) handleCapturedPiece(captured);
        setFen(updatedState.fen);
        setLastMove({ from, to });
      });
      updateParentBoard(updatedState.fen);
      switchPlayer();
      afterMoveChecks(updatedState.fen);
    } catch (err: any) {
      console.error('Invalid promotion move:', err.message);
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
    reInitializeGame(finalTimeControl, aiDifficulty(), playerColor());
  };

  const flipPlayerColor = () => {
    setPlayerColor((o) => (o === 'w' ? 'b' : 'w'));
  };

  return (
    <div onMouseMove={handleMouseMove} class={styles.chessGameContainer}>
      <div class={styles.gameInfoDebug}>
        <div>DEBUG ⚠️</div>
        <div>White Time: {whiteTime()}s</div>
        <div>Black Time: {blackTime()}s</div>
        <div>Difficulty: {aiDifficulty()}</div>
        <div>Side: {playerColor() === 'w' ? 'white' : 'black'}</div>
      </div>
      <button onClick={flipPlayerColor} class={styles.flipButton}>
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
          playerColor={playerColor}
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
