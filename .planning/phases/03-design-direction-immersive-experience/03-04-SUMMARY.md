---
phase: 03-design-direction-immersive-experience
plan: 04
subsystem: photo-treatment-detail-pages-verification
status: complete
tags: [photo-treatment, case-study, prose, split-heading, reveal, cwv, verification, mode-02, tech-02]
requires:
  - "src/components/motion/split-heading.tsx (03-01)"
  - "src/components/motion/reveal.tsx (03-01/03-02)"
provides:
  - "signature engineered photo treatment (.photo-frame) for About, degrades to text-only (D-16)"
  - "engineered reading-first case-study page (Bricolage SplitHeading H1 + gentle Reveals) (D-15)"
  - "prose/about page with a promoted top-level Bricolage <h1> (fixes missing-h1 / WCAG) (finding #4)"
  - "just-in-time gsap across all home-route motion — home script:size back under the CWV gate (Option A)"
affects:
  - "src/app/[locale]/page.tsx (About photo slot)"
  - "src/app/globals.css (.photo-frame)"
  - "src/app/[locale]/case-studies/[slug]/page.tsx"
  - "src/app/[locale]/[slug]/page.tsx"
  - "src/components/motion/{reveal,career-spine,magnetic,transition-link}.tsx (JIT gsap)"
tech_stack:
  added: []
  patterns:
    - "IntersectionObserver just-in-time gsap import for reveals — Lighthouse no-scroll run never loads the engine"
    - "photo-frame reserves 1:1 box (aspect-ratio + fixed width + placeholder bg) so a late image can't shift layout (CLS)"
    - "promote frontmatter page.title to a single Bricolage <h1> for WCAG single-h1 + display identity"
key_files:
  created: []
  modified:
    - src/app/globals.css
    - src/app/[locale]/page.tsx
    - src/app/[locale]/case-studies/[slug]/page.tsx
    - src/app/[locale]/[slug]/page.tsx
    - src/components/motion/reveal.tsx
    - src/components/motion/career-spine.tsx
    - src/components/motion/magnetic.tsx
    - src/components/motion/transition-link.tsx
    - evals/immersive.spec.ts
decisions:
  - "CWV reconciliation = Option A (human-approved): convert ALL home-route motion (Reveal, CareerSpine, Magnetic, TransitionLink) to just-in-time gsap so Lighthouse's no-scroll mobile run never loads the ~40KB engine. Reveal uses IntersectionObserver (also replaces ScrollTrigger for reveals); CareerSpine gates on min-width:1024 (it's hidden lg:block); Magnetic uses native listeners + lazy gsap; TransitionLink imports gsap in the click handler after a sync preventDefault. Result: home script:size 225KB→177,509 (PASS). Keeps D-08 (GSAP) and D-19 (touch reveals)."
  - "About photo treatment (.photo-frame) reserves its 1:1 box with aspect-ratio + fixed width + placeholder bg so a future owner image never causes CLS; aboutPhotoSrc=null today → section stays text-only exactly as before (D-16)."
  - "Photo corner ticks use var(--muted), not accent — keeps the accent signal-only budget (D-02) rather than spending it on decoration."
  - "Prose/about page promotes page.title to a single top-level Bricolage <h1> via SplitHeading (it had none — MDX started at <h2>), fixing WCAG single-h1 and giving it the display identity (finding #4)."
  - "Case-study + prose H1s use a slightly smaller Display clamp (2.25→4rem) than the hero (2.75→6rem) — reading-first, motion supports comprehension (D-15)."
metrics:
  duration: ~40min
  tasks: 3
  commits: 2
  files_created: 0
  files_modified: 9
  completed: 2026-07-07
---

# Phase 3 Plan 04: Photo Treatment, Detail Pages & Full-Phase Verification Summary

Extended the engineered identity to the last surfaces and reconciled the phase's CWV budget. The About section carries the signature photo treatment (space-reserved 1:1 grid frame + coordinate corner ticks + restrained duotone) that degrades cleanly to text-only; the case-study and prose/about pages inherit the Bricolage display H1 (via SplitHeading) with gentle reading-first reveals, and the prose page gains a proper single top-level `<h1>`. The accumulated Phase-3 motion engine was pulled off Lighthouse's measured path (approved Option A), bringing the home route back under the script budget — verified fresh via LHCI and direct build-chunk inspection. The end-of-phase human walkthrough (wow / skippable / quiet / mobile, both locales) has NOT yet been performed and remains the outstanding gate before Phase 3 closes.

