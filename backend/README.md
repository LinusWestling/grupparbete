# Backend sessions

## Minimal experiment monitoring

Apply `016_monitoring.sql` with `npm run migrate` before running this version.
The experiment page offers Privacy (the existing local browser report) and
Monitoring. All authenticated accounts can read `GET /api/monitoring/events`.
Each successful read, including refreshes, writes `monitoring.read` before
returning the latest 100 events. Responses are not cached. There is no client
event-write endpoint and no account-mapping endpoint.

`monitoring_users` is the junction between a real `users.id` and a randomly
generated, stable UUID. `monitoring_events` contains only its own event ID, that
monitoring UUID, an event type, and a server UTC timestamp. Real quiz IDs are
deliberately excluded: joining them to `quizzes.user_id` would bypass the junction.
The log also excludes answers, scores, names, IPs and the privacy experiment's
browser readings. An authorized database operator can resolve an ID through
`monitoring_users`; the HTTP API never performs that join. Keep database access
to the junction restricted. These are pseudonyms, not a guarantee of anonymity:
known activity times can still be correlated with log entries.

Quiz start is recorded when `startQuiz()` creates a new session, including a
session assigned by an organization. It does not claim that an assigned candidate
has opened the quiz. Finish is recorded when the backend accepts a first
completion. Offline finishes appear after synchronization, using server time.
Resuming a quiz or retrying an already completed submission adds no quiz event.
Existing quiz history is not backfilled. For minimalism, the log does not pair
individual attempts; simultaneous quizzes for one monitoring UUID are ambiguous.

Events are inserted inside the existing quiz transaction. A failed quiz operation
rolls back its event; a failed monitoring write also rolls back the quiz operation.
This makes applying the migration before deploying the code mandatory. Reading
the log similarly fails if its access event cannot be saved.

The reusable, dependency-free `shared/monitoring.mjs` supports both Node and Vue.
Only the injected writer depends on the environment. The backend uses an explicit
end-of-operation log so it can commit the event and quiz together:

```js
await databaseMonitor(connection).log(MONITORING_EVENTS.QUIZ_STARTED, { userId })
await connection.commit()
```

For operations that do not require a shared database transaction, a wrapper is
also available. It preserves the operation's return value and `this`, logs after
success, and propagates operation or writer failures:

```js
import { createMonitor, MONITORING_EVENTS } from '../shared/monitoring.mjs'

const monitor = createMonitor(async (event) => {
  // Supply storage or transport appropriate to the caller's environment.
  await saveEvent(event)
})
const monitoredStart = monitor.wrap(startQuiz, MONITORING_EVENTS.QUIZ_STARTED, (result, args) => ({
  userId: args[0],
}))
```

The frontend imports the same module's event labels for display. Quiz logging
stays on the backend to use the authenticated session and confirmed transactions;
the example wrapper is not additionally attached to the existing quiz methods.

## Sessions

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
