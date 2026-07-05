---
phase: 3
reviewers: [gemini, cursor, antigravity]
failed_reviewers: [codex, coderabbit]
reviewed_at: 2026-07-05T17:40:29Z
plans_reviewed: [03-01-PLAN.md, 03-02-PLAN.md, 03-03-PLAN.md, 03-04-PLAN.md]
---

# Cross-AI Plan Review — Phase 3

> 3 of 5 reviewers completed. **codex** failed (litellm-proxy/Azure backend rejected the tool-call sequence mid-run — infra, not a plan defect). **coderabbit** skipped (diff-only reviewer; no plan/code content in the working-tree diff). Working tree verified UNCHANGED after the run — no reviewer edited files (AGENTS.md cross-harness guard satisfied).

---

## Gemini Review

# Phase 3 Plan Review: Design Direction & Immersive Experience

## Overall Assessment
The implementation strategy for Phase 3 is exceptionally robust, demonstrating a deep understanding of the intersection between Next.js 16 (App Router), React 19, and advanced animation orchestration (GSAP + Lenis). The architecture correctly prioritizes the "Content-First" core value by ensuring that all immersive effects are layered as enhancements over accessible, SSR-rendered HTML. The strict adherence to a single-animation-engine discipline (GSAP) and the use of centralized CSS motion tokens are key architectural wins that prevent the technical debt often associated with multi-library animation stacks.

**Overall Risk: LOW** (assuming the bundle size budget is monitored as planned).

---

## Plan 03-01: Motion Foundation + Hero Intro
### Summary
Establishes the technical foundation for the entire phase. It correctly identifies the `useSyncExternalStore` pattern for browser-state detection, avoiding common React 19 / hydration pitfalls associated with `matchMedia`.

### Strengths
- **Safe Integration:** Uses `useSyncExternalStore` for media queries (reduced-motion/pointer), matching the existing pattern in `src/components/theme-toggle.tsx:15-43`.
- **DSGVO Compliance:** Self-hosts Bricolage Grotesque via `next/font/google`, mirroring the Geist implementation in `layout.tsx`.
- **Accessibility:** Acknowledges the SplitText nested-link trap (RESEARCH Pitfall 4) and correctly restricts its usage to plain-text targets.
- **Performance:** Ensures Name/Role/Value-prop are static SSR HTML (WOW-04), visible before any JS runs.

### Concerns
- **Bundle Headroom (MEDIUM):** GSAP core + ScrollTrigger + SplitText + Lenis is a substantial addition. While the plan includes a measurement checkpoint, the 184KB LHCI script budget (enforced in `lighthouserc.json`) is extremely tight for these additions.
- **Lenis Ref Shape (LOW):** The research identifies a potential version-drift risk in the `lenis/react` ref shape. Task 2 correctly includes a step to inspect `.d.ts` before writing.

### Suggestions
- Ensure `getMotionToken` in `src/lib/motion-tokens.ts` handles the case where `document.documentElement` might not be available during a stray server-side import (the plan labels it client-only, but an export-type safety check is wise).

---

## Plan 03-02: Career Storytelling + Bento Projects
### Summary
Elevates the two most data-dense sections of the site. The ITSC multi-beat sub-sequence is a strong identity-driven narrative choice that leverages the existing content model.

### Strengths
- **Narrative Focus:** Focuses on the "emotional core" (ITSC growth arc) as requested in SPECIFICS.
- **Native Scroll Integrity:** Strict "no pinning, no scrolljacking" rule (D-05) ensures the site remains robust and predictable for users.
- **Mobile First:** Correctly hides the `CareerSpine` on mobile (D-19), relying on existing date labels for context to avoid redundancy.

### Concerns
- **Grid Complexity (LOW):** The asymmetric bento grid requires careful Tailwind class management for col-spans across breakpoints to match the 12-column spec (UI-SPEC §Bento project grid).

### Suggestions
- In `ProjectBento`, ensure the `2px var(--border)` featured signal (UI-SPEC) is visually distinct enough to represent "featured" status without relying on color (which is reserved for the accent signal).

---

## Plan 03-03: Craft + Transitions
### Summary
Adds the "felt craft" layer through micro-interactions and route transitions.

### Strengths
- **Single-Engine Discipline:** Orchestrates route transitions via GSAP exit tweens + `@/i18n/navigation` router, avoiding the experimental View Transitions API as per D-11.4.
- **Magnetic Physics:** Uses `contextSafe` for event-driven tweens, which is the correct pattern for React 19 / GSAP 3.15 integration to ensure proper cleanup.
- **Mobile Battery/Performance:** Correctly gates Magnetic effects to `pointer: fine`, preventing dead event listeners on touch devices.

### Concerns
- **Transition Continuity (LOW):** Since Next.js App Router unmounts instantly, the "crossfade" effect relies entirely on the exit tween completing before `router.push`. The plan correctly handles this in the `onComplete` callback.

---

## Plan 03-04: Signature Treatments + Verification
### Summary
Ensures cross-site consistency and performs the final "wow" walkthrough.

### Strengths
- **Clean Degradation:** The About photo treatment correctly degrades to text-only if no asset is provided (D-16), a pragmatic engineering choice that prevents blocking the phase.
- **Reading Integrity:** Maintains the `max-w-2xl` reading column for case studies (D-15), ensuring immersion doesn't sacrifice legibility for tech-leads and recruiters.
- **Comprehensive Walkthrough:** The human walkthrough dimension (WOW/Skippable/Quiet/Mobile) matches the phase success criteria perfectly.

---

