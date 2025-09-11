-- Add tournament_id column to dance_doodle_game table
-- This column tracks if the game session was from a tournament or normal practice

ALTER TABLE dance_doodle_game 
ADD COLUMN tournament_id BIGINT NULL;

-- Add comment for documentation
COMMENT ON COLUMN dance_doodle_game.tournament_id IS 'References school_tournament.tournament_id if this session was from a tournament, NULL for normal practice';
