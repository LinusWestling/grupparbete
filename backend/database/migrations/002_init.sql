CREATE DATABASE IF NOT EXISTS skillswap
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE skillswap;

-- ------------------------------------------------------------
-- USERS
-- Accounts for regular users and admins/experts who author
-- question content.
-- ------------------------------------------------------------
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TOPICS
-- Quiz categories, e.g. "Anatomi", "Träningslära", "Fysiologi".
-- ------------------------------------------------------------
CREATE TABLE topics (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- QUESTIONS
-- The core quiz content. question_type distinguishes how the
-- frontend should render and grade the question; the actual
-- answer options/correct answer always live in ANSWERS, so the
-- frontend and API don't need per-type branching logic.
-- ------------------------------------------------------------
CREATE TABLE questions (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  topic_id         INT NOT NULL,
  created_by       INT NULL,
  question_type    ENUM('multiple_choice', 'yes_no', 'free_text')
                    NOT NULL DEFAULT 'multiple_choice',
  question_text    TEXT NOT NULL,
  difficulty_level TINYINT UNSIGNED NOT NULL DEFAULT 1,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_difficulty CHECK (difficulty_level BETWEEN 1 AND 5),
  CONSTRAINT fk_questions_topic
    FOREIGN KEY (topic_id) REFERENCES topics(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_questions_user
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_type  ON questions(question_type);

-- ------------------------------------------------------------
-- ANSWERS
-- Answer options for a question.
--   - multiple_choice: several rows, exactly one is_correct = TRUE
--   - yes_no:          two rows ("Ja"/"Nej"), one is_correct = TRUE
--   - free_text:       one row holding the model/correct answer
--                       in answer_text, is_correct = TRUE
-- ------------------------------------------------------------
CREATE TABLE answers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  answer_text TEXT NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_answers_question
    FOREIGN KEY (question_id) REFERENCES questions(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_answers_question ON answers(question_id);

-- ------------------------------------------------------------
-- SOURCES
-- Reference material cited for a question, for users who want
-- to go deeper (källförteckning).
-- ------------------------------------------------------------
CREATE TABLE sources (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  source_text VARCHAR(255) NOT NULL,
  url         VARCHAR(500),
  CONSTRAINT fk_sources_question
    FOREIGN KEY (question_id) REFERENCES questions(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_sources_question ON sources(question_id);

-- ------------------------------------------------------------
-- USER_PROGRESS
-- One row per user per topic: tracks level/XP for the
-- gamification and leveling system.
-- ------------------------------------------------------------
CREATE TABLE user_progress (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT NOT NULL,
  topic_id          INT NOT NULL,
  level             INT NOT NULL DEFAULT 1,
  xp_points         INT NOT NULL DEFAULT 0,
  last_activity_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                      ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_user_topic UNIQUE (user_id, topic_id),
  CONSTRAINT fk_progress_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_progress_topic
    FOREIGN KEY (topic_id) REFERENCES topics(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- USER_ANSWERS
-- Log of every quiz attempt. Powers the daily streak /
-- "5 minutes a day" mechanic and the daily logs.
-- ------------------------------------------------------------
CREATE TABLE user_answers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  question_id INT NOT NULL,
  answer_id   INT NULL,
  is_correct  BOOLEAN NOT NULL,
  answered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ua_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ua_question
    FOREIGN KEY (question_id) REFERENCES questions(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_ua_answer
    FOREIGN KEY (answer_id) REFERENCES answers(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_ua_user ON user_answers(user_id);
CREATE INDEX idx_ua_question ON user_answers(question_id);

-- ============================================================
-- Seed data — enough to start testing CRUD endpoints right away
-- ============================================================

INSERT INTO topics (name, description) VALUES
  ('Anatomi', 'Kroppens uppbyggnad: muskler, skelett och leder.'),
  ('Träningslära', 'Principer för styrketräning, konditionsträning och återhämtning.'),
  ('Fysiologi', 'Kroppens funktioner vid fysisk aktivitet.');

INSERT INTO users (username, email, password_hash, role) VALUES
  ('admin_magnus', 'admin@skillswap.se', 'REPLACE_WITH_HASHED_PASSWORD', 'admin');

-- Example multiple_choice question
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES (1, 1, 'multiple_choice', 'Vilken muskel är den största i människokroppen?', 2);

INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (1, 'Gluteus maximus', TRUE),
  (1, 'Biceps brachii', FALSE),
  (1, 'Deltoideus', FALSE),
  (1, 'Trapezius', FALSE);

-- Example yes_no question
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES (2, 1, 'yes_no', 'Stämmer det att vila mellan träningspass är viktigt för muskeltillväxt?', 1);

INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (2, 'Ja', TRUE),
  (2, 'Nej', FALSE);

-- Example free_text question
INSERT INTO questions (topic_id, created_by, question_type, question_text, difficulty_level)
VALUES (3, 1, 'free_text', 'Vad kallas processen där kroppen bryter ner kolhydrater till energi?', 3);

INSERT INTO answers (question_id, answer_text, is_correct) VALUES
  (3, 'Glykolys', TRUE);

INSERT INTO sources (question_id, source_text, url) VALUES
  (1, 'Kenhub - Anatomy of the Gluteus Maximus', 'https://www.kenhub.com/en/library/anatomy/gluteus-maximus'),
  (3, 'Khan Academy - Glycolysis', 'https://www.khanacademy.org/science/biology/cellular-respiration-and-fermentation/glycolysis');