## Risk Assessment & Final Verdict

### Risks
1. **Hydration Ceiling:** If `MotionProvider` or `Reveal` trigger layout reads too early, hydration mismatches could occur. The plan's reliance on `useGSAP` (which runs after commit) and `useSyncExternalStore` (with a stable `false` server snapshot) significantly mitigates this.
2. **Bundle Size:** The LHCI gate is the final arbiter. If exceeded, the team may need to import GSAP plugins from dedicated subpaths or consider lighter alternatives for non-critical reveals.

### Final Verdict: **PROCEED**
The plans are technically sound, structurally consistent with the existing codebase (specifically copying the `useSyncExternalStore` pattern from `ThemeToggle`), and perfectly aligned with the "Engineered/Systems" design direction. The separation of foundation (01), storytelling (02), micro-interactions (03), and consistency (04) is the correct execution order.

**Sign-off:** *Gemini CLI (Plan Reviewer)* 2026-07-05

---

## Cursor Review

# Phase 3 Plan Review — Design Direction & Immersive Experience

Reviewed against the live repo at `/Users/lasse/Development/Projects/portfolio` (Phase 2 shipped baseline: no motion deps, single-scroll overview page, LHCI gate at 184,643 bytes). Plans were cross-checked with `src/app/[locale]/page.tsx`, `layout.tsx`, `globals.css`, `package.json`, `lighthouserc.json`, `content/en/career.ts`, `content/en/projects.ts`, and existing Playwright evals.

---

## Overall Assessment

These four plans are unusually strong: they trace requirements to artifacts, reuse an established `useSyncExternalStore` pattern, forbid duplicate animation engines, gate Lenis/magnetic by reduced-motion and pointer type, and carry threat models plus eval contracts through all waves. Wave ordering (foundation → storytelling → craft → verification) is sound.

The main risks are not architectural direction but **execution gaps**: hero intro choreography is underspecified vs the UI contract, the **184,643-byte script budget** is assumed not measured, Lenis placement vs sticky header/hash anchors is left open, and layout widening is scoped to `page.tsx` without aligning header/footer chrome. Overall risk: **MEDIUM**.

---

## Plan 03-01 — Motion Foundation + Engineered Hero Intro

### Summary

Wave 1 correctly establishes the single-engine foundation (GSAP + Lenis, motion tokens, gated `MotionProvider`, reusable primitives) and anchors WOW-04/MODE-02/TECH-02 in structure rather than bolting them on later. The package-legitimacy human gate for `lenis` is appropriate. Hero work is the weakest task relative to the locked D-12 timing spec.

### Strengths

- **Accurate baseline claim**: `package.json` has zero animation deps today (`gsap`, `@gsap/react`, `lenis` absent) — the “greenfield motion layer” framing is correct.
- **`useSyncExternalStore` mandate matches repo convention**: `src/components/theme-toggle.tsx:15-43,90` is cited correctly; MotionProvider should mirror this, not `useState`+`useEffect`.
- **WOW-04 grounded in real markup**: Hero already exposes name, role, value-prop, and anchor nav as static SSR (`src/app/[locale]/page.tsx:84-127`); H1 has no nested link — safe SplitText target per Pattern 4.
- **Reduced-motion = same DOM**: Aligns with `03-RESEARCH.md` insight that the current page *is* the quiet variant; motion is layered on top.
- **Prerequisites well scoped**: `HeroSceneSlot` reserves Phase 4 WOW-01 seam without shipping WebGL.
- **Threat model + pinned versions**: Human gate before `pnpm add` is proportionate to supply-chain risk.

### Concerns

| Severity | Concern |
|----------|---------|
| **HIGH** | **Hero intro choreography does not match D-12/UI-SPEC.** UI contract specifies a **time-orchestrated** mount sequence (grid 0–400ms → H1 split 200–900ms → value-prop 500–1000ms). Task 3 wraps value-prop in `<Reveal>` with ScrollTrigger `start: "top 85%"` and adds a decorative overlay, but never defines a unified hero timeline. Reveal-on-enter ≠ intro-on-mount; even if the hero triggers immediately, timing will not match the spec beats. |
| **HIGH** | **184,643-byte LHCI budget treated as “CI will catch it” without a mandatory measure checkpoint.** Current scripts bundle is tiny (React + next-intl + header client islands only). GSAP core + ScrollTrigger + SplitText + Lenis + Bricolage font JS is a step change. Research flags this as MEDIUM confidence (`03-RESEARCH.md` Open Q2). Plan 01 mentions optional local LHCI only “if headroom is in doubt” — that should be **blocking after Task 2**, not optional. |
| **MEDIUM** | **Bricolage `@theme` binding may be circular.** Plan says `variable: "--font-display"` on `next/font` *and* `@theme inline --font-display: var(--font-display)`. Geist uses distinct names (`--font-geist-sans` → `--font-sans` in `globals.css:17-18`). Copy that pattern (`--font-bricolage` or similar). |
| **MEDIUM** | **Lenis mount scope vs sticky header unresolved.** Plan wraps only `{children}` (`layout.tsx:99`), leaving header/footer outside `MotionProvider`. `03-PATTERNS.md` explicitly flags verifying whether `<ReactLenis root>` must include the sticky header (`layout.tsx:71`) for correct Lenis/sticky/hash behavior. Deferred to d.ts inspection is fine, but no acceptance criterion forces resolution. |
| **MEDIUM** | **`scroll-behavior: smooth` may double-smooth with Lenis.** `globals.css:64-68` enables native smooth scroll under `prefers-reduced-motion: no-preference`. When Lenis is active on pointer:fine, both may apply — plan should gate or remove CSS smooth scroll for the Lenis path. |
| **LOW** | **Layout width change only on `page.tsx`.** Hero widens to `max-w-[1440px]` per D-04, but header/footer stay `max-w-3xl` (`layout.tsx:72,101`). Visual misalignment likely unless chrome widens too or hero breaks out via negative margin. |

