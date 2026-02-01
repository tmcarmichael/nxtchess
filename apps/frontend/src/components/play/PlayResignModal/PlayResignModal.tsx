import { splitProps, type Component } from 'solid-js';
import ChessGameModal from '../../chess/ChessGameModal/ChessGameModal';
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

  return (
    <ChessGameModal onClose={local.onClose} size="md">
      <h1 class={styles.resignTitle}>{getSideLabel()} resigned</h1>
      <div class={styles.resignModalActions}>
        <button onClick={local.onReplay}>Play Again</button>
        <button onClick={local.onHome}>Home</button>
      </div>
    </ChessGameModal>
  );
};

export default PlayResignModal;
