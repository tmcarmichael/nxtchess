// Type for chess pieces
export type PieceType =
  | "bR"
  | "bN"
  | "bB"
  | "bQ"
  | "bK"
  | "bP"
  | "wP"
  | "wR"
  | "wN"
  | "wB"
  | "wQ"
  | "wK";

// Type for selected square
export type Square = {
  row: number;
  col: number;
};

// Type for pieces
export interface PieceProps {
  type: PieceType;
}
