import { type Component, type Accessor } from 'solid-js';
import { type SideSelection } from '../../../types/game';
import styles from './ChessSideSelector.module.css';

interface ChessSideSelectorProps {
  selectedSide: Accessor<SideSelection>;
  onSideChange: (side: SideSelection) => void;
}

const ChessSideSelector: Component<ChessSideSelectorProps> = (props) => {
  return (
    <div class={styles.sideSelector} role="radiogroup" aria-label="Choose your color">
      <button
        role="radio"
        aria-checked={props.selectedSide() === 'w'}
        aria-label="Play as White"
        classList={{
          [styles.sideSelectorButton]: true,
          [styles.sideSelectorButtonActive]: props.selectedSide() === 'w',
        }}
        onClick={() => props.onSideChange('w')}
      >
        <img src="/assets/wN.svg" alt="" />
      </button>
      <button
        role="radio"
        aria-checked={props.selectedSide() === 'random'}
        aria-label="Random side"
        classList={{
          [styles.sideSelectorButton]: true,
          [styles.sideSelectorButtonActive]: props.selectedSide() === 'random',
        }}
        onClick={() => props.onSideChange('random')}
      >
        <img class={styles.randomSideIcon} src="/assets/trainingModeRandom.svg" alt="" />
      </button>
      <button
        role="radio"
        aria-checked={props.selectedSide() === 'b'}
        aria-label="Play as Black"
        classList={{
          [styles.sideSelectorButton]: true,
          [styles.sideSelectorButtonActive]: props.selectedSide() === 'b',
        }}
        onClick={() => props.onSideChange('b')}
      >
        <img src="/assets/bN.svg" alt="" />
      </button>
    </div>
  );
};

export default ChessSideSelector;
