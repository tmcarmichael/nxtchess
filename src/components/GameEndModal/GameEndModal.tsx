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
  const getGameOverMessage = () => {
    switch (gameOverReason) {
      case 'checkmate':
        return `Checkmate! ${gameWinner === 'w' ? 'White' : 'Black'} wins!`;
      case 'stalemate':
        return "Stalemate! It's a draw!";
      case 'time':
        return `Time! ${gameWinner === 'w' ? 'White' : 'Black'} wins!`;
      default:
        return 'Game Over!';
    }
  };

  return (
    <div class={styles.modalOverlay} onClick={onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h1>Game Over</h1>
        <p>{getGameOverMessage()}</p>
        <div class={styles.actions}>
          <button onClick={onRestart}>Play Again</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default GameEndModal;
