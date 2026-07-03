---
status: complete
phase: 01-bilingual-content-foundation
source: [01-VERIFICATION.md]
started: 2026-07-03T17:05:42Z
updated: 2026-07-03T19:08:23Z
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
result: pass
reported: "Diagnose it using vercel cli"
severity: major
resolution: "Diagnosed + fixed. Instrumented Phase-1 build shipped to production via PR #11; verified live (window.va initialized, beacon scripts load 200). See Gaps."

### 5. Reconcile decision D-08 (lsiem.de already serves an interim Next.js site)
expected: Decide whether to amend D-08 to reflect that lsiem.de may serve an interim minimal version ahead of the full Phase-2 Recruiter site, or explicitly reaffirm the original plan. (Decision-log reconciliation flagged by two separate executors — 01-02 and 01-04 — as a change of circumstance outside any plan's control.)
result: pass
reported: "Fix this issue"
severity: major
resolution: "Fixed. D-08 reconciled in canonical + living docs (01-CONTEXT.md contradiction removed, PROJECT.md updated). See Gaps."

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0
blocked: 0
resolved_issues: 2

## Gaps

- truth: "After visiting the preview URL a few times, the Vercel dashboard (project \"portfolio\") → Web Analytics and Speed Insights show page-view / field-performance data (was reporting `hasData: false` before any traffic existed). (Requires real visitor traffic and a logged-in dashboard view.)"
  status: failed
  reason: "User reported: Diagnose it using vercel cli"
  severity: major
  test: 4
  root_cause: "lsiem.de is aliased to the git-main 'interim' production deployment (portfolio-itnutpw61), whose client bundle does NOT mount <Analytics/>/<SpeedInsights/>. Web Analytics + Speed Insights ARE enabled and serving at project level (lsiem.de/_vercel/insights/script.js and /_vercel/speed-insights/script.js both return 200; a bogus control path returns 404). But the instrumentation (src/app/[locale]/layout.tsx:95-96) has only shipped to PREVIEW deployments — it is absent from origin/main. The @vercel/analytics/next component injects its beacon client-side, so real visitors to lsiem.de load a bundle that never requests the beacon script → zero events → hasData:false. NOT a defect in the instrumentation code; a deployment gap (instrumented build has not reached production). Independently reproduced 2026-07-03: 0/9 production _next chunks contain the '_vercel/insights/script' marker; origin/main layout has no SpeedInsights import."
  artifacts:
    - path: "lsiem.de production deployment (git-main / portfolio-itnutpw61)"
      issue: "Serves the pre-instrumentation interim build — 0/9 _next chunks contain the Analytics/SpeedInsights beacon injector"
    - path: "origin/main src/app/[locale]/layout.tsx"
      issue: "Does not mount <Analytics/>/<SpeedInsights/>; instrumentation exists only on branch fix/interim-portfolio-styling (preview-only)"
    - path: "Vercel project 'portfolio' Framework Preset"
      issue: "Stale-set to 'Vite' though the app is Next.js 16 (unrelated to analytics; optional cleanup)"
  missing:
    - "RESOLVED (user-authorized, 2026-07-03): shipped the instrumented Phase-1 build to production via PR #11 (fix/interim-portfolio-styling → main). Vercel auto-deployed portfolio-35oj0apbg to lsiem.de. Verified live in a real browser: both beacon scripts load 200 (served via obfuscated anti-adblock proxy paths /7fbac9770c169b36/script.js + /139d50a83c521fec/script.js — which is why a raw '_vercel/insights/script' bundle grep does NOT match the production build), window.va is initialized and accepts events, Speed Insights present. hasData flips true as real traffic registers."
    - "Still open (optional, unrelated to analytics): retarget the Vercel project Framework Preset from stale 'Vite' → Next.js."
  debug_session: "workflow wf_bda96f00-605 (phase01-uat-gap-diagnosis) + independent reproduction + live browser verification (chrome-devtools)"
- truth: "Decide whether to amend D-08 to reflect that lsiem.de may serve an interim minimal version ahead of the full Phase-2 Recruiter site, or explicitly reaffirm the original plan. (Decision-log reconciliation flagged by two separate executors — 01-02 and 01-04 — as a change of circumstance outside any plan's control.)"
  status: failed
  reason: "User reported: Fix this issue"
  severity: major
  test: 5
  root_cause: "Decision-log reconciliation, not a code defect. D-08's original premise (lsiem.de keeps serving the old Vite site until Phase 2) is obsolete: the user merged an 'interim live site' PR to main before the automated Phase-1 work — a conscious override outside the phase. The canonical record 01-CONTEXT.md:32 was already AMENDED, but 01-CONTEXT.md:80 still asserted the obsolete premise as present-tense fact (internal contradiction in the canonical doc), and PROJECT.md:33 still described the old Vite stack as the current live site. No global decisions registry exists; the D-NN series is canonical in 01-CONTEXT.md. ROADMAP.md Phase 2 premise is already consistent — no edit needed."
  artifacts:
    - path: ".planning/phases/01-bilingual-content-foundation/01-CONTEXT.md:80"
      issue: "Integration-points line still said 'Domain bleibt in Phase 1 auf der alten Site (D-08)' — contradicted the amended D-08 at line 32"
    - path: ".planning/phases/01-bilingual-content-foundation/01-CONTEXT.md:96"
      issue: "Deferred-ideas line implied no new site was live yet"
    - path: ".planning/PROJECT.md:33"
      issue: "Context described lsiem.de as 'aktuell React 19 + Vite ... deployed auf Vercel' — no longer true"
  missing:
    - "RESOLVED: fixed 01-CONTEXT.md:80 (contradiction), scoped 01-CONTEXT.md:96 to the final/complete Recruiter-site switch, and updated PROJECT.md:33 to note the interim Next.js site (D-08 AMENDED). Historical PLAN/SUMMARY/RESEARCH/VERIFICATION references left intact as the audit trail."
  debug_session: "workflow wf_bda96f00-605 (phase01-uat-gap-diagnosis)"