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
interface StyleConfig {
  contempt?: number;
  aggressiveness?: number;
}

type PlayStyle = 'aggressive' | 'defensive' | 'balanced' | 'positional' | 'random';

const STYLE_PRESETS: Record<PlayStyle, StyleConfig> = {
  aggressive: {
    contempt: 100,
    aggressiveness: 100,
  },
  defensive: {
    contempt: -50,
    aggressiveness: 0,
  },
  balanced: {
    contempt: 0,
    aggressiveness: 50,
  },
  positional: {
    contempt: 20,
    aggressiveness: 30,
  },
  random: {
    contempt: Math.floor(Math.random() * 201) - 100, // -100, 100
    aggressiveness: Math.floor(Math.random() * 101), // 0, 100
  },
};

export const initEngine = (elo: number, style: PlayStyle = 'balanced'): Promise<void> => {
  engine = new Worker(new URL('stockfish/src/stockfish-16.1.js', import.meta.url));
  engine.postMessage('uci');
  const { contempt, aggressiveness } = STYLE_PRESETS[style];
  return waitForReady().then(() => {
    engine!.postMessage('isready');
    engine!.postMessage('setoption name UCI_LimitStrength value true');
    engine!.postMessage(`setoption name UCI_Elo value ${elo}`);
    engine!.postMessage(`setoption name Contempt value ${contempt}`);
    engine!.postMessage(`setoption name Aggressiveness value ${aggressiveness}`);
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

export const getEvaluation = (fen: string, depth?: number): Promise<number> => {
  if (!engine) {
    return Promise.resolve(0);
  }
  return new Promise((resolve) => {
    let lastScore: number | null = null;
    const onMessage = (e: MessageEvent) => {
      const data = e.data as string;
      const lines = data.split('\n');
      for (const line of lines) {
        // UCI out: e.g.
        // info depth 13 seldepth 20 score cp 33
        // info depth 9 score mate 3
        if (line.startsWith('info depth')) {
          const scoreCpMatch = line.match(/score cp (-?\d+)/);
          const scoreMateMatch = line.match(/score mate (-?\d+)/);
          if (scoreCpMatch) {
            const scoreCp = parseInt(scoreCpMatch[1], 10);
            lastScore = scoreCp / 100;
          } else if (scoreMateMatch) {
            const mateVal = parseInt(scoreMateMatch[1], 10);
            if (mateVal > 0) {
              lastScore = 999 - mateVal;
            } else {
              lastScore = -999 - mateVal;
            }
          }
        }
        if (line.startsWith('bestmove')) {
          engine?.removeEventListener('message', onMessage);
          resolve(lastScore ?? 0);
          return;
        }
      }
    };
    engine?.addEventListener('message', onMessage);
    engine?.postMessage(`position fen ${fen}`);
    if (depth) {
      engine?.postMessage(`go depth ${depth}`);
    } else {
      engine?.postMessage('go depth 10'); // DEV: depth 15
    }
  });
};
