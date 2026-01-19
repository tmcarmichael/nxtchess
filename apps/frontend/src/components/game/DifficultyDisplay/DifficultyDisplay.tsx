import { type Component } from 'solid-js';
import { DIFFICULTY_VALUES_ELO } from '../../../shared';
import styles from './DifficultyDisplay.module.css';

interface DifficultyDisplayProps {
  difficulty: number;
}

const DifficultyDisplay: Component<DifficultyDisplayProps> = (props) => {
  return (
    <div class={styles.difficulty}>
      <span class={styles.difficultyLabel}>Difficulty: </span>
      <span>{` ${DIFFICULTY_VALUES_ELO[props.difficulty - 1]} ELO`}</span>
    </div>
  );
};

export default DifficultyDisplay;
