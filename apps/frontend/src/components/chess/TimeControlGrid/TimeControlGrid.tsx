import { For, type Component, type Accessor } from 'solid-js';
import {
  TIME_CONTROL_CATEGORIES,
  type TimeControlOption,
} from '../../../shared/config/timeControls';
import styles from './TimeControlGrid.module.css';

interface TimeControlGridProps {
  selected: Accessor<TimeControlOption>;
  onSelect: (option: TimeControlOption) => void;
}

const TimeControlGrid: Component<TimeControlGridProps> = (props) => {
  const isSelected = (option: TimeControlOption) =>
    props.selected().minutes === option.minutes && props.selected().increment === option.increment;

  return (
    <div class={styles.timeControlGrid}>
      <For each={TIME_CONTROL_CATEGORIES}>
        {(category) => (
          <div class={styles.timeControlCategory}>
            <span class={styles.categoryLabel}>{category.name}</span>
            <div class={styles.categoryOptions}>
              <For each={category.options}>
                {(option) => (
                  <button
                    class={styles.timeControlButton}
                    classList={{ [styles.timeControlButtonActive]: isSelected(option) }}
                    onClick={() => props.onSelect(option)}
                  >
                    {option.label}
                  </button>
                )}
              </For>
            </div>
          </div>
        )}
      </For>
    </div>
  );
};

export default TimeControlGrid;
