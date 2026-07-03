# CI Troubleshooting

Real failure modes observed on this repository, with symptom, root cause, and resolution.
Evidence-based only — do not pad this file with hypothetical failures.

## Failure 1: "Setup pnpm" step fails — no pnpm version specified

**Observed on:** PR #1 (`cursor/portfolio-rewrite-a2cc`), "Lint & Build" job

**Symptom:**

```
Error: No pnpm version is specified.
Please specify it by one of the following ways:
  - in the GitHub Action config with the key "version"
  - in the package.json with the key "packageManager"
```

**Root cause:** `pnpm/action-setup@v4` needs a pnpm version from either the action's
`version` input or the `packageManager` field in `package.json`. Neither was set.

**Resolution:** Added `"packageManager": "pnpm@11.1.2"` to `package.json` — the exact
local version that generated `pnpm-lock.yaml`. The workflow intentionally omits a
`version` key on the action so `package.json` stays the single source of truth and
CI can never drift from local.

## Failure 2: Vercel deploy fails — missing `dist` output directory

**Observed on:** PR #1 Vercel preview deployment (build itself succeeded)

**Symptom:**

```
Error: No Output Directory named "dist" found after the Build completed.
You can configure the Output Directory in your Project Settings.
```

**Root cause:** The Vercel project dashboard still carried the Vite framework preset
from the discarded SPA build. After a successful `next build`, Vercel looked for
Vite's `dist/` output instead of Next.js's `.next/`.

**Resolution:** Added a repo-level `vercel.json` with `"framework": "nextjs"`, which
overrides the stale dashboard preset. No `buildCommand`/`outputDirectory` overrides —
the Next.js preset defaults are correct.

## Failure 3: "Setup Node.js" step fails — pnpm 11 requires Node ≥ 22.13

**Observed on:** PR #1 (`cursor/portfolio-rewrite-a2cc`), "Lint & Build" job, first run
after Failure 1 was fixed

**Symptom:**

```
Error [ERR_UNKNOWN_BUILTIN_MODULE]: No such built-in module: node:sqlite
##[error]warn: This version of pnpm requires at least Node.js v22.13
warn: The current version of Node.js is v20.20.2
```

**Root cause:** The workflow pinned `node-version: 20`, but pnpm 11 (pinned via
`packageManager`) imports `node:sqlite`, which only exists in Node ≥ 22.13. GitHub
also deprecated Node 20 on Actions runners.

**Resolution:** Bumped `actions/setup-node` to `node-version: 22`, matching the
Vercel project's Node 22.x runtime so CI and deploy run the same major version.
