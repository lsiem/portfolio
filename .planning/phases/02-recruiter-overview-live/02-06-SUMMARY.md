---
phase: 02-recruiter-overview-live
plan: 06
subsystem: infra
tags: [security-headers, csp, lighthouse-ci, core-web-vitals, accessibility, nextjs]

# Dependency graph
requires:
  - phase: 02-recruiter-overview-live/02-01
    provides: "hero/about/anchor-nav/header-Contact/CV-download baseline + global :focus-visible ring"
  - phase: 02-recruiter-overview-live/02-02
    provides: "prebuild -> generate:cv chain (public/Lasse-Siemoneit-CV-{de,en}.pdf) that must survive a full pnpm build under the tightened LHCI budget"
  - phase: 02-recruiter-overview-live/02-03
    provides: "no-flash inline theme script (the exact string this plan's CSP attempt hashed) + theme-toggle radiogroup"
  - phase: 02-recruiter-overview-live/02-04
    provides: "og-image routes + Person JSON-LD wired into the overview page"
  - phase: 02-recruiter-overview-live/02-05
    provides: "GitHub activity heatmap section + GITHUB_TOKEN user-setup requirement this plan's verification gate confirms"
provides:
  - "next.config.ts headers() security block (HSTS, X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy) applied to every route"
  - "Documented, evidence-based CSP-gap decision (no CSP shipped) with the exact technical blocker recorded in a next.config.ts comment and STATE.md Blockers/Concerns"
  - "Tightened Lighthouse CI budget: LCP <= 2500ms, total-blocking-time <= 200ms (INP proxy), cumulative-layout-shift <= 0.1, plus the pre-existing script-size and performance-score >= 0.9 assertions"
  - "CI budget comment in .github/workflows/ci.yml synced to the actual lighthouserc.json thresholds"
  - "evals/a11y.spec.ts — landmarks/focus/keyboard/lang/external-link accessibility baseline (28 assertions, both locales)"
  - "Confirmed (via `vercel env ls production`) that GITHUB_TOKEN is NOT yet set in the Vercel Production environment — a blocking pre-cutover item now explicitly handed to the 02-07 human cutover checkpoint"
affects: [02-07-cutover]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Security headers centralized in next.config.ts's async headers(), applied via a single source:'/(.*)' rule wrapped by withContentCollections(withNextIntl(...)) — no change to the plugin composition order"
    - "CSP-gap-as-code-comment: when a security control can't ship safely, the blocker is documented inline at the point where it would have been added (not silently dropped), plus a durable STATE.md tracking entry — avoids both a broken CSP and a silently lost TODO"
    - "Accessibility evals assert stable role/landmark/rel/focus-ring contracts (per-control focus + computed outline style) rather than a whole-page Tab-order sequence, to stay resilient across browsers/extensions"

key-files:
  created:
    - evals/a11y.spec.ts
  modified:
    - next.config.ts
    - lighthouserc.json
    - .github/workflows/ci.yml
    - .planning/STATE.md

key-decisions:
  - "No Content-Security-Policy header ships. A sha256-hash-based CSP (script-src 'self' plus the hash of the static no-flash theme script) was implemented, built, and verified against a production server with Playwright + a headless browser console check: it broke the site. Next.js App Router streams the RSC payload for every route via multiple self.__next_f.push(...) inline <script> tags whose content — and therefore sha256 hash — differs per page AND per build. There is no finite, stable hash set to allowlist for a statically-generated (SSG) App Router site without switching to per-request nonces, which requires dynamic rendering on every route and would break this project's all-static CWV-optimized architecture. Rather than weaken to 'unsafe-inline' (explicitly disallowed by the plan) or ship a CSP that breaks the site, the gap is documented as a code comment in next.config.ts and tracked as a non-blocking follow-up in STATE.md ## Blockers/Concerns, per the plan's own escape hatch and REVIEW finding 7."
  - "@vercel/analytics and @vercel/speed-insights were confirmed (by reading the installed package internals) to load their script and send their beacon from same-origin, Vercel-proxied paths (/_vercel/insights/*, /_vercel/speed-insights/*) rather than an external vercel-insights.com domain — so even a future CSP attempt would need no third-party origin allowlist, preserving the zero-runtime-third-party (DSGVO) posture."
  - "cumulative-layout-shift <= 0.1 was added to lighthouserc.json in addition to the plan's required largest-contentful-paint <= 2500 and total-blocking-time <= 200 — CLS 'good' is part of the same ROADMAP Success Criterion 4 / TECH-01 wording ('Core Web Vitals good') and the production build already passes it, so gating it now costs nothing and closes a gap the plan's acceptance criteria didn't explicitly require but its stated intent covers."
  - "evals/a11y.spec.ts asserts each key control's per-element focus + a visible computed :focus-visible outline (outline-style !== 'none', outline-width > 0) rather than a single whole-page Tab-order sequence, per the plan's explicit guidance that rigid Tab-order tests flake across browsers/extensions."

