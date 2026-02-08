import { A, useParams } from '@solidjs/router';
import { SolidApexCharts } from 'solid-apexcharts';
import { createEffect, createSignal, For, on, onCleanup, onMount, Show } from 'solid-js';
import { BACKEND_URL } from '../../../shared/config/env';
import { DEBUG } from '../../../shared/utils/debug';
import { useSettings } from '../../../store/settings/SettingsContext';
import { getRatingIcon } from '../ProfileIconPicker/ProfileIconPicker';
import UserAchievements from '../UserAchievements/UserAchievements';
import styles from './UserProfile.module.css';

interface ViewedProfile {
  username: string;
  rating: number;
  puzzleRating: number;
  createdAt: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  achievementPoints: number;
}

interface RatingPoint {
  rating: number;
  created_at: string;
}

interface RatingHistory {
  game_history: RatingPoint[];
  puzzle_history: RatingPoint[];
}

type RatingCategory = 'play' | 'puzzle';

interface RatingCategoryOption {
  value: RatingCategory;
  label: string;
  historyKey: keyof RatingHistory;
  ratingAccessor: (profile: ViewedProfile) => number;
}

const RATING_CATEGORIES: RatingCategoryOption[] = [
  { value: 'play', label: 'Play', historyKey: 'game_history', ratingAccessor: (p) => p.rating },
  {
    value: 'puzzle',
    label: 'Puzzle',
    historyKey: 'puzzle_history',
    ratingAccessor: (p) => p.puzzleRating,
  },
];

type TimeRange = 'W' | 'M' | 'Y' | 'ALL';

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'W', label: 'W' },
  { value: 'M', label: 'M' },
  { value: 'Y', label: 'Y' },
  { value: 'ALL', label: 'All' },
];