### Suggestions

1. Add a **Task 2.5 or hard acceptance gate**: `pnpm build` + inspect route JS / run `pnpm exec lhci autorun` before Task 3 hero work. Fail fast if over budget.
2. Split hero work: **`HeroIntro` client component** with a single `useGSAP` timeline (grid → SplitHeading → value-prop), separate from scroll-triggered `Reveal`.
3. Fix font token naming: `--font-bricolage` (next/font) → `--font-display` (Tailwind `@theme`), mirroring Geist.
4. Add acceptance: **hash anchor nav** (`#career` from `page.tsx:101`) scrolls correctly with Lenis on desktop (manual or Playwright).
5. Document Lenis wrapper decision in `03-01-SUMMARY.md` with evidence from `lenis-react.d.ts`.

### Risk Assessment

**MEDIUM** — Foundation patterns are correct and repo-aligned, but hero timing gap and bundle-size assumption could fail late in Wave 1.

---

## Plan 03-02 — Career Scroll-Storytelling + Bento Projects

### Summary

Wave 2 delivers WOW-02 and deferred D-14 flagship treatment using plan 01 primitives. Career markup preservation, nested-link avoidance on org `<h3>`, and `evals/home.spec.ts` regression awareness (`#projects > ul > li`) are well handled. Content-model slugs align (`itsc`, `elia`, `vidama-mediathek` in `content/en/projects.ts`).

### Strengths

- **Correct ITSC target**: `slug: "itsc"` with three roles (`content/en/career.ts:20-50`) matches D-06 multi-beat intent.
- **No scrolljacking**: Explicit `pin:` grep = 0 and `once: true` reveals align with D-05 and UI mobile contract.
- **Spine discipline**: `aria-hidden` decorative ticks follow `github-heatmap.tsx:55-77` precedent; dates remain in visible DOM.
- **Bento accent budget**: Plan correctly uses `2px var(--border)` not accent for featured signal — matches corrected UI-SPEC text (`03-UI-SPEC.md:158-159`).
- **i18n routing**: Internal links must use `@/i18n/navigation` — matches existing case-study links (`page.tsx:206-211`).
- **Autonomous after Wave 1**: Appropriate dependency on 03-01 primitives only.

### Concerns

| Severity | Concern |
|----------|---------|
| **MEDIUM** | **ITSC multi-beat detection unspecified.** Task says “ITSC entry specifically” but doesn’t mandate `entry.slug === "itsc"` (or similar). Executor could mis-identify org. |
| **MEDIUM** | **CareerSpine hybrid Server/Client split is complex.** Static tick markup + client fill wrapper scoped to career section height needs clear `ScrollTrigger` trigger/end boundaries; underspecified how `entries={...}` syncs with wrapped `<li>` count. |
| **MEDIUM** | **ProjectBento Server vs Client ambiguity.** Task allows either; client-heavy bento with Reveal on every cell adds JS proportional to project count (5–7 items). Prefer server shell + minimal client wrappers per cell. |
| **LOW** | **Skills/activity sections untouched.** Acceptable for phase scope, but success criterion 2 (“nahtlose Sektions-Übergänge”) applies only partially until Wave 3. |
| **LOW** | **`home.spec.ts` fragility.** `#projects > ul > li` (`evals/home.spec.ts:29-34`) — plan mentions preserving `<ul>/<li>` but bento grid-on-`<ul>` needs explicit CSS grid classes; worth a note in acceptance. |

### Suggestions

1. Acceptance criterion: `grep 'slug === "itsc"'` or equivalent branch in `page.tsx` / `CareerSpine`.
2. Specify ScrollTrigger **start/end** for spine fill (career `#career` section bounds, not page-global).
3. Default ProjectBento to **Server Component** composing `<Reveal>` children; document client boundary count target.
4. Add Playwright: spine **not visible** below `lg` viewport (`TECH-02`).

### Risk Assessment

**MEDIUM** — Storytelling design is solid; spine scoping and bento client-weight need careful implementation.

---

## Plan 03-03 — Craft Micro-Interactions + Seamless Transitions

### Summary

Wave 3 completes WOW-03 micro-interactions and D-11.4 crossfade transitions on the single GSAP engine. Magnetic `contextSafe`, pointer-only gating, `:focus-visible` preservation (`globals.css:88-91`), and `@/i18n/navigation` for `TransitionLink` are all correct calls for this codebase.

### Strengths

- **Single-engine discipline**: Explicit package.json check excluding `framer-motion` / `motion`.
- **Locale-aware routing**: `src/i18n/navigation.ts:4-5` exports `Link`/`useRouter` — plan correctly forbids raw `next/navigation`.
- **A11y regression guard**: `evals/a11y.spec.ts` focus-ring tests must stay green — magnetic must not break `:focus-visible`.
- **Reduced-motion instant swap**: Matches UI reduced-motion contract for route transitions.
- **External links excluded**: Case-study external `visit` links (`page.tsx:214-221`) stay native `<a>` — correct scope.

### Concerns

