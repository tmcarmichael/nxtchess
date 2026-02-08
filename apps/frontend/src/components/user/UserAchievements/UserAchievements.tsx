import { createSignal, createEffect, on, For, Show } from 'solid-js';
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
  rating: 'Rating Milestones',
  volume: 'Dedication',
  fun: 'Fun & Rare',
  loyalty: 'Loyalty',
};

const UserAchievements = (props: UserAchievementsProps) => {
  const [userAchievements, setUserAchievements] = createSignal<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = createSignal<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = createSignal(0);
  const [totalUnlocked, setTotalUnlocked] = createSignal(0);
  const [totalAvailable, setTotalAvailable] = createSignal(0);
  const [isLoaded, setIsLoaded] = createSignal(false);

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

        <For each={categoryOrder}>
          {(category) => {
            const achievements = () => groupedAchievements()[category] ?? [];
            return (
              <Show when={achievements().length > 0}>
                <div class={styles.userAchievementsCategoryGroup}>
                  <h4 class={styles.userAchievementsCategoryTitle}>{categoryLabels[category]}</h4>
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
                </div>
              </Show>
            );
          }}
        </For>
      </div>
    </Show>
  );
};

export default UserAchievements;