interface RecentGame {
  game_id: string;
  opponent: string;
  result: string;
  player_color: string;
  created_at: string;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const UserProfile = () => {
  const params = useParams();
  const [settingsState] = useSettings();
  const [viewedProfile, setViewedProfile] = createSignal<ViewedProfile | null>(null);
  const [ratingHistory, setRatingHistory] = createSignal<RatingHistory | null>(null);
  const [recentGames, setRecentGames] = createSignal<RecentGame[]>([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [notFound, setNotFound] = createSignal(false);
  const [fetchError, setFetchError] = createSignal(false);
  const [isMobile, setIsMobile] = createSignal(false);
  const [activeCategory, setActiveCategory] = createSignal<RatingCategory>('play');
  const [timeRange, setTimeRange] = createSignal<TimeRange>('ALL');
  const [ratingExpanded, setRatingExpanded] = createSignal(true);
  const [gamesExpanded, setGamesExpanded] = createSignal(true);
  const [achievementsExpanded, setAchievementsExpanded] = createSignal(true);

  let currentRequestVersion = 0;

  onMount(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    setIsMobile(mq.matches);
    const handler = (e: { matches: boolean }) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    onCleanup(() => mq.removeEventListener('change', handler));
  });

  createEffect(
    on(
      () => params.username,
      (username) => {
        if (!username) return;

        const requestVersion = ++currentRequestVersion;

        setIsLoading(true);
        setNotFound(false);
        setFetchError(false);
        setViewedProfile(null);
        setRatingHistory(null);
        setRecentGames([]);

        fetch(`${BACKEND_URL}/api/profile/${username}`, {
          credentials: 'include',
        })
          .then((res) => {
            if (requestVersion !== currentRequestVersion) return null;
            if (res.status === 404) {
              setNotFound(true);
              setIsLoading(false);
              return null;
            }
            if (!res.ok) throw new Error('Failed to fetch profile');
            return res.json();
          })
          .then((data) => {
            if (requestVersion !== currentRequestVersion) return;
            if (data) {
              setViewedProfile({
                username: data.username,
                rating: data.rating,
                puzzleRating: data.puzzle_rating ?? 1200,
                createdAt: data.created_at,
                gamesPlayed: data.games_played ?? 0,
                wins: data.wins ?? 0,
                losses: data.losses ?? 0,
                draws: data.draws ?? 0,
                achievementPoints: data.achievement_points ?? 0,
              });
            }
            setIsLoading(false);
          })
          .catch((err) => {
            if (requestVersion !== currentRequestVersion) return;
            if (DEBUG) console.error('Error fetching profile:', err);
            setFetchError(true);
            setIsLoading(false);
          });

        fetch(`${BACKEND_URL}/api/profile/${username}/rating-history`, {
          credentials: 'include',
        })
          .then((res) => {
            if (requestVersion !== currentRequestVersion) return null;
            if (!res.ok) return null;
            return res.json();
          })
          .then((data) => {
            if (requestVersion !== currentRequestVersion || !data) return;
            setRatingHistory(data);
          })
          .catch(() => {});

        fetch(`${BACKEND_URL}/api/profile/${username}/recent-games`, {
          credentials: 'include',
        })
          .then((res) => {
            if (requestVersion !== currentRequestVersion) return null;
            if (!res.ok) return null;
            return res.json();
          })
          .then((data) => {
            if (requestVersion !== currentRequestVersion || !data) return;
            setRecentGames(data.games ?? []);
          })
          .catch(() => {});
      }
    )
  );

  const activeHistoryData = () => {
    const history = ratingHistory();
    if (!history) return null;

    const category = RATING_CATEGORIES.find((c) => c.value === activeCategory());
    if (!category) return null;

    let data = history[category.historyKey];
    if (!data || data.length === 0) return null;

    const range = timeRange();
    if (range !== 'ALL') {
      const now = Date.now();
      const cutoffs: Record<Exclude<TimeRange, 'ALL'>, number> = {
        W: 7 * 24 * 60 * 60 * 1000,
        M: 30 * 24 * 60 * 60 * 1000,
        Y: 365 * 24 * 60 * 60 * 1000,
      };
      const cutoff = now - cutoffs[range];
      data = data.filter((p) => new Date(p.created_at).getTime() >= cutoff);
      if (data.length === 0) return null;
    }

    return { category, data };
  };

  const chartOptions = () => {
    const active = activeHistoryData();
    if (!active) return null;

    const ratings = active.data.map((p) => p.rating);
    const min = Math.min(...ratings);
    const max = Math.max(...ratings);
    const range = max - min;
    const padding = Math.max(50, Math.round(range * 0.1));

    const isDark = settingsState.theme !== 'light';
    const textColor = isDark ? '#666' : '#7a7a7a';

    const currentRange = timeRange();
    const now = Date.now();

    const xaxisLabels: Record<string, unknown> = {
      style: { colors: textColor, fontSize: '11px' },
      datetimeUTC: false,
    };
    const xaxis: Record<string, unknown> = {
      type: 'datetime' as const,
      labels: xaxisLabels,
    };

    switch (currentRange) {
      case 'W':
        xaxis.min = now - 7 * 24 * 60 * 60 * 1000;
        xaxis.max = now;
        xaxis.tickAmount = 7;
        xaxisLabels.formatter = (_value: string, timestamp?: number) => {
          if (!timestamp) return '';
          return new Date(timestamp).toLocaleDateString(undefined, { weekday: 'short' });
        };
        break;
      case 'M':
        xaxis.min = now - 30 * 24 * 60 * 60 * 1000;
        xaxis.max = now;
        xaxisLabels.format = 'dd MMM';
        break;
      case 'Y':
        xaxis.min = now - 365 * 24 * 60 * 60 * 1000;
        xaxis.max = now;
        xaxis.tickAmount = 12;
        xaxisLabels.format = 'MMM';
        break;
      default:
        xaxisLabels.format = "MMM ''yy";
        break;
    }

    return {
      chart: {
        toolbar: { show: false },
        animations: { enabled: true },
        background: 'transparent',
      },
      xaxis,
      yaxis: {
        min: Math.floor((min - padding) / 25) * 25,
        max: Math.ceil((max + padding) / 25) * 25,
        labels: {
          style: { colors: textColor, fontSize: '11px' },
          formatter: (val: number) => Math.round(val).toString(),
        },
      },
      stroke: { width: 2, curve: 'smooth' as const },
      markers: { size: ratings.length < 20 ? 3 : 0 },
      tooltip: {
        theme: isDark ? ('dark' as const) : ('light' as const),
        x: { format: 'MMM dd, yyyy' },
      },
      theme: { mode: isDark ? ('dark' as const) : ('light' as const) },
      legend: { show: false },
      colors: [isDark ? '#00ffd1' : '#009b7d'],
      grid: {
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      },
    };
  };

  const chartSeries = () => {
    const active = activeHistoryData();
    if (!active) return [];

    return [
      {
        name: `${active.category.label} Rating`,
        data: active.data.map((p) => ({
          x: new Date(p.created_at).getTime(),
          y: p.rating,
        })),
      },
    ];
  };

  const resultClass = (result: string) => {
    if (result === 'win') return styles.userProfileGameResultWin;
    if (result === 'loss') return styles.userProfileGameResultLoss;
    return styles.userProfileGameResultDraw;
  };

  return (
    <Show
      when={!notFound()}
      fallback={
        <div class={styles.userProfileContainer}>
          <h2 class={styles.userProfileTitle}>User Not Found</h2>
          <p class={styles.userProfileLoading}>The user "{params.username}" does not exist.</p>
        </div>
      }
    >
      <Show
        when={!fetchError()}
        fallback={
          <div class={styles.userProfileContainer}>
            <h2 class={styles.userProfileTitle}>Error</h2>
            <p class={styles.userProfileLoading}>Failed to load profile. Please try again later.</p>
          </div>
        }
      >
        <div class={styles.userProfileContainer}>
          <Show
            when={!isLoading() && viewedProfile()}
            fallback={<p class={styles.userProfileLoading}>Loading profile...</p>}
          >
            <div class={styles.userProfileHeader}>
              <img
                src={getRatingIcon(viewedProfile()!.rating, viewedProfile()!.puzzleRating)}
                alt="Profile icon"
                class={styles.userProfileIcon}
              />
              <h2 class={styles.userProfileTitle}>{viewedProfile()!.username}</h2>
            </div>

            <Show when={viewedProfile()!.createdAt}>
              <p class={styles.userProfileMemberSince}>
                Member since {formatDate(viewedProfile()!.createdAt)}
              </p>
            </Show>

            <div class={styles.userProfileStats}>
              <div class={styles.userProfileStatItem}>
                <span class={styles.userProfileStatLabel}>Played</span>
                <span class={styles.userProfileStatValue}>{viewedProfile()!.gamesPlayed}</span>
              </div>
              <div class={styles.userProfileStatItem}>
                <span class={styles.userProfileStatLabel}>Wins</span>
                <span class={`${styles.userProfileStatValue} ${styles.userProfileStatValueWin}`}>
                  {viewedProfile()!.wins}
                </span>
              </div>
              <div class={styles.userProfileStatItem}>
                <span class={styles.userProfileStatLabel}>Losses</span>
                <span class={`${styles.userProfileStatValue} ${styles.userProfileStatValueLoss}`}>
                  {viewedProfile()!.losses}
                </span>
              </div>
              <div class={styles.userProfileStatItem}>
                <span class={styles.userProfileStatLabel}>Draws</span>
                <span class={`${styles.userProfileStatValue} ${styles.userProfileStatValueDraw}`}>
                  {viewedProfile()!.draws}
                </span>
              </div>
            </div>

            <div class={styles.userProfileSection}>
              <div
                class={styles.userProfileSectionHeader}
                onClick={() => setRatingExpanded((v) => !v)}
              >
                <h3 class={styles.userProfileSectionTitle}>Rating History</h3>
                <div
                  class={styles.userProfileTimeRange}
                  onClick={(e: MouseEvent) => e.stopPropagation()}
                >
                  <For each={TIME_RANGES}>
                    {(range) => (
                      <button
                        class={styles.userProfileTimeRangeButton}
                        classList={{
                          [styles.userProfileTimeRangeButtonActive]: timeRange() === range.value,
                        }}
                        onClick={() => setTimeRange(range.value)}
                      >
                        {range.label}
                      </button>
                    )}
                  </For>
                </div>
                <svg
                  class={styles.userProfileCollapseArrow}
                  classList={{
                    [styles.userProfileCollapseArrowCollapsed]: !ratingExpanded(),
                  }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <Show when={ratingExpanded()}>
                <div class={styles.userProfileGraph}>
                  <div class={styles.userProfileCategorySelector}>
                    <For each={RATING_CATEGORIES}>
                      {(category) => (
                        <button
                          class={styles.userProfileCategoryButton}
                          classList={{
                            [styles.userProfileCategoryButtonActive]:
                              activeCategory() === category.value,
                          }}
                          onClick={() => setActiveCategory(category.value)}
                        >
                          <span class={styles.userProfileCategoryLabel}>{category.label}</span>
                          <span class={styles.userProfileCategoryRating}>
                            {category.ratingAccessor(viewedProfile()!)}
                          </span>
                        </button>
                      )}
                    </For>
                  </div>
                  <Show
                    when={chartSeries().length > 0}
                    fallback={
                      <p class={styles.userProfileEmptyState}>
                        No rating history yet. Play some games or solve puzzles to start tracking
                        progress.
                      </p>
                    }
                  >
                    <SolidApexCharts
                      type="line"
                      width="100%"
                      height={isMobile() ? '250' : '350'}
                      options={chartOptions()!}
                      series={chartSeries()}
                    />
                  </Show>
                </div>
              </Show>
            </div>

            <div class={styles.userProfileSection}>
              <div
                class={styles.userProfileSectionHeader}
                onClick={() => setGamesExpanded((v) => !v)}
              >
                <h3 class={styles.userProfileSectionTitle}>Recent Games</h3>
                <svg
                  class={styles.userProfileCollapseArrow}
                  classList={{
                    [styles.userProfileCollapseArrowCollapsed]: !gamesExpanded(),
                  }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <Show when={gamesExpanded()}>
                <Show
                  when={recentGames().length > 0}
                  fallback={<p class={styles.userProfileEmptyState}>No games played yet.</p>}
                >
                  <div class={styles.userProfileGameList}>
                    <For each={recentGames()}>
                      {(game) => (
                        <div class={styles.userProfileGameRow}>
                          <div
                            class={`${styles.userProfileGameColor} ${game.player_color === 'white' ? styles.userProfileGameColorWhite : styles.userProfileGameColorBlack}`}
                          />
                          <span
                            class={`${styles.userProfileGameResult} ${resultClass(game.result)}`}
                          >
                            {game.result}
                          </span>
                          <span class={styles.userProfileGameOpponent}>
                            vs{' '}
                            <A
                              href={`/profile/${game.opponent}`}
                              class={styles.userProfileGameOpponentLink}
                            >
                              {game.opponent}
                            </A>
                          </span>
                          <span class={styles.userProfileGameDate}>
                            {formatDate(game.created_at)}
                          </span>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </Show>
            </div>

            <div class={styles.userProfileSection}>
              <div
                class={styles.userProfileSectionHeader}
                onClick={() => setAchievementsExpanded((v) => !v)}
              >
                <h3 class={styles.userProfileSectionTitle}>Achievements</h3>
                <svg
                  class={styles.userProfileCollapseArrow}
                  classList={{
                    [styles.userProfileCollapseArrowCollapsed]: !achievementsExpanded(),
                  }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <div
                classList={{
                  [styles.userProfileSectionContentHidden]: !achievementsExpanded(),
                }}
              >
                <UserAchievements username={params.username!} hideTitle />
              </div>
            </div>
          </Show>
        </div>
      </Show>
    </Show>
  );
};

export default UserProfile;
