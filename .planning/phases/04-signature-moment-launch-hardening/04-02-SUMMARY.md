---
phase: 04-signature-moment-launch-hardening
plan: 02
subsystem: performance
tags: [lighthouse, ci, bundle, gsap, intersection-observer, reveal, bot-mitigation, cwv]

requires:
  - phase: 04-signature-moment-launch-hardening
    provides: "04-01 self-hosted font baseline + the D-11 exception-path LCP posture (warn)"
  - phase: 03-design-direction-immersive-experience
    provides: "Reveal/HeroIntro/CareerSpine motion primitives (Option-A just-in-time GSAP), the phase3-perf-bundle-gap open debug finding"
provides:
  - "CI performance gate that measures the true shipped app payload (local production build, proven byte-identical to the deployment's /_next chunk set)"
  - "CSS-only reveals on the touch/coarse path — GSAP removed from the mobile initial load, closing the deployed-bundle overage"
  - "Resolved phase3-perf-bundle-gap with an evidence-based root cause that retracts the original hypothesis"
affects: [04-03, 04-04, 04-05, launch-verification, performance]

tech-stack:
  added: []
  patterns:
    - "Pointer-split motion delivery: CSS-only reveal on coarse/touch (no GSAP import), just-in-time GSAP on pointer:fine"
    - "Performance gate audits a local production build justified by a proven byte-identical app-chunk set vs the deployment (excludes non-app platform injection)"

key-files:
  created: []
  modified:
    - .github/workflows/ci.yml
    - src/components/motion/reveal.tsx
    - .planning/debug/phase3-perf-bundle-gap.md
    - .gitignore

key-decisions:
  - "Root cause of the 308KB deployed bundle: ~96KB Vercel platform bot-mitigation challenge (fires for headless CI Chrome, absent for real users) + ~30KB near-fold GSAP — NOT hidden app JS. The app /_next chunk set is byte-identical localhost == deployed (~177KB). The debug finding's original premise is retracted."
  - "CI gate audits a LOCAL production build, not the deployed URL: the deployed-URL gate is corrupted in CI by the bot-challenge (all metrics), while local provably measures the identical app payload and still catches real regressions (user-approved)."
  - "Mobile/touch reveals delivered via CSS transition instead of GSAP (D-19 preserved); GSAP retained for desktop pointer:fine (user-approved)."

patterns-established:
  - "Reveal delivery splits by pointer capability: touch = CSS opacity+transform transition (zero GSAP), desktop = just-in-time GSAP. Hidden start state applied post-IntersectionObserver so SSR content is visible pre-hydration."

requirements-completed: [TECH-01]

coverage:
  - id: D1
    description: "CI gate measures the true shipped app payload (local production build) and cannot pass while the app bundle breaches TECH-01; deployed-URL gate reverted because CI bot-challenge corrupts it"
    requirement: TECH-01
    verification:
      - kind: other
        ref: "grep lhci in ci.yml; local LHCI autorun green on script:size/TBT/CLS/perf"
        status: pass
    human_judgment: false
  - id: D2
    description: "Deployed eager-bundle overage closed: mobile/touch path loads zero GSAP; local production script:size 177,680 < 184,643 (perf 0.97, TBT 2ms, CLS 0.0008)"
    requirement: TECH-01
    verification:
      - kind: other
        ref: "playwright mobile-touch context: 0 gsap chunks after scrolling career into view; LHCI resource-summary script.size 177680"
        status: pass
    human_judgment: false
  - id: D3
    description: "Five TECH-01 thresholds byte-for-byte unchanged (LCP warn@2500 per 04-01 exception path; TBT/CLS/script:size/perf error at 200/0.1/184643/0.9)"
    requirement: TECH-01
    verification:
      - kind: other
        ref: "node assertion on lighthouserc.json exits 0"
        status: pass
    human_judgment: false
  - id: D4
    description: "D-03 Bricolage face, D-08 single GSAP+Lenis engine, D-19 touch reveals all intact; no motion library added"
    requirement: TECH-01
    verification:
      - kind: other
        ref: "grep: 0 framer-motion/motion libs in package.json; reveal.tsx retains gsap import on desktop path; touch reveals via CSS"
        status: pass
    human_judgment: false
  - id: D5
    description: "Production-mobile CWV re-check with the constellation active (deployed source of truth for LCP <= 2500, D-11) — deferred to 04-05"
    requirement: TECH-01
    verification: []
    human_judgment: true
    rationale: "Only confirmable on the deployed production URL at end of phase (04-05, D-11/D-14)"

duration: ~180min
completed: 2026-07-11
status: complete
---

# Phase 04 Plan 02: Representative CI Gate + Bundle Overage Summary

**Root-caused the 308KB deployed bundle to ~96KB Vercel bot-mitigation challenge + ~30KB near-fold GSAP (NOT hidden app JS — app chunks are byte-identical localhost==deployed at ~177KB); closed the GSAP overage with CSS-only touch reveals and pointed the CI gate at a provably-representative local production build**

## Performance