## What Was Built

- **Photo treatment** (`globals.css` `.photo-frame` + `page.tsx` About): 1:1 frame (160→200px), `grayscale(20%) contrast(105%)`, decorative aria-hidden corner-tick SVG; box reserves space (aspect-ratio + fixed width + placeholder bg) so a future owner image can't shift layout. `aboutPhotoSrc=null` → text-only today (D-16).
- **Case-study page**: H1 via `<SplitHeading as="h1">` (Bricolage display, `font-semibold` retired), body in gentle `<Reveal>`s; still fully SSG, data-fetching unchanged (D-15).
- **Prose/about page**: promoted `page.title` to a single top-level Bricolage `<h1>` via `SplitHeading` in a `<header>` (previously had no `<h1>` — MDX started at `<h2>`), body wrapped in `<Reveal>` (finding #4, WCAG single-h1).
- **CWV Option A (approved)**: `Reveal` → IntersectionObserver JIT gsap; `CareerSpine` → `min-width:1024` gate; `Magnetic` → native listeners + lazy gsap; `TransitionLink` → gsap in click handler. Home script:size **225KB → 177,509 (under the 184,643 gate)**.
- **`immersive.spec.ts`**: About text-only degradation, case-study Bricolage H1 + reduced-motion readability, prose single Bricolage `<h1>` = `page.title`.

## Verification (Task 3 automated gates only — human walkthrough NOT performed, see below)

Re-verified fresh (independent of the original implementation pass):

- `pnpm lint`: 0 errors (only pre-existing warnings in gitignored/generated files).
- `pnpm build`: succeeds, all routes remain SSG (case-study/prose/opengraph-image routes all `●`).
- Build-chunk inspection: cross-referenced the homepage's (`/de`) actual initial `<script>` tags against every chunk containing the string `gsap`. The two referenced chunks contain only the small caller-side glue (`import("gsap").then(...)` call sites — Turbopack's dynamic-import runtime references), not the library body. The real gsap implementation (confirmed via its `GreenSock` copyright string) lives in a 72KB chunk that is **not referenced anywhere in the initial HTML** — it only loads via runtime `import()`. This directly confirms gsap is off the critical path, not just "probably" per the dynamic-import pattern.
- LHCI (`pnpm exec lhci autorun`, 3 runs each on `/de` and `/en`): `resource-summary:script:size` **177,509 bytes ≤ 184,643 PASS** (consistent across all 6 runs); `cumulative-layout-shift` **0 PASS**; `total-blocking-time` **0-2ms PASS**; `categories:performance` **0.95 (/de) / 0.96 (/en) PASS**; `largest-contentful-paint` **2909-2914ms (/de) / 2756-2758ms (/en) — FAILS the ≤2500ms budget** (see Deferred Issues — this is the pre-existing, already-accepted 03-01 font cost, not a JS regression from this fix).
- Playwright (`pnpm exec playwright test`, full suite, workers=default against a `pnpm start` production server since `next dev`'s file watcher hits `EMFILE: too many open files` on this machine): **135/136 passed** in the full parallel run. The 1 failure (`hash-anchor nav scrolls to the section under Lenis`, `/de` only) reproduced twice under full parallel load but **passed reliably (2/2) when re-run with `--workers=1`** — confirmed environmental CPU-contention flakiness (the test's own in-code comment already documents this exact failure mode under heavy parallel worker load), not a regression from the Reveal/CareerSpine/Magnetic/TransitionLink changes (none of which touch Lenis or hash-anchor scrolling).
- **Human walkthrough: NOT PERFORMED.** No real user session drove the site during this execution — `auto_advance` is `false` in `.planning/config.json`, so a `checkpoint:human-verify` gate cannot be auto-approved, and no human interactively confirmed the four dimensions in this session. This is documented as the outstanding phase-completion gate below; WOW-02/03/04, MODE-02, and TECH-02 are intentionally left unmarked in `REQUIREMENTS.md` pending it.

## Deviations from Plan

**1. [Rule 1/3 — CWV, approved] Option A just-in-time gsap across home-route motion.**
The plan expected 03-04 to reconcile the accumulated bundle; the human approved Option A. Converted `Reveal`/`CareerSpine`/`Magnetic`/`TransitionLink` from mount-time/static gsap to just-in-time loading so the engine is absent from Lighthouse's no-scroll mobile run. This supersedes 03-03's static `useGSAP`/`contextSafe` for `Magnetic`/`TransitionLink` (those grep-level acceptance details no longer hold — the components use native listeners / handler-scoped imports instead) but preserves every locked decision and all functional evals.
- **Files:** reveal.tsx, career-spine.tsx, magnetic.tsx, transition-link.tsx — **Commit:** 3e04780

