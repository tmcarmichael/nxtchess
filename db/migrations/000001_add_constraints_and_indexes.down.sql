-- Down migration: Remove constraints and indexes
-- Note: This is a destructive operation - use with caution

DROP INDEX IF EXISTS idx_profiles_username_lower;
DROP INDEX IF EXISTS idx_profiles_user_id;
DROP INDEX IF EXISTS idx_rating_history_user_id_created_at;
DROP INDEX IF EXISTS idx_games_created_at;
DROP INDEX IF EXISTS idx_games_player_w_id;
DROP INDEX IF EXISTS idx_games_player_b_id;
