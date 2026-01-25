import { splitProps, type Component, Show, onMount, onCleanup } from 'solid-js';
import { useGameContext } from '../../../store/game/useGameContext';
import styles from './ChessEndModal.module.css';
import type { GameOverReason, GameWinner, Side } from '../../../types/game';

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

const getGameOverInfoTraining = (
  reason: ExtendedGameOverReason,
  winner: GameWinner,
  playerColor: Side,
  gamePhase: string | null,
  evalScore: number | null
): GameOverInfo => {
  // Determine if player won
  const playerWon = winner === playerColor;

  if (reason === 'checkmate') {
    const winnerName = winner === 'w' ? 'White' : 'Black';
    return {
      heading: 'Checkmate',
      message: `${winnerName} wins by checkmate.`,
    };
  }
  if (reason === 'stalemate') {
    return {
      heading: 'Stalemate',
      message: '',
    };
  }
  if (winner === 'draw') {
    return {
      heading: 'Draw',
      message: '',
    };
  }
  if (reason === 'resignation') {
    return {
      heading: 'Resignation',
      message: `${playerWon ? 'Black' : 'White'} wins by resignation.`,
    };
  }

  // Opening complete (move-limit reached) - show eval
  if (gamePhase === 'opening') {
    const evalDisplay =
      evalScore !== null ? `Final eval: ${evalScore > 0 ? '+' : ''}${evalScore.toFixed(2)}` : '';
    return {
      heading: 'Opening Complete',
      message: evalDisplay,
    };
  }

  // Default for other training endings
  return {
    heading: 'Game Over',
    message: '',
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
  // eslint-disable-next-line no-undef
  let closeButtonRef: HTMLButtonElement | undefined;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (closeButtonRef) {
        closeButtonRef.classList.add(styles.escapeActive);
        setTimeout(() => {
          local.onClose();
        }, 150);
      } else {
        local.onClose();
      }
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  const isMultiplayer = () => chess.state.opponentType === 'human';

  const getGameOverInfo = (): GameOverInfo => {
    if (chess.state.mode === 'training') {
      return getGameOverInfoTraining(
        local.gameOverReason,
        local.gameWinner,
        chess.state.playerColor,
        chess.state.trainingGamePhase,
        chess.state.trainingEvalScore
      );
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
        <button
          ref={closeButtonRef}
          class={styles.closeButton}
          onClick={local.onClose}
          aria-label="Close"
        >
          <span class={styles.closeIcon}>&times;</span>
        </button>
        <Show when={playerResult}>
          <h1 class={styles.playerResult}>{playerResult}</h1>
        </Show>
        <h2>{heading}</h2>
        <p>{message}</p>
        <div class={styles.actions}>
          <button onClick={local.onPlayAgain}>{isMultiplayer() ? 'New Game' : 'Play Again'}</button>
          <button onClick={local.onClose}>Exit</button>
        </div>
      </div>
    </div>
  );
};

export default ChessEndModal;
