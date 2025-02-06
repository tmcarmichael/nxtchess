import { PromotionPiece } from '../../../types';
import styles from './PromotionModal.module.css';

type PromotionModalProps = {
  color: string;
  onPromote: (piece: PromotionPiece) => void;
  onClose: () => void;
};

const PROMOTION_PIECES: Array<PromotionPiece> = ['q', 'r', 'b', 'n'];

const PromotionModal = ({ color, onPromote, onClose }: PromotionModalProps) => {
  // Allow keyboard selection (Enter or Space)
  const handleKeyDown = (e: KeyboardEvent, piece: PromotionPiece) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPromote(piece);
    }
  };

  return (
    <div class={styles.modalOverlay} onClick={onClose} aria-modal="true" role="dialog">
      <div
        class={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          class={styles.closeButton}
          onClick={onClose}
          aria-label="Close promotion modal"
        >
          &times;
        </button>
        <div class={styles.promotionOptions}>
          {PROMOTION_PIECES.map((piece) => (
            <img
              class={styles.promotionImage}
              src={`/assets/${color}${piece.toUpperCase()}.svg`}
              alt={`Promote to ${piece.toUpperCase()}`}
              tabindex="0"
              onClick={() => onPromote(piece)}
              onKeyDown={(e) => handleKeyDown(e, piece)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
