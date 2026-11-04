ALTER TABLE quizzes
  ADD COLUMN organization_id INT NULL,
  ADD CONSTRAINT fk_quizzes_organization FOREIGN KEY (organization_id)
    REFERENCES users(id) ON DELETE SET NULL,
  ADD INDEX idx_quizzes_organization_candidate (organization_id, user_id);
