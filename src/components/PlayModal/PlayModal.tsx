import styles from './PlayModal.module.css';

export const PlayModal = ({ children, onClose }: { children: any; onClose: () => void }) => {
  return (
    <div class={styles.modalOverlay} onClick={onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {children}
        <button class={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default PlayModal;
