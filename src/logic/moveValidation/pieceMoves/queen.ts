import { Board, PieceType } from "../../../types/chessboard";
import { Move } from "../../../types/pieceMoves";
import { getRookMoves } from "./rook";
import { getBishopMoves } from "./bishop";

export const getQueenMoves = (board: Board, x: number, y: number, piece: PieceType): Move[] => {
  return [...getRookMoves(board, x, y, piece), ...getBishopMoves(board, x, y, piece)];
};
