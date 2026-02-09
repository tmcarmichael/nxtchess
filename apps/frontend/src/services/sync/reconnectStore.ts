import type { Side } from '../../types/game';

const RECONNECT_KEY = 'nxtchess:active_game';

interface ActiveGameInfo {
  gameId: string;
  playerColor: Side;
}

export function saveActiveGame(info: ActiveGameInfo): void {
  try {
    sessionStorage.setItem(RECONNECT_KEY, JSON.stringify(info));
  } catch {
    /* noop */
  }
}

export function loadActiveGame(): ActiveGameInfo | null {
  try {
    const raw = sessionStorage.getItem(RECONNECT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* noop */
  }
  return null;
}

export function clearActiveGame(): void {
  try {
    sessionStorage.removeItem(RECONNECT_KEY);
  } catch {
    /* noop */
  }
}
