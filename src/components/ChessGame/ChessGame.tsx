import { createSignal, createMemo } from "solid-js";
import ChessBoard from "../ChessBoard/ChessBoard";
import { initializeGame, getLegalMoves, updateGameState } from "../../logic/gameState";
import { Square } from "../../types";
import { fenToBoard } from "../../logic/fenLogic";
import { debugLog } from "../../utils";

const ChessGame = () => {
  const [fen, setFen] = createSignal(initializeGame().fen);
  const [highlightedMoves, setHighlightedMoves] = createSignal<Square[]>([]);
  const [selectedSquare, setSelectedSquare] = createSignal<Square | null>(null);
  const board = createMemo(() => fenToBoard(fen()));
  const isPlayerTurn = (square: Square) => {
    const currentTurn = fen().split(" ")[1];
    const piece = board().find(({ square: sq }) => sq === square)?.piece;
    return piece && piece[0] === currentTurn;
  };

  const handleSquareClick = (square: Square) => {
    const currentSelection = selectedSquare();
    debugLog(isPlayerTurn(square));
    if (currentSelection === square) {
      deselectSquare();
      return;
    }
    if (isPlayerTurn(square)) {
      selectSquare(square);
      return;
    }
    if (currentSelection && highlightedMoves().includes(square)) {
      executeMove(currentSelection, square);
      return;
    }
    clearSelection();
  };

  const deselectSquare = () => {
    setSelectedSquare(null);
    setHighlightedMoves([]);
  };

  const selectSquare = (square: Square) => {
    debugLog("Prior selected square: ", selectedSquare());
    setSelectedSquare(square);
    debugLog("Selected square:", selectedSquare());
    const legalMoves = getLegalMoves(fen(), square);
    debugLog("Legal Moves for", square, ":", legalMoves);
    setHighlightedMoves(legalMoves);
  };

  const executeMove = (from: Square, to: Square) => {
    debugLog("Move Attempt:", from, "to", to);
    try {
      const updatedState = updateGameState({ fen: fen(), isGameOver: false }, from, to);
      debugLog("Updated FEN:", updatedState.fen);
      setFen(updatedState.fen);
      clearSelection();
    } catch (error: any) {
      console.error("Invalid move:", error.message);
    }
  };

  const clearSelection = () => {
    setSelectedSquare(null);
    setHighlightedMoves([]);
  };

  return (
    <ChessBoard
      board={board}
      highlightedMoves={highlightedMoves}
      selectedSquare={selectedSquare}
      onSquareClick={handleSquareClick}
    />
  );
};

export default ChessGame;
