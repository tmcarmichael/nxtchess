import {
  type ParentComponent,
  type JSX,
  onMount,
  onCleanup,
  Show,
  createUniqueId,
  createSignal,
} from 'solid-js';
import { createFocusTrap } from '../../../shared/utils/createFocusTrap';
import styles from './ChessGameModal.module.css';

interface ChessGameModalProps {
  title?: string;
  onClose: () => void;
  children: JSX.Element;
  size?: 'sm' | 'md';
  priority?: boolean;
}

const ChessGameModal: ParentComponent<ChessGameModalProps> = (props) => {
  const modalTitleId = createUniqueId();
  const focusTrap = createFocusTrap();
  // eslint-disable-next-line no-undef
  let closeButtonRef: HTMLButtonElement | undefined;

  let modalRef: HTMLDivElement | undefined;

  const [closing, setClosing] = createSignal(false);

  const handleClose = () => {
    if (closing()) return;
    setClosing(true);
    setTimeout(() => props.onClose(), 200);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (closeButtonRef) {
        closeButtonRef.classList.add(styles.closeButtonEscapeActive);
      }
      handleClose();
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
    if (modalRef) {
      focusTrap.activate(modalRef);
    }
  });

  onCleanup(() => {
    focusTrap.deactivate();
    document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div
      classList={{
        [styles.modalOverlay]: true,
        [styles.modalOverlayPriority]: !!props.priority,
        [styles.modalOverlayClosing]: closing(),
      }}
      onClick={() => handleClose()}
    >
      <div
        ref={modalRef}
        classList={{
          [styles.modalContent]: true,
          [styles.modalContentSm]: props.size === 'sm',
          [styles.modalContentMd]: props.size === 'md',
          [styles.modalContentClosing]: closing(),
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={props.title ? modalTitleId : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          class={styles.closeButton}
          onClick={() => handleClose()}
          aria-label="Close"
        >
          <span class={styles.closeButtonIcon}>&times;</span>
        </button>
        <Show when={props.title}>
          <h2 id={modalTitleId}>{props.title}</h2>
        </Show>
        {props.children}
      </div>
    </div>
  );
};

export default ChessGameModal;
