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

interface StyleConfig {
  contempt?: number;
  aggressiveness?: number;
}
type PlayStyle = 'aggressive' | 'defensive' | 'balanced' | 'positional' | 'random';
const STYLE_PRESETS: Record<PlayStyle, StyleConfig> = {
  aggressive: { contempt: 100, aggressiveness: 100 },
  defensive: { contempt: -50, aggressiveness: 0 },
  balanced: { contempt: 0, aggressiveness: 50 },
  positional: { contempt: 20, aggressiveness: 30 },
  random: {
    contempt: Math.floor(Math.random() * 201) - 100, // -100..100
    aggressiveness: Math.floor(Math.random() * 101), // 0..100
  },
};

export const initAiEngine = (elo: number, style: PlayStyle = 'balanced'): Promise<void> => {
  console.info('initAiEngine', elo, style, 'stockfish-16.1.js');
  aiEngine = new Worker(new URL('stockfish/src/stockfish-16.1.js', import.meta.url));
  aiEngine.postMessage('uci');
  const { contempt, aggressiveness } = STYLE_PRESETS[style];

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

export const getBestMove = (fen: string): Promise<string> => {
  if (!aiEngine) {
    throw new Error('AI engine not initialized');
  }
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
