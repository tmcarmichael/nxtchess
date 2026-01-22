import { useNavigate } from '@solidjs/router';
import { createSignal, Show, For, createEffect, type ParentComponent } from 'solid-js';
import { useUserStore } from '../../../store/user/UserContext';
import PlayModal from '../../play/PlayModal/PlayModal';
import TrainingModal from '../../training/TrainingModal/TrainingModal';
import { getProfileIconAsset } from '../../user/ProfileIconPicker/ProfileIconPicker';
import SignInModal from '../../user/UserSignInModal/UserSignInModal';
import styles from './CommonSiteHeader.module.css';

export type NavItem = {
  label: string;
  route?: string;
  showPlayModal?: boolean;
  showTrainingModal?: boolean;
  tooltip?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Play', showPlayModal: true },
  { label: 'Training', showTrainingModal: true },
  { label: 'Tools', tooltip: 'Tools and game analysis coming soon.' },
  { label: 'Database', tooltip: 'Database with recent tournament games coming soon.' },
];

const CommonSiteHeader: ParentComponent = () => {
  const navigate = useNavigate();
  const [userState, userActions] = useUserStore();
  const [showPlayModal, setShowPlayModal] = createSignal(false);
  const [showSignInModal, setShowSignInModal] = createSignal(false);
  const [showTrainingModal, setShowTrainingModal] = createSignal(false);

  createEffect(() => {
    userActions.checkUserStatus(navigate);
  });

  const handleSignOut = async () => {
    await userActions.logout();
    navigate('/');
  };

  return (
    <>
      <header class={styles.headerRoot}>
        <div class={styles.headerLeft} onClick={() => navigate('/')}>
          NxtChess
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
                onClick={() => {
                  if (item.route) {
                    navigate(item.route);
                  }
                  if (item.showPlayModal) {
                    setShowPlayModal(true);
                  }
                  if (item.showTrainingModal) {
                    setShowTrainingModal(true);
                  }
                }}
              >
                {item.label}
              </span>
            )}
          </For>
        </div>
        <div class={styles.headerRight}>
          <Show
            when={userState.isLoggedIn}
            fallback={
              <span class={styles.signInButton} onClick={() => setShowSignInModal(true)}>
                Sign In
              </span>
            }
          >
            <Show when={userState.username}>
              <div
                class={styles.userSection}
                onClick={() => navigate(`/profile/${userState.username}`)}
              >
                <img
                  src={getProfileIconAsset(userState.profileIcon)}
                  alt="Profile icon"
                  class={styles.headerProfileIcon}
                />
                <span class={styles.usernameText}>{userState.username}</span>
              </div>
            </Show>
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
      <Show when={showTrainingModal()}>
        <TrainingModal onClose={() => setShowTrainingModal(false)} />
      </Show>
    </>
  );
};

export default CommonSiteHeader;
