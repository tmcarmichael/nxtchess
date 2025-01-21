import { useNavigate } from '@solidjs/router';
import { createSignal, Show } from 'solid-js';
import styles from './SiteHeader.module.css';
import PlayModal from '../PlayModal/PlayModal';

const SiteHeader = (props: { children?: any }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const handleStartGame = (timeControl: number, difficulty: string) => {
    navigate('/game', { state: { timeControl, difficulty } });
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
            <button class={styles.button} onClick={() => setIsModalOpen(true)}>
              Play
            </button>
            <button class={styles.button} onClick={() => alert('Tools placeholder')}>
              Tools
            </button>
            <button class={styles.button} onClick={() => alert('Puzzles placeholder')}>
              Puzzles
            </button>
            <button class={styles.button} onClick={() => alert('Sign In placeholder')}>
              Sign In
            </button>
          </div>
        </div>
      </header>

      <Show when={isModalOpen()}>
        <PlayModal onClose={() => setIsModalOpen(false)} onStartGame={handleStartGame} />
      </Show>

      <main class={styles.mainContent}>{props.children}</main>
    </>
  );
};

export default SiteHeader;
