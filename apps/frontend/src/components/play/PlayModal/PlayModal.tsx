import { useNavigate } from '@solidjs/router';
import { createSignal, splitProps, type Component, Show, For } from 'solid-js';
import { preferences } from '../../../services/preferences/PreferencesService';
import { usePlayGameOptional } from '../../../store/game/PlayGameContext';
import { type Side, type StartGameOptions, type MultiplayerGameOptions } from '../../../types/game';
import ChessGameModal from '../../chess/ChessGameModal/ChessGameModal';
import ChessSideSelector from '../../chess/ChessSideSelector/ChessSideSelector';
import styles from './PlayModal.module.css';

type OpponentType = 'ai' | 'human';
type MultiplayerMode = 'create' | 'join';

// Time control options (in minutes)
const TIME_OPTIONS = [1, 3, 5, 10, 15, 30];

// Simplified time controls for human games (in minutes)
const HUMAN_TIME_OPTIONS = [3, 5, 10, 15];

// Difficulty levels with labels and ELO values
const DIFFICULTY_OPTIONS = [
  { level: 1, label: 'Beginner', elo: 250 },
  { level: 2, label: 'Easy', elo: 500 },
  { level: 4, label: 'Medium', elo: 900 },
  { level: 6, label: 'Hard', elo: 1100 },
  { level: 8, label: 'Expert', elo: 1700 },
  { level: 10, label: 'Grandmaster', elo: 2400 },
];

interface PlayModalProps {
  onClose: () => void;
}

