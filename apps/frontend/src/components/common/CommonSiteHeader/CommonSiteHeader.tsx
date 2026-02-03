import { useNavigate, useLocation } from '@solidjs/router';
import { createSignal, Show, For, createEffect, type ParentComponent } from 'solid-js';
import { useUserStore } from '../../../store/user/UserContext';
import PlayModal from '../../play/PlayModal/PlayModal';
import PuzzleModal from '../../puzzle/PuzzleModal/PuzzleModal';
import TrainingModal from '../../training/TrainingModal/TrainingModal';
import { getProfileIconAsset } from '../../user/ProfileIconPicker/ProfileIconPicker';
import SignInModal from '../../user/UserSignInModal/UserSignInModal';
import CommonMobileMenu from '../CommonMobileMenu/CommonMobileMenu';
import CommonSettingsDropdown from '../CommonSettingsDropdown/CommonSettingsDropdown';
import styles from './CommonSiteHeader.module.css';

export type NavItem = {
  label: string;
  route?: string;
  showPlayModal?: boolean;
  showTrainingModal?: boolean;
  showPuzzleModal?: boolean;
  tooltip?: string;
  variant?: 'primary' | 'upcoming';
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Play', showPlayModal: true, variant: 'primary' },
  { label: 'Train', showTrainingModal: true, variant: 'primary' },
  { label: 'Analyze', route: '/analyze', variant: 'primary' },
  { label: 'Puzzles', showPuzzleModal: true, variant: 'primary' },
  { label: 'Tools', tooltip: 'Coming soon', variant: 'upcoming' },
];

const CommonSiteHeader: ParentComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userState, userActions] = useUserStore();
  const [showPlayModal, setShowPlayModal] = createSignal(false);
  const [showSignInModal, setShowSignInModal] = createSignal(false);
  const [showTrainingModal, setShowTrainingModal] = createSignal(false);
  const [showPuzzleModal, setShowPuzzleModal] = createSignal(false);
  const [showMobileMenu, setShowMobileMenu] = createSignal(false);

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
                  [styles.navItemPrimary]: item.variant === 'primary',
                  [styles.navItemUpcoming]: item.variant === 'upcoming',
                  [styles.navItemTooltip]: !!item.tooltip,
                }}
                data-tooltip={item.tooltip ?? undefined}
                onClick={() => {
                  if (item.route) {
                    navigate(
                      item.route,
                      location.pathname === item.route
                        ? { state: { reset: Date.now() } }
                        : undefined
                    );
                    return;
                  }
                  if (item.showPlayModal) {
                    setShowPlayModal(true);
                  }
                  if (item.showTrainingModal) {
                    setShowTrainingModal(true);
                  }
                  if (item.showPuzzleModal) {
                    setShowPuzzleModal(true);
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
          <CommonSettingsDropdown />
          <button
            class={styles.mobileMenuButton}
            onClick={() => setShowMobileMenu(true)}
            aria-label="Open menu"
          >
            <div class={styles.hamburgerIcon}>
              <span />
              <span />
              <span />
            </div>
          </button>
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
      <Show when={showPuzzleModal()}>
        <PuzzleModal onClose={() => setShowPuzzleModal(false)} />
      </Show>
      <Show when={showMobileMenu()}>
        <CommonMobileMenu
          onClose={() => setShowMobileMenu(false)}
          onShowPlayModal={() => {
            setShowMobileMenu(false);
            setShowPlayModal(true);
          }}
          onShowTrainingModal={() => {
            setShowMobileMenu(false);
            setShowTrainingModal(true);
          }}
          onShowPuzzleModal={() => {
            setShowMobileMenu(false);
            setShowPuzzleModal(true);
          }}
          onShowSignInModal={() => {
            setShowMobileMenu(false);
            setShowSignInModal(true);
          }}
          onSignOut={async () => {
            setShowMobileMenu(false);
            await handleSignOut();
          }}
        />
      </Show>
    </>
  );
};

export default CommonSiteHeader;
