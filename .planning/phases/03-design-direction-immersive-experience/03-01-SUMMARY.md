---
phase: 03-design-direction-immersive-experience
plan: 01
subsystem: motion-foundation
status: complete
tags: [gsap, lenis, motion-tokens, next-font, bricolage, hero, reduced-motion, cwv]
requires:
  - "src/app/[locale]/layout.tsx (Geist next/font wiring, provider nesting)"
  - "src/components/theme-toggle.tsx (useSyncExternalStore pattern)"
  - "src/app/globals.css (:root token block)"
provides:
  - "MotionProvider — root Lenis + gsap.ticker sync, gated for reduced-motion + touch (lazy-loaded)"
  - "getMotionToken — client-only --motion-* reader (SSR-guarded)"
  - "Reveal / SplitHeading — reusable scroll-reveal + SplitText primitives for plans 02-04"
  - "HeroIntro — on-mount hero timeline orchestrator (D-12)"
  - "HeroSceneSlot — reserved Phase-4 3D layer seam (D-13)"
  - "--motion-* motion tokens (single source of truth) + --font-display token"
  - "restructured <main> width shell (per-section reading caps; hero + career break wide)"
affects:
  - "src/app/[locale]/page.tsx (hero + width shell)"
  - "src/app/[locale]/layout.tsx (Bricolage face + MotionProvider mount)"
  - "src/app/globals.css (motion tokens, html.lenis, @theme font-display)"
tech_stack:
  added: [gsap@3.15.0, "@gsap/react@2.1.2", lenis@1.3.25, "next/font Bricolage_Grotesque"]
  patterns:
    - "useSyncExternalStore motion gate (reduced-motion + pointer:fine) — no setState-in-effect"
    - "lazy dynamic import() of gsap/ScrollTrigger/SplitText/lenis to hold the LHCI script budget"
    - "gsap.matchMedia reduced-motion branch = MODE-02 for free (same DOM, motion stripped)"
    - "transform-only hero text reveal (opacity stays 1) = no post-hydration flash (WOW-04)"
key_files:
  created:
    - src/lib/motion-tokens.ts
    - src/components/motion/motion-provider.tsx
    - src/components/motion/hero-scene-slot.tsx
    - src/components/motion/reveal.tsx
    - src/components/motion/split-heading.tsx
    - src/components/motion/hero-intro.tsx
    - evals/immersive.spec.ts
  modified:
    - src/app/globals.css
    - src/app/[locale]/layout.tsx
    - src/app/[locale]/page.tsx
    - package.json
decisions:
  - "MotionProvider + HeroIntro lazy-load gsap/lenis via dynamic import() rather than static useGSAP, so the motion stack stays out of the eager home-route bundle (holds the 184,643-byte LHCI script gate); Reveal/SplitHeading keep static useGSAP and are tree-shaken from the home route until plans 02-04 import them"
  - "MotionProvider returns children at a stable tree position in every gate state (never re-parented), honoring finding #3's no-remount intent more strongly than an always-mounted <ReactLenis>; Lenis is genuinely not instantiated under reduced-motion/touch (satisfies MODE-02 D-18 literally)"
  - "Lenis wrapper scope = children-only (header/footer stay outside); Lenis root mode governs the whole window scroll regardless, and hash-anchor nav lands correctly under Lenis (verified by Playwright). LenisRef.lenis ref shape confirmed from node_modules/lenis/dist/lenis-react.d.ts"
  - "Hero text reveals via transform (y-rise) only, opacity kept at 1 on the H1/value-prop elements, so the SSR-visible hero never blanks after hydration (WOW-04/finding #6); only the decorative aria-hidden grid overlay animates opacity"
  - "HeroIntro owns the hero H1 SplitText directly (single split owner); the H1 is NOT wrapped in SplitHeading to avoid a double-split"
  - "Bricolage Grotesque shipped as static weight 700 (not variable/tri-axis) with display:swap + preload:false — the smallest CWV footprint that still renders the D-03 display H1"
