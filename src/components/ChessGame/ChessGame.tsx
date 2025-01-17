import { createSignal } from "solid-js";
import ChessBoard from "../ChessBoard/ChessBoard";
import { initializeGame, getLegalMoves, updateGameState } from "../../logic/gameState";
import { Square } from "../../types";
import { debugLog } from "../../utils";

const ChessGame = () => {
  const [gameState, setGameState] = createSignal(initializeGame());
  const [selectedSquare, setSelectedSquare] = createSignal<string | null>(null);
  const [highlightedMoves, setHighlightedMoves] = createSignal<Square[]>([]);

  const handleSquareClick = (square: Square) => {
    const currentSelection = selectedSquare();

    if (currentSelection) {
      debugLog("Current FEN:", gameState().fen);
      debugLog("Move Attempt:", currentSelection, "to", square);
      try {
        const updatedState = updateGameState(gameState(), currentSelection, square);
        setGameState(updatedState);
        setSelectedSquare(null);
        setHighlightedMoves([]);
      } catch (error: any) {
        console.error("Invalid move:", error.message);
      }
    } else {
      setSelectedSquare(square);
      const legalMoves = getLegalMoves(gameState().fen, square);
      setHighlightedMoves(legalMoves);
    }
  };

  return (
    <ChessBoard
      fen={gameState().fen}
      highlightedMoves={highlightedMoves()}
      onSquareClick={handleSquareClick}
    />
  );
};

export default ChessGame;
