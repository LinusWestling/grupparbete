## Database build and migration

Quiz progress is stored per attempt in `quiz_questions`, using `is_answered`
and `is_skipped`. Both are false for an untouched question; skipping clears its
saved answer and sets only `is_skipped`. Saving an answer sets only `is_answered`.
Migration `007_quiz_question_progress.sql` adds these flags without changing
existing migration files. Run `npm run migrate` before deploying this feature.

New quiz attempts require login. The frontend saves choice answers when selected
and text answers on blur, Save answer, or navigation. Only server-confirmed saves
survive a browser crash or device change. Failed saves remain visible and block
navigation away from that answer; text still being typed has not yet been saved.
Explore lists unfinished quizzes for the logged-in account. Final submission
grades saved answers and awards XP once; saving and skipping do not award XP.

Questions are soft deleted. Migration `008_question_soft_delete.sql` adds
`questions.deleted_at`; DELETE sets it instead of removing the row, because a hard
delete cascades into `quiz_questions` and `user_answers` and rewrites completed
quiz history. Deleted questions are excluded from listings, counts and new
quizzes, but still load in quiz history and already started quizzes.

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

---

## Local deployment in Docker to 'see' database

Follow these instructions:

1. docker compose up -d (in root)
2. Open your browser and navigate to: http://localhost:8080
3. Fill in the login form with these details:
   - System: MySQL
   - Server: db
   - Username: root (or devuser)
   - Password: rootpassword (or devpassword)
   - Database: skillswap
4. Clock login to visually inspect tables, schema structure, data and run test queries.

## If new code has been added to e.g. 002_init.sql

You need to remove the volume and rebuild it:

1. docker compose down -v
2. docker compose up -d
