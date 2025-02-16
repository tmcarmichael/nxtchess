import { createSignal, Show, For } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import PlayModal from '../../modals/PlayModal/PlayModal';
import SignInModal from '../../modals/SignInModal/SignInModal';
import styles from './CommonSiteHeader.module.css';

type NavItem = {
  label: string;
  tooltip?: string;
  action?: (api: { setShowPlayModal: (open: boolean) => void }) => void;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Play',
    action: ({ setShowPlayModal }) => setShowPlayModal(true),
  },
  {
    label: 'Training',
    tooltip: 'Training mode with customizable AI personality coming soon.',
  },
  {
    label: 'Tools',
    tooltip: 'Tools and game analysis coming soon.',
  },
  {
    label: 'Database',
    tooltip: 'Database with recent tournament games coming soon.',
  },
];

export default function CommonSiteHeader() {
  const navigate = useNavigate();

  const [showPlayModal, setShowPlayModal] = createSignal(false);
  const [showSignInModal, setShowSignInModal] = createSignal(false);

  const navAPI = {
    setShowPlayModal,
  };

  return (
    <>
      <header class={styles.headerRoot}>
        <div class={styles.headerLeft} onClick={() => navigate('/')}>
          nxtchess
        </div>
        <div class={styles.headerCenter}>
          <For each={NAV_ITEMS}>
            {(item) => (
              <span
                classList={{
                  [styles.navItem]: true,
                  [styles.tooltip]: Boolean(item.tooltip),
                }}
                data-tooltip={item.tooltip ?? undefined}
                onClick={() => item.action?.(navAPI)}
              >
                {item.label}
              </span>
            )}
          </For>
        </div>
        <div class={styles.headerRight} onClick={() => setShowSignInModal(true)}>
          Sign In
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
}
