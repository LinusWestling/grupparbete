-- Soft delete for questions. Hard deletes cascade into quiz_questions and
-- user_answers, which would rewrite completed quiz history. A deleted
-- question keeps its row; deleted_at hides it from new quizzes and listings.
ALTER TABLE questions
  ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

CREATE INDEX idx_questions_deleted ON questions(deleted_at);