metrics:
  duration: ~59min
  tasks: 3
  commits: 4
  files_created: 7
  files_modified: 4
  completed: 2026-07-05
---

# Phase 3 Plan 01: Motion Foundation & Engineered Hero Intro Summary

Introduced the site's entire motion layer (GSAP + Lenis, previously zero animation deps) as a reduced-motion/touch-gated, lazily-loaded enhancement, and landed the engineered "system booting" hero intro (D-12) with the Bricolage Grotesque display face (D-03) — while keeping name/role/value-prop as first-paint SSR HTML (WOW-04) and collapsing to the fully-designed static page under `prefers-reduced-motion` (MODE-02).

## What Was Built

- **Motion dependencies** (`00367a6`): `gsap@3.15.0`, `@gsap/react@2.1.2`, `lenis@1.3.25` (pinned; React unchanged at `~19.2.0` → 19.2.7). Human-approved package-legitimacy gate (lenis SUS flag confirmed a false positive; all three have empty `postinstall`).
- **Motion tokens** (`globals.css`): all 13 `--motion-*` custom properties (durations/easings/distances/staggers) as the single source of truth (D-08); `--font-display → --font-bricolage` `@theme` mapping (no circular self-binding); `html.lenis { scroll-behavior: auto }` collision fix (D-09).
- **`getMotionToken`** (`motion-tokens.ts`): client-only, SSR-guarded (`typeof window` first statement), memoized reader converting `--motion-*` to GSAP-friendly numbers.
- **`MotionProvider`**: reduced-motion + `pointer:fine` gate via `useSyncExternalStore` (no `useState`); Lenis + `gsap.ticker` sync **lazy-loaded** and gated off entirely under reduced-motion/touch.
- **`HeroSceneSlot`**: empty Server-Component background layer reserved for the Phase-4 3D canvas (D-13).
- **`Reveal` / `SplitHeading`**: reusable `useGSAP` + `gsap.matchMedia` scroll-reveal and SplitText primitives for plans 02-04.
- **`HeroIntro`** + **hero rebuild** (`page.tsx`): on-mount GSAP timeline (grid draw-in → H1 SplitText word rise → value-prop rise) over SSR markup; `<main>` width-shell restructured (D-04) — global 768px cap removed, per-section reading wrappers, hero + career break to `max-w-[1440px]`, career left-margin spine column reserved (D-07); H1 uses `font-display`, `font-semibold` retired.
- **`evals/immersive.spec.ts`**: 7 behaviors × 2 locales (Bricolage H1, first-paint content, no post-hydration flash, mount-timeline-not-scroll, reduced-motion static hero, nav clickable, hash-anchor under Lenis).

## Verification

- `pnpm lint`: 0 errors (only pre-existing warnings in gitignored/generated files).
- `pnpm build`: succeeds; all routes remain SSG.
- Playwright: **64/64 green** — `evals/immersive.spec.ts` (14) + `evals/home.spec.ts` (36) + `evals/a11y.spec.ts` (14).
- LHCI: `resource-summary:script:size` PASS (lazy motion stack), CLS 0 PASS, TBT 0 PASS.
- **LHCI `largest-contentful-paint`: NOT met locally (~2755ms vs ≤2500ms)** — see Deferred Issues.

## Deviations from Plan

### Auto-fixed / architectural (Rule 3 — resolving conflicting hard requirements)

**1. [Rule 3 — bundle gate] Motion stack lazy-loaded instead of eagerly bundled.**
The plan's finding #3 prescribed an always-mounted `<ReactLenis root autoRaf={false}>` and finding #1 a static `useGSAP` in HeroIntro. Both statically bundle gsap/lenis into the root/home route, which breached the BLOCKING 184,643-byte LHCI script gate (measured 224KB eager). Resolution: `MotionProvider` and `HeroIntro` dynamic-`import()` gsap/ScrollTrigger/SplitText/lenis only when the motion gate is open (desktop `pointer:fine`) — which is NOT Lighthouse's mobile-emulation path — so the eager bundle stays under budget. `MotionProvider` returns `{children}` at a stable tree position (never re-parented), which honors finding #3's no-remount intent more strongly than an always-mounted wrapper AND makes MODE-02's "Lenis never instantiated under reduced-motion" literally true. `HeroIntro` uses `useEffect` + `gsap.context` (same scoped-cleanup guarantee as `useGSAP`) because a static `useGSAP` import would defeat the lazy boundary. `Reveal`/`SplitHeading` keep the plan's `useGSAP` + static-import pattern and are tree-shaken from the home route (not imported by `page.tsx`).
- **Files:** motion-provider.tsx, hero-intro.tsx
- **Commits:** `1c80b83`, `ed616a9`

