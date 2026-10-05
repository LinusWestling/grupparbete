# SkillSwap frontend

Vue 3 + Vite with Vue Router and shared design tokens in `styles/`.

## Run locally

```sh
cd frontend
npm install
npm run dev
```

Use `npm run build` for production and `npm run preview` to preview the build.
Node.js requirement: `^22.18.0 || >=24.12.0`.

## Team routes

| URL            | View                                 |
| -------------- | ------------------------------------ |
| `/#/`          | `src/views/HomeView.vue` — dashboard |
| `/#/explore`   | `src/views/ExploreView.vue`          |
| `/#/my-skills` | `src/views/MySkillsView.vue`         |
| `/#/messages`  | `src/views/MessagesView.vue`         |
| `/#/profile`   | `src/views/ProfileView.vue`          |

Each teammate can replace their view's `RoutePlaceholder` with the feature implementation. Non-home pages show Coming soon. The homepage works without a database and displays no fabricated user data.

`src/main.js` installs the router and global styles. `src/App.vue` owns the shared shell. Register routes and navigation in `src/router/index.js`. Use `RouterLink` for internal links. Hash routing supports direct links and refreshes on static hosting without server rewrites. Unknown URLs show a 404 page.

Reuse `styles/variables.css` for design tokens. `styles/dashboard.css` styles the shell and homepage; use scoped styles for feature views. Old Vue starter components and asset styles are unused.

Connect each feature to backend endpoints when they are ready.
