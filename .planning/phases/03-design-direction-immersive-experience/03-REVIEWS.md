---
phase: 3
review_round: 2
reviewers: [gemini, cursor, antigravity]
failed_reviewers: [codex, coderabbit]
reviewed_at: 2026-07-05T18:13:56Z
reviewed_commit: 6b2f2c4
plans_reviewed: [03-01-PLAN.md, 03-02-PLAN.md, 03-03-PLAN.md, 03-04-PLAN.md]
---

# Cross-AI Plan Review — Phase 3 (Round 2)

> Round 2 re-reviews the plans **after** round-1 feedback was incorporated (commit `6b2f2c4`). All three reviewers confirm the 10 round-1 fixes are correctly embedded. This file now carries the **round-2** findings (a consensus HIGH + a structural HIGH + several MEDIUMs) — feed them back with `/gsd-plan-phase 3 --reviews`. codex failed (litellm/Azure backend); coderabbit skipped (diff-only). Working tree verified UNCHANGED.

---

## Gemini Review (Round 2)

# Cross-AI Plan Review (Round 2) — Phase 3: Design Direction & Immersive Experience

This review verifies the hardened implementation plans (03-01..03-04) against the Round 1 findings and the project's engineering standards.

## Round-1 Verification Summary

| Finding | Fix Correct & Complete? | Evidence / Location |
|:---|:---:|:---|
| 1. Bundle gate BLOCKING + Subpaths | **YES** | 03-01 Task 2: "confirm resource-summary:script:size ≤ 184,643 bytes"; subpath imports (gsap/ScrollTrigger) mandated. |
| 2. `html.lenis { scroll-behavior: auto }` | **YES** | 03-01 Task 2: Explicitly added to `globals.css` with rationale. |
| 3. `TransitionLink` as Enhanced `Link` | **YES** | 03-03 Task 2: Implemented as "enhanced `@/i18n/navigation` Link" with modifier/middle-click passthrough. |
| 4. `getMotionToken` SSR + Stable Wrapper | **YES** | 03-01 Task 2: Mandates `typeof window` guard and stable wrapper element for `MotionProvider`. |
| 5. Bento `<li>` semantics | **YES** | 03-02 Task 2: "each project MUST be exactly ONE outer `<li>` that itself acts as the grid container". |
| 6. Hero intro = mount timeline | **YES** | 03-01 Task 3: "HeroIntro is an on-mount timeline, NOT a scroll-triggered reveal". |
| 7. Non-circular Font Token | **YES** | 03-01 Task 2: Naming convention `--font-bricolage` (next/font) → `--font-display` (Tailwind) followed. |
| 8. Lenis scope + Hash-anchors | **YES** | 03-01 Task 2: Inspection of `lenis-react.d.ts` + 03-01 Task 3: Playwright hash-anchor assertion. |
| 9. Layout width D-04 reconciliation | **YES** | 03-01 Task 3: Deliberate editorial break-out recorded in Summary. |
| 10. About photo CLS reservation | **YES** | 03-04 Task 1: Frame reserves box via `aspect-ratio` and placeholder background. |

---

## Detailed Plan Analysis

### Plan 03-01: Motion Foundation & Hero Intro
**Summary:** Establishes the GSAP+Lenis infra, tokens, and the "system booting" hero sequence.
*   **Strengths:** Exceptional defensive engineering on the `MotionProvider` and `getMotionToken` utility. The `useSyncExternalStore` pattern prevents hydration mismatches and lint errors seen in previous phases.
*   **Concerns (LOW):** The 184,643-byte script budget is extremely tight for Next.js + GSAP + Lenis.
*   **Suggestions:** None — the plan already correctly treats the budget as a BLOCKING gate.
*   **Risk:** LOW (High confidence in integration patterns).

### Plan 03-02: Career Storytelling & Bento Projects
**Summary:** Implements the scroll-linked career scenes and featured project bento.
*   **Strengths:** The ITSC multi-beat pattern correctly identifies the "emotional core" of the content. A11y discipline on the Bento `<li>` structure prevents screen-reader over-announcement.
*   **Concerns (LOW):** `CareerSpine` vertical alignment.
*   **Suggestions:** Ensure `CareerSpine` use of `ScrollTrigger` uses `refresh()` after the bento grid above it renders, as bento layout can shift career start positions. (Task 1 `ScrollTrigger.refresh()` mentions font load, which usually covers this).
*   **Risk:** LOW.

### Plan 03-03: Craft Micro-interactions & Transitions
**Summary:** Adds magnetic buttons and the GSAP-orchestrated sub-route crossfade.
*   **Strengths:** `TransitionLink` implementation is robust, specifically the mandatory early-return for modified clicks which preserves power-user behavior (Cmd+Click).
*   **Concerns (LOW):** Native "Back" button navigation won't trigger the GSAP exit transition.
*   **Suggestions:** This is a known limitation of manual `router.push` transitions and is acceptable for this MVP scope.
*   **Risk:** LOW.

