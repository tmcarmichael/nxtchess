DROP TABLE IF EXISTS user_achievements;
ALTER TABLE profiles DROP COLUMN IF EXISTS achievement_points;
ALTER TABLE profiles DROP COLUMN IF EXISTS win_streak;
ALTER TABLE profiles DROP COLUMN IF EXISTS puzzle_streak;
