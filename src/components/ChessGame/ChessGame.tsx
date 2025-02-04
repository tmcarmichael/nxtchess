import { createSignal, createMemo, batch, Show } from 'solid-js';
import { Square, PromotionPiece, Side } from '../../types';
import {
  fenToBoard,
  getLegalMoves,
  updateGameState,
  captureCheck,
  afterMoveChecks,
  handleCapturedPiece,
} from '../../logic/gameState';
import ChessBoard from '../ChessBoard/ChessBoard';
import GameEndModal from '../modals/GameEndModal/GameEndModal';
import PromotionModal from '../modals/PromotionModal/PromotionModal';
import styles from './ChessGame.module.css';
import { handleAIMove } from '../../store/ai/stockfishService';
import { useGameStore } from '../../store/game/GameContext';
import { useNavigate } from '@solidjs/router';

const ChessGame = () => {
  const {
    fen,
    setFen,
    playerColor,
    currentTurn,
    setCurrentTurn,
    isGameOver,
    gameOverReason,
    gameWinner,
    aiSide,
    setBoardSquares,
    setCapturedBlack,
    setCapturedWhite,
    setLastMove,
    setGameWinner,
    setIsGameOver,
    setGameOverReason,
    setCheckedKingSquare,
    setBoardView,
    startNewGame,
  } = useGameStore();

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

  const board = createMemo(() => fenToBoard(fen()));

  const handleSquareClick = (square: Square) => {
    if (isGameOver()) return;
    const currentSelection = selectedSquare();
    if (!currentSelection) {
      const piece = board().find((sq) => sq.square === square)?.piece;
      if (piece && isPlayerTurn(square)) selectSquare(square);
      return;
    }
    highlightedMoves().includes(square)
      ? performPlayerMove(currentSelection, square)
      : clearDraggingState();
  };

  const handleDragStart = (square: Square, piece: string, event: DragEvent) => {
    if (isGameOver() || !isPlayerTurn(square)) return;
    setDraggedPiece({ square, piece });
    setCursorPosition({ x: event.clientX, y: event.clientY });
    setHighlightedMoves(getLegalMoves(fen(), square));
    setSelectedSquare(square);
    event.dataTransfer?.setDragImage(new Image(), 0, 0);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggedPiece()) setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (targetSquare: Square) => {
    if (isGameOver()) return;
    const dragState = draggedPiece();
    if (!dragState) return;
    if (highlightedMoves().includes(targetSquare))
      performPlayerMove(dragState.square, targetSquare);
    clearDraggingState();
  };

  const applyMove = (from: Square, to: Square, updatedState: { fen: string }, captured: any) => {
    batch(() => {
      if (captured) handleCapturedPiece(captured, setCapturedBlack, setCapturedWhite);
      setFen(updatedState.fen);
      setLastMove({ from, to });
    });
    setBoardSquares(fenToBoard(updatedState.fen));
    switchPlayer();
    afterMoveChecks(
      updatedState.fen,
      setGameWinner,
      setIsGameOver,
      setGameOverReason,
      setCheckedKingSquare
    );
    if (!isGameOver() && currentTurn() === aiSide()) executeIfAIMove();
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
      const captured = captureCheck(to, board());
      const updatedState = updateGameState({ fen: fen(), isGameOver: false }, from, to);
      applyMove(from, to, updatedState, captured);
    } catch (err: any) {
      console.error('Invalid move:', err.message);
    } finally {
      clearDraggingState();
    }
  };

  const finalizePromotion = (from: Square, to: Square, promoPiece: PromotionPiece) => {
    try {
      const captured = captureCheck(to, board());
      const updatedState = updateGameState({ fen: fen(), isGameOver: false }, from, to, promoPiece);
      applyMove(from, to, updatedState, captured);
    } catch (err: any) {
      console.error('Invalid promotion move:', err.message);
    } finally {
      clearDraggingState();
      setPendingPromotion(null);
    }
  };

  const performPlayerMove = (from: Square, to: Square) => executeMove(from, to);

  const isPlayerTurn = (square: Square) => {
    if (currentTurn() !== playerColor()) return false;
    const sideToMove = fen().split(' ')[1];
    const piece = board().find((sq) => sq.square === square)?.piece;
    return !!piece && piece[0] === sideToMove;
  };

  const selectSquare = (square: Square) =>
    batch(() => {
      setSelectedSquare(square);
      setHighlightedMoves(getLegalMoves(fen(), square));
    });

  const clearDraggingState = () =>
    batch(() => {
      setDraggedPiece(null);
      clearSelection();
    });

  const clearSelection = () =>
    batch(() => {
      setSelectedSquare(null);
      setHighlightedMoves([]);
    });

  const isPawnPromotion = (piece: string | null, to: Square) => {
    if (!piece || !piece.endsWith('P')) return false;
    const rank = parseInt(to[1], 10);
    return (piece.startsWith('w') && rank === 8) || (piece.startsWith('b') && rank === 1);
  };

  const handlePromotionChoice = (pieceType: PromotionPiece) => {
    const promo = pendingPromotion();
    if (!promo) return;
    finalizePromotion(promo.from, promo.to, pieceType);
  };

  const switchPlayer = () => setCurrentTurn((p) => (p === 'w' ? 'b' : 'w'));

  const executeIfAIMove = () => {
    if (!isGameOver() && currentTurn() === aiSide())
      handleAIMove(
        fen(),
        isGameOver(),
        aiSide(),
        currentTurn(),
        setFen,
        setLastMove,
        setBoardSquares,
        setCurrentTurn,
        setCapturedBlack,
        setCapturedWhite,
        setGameWinner,
        setIsGameOver,
        setGameOverReason,
        setCheckedKingSquare
      );
  };

  const flipBoardView = () => {
    setBoardView((c) => (c === 'w' ? 'b' : 'w'));
  };

  const handleRestart = () => {
    startNewGame(3, 600, playerColor() === 'w' ? 'b' : 'w');
  };

  const handleCloseEndGame = () => {
    navigate('/');
  };

  return (
    <div onMouseMove={handleMouseMove} class={styles.chessGameContainer}>
      <button onClick={flipBoardView} class={styles.flipButton}>
        <span>Flip Board 🔄</span>
      </button>
      <div class={styles.chessboardContainer}>
        <ChessBoard
          board={board}
          highlightedMoves={highlightedMoves}
          selectedSquare={selectedSquare}
          draggedPiece={draggedPiece}
          cursorPosition={cursorPosition}
          onSquareClick={handleSquareClick}
          onSquareMouseUp={handleMouseUp}
          onDragStart={handleDragStart}
        />
      </div>
      <Show when={isGameOver()}>
        <GameEndModal
          onClose={handleCloseEndGame}
          onRestart={handleRestart}
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
