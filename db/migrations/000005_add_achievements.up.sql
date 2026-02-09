CREATE TABLE IF NOT EXISTS user_achievements (
    id              SERIAL PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    achievement_id  TEXT NOT NULL,
    unlocked_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS achievement_points INT NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS win_streak INT NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS puzzle_streak INT NOT NULL DEFAULT 0;

GRANT SELECT, INSERT, UPDATE ON user_achievements TO anon;
GRANT USAGE, SELECT ON SEQUENCE user_achievements_id_seq TO anon;
