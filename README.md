# SkillSwap

The Vue frontend lives in `frontend/`; the Express backend lives in `backend/`.
See their setup notes for running each application.

## Formatting

Run `npm install` **in the repository root** once after cloning to install
Prettier and activate the Husky pre-push hook. Frontend/backend dependencies
are installed separately in their respective directories.

```sh
npm run format
npm run format:check
```

The pre-push hook checks formatting and stops a push if files need formatting.
Run `npm run format`, review and commit the formatting changes, then push again.
GitHub Actions runs the same check on every push and pull request.
To prevent merging unformatted code, require the `Prettier` check in GitHub's
branch protection/ruleset for `main` after the first workflow run.

Formatting covers supported frontend/backend source, CSS, JSON, Markdown, and
workflow files. Dependencies, builds, lockfiles, credentials, and SQL migrations
are ignored. SQL migration contents must remain unchanged once applied because
the migration runner checks their checksums.

The dashboard styles use a mobile base layout and `min-width` breakpoints to
add tablet and desktop layouts.