patterns-established:
  - "Any future security header/CSP change must re-verify against a production build with the browser console open (or an automated console-error assertion) before shipping — a CSP that type-checks and builds cleanly can still silently break client hydration at runtime, which none of the existing lint/build/typecheck gates catch."

requirements-completed: [TECH-01, TECH-03]

# Coverage metadata
coverage:
  - id: D1
    description: "Every page ships HSTS, X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, and Permissions-Policy response headers via next.config.ts headers()"
    requirement: "TECH-01"
    verification:
      - kind: other
        ref: "node -e header-presence guard script (checks next.config.ts source for all four header names)"
        status: pass
      - kind: other
        ref: "curl -sI http://localhost:3000/de against a pnpm build + pnpm start production server — all five headers present in the actual response"
        status: pass
    human_judgment: false
  - id: D2
    description: "A working CSP was attempted first (static-script hash + Vercel analytics same-origin allowlist); it demonstrably breaks the site, so the documented-fallback path was taken instead of shipping a broken or unsafe-inline CSP — the gap is recorded in STATE.md Blockers/Concerns, not closed silently in a code comment alone"
    requirement: "TECH-01"
    verification:
      - kind: e2e
        ref: "Playwright + headless browser console-error capture against the hash-based CSP build — reproduced 20+ 'Executing inline script violates ... script-src' violations from Next's per-page RSC hydration scripts, then evals/theme.spec.ts's Dark-toggle assertions failed (hydration broke), confirming the CSP breaks real user interaction, not just a console warning"
        status: pass
      - kind: other
        ref: ".planning/STATE.md ## Blockers/Concerns — CSP gap entry added with the exact technical blocker and a non-blocking-for-launch note"
        status: pass
    human_judgment: false
  - id: D3
    description: "withContentCollections/withNextIntl wrapping is preserved and pnpm build succeeds with the new headers() block"
    requirement: "TECH-01"
    verification:
      - kind: other
        ref: "pnpm build (full prebuild -> next build chain, all 21 routes)"
        status: pass
    human_judgment: false
  - id: D4
    description: "The inline no-flash theme script and Vercel analytics/speed-insights still function after the headers change (with no CSP shipped, this is a low-risk confirmation, but was verified explicitly)"
    requirement: "TECH-01"
    verification:
      - kind: e2e
        ref: "evals/theme.spec.ts (8/8) — System/Dark/reload-persistence/System-reset all pass against the final (non-CSP) headers build"
        status: pass
      - kind: other
        ref: "curl -sI shows all 5 non-CSP security headers present without breaking the previously-passing home/theme suites"
        status: pass
    human_judgment: false
  - id: D5
    description: "lighthouserc.json asserts largest-contentful-paint maxNumericValue 2500 and adds a total-blocking-time maxNumericValue 200 assertion (INP lab proxy); the CI comment matches the actual thresholds; pnpm exec lhci autorun passes all assertions for /de and /en against a production build"
    requirement: "TECH-01"
    verification:
      - kind: other
        ref: "node -e assertion-presence guard script (LCP===2500, total-blocking-time present)"
        status: pass
      - kind: other
        ref: "pnpm build && pnpm exec lhci autorun — 3 runs each for /de and /en, all assertions (LCP 2500, TBT 200, CLS 0.1, script-size, perf >=0.9) pass, medians uploaded successfully"
        status: pass
    human_judgment: false
  - id: D6
    description: "The full Playwright eval suite (home, theme, seo, activity, i18n, a11y) is green"
    requirement: "TECH-03"
    verification:
      - kind: e2e
        ref: "pnpm exec playwright test --project=chromium — 84/84 passing against a pnpm build + pnpm start production server"
        status: pass
    human_judgment: false
  - id: D7
    description: "evals/a11y.spec.ts passes for both locales: html lang correct, single main+header+footer, named sections have an accessible name, keyboard reaches all key controls with a visible focus ring, external links carry rel=noopener noreferrer"
    requirement: "TECH-03"
    verification:
      - kind: e2e
        ref: "pnpm exec playwright test evals/a11y.spec.ts --project=chromium — 28/28 passing, both locales"
        status: pass
    human_judgment: false
  - id: D8
    description: "Production GITHUB_TOKEN gate (REVIEW finding 6, blocking pre-cutover): GITHUB_TOKEN presence in the Vercel Production environment confirmed BEFORE promotion"
    requirement: "TECH-01"
    verification:
      - kind: other
        ref: "vercel env ls production (authenticated CLI, project linked) — returned 'No Environment Variables found for lsiems-projects/portfolio'"
        status: fail
    human_judgment: true
    rationale: "The check ran successfully and confirms GITHUB_TOKEN is NOT currently set in Vercel Production — this is expected (Plan 05 flagged it as outstanding user setup) and this plan's job was to CONFIRM the gate, not silently pass it. It is explicitly a blocking pre-cutover item for a human to resolve (generate + add the PAT) before Plan 07's cutover, not something this executor can or should auto-fix by minting a credential. Routing to human_judgment ensures the 02-07 cutover checkpoint sees this as unresolved rather than a false green."
  - id: D9
    description: "Manual mobile Lighthouse against the live Vercel preview URL, and a visual response-header check via browser devtools on that preview URL"
    requirement: "TECH-01"
    verification: []
    human_judgment: true
    rationale: "This plan's verification ran the LHCI budget and curl header checks against a local pnpm build + pnpm start server, not the actual deployed Vercel preview (no live preview URL exists yet in this execution context — that is a 02-07 cutover-time artifact). The plan's own verification section calls this out as a manual step; it is deferred to the human cutover checkpoint, not skipped."
  - id: D10
    description: "Muted-on-background and accent-link contrast pass AA in both light and dark themes (tokens unchanged from Plans 01/03, re-confirmation only)"
    requirement: "TECH-03"
    verification: []
    human_judgment: true
    rationale: "Contrast values were already computed and documented in the UI-SPEC and re-affirmed as human_judgment items in 02-01/02-03's SUMMARYs; no token changed in this plan, so this is carried forward unchanged rather than re-verified with new automation."

