import { useNavigate } from '@solidjs/router';
import { Chess } from 'chess.js';
import { createSignal, type Component } from 'solid-js';
import ChessGameModal from '../../chess/ChessGameModal/ChessGameModal';
import ChessSideSelector from '../../chess/ChessSideSelector/ChessSideSelector';
import styles from './GameReviewModal.module.css';
import type { Side, SideSelection } from '../../../types/game';

interface GameReviewModalProps {
  onClose: () => void;
}

function resolveSide(selection: SideSelection): Side {
  if (selection === 'random') {
    return Math.random() < 0.5 ? 'w' : 'b';
  }
  return selection;
}

const GameReviewModal: Component<GameReviewModalProps> = (props) => {
  const navigate = useNavigate();
  const [pgnInput, setPgnInput] = createSignal('');
  const [selectedSide, setSelectedSide] = createSignal<SideSelection>('w');
  const [error, setError] = createSignal<string | null>(null);

  const handleReview = () => {
    setError(null);
    const pgn = pgnInput().trim();

    if (!pgn) {
      setError('Please enter PGN moves');
      return;
    }

    try {
      const tempChess = new Chess();
      tempChess.loadPgn(pgn);
      const history = tempChess.history();
      if (history.length === 0) {
        setError('PGN contains no moves');
        return;
      }
    } catch {
      setError('Invalid PGN format');
      return;
    }

    const playerColor = resolveSide(selectedSide());
    props.onClose();
    navigate('/review', { state: { pgn, playerColor } });
  };

  return (
    <ChessGameModal title="Game Review" onClose={props.onClose} size="md">
      <div class={styles.inputSection}>
        <label class={styles.fieldLabel} for="review-pgn-input">
          Paste a PGN to analyze move quality and accuracy
        </label>
        <textarea
          id="review-pgn-input"
          class={styles.textArea}
          placeholder={
            '[Event "Casual Game"]\n[White "Player1"]\n[Black "Player2"]\n\n1. e4 e5 2. Nf3 Nc6 3. Bb5 a6\n4. Ba4 Nf6 5. O-O Be7 ...'
          }
          value={pgnInput()}
          onInput={(e) => setPgnInput(e.currentTarget.value)}
        />
      </div>

      <div class={styles.sideSection}>
        <span class={styles.fieldLabel}>Review perspective</span>
        <ChessSideSelector selectedSide={selectedSide} onSideChange={setSelectedSide} />
      </div>

      {error() && <div class={styles.errorMessage}>{error()}</div>}

      <button class={styles.reviewButton} onClick={handleReview}>
        Review Game
      </button>
    </ChessGameModal>
  );
};

export default GameReviewModal;
