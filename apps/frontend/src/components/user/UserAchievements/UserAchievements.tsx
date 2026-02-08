import { createSignal, createEffect, on, For, Show, type JSX } from 'solid-js';
import { BACKEND_URL } from '../../../shared/config/env';
import AchievementBadge from '../AchievementBadge/AchievementBadge';
import styles from './UserAchievements.module.css';
import type {
  Achievement,
  AchievementCategory,
  AchievementsResponse,
  AchievementCatalogResponse,
  UserAchievement,
} from '../../../types/achievements';

interface UserAchievementsProps {
  username: string;
  hideTitle?: boolean;
}

const categoryOrder: AchievementCategory[] = [
  'chess_moments',
  'streaks',
  'rating',
  'volume',
  'fun',
  'loyalty',
];

const categoryLabels: Record<AchievementCategory, string> = {
  chess_moments: 'Chess Moments',
  streaks: 'Streaks',
  rating: 'Rating',
  volume: 'Dedication',
  fun: 'Fun & Rare',
  loyalty: 'Loyalty',
};

const iconProps = {
  width: '16',
  height: '16',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '2',
  'stroke-linecap': 'round' as const,
  'stroke-linejoin': 'round' as const,
};

const categoryIcons: Record<AchievementCategory, () => JSX.Element> = {
  chess_moments: () => (
    <svg {...iconProps}>
      <path d="M9 2h6l-1 4h2l-4 7V9H8l3-7z" />
      <path d="M7 17h10" />
      <path d="M6 21h12" />
      <path d="M12 13v4" />
      <path d="M8 17l-1 4" />
      <path d="M16 17l1 4" />
    </svg>
  ),
  streaks: () => (
    <svg {...iconProps}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  rating: () => (
    <svg {...iconProps}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  volume: () => (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  fun: () => (
    <svg {...iconProps}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  loyalty: () => (
    <svg {...iconProps}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

const UserAchievements = (props: UserAchievementsProps) => {
  const [userAchievements, setUserAchievements] = createSignal<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = createSignal<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = createSignal(0);
  const [totalUnlocked, setTotalUnlocked] = createSignal(0);
  const [totalAvailable, setTotalAvailable] = createSignal(0);
  const [isLoaded, setIsLoaded] = createSignal(false);
  const [expandedCategories, setExpandedCategories] = createSignal<Set<AchievementCategory>>(
    new Set()
  );

  const toggleCategory = (category: AchievementCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  createEffect(
    on(
      () => props.username,
      (username) => {
        if (!username) return;

        setIsLoaded(false);

        Promise.all([
          fetch(`${BACKEND_URL}/api/profile/${username}/achievements`, {
            credentials: 'include',
          }).then((res) => (res.ok ? res.json() : null)),
          fetch(`${BACKEND_URL}/api/achievements`, {
            credentials: 'include',
          }).then((res) => (res.ok ? res.json() : null)),
        ])
          .then(([achievementsData, catalogData]) => {
            if (achievementsData) {
              const data = achievementsData as AchievementsResponse;
              setUserAchievements(data.achievements ?? []);
              setTotalPoints(data.total_points ?? 0);
              setTotalUnlocked(data.total_unlocked ?? 0);
              setTotalAvailable(data.total_available ?? 0);
            }
            if (catalogData) {
              const data = catalogData as AchievementCatalogResponse;
              setAllAchievements(data.achievements ?? []);
            }
            setIsLoaded(true);
          })
          .catch(() => {
            setIsLoaded(true);
          });
      }
    )
  );

  const unlockedSet = () => {
    const set = new Set<string>();
    for (const a of userAchievements()) {
      set.add(a.id);
    }
    return set;
  };

  const unlockedMap = () => {
    const map = new Map<string, UserAchievement>();
    for (const a of userAchievements()) {
      map.set(a.id, a);
    }
    return map;
  };

  const groupedAchievements = () => {
    const all = allAchievements();
    const unlocked = unlockedSet();
    const groups: Record<string, Achievement[]> = {};

    for (const cat of categoryOrder) {
      groups[cat] = [];
    }

    for (const achievement of all) {
      const cat = achievement.category as AchievementCategory;
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(achievement);
    }

    for (const cat of categoryOrder) {
      groups[cat].sort((a, b) => {
        const aUnlocked = unlocked.has(a.id);
        const bUnlocked = unlocked.has(b.id);
        if (aUnlocked !== bUnlocked) return aUnlocked ? -1 : 1;
        return a.points - b.points;
      });
    }

    return groups;
  };

  const categoryUnlockedCount = (category: AchievementCategory) => {
    const achievements = groupedAchievements()[category] ?? [];
    const unlocked = unlockedSet();
    return achievements.filter((a) => unlocked.has(a.id)).length;
  };

  return (
    <Show when={isLoaded()}>
      <div class={styles.userAchievementsContainer}>
        <div class={styles.userAchievementsHeader}>
          <Show when={!props.hideTitle}>
            <h3 class={styles.userAchievementsSectionTitle}>Achievements</h3>
          </Show>
          <div class={styles.userAchievementsPointsBanner}>
            <span class={styles.userAchievementsPointsValue}>{totalPoints()}</span>
            <span class={styles.userAchievementsPointsLabel}>pts</span>
          </div>
          <span class={styles.userAchievementsCount}>
            {totalUnlocked()} / {totalAvailable()}
          </span>
        </div>

        <div class={styles.userAchievementsCategoryList}>
          <For each={categoryOrder}>
            {(category) => {
              const achievements = () => groupedAchievements()[category] ?? [];
              const isExpanded = () => expandedCategories().has(category);
              const unlockedCount = () => categoryUnlockedCount(category);
              const totalCount = () => achievements().length;
              const allUnlocked = () => unlockedCount() === totalCount() && totalCount() > 0;

              return (
                <Show when={achievements().length > 0}>
                  <div class={styles.userAchievementsCategoryGroup}>
                    <button
                      class={styles.userAchievementsCategoryHeader}
                      classList={{
                        [styles.userAchievementsCategoryHeaderExpanded]: isExpanded(),
                        [styles.userAchievementsCategoryHeaderComplete]: allUnlocked(),
                      }}
                      onClick={() => toggleCategory(category)}
                    >
                      <span class={styles.userAchievementsCategoryIcon}>
                        {categoryIcons[category]()}
                      </span>
                      <span class={styles.userAchievementsCategoryTitle}>
                        {categoryLabels[category]}
                      </span>
                      <span
                        class={styles.userAchievementsCategoryProgress}
                        classList={{
                          [styles.userAchievementsCategoryProgressComplete]: allUnlocked(),
                        }}
                      >
                        {unlockedCount()}/{totalCount()}
                      </span>
                      <svg
                        class={styles.userAchievementsCategoryArrow}
                        classList={{
                          [styles.userAchievementsCategoryArrowExpanded]: isExpanded(),
                        }}
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="9 6 15 12 9 18" />
                      </svg>
                    </button>
                    <Show when={isExpanded()}>
                      <div class={styles.userAchievementsBadgeGrid}>
                        <For each={achievements()}>
                          {(achievement) => {
                            const isUnlocked = () => unlockedSet().has(achievement.id);
                            const userData = () => unlockedMap().get(achievement.id);
                            return (
                              <AchievementBadge
                                icon={achievement.icon}
                                name={achievement.name}
                                description={achievement.description}
                                rarity={achievement.rarity}
                                points={achievement.points}
                                unlocked={isUnlocked()}
                                unlockedAt={userData()?.unlocked_at}
                              />
                            );
                          }}
                        </For>
                      </div>
                    </Show>
                  </div>
                </Show>
              );
            }}
          </For>
        </div>
      </div>
    </Show>
  );
};

export default UserAchievements;
