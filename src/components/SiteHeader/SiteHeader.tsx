import { useNavigate } from '@solidjs/router';
import { createSignal, Show } from 'solid-js';
import styles from './SiteHeader.module.css';
import PlayModal from '../modals/PlayModal/PlayModal';

type NavItem = {
  label: string;
  action?: (setModal: (open: boolean) => void) => void;
  tooltip?: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Play',
    action: (setModal: (open: boolean) => void) => setModal(true),
  },
  {
    label: 'Tools',
    tooltip: 'Tools and game analysis coming soon.',
  },
  {
    label: 'Puzzles',
    tooltip: 'Puzzles and challenges coming soon.',
  },
  {
    label: 'Database',
    tooltip: 'Database with recent tournament games coming soon.',
  },
  {
    label: 'Sign In',
    tooltip: 'Sign In with Google OAuth coming soon.',
  },
];

const SiteHeader = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = createSignal(false);

  return (
    <>
      <header class={styles.header}>
        <div class={styles.titleAndPanel}>
          <h1 class={styles.title} onClick={() => navigate('/')}>
            nxtchess
          </h1>
          <div class={styles.buttonPanel}>
            {NAV_ITEMS.map((item) => (
              <button
                class={`${styles.button} ${item.tooltip ? styles.tooltip : ''}`}
                {...(item.tooltip ? { 'data-tooltip': item.tooltip } : {})}
                onClick={() => item.action?.(setIsModalOpen)}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>
      <Show when={isModalOpen()}>
        <PlayModal onClose={() => setIsModalOpen(false)} />
      </Show>
    </>
  );
};

export default SiteHeader;
