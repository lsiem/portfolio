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
