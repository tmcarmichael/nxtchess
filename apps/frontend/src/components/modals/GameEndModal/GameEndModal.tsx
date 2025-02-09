import { splitProps, Component } from 'solid-js';
import styles from './GameEndModal.module.css';

interface GameEndModalProps {
  onClose: () => void;
  onRestart: () => void;
  gameOverReason: 'checkmate' | 'stalemate' | 'time' | null;
  gameWinner: 'w' | 'b' | 'draw' | null;
}

const GameEndModal: Component<GameEndModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose', 'onRestart', 'gameOverReason', 'gameWinner']);

  const getGameOverHeading = () => {
    if (local.gameWinner === 'draw') return 'Draw!';
    if (!local.gameOverReason && (local.gameWinner === 'w' || local.gameWinner === 'b'))
      return 'Checkmate!';
    switch (local.gameOverReason) {
      case 'checkmate':
        return 'Checkmate!';
      case 'stalemate':
        return 'Stalemate!';
      case 'time':
        return 'Time Out!';
      default:
        return 'Game Over!';
    }
  };

  const getGameOverMessage = () => {
    if (local.gameWinner === 'draw') return "It's a draw.";
    if (!local.gameOverReason && (local.gameWinner === 'w' || local.gameWinner === 'b')) {
      return `${local.gameWinner === 'w' ? 'White' : 'Black'} wins by checkmate.`;
    }
    switch (local.gameOverReason) {
      case 'checkmate':
        return `${local.gameWinner === 'w' ? 'White' : 'Black'} wins by checkmate.`;
      case 'stalemate':
        return "It's a stalemate.";
      case 'time':
        return `${local.gameWinner === 'w' ? 'White' : 'Black'} wins on time.`;
      default:
        return 'The game has ended.';
    }
  };

  return (
    <div class={styles.modalOverlay} onClick={local.onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h1>{getGameOverHeading()}</h1>
        <p>{getGameOverMessage()}</p>
        <div class={styles.actions}>
          <button onClick={local.onRestart}>Play Again</button>
          <button onClick={local.onClose}>Exit</button>
        </div>
      </div>
    </div>
  );
};

export default GameEndModal;
