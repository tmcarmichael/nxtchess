import { Board, PieceType } from "../../types/chessboard";
import { Move } from "../../types/pieceMoves";
import { getPieceMoveGenerator } from "./pieceMoves";

export const getAttackingMoves = (
  board: Board,
  targetSquare: [number, number],
  attackerColor: "w" | "b"
): { from: [number, number]; to: [number, number] }[] => {
  const [tx, ty] = targetSquare;

  return board.flatMap((row, x) =>
    row.flatMap((piece, y) => {
      if (piece && piece[0] === attackerColor) {
        const moveGenerator = getPieceMoveGenerator(piece as PieceType);
        return moveGenerator(board, x, y, piece)
          .filter((move: Move) => move.to[0] === tx && move.to[1] === ty)
          .map(() => ({ from: [x, y], to: [tx, ty] }));
      }
      return [];
    })
  );
};

export const isKingInCheck = (
  board: Board,
  color: "w" | "b",
  kingPosition: [number, number]
): boolean => {
  const opponentColor = color === "w" ? "b" : "w";
  return getAttackingMoves(board, kingPosition, opponentColor).length > 0;
};
