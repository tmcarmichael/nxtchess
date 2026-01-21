import { splitProps, type Component, For, onMount, onCleanup } from 'solid-js';
import { type PromotionPiece } from '../../../types/chess';
import styles from './ChessPromotionModal.module.css';

interface PromotionModalProps {
  color: string;
  onPromote: (piece: PromotionPiece) => void;
  onClose: () => void;
}

const PROMOTION_PIECES: Array<PromotionPiece> = ['q', 'r', 'b', 'n'];

const ChessPromotionModal: Component<PromotionModalProps> = (props) => {
  const [local] = splitProps(props, ['color', 'onPromote', 'onClose']);
  // eslint-disable-next-line no-undef
  let closeButtonRef: HTMLButtonElement | undefined;

  const handleEscapeKey = (e: KeyboardEvent) => {
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
    document.addEventListener('keydown', handleEscapeKey);
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleEscapeKey);
  });

  const handleKeyDown = (e: KeyboardEvent, piece: PromotionPiece) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      local.onPromote(piece);
    }
  };

  const renderPromotionImage = (piece: PromotionPiece) => (
    <img
      class={styles.promotionImage}
      src={`/assets/${local.color}${piece.toUpperCase()}.svg`}
      alt={`Promote to ${piece.toUpperCase()}`}
      tabIndex="0"
      onClick={() => local.onPromote(piece)}
      onKeyDown={(e) => handleKeyDown(e, piece)}
    />
  );

  return (
    <div class={styles.modalOverlay} onClick={local.onClose} aria-modal="true" role="dialog">
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          ref={closeButtonRef}
          class={styles.closeButton}
          onClick={local.onClose}
          aria-label="Close promotion modal"
        >
          <span class={styles.closeIcon}>&times;</span>
        </button>
        <div class={styles.promotionOptions}>
          <For each={PROMOTION_PIECES}>{(piece) => renderPromotionImage(piece)}</For>
        </div>
      </div>
    </div>
  );
};

export default ChessPromotionModal;
