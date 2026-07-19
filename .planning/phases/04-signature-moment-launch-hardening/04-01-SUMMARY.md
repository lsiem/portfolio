---
phase: 04-signature-moment-launch-hardening
plan: 01
subsystem: performance
tags: [next-font, lcp, lighthouse, woff2, subset-font, bricolage, cwv]

requires:
  - phase: 03-design-direction-immersive-experience
    provides: "Bricolage display face (D-03) via next/font/google, hero intro with document.fonts.ready contract, LHCI budget with LCP downgraded to warn (D-11 deferral)"
provides:
  - "Self-hosted, preloaded, build-time-subset Bricolage Grotesque 700 via next/font/local (zero runtime Google Fonts request, DSGVO-clean)"
  - "scripts/subset-bricolage.ts — content-derived glyph-union subsetter wired into prebuild"
  - "Measured 3D-free LCP baseline (local LHCI proxy) for clean D-12 attribution of any later 3D regression"
  - "Documented D-11 exception path: CI LCP assertion remains warn; production re-check staged as end-of-phase gate"
affects: [04-02, 04-05, launch-verification, performance]

tech-stack:
  added: [subset-font@2.5.0 (devDependency, harfbuzz-WASM, build-time only)]
  patterns: ["Build-time font subsetting from the content model (glyph union computed, never hand-listed), chained into prebuild after generate:cv"]

key-files:
  created:
    - scripts/subset-bricolage.ts
    - src/app/fonts/bricolage-grotesque-latin-700.woff2
    - src/app/fonts/bricolage-grotesque-subset-700.woff2
  modified:
    - src/app/[locale]/layout.tsx
    - package.json
    - pnpm-lock.yaml

key-decisions:
  - "D-11 exception path taken (user-approved): local LHCI LCP misses 2500ms on both locales after levers A+B, so the CI assertion stays warn and the production-mobile re-check (04-05) is the calibrated go/no-go — display:optional escalation NOT applied"
  - "Both woff2 files committed: latin-700 (22KB) is the subsetter source of truth, subset-700 (15KB) is the shipped artifact — subset regenerates on every build and only rewrites on byte change"
  - "Geist Mono preload dropped (preload:false) — RESEARCH lever 3, removes ~30KB from the LCP critical window; rendered face unchanged"

patterns-established:
  - "Font-delivery changes must preserve: --font-bricolage variable, display:swap, document.fonts.ready contracts (MotionProvider + HeroIntro), doc-comment measurement history in layout.tsx"

requirements-completed: [WOW-01, TECH-01]

coverage:
  - id: D1
    description: "Bricolage display face self-hosted via next/font/local with preload:true, display:swap, --font-bricolage preserved; subset woff2 exists and build is green"
    requirement: TECH-01
    verification:
      - kind: other
        ref: "pnpm build && grep next/font/local + preload:true + display:swap in src/app/[locale]/layout.tsx"
        status: pass
    human_judgment: false
  - id: D2
    description: "Hero H1 renders visually identical (same Bricolage face/weight/metrics) before and after the delivery change at 320/768/1440 on /de and /en"
    requirement: TECH-01
    verification: []
    human_judgment: true
    rationale: "Visual identity of the rendered face is a judgment call — end-of-phase before/after diff staged as human check"
  - id: D3
    description: "Sibling TECH-01 assertions byte-for-byte intact (TBT error 200, CLS error 0.1, script:size error 184643, perf error 0.9); lighthouserc.json unchanged vs HEAD"
    requirement: TECH-01
    verification:
      - kind: other
        ref: "node -e sibling-assertion check + git diff HEAD -- lighthouserc.json (empty)"
        status: pass
    human_judgment: false
  - id: D4
    description: "D-11 gate decision: exception path — LCP assertion stays warn; production-mobile LCP re-check (PageSpeed Insights CrUX + Vercel Speed Insights) staged as end-of-phase source of truth in 04-05"
    requirement: WOW-01
    verification: []
    human_judgment: true
    rationale: "Production LCP <= 2500ms with the constellation active can only be confirmed on the deployed URL at end of phase (D-11/D-14)"

duration: ~100min
completed: 2026-07-10
status: complete
---

# Phase 04 Plan 01: Launch Hardening — Hero LCP Summary

**Self-hosted build-time-subset Bricolage 700 via next/font/local (preload:true, 15KB, content-derived glyph union); local LHCI LCP improved ~150–250ms but misses the 2500ms local gate on both locales → user-approved D-11 exception path: CI assertion stays warn, production re-check staged for 04-05**