**2. [minor] Photo corner ticks use `var(--muted)`, not accent.**
Per the plan's "prefer border-toned if in doubt" guidance, to keep accent signal-only (D-02).
- **File:** page.tsx — **Commit:** 748c07c

## Deferred Issues

**1. LCP ~2756-2914ms (local) > 2500ms — the 03-01-accepted, human-ratified overage; production verification required.**

Reconfirmed here with fresh numbers: the script reduction (225KB→177,509 bytes) did NOT change LCP (it is essentially identical to the 03-01 measurement of ~2755ms), proving it is font-bound, not JS-bound. It is the intrinsic ~300ms cost of the D-03 Bricolage display H1 (03-01 bisection: Bricolage H1 → 2755ms vs 2453ms without) on Lighthouse's simulated slow-4G/4x-CPU profile, on a budget Phase 2 left with ~26ms headroom. All other CWV metrics now pass.

**→ Ship-gate item (carried from 03-01, still open):** verify `largest-contentful-paint ≤ 2500ms` on the Vercel preview for `/de` and `/en` before promoting to production. The TECH-01 budget was calibrated on a production build (STATE.md); production LCP is the source of truth. If production also exceeds, the only remaining lever is dropping/deferring the Bricolage H1 (a D-03 change) — escalate then, not now.

**2. End-of-phase human walkthrough — NOT performed, the outstanding phase-completion gate.**

Plan 03-04's Task 3 (`checkpoint:human-verify`, `gate="blocking"`) requires a human to confirm four dimensions on both `/de` and `/en` before Phase 3 (and its 5 requirements WOW-02, WOW-03, WOW-04, MODE-02, TECH-02) can be marked complete. This execution ran only the automated portion of Task 3 (lint, build, Playwright, LHCI — see Verification above); no human interactively drove the site. The remaining items, unchanged from the plan:

- **WOW** (desktop, pointer:fine): hero intro, career scroll reveals + ITSC multi-beat + spine fill, bento stagger, magnetic buttons, and crossfade transitions read as intentional "medium/expressive" craft (D-10) — not spectacle, accent stays signal-only.
- **SKIPPABLE**: identity (name/role/value-prop) + anchor nav visible from first paint, no preloader; anchor nav jumps to any section immediately (WOW-04).
- **QUIET** (`prefers-reduced-motion: reduce`): every page shows the full, intentionally-designed static content — no motion, no missing content, no broken/empty states, Lenis off (MODE-02).
- **MOBILE** (narrow viewport / touch): deliberate single column (spine hidden, magnetic absent), native scroll feels good, no scrolljacking and no shrunk-desktop feel (TECH-02).

`REQUIREMENTS.md` intentionally keeps WOW-02/03/04, MODE-02, TECH-02 unmarked (and `ROADMAP.md` keeps Phase 3's top-level checkbox unmarked) until this walkthrough happens.

## Known Stubs

- About photo slot is intentionally dormant (`aboutPhotoSrc=null`) pending the owner-supplied image (D-16, non-blocking) — documented in-code; not a data stub.

## Notes for Future Plans

- The whole site (overview, career, projects, case studies, about) now presents one consistent engineered identity across both locales.
- Home-route motion is uniformly just-in-time; any new home-route animation must follow the same pattern to hold the script budget.
- Plan 03-04's automated work is complete and freshly re-verified (build/lint/Playwright/LHCI). Phase 3 is NOT yet closed: the end-of-phase human walkthrough (wow/skippable/quiet/mobile) is the sole outstanding gate — run it before marking WOW-02/03/04, MODE-02, TECH-02 complete or checking off Phase 3 in ROADMAP.md.

## Self-Check: PASSED

SUMMARY.md exists on disk; plan-04 commits (`748c07c`, `3e04780`) present in git history. All verification numbers in this SUMMARY were freshly re-measured in this session (not copied from the prior pass): `pnpm build`/`pnpm lint` re-run clean, `pnpm exec lhci autorun` re-run (6/6 runs script:size=177,509), `pnpm exec playwright test` re-run (135/136 parallel, 136/136 confirmed via serial re-run of the one flake).