### Plan 03-04: Signature Treatments & Full Verification
**Summary:** Completes the About photo treatment and ensures cross-site consistency.
*   **Strengths:** CLS reservation for the About photo is well-planned. The inclusion of a full human-verified walkthrough against the Success Criteria ensures the "Wow" is qualitative, not just green tests.
*   **Concerns (NONE).**
*   **Suggestions:** None.
*   **Risk:** LOW.

---

## New Findings & Observations

### 1. `SplitText` Accuracy vs. Font Loading
**Status:** Observation (LOW)
While 03-01 Task 2 includes `ScrollTrigger.refresh()` on `fonts.ready`, `SplitText` itself is sensitive to font metrics. If `SplitText` executes before `Bricolage Grotesque` has fully swapped/loaded, character/word boundaries may be slightly off.
*   **Recommendation:** If visual glitches appear in the SplitText stagger, consider wrapping the SplitText initialization in `document.fonts.ready.then(...)`.

### 2. Single Animation Engine Enforcement
**Status:** Verified (OK)
The plan correctly checks `package.json` in 03-03 Task 2 to ensure no second animation runtime (Framer Motion, etc.) has leaked into the repo, fulfilling the D-08 success criterion.

### 3. DSGVO & Self-Hosting
**Status:** Verified (OK)
The `next/font` configuration for Bricolage Grotesque and the local bundling of GSAP/Lenis preserve the project's strict no-runtime-third-party calls requirement.

## Final Verdict

**VERDICT: APPROVED FOR EXECUTION**

The plans are technically superior, faithfully incorporate all feedback, and maintain the project's high standards for performance and accessibility. The 10 Round-1 findings are completely addressed. No high-risk gaps were identified.

---

## Cursor Review (Round 2)

# Cross-AI Plan Review — Round 2 (Phase 3: Design Direction & Immersive Experience)

## Round-1 Fix Verification

| # | Finding | Verdict | Notes |
|---|---------|---------|-------|
| 1 | Blocking bundle gate + GSAP subpath imports | **Correct & complete** | 03-01 Task 2 AC hard-stops on `lhci autorun` ≤ 184,643 bytes; Task 3 re-runs; subpath imports specified (`gsap/ScrollTrigger`, `gsap/SplitText`). |
| 2 | `html.lenis { scroll-behavior: auto }` | **Correct & complete** | Explicit rule + rationale tied to existing `globals.css:64-68` native smooth scroll. |
| 3 | TransitionLink as enhanced `@/i18n/navigation` Link | **Correct in spec, incomplete in file scope** | 03-03 spec is strong (real anchor, modifier passthrough). **But** `files_modified` omits `project-bento.tsx` where case-study links land after 03-02 — see 03-03. |
| 4 | `getMotionToken` SSR guard + stable MotionProvider wrapper | **Correct & complete** | Explicit `typeof window` guard, no default-param token reads, bans fragment↔wrapper swap; overrides stale RESEARCH Pattern 1 snippet that still uses `<>`. |
| 5 | Bento = one `<li>` per project | **Correct & complete** | 03-02 action + AC with Playwright count vs project list. |
| 6 | Hero intro = on-mount `HeroIntro`, not scroll `Reveal` | **Correct & complete** | Dedicated component, D-12 beats, Playwright no-scroll opacity test. |
| 7 | Bricolage `--font-bricolage` → `@theme --font-display` | **Correct & complete** | Mirrors Geist pattern in `globals.css:17-18`; anti-circular binding called out. |
| 8 | Lenis wrapper scope + hash anchors | **Partially complete** | Forces a decision + SUMMARY evidence + Playwright `#career` test. Does not pre-resolve scope; research already recommends `ReactLenis root` wrapping `{children}` in layout — acceptable if executor follows that. |
| 9 | Hero `max-w-[1440px]` vs chrome `max-w-3xl` | **Incomplete fix** | Documented as “record intent in SUMMARY,” but **does not change the structural blocker**: `page.tsx:79` wraps all sections in `max-w-3xl`, so a nested `max-w-[1440px]` hero cannot actually break wide; career spine left margin (D-07) has the same constraint. |
| 10 | About photo CLS reservation | **Correct & complete** | 03-04: aspect-ratio box, placeholder, explicit img dimensions, grep ACs. |

---

## Plan 03-01 — Motion Foundation + Hero Intro

