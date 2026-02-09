import { createEffect, createSignal, on, onCleanup, Show, type ParentComponent } from 'solid-js';
import { usePlayGame } from '../../../store/game/PlayGameContext';
import ButtonPanel from '../../game/ButtonPanel/ButtonPanel';
import GameInfoPanel from '../../game/GameInfoPanel/GameInfoPanel';
import GamePanelButton from '../../game/GamePanelButton/GamePanelButton';
import styles from './PlayControlPanel.module.css';

const RECONNECT_GRACE_SECONDS = 20;

const PlayControlPanel: ParentComponent = () => {
  const { chess, ui, engine, actions, derived } = usePlayGame();

  const [countdown, setCountdown] = createSignal(0);
  let countdownInterval: ReturnType<typeof setInterval> | undefined;

  const clearCountdown = () => {
    if (countdownInterval !== undefined) {
      clearInterval(countdownInterval);
      countdownInterval = undefined;
    }
    setCountdown(0);
  };

  createEffect(
    on(
      () => ui.state.opponentDisconnected,
      (disconnected) => {
        clearCountdown();
        if (disconnected) {
          setCountdown(RECONNECT_GRACE_SECONDS);
          countdownInterval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearCountdown();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    )
  );

  onCleanup(clearCountdown);

  const handleResign = () => {
    if (!derived.isPlaying()) return;
    actions.resign();
  };

  return (
    <div>
      <Show when={ui.state.opponentDisconnected}>
        <div class={styles.disconnectBanner}>
          <span>Opponent disconnected</span>
          <span class={styles.disconnectCountdown}>{countdown()}s</span>
        </div>
      </Show>
      <div class={styles.playControlPanel}>
        <ButtonPanel>
          <GamePanelButton onClick={handleResign} disabled={!derived.isPlaying()}>
            <span>Resign</span>
          </GamePanelButton>
          <GamePanelButton onClick={actions.flipBoard}>
            <span>Flip Board</span>
          </GamePanelButton>
          <GamePanelButton onClick={actions.takeBack} disabled={!derived.isPlaying()}>
            <span>Take Back</span>
          </GamePanelButton>
        </ButtonPanel>
        <GameInfoPanel
          playerColor={chess.state.playerColor}
          difficulty={derived.isMultiplayer() ? undefined : engine.state.difficulty}
          material={derived.material}
          capturedWhite={chess.state.capturedWhite}
          capturedBlack={chess.state.capturedBlack}
        />
      </div>
    </div>
  );
};

export default PlayControlPanel;
