-- Update candidate privacy default setting to opt-in (FALSE).

ALTER TABLE users
  MODIFY COLUMN is_public_prospect BOOLEAN NOT NULL DEFAULT FALSE;
