import { Board, PieceType } from "../../types/chessboard";
import { Move } from "../../types/pieceMoves";
import { GameState } from "../../types/gameState";
import { getPieceMoveGenerator } from "./pieceMoves";
import { isKingInCheck, getAttackingMoves } from "./check";
import { kingHasMoved, rookHasMoved } from "../gameState";

export const validateMove = (
  board: Board,
  move: Move,
  color: "w" | "b",
  gameState: GameState
): boolean => {
  const { from, to } = move;
  const piece = board[from[0]][from[1]];
  if (!piece || piece[0] !== color) return false; // No piece or wrong color

  const moveGenerator = getPieceMoveGenerator(piece as PieceType);
  const legalMoves = moveGenerator(board, from[0], from[1], piece);

  // Check if the move is within the legal moves
  if (!legalMoves.some((m) => m.to[0] === to[0] && m.to[1] === to[1])) return false;

  // Handle special rules
  if (isCastlingMove(board, move)) return validateCastling(board, move, color, gameState);
  if (isEnPassantMove(board, move, gameState)) return validateEnPassant(board, move, gameState);
  if (isPromotionMove(board, move, color)) return validatePromotion(board, move, color);

  // Simulate the move and ensure the king is safe
  const newBoard = applyMoveInPlace(board, move);
  const kingPosition = findKing(newBoard, color);
  const kingSafe = !isKingInCheck(newBoard, color, kingPosition);
  undoMoveInPlace(board, move);

  return kingSafe;
};

const validateCastling = (
  board: Board,
  move: Move,
  color: "w" | "b",
  gameState: GameState
): boolean => {
  const { from, to } = move;
  const direction = to[1] - from[1];
  if (Math.abs(direction) !== 2) return false;

  const side = direction > 0 ? "kingSide" : "queenSide";
  const rookPosition: [number, number] = direction > 0 ? [from[0], 7] : [from[0], 0];
  const rook = board[rookPosition[0]][rookPosition[1]];

  if (!rook || rook[1] !== "R") return false;
  if (kingHasMoved(color, gameState) || rookHasMoved(color, side, gameState)) return false;

  const step = direction > 0 ? 1 : -1;
  for (let i = from[1] + step; i !== to[1]; i += step) {
    if (board[from[0]][i]) return false;
  }

  const opponentColor = color === "w" ? "b" : "w";
  for (let i = from[1]; i !== to[1] + step; i += step) {
    const square = [from[0], i] as [number, number];
    if (getAttackingMoves(board, square, opponentColor).length > 0) return false;
  }

  return true;
};

const validateEnPassant = (board: Board, move: Move, gameState: GameState): boolean => {
  const { from, to } = move;
  const pawn = board[from[0]][from[1]];
  if (!pawn || pawn[1] !== "P") return false;

  const target = gameState.enPassantTarget;
  if (!target) return false;

  const targetSquare = [to[0] + (pawn[0] === "w" ? 1 : -1), to[1]] as [number, number];
  return `${String.fromCharCode(97 + targetSquare[1])}${targetSquare[0] + 1}` === target;
};

const validatePromotion = (board: Board, move: Move, color: "w" | "b"): boolean => {
  const { from, to, promotion } = move;
  const pawn = board[from[0]][from[1]];
  if (!pawn || pawn[1] !== "P") return false;

  const promotionRank = color === "w" ? 0 : 7;
  return to[0] === promotionRank && ["Q", "R", "B", "N"].includes(promotion || "");
};

const findKing = (board: Board, color: "w" | "b"): [number, number] => {
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = board[x][y];
      if (piece?.[1] === "K" && piece[0] === color) return [x, y];
    }
  }
  throw new Error(`King for ${color} not found`);
};

const applyMoveInPlace = (board: Board, move: Move): Board => {
  const { from, to } = move;
  board[to[0]][to[1]] = board[from[0]][from[1]];
  board[from[0]][from[1]] = null;
  return board;
};

const undoMoveInPlace = (board: Board, move: Move): Board => {
  const { from, to, captured } = move;
  board[from[0]][from[1]] = board[to[0]][to[1]];
  board[to[0]][to[1]] = captured || null;
  return board;
};

const isCastlingMove = (board: Board, move: Move): boolean => {
  const piece = board[move.from[0]][move.from[1]];
  return piece?.[1] === "K" && Math.abs(move.to[1] - move.from[1]) === 2;
};

const isEnPassantMove = (board: Board, move: Move, gameState: GameState): boolean => {
  const pawn = board[move.from[0]][move.from[1]];
  return pawn?.[1] === "P" && gameState.enPassantTarget !== null;
};

const isPromotionMove = (board: Board, move: Move, color: "w" | "b"): boolean => {
  const pawn = board[move.from[0]][move.from[1]];
  const promotionRank = color === "w" ? 0 : 7;
  return pawn?.[1] === "P" && move.to[0] === promotionRank;
};
