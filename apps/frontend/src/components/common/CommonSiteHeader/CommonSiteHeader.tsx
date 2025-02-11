import { useNavigate } from '@solidjs/router';
import { createSignal, Show, For } from 'solid-js';
import PlayModal from '../../modals/PlayModal/PlayModal';
import SignInModal from '../../modals/SignInModal/SignInModal';
import styles from './CommonSiteHeader.module.css';

type ModalSetters = {
  setShowPlayModal: (open: boolean) => void;
  setShowSignInModal: (open: boolean) => void;
};

type NavItem = {
  label: string;
  tooltip?: string;
  action?: (setters: ModalSetters) => void;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Play',
    action: ({ setShowPlayModal }) => setShowPlayModal(true),
  },
  {
    label: 'Tools',
    tooltip: 'Tools and game analysis coming soon.',
  },
  {
    label: 'Training',
    tooltip: 'Training mode with customizable AI personality coming soon.',
  },
  {
    label: 'Database',
    tooltip: 'Database with recent tournament games coming soon.',
  },
  {
    label: 'Sign In',
    action: ({ setShowSignInModal }) => setShowSignInModal(true),
  },
];

const CommonSiteHeader = () => {
  const navigate = useNavigate();
  const [showPlayModal, setShowPlayModal] = createSignal(false);
  const [showSignInModal, setShowSignInModal] = createSignal(false);

  const modalSetters: ModalSetters = {
    setShowPlayModal,
    setShowSignInModal,
  };

  const renderNavItems = (items: NavItem[]) => (
    <For each={items}>
      {(item) => (
        <button
          class={`${styles.button} ${item.tooltip ? styles.tooltip : ''}`}
          {...(item.tooltip ? { 'data-tooltip': item.tooltip } : {})}
          onClick={() => {
            item.action?.(modalSetters);
          }}
        >
          <span>{item.label}</span>
        </button>
      )}
    </For>
  );

  return (
    <>
      <header class={styles.header}>
        <div class={styles.titleAndPanel}>
          <h1 class={styles.title} onClick={() => navigate('/')}>
            nxtchess
          </h1>
          <div class={styles.buttonPanel}>{renderNavItems(NAV_ITEMS)}</div>
        </div>
      </header>
      <Show when={showPlayModal()}>
        <PlayModal onClose={() => setShowPlayModal(false)} />
      </Show>
      <Show when={showSignInModal()}>
        <SignInModal onClose={() => setShowSignInModal(false)} />
      </Show>
    </>
  );
};

export default CommonSiteHeader;