| Severity | Concern |
|----------|---------|
| **MEDIUM** | **`TransitionLink` main fade scope.** Fading `document.querySelector("main")` fades header/footer too if main is only `{children}` — actually header is outside main (`layout.tsx:71-99`), so only page content fades — OK. But **footer links to `/about`** (`layout.tsx:106-111`) are not TransitionLink targets while homepage about link is — inconsistent transition UX. |
| **MEDIUM** | **Research Pattern 5 uses `<button className="contents">`; plan requires Link-equivalent.** Plan 03-03 corrects this, but implementation must preserve keyboard activation, `href` semantics, and middle-click/open-in-new-tab — easy to regress if implemented as click-only button. |
| **MEDIUM** | **Magnetic on “nav” is ambiguous.** UI-SPEC covers nav/footer links hover states; plan wraps CV + contact in Magnetic and mentions nav — hero hash anchors (`page.tsx:101-124`) are poor magnetic targets and may feel odd. Clarify: magnetic on CV/contact only, CSS hover on hash nav. |
| **LOW** | **Crossfade + client navigation timing.** New page mounts fresh `<main>` at opacity 1 (unmount clears inline styles) — acceptable. Incoming `Reveal` on case-study pages (plan 04) provides entrance — OK. |
| **LOW** | **Playwright “transform changes on mouse move”** may flake in headless if pointer events differ; consider `page.mouse.move` with explicit coordinates. |

### Suggestions

1. Mandate `TransitionLink` as **wrapper around `@/i18n/navigation` `Link`** with `preventDefault` + tween + `router.push`, not a button — preserve Cmd+click.
2. Scope magnetic explicitly to **CV button + contact block links**; hero/header nav get CSS-only D-11.3 states.
3. Optional: extend TransitionLink to footer `/about` for consistency (or document intentional omission).
4. Add eval: **middle-click** on case-study link still opens new tab without broken crossfade.

### Risk Assessment

**MEDIUM** — Patterns are right; TransitionLink a11y/semantics and magnetic scope need tight implementation.

---

## Plan 03-04 — Signature Treatments + Full Verification

### Summary

Wave 4 closes deferred D-16 photo treatment and D-15 reading-first elevation on case-study/prose routes, then runs the blocking human checkpoint against all five phase success criteria. Good phase capstone; verification checklist is thorough.

### Strengths

- **Photo degrades cleanly**: Matches existing text-only About (`page.tsx:259-267`) — no asset blocking.
- **SSG preservation**: Explicit `getCaseStudy` / `generateStaticParams` grep guards on case-study page (`case-studies/[slug]/page.tsx:11-17,40`).
- **Case-study H1 safe for SplitHeading**: Plain text title (`case-studies/[slug]/page.tsx:51-52`), no nested links.
- **Human checkpoint covers all five ROADMAP criteria**: wow / skippable / quiet / mobile + automated LHCI full suite.
- **Both locales**: `/de` and `/en` throughout — matches I18N-02 parity discipline.

### Concerns

| Severity | Concern |
|----------|---------|
| **MEDIUM** | **Prose `/about` page has no visible H1 in server component.** `[slug]/page.tsx:45-50` renders MDXContent only — plan says “if the page renders a title heading” — executor may skip SplitHeading on full about page while case-study gets display H1; inconsistent identity. |
| **MEDIUM** | **Client islands on SSG routes increase bundle per route.** `SplitHeading` + `Reveal` on case-study/about pages add client JS to routes that are 100% server today — cumulative with homepage motion; reinforces need for post-03-01 bundle measure. |
| **LOW** | **Photo optional asset path undefined.** “Known public/ path check or content-model field” — no field exists today; executor needs explicit placeholder strategy (env flag, constant, or content model extension) to avoid ad-hoc logic. |
| **LOW** | **Human checkpoint is subjective.** “Medium/expressive craft (D-10)” lacks measurable rubric beyond human judgment — acceptable for design phase but note for audit trail. |

### Suggestions

1. Add task clarity: extract about **MDX h1** via frontmatter or wrap MDX output — apply SplitHeading consistently with case-study pages.
2. Photo slot: reference a **single constant** (e.g. `public/images/lasse.jpg` optional) documented in SUMMARY when absent.
3. Checkpoint: require **screenshot or short screen recording** attachment in SUMMARY for human verify audit.
4. Run **`pnpm exec lhci autorun` on preview URL** if local differs from CI (Vercel edge caching).

### Risk Assessment

**LOW–MEDIUM** — Mostly polish and verification; prose-page display treatment gap is the main substantive hole.

---

## Cross-Cutting Analysis

### Phase Success Criteria Coverage

| # | Criterion | Plans | Gap |
|---|-----------|-------|-----|
| 1 | Career scroll-storytelling | 03-02 | Covered |
| 2 | Craft + one engine + motion tokens | 03-01, 03-03 | Hero timing vs tokens partially gap |
| 3 | Skippable / no preloader | 03-01 (WOW-04) | Covered structurally |
| 4 | Reduced-motion full quiet variant | 03-01 gates + all `matchMedia` branches | Covered if gates implemented once |
| 5 | Deliberate mobile, no scrolljacking | 03-01, 02, 03 | Covered; Lenis/hash behavior needs verify |

**WOW-01 (3D hero)** correctly deferred to Phase 4 with `HeroSceneSlot` — not a plan defect.

### GSAP + Lenis + Next 16 + React 19 Integration

