// import { Board } from "../../types/chessboard";

// export function generateFEN(board: Board): string {
//   return board
//     .map((row) =>
//       row
//         .map((piece) => (piece ? piece.type : "1"))
//         .join("")
//         .replace(/1+/g, (match) => match.length.toString())
//     )
//     .join("/");
// }

// export function parseFEN(fen: string): Board {
//   const rows = fen.split("/");
//   return rows.map((row) => {
//     const boardRow: Board[0] = [];
//     for (const char of row) {
//       if (isNaN(parseInt(char))) {
//         boardRow.push({ type: char });
//       } else {
//         for (let i = 0; i < parseInt(char); i++) {
//           boardRow.push(null);
//         }
//       }
//     }
//     return boardRow;
//   });
// }
