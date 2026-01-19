import { splitProps, type Component, Show } from 'solid-js';
import { useGameContext } from '../../../store/game/useGameContext';
import styles from './ChessEndModal.module.css';
import type { GameOverReason, GameWinner } from '../../../types/game';

// Extended reason type to include training-specific reasons
type ExtendedGameOverReason = GameOverReason | 'trainingOpeningComplete';

interface ChessEndModalProps {
  onClose: () => void;
  onPlayAgain: () => void;
  gameOverReason: ExtendedGameOverReason;
  gameWinner: GameWinner;
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

const getGameOverInfoPlay = (reason: ExtendedGameOverReason, winner: GameWinner): GameOverInfo => {
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
  const { chess } = useGameContext();

  const isMultiplayer = () => chess.state.opponentType === 'human';

  const getGameOverInfo = (): GameOverInfo => {
    if (chess.state.mode === 'training') {
      return getGameOverInfoTraining(chess.state.trainingEvalScore);
    }
    return getGameOverInfoPlay(local.gameOverReason, local.gameWinner);
  };

  // For multiplayer, show if player won/lost/drew
  const getPlayerResult = (): string | null => {
    if (!isMultiplayer()) return null;
    if (local.gameWinner === 'draw') return 'Draw';
    if (local.gameWinner === chess.state.playerColor) return 'You Won!';
    return 'You Lost';
  };

  const { heading, message } = getGameOverInfo();
  const playerResult = getPlayerResult();

  return (
    <div class={styles.modalOverlay} onClick={local.onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button class={styles.closeButton} onClick={local.onClose} aria-label="Close">
          <span class={styles.closeIcon}>&times;</span>
        </button>
        <Show when={playerResult}>
          <h1 class={styles.playerResult}>{playerResult}</h1>
        </Show>
        <h2>{heading}</h2>
        <p>{message}</p>
        <div class={styles.actions}>
          <button class={styles.playAgainButton} onClick={local.onPlayAgain}>
            {isMultiplayer() ? 'New Game' : 'Play Again'}
          </button>
          <button onClick={local.onClose}>Exit</button>
        </div>
      </div>
    </div>
  );
};

export default ChessEndModal;
