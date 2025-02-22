import { ParentComponent } from 'solid-js';
import TrainingBoardController from '../TrainingBoardController/TrainingBoardController';
import styles from './TrainingContainer.module.css';

const TrainingContainer: ParentComponent = () => {
  return (
    <div class={styles.trainingContainer}>
      <div class={styles.trainingLayout}>
        {/* <div class={styles.panelWrapper}>
        </div> */}
        <div class={styles.boardWrapper}>
          <TrainingBoardController />
        </div>
        {/* <div class={styles.panelWrapper}>
        </div> */}
      </div>
    </div>
  );
};

export default TrainingContainer;
