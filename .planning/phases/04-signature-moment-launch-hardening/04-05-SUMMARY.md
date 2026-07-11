---
phase: 04-signature-moment-launch-hardening
plan: 05
subsystem: testing
tags: [playwright, lighthouse, lhci, launch-verification, cwv, dsgvo]

requires:
  - phase: 04-signature-moment-launch-hardening
    provides: "04-03 capability gate + ?webgl=off|force override; 04-04 full constellation + lighthouserc.webgl.json 3D-active budget"
provides:
  - "evals/launch/stopwatch.spec.ts + evals/launch/reduced-motion.spec.ts — D-14 scripted external-tester panel (30s recruiter flow, full-content/zero-canvas reduced-motion walkthrough), both locales"
  - "A `launch` Playwright project (LAUNCH_URL env var, default https://lsiem.de) + `pnpm test:launch`, isolated from the default `pnpm test` run and requiring no local webServer"
  - "04-LAUNCH-EVIDENCE.md — recorded launch-verification evidence for ROADMAP Phase 4 criteria 3 and 4: D-14 spec runs, 3D-active CWV numbers with scenario noted, D-13 Android-proxy method + throttle profile, DSGVO cross-check"
affects: [launch-verification, ci, performance]

tech-stack:
  added: []
  patterns:
    - "Playwright project conditionally added to the config's `projects` array only when LAUNCH_ONLY=1 — guarantees the default `pnpm test` invocation never discovers or executes evals/launch/*.spec.ts, rather than relying on --project filtering alone"
    - "Launch-scenario evidence is captured from raw Lighthouse `network-requests`/`resource-summary` audit JSON (chunk presence, cross-origin count) rather than trusted from assertion pass/fail alone — proves which scenario (canvas mounted or not) each measurement actually captured"

key-files:
  created:
    - evals/launch/stopwatch.spec.ts
    - evals/launch/reduced-motion.spec.ts
    - .planning/phases/04-signature-moment-launch-hardening/04-LAUNCH-EVIDENCE.md
  modified:
    - playwright.config.ts
    - package.json

key-decisions:
  - "No deployed URL (Preview or Production) reflects the 04-04 constellation as of this plan's execution — origin/phase/03-design-direction-immersive-experience is 5 commits behind local HEAD, and pushing/promoting is out of this executor's scope. Verified this via `git rev-list --left-right --count` and `vercel ls` before proceeding, per the plan's own fallback instruction: ran the full verification against a local production build (`pnpm build && pnpm start`, `?webgl=force`) instead, and documented this substitution explicitly rather than silently testing the wrong target."
  - "Forced the `launch` Playwright project to single-worker (`workers: process.env.CI || isLaunchOnly ? 1 : undefined`) — the stopwatch metric models one external tester's real flow, and Lenis's rAF-driven scroll-settle was observed starved under multi-worker CPU contention (same class of flake documented in 04-03/04-04 for evals/immersive.spec.ts); confirmed the failure disappears entirely at --workers=1."
  - "D-13 mid-tier-Android proxy realized as Chrome DevTools/Lighthouse's default mobile throttling preset (4x CPU slowdown, 150ms RTT, ~1.6Mbps throughput, 412x823@1.75DPR) rather than a WebPageTest/BrowserStack real-device run — attempted the PageSpeed Insights API as a comparable service first and got a confirmed quota-exceeded error (no API key provisioned), so the fallback was exercised deliberately, not defaulted to by omission."
  - "Production LCP (~2757-2758ms with 3D active, ~2755ms without) is recorded as a documented gap owned by 04-01's already-approved exception path, not a new regression — the constellation adds no measurable LCP/script cost locally (mounts after load+idle); production re-measurement remains the deciding source of truth per D-11/D-12 and Phase-2 precedent, staged as the end-of-phase human gate."

patterns-established:
  - "Launch-tier Playwright specs (evals/launch/) import content-model values (getContact) exactly like the existing evals/immersive.spec.ts convention, so recruiter-facing assertions (name/role/value-prop/CV filename) track content changes automatically instead of hardcoded strings."

requirements-completed: [WOW-01, TECH-01, MODE-01, MODE-02]

