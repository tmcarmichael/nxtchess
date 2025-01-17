import { PieceType } from "../types";

export const parseFenToBoard = (fen: string): (string | null)[][] => {
  const rows = fen.split(" ")[0].split("/");
  return rows.map((row) =>
    row
      .split("")
      .flatMap((char) =>
        isNaN(Number(char))
          ? [`${char === char.toUpperCase() ? "w" : "b"}${char.toUpperCase()}`]
          : Array(Number(char)).fill(null)
      )
  );
};

export const mapFenToPieceType = (char: string): PieceType | null => {
  const pieceMap: Record<string, PieceType> = {
    p: "bP",
    r: "bR",
    n: "bN",
    b: "bB",
    q: "bQ",
    k: "bK",
    P: "wP",
    R: "wR",
    N: "wN",
    B: "wB",
    Q: "wQ",
    K: "wK",
  };
  return pieceMap[char] || null;
};
