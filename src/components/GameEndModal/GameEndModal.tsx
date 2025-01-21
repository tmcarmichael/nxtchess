import styles from './GameEndModal.module.css';

interface GameEndModalProps {
  onClose: () => void;
  onRestart: () => void;
  gameOverReason: 'checkmate' | 'stalemate' | 'time' | null;
  gameWinner: 'w' | 'b' | 'draw' | null;
}

export default function GameEndModal(props: GameEndModalProps) {
  const getHeading = () => {
    switch (props.gameOverReason) {
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

  const getMessage = () => {
    switch (props.gameOverReason) {
      case 'checkmate':
        return `${props.gameWinner === 'w' ? 'White' : 'Black'} wins by checkmate.`;
      case 'stalemate':
        return `It's a draw by stalemate.`;
      case 'time':
        return `${props.gameWinner === 'w' ? 'White' : 'Black'} wins on time!`;
      default:
        return 'The game has ended.';
    }
  };

  return (
    <div class={styles.modalOverlay} onClick={props.onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h1>{getHeading()}</h1>
        <p>{getMessage()}</p>

        <div class={styles.actions}>
          <button onClick={props.onRestart}>Play Again</button>
        </div>
      </div>
    </div>
  );
}
