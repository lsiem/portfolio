---
status: complete
phase: 01-bilingual-content-foundation
source: [01-VERIFICATION.md]
started: 2026-07-03T17:05:42Z
updated: 2026-07-03T17:50:23Z
---

## Current Test

[testing complete]

## Tests

### 1. Impressum postal address
expected: The placeholder in content/{de,en}/pages/impressum.mdx is replaced with a real, contactable postal address before the Phase-2 domain switch. (Legal/content decision — flagged as a Phase-2-launch blocker, confirmed present as a clearly-marked placeholder, not silently missing.)
result: pass

### 2. ITSC Software-Engineering role transition date
expected: content/{de,en}/career.ts "Software Engineering" role's `from` date is set to a real value (currently `from: null`, unconfirmed in any source); and confirm whether the Just Relate "Software Engineer" station is still concurrently active. (Factual/biographical detail only the site owner can confirm.)
result: pass

### 3. ELIA + deep Vidama case-study content quality (DE + EN)
expected: Reading both ELIA versions and the deep Vidama case study in full on the preview URL, the abstraction level (D-03), Product-Owner-perspective narrative (D-02), and flagship-vs-deep depth differentiation (D-01) feel correct to the site owner. (Subjective content-quality / narrative-tone judgment — not mechanically verifiable.)
result: pass

### 4. Vercel Web Analytics + Speed Insights show data
expected: After visiting the preview URL a few times, the Vercel dashboard (project "portfolio") → Web Analytics and Speed Insights show page-view / field-performance data (was reporting `hasData: false` before any traffic existed). (Requires real visitor traffic and a logged-in dashboard view.)
result: issue
reported: "Diagnose it using vercel cli"
severity: major

### 5. Reconcile decision D-08 (lsiem.de already serves an interim Next.js site)
expected: Decide whether to amend D-08 to reflect that lsiem.de may serve an interim minimal version ahead of the full Phase-2 Recruiter site, or explicitly reaffirm the original plan. (Decision-log reconciliation flagged by two separate executors — 01-02 and 01-04 — as a change of circumstance outside any plan's control.)
result: issue
reported: "Fix this issue"
severity: major

## Summary

total: 5
passed: 3
issues: 2
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "After visiting the preview URL a few times, the Vercel dashboard (project \"portfolio\") → Web Analytics and Speed Insights show page-view / field-performance data (was reporting `hasData: false` before any traffic existed). (Requires real visitor traffic and a logged-in dashboard view.)"
  status: failed
  reason: "User reported: Diagnose it using vercel cli"
  severity: major
  test: 4
  artifacts: []
  missing: []
- truth: "Decide whether to amend D-08 to reflect that lsiem.de may serve an interim minimal version ahead of the full Phase-2 Recruiter site, or explicitly reaffirm the original plan. (Decision-log reconciliation flagged by two separate executors — 01-02 and 01-04 — as a change of circumstance outside any plan's control.)"
  status: failed
  reason: "User reported: Fix this issue"
  severity: major
  test: 5
  artifacts: []
  missing: []