coverage:
  - id: D1
    description: "D-14 scripted 30-second stopwatch test + reduced-motion walkthrough exist, both locales, validated green against a local production build"
    requirement: MODE-01
    verification:
      - kind: e2e
        ref: "evals/launch/stopwatch.spec.ts + evals/launch/reduced-motion.spec.ts — `LAUNCH_URL=http://localhost:3000 pnpm test:launch` — 4/4 pass (de/en stopwatch ~527-563ms, de/en reduced-motion ~209-318ms, all well under the 30s/zero-canvas budgets)"
        status: pass
    human_judgment: true
    rationale: "The scripts themselves pass deterministically, but the ROADMAP criterion requires the run to be against the production URL with an owner spot-check (D-14) — that re-run + sign-off is staged as the end-of-phase human gate, not closed by this plan alone."
  - id: D2
    description: "Production mobile CWV audit with the constellation active (3D-active LHCI run): TBT/CLS/script-size/performance all pass against the documented 04-04 budget; LCP stays a documented WARN gap"
    requirement: TECH-01
    verification:
      - kind: other
        ref: "pnpm lhci:webgl against local production build (?webgl=force, both locales, 3 runs each) — see 04-LAUNCH-EVIDENCE.md section 2: TBT 43-45ms, CLS <0.002, script 416,228B < 458,801B budget, performance 0.96; LCP 2756.8-2757.9ms (warn, >2500ms target)"
        status: pass
    human_judgment: true
    rationale: "LCP fails the 2500ms hard target locally (a documented, pre-existing 04-01 gap, not a 3D regression) — production is the calibrated source of truth per D-11/D-12; this plan cannot itself close criterion 3 green without the production re-run staged as the end-of-phase gate."
  - id: D3
    description: "D-13 mid-tier Android proxy executed and explicitly documented (method, device/throttle profile, gate outcome) after confirming no real-device cloud service was accessible"
    requirement: TECH-01
    verification:
      - kind: other
        ref: "04-LAUNCH-EVIDENCE.md section 3 — PSI API quota-exceeded confirmed, Chrome DevTools/Lighthouse mobile throttling profile documented (4x CPU, 150ms RTT, ~1.6Mbps, 412x823@1.75DPR), canvas-mount confirmed via 236,757B three/fiber chunk present in all 6 forced runs"
        status: pass
    human_judgment: false
  - id: D4
    description: "Zero third-party network requests confirmed on the forced-3D production-build waterfall (DSGVO), including the detect-gpu benchmark fetch"
    requirement: TECH-01
    verification:
      - kind: other
        ref: "04-LAUNCH-EVIDENCE.md section 4 — network-requests audit inspected across all 6 ?webgl=force LHCI runs, 0 cross-origin requests each"
        status: pass
    human_judgment: false
  - id: D5
    description: "04-LAUNCH-EVIDENCE.md records all four required sections (D-14 runs, CWV with scenario, D-13 proxy, cross-checks) with pass/fail per ROADMAP criterion, and the one gap found (production LCP) is named with its owning plan rather than silently passed"
    verification:
      - kind: other
        ref: "test -f 04-LAUNCH-EVIDENCE.md && grep -q D-13 && grep -q criterion (Task 2 automated verify) — PASS"
        status: pass
    human_judgment: false

duration: ~50min
completed: 2026-07-11
status: complete
---

# Phase 4 Plan 5: Launch Verification & Evidence Summary

**D-14 scripted external-tester panel (30s stopwatch + reduced-motion walkthrough, both locales) plus a documented 3D-active CWV/D-13-Android-proxy audit — all run against a local production build because no deployed URL yet carries the 04-04 constellation, with that substitution and the one production-LCP gap recorded honestly rather than glossed over.**

## Performance

- **Duration:** ~50 min
- **Completed:** 2026-07-11
- **Tasks:** 2
- **Files:** 3 created, 2 modified

## Accomplishments

