import { PieceType } from "./chessboard";

export type Move = {
  from: [number, number];
  to: [number, number];
  captured?: PieceType | null;
  promotion?: "Q" | "R" | "B" | "N";
};
