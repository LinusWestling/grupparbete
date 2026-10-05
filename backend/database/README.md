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

## Inspect a failed deployment

Run `npm run migrate:status` from `backend` with the same database environment
variables as Render. This is read-only: it lists tables and migration history
in both the configured database and `skillswap`.

A migration is recorded only after its SQL succeeds and its tracking row is
inserted. No history row does not mean no tables or seed data were created.

The original `002_init.sql` contained `USE skillswap`. If `DB_NAME` was different,
the migration switched databases after the runner created its tracking table.
Recording success could then fail with a missing `schema_migrations` table.
The pending-file correction removes database creation and switching; configure
`DB_NAME=defaultdb` on Render. Inspection still reads the old `skillswap` schema
to help identify leftovers; it does not write to either schema.

Temporarily use this Render Start Command to print status before migrating:

```sh
npm run migrate:status && npm run migrate && npm start
```

For inspection without retrying a migration, run only `npm run migrate:status`
in a shell. If 002 appears in the history, restore its exact applied version
before deploying: a new 003 does not bypass the checksum check on an edited 002.
If 002 is absent and defaultdb has no application tables, the corrected 002
can initialize it. If defaultdb already has some application tables, inspect
their definitions and data before retrying; this file is not fully idempotent.

Do not copy the file to 003 expecting it to recover a pending 002: migrations
run in order and stop at the first failure. Do not mark 002 applied until all
of its tables, indexes, and seed data have been verified. Do not edit an
already recorded migration: the runner checks its checksum.

`IF NOT EXISTS` on tables alone does not make the entire file safe to retry.
Standalone index creation can encounter existing indexes; seed inserts can
encounter duplicate usernames/topic names or create duplicate questions.
The seed data also assumes IDs start at 1. A recovery must account for these
as well as which database contains the partially applied schema.
