import { splitProps, Component } from 'solid-js';
import { useGameStore } from '../../../store';
import styles from './ChessEndModal.module.css';

interface ChessEndModalProps {
  onClose: () => void;
  onPlayAgain: () => void;
  gameOverReason:
    | 'checkmate'
    | 'stalemate'
    | 'time'
    | 'resignation'
    | 'trainingOpeningComplete'
    | null;
  gameWinner: 'w' | 'b' | 'draw' | null;
}

interface GameOverInfo {
  heading: string;
  message: string;
}

const getGameOverInfoTraining = (finalEvalScore: number | null): GameOverInfo => {
  const score = finalEvalScore ?? 0;
  return {
    heading: 'Training Round Complete',
    message: `Final engine eval: ${score.toFixed(2)}`,
  };
};

const getGameOverInfoPlay = (
  reason: ChessEndModalProps['gameOverReason'],
  winner: 'w' | 'b' | 'draw' | null
): GameOverInfo => {
  if (winner === 'draw') {
    return { heading: 'Draw', message: '' };
  }
  const winnerName = winner === 'w' ? 'White' : 'Black';
  switch (reason) {
    case 'checkmate':
      return {
        heading: 'Checkmate',
        message: `${winnerName} wins by checkmate.`,
      };
    case 'stalemate':
      return {
        heading: 'Stalemate',
        message: '',
      };
    case 'time':
      return {
        heading: 'Time Out',
        message: `${winnerName} wins on time.`,
      };
    case 'resignation':
      return {
        heading: 'Resignation',
        message: `${winnerName} wins by resignation.`,
      };
    default:
      return {
        heading: 'Game Over',
        message: '',
      };
  }
};

const ChessEndModal: Component<ChessEndModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose', 'onPlayAgain', 'gameOverReason', 'gameWinner']);
  const [state] = useGameStore();

  const getGameOverInfo = (): GameOverInfo => {
    if (state.mode === 'training') {
      return getGameOverInfoTraining(state.trainingEvalScore);
    }
    return getGameOverInfoPlay(local.gameOverReason, local.gameWinner);
  };

  const { heading, message } = getGameOverInfo();

  return (
    <div class={styles.modalOverlay} onClick={local.onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button class={styles.closeButton} onClick={local.onClose} aria-label="Close">
          <span class={styles.closeIcon}>&times;</span>
        </button>
        <h1>{heading}</h1>
        <p>{message}</p>
        <div class={styles.actions}>
          <button class={styles.playAgainButton} onClick={local.onPlayAgain}>
            Play Again
          </button>
          <button onClick={local.onClose}>Exit</button>
        </div>
      </div>
    </div>
  );
};

export default ChessEndModal;
