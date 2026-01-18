-- Roles
CREATE ROLE anon NOLOGIN;
GRANT USAGE ON SCHEMA public TO anon;

-- Profiles table (must be created first for foreign key references)
CREATE TABLE IF NOT EXISTS profiles (
    user_id    TEXT PRIMARY KEY,
    username   TEXT UNIQUE,
    rating     INT NOT NULL DEFAULT 1500 CHECK (rating >= 0 AND rating <= 4000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON profiles TO anon;

-- Games table with foreign key constraints
CREATE TABLE IF NOT EXISTS games (
    game_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pgn                  TEXT NOT NULL,
    playerW_id           TEXT REFERENCES profiles(user_id) ON DELETE SET NULL,
    playerB_id           TEXT REFERENCES profiles(user_id) ON DELETE SET NULL,
    stockfish_difficulty INT,
    playerW_start_rating INT,
    playerB_start_rating INT,
    result               TEXT,  -- '1-0', '0-1', '1/2-1/2', '*' (ongoing)
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON games TO anon;

-- Indexes for efficient game lookups
CREATE INDEX IF NOT EXISTS games_playerW_id_idx ON games(playerW_id);
CREATE INDEX IF NOT EXISTS games_playerB_id_idx ON games(playerB_id);
CREATE INDEX IF NOT EXISTS games_created_at_idx ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS games_result_idx ON games(result);
CREATE INDEX IF NOT EXISTS games_created_result_idx ON games(created_at DESC, result);

-- Rating history with foreign key constraint
CREATE TABLE IF NOT EXISTS rating_history (
    id         SERIAL PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    rating     INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON rating_history TO anon;

CREATE INDEX IF NOT EXISTS rating_history_user_id_idx ON rating_history(user_id);
CREATE INDEX IF NOT EXISTS rating_history_created_at_idx ON rating_history(created_at DESC);
