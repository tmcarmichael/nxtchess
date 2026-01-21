import { type ParentComponent, type JSX, onMount, onCleanup } from 'solid-js';
import styles from './ChessGameModal.module.css';

interface ChessGameModalProps {
  title: string;
  onClose: () => void;
  children: JSX.Element;
}

const ChessGameModal: ParentComponent<ChessGameModalProps> = (props) => {
  // eslint-disable-next-line no-undef
  let closeButtonRef: HTMLButtonElement | undefined;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (closeButtonRef) {
        closeButtonRef.classList.add(styles.escapeActive);
        setTimeout(() => {
          props.onClose();
        }, 150);
      } else {
        props.onClose();
      }
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div class={styles.modalOverlay} onClick={props.onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeButtonRef}
          class={styles.closeButton}
          onClick={props.onClose}
          aria-label="Close"
        >
          <span class={styles.closeIcon}>&times;</span>
        </button>
        <h2>{props.title}</h2>
        {props.children}
      </div>
    </div>
  );
};

export default ChessGameModal;
