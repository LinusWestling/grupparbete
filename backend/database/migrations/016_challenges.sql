-- Head-to-head quiz challenges between users with turn-based support

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
    current_turn_user_id INT NULL COMMENT 'User whose turn it is to play',
    turn_number INT NOT NULL DEFAULT 1 COMMENT 'Current turn number (1, 2, 3...)',

    -- Status tracking
    status ENUM('pending', 'accepted', 'active', 'completed', 'declined', 'expired')
        NOT NULL DEFAULT 'pending'
        COMMENT 'pending=awaiting accept, accepted=ready to start, active=quiz in progress, completed=both finished, declined=rejected, expired=timeout',

    -- Results
    winner_user_id INT NULL COMMENT 'Winner of the challenge (null if tie)',
    challenger_result_viewed BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether challenger has viewed the result',
    challenged_result_viewed BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether challenged user has viewed the result',

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When challenge was created',
    accepted_at TIMESTAMP NULL COMMENT 'When challenge was accepted',
    started_at TIMESTAMP NULL COMMENT 'When both users started their quizzes',
    completed_at TIMESTAMP NULL COMMENT 'When both users finished',
    expires_at TIMESTAMP NULL COMMENT 'Auto-expire time (24h from creation)',

    -- Foreign key constraints
    CONSTRAINT fk_challenges_challenger FOREIGN KEY (challenger_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_challenges_challenged FOREIGN KEY (challenged_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_challenges_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    CONSTRAINT fk_challenges_challenger_quiz FOREIGN KEY (challenger_quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL,
    CONSTRAINT fk_challenges_challenged_quiz FOREIGN KEY (challenged_quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL,
    CONSTRAINT fk_challenges_current_turn FOREIGN KEY (current_turn_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_challenges_winner FOREIGN KEY (winner_user_id) REFERENCES users(id) ON DELETE SET NULL,

    -- Validation constraints
    CONSTRAINT chk_challenge_difficulty CHECK (difficulty BETWEEN 1 AND 5),
    CONSTRAINT chk_different_users CHECK (challenger_user_id != challenged_user_id),

    -- Indexes
    INDEX idx_challenges_challenger (challenger_user_id),
    INDEX idx_challenges_challenged (challenged_user_id),
    INDEX idx_challenges_current_turn (current_turn_user_id),
    INDEX idx_challenges_status (status),
    INDEX idx_challenges_created (created_at),
    INDEX idx_challenges_result_viewed (challenger_result_viewed, challenged_result_viewed)

) ENGINE=InnoDB COMMENT='Head-to-head quiz challenges between users';
