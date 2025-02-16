import { splitProps, Component } from 'solid-js';
import styles from './ResignModal.module.css';

interface ResignModalProps {
  onClose: () => void;
  onReplay: () => void;
  onHome: () => void;
}

const ResignModal: Component<ResignModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose', 'onReplay', 'onHome']);
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

export default ResignModal;
