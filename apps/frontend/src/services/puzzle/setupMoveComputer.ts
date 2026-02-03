import { Chess } from 'chess.js';
import type { Square } from '../../types/chess';
import type { Side } from '../../types/game';

export interface SetupMoveResult {
  setupFen: string;
  setupMoveUci: string;
  from: Square;
  to: Square;
}

export function computeSetupMove(puzzleFen: string, playerSide: Side): SetupMoveResult | null {
  const chess = new Chess(puzzleFen);
  const board = chess.board();
  const opponentColor = playerSide === 'w' ? 'b' : 'w';

  const pieces: Array<{
    type: string;
    square: string;
    rank: number;
    file: number;
  }> = [];

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (p && p.color === opponentColor && p.type !== 'k') {
        const sq = String.fromCharCode(97 + f) + (8 - r);
        pieces.push({ type: p.type, square: sq, rank: r, file: f });
      }
    }
  }

  const order: Record<string, number> = { q: 0, r: 1, b: 2, n: 3, p: 4 };
  pieces.sort((a, b) => (order[a.type] ?? 5) - (order[b.type] ?? 5));

  for (const piece of pieces) {
    const candidates = getCandidateFromSquares(piece.type, piece.rank, piece.file, board);

    for (const candidate of candidates) {
      const preFen = buildPreFen(puzzleFen, piece, candidate, opponentColor);
      if (!preFen) continue;

      try {
        const pre = new Chess(preFen);
        const fromSq = String.fromCharCode(97 + candidate.file) + (8 - candidate.rank);
        const move = pre.move({ from: fromSq, to: piece.square });

        if (move) {
          const resultFen = pre.fen();
          if (fenBoardAndTurnMatch(resultFen, puzzleFen)) {
            return {
              setupFen: preFen,
              setupMoveUci: `${fromSq}${piece.square}`,
              from: fromSq as Square,
              to: piece.square as Square,
            };
          }
        }
      } catch {
        continue;
      }
    }
  }

  return null;
}

function getCandidateFromSquares(
  pieceType: string,
  rank: number,
  file: number,
  board: ReturnType<Chess['board']>
): Array<{ rank: number; file: number }> {
  const candidates: Array<{ rank: number; file: number }> = [];
  const directions = getDirections(pieceType);
  const isSliding = pieceType === 'r' || pieceType === 'b' || pieceType === 'q';

  for (const [dr, df] of directions) {
    let r = rank + dr;
    let f = file + df;

    while (r >= 0 && r < 8 && f >= 0 && f < 8) {
      if (!board[r][f]) {
        candidates.push({ rank: r, file: f });
      } else {
        break;
      }
      if (!isSliding) break;
      r += dr;
      f += df;
    }
  }

  return candidates;
}

function getDirections(pieceType: string): number[][] {
  switch (pieceType) {
    case 'r':
      return [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];
    case 'b':
      return [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];
    case 'q':
      return [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ];
    case 'n':
      return [
        [2, 1],
        [2, -1],
        [-2, 1],
        [-2, -1],
        [1, 2],
        [1, -2],
        [-1, 2],
        [-1, -2],
      ];
    default:
      return [];
  }
}

function buildPreFen(
  puzzleFen: string,
  piece: { rank: number; file: number },
  candidate: { rank: number; file: number },
  opponentColor: string
): string | null {
  const fenParts = puzzleFen.split(' ');
  const boardRows = fenParts[0].split('/');

  const boardArray: (string | null)[][] = boardRows.map((row) => {
    const rowArray: (string | null)[] = [];
    for (const ch of row) {
      if (ch >= '1' && ch <= '8') {
        for (let i = 0; i < parseInt(ch); i++) rowArray.push(null);
      } else {
        rowArray.push(ch);
      }
    }
    return rowArray;
  });

  const pieceChar = boardArray[piece.rank][piece.file];
  if (!pieceChar) return null;
  if (boardArray[candidate.rank][candidate.file] !== null) return null;

  boardArray[candidate.rank][candidate.file] = pieceChar;
  boardArray[piece.rank][piece.file] = null;

  const newBoardStr = boardArray
    .map((row) => {
      let fenRow = '';
      let emptyCount = 0;
      for (const cell of row) {
        if (cell === null) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fenRow += emptyCount;
            emptyCount = 0;
          }
          fenRow += cell;
        }
      }
      if (emptyCount > 0) fenRow += emptyCount;
      return fenRow;
    })
    .join('/');

  return [newBoardStr, opponentColor, fenParts[2], '-', fenParts[4], fenParts[5]].join(' ');
}

function fenBoardAndTurnMatch(fen1: string, fen2: string): boolean {
  const parts1 = fen1.split(' ');
  const parts2 = fen2.split(' ');
  return parts1[0] === parts2[0] && parts1[1] === parts2[1];
}
