---
phase: 02-recruiter-overview-live
plan: 07
subsystem: infra
tags: [production-cutover, launch, seo, vercel, dns, nextjs]

# Dependency graph
requires:
  - phase: 02-recruiter-overview-live/02-06
    provides: "Security headers, tightened LHCI CWV budget (LCP<=2500/TBT<=200/CLS<=0.1), accessibility eval, and the confirmed-outstanding GITHUB_TOKEN Vercel Production gate this plan resolves before promotion"
provides:
  - "siteMetadataBase flipped to https://lsiem.de for production builds (src/lib/seo.ts) — all absolute OG/canonical/hreflang URLs resolve to the real domain"
  - "Real, contactable § 5 DDG postal address in the Impressum (content/{de,en}/pages/impressum.mdx), clearing the legal pre-cutover gate"
  - "Confirmed GITHUB_TOKEN present in Vercel Production env (heatmap ships real data, not the fallback)"
  - "One PR (#12, phase/02-recruiter-overview-live -> main) carrying the full Phase-2 cutover, green CI, promoted to production"
  - "Human-verified live production site on https://lsiem.de (both locales): 30-second stopwatch test, one-click contact, CV download, dark-mode toggle, OG cards, Person JSON-LD, hreflang, mobile CWV"
affects: [phase-3-design-direction]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Domain flip gated behind NODE_ENV === 'production' in src/lib/seo.ts — no separate env var needed; local dev keeps the localhost fallback unconditionally"

key-files:
  created: []
  modified:
    - src/lib/seo.ts
    - content/de/pages/impressum.mdx
    - content/en/pages/impressum.mdx

key-decisions:
  - "siteMetadataBase resolves on NODE_ENV==='production' rather than a VERCEL_PROJECT_PRODUCTION_URL fallback, per CTX-06's explicit preference for a fixed production origin over inferring the domain from Vercel's per-deployment env var — avoids any risk of a preview deployment accidentally emitting production-looking absolute URLs."
  - "GITHUB_TOKEN (read-only read:user PAT, account lsiem) confirmed set in Vercel Production before promotion — resolves the blocking gate carried forward from 02-06 (vercel env ls production previously returned no vars); the production build now bakes real contribution data into the heatmap instead of the static fallback line."
  - "ITSC 'Software Engineering' sub-role date range (content/{de,en}/career.ts, from/to both null) was reviewed against the owner-confirmed overall ITSC tenure ('seit Juni 2024', already correct in the overall entry) and accepted as-is: the graceful null-rendering guard (formatMonth, shipped in Plan 01) already avoids a broken/ambiguous date display, so no content change was required for this sub-role — carried decision, not a new one."

requirements-completed: [TECH-01]

# Coverage metadata
coverage:
  - id: D1
    description: "siteMetadataBase resolves to https://lsiem.de for production builds; pnpm build emits absolute OG/canonical/hreflang URLs pointing at the real domain; local dev unaffected"
    requirement: "TECH-01"
    verification:
      - kind: other
        ref: "pnpm build && node -e domain-flip guard script (checks src/lib/seo.ts source for lsiem.de) — 'domain flip present'"
        status: pass
    human_judgment: false
  - id: D2
    description: "GITHUB_TOKEN confirmed present in Vercel Production env before the production build (blocking gate carried from 02-06, REVIEW finding 6)"
    requirement: "TECH-01"
    verification:
      - kind: manual_procedural
        ref: "vercel env ls production (authenticated CLI) confirmed GITHUB_TOKEN present, resolving the gap 02-06 flagged as failing"
        status: pass
    human_judgment: true
    rationale: "Confirming a secret's presence in a third-party dashboard/CLI and generating the PAT itself is an owner action this executor cannot originate or independently re-verify from the repo; recorded as human-confirmed per the checkpoint approval."
  - id: D3
    description: "Impressum § 5 DDG placeholder replaced with a real, contactable postal address in both locales before promotion (legal launch blocker, REVIEW finding 12)"
    requirement: "TECH-01"
    verification:
      - kind: other
        ref: "git show fa7c1fb --stat (content/de/pages/impressum.mdx, content/en/pages/impressum.mdx, +12/-10)"
        status: pass
    human_judgment: false
  - id: D4
    description: "CV PDFs (public/Lasse-Siemoneit-CV-{de,en}.pdf) exist and resolve on the live site (no 404) via the prebuild -> generate:cv chain"
    requirement: "TECH-01"
    verification: []
    human_judgment: true
    rationale: "Verified as part of the human checkpoint's live walkthrough of https://lsiem.de, not re-derivable from a local automated check against a production URL this executor cannot reach directly."
  - id: D5
    description: "PR #12 (phase/02-recruiter-overview-live -> main) opened, CI green (GitGuardian, content-parity/build/LHCI, Vercel preview checks), and promoted to production"
    requirement: "TECH-01"
    verification:
      - kind: manual_procedural
        ref: "https://github.com/lsiem/portfolio/pull/12 — human-confirmed green CI and production promotion"
        status: pass
    human_judgment: true
    rationale: "PR merge/promotion state on GitHub/Vercel is an external dashboard action outside this repo's automated test surface; confirmed via the human checkpoint approval."
  - id: D6
    description: "Live 30-second stopwatch test passes on https://lsiem.de/de and /en; one-click contact, CV download, 3-state theme toggle, and the GitHub heatmap (real data) all work on the live site; OG cards + Person JSON-LD + hreflang verified; mobile Lighthouse confirms CWV 'good' with zero unsanctioned runtime third-party calls"
    requirement: "TECH-01"
    verification: []
    human_judgment: true
    rationale: "This is exactly the class of live-production, human-judgment verification the plan's checkpoint:human-verify task exists for (external tester timing, visual OG-card rendering, real-device Lighthouse) — the human typed 'approved' after completing all ten how-to-verify steps in the plan."
  - id: D7
    description: "ITSC 'Software Engineering' sub-role date range (career chronology confirmation, REVIEW finding 11) reviewed by the owner; graceful null-rendering guard accepted, no broken/ambiguous range ships"
    requirement: "TECH-01"
    verification: []
    human_judgment: true
    rationale: "Owner-supplied confirmation of a biographical fact (career dates) cannot be automated or independently verified by the executor."

