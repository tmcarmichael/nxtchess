import 'stockfish/src/stockfish-16.1.js';

let evalEngine: Worker | null = null;

const waitForReadyEval = (): Promise<void> => {
  return new Promise((resolve) => {
    const onMessage = (e: MessageEvent) => {
      if (typeof e.data === 'string' && e.data.includes('readyok')) {
        evalEngine?.removeEventListener('message', onMessage);
        resolve();
      }
    };
    evalEngine?.addEventListener('message', onMessage);
    evalEngine?.postMessage('isready');
  });
};

export const initEvalEngine = (): Promise<void> => {
  console.info('initEvalEngine, stockfish-16.1.js');
  evalEngine = new Worker(new URL('stockfish/src/stockfish-16.1.js', import.meta.url));
  evalEngine.postMessage('uci');
  return waitForReadyEval().then(() => {
    evalEngine!.postMessage('ucinewgame');
    return waitForReadyEval();
  });
};

export const getEvaluation = (fen: string, depth?: number): Promise<number> => {
  if (!evalEngine) {
    console.warn('Eval engine not initialized');
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
          evalEngine?.removeEventListener('message', onMessage);
          resolve(lastScore ?? 0);
          return;
        }
      }
    };
    evalEngine?.addEventListener('message', onMessage);
    evalEngine?.postMessage(`position fen ${fen}`);
    if (depth) {
      evalEngine?.postMessage(`go depth ${depth}`);
    } else {
      evalEngine?.postMessage('go movetime 1000');
    }
  });
};
