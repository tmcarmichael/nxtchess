import styles from './GameEndModal.module.css';

const GameEndModal = ({
  onClose,
  onRestart,
  gameOverReason,
  gameWinner,
}: {
  onClose: () => void;
  onRestart: () => void;
  gameOverReason: 'checkmate' | 'stalemate' | 'time' | null;
  gameWinner: 'w' | 'b' | 'draw' | null;
}) => {
  const getGameOverHeading = () => {
    switch (gameOverReason) {
      case 'checkmate':
        return 'Checkmate!';
      case 'stalemate':
        return 'Stalemate!';
      case 'time':
        return 'Time!';
      default:
        return 'Game Over!';
    }
  };

  const getGameOverMessage = () => {
    switch (gameOverReason) {
      case 'checkmate':
        return `${gameWinner === 'w' ? 'White' : 'Black'} wins by checkmate.`;
      case 'stalemate':
        return `It's a draw by stalemate.`;
      case 'time':
        return `${gameWinner === 'w' ? 'White' : 'Black'} wins on time.`;
      default:
        return 'The game has ended.';
    }
  };

  return (
    <div class={styles.modalOverlay} onClick={onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h1>{getGameOverHeading()}</h1>
        <p>{getGameOverMessage()}</p>
        <div class={styles.actions}>
          <button onClick={onRestart}>Play Again</button>
        </div>
      </div>
    </div>
  );
};

export default GameEndModal;
