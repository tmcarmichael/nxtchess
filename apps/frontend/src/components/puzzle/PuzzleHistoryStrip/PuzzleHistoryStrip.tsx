import { useNavigate } from '@solidjs/router';
import { createEffect, createSignal, For, Index, Show, type Component } from 'solid-js';
import { puzzleHistory, type PuzzleAttempt } from '../../../services/puzzle';
import styles from './PuzzleHistoryStrip.module.css';

interface PuzzleHistoryStripProps {
  refreshTrigger?: unknown;
  rated?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  'mate-in-1': 'Mate in 1',
  'mate-in-2': 'Mate in 2',
  'mate-in-3': 'Mate in 3',
};

const FEN_PIECE_MAP: Record<string, string> = {
  K: 'wK',
  Q: 'wQ',
  R: 'wR',
  B: 'wB',
  N: 'wN',
  P: 'wP',
  k: 'bK',
  q: 'bQ',
  r: 'bR',
  b: 'bB',
  n: 'bN',
  p: 'bP',
};

function parseFenToGrid(fen: string): (string | null)[][] {
  const board = fen.split(' ')[0];
  const rows = board.split('/');
  const grid: (string | null)[][] = [];

  for (const row of rows) {
    const rank: (string | null)[] = [];
    for (const ch of row) {
      if (ch >= '1' && ch <= '8') {
        for (let i = 0; i < parseInt(ch); i++) rank.push(null);
      } else {
        rank.push(FEN_PIECE_MAP[ch] || null);
      }
    }
    grid.push(rank);
  }

  return grid;
}

const MiniBoard: Component<{ fen: string }> = (props) => {
  const grid = () => parseFenToGrid(props.fen);

  return (
    <div class={styles.miniBoard}>
      <Index each={grid().flat()}>
        {(cell) => (
          <div class={styles.miniSquare}>
            <Show when={cell()}>
              <img
                src={`/assets/${cell()}.svg`}
                alt=""
                class={styles.miniPiece}
                draggable={false}
              />
            </Show>
          </div>
        )}
      </Index>
    </div>
  );
};

const PuzzleHistoryStrip: Component<PuzzleHistoryStripProps> = (props) => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = createSignal<PuzzleAttempt[]>([]);
  const [hoveredIndex, setHoveredIndex] = createSignal<number | null>(null);

  createEffect(() => {
    void props.refreshTrigger;
    setAttempts(puzzleHistory.get(props.rated));
  });

  const handleClick = (attempt: PuzzleAttempt) => {
    navigate('/analyze', { state: { importFen: attempt.fen } });
  };

  return (
    <Show when={attempts().length > 0}>
      <div class={styles.historySection}>
        <span class={styles.historyLabel}>History</span>
        <div class={styles.historyStrip}>
          <For each={attempts()}>
            {(attempt, index) => (
              <div
                class={styles.historyIconWrapper}
                onMouseEnter={() => setHoveredIndex(index())}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <button
                  class={styles.historyIcon}
                  classList={{
                    [styles.historyIconPass]: attempt.result === 'pass',
                    [styles.historyIconFail]: attempt.result === 'fail',
                  }}
                  onClick={() => handleClick(attempt)}
                  aria-label={`${attempt.result === 'pass' ? 'Passed' : 'Failed'} ${CATEGORY_LABELS[attempt.category] || attempt.category} puzzle. Click to analyze.`}
                >
                  {attempt.result === 'pass' ? '\u2713' : '\u2717'}
                </button>
                <Show when={hoveredIndex() === index()}>
                  <div class={styles.previewTooltip}>
                    <MiniBoard fen={attempt.fen} />
                    <span class={styles.previewLabel}>
                      {CATEGORY_LABELS[attempt.category] || attempt.category}
                    </span>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
};

export default PuzzleHistoryStrip;
