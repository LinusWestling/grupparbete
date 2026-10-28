-- Migration 013: Add challenges table for competitive quiz feature
-- Allows users to challenge each other to head-to-head quiz competitions

CREATE TABLE IF NOT EXISTS challenges (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Participants
  challenger_user_id INT NOT NULL COMMENT 'User who initiated the challenge',
  challenged_user_id INT NOT NULL COMMENT 'User who received the challenge',

  -- Quiz configuration
  topic_id INT NOT NULL COMMENT 'Topic for the quiz battle',
  difficulty TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Difficulty level 1-5',

  -- Quiz references (set when quizzes are started)
  challenger_quiz_id INT NULL COMMENT 'Quiz session for challenger',
  challenged_quiz_id INT NULL COMMENT 'Quiz session for challenged user',

  -- Status tracking
  status ENUM('pending', 'accepted', 'active', 'completed', 'declined', 'expired')
    NOT NULL DEFAULT 'pending'
    COMMENT 'pending=awaiting accept, accepted=ready to start, active=quiz in progress, completed=both finished, declined=rejected, expired=timeout',

  -- Results
  winner_user_id INT NULL COMMENT 'Winner of the challenge (null if tie)',

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When challenge was created',
  accepted_at TIMESTAMP NULL COMMENT 'When challenge was accepted',
  started_at TIMESTAMP NULL COMMENT 'When both users started their quizzes',
  completed_at TIMESTAMP NULL COMMENT 'When both users finished',
  expires_at TIMESTAMP NULL COMMENT 'Auto-expire time (24h from creation)',

  -- Foreign key constraints
  CONSTRAINT fk_challenges_challenger
    FOREIGN KEY (challenger_user_id) REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_challenges_challenged
    FOREIGN KEY (challenged_user_id) REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_challenges_topic
    FOREIGN KEY (topic_id) REFERENCES topics(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_challenges_challenger_quiz
    FOREIGN KEY (challenger_quiz_id) REFERENCES quizzes(id)
    ON DELETE SET NULL,

  CONSTRAINT fk_challenges_challenged_quiz
    FOREIGN KEY (challenged_quiz_id) REFERENCES quizzes(id)
    ON DELETE SET NULL,

  CONSTRAINT fk_challenges_winner
    FOREIGN KEY (winner_user_id) REFERENCES users(id)
    ON DELETE SET NULL,

  -- Validation constraints
  CONSTRAINT chk_challenge_difficulty CHECK (difficulty BETWEEN 1 AND 5),
  CONSTRAINT chk_different_users CHECK (challenger_user_id != challenged_user_id)

) ENGINE=InnoDB COMMENT='Head-to-head quiz challenges between users';

-- Indexes for performance
CREATE INDEX idx_challenges_challenger ON challenges(challenger_user_id);
CREATE INDEX idx_challenges_challenged ON challenges(challenged_user_id);
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_created ON challenges(created_at);
