Run migrations with `npm run migrate`. Uses the same environment variables and
Aiven CA certificate as the backend. Local development reads `backend/.env`.

Render settings (Root Directory: `backend`):
- Build Command: `npm install`
- Start Command: `npm run migrate && npm start`

Commit SQL files in `migrations/` as `001_description.sql`, `002_description.sql`,
etc. The runner executes pending files in filename order, records their checksums
in `schema_migrations`, and skips completed files on later starts. Never edit an
applied migration; add a new one. Commit files with increasing numbers.

The example migration only executes `SELECT 1`. The runner creates its own
tracking table but creates no application tables. Only trusted repository SQL
is executed. Use plain SQL, without MySQL CLI commands such as `DELIMITER`.

A database lock prevents concurrent runners. SQL errors stop startup and are not
recorded as successful. MySQL schema changes can commit immediately: a failed
file or interrupted run can leave partial changes. Inspect and repair these
before retrying; migrations are not automatically rolled back. Keep deployed
schema changes compatible with the previous app version during deployment.
