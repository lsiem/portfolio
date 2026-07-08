---
phase: 03-design-direction-immersive-experience
plan: 02
subsystem: career-storytelling-bento
status: complete
tags: [gsap, scrolltrigger, reveal, career-spine, bento, wow-02, reduced-motion, cwv]
requires:
  - "src/components/motion/reveal.tsx (03-01 reveal primitive — extended here)"
  - "src/lib/motion-tokens.ts (03-01 token reader)"
  - "src/app/[locale]/page.tsx (03-01 width-shell + career left column + hero)"
provides:
  - "CareerSpine — lg+ progress rail + NN·YYYY coordinate ticks + transform scroll-fill"
  - "ProjectBento — asymmetric 12-col bento (ELIA + Vidama featured, rest compact) with swappable LinkComponent seam"
  - "Reveal.emphasis variant (D-06 chapter tokens) + lazy-loaded gsap"
  - "career section as scroll-linked chapters with the ITSC multi-beat sub-sequence"
affects:
  - "src/app/[locale]/page.tsx (career + projects sections)"
  - "src/components/motion/reveal.tsx (lazy gsap + emphasis)"
tech_stack:
  added: []
  patterns:
    - "lazy dynamic import() of gsap/ScrollTrigger in Reveal + CareerSpine (eager-bundle hygiene, mirrors 03-01)"
    - "reveals gate on reduced-motion ONLY (stay on touch per D-19), unlike Lenis/hero which gate on pointer:fine"
    - "swappable LinkComponent prop pre-wires the Plan-03 TransitionLink seam"
    - "one <li> per project (card + supporting panel nested) — no N×panel over-announcement"
key_files:
  created:
    - src/components/motion/career-spine.tsx
    - src/components/motion/project-bento.tsx
  modified:
    - src/components/motion/reveal.tsx
    - src/app/[locale]/page.tsx
    - evals/immersive.spec.ts
decisions:
  - "Reveal + CareerSpine lazy-load gsap/ScrollTrigger via dynamic import() (not static useGSAP) to keep the home route's EAGER bundle lean — mirrors 03-01's HeroIntro/MotionProvider. Total script:size still counts the gsap chunk because reveals run on Lighthouse's mobile emulation (D-19 keeps reveals on touch); this is the advisory bundle breach below."
  - "Reveals gate on prefers-reduced-motion only (not pointer:fine) so the progressive-reveal timeline stays on touch (D-19); Lenis/magnetic keep the stricter pointer:fine gate."
  - "ITSC (first career entry) is the single multi-beat centerpiece: each role (SysAdmin → Software Engineering → Product Owner) is its own <Reveal emphasis> beat (lg/chapter tokens, D-06); every other org gets one lighter <Reveal>."
  - "ProjectBento is a Server Component composing the client <Reveal> per cell — only client JS is the reveal boundary. hasCaseStudy derived from project.depth (flagship/deep), so no getCaseStudy re-fetch."
  - "ProjectBento exposes a swappable LinkComponent prop (default @/i18n/navigation Link) so Plan 03 injects TransitionLink for internal case-study links with zero further bento edits; external visit link stays a native <a target=_blank>."
  - "Projects section widened to max-w-[1440px] (D-04) to host the 12-col bento; career left column widened 3rem→5rem to fit the spine ticks."
metrics:
  duration: ~20min
  tasks: 2
  commits: 2
  files_created: 2
  files_modified: 3
  completed: 2026-07-05
---

# Phase 3 Plan 02: Career Scroll-Storytelling & Featured Bento Summary

Turned the career and projects sections into the phase's storytelling centerpiece on the 03-01 primitives: the career now reads as scroll-linked chapters with the ITSC SysAdmin→SWE→PO arc as an emphasized multi-beat sub-sequence (WOW-02, D-06), a coordinate progress spine orients on desktop (D-07), and the projects render as an asymmetric bento with ELIA + Vidama featured and the rest compact (D-14) — all fully present under reduced-motion, on touch, and below lg (MODE-02, TECH-02), native scroll only, no pinning/scrolljacking (D-05).

## What Was Built

