import { type Component, type Accessor } from 'solid-js';
import { type SideSelection } from '../../../types/game';
import styles from './ChessSideSelector.module.css';

interface ChessSideSelectorProps {
  selectedSide: Accessor<SideSelection>;
  onSideChange: (side: SideSelection) => void;
}

const ChessSideSelector: Component<ChessSideSelectorProps> = (props) => {
  return (
    <div class={styles.sideSelector}>
      <div
        classList={{
          [styles.sideSelectorButton]: true,
          [styles.sideSelectorButtonActive]: props.selectedSide() === 'w',
        }}
        onClick={() => props.onSideChange('w')}
      >
        <img src="/assets/wN.svg" alt="White" />
      </div>
      <div
        classList={{
          [styles.sideSelectorButton]: true,
          [styles.sideSelectorButtonActive]: props.selectedSide() === 'random',
        }}
        onClick={() => props.onSideChange('random')}
      >
        <img class={styles.randomSideIcon} src="/assets/trainingModeRandom.svg" alt="Random" />
      </div>
      <div
        classList={{
          [styles.sideSelectorButton]: true,
          [styles.sideSelectorButtonActive]: props.selectedSide() === 'b',
        }}
        onClick={() => props.onSideChange('b')}
      >
        <img src="/assets/bN.svg" alt="Black" />
      </div>
    </div>
  );
};

export default ChessSideSelector;
