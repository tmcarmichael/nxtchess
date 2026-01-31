import { type Component, type Accessor } from 'solid-js';
import { type SideSelection } from '../../../types/game';
import styles from './ChessSideSelector.module.css';

interface ChessSideSelectorProps {
  selectedSide: Accessor<SideSelection>;
  onSideChange: (side: SideSelection) => void;
}

const ChessSideSelector: Component<ChessSideSelectorProps> = (props) => {
  return (
    <div class={styles.knightSelector}>
      <div
        classList={{
          [styles.knightButton]: true,
          [styles.selectedKnight]: props.selectedSide() === 'w',
        }}
        onClick={() => props.onSideChange('w')}
      >
        <img src="/assets/wN.svg" alt="White" />
      </div>
      <div
        classList={{
          [styles.knightButton]: true,
          [styles.selectedKnight]: props.selectedSide() === 'random',
        }}
        onClick={() => props.onSideChange('random')}
      >
        <img class={styles.diceIcon} src="/assets/trainingModeRandom.svg" alt="Random" />
      </div>
      <div
        classList={{
          [styles.knightButton]: true,
          [styles.selectedKnight]: props.selectedSide() === 'b',
        }}
        onClick={() => props.onSideChange('b')}
      >
        <img src="/assets/bN.svg" alt="Black" />
      </div>
    </div>
  );
};

export default ChessSideSelector;
