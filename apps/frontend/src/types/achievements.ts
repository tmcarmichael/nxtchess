export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type AchievementCategory =
  | 'loyalty'
  | 'streaks'
  | 'rating'
  | 'chess_moments'
  | 'volume'
  | 'fun';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  points: number;
  icon: string;
}

export interface UserAchievement extends Achievement {
  unlocked_at: string;
}

export interface AchievementsResponse {
  achievements: UserAchievement[];
  total_points: number;
  total_unlocked: number;
  total_available: number;
}

export interface AchievementCatalogResponse {
  achievements: Achievement[];
}

export interface AchievementUnlock {
  id: string;
  name: string;
  description: string;
  rarity: AchievementRarity;
  points: number;
  icon: string;
}
