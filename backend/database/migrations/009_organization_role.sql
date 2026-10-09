-- Organization Role and Candidate Privacy Settings.
-- Expands users.role ENUM to support 'organization' alongside 'user' and 'admin'.
-- Adds is_public_prospect column so users can toggle sharing their results with organizations.

ALTER TABLE users
  MODIFY COLUMN role ENUM('user', 'admin', 'organization') NOT NULL DEFAULT 'user',
  ADD COLUMN is_public_prospect BOOLEAN NOT NULL DEFAULT TRUE;