| Topic | Verdict |
|-------|---------|
| `useSyncExternalStore` for motion gates | ✅ Required; matches `theme-toggle.tsx` |
| `gsap.matchMedia` not deprecated `ScrollTrigger.matchMedia` | ✅ Specified in plans + research |
| Lenis `autoRaf: false` + single `gsap.ticker` | ✅ Correct pattern; ref shape = verify at install |
| SplitText nested-link trap | ✅ Called out; org `<h3>` with `<a>` excluded (`page.tsx:139-141`) |
| Byte-identical career markup | ✅ “Wrap only” discipline |
| `@/i18n/navigation` | ✅ Required for TransitionLink / bento |
| Compositor-only (`transform`/`opacity`) | ✅ UI-SPEC + plan language align |

### Performance & DSGVO

- **LHCI gate is real**: `lighthouserc.json:10-14` enforces LCP ≤ 2500, TBT ≤ 200, CLS ≤ 0.1, script ≤ 184643, perf ≥ 0.9 on `/de` and `/en`.
- **DSGVO**: Self-hosted npm bundles + `next/font` — no runtime Google calls — consistent with `AGENTS.md`.
- **Fonts**: Third display face (Bricolage) adds download weight — monitor LCP after layout change.

### Dependency & Wave Ordering

```
03-01 (foundation) → 03-02 (storytelling) → 03-03 (craft) → 03-04 (polish + verify)
```

Ordering is correct. No circular deps. Plan 02’s `depends_on: ["03-01"]` is load-bearing — executing out of order would duplicate motion infrastructure or fail evals.

### Scope Creep / Over-Engineering

Plans generally **avoid** second component trees, View Transitions API, and framer-motion. Risk of over-engineering is low. The main creep vector is **client boundary proliferation** on an otherwise static homepage — acceptable if bundle stays within gate.

---

## Overall Risk Assessment

**MEDIUM**

**Justification:** Architectural decisions (single engine, same DOM for MODE-02, skippable SSR-first hero, pointer/reduced-motion gates, i18n-safe navigation) are well researched and aligned with the shipped Phase 2 codebase. The plans will likely succeed if execution closes four gaps: (1) **measure bundle after first motion commit**, (2) **implement D-12 as a hero timeline not scroll Reveal**, (3) **resolve Lenis wrapper + hash anchor + CSS smooth-scroll interaction**, (4) **align layout chrome width with D-04 grid**. Without those, CI budget failure or hero/transition polish gaps are plausible late in the phase.

---

## Recommended Pre-Execution Checklist

1. Approve lenis package-legitimacy gate (plan 03-01 Task 1).
2. After Task 2: **run LHCI**; do not proceed to hero choreography if script budget fails.
3. Implement hero as **`HeroIntro` timeline**, not Reveal-on-scroll for above-the-fold beats.
4. Fix Bricolage font variable naming before evals check `font-family` contains "Bricolage".
5. Decide Lenis wrap scope (children-only vs header+children) before ScrollTrigger refresh logic lands.
6. Specify ITSC branch by `slug === "itsc"` in plan 02 acceptance criteria.
7. Implement `TransitionLink` as enhanced `Link`, not button-with-contents.

---

## Antigravity Review

# Cross-AI Plan Review: Phase 3 — Design Direction & Immersive Experience

This is a read-only architectural and code-integration review of the implementation plans for **Phase 3: Design Direction & Immersive Experience** for `lsiem.de`. The review evaluates compatibility with the existing codebase, React 19 / Next.js 16 App Router constraints, performance budgets, accessibility, and smooth scroll mechanics.

---

## Overall Assessment & Integration Analysis

The four plans collectively define a cohesive vertical slice that elevates the portfolio from a static, text-first recruiter site into an immersive, identity-derived storytelling experience. The stack selection (**GSAP 3.15 + Lenis 1.3.x**) is standard and robust, avoiding the "two animation engines" anti-pattern. 

