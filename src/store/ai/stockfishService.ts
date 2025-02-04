import { PromotionPiece, Square, BoardSquare, Side } from '../../types';
import { batch } from 'solid-js';
import {
  updateGameState,
  fenToBoard,
  captureCheck,
  handleCapturedPiece,
  afterMoveChecks,
} from '../../logic/gameState';
import 'stockfish/src/stockfish-16.1.js';

let engine: Worker | null = null;

const waitForReady = (): Promise<void> => {
  return new Promise((resolve) => {
    const onMessage = (e: MessageEvent) => {
      if (typeof e.data === 'string' && e.data.includes('readyok')) {
        engine?.removeEventListener('message', onMessage);
        resolve();
      }
    };
    engine?.addEventListener('message', onMessage);
    engine?.postMessage('isready');
  });
};

export const initEngine = (elo: number): Promise<void> => {
  engine = new Worker(new URL('stockfish/src/stockfish-16.1.js', import.meta.url));
  engine.postMessage('uci');
  return waitForReady().then(() => {
    engine!.postMessage('isready');
    engine!.postMessage('setoption name UCI_LimitStrength value true');
    engine!.postMessage(`setoption name UCI_Elo value ${elo}`);
    // engine!.postMessage('setoption name Threads value 4');
    // engine!.postMessage('setoption name MultiPV value 4');
    // engine!.postMessage('setoption name Contempt value 100');
    // engine!.postMessage('setoption name Aggressiveness value 100');
    // engine!.postMessage('setoption name King Safety value 0');
    engine!.postMessage('ucinewgame');
    return waitForReady();
  });
};

export const getBestMove = (fen: string): Promise<string> => {
  if (!engine) {
    throw new Error('Engine not initialized! Did you call initEngine first?');
  }
  return new Promise((resolve) => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data as string;
      if (data.startsWith('bestmove')) {
        const [, best] = data.split(' ');
        engine?.removeEventListener('message', onMessage);
        resolve(best);
      }
    };
    engine?.addEventListener('message', onMessage);
    engine?.postMessage(`position fen ${fen}`);
    engine?.postMessage('go movetime 1000');
  });
};

export async function handleAIMove(
  fen: string,
  isGameOver: boolean,
  aiSide: string,
  currentTurn: string,
  setFen: (val: string) => void,
  setLastMove: (val: { from: Square; to: Square } | null) => void,
  setBoardSquares: (board: BoardSquare[]) => void,
  setCurrentTurn: (val: Side | ((prev: Side) => Side)) => void,
  setCapturedBlack: (fn: (prev: string[]) => string[]) => void,
  setCapturedWhite: (fn: (prev: string[]) => string[]) => void,
  setGameWinner: (val: Side | 'draw' | null) => void,
  setIsGameOver: (val: boolean) => void,
  setGameOverReason: (val: 'checkmate' | 'stalemate' | 'time' | null) => void,
  setCheckedKingSquare: (val: Square | null) => void
) {
  if (isGameOver || currentTurn !== aiSide) return;

  try {
    console.log('handleAIMove, aiSide', aiSide);
    const best = await getBestMove(fen);
    if (!best) return;

    const from = best.slice(0, 2) as Square;
    const to = best.slice(2, 4) as Square;
    const promo = best.length === 5 ? best[4] : null;

    const updatedState = promo
      ? updateGameState({ fen, isGameOver: false }, from, to, promo as PromotionPiece)
      : updateGameState({ fen, isGameOver: false }, from, to);

    batch(() => {
      const captured = captureCheck(to, fenToBoard(fen));
      if (captured) {
        handleCapturedPiece(captured, setCapturedBlack, setCapturedWhite);
      }
      setFen(updatedState.fen);
      setLastMove({ from, to });
    });
    setBoardSquares(fenToBoard(updatedState.fen));
    setCurrentTurn((p) => (p === 'w' ? 'b' : 'w'));
    afterMoveChecks(
      updatedState.fen,
      setGameWinner,
      setIsGameOver,
      setGameOverReason,
      setCheckedKingSquare
    );
  } catch (err) {
    console.error('Engine error:', err);
  }
}
