import { Show } from 'solid-js';
import styles from './AchievementBadge.module.css';
import type { AchievementRarity } from '../../../types/achievements';

interface AchievementBadgeProps {
  icon: string;
  name: string;
  description: string;
  rarity: AchievementRarity;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
}

const rarityClass: Record<AchievementRarity, string> = {
  common: styles.achievementBadgeCommon,
  uncommon: styles.achievementBadgeUncommon,
  rare: styles.achievementBadgeRare,
  epic: styles.achievementBadgeEpic,
  legendary: styles.achievementBadgeLegendary,
};

const AchievementBadge = (props: AchievementBadgeProps) => {
  return (
    <div
      class={`${styles.achievementBadge} ${rarityClass[props.rarity]} ${props.unlocked ? '' : styles.achievementBadgeLocked}`}
      title={`${props.name}: ${props.description}${props.unlocked && props.unlockedAt ? ` (${new Date(props.unlockedAt).toLocaleDateString()})` : ''}`}
    >
      <span class={styles.achievementBadgeIcon}>{props.icon}</span>
      <span class={styles.achievementBadgeName}>{props.name}</span>
      <Show when={props.unlocked}>
        <span class={styles.achievementBadgePoints}>+{props.points}</span>
      </Show>
    </div>
  );
};

export default AchievementBadge;
