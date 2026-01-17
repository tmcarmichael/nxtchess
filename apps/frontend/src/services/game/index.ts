export * from './chessGameService';
export * from './gameLifecycle';
export * from './fenUtils';
export * from './pieceUtils';

// Session layer
export * from './session';

// Efficient board representation
export { BoardCache } from './BoardCache';
export type { CachedPiece, MaterialCount, BoardCacheState } from './BoardCache';
export { squareToIndex, indexToSquare, createPieceSymbol } from './BoardCache';
