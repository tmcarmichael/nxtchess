import { splitProps, Component } from 'solid-js';
import styles from './GameEndModal.module.css';

interface GameEndModalProps {
  onClose: () => void;
  onRestart: () => void;
  gameOverReason: 'checkmate' | 'stalemate' | 'time' | null;
  gameWinner: 'w' | 'b' | 'draw' | null;
}

interface GameOverInfo {
  heading: string;
  message: string | ((winnerName: string) => string);
}

const GAME_OVER_MAPPING: Record<
  NonNullable<GameEndModalProps['gameOverReason']> | 'default',
  GameOverInfo
> = {
  checkmate: {
    heading: 'Checkmate!',
    message: (winnerName: string) => `${winnerName} wins by checkmate.`,
  },
  stalemate: {
    heading: 'Stalemate!',
    message: "It's a stalemate.",
  },
  time: {
    heading: 'Time Out!',
    message: (winnerName: string) => `${winnerName} wins on time.`,
  },
  default: {
    heading: 'Game Over!',
    message: 'The game has ended.',
  },
};

const GameEndModal: Component<GameEndModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose', 'onRestart', 'gameOverReason', 'gameWinner']);

  const getGameOverInfo = () => {
    if (local.gameWinner === 'draw') {
      return { heading: 'Draw!', message: "It's a draw." };
    }
    const winnerName = local.gameWinner === 'w' ? 'White' : 'Black';
    const mapping = GAME_OVER_MAPPING[local.gameOverReason ?? 'checkmate'];
    const computedMessage =
      typeof mapping.message === 'function' ? mapping.message(winnerName) : mapping.message;
    return { heading: mapping.heading, message: computedMessage };
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
          <button class={styles.playAgainButton} onClick={local.onRestart}>
            Play Again
          </button>
          <button onClick={local.onClose}>Exit</button>
        </div>
      </div>
    </div>
  );
};

export default GameEndModal;
