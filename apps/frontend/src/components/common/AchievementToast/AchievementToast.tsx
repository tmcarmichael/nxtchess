import { createSignal, For, Show } from 'solid-js';
import styles from './AchievementToast.module.css';
import type { AchievementUnlock, AchievementRarity } from '../../../types/achievements';

interface ToastItem extends AchievementUnlock {
  toastId: number;
}

let nextToastId = 0;

const [toasts, setToasts] = createSignal<ToastItem[]>([]);

export function pushAchievementToast(achievement: AchievementUnlock) {
  const toastId = nextToastId++;
  setToasts((prev) => [...prev, { ...achievement, toastId }]);

  setTimeout(() => {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, 4500);
}

export function pushAchievementToasts(achievements: AchievementUnlock[]) {
  if (!achievements || achievements.length === 0) return;
  for (const a of achievements) {
    pushAchievementToast(a);
  }
}

const rarityClass: Record<AchievementRarity, string> = {
  common: styles.achievementToastCommon,
  uncommon: styles.achievementToastUncommon,
  rare: styles.achievementToastRare,
  epic: styles.achievementToastEpic,
  legendary: styles.achievementToastLegendary,
};

const AchievementToast = () => {
  return (
    <Show when={toasts().length > 0}>
      <div class={styles.achievementToastContainer}>
        <For each={toasts()}>
          {(toast) => (
            <div class={`${styles.achievementToast} ${rarityClass[toast.rarity]}`}>
              <span class={styles.achievementToastIcon}>{toast.icon}</span>
              <div class={styles.achievementToastContent}>
                <span class={styles.achievementToastLabel}>Achievement Unlocked!</span>
                <span class={styles.achievementToastName}>{toast.name}</span>
                <span class={styles.achievementToastDescription}>{toast.description}</span>
              </div>
              <span class={styles.achievementToastPoints}>+{toast.points}</span>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
};

export default AchievementToast;
