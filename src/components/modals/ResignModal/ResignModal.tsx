import styles from './ResignModal.module.css';

const ResignModal = ({
  onClose,
  onReplay,
  onHome,
}: {
  onClose: () => void;
  onReplay: () => void;
  onHome: () => void;
}) => {
  return (
    <div class={styles.modalOverlay} onClick={onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h1>You resigned.</h1>
        <p>Better luck next time.</p>
        <div class={styles.actions}>
          <button onClick={onReplay}>Play Again</button>
          <button onClick={onHome}>Home</button>
        </div>
      </div>
    </div>
  );
};

export default ResignModal;