### Summary
Installs GSAP/Lenis/Bricolage, motion tokens, gated `MotionProvider`, reusable `Reveal`/`SplitHeading`, and a mount-timeline `HeroIntro` on the existing SSR hero. Strong Wave-1 foundation with blocking human package gate and blocking LHCI after deps land.

### Strengths
- **Evidence-backed line refs** into `theme-toggle.tsx`, `globals.css`, `layout.tsx`, `page.tsx`, `lighthouserc.json` — verified accurate (e.g. `useSyncExternalStore` at `theme-toggle.tsx:15-43`, script budget at `lighthouserc.json:13`, no motion deps in `package.json` today).
- **MODE-02 / D-18 alignment**: single DOM, motion gated off server-side (`getServerSnapshot → false`), matches “page already is the quiet variant.”
- **Threat model + package-legitimacy gate** for Lenis SUS flag is appropriate.
- **Round-1 hardening** is woven into acceptance criteria, not just prose.

### Concerns
- **HIGH — D-04 layout cannot execute as written.** Hero “break wide to `max-w-[1440px]`” inside `<main className="… max-w-3xl …">` (`page.tsx:79`) is capped at ~768px. Career spine “left margin column” (D-07) needs the same page-level width change. Finding #9 is documented, not structurally solved.
- **MEDIUM — WOW-04 vs post-hydration opacity.** Must-haves require static SSR before JS; `HeroIntro` mount timeline likely animates from `opacity: 0`. Plan should require first client frame = SSR final state, then animate (or CSS `@starting-style`), so recruiters never see blank hero text after hydration.
- **MEDIUM — `HeroIntro` + `SplitHeading` coordination.** Plan warns against double animation but doesn’t specify ownership (timeline-only vs primitive-only). Risk of split-then-re-animate or SplitText running twice.
- **LOW — RESEARCH Pattern 1 still shows fragment swap**; plan correctly overrides it — executor must follow plan, not research snippet.

### Suggestions
1. Add an explicit 03-01 Task 3 sub-step: **restructure `<main>`** — e.g. remove global `max-w-3xl`, apply reading width per section, full-bleed wrapper for hero/career grid; or document a viewport breakout pattern with concrete classes.
2. Specify: **`SplitHeading` on hero H1 is passive under `HeroIntro`** (split once, timeline drives words) OR hero skips `SplitHeading` and `HeroIntro` owns SplitText directly.
3. Add AC: hero text **computed opacity ≥ 1** (or visibility) on first Playwright snapshot before any `waitForTimeout`.

### Risk: **MEDIUM** (HIGH if layout restructure is skipped)

---

## Plan 03-02 — Career Storytelling + Bento Projects

### Summary
Adds `CareerSpine` (lg+ progress rail), progressive `Reveal` on career chapters with ITSC multi-beat, and `ProjectBento` for ELIA/Vidama featured hierarchy. Reuses Wave-1 primitives; no new deps.