# Metrics
duration: ~15min (Task 1 auto) + human verification session (Task 2 checkpoint)
completed: 2026-07-05
status: complete
---

# Phase 2 Plan 7: Production Cutover to lsiem.de Summary

**Flipped `siteMetadataBase` to `https://lsiem.de` in production builds, cleared all four blocking pre-cutover gates (GITHUB_TOKEN in Vercel Production, real Impressum postal address, CV-PDF no-404, career chronology confirmation), and shipped the complete Phase-2 recruiter site to production via PR #12 — human-verified live on https://lsiem.de in both locales.**

## Performance

- **Duration:** Task 1 (auto) ~15 min; Task 2 (checkpoint:human-verify) — human verification session, approved 2026-07-05
- **Started:** 2026-07-05 (continuation of Plan 06's Wave 4 handoff)
- **Completed:** 2026-07-05
- **Tasks:** 2 (1 auto, 1 checkpoint:human-verify — both complete)
- **Files modified:** 3 (`src/lib/seo.ts`, `content/de/pages/impressum.mdx`, `content/en/pages/impressum.mdx`)

## Accomplishments

- `src/lib/seo.ts`: `siteMetadataBase` now resolves to `https://lsiem.de` when `NODE_ENV === "production"` (localhost fallback preserved for local dev) — every absolute canonical URL, hreflang alternate (via `localeAlternates`), and OG image URL in production output points at the real domain. Verified with `pnpm build` plus a source-guard script confirming `lsiem.de` is present.
- Closed the legal pre-cutover gate (REVIEW finding 12): replaced the § 5 DDG placeholder in both `content/de/pages/impressum.mdx` and `content/en/pages/impressum.mdx` with Lasse Siemoneit's real, contactable postal address (Asternweg 7, 26209 Hatten).
- Closed the GITHUB_TOKEN gate (REVIEW finding 6, carried forward as failing from Plan 06's `vercel env ls production` check): confirmed the read-only `read:user` PAT is now set in the Vercel Production environment, so the production build bakes real contribution data into the GitHub activity heatmap instead of the static fallback line.
- Confirmed the CV no-404 gate (REVIEW finding 4): both `public/Lasse-Siemoneit-CV-de.pdf` and `-en.pdf` are generated by the `prebuild -> generate:cv` chain and resolve correctly.
- Reviewed the ITSC career chronology confirmation (REVIEW finding 11): owner confirmed "seit Juni 2024" for the overall ITSC tenure (already correctly rendered); the "Software Engineering" sub-role's `from`/`to: null` fields render gracefully via the existing `formatMonth` guard (shipped in Plan 01) rather than a broken/ambiguous date — accepted as-is, no content change needed.
- Opened one PR (#12, `phase/02-recruiter-overview-live` -> `main`, per CTX-07) carrying the entire Phase-2 cutover; CI ran green (GitGuardian secret scan, content-parity/confidentiality gate, build, LHCI budget, Vercel preview checks). Promoted the verified build to production.
- Human ran the full live verification pass on `https://lsiem.de/de` and `/en`: the 30-second stopwatch test (a fresh external tester finds who/what/contact within 30 seconds with no intro gate), one-click contact, CV download (locale-correct, selectable text), the 3-state theme toggle (persists, no flash), the GitHub heatmap (real data, monochrome), shared-link OG cards and Person JSON-LD, hreflang correctness, and mobile Lighthouse CWV "good" with no unsanctioned runtime third-party network calls — and typed "approved".

## Task Commits

Each task was committed atomically:

1. **Task 1: Flip siteMetadataBase to the production domain** - `2c98ccc` (feat)
2. **Task 2 supporting change: real § 5 DDG postal address in Impressum (DE/EN)** - `fa7c1fb` (feat) — auto-fix applied while clearing Task 2's blocking legal gate, per the plan's own explicit pre-cutover gate list (not a plan deviation; the plan's `<how-to-verify>` step 2 required this exact fix before promotion)

**Plan metadata:** committed together with this SUMMARY (see final commit in this plan's history)

_Task 2 (checkpoint:human-verify) itself produces no code diff — it is the human-gated promotion and live-verification gate. Its supporting Impressum fix is committed as `fa7c1fb`; GITHUB_TOKEN confirmation, PR #12, and production promotion are external Vercel/GitHub actions with no local commit._

## Files Created/Modified

- `src/lib/seo.ts` - `siteMetadataBase` flipped to `https://lsiem.de` for production builds (CTX-06)
- `content/de/pages/impressum.mdx` - real § 5 DDG postal address (DE)
- `content/en/pages/impressum.mdx` - real § 5 DDG postal address (EN)

## Decisions Made

- `siteMetadataBase` resolves via `NODE_ENV === "production"` rather than Vercel's per-deployment `VERCEL_PROJECT_PRODUCTION_URL`, keeping the production origin fixed and independent of which Vercel deployment triggers the build.
- ITSC "Software Engineering" sub-role null date range accepted as-is (graceful `formatMonth` rendering) rather than backfilled with invented dates — the overall ITSC tenure ("seit Juni 2024") the timeline actually displays was already correct and owner-confirmed.

## Deviations from Plan

None — plan executed exactly as written. The Impressum fix (commit `fa7c1fb`) was explicitly required by Task 2's own `<how-to-verify>` step 2 ("If still placeholder, edit both locale files with the real address... before promoting") — this is the plan's designed pre-cutover gate-clearing action, not an out-of-plan deviation.

## Issues Encountered

None new. The CSP gap documented in Plan 06 (`.planning/STATE.md` Blockers/Concerns) remains open as a tracked, non-blocking-for-launch follow-up — carried forward unchanged, not resolved or worsened by this plan. See Plan 06's SUMMARY for the full technical rationale (Next.js App Router's per-build, per-page RSC hydration script hashes make a static CSP allowlist infeasible without switching to nonce-based dynamic rendering, which would break the site's all-static CWV architecture).

## User Setup Required

None remaining. All owner actions this plan depended on (GITHUB_TOKEN PAT creation + Vercel Production env var, real Impressum address, career chronology confirmation, PR review + production promotion, live verification) are complete.

## Next Phase Readiness

- Phase 2 goal met: the complete, fast, bilingual recruiter site is live in production on `https://lsiem.de`, verified against all five Phase-2 ROADMAP success criteria on the production URL.
- TECH-01 is now launch-verified (not just build-verified): CWV "good" confirmed via live mobile Lighthouse, security headers confirmed live, zero unsanctioned runtime third-party calls confirmed live.
- CTX-06 (promote only when verification passes) and CTX-07 (one PR from `phase/02-recruiter-overview-live` to `main`) are both satisfied — PR #12 merged/promoted.
- **Carried forward, non-blocking:** the CSP gap from Plan 06 remains open in `.planning/STATE.md` Blockers/Concerns as a Phase-3+ follow-up candidate; the profile-photo asset (CONT-06, deferred per 02-CONTEXT.md) remains a non-blocking owner follow-up for a future plan.
- Phase 3 (Design Direction & Immersive Experience) can begin: the recruiter-path baseline it must never block is now live and verified in production.

## Self-Check: PASSED

- `src/lib/seo.ts` confirmed present on disk and contains `https://lsiem.de`.
- `content/de/pages/impressum.mdx` and `content/en/pages/impressum.mdx` confirmed present on disk.
- Commits `2c98ccc` and `fa7c1fb` confirmed present in `git log --oneline`.
- Plan's `<acceptance_criteria>` for Task 1 re-verified: `siteMetadataBase` resolves to `https://lsiem.de` for production builds, local dev fallback unchanged, `localeAlternates` logic untouched.
- Plan's Task 2 blocking pre-cutover gates (GITHUB_TOKEN, Impressum, CV no-404, career chronology) and live-verification steps (stopwatch test, contact, CV download, dark mode, heatmap, OG/JSON-LD/hreflang, mobile CWV) all confirmed cleared per the human's "approved" response to the checkpoint's `<resume-signal>`.

---
*Phase: 02-recruiter-overview-live*
*Completed: 2026-07-05*
