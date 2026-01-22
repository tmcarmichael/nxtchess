import { useNavigate } from '@solidjs/router';
import { Show, For, type Component } from 'solid-js';
import { useUserStore } from '../../../store/user/UserContext';
import { getProfileIconAsset } from '../../user/ProfileIconPicker/ProfileIconPicker';
import { NAV_ITEMS } from '../CommonSiteHeader/CommonSiteHeader';
import styles from './CommonMobileMenu.module.css';

type CommonMobileMenuProps = {
  onClose: () => void;
  onShowPlayModal: () => void;
  onShowTrainingModal: () => void;
  onShowSignInModal: () => void;
  onSignOut: () => void;
};

const CommonMobileMenu: Component<CommonMobileMenuProps> = (props) => {
  const navigate = useNavigate();
  const [userState] = useUserStore();

  const handleNavClick = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.route) {
      navigate(item.route);
      props.onClose();
    } else if (item.showPlayModal) {
      props.onShowPlayModal();
    } else if (item.showTrainingModal) {
      props.onShowTrainingModal();
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
    <div class={styles.overlay} onClick={props.onClose}>
      <nav class={styles.menu} onClick={(e) => e.stopPropagation()}>
        <div class={styles.menuHeader}>
          <span class={styles.menuTitle}>Menu</span>
          <button class={styles.closeButton} onClick={props.onClose} aria-label="Close menu">
            <span class={styles.closeIcon}>&times;</span>
          </button>
        </div>

        <div class={styles.navItems}>
          <For each={NAV_ITEMS}>
            {(item) => (
              <button
                class={styles.navItem}
                onClick={() => handleNavClick(item)}
                disabled={!!item.tooltip}
              >
                <span class={styles.navLabel}>{item.label}</span>
                <Show when={item.tooltip}>
                  <span class={styles.navBadge}>Soon</span>
                </Show>
              </button>
            )}
          </For>
        </div>

        <div class={styles.menuFooter}>
          <Show
            when={userState.isLoggedIn}
            fallback={
              <button class={styles.signInButton} onClick={props.onShowSignInModal}>
                Sign In
              </button>
            }
          >
            <Show when={userState.username}>
              <button class={styles.profileButton} onClick={handleProfileClick}>
                <img
                  src={getProfileIconAsset(userState.profileIcon)}
                  alt="Profile icon"
                  class={styles.profileIcon}
                />
                <span class={styles.username}>{userState.username}</span>
              </button>
            </Show>
            <button class={styles.signOutButton} onClick={() => props.onSignOut()}>
              Sign Out
            </button>
          </Show>
        </div>
      </nav>
    </div>
  );
};

export default CommonMobileMenu;