- **Duration:** ~180 min (deep investigation + fix, interactive)
- **Completed:** 2026-07-11T18:28:39Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- **Disproved the debug finding's premise.** A byte-level decomposition of the deployed `/de` payload against the localhost production build showed the app `/_next` chunk set is identical (~177KB both). The 308KB deployed number = ~177KB core app + ~30KB GSAP + ~6KB analytics/speed-insights + **~96KB Vercel platform bot-mitigation challenge**.
- **Identified the 96KB opaque script as a bot-challenge, not app code:** it appears under Lighthouse/LHCI headless Chrome (every run) but vanishes under a normal mobile-UA headless browser (every run); served from a signed rotating path outside `/_next`, High priority, redirect-stub to curl. Firewall shows no custom rules — platform baseline mitigation on headless/datacenter clients, not toggleable per-deployment on this plan.
- **Closed the GSAP overage (app fix):** `reveal.tsx` now delivers reveals by pointer — CSS-only opacity+transform transition on touch/coarse (zero GSAP import), just-in-time GSAP on desktop pointer:fine. The prior pattern pulled ~30KB of GSAP into the mobile initial load whenever a near-fold Reveal intersected. Verified: mobile-touch context loads zero GSAP chunks even after the career section scrolls into view.
- **Corrected the CI gate:** reverted the deployed-URL gate (would fail every CI run via the bot-challenge) to a local production build audit, justified by the proven byte-identical app-chunk set. Deterministic and green.
- **Final local production LHCI (mobile, 3 runs/locale):** script:size **177,680** (< 184,643, ~7KB headroom), perf **0.97**, TBT **2ms**, CLS **0.0008**, LCP 2610–2761ms (**warn**, per the 04-01 D-11 exception path).
- Disabled the preview feedback toolbar (`VERCEL_PREVIEW_FEEDBACK_ENABLED=0`) during the investigation — removed the ~97KB `vercel.live` injection, confirming the remaining 96KB was a separate bot-challenge.

## Task Commits

1. **Task 1 (initial): repoint gate at deployed preview** — `21c8332` (feat) — superseded
2. **Task 1 (correction): audit local production build** — `daa26c2` (fix)
3. **Task 2: CSS-only reveals on touch, GSAP on desktop** — `4d045f0` (feat)

**Plan metadata:** committed with this SUMMARY

## Files Created/Modified

- `.github/workflows/ci.yml` — performance gate audits a local production build with documented byte-identical-payload + bot-challenge rationale
- `src/components/motion/reveal.tsx` — pointer-split reveal delivery (CSS on touch, GSAP on desktop)
- `.planning/debug/phase3-perf-bundle-gap.md` — status resolved; corrected root cause; original premise retracted
- `.gitignore` — reverted the transient `lighthouserc.deployed.json` entry (no longer generated)

## Decisions Made

- **Local vs deployed gate:** deployed-URL audits are corrupted in CI by the bot-challenge (all metrics, not just script:size). Local production audit measures the identical app payload (proven), catches real regressions, and excludes only non-app platform injection — the correct target. User-approved.
- **CSS reveals on touch:** the clean way to keep GSAP off the mobile critical path while preserving D-19 touch reveals. User-approved over the alternatives (deferring the fold reveal / relaxing the budget, which the debug finding forbids).
- LCP stays `warn` (04-01 exception path); production CrUX re-check in 04-05 is the D-11 source of truth.

## Deviations from Plan

**[Rule 1 — corrected diagnosis]** Task 1 as written assumed the fix was to audit the deployed URL (per the debug finding). The Task-2 investigation the plan mandated disproved that: the deployed URL is *worse* in CI (bot-challenge corruption) and the app JS was never hiding. The gate was therefore pointed at a local production build — the plan's explicitly-sanctioned "representative local build" fallback — now backed by the byte-identical-chunk-set proof. The initial deployed-URL commit (`21c8332`) was superseded by `daa26c2`.

**[Rule 1 — corrected root cause]** Task 2 assumed ~100KB of eager app JS to trim. Actual cause: ~96KB non-app bot-challenge + ~30KB near-fold GSAP. The actionable app lever was the GSAP load, fixed via CSS touch reveals.

**Total deviations:** 2 (both diagnosis corrections driven by the mandated investigation; no scope creep, no relaxed budgets).

## Issues Encountered

- The Playwright MCP server disconnected mid-investigation; continued via a standalone `playwright-core` script from the project's own install.
- The Vercel project `framework` field is still `"vite"` (stale from the discarded SPA) and `nodeVersion` `22.x` — noted as a non-blocking follow-up; the Next build deploys and serves correctly regardless.

## Next Phase Readiness

- The 3D-free baseline is genuinely green on the CI gate (app payload under budget, perf 0.97) and the bundle-gap investigation is closed — 04-03 can build the constellation delivery infrastructure on a healthy, honestly-measured baseline (D-12).
- Open for 04-05: production-mobile LCP re-check (deployed CrUX + Speed Insights) remains the D-11 source of truth; the bot-challenge is a CI-only artifact and does not affect real-user metrics.
- Follow-up: correct the Vercel project `framework` setting from `vite` to `nextjs`.

---
*Phase: 04-signature-moment-launch-hardening*
*Completed: 2026-07-11*
