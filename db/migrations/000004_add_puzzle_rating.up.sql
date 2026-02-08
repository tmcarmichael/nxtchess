ALTER TABLE profiles ADD COLUMN puzzle_rating INT NOT NULL DEFAULT 1200
    CHECK (puzzle_rating >= 0 AND puzzle_rating <= 4000);

CREATE TABLE IF NOT EXISTS puzzle_rating_history (
    id         SERIAL PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    rating     INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS puzzle_rating_history_user_id_idx ON puzzle_rating_history(user_id);
CREATE INDEX IF NOT EXISTS puzzle_rating_history_created_at_idx ON puzzle_rating_history(created_at DESC);

GRANT SELECT, INSERT, UPDATE ON puzzle_rating_history TO anon;
GRANT USAGE, SELECT ON SEQUENCE puzzle_rating_history_id_seq TO anon;
