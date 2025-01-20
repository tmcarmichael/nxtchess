import { createSignal, createMemo, batch, onMount, onCleanup, Show } from 'solid-js';
import { Square } from '../../types';
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
import PlayModal from '../PlayModal/PlayModal';

import styles from './ChessGame.module.css';

const ChessGame = ({ timeControl }: { timeControl: number }) => {
  const [fen, setFen] = createSignal(initializeGame().fen);
  const [highlightedMoves, setHighlightedMoves] = createSignal<Square[]>([]);
  const [selectedSquare, setSelectedSquare] = createSignal<Square | null>(null);
  const [draggedPiece, setDraggedPiece] = createSignal<{ square: Square; piece: string } | null>(
    null
  );
  const [cursorPosition, setCursorPosition] = createSignal<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [lastMove, setLastMove] = createSignal<{ from: Square; to: Square } | null>(null);
  const [whiteTime, setWhiteTime] = createSignal(timeControl * 60);
  const [blackTime, setBlackTime] = createSignal(timeControl * 60);
  const [currentPlayer, setCurrentPlayer] = createSignal<'w' | 'b'>('w');
  const [isGameOver, setIsGameOver] = createSignal(false);
  const [gameOverReason, setGameOverReason] = createSignal<
    'checkmate' | 'stalemate' | 'time' | null
  >(null);
  const [gameWinner, setGameWinner] = createSignal<'w' | 'b' | 'draw' | null>(null);
  const [checkedKingSquare, setCheckedKingSquare] = createSignal<Square | null>(null);

  const board = createMemo(() => fenToBoard(fen()));

  let timerId: number | undefined;
  const startTimer = () => {
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      if (isGameOver()) {
        clearInterval(timerId);
        return;
      }
      if (currentPlayer() === 'w') {
        setWhiteTime((time) => Math.max(0, time - 1));
        if (whiteTime() === 1) {
          handleTimeOut('b');
        }
      } else {
        setBlackTime((time) => Math.max(0, time - 1));
        if (blackTime() === 1) {
          handleTimeOut('w');
        }
      }
    }, 1000) as unknown as number;

    onCleanup(() => clearInterval(timerId));
  };

  const handleTimeOut = (winnerColor: 'w' | 'b') => {
    clearInterval(timerId);
    setIsGameOver(true);
    setGameOverReason('time');
    setGameWinner(winnerColor);
    debugLog(`${winnerColor === 'w' ? 'White' : 'Black'} wins on time!`);
  };
  onMount(() => startTimer());
  onCleanup(() => {
    if (timerId) clearInterval(timerId);
  });

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
      switchPlayer();
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
    const dragState = draggedPiece();
    if (!dragState) return;

    if (highlightedMoves().includes(targetSquare)) {
      executeMove(dragState.square, targetSquare);
      switchPlayer();
    }
    clearDraggingState();
  };

  const isPlayerTurn = (square: Square) => {
    const currentTurn = fen().split(' ')[1];
    const piece = board().find(({ square: sq }) => sq === square)?.piece;
    return piece && piece[0] === currentTurn;
  };

  const switchPlayer = () => {
    setCurrentPlayer((p) => (p === 'w' ? 'b' : 'w'));
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

  const selectSquare = (square: Square) => {
    batch(() => {
      setSelectedSquare(square);
      setHighlightedMoves(getLegalMoves(fen(), square));
    });
  };

  const executeMove = (from: Square, to: Square) => {
    try {
      const updatedState = updateGameState({ fen: fen(), isGameOver: false }, from, to);
      batch(() => {
        setFen(updatedState.fen);
        setLastMove({ from, to });
        debugLog('Last Move Updated:', { from, to });
      });
      if (isInCheck(updatedState.fen)) {
        const sideInCheck = new Chess(updatedState.fen).turn();
        const kingSquare = board().find(({ piece }) => piece === sideInCheck + 'K')?.square;
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

  const checkGameEnd = (fen: string) => {
    if (isCheckmate(fen)) {
      const winner = new Chess(fen).turn() === 'w' ? 'b' : 'w';
      setGameWinner(winner);
      setIsGameOver(true);
      setGameOverReason('checkmate');
      clearInterval(timerId);
      debugLog('Checkmate');
    } else if (isStalemate(fen)) {
      setGameWinner('draw');
      setIsGameOver(true);
      setGameOverReason('stalemate');
      clearInterval(timerId);
      debugLog('Stalemate!');
    }
  };

  const resetGame = (newTimeControl?: number) => {
    const finalTimeControl = newTimeControl ?? timeControl;

    batch(() => {
      setFen(initializeGame().fen);
      setWhiteTime(finalTimeControl * 60);
      setBlackTime(finalTimeControl * 60);
      setCurrentPlayer('w');
      setLastMove(null);
      setIsGameOver(false);
      setGameOverReason(null);
      setGameWinner(null);
      setCheckedKingSquare(null);
    });

    startTimer();
  };

  return (
    <div onMouseMove={handleMouseMove} class={styles.container}>
      <div class={styles.timer}>
        <div>White Time: {whiteTime()} seconds</div>
        <div>Black Time: {blackTime()} seconds</div>
      </div>
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
        />
      </div>
      <Show when={isGameOver()}>
        <PlayModal onClose={() => resetGame()}>
          <h2>Game Over</h2>
          <p>
            {gameOverReason() === 'checkmate' &&
              `Checkmate – ${gameWinner() === 'w' ? 'White' : 'Black'} wins!`}
            {gameOverReason() === 'stalemate' && "Stalemate - it's a draw!"}
            {gameOverReason() === 'time' &&
              `Time – ${gameWinner() === 'w' ? 'White' : 'Black'} wins!`}
          </p>
          <button onClick={() => resetGame()}>Play Again</button>
        </PlayModal>
      </Show>
    </div>
  );
};

export default ChessGame;
