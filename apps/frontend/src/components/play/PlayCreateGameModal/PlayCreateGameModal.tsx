import { useNavigate } from '@solidjs/router';
import { createSignal, Show, type Component } from 'solid-js';
import { DEFAULT_TIME_CONTROL, type TimeControlOption } from '../../../shared/config/timeControls';
import { usePlayGameOptional } from '../../../store/game/PlayGameContext';
import { useUserStore } from '../../../store/user/UserContext';
import { type Side, type SideSelection, type MultiplayerGameOptions } from '../../../types/game';
import ChessGameModal from '../../chess/ChessGameModal/ChessGameModal';
import ChessSideSelector from '../../chess/ChessSideSelector/ChessSideSelector';
import TimeControlGrid from '../../chess/TimeControlGrid/TimeControlGrid';
import styles from './PlayCreateGameModal.module.css';

interface PlayCreateGameModalProps {
  onClose: () => void;
}

const PlayCreateGameModal: Component<PlayCreateGameModalProps> = (props) => {
  const gameContext = usePlayGameOptional();
  const navigate = useNavigate();
  const [userState] = useUserStore();

  const [timeControl, setTimeControl] = createSignal<TimeControlOption>(DEFAULT_TIME_CONTROL);
  const [localPlayerColor, setLocalPlayerColor] = createSignal<SideSelection>('random');
  const [rated, setRated] = createSignal(false);

  const resolveSide = (selection: SideSelection): Side =>
    selection === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : selection;

  const handleCreate = () => {
    const tc = timeControl();
    const config: MultiplayerGameOptions = {
      side: resolveSide(localPlayerColor()),
      mode: 'play',
      newTimeControl: tc.minutes,
      increment: tc.increment,
      rated: rated(),
    };

    if (gameContext) {
      gameContext.actions.startMultiplayerGame(config);
      navigate('/play', { replace: true });
    } else {
      navigate('/play', { replace: true, state: { multiplayerCreate: config } });
    }

    props.onClose();
  };

  return (
    <ChessGameModal title="Create Game" onClose={props.onClose}>
      <div class={styles.settingRow}>
        <label class={styles.settingLabel}>Time Control:</label>
        <TimeControlGrid selected={timeControl} onSelect={setTimeControl} />
      </div>

      <div class={styles.settingRow}>
        <label class={styles.settingLabel}>Play As:</label>
        <ChessSideSelector selectedSide={localPlayerColor} onSideChange={setLocalPlayerColor} />
      </div>

      <div class={styles.settingRow}>
        <label class={styles.settingLabel}>Game Type:</label>
        <div class={styles.ratedToggle}>
          <button
            class={styles.ratedButton}
            classList={{ [styles.ratedButtonActive]: !rated() }}
            onClick={() => setRated(false)}
          >
            Casual
          </button>
          <button
            class={styles.ratedButton}
            classList={{
              [styles.ratedButtonActive]: rated(),
              [styles.ratedButtonDisabled]: !userState.isLoggedIn,
            }}
            onClick={() => {
              if (userState.isLoggedIn) setRated(true);
            }}
            disabled={!userState.isLoggedIn}
          >
            Rated
          </button>
        </div>
        <Show when={!userState.isLoggedIn}>
          <p class={styles.ratedHint}>Sign in to play rated games</p>
        </Show>
      </div>

      <div class={styles.modalActions}>
        <button class={styles.createButton} onClick={handleCreate}>
          Create Game
        </button>
      </div>
    </ChessGameModal>
  );
};

export default PlayCreateGameModal;
