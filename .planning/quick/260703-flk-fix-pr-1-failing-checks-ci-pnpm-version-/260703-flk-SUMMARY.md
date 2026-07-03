---
phase: quick-260703-flk
plan: 01
subsystem: ci-deploy
tags: [ci, vercel, pnpm, playwright, content-collections]
requires: []
provides:
  - pnpm version pinned via package.json packageManager (pnpm@11.1.2)
  - Vercel deploy forced to Next.js framework preset via vercel.json
  - CI failure-mode evidence doc (.github/CI-TROUBLESHOOTING.md)
  - Real HTTP 200 assertion for case-study detail pages in both locales
  - Deprecation-free content-collections config
affects: [ci, vercel-deploy, evals]
tech-stack:
  added: []
  patterns:
    - package.json packageManager as single source of truth for pnpm version (workflow has no version key)
    - repo-level vercel.json overriding stale dashboard framework preset
key-files:
  created:
    - vercel.json
    - .github/CI-TROUBLESHOOTING.md
  modified:
    - package.json
    - evals/case-studies.spec.ts
    - content-collections.ts
decisions:
  - "pnpm version lives only in package.json packageManager — CI workflow intentionally omits a version key so local and CI can never drift"
  - "vercel.json contains only $schema + framework: nextjs — no buildCommand/outputDirectory overrides, preset defaults are correct"
  - "content-collections deprecations fixed (mechanical renames only): collections→content in defineConfig, explicit content: z.string() in schema"
metrics:
  duration: ~10 minutes
  completed: 2026-07-03
status: complete
---

# Quick Task 260703-flk: Fix PR #1 Failing Checks Summary

Pinned pnpm@11.1.2 via packageManager and forced Vercel's Next.js preset via vercel.json to green both failing PR #1 checks, plus evidence doc, real 200-status assertion, and deprecation-free content-collections config.

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Declare pnpm version + pin Vercel to Next.js preset | cfce146 | package.json, vercel.json |
| 2 | CI failure-mode evidence + tighten 200 assertion | 8acc097 | .github/CI-TROUBLESHOOTING.md, evals/case-studies.spec.ts |
| 3 | Silence content-collections deprecations | b51d9c2 | content-collections.ts |

## What Was Done

**Task 1:** Added `"packageManager": "pnpm@11.1.2"` (exact version that generated pnpm-lock.yaml) so `pnpm/action-setup@v4` resolves the version from package.json. Created `vercel.json` with `"framework": "nextjs"` to override the stale Vite dashboard preset that made the deploy look for a `dist/` output directory. Verified with `pnpm install --frozen-lockfile` (lockfile integrity holds with the pinned version — mitigates T-quick-01).

**Task 2:** Created `.github/CI-TROUBLESHOOTING.md` documenting exactly the two observed PR #1 failures (symptom quoted, root cause, resolution) — no hypothetical padding. Fixed the "page responds with 200" test to capture the `page.goto` response and assert `status() === 200`, removing the misleading comment claiming Playwright throws on 404. All 8 case-study tests pass in both locales.

**Task 3 (opportunistic — completed, not skipped):** Both deprecations were mechanical renames per the bail-out rule's threshold:
- `defineConfig({ collections: [...] })` → `defineConfig({ content: [...] })`
- Added explicit `content: z.string()` to the zod schema (replaces the implicit content property). Raw MDX prose remains available on documents via the schema field + `...doc` spread — the CONT-01 constraint (Phase 2 CV-PDF, v2 AI chat) is preserved and the comment updated to match.

`pnpm build` now completes with zero deprecation warnings.

## Verification

- `pnpm install --frozen-lockfile` — pass (pnpm 11.1.2)
- `pnpm lint` — pass (1 pre-existing warning in generated `.content-collections/generated/` output; out of scope, see Deferred)
- `pnpm exec tsc --noEmit` — pass
- `pnpm build` — pass, no deprecation warnings
- `pnpm exec playwright test evals/case-studies.spec.ts` — 8/8 pass (webServer started by playwright.config.ts; re-run after the content-collections change)
- Post-push check (`gh pr checks 1`) is the orchestrator's step after push

## Deviations from Plan

None — plan executed exactly as written.

## Consciously Skipped (ECC bot suggestions)

- **Config template sync:** Skipped — low value for a solo portfolio repo; no downstream consumers of harness config templates.
- **Harness config quality evidence:** Skipped — same rationale; the CI-TROUBLESHOOTING.md evidence doc covers the genuinely useful part of the suggestion.
- **Extra browser coverage for locale pages:** Not needed — home.spec.ts, i18n.spec.ts, and case-studies.spec.ts already cover both locales; only the weak status assertion was tightened.

## Deferred Issues

- ESLint warning `import/no-anonymous-default-export` in generated file `.content-collections/generated/allCaseStudies.js` — pre-existing, generated code, not actionable in this repo (warning, not error; does not fail CI lint).

## Self-Check: PASSED

- vercel.json — FOUND
- .github/CI-TROUBLESHOOTING.md — FOUND
- Commits cfce146, 8acc097, b51d9c2 — FOUND
