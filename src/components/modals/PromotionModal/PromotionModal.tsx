import { PromotionPiece } from '../../../types';
import styles from './PromotionModal.module.css';

const PromotionModal = ({
  color,
  onPromote,
  onClose,
}: {
  color: string;
  onPromote: (piece: PromotionPiece) => void;
  onClose: () => void;
}) => {
  return (
    <div class={styles.modalOverlay} onClick={onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style="display: flex; gap: 1.2rem;">
          {['q', 'r', 'b', 'n'].map((piece) => (
            <img
              src={`/assets/${color}${piece.toUpperCase()}.svg`}
              alt={`Promote to ${piece.toUpperCase()}`}
              style="width: 90px; cursor: pointer;"
              onClick={() => onPromote(piece as PromotionPiece)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
