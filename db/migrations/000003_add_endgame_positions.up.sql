-- Migration: Add endgame_positions table for training mode
-- Date: 2026-01-24

-- Endgame positions table
-- Stores curated endgame positions for training
CREATE TABLE IF NOT EXISTS endgame_positions (
    -- Unique position identifier
    position_id     TEXT PRIMARY KEY,

    -- FEN string for the position
    fen             TEXT NOT NULL,

    -- Solution moves in UCI format (e.g., "e2e4 e7e5 g1f3")
    -- Optional - not all training positions need solutions
    moves           TEXT,

    -- Position difficulty rating (1-3000 scale for compatibility)
    rating          INT NOT NULL DEFAULT 1500 CHECK (rating >= 0 AND rating <= 4000),

    -- Themes/categories as array (e.g., {'pawnEndgame', 'opposition'})
    themes          TEXT[] NOT NULL DEFAULT '{}',

    -- Initial evaluation in centipawns (from white's perspective)
    -- Positive = white advantage, negative = black advantage
    initial_eval    INT,

    -- Human-readable description or title
    description     TEXT,

    -- Source attribution (e.g., "Generated", "Classical Study", etc.)
    source          TEXT,

    -- Import/creation metadata
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for efficient querying
-- Rating index for difficulty-based filtering
CREATE INDEX IF NOT EXISTS endgame_positions_rating_idx ON endgame_positions(rating);

-- Theme filtering using GIN index for array contains queries
CREATE INDEX IF NOT EXISTS endgame_positions_themes_idx ON endgame_positions USING GIN(themes);

-- Add comments for documentation
COMMENT ON TABLE endgame_positions IS 'Endgame training positions for practice mode';
COMMENT ON COLUMN endgame_positions.themes IS 'Array of theme tags (e.g., pawnEndgame, rookEndgame, opposition)';
COMMENT ON COLUMN endgame_positions.rating IS 'Difficulty rating - higher means harder (1-3000 scale)';
