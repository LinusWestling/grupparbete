-- Migration 015: Track if each player has viewed the challenge result
-- Allows challenge to stay in active tab until both players have seen the result

ALTER TABLE challenges
ADD COLUMN challenger_result_viewed BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether challenger has viewed the result' AFTER winner_user_id,
ADD COLUMN challenged_result_viewed BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether challenged user has viewed the result' AFTER challenger_result_viewed;

-- Add index for filtering
CREATE INDEX idx_challenges_result_viewed ON challenges(challenger_result_viewed, challenged_result_viewed);
