# SkillSwap

The Vue frontend lives in `frontend/`; the Express backend lives in `backend/`.
See their setup notes for running each application.

## Formatting

Run `npm install` **in the repository root** once after cloning to install
Prettier. Frontend/backend dependencies
are installed separately in their respective directories.

```sh
npm run format
npm run format:check
```

Formatting does not block local pushes. The commands above are optional local tools.
GitHub Actions runs Prettier on every push and pull request and commits formatting
fixes back to branches in this repository. After an automatic formatting commit,
run `git pull --ff-only` before continuing locally. Pull requests from forks are
formatted in CI, but the workflow cannot push fixes back to those forks.
Repository rules must allow GitHub Actions to push formatting commits to the branch.

Formatting covers supported frontend/backend source, CSS, JSON, Markdown, and
workflow files. Dependencies, builds, lockfiles, credentials, and SQL migrations
are ignored. SQL migration contents must remain unchanged once applied because
the migration runner checks their checksums.

The dashboard styles use a mobile base layout and `min-width` breakpoints to
add tablet and desktop layouts.
