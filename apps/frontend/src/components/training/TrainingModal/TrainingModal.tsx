import { useNavigate } from '@solidjs/router';
import { createSignal, Show, For, type ParentComponent, splitProps } from 'solid-js';
import { useTrainingGameOptional } from '../../../store/game/TrainingGameContext';
import { type GamePhase, type Side, type StartGameOptions } from '../../../types/game';
import ChessGameModal from '../../chess/ChessGameModal/ChessGameModal';
import ChessSideSelector from '../../chess/ChessSideSelector/ChessSideSelector';
import styles from './TrainingModal.module.css';

interface TrainingModalProps {
  onClose: () => void;
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

  const [localDifficulty, setLocalDifficulty] = createSignal<number>(4);
  const [localGamePhase, setLocalGamePhase] = createSignal<GamePhase>('opening');
  const [localPlayerColor, setLocalPlayerColor] = createSignal<Side>('w');
  const [localEndgameTheme, setLocalEndgameTheme] = createSignal<string>('');

  const handleStartTraining = () => {
    const trainingGameConfig: StartGameOptions = {
      side: localPlayerColor(),
      mode: 'training',
      newDifficultyLevel: localDifficulty(),
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
      {/* Game Phase */}
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

      {/* Difficulty */}
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

      {/* Play As */}
      <div class={styles.settingRow}>
        <label class={styles.label}>Play As:</label>
        <ChessSideSelector selectedSide={localPlayerColor} onSideChange={setLocalPlayerColor} />
      </div>

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
