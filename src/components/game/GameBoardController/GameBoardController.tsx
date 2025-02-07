import { createSignal, batch, Show, onMount, onCleanup } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Square, PromotionPiece, Side, GameState } from '../../../types';
import {
  fenToBoard,
  getLegalMoves,
  captureCheck,
  afterMoveChecks,
  handleCapturedPiece,
} from '../../../services/chessGameService';
import GameBoard from '../GameBoard/GameBoard';
import GameEndModal from '../../modals/GameEndModal/GameEndModal';
import PromotionModal from '../../modals/PromotionModal/PromotionModal';
import { useGameStore } from '../../../store/GameContext';
import styles from './GameBoardController.module.css';

const GameBoardController = () => {
  const [state, actions] = useGameStore();

  const fen = () => state.fen;
  const playerColor = () => state.playerColor;
  const currentTurn = () => state.currentTurn;
  const isGameOver = () => state.isGameOver;
  const gameOverReason = () => state.gameOverReason;
  const gameWinner = () => state.gameWinner;
  const aiSide = () => state.aiSide;
  const viewMoveIndex = () => state.viewMoveIndex;
  const moveHistory = () => state.moveHistory;
  const viewFen = () => state.viewFen;
  const lastMove = () => state.lastMove;
  const checkedKingSquare = () => state.checkedKingSquare;
  const boardView = () => state.boardView;

  const setFen = (val: string) => actions.setFen(val);
  const setCurrentTurn = (val: Side | ((prev: Side) => Side)) => actions.setCurrentTurn(val);
  const setBoardSquares = (squares: any) => actions.setBoardSquares(squares);
  const setCapturedBlack = (fnOrVal: any) => actions.setCapturedBlack(fnOrVal);
  const setCapturedWhite = (fnOrVal: any) => actions.setCapturedWhite(fnOrVal);
  const setLastMove = (move: { from: Square; to: Square } | null) => actions.setLastMove(move);
  const setGameWinner = (val: Side | 'draw' | null) => actions.setGameWinner(val);
  const setIsGameOver = (val: boolean) => actions.setIsGameOver(val);
  const setGameOverReason = (val: 'checkmate' | 'stalemate' | 'time' | null) =>
    actions.setGameOverReason(val);
  const setCheckedKingSquare = (square: Square | null) => actions.setCheckedKingSquare(square);
  const setMoveHistory = (moves: string[]) => actions.setMoveHistory(moves);
  const setViewMoveIndex = (index: number) => actions.setViewMoveIndex(index);
  const setViewFen = (val: string) => actions.setViewFen(val);
  const setBoardView = (val: Side | ((prev: Side) => Side)) => actions.setBoardView(val);

  const startNewGame = actions.startNewGame;
  const performAIMove = actions.performAIMove;
  const jumpToMoveIndex = actions.jumpToMoveIndex;
  const getChessInstance = actions.getChessInstance;

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

  const navigate = useNavigate();

  const board = () => fenToBoard(viewFen());

  onMount(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isGameOver()) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        const newIndex = viewMoveIndex() - 1;
        if (newIndex >= 0) {
          setViewMoveIndex(newIndex);
          jumpToMoveIndex(newIndex);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        const newIndex = viewMoveIndex() + 1;
        if (newIndex <= moveHistory().length - 1) {
          setViewMoveIndex(newIndex);
          jumpToMoveIndex(newIndex);
        }
      } else if (e.key === 'f') {
        setBoardView((c) => (c === 'w' ? 'b' : 'w'));
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    onCleanup(() => {
      window.removeEventListener('keydown', handleKeyDown);
    });
  });

  const resetViewIfNeeded = () => {
    if (viewFen() !== fen()) {
      setViewFen(fen());
      const hist = getChessInstance().history();
      setViewMoveIndex(hist.length - 1);
    }
  };

  const handleSquareClick = (square: Square) => {
    if (isGameOver()) return;
    resetViewIfNeeded();
    const currentSelection = selectedSquare();
    if (!currentSelection) {
      const piece = board().find((sq) => sq.square === square)?.piece;
      if (piece && isPlayerTurn(square)) selectSquare(square);
      return;
    }
    if (highlightedMoves().includes(square)) {
      executeMove(currentSelection, square);
    } else {
      clearDraggingState();
    }
  };

  const handleDragStart = (square: Square, piece: string, event: DragEvent) => {
    if (isGameOver() || !isPlayerTurn(square)) return;
    resetViewIfNeeded();
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
    resetViewIfNeeded();
    const dragState = draggedPiece();
    if (!dragState) return;
    if (highlightedMoves().includes(targetSquare)) {
      executeMove(dragState.square, targetSquare);
    }
    clearDraggingState();
  };

  const updateGameState = (from: Square, to: Square, promotion?: PromotionPiece): GameState => {
    const chess = getChessInstance();
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
        handleCapturedPiece(captured, setCapturedBlack, setCapturedWhite);
      }
      setFen(updatedState.fen);
      setLastMove({ from, to });
      const hist = getChessInstance().history();
      setMoveHistory(hist);
      setViewMoveIndex(hist.length - 1);
      setViewFen(updatedState.fen);
    });
    setBoardSquares(fenToBoard(updatedState.fen));
    setCurrentTurn((prev) => (prev === 'w' ? 'b' : 'w'));
    afterMoveChecks(
      updatedState.fen,
      setGameWinner,
      setIsGameOver,
      setGameOverReason,
      setCheckedKingSquare
    );
    if (!isGameOver() && currentTurn() === aiSide()) {
      performAIMove();
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

  const handleRestart = () => {
    startNewGame(5, 3, playerColor() === 'w' ? 'b' : 'w');
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
          lastMove={lastMove}
          checkedKingSquare={checkedKingSquare}
          boardView={boardView}
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

export default GameBoardController;
