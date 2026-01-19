import { useNavigate } from '@solidjs/router';
import { createSignal, Show, For, type ParentComponent, splitProps } from 'solid-js';
import { useGame } from '../../../store/game/GameContext';
import {
  type RatedMode,
  type AIPlayStyle,
  type GamePhase,
  type Side,
  type StartGameOptions,
} from '../../../types/game';
import ChessGameModal from '../../chess/ChessGameModal/ChessGameModal';
import ChessSideSelector from '../../chess/ChessSideSelector/ChessSideSelector';
import styles from './TrainingModal.module.css';

interface TrainingModalProps {
  onClose: () => void;
}

interface AIPlayStyleOption {
  value: AIPlayStyle;
  label: string;
  icon: string;
}

interface GamePhaseOption {
  value: GamePhase;
  label: string;
}

const OPPONENT_STYLES: AIPlayStyleOption[] = [
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
  const { actions } = useGame();

  const [localRatedMode, setLocalRatedMode] = createSignal<RatedMode>('casual');
  const [localDifficulty, setLocalDifficulty] = createSignal<number>(3);
  const [localAIPlayStyle, localSetAIPlayStyle] = createSignal<AIPlayStyle>('balanced');
  const [localGamePhase, setLocalGamePhase] = createSignal<GamePhase>('opening');
  const [localPlayerColor, setLocalPlayerColor] = createSignal<Side>('w');

  const handleStartTraining = () => {
    const trainingGameConfig: StartGameOptions = {
      side: localPlayerColor(),
      mode: 'training',
      newDifficultyLevel: localDifficulty(),
      trainingIsRated: localRatedMode() === 'rated',
      trainingAIPlayStyle: localAIPlayStyle(),
      trainingGamePhase: localGamePhase(),
    };
    actions.startNewGame(trainingGameConfig);
    navigate('/training');
    local.onClose();
  };

  return (
    <ChessGameModal title="Training Options" onClose={local.onClose}>
      <div class={styles.buttonGroup}>
        <button
          classList={{
            [styles.toggleButton]: true,
            [styles.selectedToggle]: localRatedMode() === 'rated',
          }}
          disabled
          onClick={() => setLocalRatedMode('rated')}
        >
          Rated
        </button>
        <button
          classList={{
            [styles.toggleButton]: true,
            [styles.selectedToggle]: localRatedMode() === 'casual',
          }}
          onClick={() => setLocalRatedMode('casual')}
        >
          Casual
        </button>
      </div>

      <Show when={localRatedMode() === 'casual'}>
        <div class={styles.settingRow}>
          <label class={styles.rangeSliderLabel}>Difficulty: {localDifficulty()}</label>
          <div class={styles.rangeSliderContainer}>
            <input
              class={styles.rangeSlider}
              type="range"
              min="1"
              max="10"
              value={localDifficulty()}
              onInput={(e) => setLocalDifficulty(+e.currentTarget.value)}
            />
          </div>
        </div>
      </Show>

      <div class={styles.settingRow}>
        <label class={styles.label}>Play As:</label>
        <ChessSideSelector selectedSide={localPlayerColor} onSideChange={setLocalPlayerColor} />
      </div>

      <div class={styles.settingRow}>
        <label class={styles.label}>Opponent Style:</label>
        <div class={styles.styleSelector}>
          <For each={OPPONENT_STYLES}>
            {(styleObj) => (
              <div
                classList={{
                  [styles.styleIconContainer]: true,
                  [styles.selectedIcon]: styleObj.value === localAIPlayStyle(),
                }}
                onClick={() => localSetAIPlayStyle(styleObj.value)}
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
                  [styles.selectedToggle]: phase.value === localGamePhase(),
                }}
                disabled={phase.value !== 'opening'}
                onClick={() => setLocalGamePhase(phase.value)}
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
    </ChessGameModal>
  );
};

export default TrainingModal;
