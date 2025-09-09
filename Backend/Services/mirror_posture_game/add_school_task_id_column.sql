-- Add school_task_id column to mirror_posture_game table
-- This column tracks if the game session was from a school task or normal practice

ALTER TABLE mirror_posture_game 
ADD COLUMN school_task_id VARCHAR(255) NULL;

-- Add comment for documentation
COMMENT ON COLUMN mirror_posture_game.school_task_id IS 'References school_task.id if this session was from a school task, NULL for normal practice';
