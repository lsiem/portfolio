---
phase: 04-signature-moment-launch-hardening
plan: 06
subsystem: capability
tags: [capability, gpu, detect-gpu, fallback, testing]

requires:
  - phase: 04-signature-moment-launch-hardening
    provides: "04-03 capability gate + ?webgl=off|force override"
provides:
  - "sceneTierFromGpu GPU tier classification helper and unit tests"
affects: [capability, testing]

tech-stack:
  added: []
  patterns:
    - "Type-only import of TierResult from detect-gpu to maintain dynamic-import bundle discipline"

key-files:
  created:
    - .planning/phases/04-signature-moment-launch-hardening/04-06-SUMMARY.md
  modified:
    - src/lib/capability.ts
    - evals/scene.spec.ts

key-decisions:
  - "Extracted sceneTierFromGpu to allow Apple M5 Pro and other fallback (unknown-new) GPUs to mount the constellation scene once the failIfMajorPerformanceCaveat probe passes"
  - "Preserved D-07 weak-gpu exclusions and blocklisted classes byte-for-byte by retaining tier < 2 exclusion logic for non-FALLBACK GPUs"

patterns-established:
  - "Pure Node-side unit testing of browser-targeted capability classification functions in Playwright without browser fixtures"

requirements-completed: [WOW-01]

coverage:
  - id: D6
    description: "sceneTierFromGpu GPU classification tests cover FALLBACK, BENCHMARK tier < 2, and blocklist cases"
    requirement: WOW-01
    verification:
      - kind: unit
        ref: "evals/scene.spec.ts — GPU tier classification block"
        status: pass
    human_judgment: false

duration: ~15min
completed: 2026-07-17
status: complete
---

# Phase 4 Plan 6: GPU Capability Fallback Gap Closure Summary

**Closed the single remaining gap from 04-UAT.md Test 4: on Apple M5 Pro and other modern hardware not present in detect-gpu's benchmark snapshot (which returns type: "FALLBACK"), the hero constellation now mounts successfully. The caveat probe already proved hardware WebGL2 capability, so unknown-new hardware is treated as capable, while genuinely weak measured GPUs (BENCHMARK tier < 2) and blocklisted GPUs remain excluded.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-07-17
- **Tasks:** 2
- **Files:** 1 created, 2 modified

## Accomplishments

- **sceneTierFromGpu Helper Extracted:** Extracted classification logic to a pure synchronous function `sceneTierFromGpu` in `src/lib/capability.ts`.
- **FALLBACK GPU Handling:** Treated `type: "FALLBACK"` results as capable, returning `"desktop"` or `"mobile"` based on `gpu.isMobile`, bypassing the `gpu.tier < 2` exclusion. Genuinely measured weak GPUs (`type: "BENCHMARK"` and `tier < 2`) and unsupported/blocklisted GPUs continue to receive `"none"`.
- **Relative Type Import:** Used `import type { TierResult }` to ensure no eager runtime code from `detect-gpu` is pulled into the initial bundle, preserving the dynamic-import bundle discipline.
- **Unit Testing:** Added a dedicated test suite verifying the classification logic across seven distinct cases: fallback desktop, fallback mobile, benchmark weak desktop (excluded), benchmark capable desktop, benchmark capable mobile, blocklisted (excluded), and WebGL unsupported (excluded).
- **Verified Successful Execution:**
  - TypeScript types verify cleanly (`pnpm exec tsc --noEmit` exit 0).
  - Playwright test suite passes cleanly (16/16 pass).
  - WebGL Lighthouse CI audit passes cleanly (12/12 assertions passed).

## Task Commits

1. **Task 1: Pin FALLBACK-vs-BENCHMARK classification contract in spec** - `53cacff` (test)
2. **Task 2: Implement sceneTierFromGpu with FALLBACK fix** - `e1f5336` (fix)

## Files Created/Modified

- `src/lib/capability.ts` (modified) — Extracted `sceneTierFromGpu` and updated `decideSceneTier`
- `evals/scene.spec.ts` (modified) — Added relative type import and classification unit test block
- `.planning/phases/04-signature-moment-launch-hardening/04-06-SUMMARY.md` (created) — This summary file

## Decisions Made

- **Treat FALLBACK as Capable:** Since the WebGL2 caveat probe (`failIfMajorPerformanceCaveat: true`) already ran and succeeded before `detect-gpu` was queried, any unknown GPU (fallback) is guaranteed to have hardware WebGL. Treating it as capable ensures visitors on newer high-end devices get the 3D constellation.
- **Eager Bundle Discipline:** Standalone `import type { TierResult }` statement is guaranteed to be erased by the TS compiler, leaving `detect-gpu` fully dynamic-imported and out of the initial bundle.

## Deviations from Plan

None.

## Issues Encountered

- **Playwright webServer watch limit (`EMFILE`):** Running Playwright tests using default `next dev` watch server failed with `EMFILE: too many open files`. Resolved by building the production bundle (`pnpm build`) and starting the production server (`pnpm start`) in the background, allowing Playwright to reuse the existing server on port 3000 without watching files.

## Known Stubs

None.

## Threat Flags

None beyond `T-04-06-01` and `T-04-06-02`, both addressed: the caveat probe prevents software GL from hitting the fallback capable branch, and no overrides or script packages were added.

## User Setup Required

None.

## Next Phase Readiness

All phase 04 plans and the gap closure plan are now executed and verified green.

---
*Phase: 04-signature-moment-launch-hardening*
*Completed: 2026-07-17*

## Self-Check: PASSED
