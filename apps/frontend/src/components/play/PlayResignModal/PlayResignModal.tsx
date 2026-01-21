import { splitProps, type Component, onMount, onCleanup } from 'solid-js';
import styles from './PlayResignModal.module.css';

interface ResignModalProps {
  onClose: () => void;
  onReplay: () => void;
  onHome: () => void;
}

const PlayResignModal: Component<ResignModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose', 'onReplay', 'onHome']);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      local.onClose();
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div class={styles.modalOverlay} onClick={local.onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h1>You resigned.</h1>
        <p>Better luck next time.</p>
        <div class={styles.actions}>
          <button class={styles.playAgainButton} onClick={local.onReplay}>
            Play Again
          </button>
          <button onClick={local.onHome}>Home</button>
        </div>
      </div>
    </div>
  );
};

export default PlayResignModal;
