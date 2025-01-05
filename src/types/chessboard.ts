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

export type Square = {
  row: number;
  col: number;
};

export interface PieceProps {
  type: PieceType;
}