- **D-14 launch scripts (`evals/launch/`):** `stopwatch.spec.ts` walks the exact hurried-recruiter flow — first-fold name/role/value-prop with no scroll, one click (`#hero nav a[href="#career"]`) to the dense overview, then the mailto contact affordance and `Lasse-Siemoneit-CV-{locale}.pdf` link, all under a hard `elapsed < 30_000` assertion — and `reduced-motion.spec.ts` walks every one of the 7 home sections asserting non-empty visible content and zero `<canvas>` throughout (re-checked after each section, not just once), plus a zero-overlay/preloader check (WOW-04). Both import name/role/value-prop/email from `src/lib/content.ts` (the SSOT), never hardcoded strings.
- **Isolated `launch` Playwright project:** added to `playwright.config.ts` only when `LAUNCH_ONLY=1` (set by the new `pnpm test:launch` script) — so the default `pnpm test` run never discovers `evals/launch/` and never needs a local webServer for it; `baseURL` resolves from `LAUNCH_URL` (default `https://lsiem.de`). Forced single-worker for launch runs after discovering the same Lenis-scroll/CPU-contention flake documented in 04-03/04-04 under 4-worker parallelism — confirmed the fix at `--workers=1`.
- **Validated locally before trusting the scripts:** `pnpm build && pnpm start` + `LAUNCH_URL=http://localhost:3000 pnpm test:launch` → 4/4 green (stopwatch de/en ~527-563ms, reduced-motion de/en ~209-318ms).
- **3D-active CWV evidence:** re-ran the 04-04 `lighthouserc.webgl.json` audit (`pnpm lhci:webgl`) against the same local production build. TBT (43-45ms), CLS (<0.002), script-size (416,228B, under the documented 458,801B 3D-active budget) and performance score (0.96) all pass; LCP (2756.8-2757.9ms) stays a WARN — confirmed via a same-build baseline run (no `?webgl` param, LCP 2754.4-2755.8ms) that the constellation adds essentially zero LCP/script cost, so the gap is the pre-existing 04-01 Bricolage-H1 font cost, not a 3D regression.
- **D-13 Android proxy, executed and documented:** attempted the PageSpeed Insights API first (a real-device/CrUX-backed comparable service) and got back a confirmed `Quota exceeded` error (no API key provisioned) rather than silently skipping it. Fell back to the locked Chrome DevTools/Lighthouse mobile-throttling proxy and recorded the exact calibration (4x CPU slowdown, 150ms RTT, ~1,638 Kbps throughput, 412x823 viewport @1.75 DPR) plus confirmed canvas-mount under it (236,757B three/fiber chunk present in all 6 runs).
- **DSGVO cross-check:** inspected the raw Lighthouse `network-requests` audit across all 6 forced-3D runs — zero cross-origin requests every time, including the detect-gpu benchmark fetch (stays same-origin at `/benchmarks`).
- **`04-LAUNCH-EVIDENCE.md`:** records all of the above across four required sections plus a "Verification target" preamble stating plainly that this is a local-production-proxy run, not yet the deployed URL, and what re-run is still needed to close ROADMAP criteria 3/4 for real.

## Task Commits

1. **Task 1: D-14 launch scripts + isolated launch project** - `155ddd8` (test)
2. **Task 2: Launch verification evidence** - `7bb6a48` (docs)

**Plan metadata:** committed with this SUMMARY

## Files Created/Modified

- `evals/launch/stopwatch.spec.ts` — D-14 30-second recruiter-flow stopwatch test, both locales
- `evals/launch/reduced-motion.spec.ts` — D-14 reduced-motion walkthrough, both locales
- `playwright.config.ts` — conditional `launch` project (LAUNCH_ONLY=1), single-worker for launch/CI runs, no webServer when launch-only
- `package.json` — `test:launch` script
- `.planning/phases/04-signature-moment-launch-hardening/04-LAUNCH-EVIDENCE.md` — recorded evidence for ROADMAP criteria 3 and 4

## Decisions Made

- **Local-production-build substitution, explicitly documented:** verified via `git rev-list --left-right --count` (origin 5 commits behind HEAD) and `vercel ls` (latest Preview ~1h old, predates 04-04) that no deployed URL carries the constellation. Per this plan's own instruction to not silently test the wrong target, ran the full verification against `pnpm build && pnpm start` instead and recorded the substitution and its rationale in the evidence file's opening section.
- **Single-worker `launch` project:** the stopwatch metric models one tester's real flow; multi-worker CPU contention starved Lenis's rAF scroll-settle (same known flake class as 04-03/04-04's immersive.spec.ts anchor test) — fixed by forcing `workers: 1` whenever `LAUNCH_ONLY=1` or `CI` is set.
- **D-13 proxy chosen deliberately, not by default:** attempted PSI's API first and got a confirmed quota-exceeded response, then used the already-locked Chrome DevTools/Lighthouse throttling fallback with its exact profile recorded for reproducibility.
- **Production LCP gap attributed to 04-01, not this plan or 04-04:** a same-build baseline (no 3D) measured nearly identical LCP to the 3D-active run, isolating the cause to the pre-existing font-driven LCP cost rather than the constellation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Forced `launch` Playwright project to single-worker**
- **Found during:** Task 1 (validating the scripts locally)
- **Issue:** Under the config's default `fullyParallel`/`workers: undefined` behavior, running both stopwatch specs concurrently with the reduced-motion specs (4 workers) caused the `#hero nav a[href="#career"]` click's Lenis-driven scroll settle to never reach `<200px` within an 8s poll — a CPU-contention flake, not a functional bug (confirmed passing reliably at `--workers=1`).
- **Fix:** Added `workers: process.env.CI || isLaunchOnly ? 1 : undefined` to `playwright.config.ts`, scoped to CI and `LAUNCH_ONLY=1` runs only — the default `pnpm test` run's parallelism is unchanged.
- **Files modified:** `playwright.config.ts`
- **Verification:** `LAUNCH_URL=http://localhost:3000 pnpm test:launch` — 4/4 pass consistently after the fix; re-ran default `pnpm test` afterward (143/145 pass, same 2 pre-existing unrelated Lenis-anchor flakes documented in 04-03/04-04, confirmed out of scope).
- **Committed in:** `155ddd8` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking/test-harness robustness, Rule 3).
**Impact on plan:** No behavior change to the app or the default test suite — a scoped fix ensuring the new launch project's timing evidence is trustworthy rather than an artifact of local test-runner contention.

