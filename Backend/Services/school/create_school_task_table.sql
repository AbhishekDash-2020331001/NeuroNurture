-- Migration script to create 'school_task' table

CREATE TABLE school_task (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL,
    school_id BIGINT NOT NULL,
    child_id BIGINT NOT NULL,
    game_id INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    task_title VARCHAR(255),
    task_description TEXT,
    status VARCHAR(50) DEFAULT 'ASSIGNED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_school_task_task_id ON school_task(task_id);
CREATE INDEX idx_school_task_school_id ON school_task(school_id);
CREATE INDEX idx_school_task_child_id ON school_task(child_id);
CREATE INDEX idx_school_task_status ON school_task(status);
CREATE INDEX idx_school_task_game_id ON school_task(game_id);

-- Add unique constraint to prevent duplicate assignments
CREATE UNIQUE INDEX idx_school_task_unique ON school_task(task_id, child_id);

-- Add comments for documentation
COMMENT ON TABLE school_task IS 'Stores tasks assigned by schools to children with bit-mapped game selection';
COMMENT ON COLUMN school_task.id IS 'Auto-incrementing primary key';
COMMENT ON COLUMN school_task.task_id IS 'Same task_id for multiple children assigned to the same task';
COMMENT ON COLUMN school_task.game_id IS 'Bit-mapped game selection: 0th bit=Dance Doodle, 1st bit=Gaze Game, 2nd bit=Gesture Game, 3rd bit=Mirror Posture Game, 4th bit=Repeat With Me Game';
COMMENT ON COLUMN school_task.status IS 'Task status: ASSIGNED, IN_PROGRESS, COMPLETED, OVERDUE';
