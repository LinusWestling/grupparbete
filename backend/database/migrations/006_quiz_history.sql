-- Migration 006: Add quizzes and quiz_questions tables for storing quiz sessions & history tracking
CREATE TABLE IF NOT EXISTS quizzes (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NULL,
  topic_id     INT NOT NULL,
  difficulty   TINYINT UNSIGNED NOT NULL DEFAULT 1,
  total_score  INT NOT NULL DEFAULT 0,
  correct_cnt  INT NOT NULL DEFAULT 0,
  total_cnt    INT NOT NULL DEFAULT 0,
  status       ENUM('in_progress', 'completed') NOT NULL DEFAULT 'in_progress',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  CONSTRAINT fk_quizzes_topic
    FOREIGN KEY (topic_id) REFERENCES topics(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_quizzes_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quiz_questions (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id          INT NOT NULL,
  question_id      INT NOT NULL,
  position         INT NOT NULL DEFAULT 1,
  chosen_answer_id INT NULL,
  free_text_answer TEXT NULL,
  is_correct       BOOLEAN NULL,
  CONSTRAINT fk_qq_quiz
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_qq_question
    FOREIGN KEY (question_id) REFERENCES questions(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_qq_answer
    FOREIGN KEY (chosen_answer_id) REFERENCES answers(id)
    ON DELETE SET NULL,
  CONSTRAINT uq_quiz_question UNIQUE (quiz_id, question_id)
) ENGINE=InnoDB;

CREATE INDEX idx_quizzes_user ON quizzes(user_id);
CREATE INDEX idx_quizzes_topic ON quizzes(topic_id);
CREATE INDEX idx_qq_quiz ON quiz_questions(quiz_id);
