import { useNavigate } from '@solidjs/router';
import { createSignal, splitProps, type Component, Show, For } from 'solid-js';
import { preferences } from '../../../services/preferences/PreferencesService';
import { TIME_VALUES_MINUTES } from '../../../shared/config/constants';
import { usePlayGame } from '../../../store/game/PlayGameContext';
import { type Side, type StartGameOptions } from '../../../types/game';
import ChessDifficultySlider from '../../chess/ChessDifficultySlider/ChessDifficultySlider';
import ChessGameModal from '../../chess/ChessGameModal/ChessGameModal';
import ChessSideSelector from '../../chess/ChessSideSelector/ChessSideSelector';
import styles from './PlayModal.module.css';

type OpponentType = 'ai' | 'human';
type MultiplayerMode = 'create' | 'join';

// Simplified time controls for human games (in minutes)
const HUMAN_TIME_OPTIONS = [3, 5, 10, 15];

interface PlayModalProps {
  onClose: () => void;
}

const PlayModal: Component<PlayModalProps> = (props) => {
  const [local] = splitProps(props, ['onClose']);
  const { actions } = usePlayGame();
  const navigate = useNavigate();

  // Load saved preferences with bounds validation
  const savedPrefs = preferences.get();
  const safeTimeIndex = Math.min(
    Math.max(0, savedPrefs.lastTimeIndex),
    TIME_VALUES_MINUTES.length - 1
  );
  const safeDifficultyIndex = Math.min(Math.max(0, savedPrefs.lastDifficultyIndex), 7);

  const [opponentType, setOpponentType] = createSignal<OpponentType>('ai');
  const [multiplayerMode, setMultiplayerMode] = createSignal<MultiplayerMode>('create');
  const [localTimeIndex, setLocalTimeIndex] = createSignal(safeTimeIndex);
  const [humanTimeMinutes, setHumanTimeMinutes] = createSignal(5);
  const [localDifficultyIndex, setLocalDifficultyIndex] = createSignal(safeDifficultyIndex);
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
        // Create new game - start first, then navigate to /play
        // PlayContainer will update URL to /play/:gameId when gameId is received
        actions.startMultiplayerGame({
          side: localPlayerColor(),
          mode: 'play',
          newTimeControl: humanTimeMinutes(),
        });
        navigate('/play', { replace: true });
      }
    } else {
      // AI game (existing flow)
      const selectedTime = TIME_VALUES_MINUTES[localTimeIndex()];
      const selectedLevel = localDifficultyIndex() + 1;
      const chosenSide = localPlayerColor();

      // Save preferences for next session
      preferences.set({
        lastTimeIndex: localTimeIndex(),
        lastDifficultyIndex: localDifficultyIndex(),
        lastPlayerColor: chosenSide,
      });

      const playGameConfig: StartGameOptions = {
        side: chosenSide,
        mode: 'play',
        newTimeControl: selectedTime,
        newDifficultyLevel: selectedLevel,
      };
      navigate('/play', { replace: true });
      actions.startNewGame(playGameConfig);
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

      {/* AI: Time Control slider */}
      <Show when={opponentType() === 'ai'}>
        <div class={styles.settingRow}>
          <label class={styles.rangeSliderLabel}>
            Time Control:&nbsp;&nbsp;&nbsp;{TIME_VALUES_MINUTES[localTimeIndex()]} min
          </label>
          <div class={styles.rangeSliderContainer}>
            <input
              class={styles.rangeSlider}
              type="range"
              min="0"
              max={TIME_VALUES_MINUTES.length - 1}
              step="1"
              value={localTimeIndex()}
              onInput={(e) => setLocalTimeIndex(+e.currentTarget.value)}
            />
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

      {/* AI: Difficulty slider */}
      <Show when={opponentType() === 'ai'}>
        <ChessDifficultySlider
          difficultyIndex={localDifficultyIndex}
          onDifficultyChange={setLocalDifficultyIndex}
        />
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
