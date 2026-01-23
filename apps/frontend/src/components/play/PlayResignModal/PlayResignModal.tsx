import { splitProps, type Component, onMount, onCleanup } from 'solid-js';
import styles from './PlayResignModal.module.css';
import type { Side } from '../../../types/game';

interface ResignModalProps {
  onClose: () => void;
  onReplay: () => void;
  onHome: () => void;
  resignedSide: Side;
}

const PlayResignModal: Component<ResignModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose', 'onReplay', 'onHome', 'resignedSide']);

  const getSideLabel = () => (local.resignedSide === 'w' ? 'White' : 'Black');
  // eslint-disable-next-line no-undef
  let closeButtonRef: HTMLButtonElement | undefined;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (closeButtonRef) {
        closeButtonRef.classList.add(styles.escapeActive);
        setTimeout(() => {
          local.onClose();
        }, 150);
      } else {
        local.onClose();
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
    <div class={styles.modalOverlay} onClick={local.onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeButtonRef}
          class={styles.closeButton}
          onClick={local.onClose}
          aria-label="Close"
        >
          <span class={styles.closeIcon}>&times;</span>
        </button>
        <h1>{getSideLabel()} resigned</h1>
        <div class={styles.actions}>
          <button onClick={local.onReplay}>Play Again</button>
          <button onClick={local.onHome}>Home</button>
        </div>
      </div>
    </div>
  );
};

export default PlayResignModal;
