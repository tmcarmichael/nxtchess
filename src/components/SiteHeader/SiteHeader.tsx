import { useNavigate } from '@solidjs/router';
import { createSignal, Show } from 'solid-js';
import styles from './SiteHeader.module.css';
import PlayModal from '../modals/PlayModal/PlayModal';

const SiteHeader = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = createSignal(false);

  const handleStartGame = () => {
    navigate('/game', { replace: true });
    setIsModalOpen(false);
  };

  return (
    <>
      <header class={styles.header}>
        <div class={styles.titleAndPanel}>
          <h1 class={styles.title} onClick={() => navigate('/')}>
            nxtchess
          </h1>
          <div class={styles.buttonPanel}>
            <button
              class={`${styles.button} ${styles.playButton}`}
              onClick={() => setIsModalOpen(true)}
            >
              <span>PLAY</span>
            </button>
            <button
              class={`${styles.comingSoonButton} ${styles.tooltip}`}
              data-tooltip="Tools section with game analysis coming soon."
            >
              <span>TOOLS</span>
            </button>
            <button
              class={`${styles.comingSoonButton} ${styles.tooltip}`}
              data-tooltip="Puzzles section with custom difficulty coming soon."
            >
              <span>PUZZLES</span>
            </button>
            <button
              class={`${styles.comingSoonButton} ${styles.tooltip}`}
              data-tooltip="Database section with games and latest tournament games coming soon."
            >
              <span>DATABASE</span>
            </button>
            <button
              class={`${styles.comingSoonButton} ${styles.tooltip}`}
              data-tooltip="Sign in with google OAuth for game history and more coming soon."
            >
              <span>SIGN IN</span>
            </button>
          </div>
        </div>
      </header>
      <Show when={isModalOpen()}>
        <PlayModal onClose={() => setIsModalOpen(false)} onStartGame={handleStartGame} />
      </Show>
    </>
  );
};

export default SiteHeader;
