import { PieceType, Square } from "../types";

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

export const fenToBoard = (fen: string) => {
  const rows = fen.split(" ")[0].split("/");
  const board: { square: Square; piece: PieceType | null }[] = [];
  rows.forEach((row, rankIndex) => {
    let fileIndex = 0;
    row.split("").forEach((char) => {
      if (isNaN(Number(char))) {
        const piece = mapFenToPieceType(char);
        const square = `${String.fromCharCode(97 + fileIndex)}${8 - rankIndex}` as Square;
        board.push({ square, piece });
        fileIndex += 1;
      } else {
        for (let i = 0; i < Number(char); i++) {
          const square = `${String.fromCharCode(97 + fileIndex)}${8 - rankIndex}` as Square;
          board.push({ square, piece: null });
          fileIndex += 1;
        }
      }
    });
  });
  return board;
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
