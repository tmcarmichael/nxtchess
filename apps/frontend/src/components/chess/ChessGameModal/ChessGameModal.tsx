import { ParentComponent, JSX } from 'solid-js';
import styles from './ChessGameModal.module.css';

interface ChessGameModalProps {
  title: string;
  onClose: () => void;
  children: JSX.Element;
}

const ChessGameModal: ParentComponent<ChessGameModalProps> = (props) => {
  return (
    <div class={styles.modalOverlay} onClick={props.onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button class={styles.closeButton} onClick={props.onClose} aria-label="Close">
          <span class={styles.closeIcon}>&times;</span>
        </button>
        <h2>{props.title}</h2>
        {props.children}
      </div>
    </div>
  );
};

export default ChessGameModal;
