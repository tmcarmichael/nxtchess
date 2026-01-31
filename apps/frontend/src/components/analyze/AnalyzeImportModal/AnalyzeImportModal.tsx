import { createSignal, type Component, Show } from 'solid-js';
import { useAnalyzeGame } from '../../../store/game/AnalyzeGameContext';
import ChessGameModal from '../../chess/ChessGameModal/ChessGameModal';
import styles from './AnalyzeImportModal.module.css';

interface AnalyzeImportModalProps {
  onClose: () => void;
}

type ImportTab = 'fen' | 'pgn';

const AnalyzeImportModal: Component<AnalyzeImportModalProps> = (props) => {
  const { actions } = useAnalyzeGame();
  const [activeTab, setActiveTab] = createSignal<ImportTab>('fen');
  const [fenInput, setFenInput] = createSignal('');
  const [pgnInput, setPgnInput] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);

  const handleLoadFen = () => {
    setError(null);
    const fen = fenInput().trim();

    if (!fen) {
      setError('Please enter a FEN string');
      return;
    }

    const success = actions.loadFen(fen);
    if (success) {
      props.onClose();
    } else {
      setError('Invalid FEN position');
    }
  };

  const handleLoadPgn = () => {
    setError(null);
    const pgn = pgnInput().trim();

    if (!pgn) {
      setError('Please enter PGN moves');
      return;
    }

    const success = actions.loadPgn(pgn);
    if (success) {
      props.onClose();
    } else {
      setError('Invalid PGN format');
    }
  };

  const handleTabChange = (tab: ImportTab) => {
    setActiveTab(tab);
    setError(null);
  };

  return (
    <ChessGameModal title="Import Position" onClose={props.onClose}>
      <div class={styles.tabContainer}>
        <button
          classList={{
            [styles.importTab]: true,
            [styles.importTabActive]: activeTab() === 'fen',
          }}
          onClick={() => handleTabChange('fen')}
        >
          FEN
        </button>
        <button
          classList={{
            [styles.importTab]: true,
            [styles.importTabActive]: activeTab() === 'pgn',
          }}
          onClick={() => handleTabChange('pgn')}
        >
          PGN
        </button>
      </div>

      <Show when={activeTab() === 'fen'}>
        <div class={styles.inputSection}>
          <label class={styles.importFieldLabel} for="fen-input">
            Paste a FEN string to load a position
          </label>
          <input
            id="fen-input"
            type="text"
            class={styles.textInput}
            placeholder="rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
            value={fenInput()}
            onInput={(e) => setFenInput(e.currentTarget.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleLoadFen();
              }
            }}
          />
          <button class={styles.loadButton} onClick={handleLoadFen}>
            Load FEN
          </button>
        </div>
      </Show>

      <Show when={activeTab() === 'pgn'}>
        <div class={styles.inputSection}>
          <label class={styles.importFieldLabel} for="pgn-input">
            Paste PGN moves to replay a game
          </label>
          <textarea
            id="pgn-input"
            class={styles.textArea}
            placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5 ..."
            value={pgnInput()}
            onInput={(e) => setPgnInput(e.currentTarget.value)}
          />
          <button class={styles.loadButton} onClick={handleLoadPgn}>
            Load PGN
          </button>
        </div>
      </Show>

      <Show when={error()}>
        <div class={styles.errorMessage}>{error()}</div>
      </Show>
    </ChessGameModal>
  );
};

export default AnalyzeImportModal;
