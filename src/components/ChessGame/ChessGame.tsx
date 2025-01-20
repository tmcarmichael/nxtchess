import { createSignal, createMemo, batch } from 'solid-js';
import ChessBoard from '../ChessBoard/ChessBoard';
import { initializeGame, getLegalMoves, updateGameState } from '../../logic/gameState';
import { Square } from '../../types';
import { fenToBoard } from '../../logic/fenLogic';
import { debugLog } from '../../utils';
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

  const board = createMemo(() => fenToBoard(fen()));

  const isPlayerTurn = (square: Square) => {
    const currentTurn = fen().split(' ')[1];
    const piece = board().find(({ square: sq }) => sq === square)?.piece;
    return piece && piece[0] === currentTurn;
  };

  const startTimer = () => {
    const timer = setInterval(() => {
      if (currentPlayer() === 'w') {
        setWhiteTime((time) => Math.max(0, time - 1));
      } else {
        setBlackTime((time) => Math.max(0, time - 1));
      }

      if (whiteTime() === 0 || blackTime() === 0) {
        clearInterval(timer);
        console.log(`${currentPlayer() === 'w' ? 'Black' : 'White'} wins on time!`);
      }
    }, 1000);
    return timer;
  };
  startTimer();

  const switchPlayer = () => {
    setCurrentPlayer((player) => (player === 'w' ? 'b' : 'w'));
  };

  const handleSquareClick = (square: Square) => {
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
      switchPlayer(); // Switch turns after a valid move
    } else {
      clearDraggingState();
    }
  };

  const handleDragStart = (square: Square, piece: string, event: DragEvent) => {
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

  const clearDraggingState = () => {
    batch(() => {
      setDraggedPiece(null);
      clearSelection();
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
        clearDraggingState();
      });
    } catch (error: any) {
      console.error('Invalid move:', error.message);
    }
  };

  const clearSelection = () => {
    batch(() => {
      setSelectedSquare(null);
      setHighlightedMoves([]);
    });
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
        />
      </div>
    </div>
  );
};

export default ChessGame;
