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