const PlayModal: Component<PlayModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose']);
  const gameContext = usePlayGameOptional();
  const navigate = useNavigate();

  // Load saved preferences with validation
  const savedPrefs = preferences.get();
  const safeTimeMinutes = TIME_OPTIONS.includes(savedPrefs.lastTimeMinutes)
    ? savedPrefs.lastTimeMinutes
    : 5;
  const safeDifficultyLevel = DIFFICULTY_OPTIONS.find(
    (d) => d.level === savedPrefs.lastDifficultyLevel
  )
    ? savedPrefs.lastDifficultyLevel
    : 4;

  const [opponentType, setOpponentType] = createSignal<OpponentType>('ai');
  const [multiplayerMode, setMultiplayerMode] = createSignal<MultiplayerMode>('create');
  const [timeMinutes, setTimeMinutes] = createSignal(safeTimeMinutes);
  const [humanTimeMinutes, setHumanTimeMinutes] = createSignal(5);
  const [difficultyLevel, setDifficultyLevel] = createSignal(safeDifficultyLevel);
  const [localPlayerColor, setLocalPlayerColor] = createSignal<Side>(savedPrefs.lastPlayerColor);
  const [joinGameId, setJoinGameId] = createSignal('');
  const [joinError, setJoinError] = createSignal<string | null>(null);

  const handleStartGame = () => {
    const opponent = opponentType();

    if (opponent === 'human') {
      const mode = multiplayerMode();

      if (mode === 'join') {
        const gameId = joinGameId().trim();
        if (!gameId) {
          setJoinError('Please enter a game ID');
          return;
        }
        // Navigate to game URL - PlayContainer will auto-join
        navigate(`/play/${gameId}`, { replace: true });
      } else {
        // Create new multiplayer game
        const multiplayerConfig: MultiplayerGameOptions = {
          side: localPlayerColor(),
          mode: 'play',
          newTimeControl: humanTimeMinutes(),
        };

        if (gameContext) {
          // Inside provider - call action directly
          gameContext.actions.startMultiplayerGame(multiplayerConfig);
          navigate('/play', { replace: true });
        } else {
          // Outside provider (header modal) - navigate with state
          navigate('/play', { replace: true, state: { multiplayerCreate: multiplayerConfig } });
        }
      }
    } else {
      // AI game
      const selectedTime = timeMinutes();
      const selectedLevel = difficultyLevel();
      const chosenSide = localPlayerColor();

      // Save preferences for next session
      preferences.set({
        lastTimeMinutes: selectedTime,
        lastDifficultyLevel: selectedLevel,
        lastPlayerColor: chosenSide,
      });

      const playGameConfig: StartGameOptions = {
        side: chosenSide,
        mode: 'play',
        newTimeControl: selectedTime,
        newDifficultyLevel: selectedLevel,
      };

      if (gameContext) {
        // Inside provider - call action directly
        gameContext.actions.startNewGame(playGameConfig);
        navigate('/play', { replace: true });
      } else {
        // Outside provider (header modal) - navigate with state
        navigate('/play', { replace: true, state: { quickPlay: playGameConfig } });
      }
    }

    local.onClose();
  };

  const getModalTitle = () => {
    if (opponentType() === 'ai') return 'Play Against Computer';
    return multiplayerMode() === 'create' ? 'Create Online Game' : 'Join Online Game';
  };

  const getButtonText = () => {
    if (opponentType() === 'ai') return 'Start Game';
    return multiplayerMode() === 'create' ? 'Create Game' : 'Join Game';
  };

  return (
    <ChessGameModal title={getModalTitle()} onClose={local.onClose}>
      {/* Opponent Type Selector */}
      <div class={styles.settingRow}>
        <label class={styles.label}>Opponent:</label>
        <div class={styles.opponentSelector}>
          <button
            class={styles.opponentButton}
            classList={{ [styles.opponentButtonActive]: opponentType() === 'ai' }}
            onClick={() => setOpponentType('ai')}
          >
            Computer
          </button>
          <button
            class={styles.opponentButton}
            classList={{ [styles.opponentButtonActive]: opponentType() === 'human' }}
            onClick={() => setOpponentType('human')}
          >
            Human
          </button>
        </div>
      </div>

      {/* Human: Create/Join selector */}
      <Show when={opponentType() === 'human'}>
        <div class={styles.settingRow}>
          <div class={styles.modeSelector}>
            <button
              class={styles.modeButton}
              classList={{ [styles.modeButtonActive]: multiplayerMode() === 'create' }}
              onClick={() => {
                setMultiplayerMode('create');
                setJoinError(null);
              }}
            >
              Create Game
            </button>
            <button
              class={styles.modeButton}
              classList={{ [styles.modeButtonActive]: multiplayerMode() === 'join' }}
              onClick={() => {
                setMultiplayerMode('join');
                setJoinError(null);
              }}
            >
              Join Game
            </button>
          </div>
        </div>
      </Show>

      {/* Join Game: Game ID input */}
      <Show when={opponentType() === 'human' && multiplayerMode() === 'join'}>
        <div class={styles.settingRow}>
          <label class={styles.label}>Game ID:</label>
          <input
            type="text"
            class={styles.gameIdInput}
            placeholder="Enter game ID"
            value={joinGameId()}
            onInput={(e) => {
              setJoinGameId(e.currentTarget.value);
              setJoinError(null);
            }}
          />
          <Show when={joinError()}>
            <p class={styles.errorText}>{joinError()}</p>
          </Show>
        </div>
      </Show>

      {/* AI: Time Control buttons */}
      <Show when={opponentType() === 'ai'}>
        <div class={styles.settingRow}>
          <label class={styles.label}>Time Control:</label>
          <div class={styles.optionGrid}>
            <For each={TIME_OPTIONS}>
              {(minutes) => (
                <button
                  class={styles.optionButton}
                  classList={{ [styles.optionButtonActive]: timeMinutes() === minutes }}
                  onClick={() => setTimeMinutes(minutes)}
                >
                  {minutes} min
                </button>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Human Create: Simplified time control buttons */}
      <Show when={opponentType() === 'human' && multiplayerMode() === 'create'}>
        <div class={styles.settingRow}>
          <label class={styles.label}>Time Control:</label>
          <div class={styles.timeButtonGroup}>
            <For each={HUMAN_TIME_OPTIONS}>
              {(minutes) => (
                <button
                  class={styles.timeButton}
                  classList={{ [styles.timeButtonActive]: humanTimeMinutes() === minutes }}
                  onClick={() => setHumanTimeMinutes(minutes)}
                >
                  {minutes} min
                </button>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* AI: Difficulty buttons */}
      <Show when={opponentType() === 'ai'}>
        <div class={styles.settingRow}>
          <label class={styles.label}>Difficulty:</label>
          <div class={styles.optionGrid}>
            <For each={DIFFICULTY_OPTIONS}>
              {(option) => (
                <button
                  class={styles.optionButton}
                  classList={{ [styles.optionButtonActive]: difficultyLevel() === option.level }}
                  onClick={() => setDifficultyLevel(option.level)}
                >
                  {option.label}
                </button>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Create game: Side Selector */}
      <Show when={opponentType() === 'ai' || multiplayerMode() === 'create'}>
        <div class={styles.settingRow}>
          <label class={styles.label}>Play As:</label>
          <ChessSideSelector selectedSide={localPlayerColor} onSideChange={setLocalPlayerColor} />
        </div>
      </Show>

      <div class={styles.modalActions}>
        <button class={styles.startButton} onClick={handleStartGame}>
          {getButtonText()}
        </button>
      </div>
    </ChessGameModal>
  );
};

export default PlayModal;
