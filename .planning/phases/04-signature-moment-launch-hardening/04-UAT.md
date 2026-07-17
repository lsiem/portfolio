---
status: partial
phase: 04-signature-moment-launch-hardening
source: [04-04-SUMMARY.md, 04-05-SUMMARY.md]
started: 2026-07-11T22:35:00Z
updated: 2026-07-17T16:05:00Z
---

## Current Test

[testing complete — 1 passed, 2 blocked on user decision / external human]

## Tests

### 1. Deploy the constellation branch to production (lsiem.de)
expected: Deploy branch `phase/03-design-direction-immersive-experience` (commit c4a8e20 or later) to a Vercel Preview, then promote to Production. Deployed assets reflect the full 04-04 constellation (three/fiber lazy chunk present, capability gate wired) — confirmed via network tab or curl chunk inspection.
result: pass
source: automated
evidence: |
  2026-07-17, executed by agent on user instruction ("do the verification by yourself and continue"):
  - Preview qcggwed2k (commit 86d175d) verified first: initial chunks contain zero
    three/fiber code; capability gate (?webgl=off|force + prefers-reduced-motion)
    present in eager chunk; lazy chunk 0h3peqghr4pir.js (892,803 bytes raw) contains
    THREE.WebGLRenderer + @react-three/fiber.
  - PR #16 was CONFLICTING with main (dependabot bumps + PR #13 Phase-3 squash).
    Resolved via merge commit 65ba71c: src/* + .planning/* taken as ours (main's
    versions were Phase-3-era snapshots of this same branch), package.json union
    (adopted @types/node ^26, eslint ^10, typescript ^6), pnpm-lock regenerated.
    Verified: pnpm build (TS 6.0.3) + tsc --noEmit clean. CI green.
  - PR #16 marked ready and squash-merged to main as 2ce06a1
    ("feat(04): signature moment & launch hardening — Phase 4 (#16)").
  - Production deployment nxmv9ht9c READY; lsiem.de alias confirmed pointing at it.
  - curl chunk inspection on https://lsiem.de/de: no WebGLRenderer in any initial
    chunk; gate chunk present; lazy scene chunk 0h3peqghr4pir.js served from
    production (892,803 bytes, contains WebGLRenderer + @react-three/fiber).
  Known pre-existing issue inherited from main: eslint-plugin-react 7.37.5 crashes
  under eslint 10.7 (lint is not a CI gate; dependabot merged eslint ^10 to main
  before this merge).

### 2. Production mobile Lighthouse/CWV audit with 3D active (LCP ≤ 2500ms) + mid-tier Android
expected: Run mobile Lighthouse/PSI with `?webgl=force` against the production URL for /de and /en, plus a real mid-tier-Android measurement (physical device, WebPageTest, or BrowserStack — D-13's preferred proxy). LCP ≤ 2500ms on production. Local proxy currently measures ~2755ms (FAIL, pre-existing 04-01 font gap, not a 3D regression); production is the deciding measurement per D-11/D-12. If production LCP still exceeds 2500ms, a fresh user decision is required on whether to escalate to `display: optional`.
result: blocked
blocked_by: other
reason: "Production audit executed 2026-07-17 (lhci mobile, ?webgl=force, 3 runs/URL against https://lsiem.de): /de median LCP 2601ms, TBT 76ms, CLS 0.000, script 429KB/458KB, perf 0.95-1.00; /en median LCP 2605ms, TBT 80ms, CLS ~0, perf 0.95+. All error-level assertions PASS. Production LCP exceeds the 2500ms warn budget by ~100ms (better than local ~2755ms, same D-11 Bricolage-H1 cause, no 3D regression — script size and TBT unaffected by the constellation). Per this test's own terms a fresh USER DECISION is required: accept the overage under the D-11 exception path, or escalate to display:optional (forbidden without explicit sign-off). Mid-tier Android: PSI API re-attempted 2026-07-17, still quota-exceeded (same consumer project); no physical device / WebPageTest / BrowserStack account available to the agent — calibrated DevTools throttling remains the only proxy. Reports: https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1784303787303-50172.report.html (/de), https://storage.googleapis.com/lighthouse-infrastructure.appspot.com/reports/1784303788327-92693.report.html (/en)."

### 3. External testers pass the 30-second stopwatch test + reduced-motion walkthrough on production
expected: Run `LAUNCH_URL=https://lsiem.de pnpm test:launch` against production (both locales pass: name/role/value-prop visible with zero scroll, dense overview one click away, contact + CV reachable, all under 30s; reduced-motion → zero `<canvas>`, full content in every section, no blocking overlay). Additionally, at least one real external tester performs the same 30-second stopwatch flow and reduced-motion walkthrough by hand on the production URL.
result: blocked
blocked_by: other
reason: "Automated portion PASSED on production 2026-07-17: LAUNCH_URL=https://lsiem.de pnpm test:launch — 4/4 (30-second stopwatch /de + /en, reduced-motion walkthrough /de + /en, incl. the 86d175d Lenis anchor fix). Same suite also passed against the Preview pre-merge. Outstanding: at least one real external human tester performing the stopwatch flow + reduced-motion walkthrough by hand — cannot be done by the agent."

## Summary

total: 3
passed: 1
issues: 0
pending: 0
skipped: 0
blocked: 2

## Gaps

[none — no code issues found; the two blocked items are (a) a D-11 LCP
acceptance decision owned by the user and (b) an external-human walkthrough]
