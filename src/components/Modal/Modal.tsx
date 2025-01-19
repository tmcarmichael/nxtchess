import styles from "./Modal.module.css";

const Modal = ({ children, onClose }: { children: any; onClose: () => void }) => {
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

export default Modal;
