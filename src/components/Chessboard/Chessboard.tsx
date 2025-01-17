import { createSignal } from "solid-js";
import Piece from "../Piece/Piece";
import styles from "./Chessboard.module.css";
import { PieceType, Square } from "../../types/chessboard";
import { Move } from "../../types/pieceMoves";
import { GameState } from "../../types/gameState";
import { updateGameState, initializeBoard, initializeGame } from "../../logic/gameState";
import { applyMoveInPlace } from "../../logic/moveValidation/utils";
import { getPieceMoveGenerator, validateMove } from "../../logic/moveValidation";

const Chessboard = () => {
  const [board, setBoard] = createSignal<(PieceType | null)[][]>(initializeBoard());
  const [selectedSquare, setSelectedSquare] = createSignal<Square | null>(null);
  const [highlightedMoves, setHighlightedMoves] = createSignal<Move[]>([]);
  const [gameState, setGameState] = createSignal<GameState>(initializeGame());

  const handleSquareClick = (row: number, col: number) => {
    const piece = board()[row][col];
    const currentSelection = selectedSquare();

    if (currentSelection) {
      const move: Move = { from: [currentSelection.row, currentSelection.col], to: [row, col] };
      if (validateMove(board(), move, gameState().turn, gameState())) {
        const newBoard = applyMoveInPlace(board(), move);
        setBoard(newBoard);
        setGameState(updateGameState(gameState(), move));
      }
      setSelectedSquare(null);
      setHighlightedMoves([]);
    } else if (piece?.[0] === gameState().turn) {
      setSelectedSquare({ row, col });
      const moveGenerator = getPieceMoveGenerator(piece);
      setHighlightedMoves(moveGenerator(board(), row, col, piece));
    }
  };

  return (
    <div class={styles.board}>
      {board().map((row, rowIndex) =>
        row.map((piece, colIndex) => (
          <div
            class={`${styles.square} ${
              (rowIndex + colIndex) % 2 === 0 ? styles.light : styles.dark
            } ${
              highlightedMoves().some((m) => m.to[0] === rowIndex && m.to[1] === colIndex)
                ? styles.highlight
                : ""
            }`}
            onClick={() => handleSquareClick(rowIndex, colIndex)}
          >
            {piece && <Piece type={piece} />}
          </div>
        ))
      )}
    </div>
  );
};

export default Chessboard;
