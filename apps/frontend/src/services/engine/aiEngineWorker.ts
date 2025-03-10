import { PLAYSTYLE_PRESETS } from '../../utils/constants';
import { AIPlayStyle } from './../../types';
import 'stockfish/src/stockfish-16.1.js';

let aiEngine: Worker | null = null;

const waitForReadyAI = (): Promise<void> => {
  return new Promise((resolve) => {
    const onMessage = (e: MessageEvent) => {
      if (typeof e.data === 'string' && e.data.includes('readyok')) {
        aiEngine?.removeEventListener('message', onMessage);
        resolve();
      }
    };
    aiEngine?.addEventListener('message', onMessage);
    aiEngine?.postMessage('isready');
  });
};

export const initAiEngine = (elo: number, style: AIPlayStyle = 'balanced'): Promise<void> => {
  aiEngine = new Worker(new URL('stockfish/src/stockfish-16.1.js', import.meta.url));
  aiEngine.postMessage('uci');
  const styleKey = style ?? 'balanced';
  const { contempt, aggressiveness } = PLAYSTYLE_PRESETS[styleKey];
  return waitForReadyAI().then(() => {
    aiEngine!.postMessage('isready');
    aiEngine!.postMessage('setoption name UCI_LimitStrength value true');
    aiEngine!.postMessage(`setoption name UCI_Elo value ${elo}`);
    aiEngine!.postMessage(`setoption name Contempt value ${contempt}`);
    aiEngine!.postMessage(`setoption name Aggressiveness value ${aggressiveness}`);
    aiEngine!.postMessage('ucinewgame');
    return waitForReadyAI();
  });
};

const getBestMove = (fen: string): Promise<string> => {
  if (!aiEngine) throw new Error('AI engine not initialized');
  return new Promise((resolve) => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data as string;
      if (data.startsWith('bestmove')) {
        const [, best] = data.split(' ');
        aiEngine?.removeEventListener('message', onMessage);
        resolve(best);
      }
    };
    aiEngine?.addEventListener('message', onMessage);
    aiEngine?.postMessage(`position fen ${fen}`);
    aiEngine?.postMessage('go movetime 1000');
  });
};

const parseMoveString = (moveStr: string) => {
  const from = moveStr.slice(0, 2);
  const to = moveStr.slice(2, 4);
  const promotion = moveStr.length === 5 ? moveStr[4] : null;
  return { from, to, promotion };
};

export const computeAiMove = async (fen: string) => {
  const moveStr = await getBestMove(fen);
  return parseMoveString(moveStr);
};
