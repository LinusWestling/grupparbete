-- Migration 014: Add turn-based support to challenges
-- Allows challenges to be played in turns where each player completes their quiz before the other starts

ALTER TABLE challenges
ADD COLUMN current_turn_user_id INT NULL COMMENT 'User whose turn it is to play' AFTER challenged_quiz_id,
ADD COLUMN turn_number INT NOT NULL DEFAULT 1 COMMENT 'Current turn number (1, 2, 3...)' AFTER current_turn_user_id,
ADD CONSTRAINT fk_challenges_current_turn
  FOREIGN KEY (current_turn_user_id) REFERENCES users(id)
  ON DELETE SET NULL;

-- Add index for current turn
CREATE INDEX idx_challenges_current_turn ON challenges(current_turn_user_id);
