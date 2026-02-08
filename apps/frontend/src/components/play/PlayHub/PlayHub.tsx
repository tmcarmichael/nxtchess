import { useNavigate } from '@solidjs/router';
import { createSignal, For, onCleanup, onMount, Show, type Component } from 'solid-js';
import { getTimeControlCategory } from '../../../shared/config/timeControls';
import { usePlayGame } from '../../../store/game/PlayGameContext';
import { createLobbyStore } from '../../../store/game/stores/createLobbyStore';
import FloatingPieces from '../../common/FloatingPieces/FloatingPieces';
import PlayAIModal from '../PlayAIModal/PlayAIModal';
import PlayCreateGameModal from '../PlayCreateGameModal/PlayCreateGameModal';
import styles from './PlayHub.module.css';
import type { LobbyGameInfo } from '../../../services/sync/types';

const PlayHub: Component = () => {
  const navigate = useNavigate();
  const { actions, multiplayer } = usePlayGame();
  const lobby = createLobbyStore();

  const [showAIModal, setShowAIModal] = createSignal(false);
  const [showCreateModal, setShowCreateModal] = createSignal(false);
  const [joinLink, setJoinLink] = createSignal('');
  const [joinError, setJoinError] = createSignal<string | null>(null);
  const [isJoining, setIsJoining] = createSignal(false);

  onMount(() => {
    lobby.subscribe();
  });

  onCleanup(() => {
    lobby.unsubscribe();
  });

  const unsubError = multiplayer.on('game:error', () => {
    setIsJoining(false);
  });

  onCleanup(() => {
    unsubError();
  });

  const handleJoinByLink = () => {
    const input = joinLink().trim();
    if (!input) {
      setJoinError('Please enter a game link or ID');
      return;
    }
    const gameId = input.includes('/play/') ? input.split('/play/').pop()! : input;
    if (!gameId) {
      setJoinError('Invalid game link');
      return;
    }
    navigate(`/play/${gameId}`, { replace: true });
  };

  const handleJoinLobbyGame = (game: LobbyGameInfo) => {
    if (isJoining()) return;
    setIsJoining(true);
    actions.joinMultiplayerGame(game.gameId);
  };

  const formatTimeControl = (game: LobbyGameInfo): string => {
    if (!game.timeControl) return 'Untimed';
    const minutes = game.timeControl.initialTime / 60;
    return `${minutes}+${game.timeControl.increment}`;
  };

  const formatCategory = (game: LobbyGameInfo): string => {
    if (!game.timeControl) return '';
    const minutes = game.timeControl.initialTime / 60;
    return getTimeControlCategory(minutes, game.timeControl.increment);
  };

  return (
    <div class={styles.playHub}>
      <FloatingPieces />
      <div class={styles.hubContent}>
        <div class={styles.hubActions}>
          <button class={styles.hubActionButton} onClick={() => setShowAIModal(true)}>
            <span class={styles.hubActionIcon}>&#9822;</span>
            <span class={styles.hubActionLabel}>vs Computer</span>
          </button>
          <button class={styles.hubActionButton} onClick={() => setShowCreateModal(true)}>
            <span class={styles.hubActionIcon}>+</span>
            <span class={styles.hubActionLabel}>Create Game</span>
          </button>
        </div>

        <div class={styles.joinByLink}>
          <input
            type="text"
            class={styles.joinInput}
            placeholder="Paste game link or ID"
            value={joinLink()}
            onInput={(e) => {
              setJoinLink(e.currentTarget.value);
              setJoinError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleJoinByLink();
            }}
          />
          <button class={styles.joinButton} onClick={handleJoinByLink}>
            Join
          </button>
        </div>
        <Show when={joinError()}>
          <p class={styles.joinError}>{joinError()}</p>
        </Show>

        <div class={styles.lobbySection}>
          <h2 class={styles.lobbyTitle}>Open Games</h2>
          <Show
            when={!lobby.state.isLoading}
            fallback={<p class={styles.lobbyEmpty}>Loading...</p>}
          >
            <Show
              when={lobby.state.games.length > 0}
              fallback={<p class={styles.lobbyEmpty}>No open games. Create one!</p>}
            >
              <div class={styles.lobbyList}>
                <For each={lobby.state.games}>
                  {(game) => (
                    <button class={styles.lobbyItem} onClick={() => handleJoinLobbyGame(game)}>
                      <span class={styles.lobbyCreator}>{game.creator}</span>
                      <Show when={game.creatorRating}>
                        <span class={styles.lobbyRating}>({game.creatorRating})</span>
                      </Show>
                      <span class={styles.lobbyTimeControl}>{formatTimeControl(game)}</span>
                      <Show when={game.timeControl}>
                        <span class={styles.lobbyCategory}>{formatCategory(game)}</span>
                      </Show>
                      <span
                        class={styles.lobbyRated}
                        classList={{ [styles.lobbyRatedAccent]: game.rated }}
                      >
                        {game.rated ? 'Rated' : 'Casual'}
                      </span>
                    </button>
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </div>
      </div>

      <Show when={showAIModal()}>
        <PlayAIModal onClose={() => setShowAIModal(false)} />
      </Show>
      <Show when={showCreateModal()}>
        <PlayCreateGameModal onClose={() => setShowCreateModal(false)} />
      </Show>
    </div>
  );
};

export default PlayHub;