## Issues Encountered

- **No deployed URL includes the 04-04 constellation:** this branch's remote (`origin/phase/03-design-direction-immersive-experience`) is 5 commits behind local HEAD; pushing/promoting and creating a PR are outside this executor's scope (per the sequential-executor task briefing — commit locally, don't push). Resolved by running the full verification against a faithful local production build instead, with the substitution and required re-run documented explicitly in `04-LAUNCH-EVIDENCE.md`'s opening section.
- **PageSpeed Insights API quota exhausted:** an unauthenticated request to `pagespeedonline.googleapis.com` returned a confirmed `Quota exceeded` error rather than a network failure — documented as evidence that the WebPageTest/BrowserStack/PSI real-device tier was attempted and genuinely unavailable in this environment, not silently skipped, matching RESEARCH's `[ASSUMED]` flag on this dependency.
- **Pre-existing flaky test** (`evals/immersive.spec.ts` "hash-anchor nav scrolls to the section under Lenis") reproduced again during the post-fix full-suite sanity run under default parallelism — the same documented class from 04-03/04-04, out of scope per the deviation rules' scope boundary; not touched.

## Known Stubs

None.

## Threat Flags

None beyond the plan's own `<threat_model>` (T-04-05-01…03, T-04-05-SC), all addressed by design: raw Lighthouse audit JSON (not just assertion summaries) was inspected to prove which scenario each measurement captured, the one red result (production LCP) is recorded as a gap with 04-01 named as the owning plan, and no new npm packages were added.

## User Setup Required

None - no new external service configuration required. (WebPageTest/BrowserStack account creation remains an optional upgrade path per D-13's deferred-ideas list if a physical mid-tier Android or paid device-cloud account becomes available later.)

## Next Phase Readiness

- **This plan cannot itself close ROADMAP Phase 4 criteria 3 and 4** — that requires pushing this branch, deploying a Preview, running `pnpm test:launch` and the 3D-active LHCI audit against it, then repeating against `https://lsiem.de` after production promotion. `04-LAUNCH-EVIDENCE.md`'s "Verification target" section states exactly what re-run is still needed.
- **The tooling itself is proven correct:** all 4 launch specs pass against a faithful local-production build (the same artifact Vercel's build would produce), and the 3D-active CWV/D-13-proxy/DSGVO evidence is fully documented with raw-audit-level proof (chunk presence, cross-origin counts), not just assertion summaries.
- **One open gap, clearly owned:** production LCP (currently ~2755-2758ms locally, with or without 3D) still needs the production re-measurement to close green against the 2500ms hard target — owned by 04-01's already-approved exception path, not a new issue from this plan.
- **Staged for the end-of-phase human gate** (per this plan's own `<verify>` section and 04-04's flagged visual-judgment items: D-08 atmosphere, D-09 boot-beat timing feel, D-06 pointer "gentle magnetic" feel): owner spot-checks the D-14 agent runs, reviews `04-LAUNCH-EVIDENCE.md`, approves promotion to production, and the launch suite + a fresh CWV audit re-run green against `https://lsiem.de` — that is what actually closes ROADMAP success criteria 3 and 4.

---
*Phase: 04-signature-moment-launch-hardening*
*Completed: 2026-07-11*

## Self-Check: PASSED
