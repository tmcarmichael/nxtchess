import { useNavigate } from '@solidjs/router';
import { createSignal, For, type Component } from 'solid-js';
import { preferences } from '../../../services/preferences/PreferencesService';
import {
  DEFAULT_TIME_CONTROL,
  findTimeControl,
  type TimeControlOption,
} from '../../../shared/config/timeControls';
import { usePlayGameOptional } from '../../../store/game/PlayGameContext';
import { type Side, type SideSelection, type StartGameOptions } from '../../../types/game';
import ChessGameModal from '../../chess/ChessGameModal/ChessGameModal';
import ChessSideSelector from '../../chess/ChessSideSelector/ChessSideSelector';
import TimeControlGrid from '../../chess/TimeControlGrid/TimeControlGrid';
import styles from './PlayAIModal.module.css';

const DIFFICULTY_OPTIONS = [
  { level: 1, label: 'Beginner', elo: 250 },
  { level: 2, label: 'Easy', elo: 500 },
  { level: 4, label: 'Medium', elo: 900 },
  { level: 6, label: 'Hard', elo: 1100 },
  { level: 8, label: 'Expert', elo: 1700 },
  { level: 10, label: 'Grandmaster', elo: 2400 },
];

interface PlayAIModalProps {
  onClose: () => void;
}

const PlayAIModal: Component<PlayAIModalProps> = (props) => {
  const gameContext = usePlayGameOptional();
  const navigate = useNavigate();

  const savedPrefs = preferences.get();
  const savedTimeControl =
    findTimeControl(savedPrefs.lastTimeMinutes, savedPrefs.lastTimeIncrement) ??
    DEFAULT_TIME_CONTROL;
  const safeDifficultyLevel = DIFFICULTY_OPTIONS.find(
    (d) => d.level === savedPrefs.lastDifficultyLevel
  )
    ? savedPrefs.lastDifficultyLevel
    : 4;

  const [timeControl, setTimeControl] = createSignal<TimeControlOption>(savedTimeControl);
  const [difficultyLevel, setDifficultyLevel] = createSignal(safeDifficultyLevel);
  const [localPlayerColor, setLocalPlayerColor] = createSignal<SideSelection>(
    savedPrefs.lastPlayerColor
  );

  const resolveSide = (selection: SideSelection): Side =>
    selection === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : selection;

  const handleStartGame = () => {
    const tc = timeControl();
    const selectedLevel = difficultyLevel();
    const chosenSide = resolveSide(localPlayerColor());

    preferences.set({
      lastTimeMinutes: tc.minutes,
      lastTimeIncrement: tc.increment,
      lastDifficultyLevel: selectedLevel,
      lastPlayerColor: localPlayerColor(),
    });

    const playGameConfig: StartGameOptions = {
      side: chosenSide,
      mode: 'play',
      newTimeControl: tc.minutes,
      newIncrement: tc.increment,
      newDifficultyLevel: selectedLevel,
    };

    if (gameContext) {
      gameContext.actions.startNewGame(playGameConfig);
      navigate('/play', { replace: true });
    } else {
      navigate('/play', { replace: true, state: { quickPlay: playGameConfig } });
    }

    props.onClose();
  };

  return (
    <ChessGameModal title="vs Computer" onClose={props.onClose}>
      <div class={styles.settingRow}>
        <label class={styles.settingLabel}>Time Control:</label>
        <TimeControlGrid selected={timeControl} onSelect={setTimeControl} />
      </div>

      <div class={styles.settingRow}>
        <label class={styles.settingLabel}>Difficulty:</label>
        <div class={styles.difficultyGrid}>
          <For each={DIFFICULTY_OPTIONS}>
            {(option) => (
              <button
                class={styles.difficultyButton}
                classList={{
                  [styles.difficultyButtonActive]: difficultyLevel() === option.level,
                }}
                onClick={() => setDifficultyLevel(option.level)}
              >
                {option.label}
              </button>
            )}
          </For>
        </div>
      </div>

      <div class={styles.settingRow}>
        <label class={styles.settingLabel}>Play As:</label>
        <ChessSideSelector selectedSide={localPlayerColor} onSideChange={setLocalPlayerColor} />
      </div>

      <div class={styles.modalActions}>
        <button class={styles.startButton} onClick={handleStartGame}>
          Start Game
        </button>
      </div>
    </ChessGameModal>
  );
};

export default PlayAIModal;
