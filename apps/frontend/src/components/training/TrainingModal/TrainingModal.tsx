import { createSignal, Show, For, ParentComponent, splitProps } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useGameStore } from '../../../store/GameContext';
import { RatedMode, OpponentStyle, GamePhase } from '../../../types';
import styles from './TrainingModal.module.css';

interface TrainingModalProps {
  onClose: () => void;
}

interface OpponentStyleOption {
  value: OpponentStyle;
  label: string;
  icon: string;
}

interface GamePhaseOption {
  value: GamePhase;
  label: string;
}

const OPPONENT_STYLES: OpponentStyleOption[] = [
  { value: 'aggressive', label: 'Aggressive', icon: '/assets/trainingModeAggressive.svg' },
  { value: 'defensive', label: 'Defensive', icon: '/assets/trainingModeDefensive.svg' },
  { value: 'balanced', label: 'Balanced', icon: '/assets/trainingModeBalanced.svg' },
  { value: 'random', label: 'Random', icon: '/assets/trainingModeRandom.svg' },
  { value: 'positional', label: 'Positional', icon: '/assets/trainingModePositional.svg' },
];

const GAME_PHASES: GamePhaseOption[] = [
  { value: 'opening', label: 'Opening (1-10)' },
  { value: 'middlegame', label: 'Middlegame (10-20)' },
  { value: 'endgame', label: 'Endgame (>20)' },
];

const TrainingModal: ParentComponent<TrainingModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose']);
  const navigate = useNavigate();
  const [_, actions] = useGameStore();

  const [ratedMode, setRatedMode] = createSignal<RatedMode>('casual');
  const [difficulty, setDifficulty] = createSignal<number>(3);
  const [opponentStyle, setOpponentStyle] = createSignal<OpponentStyle>('balanced');
  const [gamePhase, setGamePhase] = createSignal<GamePhase>('opening');

  const handleStartTraining = () => {
    const DEV_TRAINING_MINUTES = 5;
    const DEV_TRAINING_SIDE = 'w';
    const DEV_TRAINING_MODE = 'training';

    actions.startNewGame(DEV_TRAINING_MINUTES, difficulty(), DEV_TRAINING_SIDE, {
      mode: DEV_TRAINING_MODE,
      isRated: ratedMode() === 'rated',
      opponentStyle: opponentStyle(),
      gamePhase: gamePhase(),
    });

    navigate('/training');
    local.onClose();
  };

  return (
    <div class={styles.modalOverlay} onClick={props.onClose}>
      <div class={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button class={styles.closeButton} onClick={props.onClose}>
          &times;
        </button>
        <h2>Training Options</h2>

        <div class={styles.buttonGroup}>
          <button
            classList={{
              [styles.toggleButton]: true,
              [styles.selectedToggle]: ratedMode() === 'rated',
            }}
            disabled
            onClick={() => setRatedMode('rated')}
          >
            Rated
          </button>
          <button
            classList={{
              [styles.toggleButton]: true,
              [styles.selectedToggle]: ratedMode() === 'casual',
            }}
            onClick={() => setRatedMode('casual')}
          >
            Casual
          </button>
        </div>

        <Show when={ratedMode() === 'casual'}>
          <div class={styles.settingRow}>
            <label class={styles.rangeSliderLabel}>Difficulty: {difficulty()}</label>
            <div class={styles.rangeSliderContainer}>
              <input
                class={styles.rangeSlider}
                type="range"
                min="1"
                max="10"
                value={difficulty()}
                onInput={(e) => setDifficulty(+e.currentTarget.value)}
              />
            </div>
          </div>
        </Show>

        <div class={styles.settingRow}>
          <label class={styles.label}>Opponent Style:</label>
          <div class={styles.styleSelector}>
            <For each={OPPONENT_STYLES}>
              {(styleObj) => (
                <div
                  classList={{
                    [styles.styleIconContainer]: true,
                    [styles.selectedIcon]: styleObj.value === opponentStyle(),
                  }}
                  onClick={() => setOpponentStyle(styleObj.value)}
                >
                  <img src={styleObj.icon} alt={styleObj.label} class={styles.opponentIcon} />
                  <span class={styles.iconLabel}>{styleObj.label}</span>
                </div>
              )}
            </For>
          </div>
        </div>

        <div class={styles.settingRow}>
          <label class={styles.label}>Game Phase:</label>
          <div class={styles.buttonGroup}>
            <For each={GAME_PHASES}>
              {(phase) => (
                <button
                  classList={{
                    [styles.toggleButton]: true,
                    [styles.selectedToggle]: phase.value === gamePhase(),
                  }}
                  disabled={phase.value !== 'opening'}
                  onClick={() => setGamePhase(phase.value)}
                >
                  {phase.label}
                </button>
              )}
            </For>
          </div>
        </div>

        <button class={styles.startButton} onClick={handleStartTraining}>
          Start Training
        </button>
      </div>
    </div>
  );
};

export default TrainingModal;
