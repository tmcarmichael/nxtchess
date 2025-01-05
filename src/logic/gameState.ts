import { GameState, Move, Board } from "../types";

export const initializeGame = (): GameState => ({
  board: initializeBoard(),
  turn: "w",
  castling: {
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true,
  },
  enPassantTarget: null,
  halfmoveClock: 0,
  fullmoveNumber: 1,
  isGameOver: false,
  hasKingMoved: { w: false, b: false },
  hasRookMoved: {
    wKingSide: false,
    wQueenSide: false,
    bKingSide: false,
    bQueenSide: false,
  },
});

export const updateGameState = (state: GameState, move: Move): GameState => {
  const updatedBoard = updateBoard(state.board, move.from, move.to);
  const piece = state.board[move.from[0]][move.from[1]];
  const isPawnMove = piece?.[1] === "P";

  return {
    ...state,
    board: updatedBoard,
    turn: state.turn === "w" ? "b" : "w",
    hasKingMoved:
      piece?.[1] === "K" ? { ...state.hasKingMoved, [piece[0]]: true } : state.hasKingMoved,
    hasRookMoved: updateRookMovement(state.hasRookMoved, piece, move),
    enPassantTarget:
      isPawnMove && Math.abs(move.from[0] - move.to[0]) === 2
        ? `${String.fromCharCode(97 + move.to[1])}${move.to[0] === 3 ? 4 : 5}`
        : null,
    halfmoveClock: isPawnMove || move.captured ? 0 : state.halfmoveClock + 1,
    fullmoveNumber: state.turn === "b" ? state.fullmoveNumber + 1 : state.fullmoveNumber,
  };
};

export const kingHasMoved = (color: "w" | "b", gameState: GameState): boolean =>
  gameState.hasKingMoved[color];

export const rookHasMoved = (
  color: "w" | "b",
  side: "kingSide" | "queenSide",
  gameState: GameState
): boolean => {
  const key = `${color}${
    side === "kingSide" ? "KingSide" : "QueenSide"
  }` as keyof GameState["hasRookMoved"];
  return gameState.hasRookMoved[key];
};

const updateBoard = (board: Board, from: [number, number], to: [number, number]): Board => {
  const newBoard = board.map((row) => [...row]);
  newBoard[to[0]][to[1]] = newBoard[from[0]][from[1]];
  newBoard[from[0]][from[1]] = null;
  return newBoard;
};

const updateRookMovement = (
  hasRookMoved: GameState["hasRookMoved"],
  piece: string | null,
  move: Move
): GameState["hasRookMoved"] => {
  if (piece?.[1] === "R") {
    const side = move.from[1] === 0 ? "QueenSide" : move.from[1] === 7 ? "KingSide" : null;
    if (side) return { ...hasRookMoved, [`${piece[0]}${side}`]: true };
  }
  return hasRookMoved;
};

export const initializeBoard = (): Board => [
  ["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
  ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
  ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"],
];
