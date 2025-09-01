-- Drop and recreate the repeat_with_me_game table with all 12 rounds
-- WARNING: This will delete all existing data!

-- Drop the existing table
DROP TABLE IF EXISTS repeat_with_me_game;

-- Create the new table with all 12 rounds
CREATE TABLE repeat_with_me_game (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    date_time TIMESTAMP NOT NULL,
    child_id VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    
    -- Round scores for all 12 rounds
    round1Score DOUBLE PRECISION,
    round2Score DOUBLE PRECISION,
    round3Score DOUBLE PRECISION,
    round4Score DOUBLE PRECISION,
    round5Score DOUBLE PRECISION,
    round6Score DOUBLE PRECISION,
    round7Score DOUBLE PRECISION,
    round8Score DOUBLE PRECISION,
    round9Score DOUBLE PRECISION,
    round10Score DOUBLE PRECISION,
    round11Score DOUBLE PRECISION,
    round12Score DOUBLE PRECISION,
    
    -- Target text for all 12 rounds
    round1TargetText VARCHAR(1000),
    round2TargetText VARCHAR(1000),
    round3TargetText VARCHAR(1000),
    round4TargetText VARCHAR(1000),
    round5TargetText VARCHAR(1000),
    round6TargetText VARCHAR(1000),
    round7TargetText VARCHAR(1000),
    round8TargetText VARCHAR(1000),
    round9TargetText VARCHAR(1000),
    round10TargetText VARCHAR(1000),
    round11TargetText VARCHAR(1000),
    round12TargetText VARCHAR(1000),
    
    -- Transcribed text for all 12 rounds
    round1TranscribedText VARCHAR(1000),
    round2TranscribedText VARCHAR(1000),
    round3TranscribedText VARCHAR(1000),
    round4TranscribedText VARCHAR(1000),
    round5TranscribedText VARCHAR(1000),
    round6TranscribedText VARCHAR(1000),
    round7TranscribedText VARCHAR(1000),
    round8TranscribedText VARCHAR(1000),
    round9TranscribedText VARCHAR(1000),
    round10TranscribedText VARCHAR(1000),
    round11TranscribedText VARCHAR(1000),
    round12TranscribedText VARCHAR(1000),
    
    -- Other fields
    averageScore DOUBLE PRECISION,
    completedRounds INTEGER,
    isTrainingAllowed BOOLEAN NOT NULL,
    suspectedASD BOOLEAN NOT NULL,
    isASD BOOLEAN
);

-- Create indexes for better performance
CREATE INDEX idx_repeat_with_me_game_child_id ON repeat_with_me_game(child_id);
CREATE INDEX idx_repeat_with_me_game_session_id ON repeat_with_me_game(session_id);
CREATE INDEX idx_repeat_with_me_game_date_time ON repeat_with_me_game(date_time);

-- Verify the table structure
-- \d repeat_with_me_game;
