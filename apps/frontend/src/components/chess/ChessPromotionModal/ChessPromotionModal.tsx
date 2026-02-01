import { splitProps, type Component, For } from 'solid-js';
import { type PromotionPiece } from '../../../types/chess';
import ChessGameModal from '../ChessGameModal/ChessGameModal';
import styles from './ChessPromotionModal.module.css';

interface PromotionModalProps {
  color: string;
  onPromote: (piece: PromotionPiece) => void;
  onClose: () => void;
}

const PROMOTION_PIECES: Array<PromotionPiece> = ['q', 'r', 'b', 'n'];

const ChessPromotionModal: Component<PromotionModalProps> = (props) => {
  const [local] = splitProps(props, ['color', 'onPromote', 'onClose']);

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
      role="button"
    />
  );

  return (
    <ChessGameModal onClose={local.onClose} size="sm" priority>
      <div class={styles.promotionOptions} aria-modal="true" role="dialog">
        <For each={PROMOTION_PIECES}>{(piece) => renderPromotionImage(piece)}</For>
      </div>
    </ChessGameModal>
  );
};

export default ChessPromotionModal;
