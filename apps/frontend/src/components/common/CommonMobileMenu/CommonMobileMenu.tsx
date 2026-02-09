import { useNavigate, useLocation } from '@solidjs/router';
import { Show, For, createSignal, onMount, onCleanup, type Component } from 'solid-js';
import { useUserStore } from '../../../store/user/UserContext';
import { getRatingIcon } from '../../user/ProfileIconPicker/ProfileIconPicker';
import { NAV_ITEMS } from '../CommonSiteHeader/CommonSiteHeader';
import styles from './CommonMobileMenu.module.css';

const FOOTER_LINKS = [
  {
    label: 'About',
    url: 'https://github.com/tmcarmichael/nxtchess?tab=readme-ov-file#nxt-chess',
  },
  {
    label: 'Roadmap',
    url: 'https://github.com/tmcarmichael/nxtchess/blob/main/README.md#-roadmap',
  },
  {
    label: 'Support',
    url: 'https://github.com/tmcarmichael/nxtchess?tab=readme-ov-file#-contact',
  },
  {
    label: 'Privacy',
    url: 'https://github.com/tmcarmichael/nxtchess/blob/main/PRIVACY.md',
  },
  {
    label: 'Contribute',
    url: 'https://github.com/tmcarmichael/nxtchess?tab=readme-ov-file#%EF%B8%8F-getting-started',
  },
  {
    label: 'Contact',
    url: 'https://github.com/tmcarmichael/nxtchess?tab=readme-ov-file#-contact',
  },
];

type CommonMobileMenuProps = {
  onClose: () => void;
  onShowTrainingModal: () => void;
  onShowPuzzleModal: () => void;
  onShowGameReviewModal: () => void;
  onShowSignInModal: () => void;
  onSignOut: () => void;
};

const CommonMobileMenu: Component<CommonMobileMenuProps> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userState] = useUserStore();
  const [isClosing, setIsClosing] = createSignal(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      props.onClose();
    }, 150);
  };

  onMount(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
  });

  const handleNavClick = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.route) {
      navigate(
        item.route,
        location.pathname.startsWith(item.route) ? { state: { reset: Date.now() } } : undefined
      );
      props.onClose();
    } else if (item.showTrainingModal) {
      props.onShowTrainingModal();
    } else if (item.showPuzzleModal) {
      props.onShowPuzzleModal();
    } else if (item.hasDropdown) {
      props.onShowGameReviewModal();
    } else {
      props.onClose();
    }
  };

  const handleProfileClick = () => {
    if (userState.username) {
      navigate(`/profile/${userState.username}`);
      props.onClose();
    }
  };

  return (
    <div class={styles.mobileMenuOverlay} onClick={handleClose}>
      <nav class={styles.mobileMenuPanel} onClick={(e) => e.stopPropagation()}>
        <div class={styles.menuHeader}>
          <span class={styles.menuTitle}>Menu</span>
          <button
            classList={{
              [styles.closeButton]: true,
              [styles.closeButtonAnimating]: isClosing(),
            }}
            onClick={handleClose}
            aria-label="Close menu"
          >
            <span class={styles.closeButtonIcon}>&times;</span>
          </button>
        </div>

        <div class={styles.navItems}>
          <For each={NAV_ITEMS}>
            {(item) => (
              <button
                classList={{
                  [styles.navItem]: true,
                  [styles.navItemActive]:
                    !!(item.route || item.activeRoute) &&
                    location.pathname.startsWith((item.route || item.activeRoute)!),
                }}
                onClick={() => handleNavClick(item)}
                disabled={item.variant === 'upcoming'}
              >
                <span class={styles.navLabel}>{item.label}</span>
                <Show when={item.variant === 'upcoming'}>
                  <span class={styles.navBadge}>Soon</span>
                </Show>
              </button>
            )}
          </For>
        </div>

        <div class={styles.linksSection}>
          <For each={FOOTER_LINKS}>
            {(link) => (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                class={styles.footerLink}
              >
                {link.label}
              </a>
            )}
          </For>
        </div>

        <div class={styles.menuFooter}>
          <Show
            when={userState.isLoggedIn}
            fallback={
              <Show when={!userState.isCheckingAuth}>
                <button class={styles.signInButton} onClick={props.onShowSignInModal}>
                  Sign In
                </button>
              </Show>
            }
          >
            <Show when={userState.username}>
              <button class={styles.profileButton} onClick={handleProfileClick}>
                <img
                  src={getRatingIcon(userState.rating, userState.puzzleRating)}
                  alt="Profile icon"
                  class={styles.profileButtonIcon}
                />
                <span class={styles.profileButtonUsername}>{userState.username}</span>
              </button>
              <button class={styles.signOutButton} onClick={() => props.onSignOut()}>
                Sign Out
              </button>
            </Show>
          </Show>
        </div>
      </nav>
    </div>
  );
};

export default CommonMobileMenu;
