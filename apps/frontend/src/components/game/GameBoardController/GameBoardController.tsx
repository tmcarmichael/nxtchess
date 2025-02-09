import { createSignal, batch, Show, onMount, onCleanup, ParentComponent } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Square, PromotionPiece, Side, GameState } from '../../../types';
import {
  fenToBoard,
  getLegalMoves,
  captureCheck,
  handleCapturedPiece,
} from '../../../services/chessGameService';
import GameBoard from '../GameBoard/GameBoard';
import GameEndModal from '../../modals/GameEndModal/GameEndModal';
import PromotionModal from '../../modals/PromotionModal/PromotionModal';
import { useGameStore } from '../../../store/GameContext';
import styles from './GameBoardController.module.css';

const GameBoardController: ParentComponent = () => {
  const [state, actions] = useGameStore();
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

  const board = () => fenToBoard(state.viewFen);

  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.isGameOver) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        const newIndex = state.viewMoveIndex - 1;
        if (newIndex >= 0) {
          actions.setViewMoveIndex(newIndex);
          actions.jumpToMoveIndex(newIndex);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        const newIndex = state.viewMoveIndex + 1;
        if (newIndex <= state.moveHistory.length - 1) {
          actions.setViewMoveIndex(newIndex);
          actions.jumpToMoveIndex(newIndex);
        }
      } else if (e.key === 'f') {
        actions.setBoardView((c) => (c === 'w' ? 'b' : 'w'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });
  });

  const resetViewIfNeeded = () => {
    if (state.viewFen !== state.fen) {
      actions.setViewFen(state.fen);
      const hist = actions.getChessInstance().history();
      actions.setViewMoveIndex(hist.length - 1);
    }
  };

  const handleSquareClick = (square: Square) => {
    if (state.isGameOver) return;
    resetViewIfNeeded();
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
    if (state.isGameOver || !isPlayerTurn(square)) return;
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

  const updateGameState = (from: Square, to: Square, promotion?: PromotionPiece): GameState => {
    const chess = actions.getChessInstance();
    const move = chess.move({ from, to, promotion });
    if (!move) {
      throw new Error(`Invalid move from ${from} to ${to} (promotion=${promotion})`);
    }
    return {
      fen: chess.fen(),
      isGameOver: chess.isGameOver(),
    };
  };

  const applyMove = (from: Square, to: Square, updatedState: { fen: string }, captured: any) => {
    batch(() => {
      if (captured) {
        handleCapturedPiece(captured, actions.setCapturedBlack, actions.setCapturedWhite);
      }
      actions.setFen(updatedState.fen);
      actions.setLastMove({ from, to });
      const hist = actions.getChessInstance().history();
      actions.setMoveHistory(hist);
      actions.setViewMoveIndex(hist.length - 1);
      actions.setViewFen(updatedState.fen);
    });

    actions.setBoardSquares(fenToBoard(updatedState.fen));
    actions.setCurrentTurn((prev) => (prev === 'w' ? 'b' : 'w'));
    actions.afterMoveChecks(updatedState.fen);

    if (!state.isGameOver && state.currentTurn === state.aiSide) {
      actions.performAIMove();
    }
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
      const updatedState = updateGameState(from, to);
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
      const updatedState = updateGameState(from, to, promoPiece);
      applyMove(from, to, updatedState, captured);
    } catch (err: any) {
      console.error('Invalid promotion move:', err.message);
    } finally {
      clearDraggingState();
      setPendingPromotion(null);
    }
  };

  const isPlayerTurn = (square: Square) => {
    if (state.currentTurn !== state.playerColor) return false;
    const sideToMove = state.fen.split(' ')[1];
    const piece = board().find((sq) => sq.square === square)?.piece;
    return !!piece && piece[0] === sideToMove;
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
    return (piece.startsWith('w') && rank === 8) || (piece.startsWith('b') && rank === 1);
  };

  const handlePromotionChoice = (pieceType: PromotionPiece) => {
    const promo = pendingPromotion();
    if (!promo) return;
    finalizePromotion(promo.from, promo.to, pieceType);
  };

  const handleRestart = () => {
    actions.startNewGame(5, 3, state.playerColor === 'w' ? 'b' : 'w');
  };

  const handleCloseEndGame = () => {
    navigate('/');
  };

  return (
    <div onMouseMove={handleMouseMove} class={styles.chessGameContainer}>
      <div class={styles.chessBoardContainer}>
        <GameBoard
          board={board}
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
      </div>
      <Show when={state.isGameOver}>
        <GameEndModal
          onClose={handleCloseEndGame}
          onRestart={handleRestart}
          gameOverReason={state.gameOverReason}
          gameWinner={state.gameWinner}
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

export default GameBoardController;