## Performance

- **Duration:** ~100 min (across two sessions — the original executor was interrupted mid-plan; work verified, completed, and committed interactively)
- **Started:** 2026-07-10T17:37:00Z (approx, interrupted session)
- **Completed:** 2026-07-10T19:18:30Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Replaced `next/font/google` with `next/font/local` for the display face: OFL-licensed Bricolage Grotesque 700 latin woff2 committed, subset at build time to the computed union of every display-face glyph site-wide (hero H1 contact.name, case-study/prose frontmatter titles, message catalogs — both locales) plus a printable-ASCII + umlaut safety floor, `preload: true` unlocked on the render-path file
- `subset:font` wired into `prebuild` after `generate:cv`; subsetter is idempotent (skips write when bytes unchanged, preserving next/font build cache)
- Zero runtime Google Fonts request (DSGVO) — face served same-origin; `display: "swap"`, `--font-bricolage`, and both `document.fonts.ready` contracts preserved; hero H1 metrics covered by next/font's default adjustFontFallback
- LCP measured and recorded (local LHCI, slow-4G + 4x-CPU, 3 runs/locale):
  - **Baseline** (next/font/google, preload:false): /de 2909ms, /en 2758ms
  - **Lever A** (local full latin 22KB, preload:true): /de 2609ms, /en green
  - **Levers A+B** (subset 15KB / 115 chars, preload:true): /de 2693–2770ms, /en 2609–2614ms
- All error-level LHCI assertions green (TBT ≤ 200ms, CLS ≤ 0.1, script bytes ≤ 184643, perf ≥ 0.9); only the warn-level LCP flags

## Task Commits

1. **Task 1: Self-host + preload subset Bricolage display face** — `609e59b` (feat)
2. **Task 2: LCP assertion decision (exception path)** — no code change: `lighthouserc.json` intentionally untouched (stays `warn`); verification ran against HEAD

**Plan metadata:** committed with this SUMMARY

## Files Created/Modified

- `src/app/fonts/bricolage-grotesque-latin-700.woff2` — OFL source file (22KB), subsetter input
- `src/app/fonts/bricolage-grotesque-subset-700.woff2` — shipped subset (15KB, 115 glyphs)
- `scripts/subset-bricolage.ts` — content-derived glyph-union subsetter (fail-loud contract check for äöüÄÖÜß—&'.)
- `src/app/[locale]/layout.tsx` — next/font/local config + measurement-history doc comment; Geist Mono preload dropped
- `package.json` / `pnpm-lock.yaml` — `subset:font` script, prebuild chain, `subset-font` + `@types/subset-font` devDependencies

## Decisions Made

- **Exception path (user-approved via interactive checkpoint):** after levers A+B, local LHCI LCP is /de ~2693ms (~193ms over) and /en ~2609ms (~110ms over) with ±100–150ms run-to-run variance. Per plan: assertion stays `warn`, `display: "optional"` NOT applied, shortfall documented here, production re-check (PageSpeed Insights CrUX + Vercel Speed Insights, mobile, /de + /en) staged as the end-of-phase D-11 source of truth in 04-05.
- Remaining escalation lever if production also misses: `display: "optional"` — requires explicit user sign-off (locked D-03 / UI-SPEC Launch-Hardening Constraints).

## Deviations from Plan

**Execution-process deviation:** the plan was started by a spawned executor agent that was interrupted mid-Task-1; the implementation it left in the working tree was verified against every acceptance criterion, completed (final measurement comment), and committed interactively. No content deviation resulted.

**[Exception path — planned]** Task 2's happy path (flip LCP assertion to `error`) was not taken because the local gate was missed; the plan's explicit exception path was followed instead. This is a planned branch, not an unplanned deviation.

**Total deviations:** 0 auto-fixed. **Impact:** none — plan executed within its own branches.

## Issues Encountered

- Local LHCI variance (~±100–150ms between sessions on the same build) makes the /en result genuinely borderline; recorded all three run values per locale rather than a single number so 04-05 can compare like-for-like.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 3D-free baseline is hardened and fully measured — 04-02 (CI gate measures deployed bundle) can proceed
- Open thread for 04-05: production-mobile LCP re-check must confirm ≤ 2500ms (D-11); if it misses, the `display: "optional"` decision comes back to the user
- CI LCP assertion intentionally remains `warn` — restoring it to `error` is contingent on the production evidence, not on more local runs

---
*Phase: 04-signature-moment-launch-hardening*
*Completed: 2026-07-10*
