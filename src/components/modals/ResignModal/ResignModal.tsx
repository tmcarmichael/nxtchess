import styles from './ResignModal.module.css';

interface ResignModalProps {
  onClose: () => void;
  onReplay: () => void;
  onHome: () => void;
}

export default function ResignModal(props: ResignModalProps) {
  return (
    <div class={styles.modalOverlay} onClick={props.onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h1>You resigned.</h1>
        <p>Better luck next time.</p>
        <div class={styles.actions}>
          <button onClick={props.onReplay}>Play Again</button>
          <button onClick={props.onHome}>Home</button>
        </div>
      </div>
    </div>
  );
}
