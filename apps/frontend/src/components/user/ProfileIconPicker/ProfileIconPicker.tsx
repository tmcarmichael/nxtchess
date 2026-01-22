import { For, createSignal, type Component } from 'solid-js';
import { useUserStore } from '../../../store/user/UserContext';
import styles from './ProfileIconPicker.module.css';

interface ProfileIconPickerProps {
  onIconChange?: (newIcon: string) => void;
}

const PROFILE_ICONS = [
  { id: 'white-king', label: 'White King', asset: '/assets/wK.svg' },
  { id: 'white-queen', label: 'White Queen', asset: '/assets/wQ.svg' },
  { id: 'white-rook', label: 'White Rook', asset: '/assets/wR.svg' },
  { id: 'white-bishop', label: 'White Bishop', asset: '/assets/wB.svg' },
  { id: 'white-knight', label: 'White Knight', asset: '/assets/wN.svg' },
  { id: 'white-pawn', label: 'White Pawn', asset: '/assets/wP.svg' },
  { id: 'black-king', label: 'Black King', asset: '/assets/bK.svg' },
  { id: 'black-queen', label: 'Black Queen', asset: '/assets/bQ.svg' },
  { id: 'black-rook', label: 'Black Rook', asset: '/assets/bR.svg' },
  { id: 'black-bishop', label: 'Black Bishop', asset: '/assets/bB.svg' },
  { id: 'black-knight', label: 'Black Knight', asset: '/assets/bN.svg' },
  { id: 'black-pawn', label: 'Black Pawn', asset: '/assets/bP.svg' },
] as const;

export const getProfileIconAsset = (iconId: string): string => {
  const icon = PROFILE_ICONS.find((i) => i.id === iconId);
  return icon?.asset ?? '/assets/wP.svg';
};

const ProfileIconPicker: Component<ProfileIconPickerProps> = (props) => {
  const [userState, userActions] = useUserStore();
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const handleIconSelect = async (iconId: string) => {
    if (iconId === userState.profileIcon || isLoading()) return;

    setIsLoading(true);
    setError(null);

    try {
      await userActions.setProfileIcon(iconId);
      // Notify parent component of the change
      props.onIconChange?.(iconId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update icon');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class={styles.pickerContainer}>
      <h3 class={styles.pickerTitle}>Profile Icon</h3>
      <div class={styles.iconGrid}>
        <For each={PROFILE_ICONS}>
          {(icon) => (
            <button
              type="button"
              class={styles.iconButton}
              classList={{
                [styles.selected]: userState.profileIcon === icon.id,
                [styles.disabled]: isLoading(),
              }}
              onClick={() => handleIconSelect(icon.id)}
              disabled={isLoading()}
              title={icon.label}
            >
              <img src={icon.asset} alt={icon.label} class={styles.iconImage} />
            </button>
          )}
        </For>
      </div>
      {error() && <p class={styles.errorText}>{error()}</p>}
    </div>
  );
};

export default ProfileIconPicker;