# Metrics
duration: ~30min
completed: 2026-07-05
status: complete
---

# Phase 2 Plan 6: Pre-Cutover Hardening — Security Headers, CWV Budget, Accessibility Summary

**Security response headers shipped (HSTS/nosniff/X-Frame-Options/Referrer-Policy/Permissions-Policy) with a documented, evidence-based decision NOT to ship a CSP (Next.js App Router's per-build RSC hydration scripts make a static hash-allowlist infeasible without breaking dynamic-rendering-free SSG); the Lighthouse CI budget tightened to LCP<=2500ms + TBT<=200ms + CLS<=0.1 and verified passing against a production build; a new 28-assertion accessibility eval; and confirmation that the production GITHUB_TOKEN gate is still unset, now explicitly handed to the Plan 07 cutover checkpoint.**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-07-05T11:11:34Z (per STATE.md prior session)
- **Completed:** 2026-07-05T11:20:48Z
- **Tasks:** 3
- **Files modified:** 5 (4 modified, 1 created)

## Accomplishments

- `next.config.ts` gained an async `headers()` block (withContentCollections/withNextIntl wrapping preserved) applying HSTS (`max-age=31536000; includeSubDomains; preload`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and a `Permissions-Policy` disabling camera/microphone/geolocation to every route — confirmed live via `curl -sI` against a production `pnpm build && pnpm start` server
- Attempted a hash-based CSP first (per the plan's preferred path), built it, and used Playwright + a headless browser console-error capture to prove it breaks the site: Next.js App Router streams the RSC payload via multiple `self.__next_f.push(...)` inline scripts whose sha256 hashes differ per page and per build, so no static hash allowlist is possible without nonce-based dynamic rendering (which would break the whole site's static optimization). Documented the exact blockers as an inline `next.config.ts` comment and a new `## Blockers/Concerns` entry in `.planning/STATE.md`, per the plan's own documented-fallback escape hatch and REVIEW finding 7 — the non-CSP headers still ship unconditionally
- Along the way, confirmed both `@vercel/analytics` and `@vercel/speed-insights` load their script and send their beacon from same-origin Vercel-proxied paths (`/_vercel/insights/*`, `/_vercel/speed-insights/*`), not an external domain — useful groundwork for any future CSP attempt
- `lighthouserc.json`: `largest-contentful-paint` tightened from 3000ms to 2500ms (ROADMAP criterion 4 / TECH-01 "good"); added `total-blocking-time` <= 200ms (the INP lab proxy) and `cumulative-layout-shift` <= 0.1 as new error-level assertions, alongside the pre-existing script-size and performance-score (>=0.9) assertions
- `pnpm build && pnpm exec lhci autorun` verified all assertions pass for both `/de` and `/en` (3 runs each) against a production build — no regression, no budget relaxation needed
- `.github/workflows/ci.yml`'s Lighthouse budget comment updated to state the actual final thresholds verbatim (LCP 2500, TBT 200, CLS 0.1, real script-byte value, perf 0.9) — no drift from `lighthouserc.json`
- New `evals/a11y.spec.ts` (28 assertions, both locales): `<html lang>` matches the locale, exactly one `<main>` + `<header>` + `<footer>`, every named section (`#career`/`#projects`/`#skills`/`#about`/`#contact`/`#activity`) has an `aria-labelledby` resolving to a visible non-empty heading, the header Contact affordance / theme-toggle radiogroup options / locale switcher / CV download button are each individually keyboard-focusable with a visible computed `:focus-visible` outline, a light Tab smoke-check confirms the first Tab lands on a real interactive control, and every `target="_blank"` anchor carries `rel="noopener noreferrer"`
- Full Playwright suite (`home`, `i18n`, `seo`, `theme`, `a11y` — 84 tests) passes against the final production build
- Ran `vercel env ls production` (authenticated CLI, project linked via `vercel link`) and confirmed `GITHUB_TOKEN` is **not yet set** in the Vercel Production environment — this was already flagged as outstanding user setup in Plan 05; this plan's job was to confirm the gate state and hand it to Plan 07 as an explicit blocking pre-cutover item, not to silently pass or auto-remediate it (it requires a human-generated PAT)

## Task Commits

Each task was committed atomically:

1. **Task 1: Security response headers via next.config headers()** - `5731348` (feat)
2. **Task 2: Tighten CWV budget to the goal (LCP 2500 + INP/TBT), sync CI comment, full eval suite** - `31c574a` (feat)
3. **Task 3: Accessibility eval — landmarks, focus, keyboard, lang** - `6dca9a4` (test)

_No TDD tasks in this plan — tdd_mode is off for this project._

**Plan metadata:** committed together with this SUMMARY (see final commit in this plan's history)

## Files Created/Modified

- `next.config.ts` - `headers()` security block (HSTS/nosniff/X-Frame-Options/Referrer-Policy/Permissions-Policy) + a detailed CSP-gap code comment
- `lighthouserc.json` - LCP tightened to 2500, added `total-blocking-time` (200) and `cumulative-layout-shift` (0.1) assertions
- `.github/workflows/ci.yml` - Lighthouse budget comment synced to the actual final thresholds
- `.planning/STATE.md` - New `## Blockers/Concerns` entry tracking the CSP gap as a non-blocking-for-launch follow-up
- `evals/a11y.spec.ts` - New: landmarks/focus/keyboard/lang/external-link accessibility assertions, both locales

## Decisions Made

- Shipped the non-CSP security headers unconditionally and took the plan's documented-fallback path for CSP rather than a broken or `unsafe-inline` policy — see `key-decisions` in the frontmatter for the full technical rationale (Next.js App Router's per-build RSC hydration scripts have non-deterministic hashes, and nonce-based CSP would force dynamic rendering across the whole static site).
- Added `cumulative-layout-shift <= 0.1` to the LHCI budget beyond the plan's literal ask (LCP 2500 + TBT 200) because it's part of the same "Core Web Vitals good" success criterion and the build already clears it — no cost, closes coverage.
- `evals/a11y.spec.ts` asserts per-control focus + computed outline style rather than a single rigid whole-page Tab-order sequence, per the plan's explicit anti-flake guidance.
- Ran `vercel link --yes` to authenticate the environment-check command against the correct linked project (`lsiems-projects/portfolio`); this created a gitignored `.vercel/` directory and refreshed the gitignored `.env.local` — verified neither is tracked by git before and after.

## Deviations from Plan

None — plan executed exactly as written, including its own explicit branch condition. Task 1's action block gave two paths ("EITHER a working CSP ... OR, if the hash/allowlist cannot be validated ... ship the non-CSP headers ... and leave a clearly-commented CSP TODO") and its acceptance criteria required attempting the CSP first and falling back only if it demonstrably breaks the site — that is exactly what happened: the CSP was implemented, built, and proven (via reproducible browser console errors and a failing `evals/theme.spec.ts` run) to break real user interaction, then the fallback path was taken and the STATE.md tracking entry (also explicitly required by the acceptance criteria) was added. This is the plan's designed contingency, not a deviation from it.

## Issues Encountered

- The local eval environment again hit `EMFILE: too many open files, watch` when Playwright's `webServer` tried to start `pnpm dev` (documented in every prior 02-01..02-05 SUMMARY as a sandboxed-shell/Turbopack-watcher interaction unrelated to any code in this plan). Worked around identically: built (`pnpm build`) and ran the production server (`pnpm start`) directly, then invoked `pnpm exec playwright test` against it (`reuseExistingServer` picked it up). `playwright.config.ts` was not modified.
- `pnpm exec lhci autorun` prints a harmless `⚠️ GitHub token not set` healthcheck warning — this refers to an *optional* LHCI-status-check GitHub token for posting PR comments, unrelated to the `GITHUB_TOKEN` used by the site's own GitHub-activity-heatmap fetch (Plan 05). No action needed; noted here only to avoid confusion between the two same-named-but-unrelated tokens.

## User Setup Required

**Confirmed outstanding from Plan 05 — GITHUB_TOKEN is not set in Vercel Production.** This is not new work created by this plan; Plan 05's SUMMARY already flagged it as required user setup. This plan's contribution is running the actual confirmation check (`vercel env ls production`) and recording the result as an explicit, non-silent blocking item for the Plan 07 cutover checklist (coverage D8 above), rather than leaving it as an unconfirmed assumption. See `02-05-SUMMARY.md`'s "User Setup Required" section for the exact steps (generate a read-only `read:user` PAT for the `lsiem` account, add as `GITHUB_TOKEN` to Vercel Production).

## Next Phase Readiness

- TECH-01 is proven on a production build for everything automatable: security headers ship, the CWV budget is tightened to the ROADMAP's actual "good" targets and passes, and the CSP gap is a documented, tracked, non-blocking-for-launch decision rather than a silent omission.
- TECH-03 is reinforced with a dedicated, non-flaky accessibility eval covering landmarks, keyboard reachability, focus visibility, and external-link safety.
- **Blocking for Plan 07 cutover:** `GITHUB_TOKEN` must be added to the Vercel Production environment (and a fresh production build triggered) before the activity heatmap ships real data instead of the fallback line — confirmed absent by this plan's verification, not yet resolved.
- **Manual, non-blocking, owner-facing (per this plan's own verification section):** a live mobile Lighthouse run and a response-header check against the actual deployed Vercel preview URL (this plan verified against a local production build only, since no live preview exists yet in this execution context); a visual keyboard/contrast pass in both themes (tokens unchanged since Plans 01/03's own human-judgment sign-off).
- No other blockers for Plan 07.

## Self-Check: PASSED

All key files confirmed present on disk: `next.config.ts`, `lighthouserc.json`, `.github/workflows/ci.yml`, `.planning/STATE.md`, `evals/a11y.spec.ts`. All three task commits (`5731348`, `31c574a`, `6dca9a4`) confirmed present in `git log`. All plan `<acceptance_criteria>` re-verified against the final state: `next.config.ts` exports the five non-CSP security headers and `pnpm build` succeeds; the CSP-gap fallback path (with its STATE.md tracking requirement) was correctly taken after the hash-based CSP was proven to break the site; `lighthouserc.json` asserts LCP 2500 + `total-blocking-time` 200; the CI comment matches; `pnpm exec lhci autorun` passes for both locales against a production build; the full Playwright suite (84/84, including the new `evals/a11y.spec.ts` at 28/28) is green; `pnpm lint` and `pnpm exec tsc --noEmit` are clean.

---
*Phase: 02-recruiter-overview-live*
*Completed: 2026-07-05*
