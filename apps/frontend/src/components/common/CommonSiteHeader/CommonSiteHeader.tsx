import { createSignal, Show, For, createEffect, ParentComponent } from 'solid-js';
import { useNavigate } from '@solidjs/router';

import { useAuthStore } from '../../../store/AuthContext';
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

const CommonSiteHeader: ParentComponent = () => {
  const navigate = useNavigate();
  const [authState, authActions] = useAuthStore();
  const [showPlayModal, setShowPlayModal] = createSignal(false);
  const [showSignInModal, setShowSignInModal] = createSignal(false);

  const navAPI = {
    setShowPlayModal,
  };

  createEffect(() => {
    authActions.checkUserStatus(navigate);
  });

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
        <div class={styles.headerRight}>
          <Show
            when={authState.isLoggedIn}
            fallback={<span onClick={() => setShowSignInModal(true)}>Sign In</span>}
          >
            <span onClick={() => navigate(`/profile/${authState.username}`)}>
              {authState.username}
            </span>
          </Show>
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