- **`CareerSpine`** (`career-spine.tsx`): lg+ vertical rail (`hidden lg:block`) with one decorative `aria-hidden` `NN·YYYY` tick per career chapter and an accent scroll-progress fill (transform-only `scaleY` via `ScrollTrigger.onUpdate`, no pin). Lazy-loads gsap; static rail under reduced-motion.
- **`Reveal`** (extended): added the `emphasis` variant (D-06 → `--motion-distance-lg` / `--motion-duration-chapter`) and converted to lazy-loaded gsap (dynamic `import()` + `gsap.context`) gated on reduced-motion so it stays on touch (D-19) while keeping the eager bundle lean.
- **`ProjectBento`** (`project-bento.tsx`): Server Component; asymmetric 12-col grid — ELIA (flagship) + Vidama (deep) as the large featured pair (2px top border + larger heading, no extra accent), the four `card` projects compact. One `<li>` per project (card + supporting tag panel nested). Swappable `LinkComponent` prop (default `@/i18n/navigation` Link) pre-wires the Plan-03 `TransitionLink` seam; external `visit` link stays a native `<a target="_blank">`.
- **`page.tsx`**: career section renders `<CareerSpine>` in the left column and wraps org chapters in `<Reveal>` (ITSC via per-role `<Reveal emphasis>` beats); projects section widened to `max-w-[1440px]` and rendered via `<ProjectBento>`. `getCaseStudy` import removed (bento derives from `project.depth`).
- **`immersive.spec.ts`**: career + bento contracts (org count pinned to `getCareer(locale).entries.length`, exact ITSC role titles per locale, spine present + `aria-hidden`, one `<li>` per project pinned to heading count, ELIA/Vidama case-study links resolve, reduced-motion opacity 1).

## Verification

- `pnpm lint`: 0 errors (only pre-existing warnings in gitignored/generated files).
- `pnpm build`: succeeds; all routes SSG.
- Playwright: **78/78 green** at `--workers=2` (immersive 28 + home 36 + a11y 14). At the machine's default 7 workers the single `hash-anchor under Lenis` test flakes (Lenis rAF starved under CPU contention); it is deterministic at CI's `workers: 1` and in isolation — marked `test.slow()` with a widened poll.
- LHCI (advisory per plan): CLS 0 PASS; **script:size ~223KB > 184,643 gate**, **LCP ~2.9s > 2500ms** — see Deferred Issues.

## Deviations from Plan

**1. [Rule 1/3 — bundle] Reveal + CareerSpine lazy-load gsap (not static useGSAP).**
The plan reused 03-01's `Reveal` (static `useGSAP`) and added `CareerSpine` similarly. Statically importing gsap into home-route client components pulled the whole engine into the eager bundle (measured 223KB eager, LCP 2907ms). Converted both to lazy dynamic `import()` + `gsap.context` (mirrors 03-01's HeroIntro), which restores a lean eager bundle and improves LCP. `reveal.tsx` was not in `files_modified` but is the designated primitive; the change is additive/backward-compatible.
- **Files:** reveal.tsx, career-spine.tsx
- **Commits:** c157d83, ed2e93e

**2. [scope] Career left column 3rem → 5rem; projects section max-w-3xl → max-w-[1440px].**
Needed to fit the spine `NN·YYYY` ticks and the 12-col bento (D-04). Structural width-only change; section ids/aria/headings unchanged (home + a11y evals stay green).
- **File:** page.tsx
- **Commit:** ed2e93e

## Deferred Issues

**ADVISORY bundle + LCP breach (per plan Task-2 finding #5 — not a hard stop for this plan; CI + the 03-04 checkpoint are the authoritative gates).**

- `resource-summary:script:size` ≈ **223KB** vs the 184,643-byte gate (+~39KB).
- `largest-contentful-paint` ≈ **2.75–2.9s** vs ≤2500ms (compounds 03-01's accepted overage).

Root cause: the ~39KB is gsap core + ScrollTrigger, which loads on Lighthouse's mobile emulation because the progressive reveals **run on touch** (D-19). Lazy-loading keeps it out of the eager bundle (LCP-friendly) but the chunk still loads during the trace, so the *total* script:size counts it. This is the accumulated Phase-3 motion-engine cost the plan anticipated by making per-wave checks advisory.

**Recommended reconciliation before Wave 3 / at the 03-04 checkpoint (in priority order):**
1. Defer the below-fold `GitHubHeatmap` client component (biggest non-motion client JS) via a lazy boundary to reclaim ~budget for the motion engine — highest-leverage, keeps D-19.
2. Reconcile the script budget at 03-04: the gsap engine is a deliberate, one-time Phase-3 cost shared across all reveals; if production (Vercel) CWV holds, adjust the local budget with justification rather than dropping motion.
3. Last resort (D-19 tradeoff): gate reveal *animation* on pointer:fine (static content on touch) to keep gsap off the mobile-measured path.

Also carried from 03-01: verify production LCP ≤ 2500ms on the Vercel preview for `/de` and `/en`.

## Known Stubs

None. The career left-margin column now hosts the real `CareerSpine` (03-01 reserved it empty).

## Notes for Future Plans

- Plan 03 injects `TransitionLink` as `ProjectBento`'s `LinkComponent` (internal case-study links) — no bento structural edits needed.
- `Reveal` is now lazy-gsap + supports `emphasis`; plans 03-04 consume it as-is for case-study/section reveals.
- Any further home-route client JS must weigh against the already-breached script budget — coordinate the reconciliation at 03-04.

## Self-Check: PASSED

Both created components + SUMMARY.md exist on disk; both plan-02 commits (`c157d83`, `ed2e93e`) present in git history.
