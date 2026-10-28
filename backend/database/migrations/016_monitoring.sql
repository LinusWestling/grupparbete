-- Only this junction table connects monitoring IDs to real accounts.
CREATE TABLE monitoring_users (
  user_id INT NOT NULL PRIMARY KEY,
  monitoring_user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
  CONSTRAINT fk_monitoring_users_account FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- No real user ID, quiz ID, name, answers, score, browser data or IP address.
-- An ordinary quiz ID would bypass the junction through quizzes.user_id.
CREATE TABLE monitoring_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  monitoring_user_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  event_type ENUM('quiz.started', 'quiz.finished', 'monitoring.read') NOT NULL,
  occurred_at DATETIME(3) NOT NULL,
  CONSTRAINT fk_monitoring_events_user FOREIGN KEY (monitoring_user_id)
    REFERENCES monitoring_users(monitoring_user_id) ON DELETE CASCADE
) ENGINE=InnoDB;
