-- Add school_task_id column to repeat_with_me_game table
-- This column tracks if the game session was from a school task or normal practice

ALTER TABLE repeat_with_me_game 
ADD COLUMN school_task_id VARCHAR(255) NULL;

-- Add comment for documentation
COMMENT ON COLUMN repeat_with_me_game.school_task_id IS 'References school_task.id if this session was from a school task, NULL for normal practice';
