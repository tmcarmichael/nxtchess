import { splitProps } from 'solid-js';
import { PromotionPiece } from '../../../types';
import styles from './PromotionModal.module.css';

interface PromotionModalProps {
  color: string;
  onPromote: (piece: PromotionPiece) => void;
  onClose: () => void;
}

const PromotionModal = (props: PromotionModalProps) => {
  const [local] = splitProps(props, ['color', 'onPromote', 'onClose']);
  const PROMOTION_PIECES: Array<PromotionPiece> = ['q', 'r', 'b', 'n'];
  const handleKeyDown = (e: KeyboardEvent, piece: PromotionPiece) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      local.onPromote(piece);
    }
  };

  return (
    <div class={styles.modalOverlay} onClick={local.onClose} aria-modal="true" role="dialog">
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          class={styles.closeButton}
          onClick={local.onClose}
          aria-label="Close promotion modal"
        >
          &times;
        </button>
        <div class={styles.promotionOptions}>
          {PROMOTION_PIECES.map((piece) => (
            <img
              class={styles.promotionImage}
              src={`/assets/${local.color}${piece.toUpperCase()}.svg`}
              alt={`Promote to ${piece.toUpperCase()}`}
              tabindex="0"
              onClick={() => local.onPromote(piece)}
              onKeyDown={(e) => handleKeyDown(e, piece)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
