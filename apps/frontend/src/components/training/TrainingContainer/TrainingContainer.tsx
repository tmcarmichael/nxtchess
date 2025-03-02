import { ParentComponent, Show, createSignal } from 'solid-js';
import ChessBoardController from '../../chess/ChessBoardController/ChessBoardController';
import TrainingModal from '../TrainingModal/TrainingModal';
import styles from './TrainingContainer.module.css';

const TrainingContainer: ParentComponent = () => {
  const [showTrainingModal, setShowTrainingModal] = createSignal(false);

  return (
    <div class={styles.trainingContainer}>
      <Show when={showTrainingModal()}>
        <TrainingModal onClose={() => setShowTrainingModal(false)} />
      </Show>
      <div class={styles.trainingLayout}>
        <div class={styles.boardWrapper}>
          <ChessBoardController />
        </div>
      </div>
    </div>
  );
};

export default TrainingContainer;