**2. [Rule 1 — CWV] Hero text reveals via transform only; value-prop "fade" dropped.**
D-12/UI-SPEC specify the value-prop "fades + rises". Finding #6 requires no post-hydration blank-text flash. To satisfy the stronger no-flash requirement deterministically, the hero H1 and value-prop *elements* keep opacity 1 at all times and reveal via `y`-transform (the decorative aria-hidden grid overlay carries the opacity flourish). This honors WOW-04/finding #6 and passes the "opacity ≥ 0.99 on first snapshot" contract.
- **Files:** hero-intro.tsx
- **Commit:** `ed616a9`

**3. [Rule 1 — CWV] Bricolage shipped as static weight 700, `display:swap`, `preload:false`.**
The plan suggested the variable font with opsz+wdth axes. That variable woff2 was ~131KB and, together with being on the render path, regressed LCP. Reduced to a static single weight (~22KB) for the smallest footprint that still renders the D-03 display H1.
- **Files:** layout.tsx
- **Commit:** `1c80b83` / `ed616a9`

## Deferred Issues

**BLOCKING LHCI LCP gate not met locally (~2755ms vs ≤2500ms) — accepted by human (Option A), production verification required.**

Controlled bisection on this machine:
- Task-2 baseline (no Bricolage on any element): **2454ms** (only 26ms headroom).
- With the D-03 Bricolage H1: **2755ms**; removing Bricolage from the H1 restores **2453ms**.

The ~300ms is intrinsic to adding a second render-path font under Lighthouse's simulated slow-4G + 4x-CPU profile — measured identical for variable vs static weight, `swap` vs `optional`, preloaded vs not, and with the Geist body font itself set to `optional`. It is not resolvable by font-level tuning without dropping the locked **D-03** display face or relaxing the **TECH-01** budget.

Per STATE.md the TECH-01 budget (LCP ≤ 2500ms) was **"verified passing on a production build"** (Vercel) — the gate's source of truth is production, not this local simulated run. **Human chose Option A: accept the local overage and verify LCP on the Vercel preview deploy.**

**→ Phase-level UAT / ship-gate item:** verify `largest-contentful-paint ≤ 2500ms` on the Vercel preview for `/de` and `/en` before promoting to production. If production also exceeds 2500ms, revisit (defer below-fold `GitHubHeatmap` hydration to reclaim critical-path budget, or narrow the hero H1 clamp).

## Known Stubs

None. `HeroSceneSlot` is an intentional empty seam for Phase 4 (D-13), documented in-code; it is not a data stub.

## Notes for Future Plans

- Plans 02-04 consume `Reveal` (scroll-on-enter) and `SplitHeading` (headline SplitText) — both already gated for reduced-motion via `gsap.matchMedia`.
- The career section already exposes an `lg:` left-margin column (reserved, empty) for the Plan-02 progress spine (D-07); the wide `max-w-[1440px]` career wrapper is in place.
- Any new client component added to the home route must respect the LHCI script budget (currently ~176KB of ~184KB used) — prefer lazy `import()` for animation-heavy code, following MotionProvider/HeroIntro.
- The Lenis↔ScrollTrigger ticker sync lives in MotionProvider; reveal components rely on it being wired and only call `useGSAP`/`gsap.matchMedia` locally.

## Self-Check: PASSED

All 7 created source files + SUMMARY.md exist on disk; all 4 plan commits (`00367a6`, `1c80b83`, `22f1dc9`, `ed616a9`) present in git history.
