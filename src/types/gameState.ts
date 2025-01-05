import { PieceType } from "./chessboard";

export type Board = (PieceType | null)[][];

export interface GameState {
  board: Board;
  turn: "white" | "black";
  castling: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  };
  enPassantTarget: string | null;
  halfmoveClock: number;
  fullmoveNumber: number;
}
