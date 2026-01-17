import { Component, Accessor } from 'solid-js';
import { Side } from '../../../types';
import styles from './ChessSideSelector.module.css';

interface ChessSideSelectorProps {
  selectedSide: Accessor<Side>;
  onSideChange: (side: Side) => void;
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
        <img src="/assets/wN.svg" alt="White Knight" />
      </div>
      <div
        classList={{
          [styles.knightButton]: true,
          [styles.selectedKnight]: props.selectedSide() === 'b',
        }}
        onClick={() => props.onSideChange('b')}
      >
        <img src="/assets/bN.svg" alt="Black Knight" />
      </div>
    </div>
  );
};

export default ChessSideSelector;
