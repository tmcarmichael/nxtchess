CREATE ROLE anon NOLOGIN;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON games TO anon;
GRANT SELECT, INSERT, UPDATE ON rating_history TO anon;

CREATE TABLE IF NOT EXISTS profiles (
    user_id    TEXT PRIMARY KEY,
    username   TEXT UNIQUE,
    rating     INT NOT NULL DEFAULT 1500,
    created_at TIMESTAMP with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS games (
    game_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pgn TEXT NOT NULL,
    playerW_id TEXT,
    playerB_id TEXT,
    stockfish_difficulty INT,
    playerW_start_rating INT,
    playerB_start_rating INT,
    created_at TIMESTAMP with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rating_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  rating INT NOT NULL,
);

CREATE INDEX rating_history_user_id_idx ON rating_history(user_id);
