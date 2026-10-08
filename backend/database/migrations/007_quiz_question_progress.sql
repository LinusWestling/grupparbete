ALTER TABLE quiz_questions
  ADD COLUMN is_answered BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN is_skipped BOOLEAN NOT NULL DEFAULT FALSE;

-- Preserve the explicit evaluation state of older attempts.
UPDATE quiz_questions SET is_answered = TRUE WHERE is_correct IS NOT NULL;
