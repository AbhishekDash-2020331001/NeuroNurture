-- Migration script to create 'school_tournament' table

CREATE TABLE school_tournament (
    id BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    school_id BIGINT NOT NULL,
    child_id BIGINT NOT NULL,
    game_id INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    tournament_title VARCHAR(255),
    tournament_description TEXT,
    grade_level VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ASSIGNED', -- ASSIGNED, IN_PROGRESS, COMPLETED, OVERDUE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_school_tournament_tournament_id ON school_tournament(tournament_id);
CREATE INDEX idx_school_tournament_school_id ON school_tournament(school_id);
CREATE INDEX idx_school_tournament_child_id ON school_tournament(child_id);
CREATE INDEX idx_school_tournament_status ON school_tournament(status);
CREATE INDEX idx_school_tournament_game_id ON school_tournament(game_id);
CREATE INDEX idx_school_tournament_grade_level ON school_tournament(grade_level);

-- Add unique constraint to prevent duplicate assignments
CREATE UNIQUE INDEX idx_school_tournament_unique ON school_tournament(tournament_id, child_id);

-- Add comments for documentation
COMMENT ON TABLE school_tournament IS 'Stores tournaments assigned by schools to children with bit-mapped game selection';
COMMENT ON COLUMN school_tournament.id IS 'Auto-incrementing primary key';
COMMENT ON COLUMN school_tournament.tournament_id IS 'Same tournament_id for multiple children assigned to the same tournament';
COMMENT ON COLUMN school_tournament.game_id IS 'Bit-mapped game selection: 0th bit=Dance Doodle, 1st bit=Gaze Game, 2nd bit=Gesture Game, 3rd bit=Mirror Posture Game, 4th bit=Repeat With Me Game';
COMMENT ON COLUMN school_tournament.grade_level IS 'Grade level for tournament assignment: Gentle Bloom, Rising Star, Bright Light';
COMMENT ON COLUMN school_tournament.status IS 'Tournament status: ASSIGNED, IN_PROGRESS, COMPLETED, OVERDUE';
