import 'stockfish/src/stockfish-16.1.js';

let engine: Worker | null = null;

function waitForReady(): Promise<void> {
  return new Promise((resolve) => {
    function onMessage(e: MessageEvent) {
      if (typeof e.data === 'string' && e.data.includes('readyok')) {
        engine!.removeEventListener('message', onMessage);
        resolve();
      }
    }
    engine!.addEventListener('message', onMessage);
    engine!.postMessage('isready');
  });
}

export function initEngine(elo: number): Promise<void> {
  engine = new Worker(new URL('stockfish/src/stockfish-16.1.js', import.meta.url));
  engine.postMessage('uci');
  return waitForReady().then(() => {
    engine!.postMessage('isready');
    engine!.postMessage('setoption name UCI_LimitStrength value true');
    engine!.postMessage(`setoption name UCI_Elo value ${elo}`);
    engine!.postMessage('setoption name Threads value 1');
    engine!.postMessage('ucinewgame');
    return waitForReady();
  });
}

export function getBestMove(fen: string): Promise<string> {
  if (!engine) {
    throw new Error('Engine not initialized! Did you call initEngine first?');
  }
  return new Promise((resolve) => {
    function onMessage(e: MessageEvent) {
      const data = e.data as string;
      if (data.startsWith('bestmove')) {
        const [_, best] = data.split(' ');
        engine!.removeEventListener('message', onMessage);
        resolve(best);
      }
    }
    engine!.addEventListener('message', onMessage);
    engine!.postMessage(`position fen ${fen}`);
    engine!.postMessage('go movetime 1000');
  });
}
