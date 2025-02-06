import { useNavigate } from '@solidjs/router';
import { createSignal, Show } from 'solid-js';
import styles from './SiteHeader.module.css';
import PlayModal from '../modals/PlayModal/PlayModal';

type SiteHeaderProps = {
  children?: any;
};

const NAV_ITEMS = [
  { label: 'Play', action: (setModal: (open: boolean) => void) => setModal(true) },
  { label: 'Tools', action: () => alert('Tools placeholder') },
  { label: 'Puzzles', action: () => alert('Puzzles placeholder') },
  { label: 'Database', action: () => alert('Database placeholder') },
  { label: 'Sign In', action: () => alert('Sign In placeholder') },
] as const;

const SiteHeader = (props: SiteHeaderProps) => {
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
            {NAV_ITEMS.map(item => (
              <button 
                class={styles.button} 
                onClick={() => item.action(setIsModalOpen)}
              >
                <span>{item.label}</span>
              </button>
            ))}
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
