import { createMemo, createSignal, Show, type Component } from 'solid-js';
import styles from './GameNotation.module.css';

interface GameNotationProps {
  fen: string;
  moveHistory: string[];
  /** Hide PGN row (useful for endgame positions without prior moves) */
  hidePgn?: boolean;
}

const GameNotation: Component<GameNotationProps> = (props) => {
  const [copiedField, setCopiedField] = createSignal<'pgn' | 'fen' | null>(null);

  const pgn = createMemo(() => {
    const moves = props.moveHistory;
    if (moves.length === 0) return '';

    const pgnMoves: string[] = [];
    for (let i = 0; i < moves.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const whiteMove = moves[i];
      const blackMove = moves[i + 1];
      if (blackMove) {
        pgnMoves.push(`${moveNum}. ${whiteMove} ${blackMove}`);
      } else {
        pgnMoves.push(`${moveNum}. ${whiteMove}`);
      }
    }
    return pgnMoves.join(' ');
  });

  const copyToClipboard = async (text: string, field: 'pgn' | 'fen') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    }
  };

  return (
    <div class={styles.notationContainer}>
      <Show when={!props.hidePgn}>
        <div class={styles.notationRow}>
          <span class={styles.notationFieldLabel}>PGN</span>
          <div class={styles.notationValueContainer}>
            <span class={styles.notationFieldValue}>{pgn() || '—'}</span>
          </div>
          <button
            class={styles.copyButton}
            classList={{ [styles.copyButtonCopiedState]: copiedField() === 'pgn' }}
            onClick={() => copyToClipboard(pgn(), 'pgn')}
            disabled={!pgn()}
            title="Copy PGN"
            aria-label={copiedField() === 'pgn' ? 'Copied PGN' : 'Copy PGN'}
          >
            {copiedField() === 'pgn' ? '✓' : '⧉'}
          </button>
        </div>
      </Show>
      <div class={styles.notationRow}>
        <span class={styles.notationFieldLabel}>FEN</span>
        <div class={styles.notationValueContainer}>
          <span class={styles.notationFieldValue}>{props.fen}</span>
        </div>
        <button
          class={styles.copyButton}
          classList={{ [styles.copyButtonCopiedState]: copiedField() === 'fen' }}
          onClick={() => copyToClipboard(props.fen, 'fen')}
          title="Copy FEN"
          aria-label={copiedField() === 'fen' ? 'Copied FEN' : 'Copy FEN'}
        >
          {copiedField() === 'fen' ? '✓' : '⧉'}
        </button>
      </div>
    </div>
  );
};

export default GameNotation;
