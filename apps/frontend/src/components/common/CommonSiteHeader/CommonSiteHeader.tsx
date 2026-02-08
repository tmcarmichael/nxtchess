import { useNavigate, useLocation } from '@solidjs/router';
import { createSignal, Show, For, createEffect, type ParentComponent } from 'solid-js';
import { useUserStore } from '../../../store/user/UserContext';
import PuzzleModal from '../../puzzle/PuzzleModal/PuzzleModal';
import TrainingModal from '../../training/TrainingModal/TrainingModal';
import { getRatingIcon } from '../../user/ProfileIconPicker/ProfileIconPicker';
import SignInModal from '../../user/UserSignInModal/UserSignInModal';
import CommonMobileMenu from '../CommonMobileMenu/CommonMobileMenu';
import CommonSettingsDropdown from '../CommonSettingsDropdown/CommonSettingsDropdown';
import styles from './CommonSiteHeader.module.css';

export type NavItem = {
  label: string;
  route?: string;
  activeRoute?: string;
  showTrainingModal?: boolean;
  showPuzzleModal?: boolean;
  variant?: 'primary' | 'upcoming';
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Play', route: '/play', variant: 'primary' },
  { label: 'Train', showTrainingModal: true, variant: 'primary', activeRoute: '/training' },
  { label: 'Analyze', route: '/analyze', variant: 'primary' },
  { label: 'Puzzles', showPuzzleModal: true, variant: 'primary', activeRoute: '/puzzles' },
  { label: 'Tools', variant: 'upcoming' },
];

const CommonSiteHeader: ParentComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userState, userActions] = useUserStore();
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
        <button class={styles.headerLeft} onClick={() => navigate('/')}>
          NxtChess
        </button>
        <div class={styles.headerCenter}>
          <For each={NAV_ITEMS}>
            {(item) => (
              <button
                classList={{
                  [styles.navItem]: true,
                  [styles.navItemPrimary]: item.variant === 'primary',
                  [styles.navItemUpcoming]: item.variant === 'upcoming',
                  [styles.active]:
                    !!(item.route || item.activeRoute) &&
                    location.pathname.startsWith((item.route || item.activeRoute)!),
                }}
                onClick={() => {
                  if (item.route) {
                    navigate(
                      item.route,
                      location.pathname.startsWith(item.route)
                        ? { state: { reset: Date.now() } }
                        : undefined
                    );
                    return;
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
              </button>
            )}
          </For>
        </div>
        <div class={styles.headerRight}>
          <Show
            when={userState.isLoggedIn}
            fallback={
              <Show when={!userState.isCheckingAuth}>
                <button class={styles.signInButton} onClick={() => setShowSignInModal(true)}>
                  Sign In
                </button>
              </Show>
            }
          >
            <Show when={userState.username}>
              <button
                class={styles.userSection}
                onClick={() => navigate(`/profile/${userState.username}`)}
              >
                <div
                  class={styles.profileIconTooltip}
                  data-tooltip={`Game: ${userState.rating ?? '—'} | Puzzle: ${userState.puzzleRating ?? '—'}`}
                >
                  <img
                    src={getRatingIcon(userState.rating, userState.puzzleRating)}
                    alt="Profile icon"
                    class={styles.headerProfileIcon}
                  />
                </div>
                <span class={styles.usernameText}>{userState.username}</span>
              </button>
              <button class={styles.signOutButton} onClick={handleSignOut}>
                Sign Out
              </button>
            </Show>
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
          onSignOut={() => {
            setShowMobileMenu(false);
            handleSignOut();
          }}
        />
      </Show>
    </>
  );
};

export default CommonSiteHeader;
