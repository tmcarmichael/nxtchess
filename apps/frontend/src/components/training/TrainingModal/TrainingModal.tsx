import { useNavigate } from '@solidjs/router';
import { createSignal, Show, For, type ParentComponent, splitProps } from 'solid-js';
import { useTrainingGameOptional } from '../../../store/game/TrainingGameContext';
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

interface EndgameThemeOption {
  value: string;
  label: string;
}

// Difficulty levels with labels and ELO values (same as PlayModal)
const DIFFICULTY_OPTIONS = [
  { level: 1, label: 'Beginner', elo: 250 },
  { level: 2, label: 'Easy', elo: 500 },
  { level: 4, label: 'Medium', elo: 900 },
  { level: 6, label: 'Hard', elo: 1100 },
  { level: 8, label: 'Expert', elo: 1700 },
  { level: 10, label: 'Grandmaster', elo: 2400 },
];

const OPPONENT_STYLES: AIPlayStyleOption[] = [
  { value: 'aggressive', label: 'Aggressive', icon: '/assets/trainingModeAggressive.svg' },
  { value: 'defensive', label: 'Defensive', icon: '/assets/trainingModeDefensive.svg' },
  { value: 'balanced', label: 'Balanced', icon: '/assets/trainingModeBalanced.svg' },
  { value: 'random', label: 'Random', icon: '/assets/trainingModeRandom.svg' },
  { value: 'positional', label: 'Positional', icon: '/assets/trainingModePositional.svg' },
];

const GAME_PHASES: GamePhaseOption[] = [
  { value: 'opening', label: 'Opening' },
  { value: 'middlegame', label: 'Middlegame' },
  { value: 'endgame', label: 'Endgame' },
];

const ENDGAME_THEMES: EndgameThemeOption[] = [
  { value: '', label: 'Any' },
  { value: 'basicMate', label: 'Basic Mates' },
  { value: 'pawnEndgame', label: 'Pawn' },
  { value: 'rookEndgame', label: 'Rook' },
  { value: 'bishopEndgame', label: 'Bishop' },
  { value: 'knightEndgame', label: 'Knight' },
  { value: 'queenEndgame', label: 'Queen' },
];

const TrainingModal: ParentComponent<TrainingModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose']);
  const navigate = useNavigate();
  const gameContext = useTrainingGameOptional();

  const [localRatedMode, setLocalRatedMode] = createSignal<RatedMode>('casual');
  const [localDifficulty, setLocalDifficulty] = createSignal<number>(4);
  const [localAIPlayStyle, localSetAIPlayStyle] = createSignal<AIPlayStyle>('balanced');
  const [localGamePhase, setLocalGamePhase] = createSignal<GamePhase>('opening');
  const [localPlayerColor, setLocalPlayerColor] = createSignal<Side>('w');
  const [localEndgameTheme, setLocalEndgameTheme] = createSignal<string>('');

  const handleStartTraining = () => {
    const trainingGameConfig: StartGameOptions = {
      side: localPlayerColor(),
      mode: 'training',
      newDifficultyLevel: localDifficulty(),
      trainingIsRated: localRatedMode() === 'rated',
      trainingAIPlayStyle: localAIPlayStyle(),
      trainingGamePhase: localGamePhase(),
      trainingTheme: localEndgameTheme() || undefined,
    };

    if (gameContext) {
      // Inside provider - call action directly
      gameContext.actions.startNewGame(trainingGameConfig);
      navigate('/training', { replace: true });
    } else {
      // Outside provider (header modal) - navigate with state
      navigate('/training', { replace: true, state: { quickStart: trainingGameConfig } });
    }

    local.onClose();
  };

  return (
    <ChessGameModal title="Train" onClose={local.onClose}>
      {/* Rated/Casual Toggle */}
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

      {/* Game Phase - second after rated/casual */}
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
                disabled={phase.value === 'middlegame'}
                onClick={() => setLocalGamePhase(phase.value)}
              >
                {phase.label}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Difficulty - third (common to both modes) */}
      <Show when={localRatedMode() === 'casual'}>
        <div class={styles.settingRow}>
          <label class={styles.label}>Difficulty:</label>
          <div class={styles.optionGrid}>
            <For each={DIFFICULTY_OPTIONS}>
              {(option) => (
                <button
                  class={styles.optionButton}
                  classList={{ [styles.optionButtonActive]: localDifficulty() === option.level }}
                  onClick={() => setLocalDifficulty(option.level)}
                >
                  {option.label}
                </button>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Play As - fourth (common to both modes) */}
      <div class={styles.settingRow}>
        <label class={styles.label}>Play As:</label>
        <ChessSideSelector selectedSide={localPlayerColor} onSideChange={setLocalPlayerColor} />
      </div>

      {/* Mode-specific option (last position) */}
      {/* Opponent Style - for opening/middlegame */}
      <Show when={localGamePhase() !== 'endgame'}>
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
      </Show>

      {/* Endgame Type - for endgame */}
      <Show when={localGamePhase() === 'endgame'}>
        <div class={styles.settingRow}>
          <label class={styles.label}>Endgame Type:</label>
          <div class={styles.optionGrid}>
            <For each={ENDGAME_THEMES}>
              {(theme) => (
                <button
                  class={styles.optionButton}
                  classList={{ [styles.optionButtonActive]: localEndgameTheme() === theme.value }}
                  onClick={() => setLocalEndgameTheme(theme.value)}
                >
                  {theme.label}
                </button>
              )}
            </For>
          </div>
        </div>
      </Show>

      <button class={styles.startButton} onClick={handleStartTraining}>
        Start Game
      </button>
    </ChessGameModal>
  );
};

export default TrainingModal;
