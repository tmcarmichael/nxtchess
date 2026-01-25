-- Migration: Add foreign key constraints and indexes
-- Run this on existing databases to add constraints

-- Add result column to games if it doesn't exist
ALTER TABLE games ADD COLUMN IF NOT EXISTS result TEXT;

-- Add created_at to rating_history if it doesn't exist
ALTER TABLE rating_history ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add foreign key constraints (these will fail if orphaned data exists)
-- Clean up orphaned data first if needed:
-- DELETE FROM games WHERE playerW_id IS NOT NULL AND playerW_id NOT IN (SELECT user_id FROM profiles);
-- DELETE FROM games WHERE playerB_id IS NOT NULL AND playerB_id NOT IN (SELECT user_id FROM profiles);
-- DELETE FROM rating_history WHERE user_id NOT IN (SELECT user_id FROM profiles);

DO $$
BEGIN
    -- Add FK for games.playerW_id if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'games_playerw_id_fkey' AND table_name = 'games'
    ) THEN
        ALTER TABLE games ADD CONSTRAINT games_playerw_id_fkey
            FOREIGN KEY (playerW_id) REFERENCES profiles(user_id) ON DELETE SET NULL;
    END IF;

    -- Add FK for games.playerB_id if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'games_playerb_id_fkey' AND table_name = 'games'
    ) THEN
        ALTER TABLE games ADD CONSTRAINT games_playerb_id_fkey
            FOREIGN KEY (playerB_id) REFERENCES profiles(user_id) ON DELETE SET NULL;
    END IF;

    -- Add FK for rating_history.user_id if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'rating_history_user_id_fkey' AND table_name = 'rating_history'
    ) THEN
        ALTER TABLE rating_history ADD CONSTRAINT rating_history_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS games_playerW_id_idx ON games(playerW_id);
CREATE INDEX IF NOT EXISTS games_playerB_id_idx ON games(playerB_id);
CREATE INDEX IF NOT EXISTS games_created_at_idx ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS games_result_idx ON games(result);
CREATE INDEX IF NOT EXISTS games_created_result_idx ON games(created_at DESC, result);
CREATE INDEX IF NOT EXISTS rating_history_created_at_idx ON rating_history(created_at DESC);

-- Add CHECK constraint on profiles.rating if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'profiles_rating_check' AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_rating_check
            CHECK (rating >= 0 AND rating <= 4000);
    END IF;
END $$;
