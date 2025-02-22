import { createSignal, Show, For, createMemo, ParentComponent } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import styles from './TrainingModal.module.css';

interface TrainingModalProps {
  onClose: () => void;
}

const OPPONENT_STYLES = [
  { value: 'aggressive', label: 'Aggressive', icon: '/assets/trainingModeAggressive.svg' },
  { value: 'defensive', label: 'Defensive', icon: '/assets/trainingModeDefensive.svg' },
  { value: 'balanced', label: 'Balanced', icon: '/assets/trainingModeBalanced.svg' },
  { value: 'random', label: 'Random', icon: '/assets/trainingModeRandom.svg' },
  { value: 'positional', label: 'Positional', icon: '/assets/trainingModePositional.svg' },
];

const GAME_PHASES = [
  { value: 'opening', label: 'Opening (1-10)' },
  { value: 'middlegame', label: 'Middlegame (10-20)' },
  { value: 'endgame', label: 'Endgame (>20)' },
];

const TrainingModal: ParentComponent<TrainingModalProps> = (props) => {
  const navigate = useNavigate();
  const [mode, setMode] = createSignal<'rated' | 'casual'>('casual');
  const [difficulty, setDifficulty] = createSignal(3);
  const [opponentStyle, setOpponentStyle] = createSignal(OPPONENT_STYLES[0].value);
  const [gamePhase, setGamePhase] = createSignal(GAME_PHASES[0].value);

  // DEBUG
  // const selectedOpponentStyleLabel = createMemo(() => {
  //   return OPPONENT_STYLES.find((s) => s.value === opponentStyle())?.label ?? '';
  // });

  const handleStartTraining = () => {
    // Store or pass via query params
    console.log('Mode:', mode());
    console.log('Difficulty:', difficulty());
    console.log('Opponent Style:', opponentStyle());
    console.log('Game Phase:', gamePhase());

    navigate('/training');
    props.onClose();
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
              [styles.selectedToggle]: mode() === 'rated',
            }}
            onClick={() => setMode('rated')}
          >
            Rated
          </button>
          <button
            classList={{
              [styles.toggleButton]: true,
              [styles.selectedToggle]: mode() === 'casual',
            }}
            onClick={() => setMode('casual')}
          >
            Casual
          </button>
        </div>
        <Show when={mode() === 'casual'}>
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
