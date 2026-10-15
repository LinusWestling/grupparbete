ALTER TABLE quiz_questions
  ADD COLUMN question_snapshot JSON NULL,
  ADD COLUMN submitted_answer JSON NULL,
  ADD COLUMN progress_revision INT UNSIGNED NOT NULL DEFAULT 0;

ALTER TABLE quizzes ADD COLUMN result_snapshot JSON NULL;

-- Existing quizzes can only be frozen using content available at migration time.
-- New quizzes store the exact payload before sending it to the browser.
UPDATE quiz_questions qq
JOIN questions q ON q.id = qq.question_id
SET qq.question_snapshot = JSON_OBJECT(
  'id', q.id, 'question_text', q.question_text,
  'question_type', q.question_type, 'difficulty_level', q.difficulty_level,
  'answers', COALESCE((SELECT JSON_ARRAYAGG(JSON_OBJECT(
    'id', a.id, 'answer_text', a.answer_text, 'is_correct', a.is_correct
  )) FROM answers a WHERE a.question_id = q.id), JSON_ARRAY()),
  'sources', COALESCE((SELECT JSON_ARRAYAGG(JSON_OBJECT(
    'id', s.id, 'source_text', s.source_text, 'url', s.url
  )) FROM sources s WHERE s.question_id = q.id), JSON_ARRAY())
);
