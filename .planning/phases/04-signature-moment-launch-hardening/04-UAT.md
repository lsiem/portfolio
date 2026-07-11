---
status: testing
phase: 04-signature-moment-launch-hardening
source: [04-04-SUMMARY.md, 04-05-SUMMARY.md]
started: 2026-07-11T22:35:00Z
updated: 2026-07-11T22:35:00Z
---

## Current Test

number: 1
name: Deploy the constellation branch to production (lsiem.de)
expected: |
  The deployed HTML/JS on lsiem.de reflects the full 04-04 constellation — the
  three / @react-three/fiber lazy chunk is present and the capability gate is wired.
  Confirm via the network tab or a `curl` chunk inspection that the constellation
  code is live (it is NOT on the current production deploy, which predates 04-04).
awaiting: user response

## Tests

### 1. Deploy the constellation branch to production (lsiem.de)
expected: Deploy branch `phase/03-design-direction-immersive-experience` (commit c4a8e20 or later) to a Vercel Preview, then promote to Production. Deployed assets reflect the full 04-04 constellation (three/fiber lazy chunk present, capability gate wired) — confirmed via network tab or curl chunk inspection.
result: [pending]

### 2. Production mobile Lighthouse/CWV audit with 3D active (LCP ≤ 2500ms) + mid-tier Android
expected: Run mobile Lighthouse/PSI with `?webgl=force` against the production URL for /de and /en, plus a real mid-tier-Android measurement (physical device, WebPageTest, or BrowserStack — D-13's preferred proxy). LCP ≤ 2500ms on production. Local proxy currently measures ~2755ms (FAIL, pre-existing 04-01 font gap, not a 3D regression); production is the deciding measurement per D-11/D-12. If production LCP still exceeds 2500ms, a fresh user decision is required on whether to escalate to `display: optional`.
result: [pending]

### 3. External testers pass the 30-second stopwatch test + reduced-motion walkthrough on production
expected: Run `LAUNCH_URL=https://lsiem.de pnpm test:launch` against production (both locales pass: name/role/value-prop visible with zero scroll, dense overview one click away, contact + CV reachable, all under 30s; reduced-motion → zero `<canvas>`, full content in every section, no blocking overlay). Additionally, at least one real external tester performs the same 30-second stopwatch flow and reduced-motion walkthrough by hand on the production URL.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
