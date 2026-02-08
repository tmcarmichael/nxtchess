import { A, useParams } from '@solidjs/router';
import { SolidApexCharts } from 'solid-apexcharts';
import { createEffect, createSignal, For, on, onCleanup, onMount, Show } from 'solid-js';
import { BACKEND_URL } from '../../../shared/config/env';
import { DEBUG } from '../../../shared/utils/debug';
import { useSettings } from '../../../store/settings/SettingsContext';
import { getRatingIcon } from '../ProfileIconPicker/ProfileIconPicker';
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
}

interface RatingPoint {
  rating: number;
  created_at: string;
}

interface RatingHistory {
  game_history: RatingPoint[];
  puzzle_history: RatingPoint[];
}

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

  const chartOptions = () => {
    const history = ratingHistory();
    if (!history) return null;

    const allRatings = [
      ...history.game_history.map((p) => p.rating),
      ...history.puzzle_history.map((p) => p.rating),
    ];

    if (allRatings.length === 0) return null;

    const min = Math.min(...allRatings);
    const max = Math.max(...allRatings);
    const range = max - min;
    const padding = Math.max(50, Math.round(range * 0.1));

    const isDark = settingsState.theme !== 'light';
    const textColor = isDark ? '#666' : '#7a7a7a';

    return {
      chart: {
        toolbar: { show: false },
        animations: { enabled: true },
        background: 'transparent',
      },
      xaxis: {
        type: 'datetime' as const,
        labels: { style: { colors: textColor, fontSize: '11px' } },
      },
      yaxis: {
        min: min - padding,
        max: max + padding,
        labels: { style: { colors: textColor, fontSize: '11px' } },
      },
      stroke: { width: 2, curve: 'smooth' as const },
      markers: { size: allRatings.length < 20 ? 3 : 0 },
      tooltip: {
        theme: isDark ? ('dark' as const) : ('light' as const),
        x: { format: 'MMM dd, yyyy' },
      },
      theme: { mode: isDark ? ('dark' as const) : ('light' as const) },
      legend: {
        position: 'top' as const,
        labels: { colors: isDark ? '#ccc' : '#333' },
      },
      colors: [isDark ? '#00ffd1' : '#009b7d', '#f87171'],
      grid: {
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
      },
    };
  };

  const chartSeries = () => {
    const history = ratingHistory();
    if (!history) return [];

    const series: { name: string; data: { x: number; y: number }[] }[] = [];

    if (history.game_history.length > 0) {
      series.push({
        name: 'Game Rating',
        data: history.game_history.map((p) => ({
          x: new Date(p.created_at).getTime(),
          y: p.rating,
        })),
      });
    }

    if (history.puzzle_history.length > 0) {
      series.push({
        name: 'Puzzle Rating',
        data: history.puzzle_history.map((p) => ({
          x: new Date(p.created_at).getTime(),
          y: p.rating,
        })),
      });
    }

    return series;
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

            <div class={styles.userProfileRatings}>
              <div class={styles.userProfileRatingItem}>
                <span class={styles.userProfileRatingLabel}>Game Rating</span>
                <span class={styles.userProfileRatingValue}>{viewedProfile()!.rating}</span>
              </div>
              <div class={styles.userProfileRatingItem}>
                <span class={styles.userProfileRatingLabel}>Puzzle Rating</span>
                <span class={styles.userProfileRatingValue}>{viewedProfile()!.puzzleRating}</span>
              </div>
            </div>

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

            <div class={styles.userProfileGraph}>
              <h3 class={styles.userProfileSectionTitle}>Rating History</h3>
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

            <div class={styles.userProfileRecentGames}>
              <h3 class={styles.userProfileSectionTitle}>Recent Games</h3>
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
                        <span class={`${styles.userProfileGameResult} ${resultClass(game.result)}`}>
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
            </div>
          </Show>
        </div>
      </Show>
    </Show>
  );
};

export default UserProfile;
