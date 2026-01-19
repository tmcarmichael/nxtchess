import { type Component, type Accessor } from 'solid-js';
import { DIFFICULTY_VALUES_ELO, DIFFICULTY_VALUES_LEVEL } from '../../../shared/config/constants';
import styles from './ChessDifficultySlider.module.css';

interface ChessDifficultySliderProps {
  difficultyIndex: Accessor<number>;
  onDifficultyChange: (index: number) => void;
  showElo?: boolean;
}

const ChessDifficultySlider: Component<ChessDifficultySliderProps> = (props) => {
  const showElo = () => props.showElo !== false;

  return (
    <div class={styles.settingRow}>
      <label class={styles.rangeSliderLabel}>
        Difficulty:&nbsp;&nbsp;&nbsp;{DIFFICULTY_VALUES_LEVEL[props.difficultyIndex()]}
        {showElo() && ` (ELO ${DIFFICULTY_VALUES_ELO[props.difficultyIndex()]})`}
      </label>
      <div class={styles.rangeSliderContainer}>
        <input
          class={styles.rangeSlider}
          type="range"
          min="0"
          max={DIFFICULTY_VALUES_LEVEL.length - 1}
          step="1"
          value={props.difficultyIndex()}
          onInput={(e) => props.onDifficultyChange(+e.currentTarget.value)}
        />
      </div>
    </div>
  );
};

export default ChessDifficultySlider;
