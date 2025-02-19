import { createSignal, Show, For, createEffect, ParentComponent } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useUserStore } from '../../../store/UserContext';
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
  const [userState, userActions] = useUserStore();
  const [showPlayModal, setShowPlayModal] = createSignal(false);
  const [showSignInModal, setShowSignInModal] = createSignal(false);

  createEffect(() => {
    userActions.checkUserStatus(navigate);
  });

  const handleSignOut = () => {
    document.cookie = 'session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    userActions.setIsLoggedIn(false);
    userActions.setUsername('');
    navigate('/');
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
                  [styles.tooltip]: !!item.tooltip,
                }}
                data-tooltip={item.tooltip ?? undefined}
                onClick={() => item.action?.({ setShowPlayModal })}
              >
                {item.label}
              </span>
            )}
          </For>
        </div>
        <div class={styles.headerRight}>
          <Show
            when={userState.isLoggedIn}
            fallback={<span onClick={() => setShowSignInModal(true)}>Sign In</span>}
          >
            <span
              class={styles.usernameText}
              onClick={() => navigate(`/profile/${userState.username}`)}
            >
              {userState.username}
            </span>
            <span class={styles.signOutText} onClick={handleSignOut}>
              Sign Out
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