By utilizing client-side animation wrappers on top of server-rendered markup, the project preserves search engine indexing and performance baselines. Gating the scroll and magnetic layers with `useSyncExternalStore` matches the pre-existing patterns in [theme-toggle.tsx](file:///Users/lasse/Development/Projects/portfolio/src/components/theme-toggle.tsx) and adheres to the React Compiler's strict rendering requirements.

The overall risk profile is **LOW/MEDIUM**. The primary risks relate to **Server-Side Rendering (SSR) safety during static build compilation** and **minor usability edge cases** (e.g. browser navigation modifiers).

---

## Plan-by-Plan Detailed Review

### Plan 03-01: Motion Foundation + Engineered Hero Intro

*   **Summary:** Installs core motion dependencies (`gsap`, `@gsap/react`, `lenis`), registers CSS motion tokens in [globals.css](file:///Users/lasse/Development/Projects/portfolio/src/app/globals.css), adds the display typeface **Bricolage Grotesque** via `next/font`, and implements the core `MotionProvider`, `Reveal`, and `SplitHeading` client primitives to drive the hero section's intro sequence.
*   **Strengths:**
    *   Centralization of motion tokens in [globals.css](file:///Users/lasse/Development/Projects/portfolio/src/app/globals.css:3) as the single source of truth.
    *   Proper use of `useSyncExternalStore` for media queries and pointer status, matching the compiler-safe pattern in [theme-toggle.tsx](file:///Users/lasse/Development/Projects/portfolio/src/components/theme-toggle.tsx#L90) and avoiding hydration flashes.
    *   The reserved [hero-scene-slot.tsx](file:///Users/lasse/Development/Projects/portfolio/src/components/motion/hero-scene-slot.tsx) Server Component is a clean seam that prevents hero layout reflow in Phase 4.
    *   GSAP plugins are registered at the module scope of [motion-provider.tsx](file:///Users/lasse/Development/Projects/portfolio/src/components/motion/motion-provider.tsx), preventing duplicate registration errors under React 19's Strict Mode.
*   **Concerns:**
    *   > [!WARNING]
        > **HIGH SEVERITY: SSR/Static Build Crash in `getMotionToken`**
        > The plan states that `Reveal` should take optional distance/duration props that default to values from `getMotionToken` (which queries `getComputedStyle(document.documentElement)`). Because Next.js compiles `"use client"` components on the server during `pnpm build`, executing `getMotionToken` as a default parameter in the component function signature (e.g., `distance = getMotionToken(...)`) will execute on the server and throw `ReferenceError: document is not defined`, crashing the build.
    *   > [!IMPORTANT]
        > **MEDIUM SEVERITY: Hydration Mismatch in `MotionProvider` Wrapper**
        > The `MotionProvider` returns `<>{children}</>` when motion is disabled (SSR fallback & reduced-motion), but `<ReactLenis root>{children}</ReactLenis>` when enabled. By default, `ReactLenis` renders a wrapping `div` (with a default tag of `"div"`). Changing the DOM tree structure from a fragment on the server to a wrapping `div` on the client will trigger a React hydration mismatch error.
    *   > [!IMPORTANT]
        > **MEDIUM SEVERITY: Smooth Scroll Collision**
        > The native `scroll-behavior: smooth` is defined in [globals.css](file:///Users/lasse/Development/Projects/portfolio/src/app/globals.css#L66). When Lenis smooth scroll is active, it interpolates the scroll viewport position. Having both active causes browser jitter and input fight.
*   **Suggestions:**
    *   In [motion-tokens.ts](file:///Users/lasse/Development/Projects/portfolio/src/lib/motion-tokens.ts), ensure `getMotionToken` checks if `typeof window === 'undefined'` and returns safe fallback constants (e.g., `24` for distance, `0.4` for duration) when called on the server.
    *   To prevent hydration mismatch, configure `ReactLenis` to always render the same wrapping element or enforce a matching layout wrapper structure on both server and client.
    *   Add an override rule in [globals.css](file:///Users/lasse/Development/Projects/portfolio/src/app/globals.css) to disable native smooth scrolling when Lenis is active:
        ```css
        html.lenis {
          scroll-behavior: auto !important;
        }
        ```
    *   Register both `ScrollTrigger` and `SplitText` at the module scope of [split-heading.tsx](file:///Users/lasse/Development/Projects/portfolio/src/components/motion/split-heading.tsx) as well.

---

### Plan 03-02: Career Scroll-Storytelling + Bento Projects

*   **Summary:** Leverages foundation primitives to build out the career and projects sections. It introduces the `CareerSpine` progress rail, maps career roles to a timeline with a multi-beat reveal for the ITSC arc, and refactors the project list into an asymmetric bento grid highlights the ELIA and Vidama case studies.
*   **Strengths:**
    *   Strict adherence to `once: true` reveals on native scroll, avoiding intrusive scrolljacking or viewport pinning.
    *   Spine ticks are marked `aria-hidden="true"`, preventing screen-reader clutter since career dates are already present in the DOM.
    *   `CareerSpine` progress indicators modify compositor-only variables (`scaleY`/`translateY`), preventing layout thrashing.
*   **Concerns:**
    *   > [!NOTE]
        > **LOW/MEDIUM SEVERITY: Invalid HTML Semantics in Bento Grid**
        > If the bento grid is built by rendering the featured project cards and their supporting metric panels as direct sibling `<li>` items under a `<ul>` list container, the DOM hierarchy will represent them as independent list items. This will cause screen readers to announce more items than projects, degrading accessibility.
*   **Suggestions:**
    *   In [project-bento.tsx](file:///Users/lasse/Development/Projects/portfolio/src/components/motion/project-bento.tsx), make each project entry a single outer `<li>` that acts as a 12-column grid container (e.g. `col-span-12 grid grid-cols-12 gap-6`). Place the project card (`col-span-8`) and supporting panel (`col-span-4`) inside it. This maintains semantically valid HTML and maps list items 1:1 to actual projects.

---

### Plan 03-03: Craft Micro-interactions + Seamless Transitions

*   **Summary:** Implements the micro-interaction layers. It wraps focusable actions in a pointer-only `Magnetic` component, registers CSS-driven hover/active transitions for tech chips and links, and introduces `TransitionLink` to orchestrate a GSAP-driven exit animation when routing to case studies or `/about`.
*   **Strengths:**
    *   The `Magnetic` component isolates event listeners to pointer inputs, maintaining standard `:focus-visible` rings on keyboard focus.
    *   Single-engine discipline is maintained by utilizing GSAP timelines for routing animations rather than introducing experimental View Transitions.
*   **Concerns:**
    *   > [!IMPORTANT]
        > **MEDIUM SEVERITY: Broken Link Modifiers in Custom Navigation**
        > The proposed `TransitionLink` click handler calls `e.preventDefault()` and triggers `router.push(href)` upon exit tween completion. This blocks native browser behaviors like `Cmd+Click`, `Ctrl+Click`, and middle-click to open case studies in new tabs, which will frustrate recruiters attempting to multi-task.
*   **Suggestions:**
    *   Update the click interceptor in [transition-link.tsx](file:///Users/lasse/Development/Projects/portfolio/src/components/motion/transition-link.tsx) to pass through standard clicks when modifiers are held:
        ```typescript
        const isModified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
        const isRightClick = e.button === 2;
        if (isModified || isRightClick) return; // Let browser open in new tab
        e.preventDefault();
        ```
    *   Avoid wrapping elements in `<Magnetic>` dynamically on React state changes. Instead, render a static wrapper container and conditionally bind the event handlers only if pointer fine-gating is satisfied, avoiding DOM layout differences.

---

### Plan 03-04: Signature Treatments + Full Immersive Verification

*   **Summary:** Extends visual treatments to case-study sub-pages and prose pages, implements the visual photo crop frame for the About section (designed to fall back to text-only if the photo asset is unsupplied), and runs Playwright/LHCI test verification blocks.
*   **Strengths:**
    *   Maintains consistent art direction across case studies, prose routes, and main content.
    *   Fallback logic ensures that the About section degrades gracefully if the profile picture is absent at build time.
    *   Automated LHCI gate ensures the performance baseline does not fall below the budget limit.
*   **Concerns:**
    *   > [!NOTE]
        > **LOW SEVERITY: Cumulative Layout Shift (CLS) on Photo Load**
        > Applying grayscale/contrast filters to the About photo is visual-only, but if the photo lacks a reserved bounding box, its late loading can trigger Cumulative Layout Shift, violating the `0.1` CLS threshold in [lighthouserc.json](file:///Users/lasse/Development/Projects/portfolio/lighthouserc.json#L12).
*   **Suggestions:**
    *   Ensure the photo container has explicit layout dimensions (e.g. `aspect-square w-[160px] md:w-[200px]`) and a background placeholder colour matching `var(--border)` to keep layout space pre-allocated.
    *   In the Server Component [page.tsx](file:///Users/lasse/Development/Projects/portfolio/src/app/[locale]/page.tsx), use Node's `fs.existsSync` to detect the presence of the profile photo at build time before rendering the container shell to keep page structures clean.

---

## Risk Assessment

*   **Overall Phase Risk:** **LOW/MEDIUM**
*   **Justification:** The implementation steps are clean, logical, and rely on standard integration paths. The risks are standard Next.js compilation issues (SSR safety, hydration mismatches) and UX overrides (new-tab modifiers), all of which are easily mitigated by styling hooks, safety checks, and standard click filtering.

---

## Summary of Recommendations

1.  **SSR Safety in [motion-tokens.ts](file:///Users/lasse/Development/Projects/portfolio/src/lib/motion-tokens.ts):** Add a `typeof window === 'undefined'` guard to `getMotionToken` to avoid build crashes during static generation.
2.  **Smooth Scroll Fix in [globals.css](file:///Users/lasse/Development/Projects/portfolio/src/app/globals.css):** Set `scroll-behavior: auto !important` on `html.lenis` to prevent browser jitter.
3.  **Hydration Mismatch Mitigation:** Render a matching container tag in `MotionProvider` or always keep the wrapper present to avoid server/client DOM mismatch during hydration.
4.  **Bento Grid Semantics:** Wrap each featured project card and panel in a single outer `<li>` in [project-bento.tsx](file:///Users/lasse/Development/Projects/portfolio/src/components/motion/project-bento.tsx) to maintain clean accessibility trees.
5.  **Modifier Keys in [transition-link.tsx](file:///Users/lasse/Development/Projects/portfolio/src/components/motion/transition-link.tsx):** Bypass custom animations and routing if `Ctrl`, `Cmd`, `Shift`, or middle-click is pressed to preserve native new-tab features.
6.  **Tree-Shaking and Script Size:** GSAP + Lenis + Next base is very close to the `184,643` byte script transfer limit in [lighthouserc.json](file:///Users/lasse/Development/Projects/portfolio/lighthouserc.json#L13). Ensure all GSAP plugins are imported directly from subpaths (e.g. `gsap/ScrollTrigger`) rather than core shortcuts, and run `pnpm build` immediately after Task 1 to measure the exact script payload size.

---

## Codex Review

_Failed — codex `litellm-proxy` (model-router/Azure) returned: "An assistant message with 'tool_calls' must be followed by tool messages responding to each 'tool_call_id'". This is a backend proxy/threading error in the local codex setup, not a plan issue. codex read files and spent ~62K tokens before the backend rejected the sequence._

---

## CodeRabbit Review

_Skipped — CodeRabbit reviews the git working-tree diff, which currently contains only unrelated changes (`config.json`, `SKILL.md`, untracked tooling dirs); the Phase 3 plans are committed markdown, so a diff review would add no plan-level signal. (`--prompt-only` is also deprecated in the installed CodeRabbit; `--plain`/`--agent` are the current flags.)_

---

## Consensus Summary

Three independent models — **Gemini CLI**, **Cursor agent**, and **Antigravity CLI** — reviewed all four plans against the live repo (each cited real `file:line` evidence). **Codex failed** (its `litellm-proxy`/Azure backend rejected the tool-call message sequence mid-run — infra, not a plan defect) and **CodeRabbit was skipped** (diff-only reviewer; the current working-tree diff has no plan/code content, so it would review unrelated config noise). All three completed reviewers reached the same verdict: **architecturally sound — PROCEED — with a small set of execution gaps to close during Waves 1–3.** Per-reviewer risk: Gemini **LOW**, Antigravity **LOW/MEDIUM**, Cursor **MEDIUM**.

### Agreed Strengths (2+ reviewers)

- **`useSyncExternalStore` mandate** for reduced-motion/pointer detection correctly mirrors `src/components/theme-toggle.tsx:15-43,90` — React-Compiler-safe, no hydration flash. *(all 3)*
- **Single-engine GSAP discipline** — `framer-motion`/`motion` excluded via an explicit `package.json` check. *(all 3)*
- **MODE-02 = same DOM** — reduced-motion renders the identical markup with motion layered on top; no duplicate quiet variant. *(all 3)*
- **SSR-first, skippable hero** — name/role/value-prop/anchor-nav are static HTML before any JS (WOW-04), grounded in real `page.tsx:84-127` markup. *(Gemini, Cursor)*
- **Pointer + reduced-motion gating** on Lenis and magnetic effects. *(all 3)*
- **Internal nav via `@/i18n/navigation`** (never raw `next/link`). *(Gemini, Cursor)*
- **Correct wave ordering** (foundation → storytelling → craft → verify), no circular deps. *(all 3)*
- **`lenis` package-legitimacy human checkpoint** is proportionate supply-chain hygiene. *(Gemini, Cursor)*

### Agreed Concerns (2+ reviewers — highest priority)

1. **[HIGH consensus] Measure the bundle early — don't assume it.** All three flag the **184,643-byte LHCI script gate** (`lighthouserc.json:13`) as tight for GSAP + ScrollTrigger + SplitText + Lenis + Bricolage; Cursor rates it HIGH. Make the `pnpm build` / `pnpm exec lhci autorun` measurement a **blocking gate right after the dependency install (03-01 Task 2)**, not "if headroom is in doubt", and import GSAP plugins from subpaths (`gsap/ScrollTrigger`). *(Gemini, Cursor, Antigravity — also matches the plan-checker's own warning.)*
2. **[MEDIUM] Native `scroll-behavior: smooth` collides with Lenis.** `globals.css:64-68` enables native smooth scroll; with Lenis active this double-smooths / input-fights. Add `html.lenis { scroll-behavior: auto }` (or gate the CSS rule on the non-Lenis path). *(Cursor, Antigravity)*
3. **[MEDIUM] `TransitionLink` breaks Cmd/Ctrl/Shift/middle-click "open in new tab".** The `preventDefault()` + `router.push()` handler must pass modified/middle clicks through to native behavior — recruiters multi-tab. Implement as an enhanced `@/i18n/navigation` `Link`, not a click-only button. *(Cursor, Antigravity)*
4. **[HIGH/MEDIUM] MotionProvider / `getMotionToken` SSR + hydration safety.** `getMotionToken` reads `getComputedStyle(document.documentElement)`; used as a default parameter it executes during `pnpm build` → `ReferenceError: document is not defined` (Antigravity **HIGH**). Guard with `typeof window === 'undefined'` → constant fallback. Separately, `<>{children}</>` (SSR/reduced-motion) vs `<ReactLenis root>` wrapping-`div` (client) changes the DOM tree → hydration mismatch risk; keep a stable wrapper tag. *(Antigravity; Gemini notes the hydration ceiling + `getMotionToken` server-safety.)*
5. **[MEDIUM/LOW] Bento grid `<li>` semantics.** Each project must be **one outer `<li>`** acting as a 12-col grid container (card `col-span-8` + panel `col-span-4` inside), so screen readers announce N projects (not N×panels) and `evals/home.spec.ts` (`#projects > ul > li`) stays green. *(Cursor, Antigravity)*

### Single-reviewer findings worth investigating

- **[HIGH — Cursor only] Hero intro choreography (D-12) is underspecified.** UI-SPEC specifies a **time-orchestrated mount** (grid 0–400ms → H1 split 200–900ms → value-prop 500–1000ms); 03-01 Task 3 wraps the value-prop in a scroll-triggered `<Reveal start:"top 85%">` — that's reveal-on-enter, not intro-on-mount, so the timing won't match the spec. Recommend a dedicated `HeroIntro` `useGSAP` timeline separate from scroll `Reveal`. Gemini/Antigravity did not raise this — **verify against UI-SPEC §hero before executing Wave 1.**
- **[MEDIUM — Cursor only] Bricolage font token naming may be circular** — `--font-display` used for both the `next/font` variable and the Tailwind `@theme` binding. Mirror Geist's `--font-geist-sans → --font-sans` (`globals.css:17-18`): e.g. `--font-bricolage` → `--font-display`.
- **[MEDIUM — Cursor only] Lenis wrapper scope vs sticky header + hash anchors** unresolved (wraps only `{children}`, header at `layout.tsx:71` is outside); no acceptance criterion forces the decision. **[LOW]** layout width mismatch (D-04): hero widens to `max-w-[1440px]` but header/footer stay `max-w-3xl`.
- **[LOW — Antigravity only] CLS on the About photo** — reserve an explicit aspect-ratio box + placeholder so late image load can't breach the `0.1` CLS gate.

### Divergent Views

- **Overall risk:** Gemini **LOW** ("PROCEED") vs Cursor **MEDIUM** (driven by the hero-timing gap + the bundle assumption) vs Antigravity **LOW/MEDIUM**.
- **Hero intro timing:** Cursor rates it **HIGH**; Gemini and Antigravity didn't flag it at all — the clearest disagreement, so it's the first thing to reconcile against the UI-SPEC.

### Recommended next step

Most findings are execution-time refinements, but five are cheap to fold into the plans now (bundle-measure-early, smooth-scroll collision, modifier-click passthrough, `getMotionToken` SSR guard + stable MotionProvider wrapper, bento `<li>` structure) plus the hero-timeline check:

```
/gsd-plan-phase 3 --reviews
```

This replans incorporating this REVIEWS.md — each actionable finding must become a plan task / `<acceptance_criteria>` / `<action>` or an explicit deferral rationale before `/gsd-execute-phase 3`.
