-- Organization account application approval & per-organization candidate access consent.

ALTER TABLE users
  ADD COLUMN org_request_status ENUM('none', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'none';

UPDATE users
SET org_request_status = 'approved'
WHERE role = 'organization';

CREATE TABLE prospect_access_requests (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  organization_id INT NOT NULL,
  candidate_id    INT NOT NULL,
  status          ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  requested_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at    TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT uq_org_candidate UNIQUE (organization_id, candidate_id),
  CONSTRAINT fk_par_org
    FOREIGN KEY (organization_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_par_candidate
    FOREIGN KEY (candidate_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_par_candidate ON prospect_access_requests(candidate_id);
CREATE INDEX idx_par_org ON prospect_access_requests(organization_id);
