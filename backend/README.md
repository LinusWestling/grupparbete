# Backend sessions

Set `NODE_ENV=production` on Render. Production sessions use the shared MySQL
database configured by `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
and `DB_SSL`. Run `npm run migrate` before starting the updated backend to create
the sessions table. Local HTTP development keeps the in-memory session store.

Keep the same `SESSION_SECRET` across restarts and backend instances. Production
trusts one reverse proxy (Render) and sends Secure, HttpOnly, SameSite=None cookies
so a local frontend can call the hosted backend. Set `FRONTEND_ORIGIN` to the
allowed frontend origin and send requests with `credentials: 'include'`.
Browsers that block third-party cookies may still prevent cross-site sessions.

## Offline quiz synchronization

Run `npm run migrate` before starting this backend version. Migration 011 adds
immutable question snapshots, submitted answers, progress revisions, and saved
final results. New quizzes are graded using exactly the content returned at
startup. Existing quizzes are frozen using the content available when the
migration runs; earlier edits cannot be reconstructed.

Authenticated `POST /api/quizzes/:quizId/submit` accepts a `submissions` array
with exactly one entry per quiz question:

```json
{
  "submissions": [
    { "question_id": 1, "answer": 10, "isSkipped": false },
    { "question_id": 2, "answer": null, "isSkipped": true }
  ]
}
```

An answered entry contains an option ID or a nonempty free-text string. A skipped
entry contains `answer: null`. The server checks ownership and snapshot membership,
then saves progress, grading, completion, and XP in one transaction. Repeating a
completed submission returns its saved result without awarding XP again.

Progress updates include a positive `revision`; older revisions cannot overwrite
newer progress. The Vue store retries transient failures while online and retries
on reconnect, focus, and successful login. Authentication or validation failures
retain local data while waiting for user action. A completed quiz sends all answers
and skips directly, so final submission does not depend on individual saves.
The frontend saves the loaded quiz, answers, position, revisions, and pending
completion in localStorage and restores them after refresh or browser restart.
Reopening the app retries pending saves. Clearing browser site data removes this
local copy. If localStorage is unavailable or full, the UI warns to keep the tab
open until server confirmation. Loading the app itself offline still requires
the app assets to be available; quiz persistence does not provide an offline app cache.