### Strengths
- **Career markup preservation** matches actual structure (`page.tsx:129-177`): nested role lists, conditional org links (nested-link trap noted), `formatMonth` untouched.
- **Bento semantics fix (finding #5)** is explicit with Playwright `#projects > ul > li` count AC — aligns with `evals/home.spec.ts:28-38`.
- **No pinning / scrolljacking** enforced via grep AC — consistent with D-05 and TECH-02.
- **Content model verified**: 6 projects, ELIA `flagship` + Vidama `deep` in `content/en/projects.ts`.

### Concerns
- **HIGH — Depends on 03-01 layout fix.** Spine in “reserved left margin column” is impossible inside current `max-w-3xl` main without page shell changes.
- **MEDIUM — No blocking bundle re-check.** After spine + bento client JS, plan only says “CI LHCI authoritative.” Budget could breach in Wave 2 and surface late at 03-04 checkpoint.
- **MEDIUM — `ProjectBento` server/client split ambiguous.** “Prefer Server Component composing `<Reveal>`” — `Reveal` is `"use client"`; needs a clear pattern (server shell + client cell wrappers) to avoid marking the whole bento client unnecessarily.
- **LOW — Li-count test** needs project count source in spec (hardcode 6 vs fetch from API/fixture) to avoid drift.

### Suggestions
1. Add Task 2 verify step: **`pnpm exec lhci autorun`** after bento lands (soft stop minimum; hard stop if over budget).
2. Split `career-spine.tsx` into server tick markup + client fill wrapper (as plan implies) with explicit file note.
3. Pre-wire 03-03: **`ProjectBento` accepts `LinkComponent` prop** defaulting to `@/i18n/navigation` `Link`, swappable to `TransitionLink` in Wave 3.

### Risk: **MEDIUM**

---

## Plan 03-03 — Craft Micro-interactions + Transitions

### Summary
Adds `Magnetic` (pointer-only), designed CSS interaction states, and `TransitionLink` GSAP crossfade for case studies and `/about`. Single-engine discipline enforced.

### Strengths
- **TransitionLink (finding #3)** is well specified: real `Link`, modifier/middle-click passthrough, reduced-motion instant `router.push`, `@/i18n/navigation` only (`navigation.ts:4-5`).
- **Magnetic** follows RESEARCH Pattern 3 (`contextSafe`, absent-not-degraded on touch).
- **`:focus-visible` preservation** references actual rule at `globals.css:88-91` and ties to `evals/a11y.spec.ts`.
- **Package.json single-engine check** in AC is practical.

### Concerns
- **HIGH — Case-study `TransitionLink` wiring gap.** 03-02 moves case-study links into `ProjectBento`; 03-03 `files_modified` lists only `page.tsx`, not `project-bento.tsx`. Action says “In page.tsx: render case-study links via TransitionLink” — **stale after Wave 2.** About read-more at `page.tsx:268-273` is covered; bento links are not.
- **MEDIUM — `<main>` crossfade scope.** Overview `main` at `page.tsx:79`; case-study pages have their own `main` (`case-studies/[slug]/page.tsx:48`). Exit fade on overview works; incoming case-study mount `Reveal` is separate — acceptable, but header/footer won’t crossfade (probably fine). Plan should note no shared-element morphing expectation.
- **MEDIUM — Header/footer `/about` links** (`layout.tsx:106-111`) stay plain `Link` — inconsistent transition UX vs overview read-more.
- **LOW — Duplicate motion-gate logic** (`MotionProvider` vs `Magnetic` mount gate) — extract shared `useMotionGates()` to avoid drift.

### Suggestions
1. Add `src/components/motion/project-bento.tsx` to `files_modified`; use `TransitionLink` inside bento for internal case-study routes.
2. Optionally extend `TransitionLink` to footer `/about` for consistency (LOW priority).
3. Document crossfade target: **`document.querySelector('main')`** on current page only.

### Risk: **MEDIUM-HIGH** (HIGH if bento links ship without TransitionLink)

---

## Plan 03-04 — Signature Treatments + Verification

### Summary
Photo treatment (D-16, degrades to text-only), reading-first case-study/about elevation via `SplitHeading`/`Reveal`, and blocking human checkpoint for wow / skippable / quiet / mobile + full LHCI.

### Strengths
- **Photo CLS (finding #10)** is concrete: aspect-ratio, placeholder, explicit dimensions — matches current text-only About (`page.tsx:255-274`, no `<img>` today).
- **Case-study page refs verified**: plain H1 at `case-studies/[slug]/page.tsx:51-52` — safe SplitText target; SSG paths preserved.
- **Checkpoint Task 3** runs full Playwright + LHCI before human sign-off — appropriate phase closer.
- **Reading-first D-15** constraints (gentle reveals, keep `max-w-2xl`) are clear.

### Concerns
- **MEDIUM — Photo asset detection vague.** “Known `public/` path check or content-model field” — no field exists today; fine for degrade-to-text-only, but executor may invent ad-hoc logic. Prefer explicit “no image until content model extended” to match current behavior.
- **MEDIUM — Client boundaries on SSG routes.** Wrapping case-study H1 + body in client primitives increases JS on detail routes; no incremental bundle gate until final checkpoint.
- **LOW — `grep -c 'dark:' src/app/globals.css` is 0** — trivially true today (`globals.css` uses `data-theme`, not `dark:` utilities); low signal as AC.

### Suggestions
1. Keep About image slot **CSS-only + conditional render false** until a content-model field lands — avoids fake path checks.
2. Add case-study route **script-size spot-check** in Task 2 verify (even one slug on `/de` + `/en`).
3. Human checkpoint: add explicit **hash-nav from header `#contact`** (`layout.tsx:88-93`) under Lenis, not only hero `#career`.

### Risk: **LOW-MEDIUM**

---

## Overall Assessment

### Summary
Round-2 plans are materially stronger: round-1 findings are mostly embedded in acceptance criteria with grep/Playwright/LHCI enforcement. Wave ordering, single-engine discipline, MODE-02 “same DOM” model, and recruiter skippability are well aligned with Phase 2 reality (zero motion deps, SSR overview at `page.tsx`). Two integration gaps remain that can fail success criteria without plan edits: **(1) page shell width blocks D-04/D-07**, **(2) TransitionLink scope misses post-bento case-study links**.

### Strengths
- Comprehensive traceability to locked decisions (D-08–D-19), UI spec, and live code line refs.
- Blocking gates at the right choke points: package legitimacy (03-01 Task 1), bundle (03-01 Task 2–3), human wow/quiet/mobile (03-04 Task 3).
- Eval strategy builds incrementally (`evals/immersive.spec.ts`) without breaking existing `home`/`a11y`/`case-studies` contracts.
- DSGVO/runtime constraints respected: self-hosted fonts (`next/font`), no CDN GSAP, no runtime third-party motion calls.

### Concerns (cross-cutting)
| Tag | Issue |
|-----|-------|
| **HIGH** | **`max-w-3xl` on `<main>` (`page.tsx:79`) prevents hero 1440px breakout and career spine margin layout** — finding #9 fix is documentation-only. |
| **HIGH** | **03-03 TransitionLink does not modify `project-bento.tsx`** after 03-02 moves case-study links there — WOW-03/D-11.4 partially undelivered. |
| **MEDIUM** | **Bundle budget enforced only in 03-01**; Waves 2–4 add ScrollTrigger instances, Magnetic, TransitionLink, case-study client JS without mandatory local LHCI stops. |
| **MEDIUM** | **Hash-anchor nav** uses native `<a href="#…">` (`page.tsx:101-124`); Lenis `root` should handle these, but plan relies on manual + one Playwright test — no `scrollTo` fallback specified if native hash breaks under Lenis. |
| **MEDIUM** | **Post-hydration hero opacity** may briefly violate WOW-04 “facts visible” spirit if mount timeline starts from hidden state. |
| **LOW** | Motion-gate logic duplicated across components; footer/header transition inconsistency. |

### Suggestions (priority order)
1. **Amend 03-01 Task 3**: restructure page width shell before hero grid (required for D-04 + D-07, not optional SUMMARY note).
2. **Amend 03-03**: add `project-bento.tsx` to scope; wire `TransitionLink` for all internal case-study anchors.
3. **Add soft LHCI checkpoints** to 03-02 Task 2 and 03-03 Task 2 verify blocks.
4. **Clarify hero animation initial state** preserves SSR-visible text until first intentional frame.
5. **Pre-wire bento `LinkComponent` prop** in 03-02 to ease 03-03 transition wiring.

### Phase Success Criteria Achievability

| Criterion | Achievable? | Blocker |
|-----------|-------------|---------|
| 1. Career scroll-storytelling | **Yes, if layout fixed** | Spine + grid need wider shell |
| 2. Craft + one engine + tokens | **Yes** | TransitionLink bento gap |
| 3. Skippable / no preloader | **Yes** | Hero opacity flash risk (minor) |
| 4. Reduced-motion full quiet variant | **Yes** | Architecture is sound |
| 5. Deliberate mobile, no scrolljacking | **Yes** | pointer:fine + coarse gates consistent |

### Overall Risk: **MEDIUM-HIGH**
Plans are execution-ready after **two targeted amendments** (page layout shell + TransitionLink/bento wiring). Without those, expect visual D-04 failure and incomplete route transitions despite otherwise excellent motion architecture.

---

## Antigravity Review (Round 2)

# Cross-AI Plan Review (ROUND 2 — verifying hardened plans)

This is a read-only architectural and code-integration review of the updated implementation plans for **Phase 3: Design Direction & Immersive Experience** for `lsiem.de`. The review evaluates the plans' correctness, completeness, and alignment with Next.js 16 App Router, React 19, performance budgets, accessibility, and smooth-scroll mechanics.

---

## 1. Executive Summary & Verdict

The revised plans successfully integrate the feedback from the Round-1 review. By layering the GSAP/Lenis animation wrappers on top of server-rendered markup, the project preserves search engine indexing and performance baselines. Gating the scroll and magnetic layers with `useSyncExternalStore` matches the pre-existing patterns in [theme-toggle.tsx](file:///Users/lasse/Development/Projects/portfolio/src/components/theme-toggle.tsx) and adheres to the React Compiler's strict rendering requirements.

**Verdict: PROCEED**
The plans are technically sound, structurally consistent, and ready for execution. The few remaining edge cases (subtree remounting and prose H1 consistency) can be resolved inline during implementation.

---

## 2. Verification of Round-1 Findings

Each of the 10 findings from Round 1 has been verified against the updated plans:

1. **Bundle measurement made BLOCKING right after GSAP+Lenis install:** Verified. In [03-01-PLAN.md:187](file:///Users/lasse/Development/Projects/portfolio/.planning/phases/03-design-direction-immersive-experience/03-01-PLAN.md#L187), the `resource-summary:script:size` audit (gated at 184,643 bytes) is marked as a **HARD STOP** blocking gate in Task 2. Furthermore, GSAP plugins are imported directly from subpaths (e.g. `gsap/ScrollTrigger`, `gsap/SplitText`) to ensure clean tree-shaking.
2. **html.lenis { scroll-behavior: auto } added:** Verified. Task 2 in [03-01-PLAN.md:157](file:///Users/lasse/Development/Projects/portfolio/.planning/phases/03-design-direction-immersive-experience/03-01-PLAN.md#L157) adds the override rule to [globals.css](file:///Users/lasse/Development/Projects/portfolio/src/app/globals.css) to stop collision with native smooth-scrolling.
3. **TransitionLink modified-click passthrough:** Verified. Task 2 in [03-03-PLAN.md:131](file:///Users/lasse/Development/Projects/portfolio/.planning/phases/03-design-direction-immersive-experience/03-03-PLAN.md#L131) checks for modifiers (`metaKey`, `ctrlKey`, `shiftKey`, `altKey`) and non-primary clicks, bypassing custom animations to let the browser handle new-tab requests natively. It is also correctly implemented as an enhanced `@/i18n/navigation` `Link` instead of a button.
4. **getMotionToken SSR safety + stable MotionProvider wrapper:** Verified. Task 2 in [03-01-PLAN.md:159](file:///Users/lasse/Development/Projects/portfolio/.planning/phases/03-design-direction-immersive-experience/03-01-PLAN.md#L159) adds a `typeof window === "undefined"` guard to prevent static compilation crashes. It also includes instructions to avoid changing DOM tags in `MotionProvider` to avoid hydration mismatches (but see recommendation below).
5. **Bento grid semantics (one `<li>` per project):** Verified. Task 2 in [03-02-PLAN.md:126](file:///Users/lasse/Development/Projects/portfolio/.planning/phases/03-design-direction-immersive-experience/03-02-PLAN.md#L126) forces each project to render as a single outer `<li>` acting as the grid container, maintaining valid HTML semantics and a 1:1 list-item mapping.
6. **Hero intro mount timeline vs scroll reveal:** Verified. Task 3 in [03-01-PLAN.md:217](file:///Users/lasse/Development/Projects/portfolio/.planning/phases/03-design-direction-immersive-experience/03-01-PLAN.md#L217) introduces a dedicated, time-orchestrated `useGSAP` timeline inside a `HeroIntro` wrapper that triggers on-mount rather than on native scroll.
7. **Bricolage font token non-circular binding:** Verified. Task 2 in [03-01-PLAN.md:161](file:///Users/lasse/Development/Projects/portfolio/.planning/phases/03-design-direction-immersive-experience/03-01-PLAN.md#L161) maps next/font's `--font-bricolage` variable to Tailwind's `--font-display` via `@theme`, mirroring the Geist configuration and avoiding self-binding.
8. **Lenis wrapper-scope decision:** Verified. Task 2 in [03-01-PLAN.md:163](file:///Users/lasse/Development/Projects/portfolio/.planning/phases/03-design-direction-immersive-experience/03-01-PLAN.md#L163) forces an explicit decision on whether to wrap the layout's header/footer and defines a Playwright check to ensure hash-anchors work under Lenis.
9. **Layout width breakout:** Verified. Task 3 in [03-01-PLAN.md:219](file:///Users/lasse/Development/Projects/portfolio/.planning/phases/03-design-direction-immersive-experience/03-01-PLAN.md#L219) reconciles and documents the width discrepancy between the widened hero grid (`max-w-[1440px]`) and the `max-w-3xl` header/footer chrome.
10. **About photo CLS reservation:** Verified. Task 1 in [03-04-PLAN.md:98](file:///Users/lasse/Development/Projects/portfolio/.planning/phases/03-design-direction-immersive-experience/03-04-PLAN.md#L98) sets an explicit aspect ratio, fixed width, and placeholder background to allocate space before the photo load completes.

---

## 3. New Findings & Still-Wrong Items

During Wave reviews, a few minor architectural and visual gaps were identified. These should be addressed during implementation:

### 3.1. Subtree Remounting in `MotionProvider` & `Magnetic` Wrappers
*   **The Issue:** Swapping element types dynamically on the client based on feature gates (e.g., rendering `<ReactLenis root>{children}</ReactLenis>` when motion is enabled, and `<div>{children}</div>` when disabled; or `<Magnetic>{children}</Magnetic>` vs `{children}`) changes the React node hierarchy. Even if the underlying DOM element remains a `div`, React sees a component type change (e.g., `ReactLenis` vs `div`, or `Magnetic` vs `ReactFragment`) and **unmounts the entire children subtree and remounts it**. This resets state, drops DOM focus, and triggers flashes.
*   **Mitigation:** 
    *   **For `MotionProvider`:** Enforce a stable container type. Always render `<ReactLenis root autoRaf={false}>` but only conditionally register the `gsap.ticker` sync and scroll listeners inside a sub-hook or component when gates are satisfied. When the gates are false, leaving the RAF loop unticked makes Lenis completely inert and fallback to native scroll.
    *   **For `Magnetic`:** Always wrap the children in the `<Magnetic>` element, but conditionally bind mouse event listeners (or execute them as no-ops) depending on the `pointer: fine` query.

### 3.2. Missing H1 and Display Identity on Prose Pages
*   **The Issue:** The about/prose template [[slug]/page.tsx](file:///Users/lasse/Development/Projects/portfolio/src/app/[locale]/[slug]/page.tsx) currently lacks an `<h1>` element. It renders raw markdown MDX where the highest heading is `## Über mich` (which is compiled to an `<h2>`). This violates heading hierarchy guidelines and SEO best practices (WCAG: single `<h1>` per page). Additionally, it prevents these pages from displaying the Bricolage Grotesque Display font used elsewhere, resulting in visual inconsistency.
*   **Mitigation:** In [03-04-PLAN.md](file:///Users/lasse/Development/Projects/portfolio/.planning/phases/03-design-direction-immersive-experience/03-04-PLAN.md), modify Task 2 to explicitly extract and render `page.title` as an H1 using `SplitHeading` at the top of [[slug]/page.tsx](file:///Users/lasse/Development/Projects/portfolio/src/app/[locale]/[slug]/page.tsx), matching the layout pattern of the case study page.

### 3.3. Career Spine Tick Alignment
*   **The Issue:** The career timeline list items in [page.tsx](file:///Users/lasse/Development/Projects/portfolio/src/app/[locale]/page.tsx#L129) are dynamically sized because description and stack lengths vary per organization. Rendering `CareerSpine` ticks inside a separate, fixed-height vertical container will cause markers to drift and misalign with the corresponding list items.
*   **Mitigation:** To ensure perfect alignment without fragile JS layout measuring, render the ticks as absolute-positioned decorators directly *inside* each `<li>` in the career list (protruding out into the left margin column), rather than inside a separate sidebar.

### 3.4. TransitionLink Integration Scope
*   **The Issue:** Task 2 in [03-03-PLAN.md](file:///Users/lasse/Development/Projects/portfolio/.planning/phases/03-design-direction-immersive-experience/03-03-PLAN.md) modifies page-level case-study links to use `TransitionLink`. However, Wave 2 ([03-02-PLAN.md](file:///Users/lasse/Development/Projects/portfolio/.planning/phases/03-design-direction-immersive-experience/03-02-PLAN.md)) refactors the project list into `<ProjectBento>`.
*   **Mitigation:** Clarify that `TransitionLink` must be integrated directly inside the new [project-bento.tsx](file:///Users/lasse/Development/Projects/portfolio/src/components/motion/project-bento.tsx) component for the flagship/deep case-study links, rather than on the page-level mapping.

### 3.5. SVG Overlay for Photo Crop corner-ticks
*   **The Issue:** Designing the `.photo-frame` crop corners using only `::before` and `::after` pseudo-elements is limited because there are only two pseudo-elements, making it difficult to draw four distinct L-shaped corner ticks without complex CSS hackery (like double border patterns).
*   **Mitigation:** Use an absolute-positioned, decorative SVG overlay (`aria-hidden="true"`, `pointer-events-none`) inside the photo frame to draw the corner ticks. This is cleaner, accurate, and easier to style.

---

## Codex Review (Round 2)

_Failed again — same deterministic `litellm-proxy`/Azure error: "An assistant message with 'tool_calls' must be followed by tool messages…". Backend/proxy config issue in the local codex setup, not a plan defect._

---

## CodeRabbit Review (Round 2)

_Skipped — diff-only reviewer; the working-tree diff has no plan/code content (plans are committed markdown)._

---

## Consensus Summary — Round 2 (verifying hardened plans, commit 6b2f2c4)

Three independent models — **Gemini**, **Cursor**, **Antigravity** — re-reviewed the plans after round-1 feedback was incorporated. **Codex failed again** (identical deterministic `litellm-proxy`/Azure tool-call backend error). **CodeRabbit skipped** (diff-only). Working tree verified **UNCHANGED** — no reviewer edited files.

**All three confirm the 10 round-1 findings are correctly embedded** in acceptance criteria / actions / artifact lists — nobody asked for any of it to be reworked. Verdicts: Gemini **APPROVED FOR EXECUTION** (LOW) · Antigravity **PROCEED** (LOW/MEDIUM) · Cursor **MEDIUM-HIGH** ("execution-ready after two targeted amendments"). Two caveats on the round-1 fixes: finding #3 (TransitionLink) is correct in spec but **incomplete in file scope**, and finding #9 (layout width) was resolved **documentation-only, not structurally** — both feed the new findings below.

### New findings this round

**Consensus (2+ reviewers) — worth folding in before execution:**

1. **[HIGH — Cursor + Antigravity] `TransitionLink` misses `project-bento.tsx`.** 03-02 (Wave 2) moves the case-study links into the new `ProjectBento`; 03-03 (Wave 3) wires `TransitionLink` only on `page.tsx` (`files_modified` omits `project-bento.tsx`). Net: bento case-study links never get the crossfade → **WOW-03 / D-11.4 partially undelivered.** Fix: add `src/components/motion/project-bento.tsx` to 03-03 `files_modified` and wire `TransitionLink` inside the bento; ideally pre-wire a `LinkComponent` prop in 03-02 (defaulting to i18n `Link`, swapped to `TransitionLink` in Wave 3).

**Strong single-reviewer (Gemini explicitly disagrees) — worth fixing:**

2. **[HIGH — Cursor; adjacent Antigravity] Layout-width fix is documentation-only, not structural.** `<main className="… max-w-3xl …">` (`page.tsx:79`) caps content at ~768px, so round-1 finding-#9's "record intent in SUMMARY" does **not** actually let the hero break to `max-w-[1440px]` (D-04) or give the career spine its left-margin column (D-07). Antigravity's "career-spine tick alignment" (3.3) is the same constraint from another angle. Fix: 03-01 must **restructure the `<main>` width shell** (remove/relocate the global `max-w-3xl`, apply per-section reading widths, add a full-bleed wrapper for hero + career grid) — a real structural change, not a SUMMARY note. *Divergence:* Gemini rated #9 "YES — deliberate editorial break-out recorded in Summary"; the disagreement is whether documentation suffices — it does not, because the CSS cap is real and would visually fail D-04.

3. **[MEDIUM — Antigravity + Cursor] MotionProvider / Magnetic subtree remount on element-type swap.** Round-1 #4 mandated a "stable wrapper," but conditionally rendering `<ReactLenis>` vs `<div>` (or `<Magnetic>` vs fragment) still changes the React node *type* → React unmounts/remounts the whole subtree (resets state, drops focus, flash). Fix: **always render `<ReactLenis root autoRaf={false}>`** and conditionally tick the `gsap.ticker` sync; **always render `<Magnetic>`** and conditionally bind the pointer listeners.

4. **[MEDIUM — Antigravity; Cursor round-1] Prose `/about` page has no `<h1>`.** `src/app/[locale]/[slug]/page.tsx` renders MDX whose top heading is `##` → `<h2>`; SplitHeading/display font can't apply, and it breaks WCAG single-`<h1>`. Fix: 03-04 Task 2 should extract `page.title` as an H1 with `SplitHeading` (mirror the case-study page).

5. **[MEDIUM — Cursor] Bundle budget enforced only in 03-01.** Waves 2–4 add ScrollTrigger instances, `Magnetic`, `TransitionLink`, and case-study client JS with no mandatory local LHCI stop until the final 03-04 checkpoint → a breach surfaces late. Fix: add a soft `lhci` check to 03-02 and 03-03 verify blocks.

6. **[MEDIUM — Cursor] Hero opacity flash vs WOW-04.** The `HeroIntro` mount timeline likely animates from `opacity: 0`; ensure the first client frame equals the SSR final state (or use CSS `@starting-style`) so recruiters never see blank hero text after hydration.

**LOW:** wrap SplitText init in `document.fonts.ready` (Bricolage metrics) — Gemini; native Back button won't trigger the exit transition, acceptable for MVP — Gemini; photo corner-ticks cleaner as an `aria-hidden` SVG overlay than two pseudo-elements — Antigravity; specify `HeroIntro`↔`SplitHeading` SplitText ownership to avoid double-split — Antigravity/Cursor; extract shared `useMotionGates()` to avoid gate-logic drift, and pin the `<li>`-count test to a fixed project-count source — Cursor.

### Divergent views

- **Overall risk:** Gemini **LOW / APPROVED** vs Antigravity **LOW/MEDIUM / PROCEED** vs Cursor **MEDIUM-HIGH**. The entire gap is the two Cursor-HIGH items. Antigravity independently found #1 (bento transition), so that one is real consensus; #2 (layout shell) is Cursor's strongest solo call and Gemini explicitly accepted the documentation-only resolution — so it's a judgment call, but the CSS cap is objectively present in `page.tsx:79`.

### Recommendation

The round-1 hardening held — no rework requested. Round 2 found **one consensus HIGH (TransitionLink/bento wiring)** and **one strong structural gap (layout width shell)**, both genuine and cheap. Recommend one more targeted pass:

```
/gsd-plan-phase 3 --reviews
```

…folding in findings 1–6 (especially **1** and **2**). After that the panel should be unanimous PROCEED. Alternatively, both are well-scoped enough to fix inline during execution — but wiring them into the plans now stops the executor from re-deriving them mid-build.
