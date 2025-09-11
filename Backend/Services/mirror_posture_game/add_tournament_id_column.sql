-- Add tournament_id column to mirror_posture_game table
-- This column tracks if the game session was from a tournament or normal practice

ALTER TABLE mirror_posture_game 
ADD COLUMN tournament_id BIGINT NULL;

-- Add comment for documentation
COMMENT ON COLUMN mirror_posture_game.tournament_id IS 'References school_tournament.tournament_id if this session was from a tournament, NULL for normal practice';
