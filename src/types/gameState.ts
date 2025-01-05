import { Board } from "./chessboard";

export interface GameState {
  board: Board;
  turn: "w" | "b";
  castling: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  };
  enPassantTarget: string | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  isGameOver: boolean;
  hasKingMoved: {
    w: boolean;
    b: boolean;
  };
  hasRookMoved: Record<"wKingSide" | "wQueenSide" | "bKingSide" | "bQueenSide", boolean>;
}
