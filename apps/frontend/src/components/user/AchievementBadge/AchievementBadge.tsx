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

const rarityLabels: Record<AchievementRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const AchievementBadge = (props: AchievementBadgeProps) => {
  return (
    <div
      class={`${styles.achievementBadge} ${rarityClass[props.rarity]} ${props.unlocked ? '' : styles.achievementBadgeLocked}`}
    >
      <span class={styles.achievementBadgeIcon}>{props.icon}</span>
      <span class={styles.achievementBadgeName}>{props.name}</span>
      <Show when={props.unlocked}>
        <span class={styles.achievementBadgePoints}>+{props.points}</span>
      </Show>

      <div class={`${styles.achievementBadgeTooltip} ${rarityClass[props.rarity]}`}>
        <div class={styles.achievementBadgeTooltipHeader}>
          <span class={styles.achievementBadgeTooltipName}>{props.name}</span>
          <span
            class={`${styles.achievementBadgeTooltipRarity} ${styles[`achievementBadgeTooltipRarity${props.rarity.charAt(0).toUpperCase() + props.rarity.slice(1)}`]}`}
          >
            {rarityLabels[props.rarity]}
          </span>
        </div>
        <p class={styles.achievementBadgeTooltipDescription}>{props.description}</p>
        <div class={styles.achievementBadgeTooltipFooter}>
          <span class={styles.achievementBadgeTooltipPoints}>+{props.points} pts</span>
          <Show when={props.unlocked && props.unlockedAt}>
            <span class={styles.achievementBadgeTooltipDate}>
              {new Date(props.unlockedAt!).toLocaleDateString()}
            </span>
          </Show>
          <Show when={!props.unlocked}>
            <span class={styles.achievementBadgeTooltipLocked}>Locked</span>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default AchievementBadge;
