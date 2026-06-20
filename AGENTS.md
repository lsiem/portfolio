# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **single, frontend-only** product: a personal portfolio website
(React 19 + Vite 7 + Tailwind CSS v4). There is **no backend and no database** —
the only runtime service is the Vite dev server. Standard commands live in
`package.json` (`dev`, `build`, `lint`, `preview`) and the `README.md`.

Dependencies are refreshed automatically on startup via the update script
(`npm install`), so you normally don't need to install anything manually.

### Running / building (non-obvious notes)

- **Dev server:** `npm run dev` serves on `http://localhost:5173` (Vite default,
  not overridden). HMR picks up source edits, including changes to
  `src/config/personal.js`, without a restart.
- **Maintenance-mode gotcha:** the site ships with `isMaintenanceMode: true` in
  `src/config/personal.js`. While that flag is `true`, the entire portfolio
  (hero, sections, contact form) is replaced by a "Hier entsteht etwas Neues"
  placeholder. To see/test the real site, temporarily set it to `false`
  (and revert before committing unless the change is intended).
- The hero's 3D Spline graphic loads from an external CDN at runtime; it needs
  internet access but no credentials, and is wrapped in an `ErrorBoundary` so it
  degrades gracefully when unavailable.

### Contact form

- `src/hooks/useContactForm.js` only does **client-side validation plus a
  simulated ~1s submission** — no email is actually sent (the real email
  integration is a `TODO`). On success the form fields simply reset to their
  placeholders; there is no toast/confirmation. This is expected behavior, not a
  bug.

### Lint (currently broken — pre-existing repo bug)

- `npm run lint` **fails** because `eslint.config.js` enables the
  `react/jsx-uses-vars` rule but `eslint-plugin-react` is not installed or
  registered as a plugin. This is a pre-existing config bug, unrelated to
  environment setup. Fixing it requires adding/registering `eslint-plugin-react`
  (a code change), so it is intentionally left untouched here.

### Testing

- There is no automated test framework configured (see `WARP.md`).
  "Testing" means loading the site in a browser and exercising flows such as the
  contact form.
