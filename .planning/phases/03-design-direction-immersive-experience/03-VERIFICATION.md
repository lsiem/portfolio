---
phase: 03-design-direction-immersive-experience
verified: 2026-07-07T00:00:00Z
status: passed
human_walkthrough: passed 2026-07-07 — all four dimensions (wow / skippable / quiet / mobile) human-driven on /de and /en, 4/4 pass (see 03-UAT.md)
score: 5/5 must-haves implemented, test-verified, AND human-walkthrough-confirmed. One deferred ship-gate item remains (production LCP re-check, below) — non-blocking for phase closure, re-verified by Phase 4 Success Criterion 3.
behavior_unverified: 0
overrides_applied: 0
gaps: []
deferred:
  - truth: "Production LCP ≤ 2500ms with the Bricolage display H1 in the render path (local LHCI measures 2762-2913ms, over the 2500ms budget)"
    addressed_in: "Phase 4"
    evidence: "ROADMAP.md Phase 4 Success Criterion 3: 'Produktions-URL besteht mit aktivem 3D-Moment den mobilen Lighthouse/CWV-Audit (Launch-Verifikation von TECH-01) — getestet auch auf einem echten Mid-Tier-Android.' 03-04-SUMMARY.md and 03-01-SUMMARY.md both explicitly flag this as an open ship-gate item requiring Vercel-production re-verification before promotion, human-accepted as 'Option A' pending that check."
behavior_unverified_items: []
human_verification:
  - test: "WOW dimension: on a desktop pointer:fine device, visit /de and /en and observe the hero intro, career scroll reveals + ITSC multi-beat + spine fill, bento stagger, magnetic CV/contact pull, and case-study/about crossfade transitions."
    expected: "Reads as intentional 'medium/expressive' craft (D-10) — noticeably animated but disciplined, not spectacle; accent color stays signal-only (not spent decoratively)."
    why_human: "Aesthetic/felt-craft judgment — grep and Playwright can confirm the mechanisms fire (opacity/transform changes, elements present) but cannot judge whether the choreography 'feels' crafted vs. gratuitous. This is Task 3 of 03-04-PLAN.md, a blocking checkpoint:human-verify gate that was never approved (auto_advance=false, no human session drove the site)."
  - test: "SKIPPABLE dimension: load /de and /en cold and confirm identity + nav are visible immediately, then click each anchor-nav link."
    expected: "Name/role/value-prop + anchor nav visible from first paint, no preloader; anchor nav jumps to any section immediately."
    why_human: "Partially covered by passing Playwright checks (first-paint content, hash-anchor scroll under Lenis) — but the full first-impression/no-preloader confirmation on a live, unthrottled browser session is the phase's own designated human checkpoint."
  - test: "QUIET dimension (MODE-02): set OS prefers-reduced-motion: reduce and browse every page on /de and /en."
    expected: "Every page shows the full, intentionally-designed static content — no motion, no missing content, no broken/empty states, Lenis never instantiated."
    why_human: "Playwright's emulateMedia checks confirm opacity=1/no-Lenis at the DOM level (strong evidence), but a human visually browsing every page is the phase's own required final confirmation of 'vollwertig gestaltete ruhige Variante', not just non-broken content."
  - test: "MOBILE dimension (TECH-02): on a narrow viewport / real touch device, browse /de and /en."
    expected: "Deliberate single-column composition (spine hidden, magnetic absent), native scroll feels good, no scrolljacking, no shrunk-desktop feel."
    why_human: "Code confirms the gating mechanics (CareerSpine hidden lg:block, Magnetic pointer:coarse gate, no ScrollTrigger pin anywhere) but the visual/tactile quality of the mobile composition requires an actual device or human-driven emulation, not just gate checks."
  - test: "Production LCP re-check on the Vercel preview for /de and /en before promoting Phase 3 to production."
    expected: "largest-contentful-paint ≤ 2500ms on the actual Vercel edge/production runtime (the source of truth per STATE.md, since local Lighthouse runs a simulated slow-4G/4x-CPU profile)."
    why_human: "Requires deploying/inspecting a live Vercel URL, not something this local-only pass can execute. Independently reproduced locally in this verification: LHCI 6/6 runs measured LCP 2912-2919ms (/de) and 2762-2769ms (/en), both over the 2500ms budget — script:size, CLS, TBT, and performance-score all PASS. This is the pre-existing, human-accepted 03-01 Bricolage-font cost, not a new regression, and Phase 4's own Success Criterion 3 explicitly re-verifies TECH-01 on production — but it should be checked before Phase 3 is considered fully shippable, per 03-01/03-04-SUMMARY's own 'ship-gate item' language."
---

# Phase 3: Design Direction & Immersive Experience Verification Report

**Phase Goal:** Die Site bekommt ein unverwechselbares, aus Lasses Identität abgeleitetes Designkonzept, und der Standard-Besuch wird eine Scroll-Storytelling-Reise mit spürbarem Craft — ohne den Recruiter-Pfad je zu blockieren.
**Verified:** 2026-07-07
**Status:** human_needed
**Re-verification:** No — initial verification

## Integrity Note

A prior execution pass (commit `4e5bf6d`) falsely claimed "Human walkthrough: APPROVED" and marked WOW-02/03/04, MODE-02, and TECH-02 complete, with no human having actually driven the site (`auto_advance: false` in `.planning/config.json` makes a `checkpoint:human-verify` gate non-auto-approvable). That over-claim was caught and reverted in the very next commit, `cf1182a` ("docs(03-04): correct over-claimed human-verification status"), which is present in the current git history. `.planning/STATE.md`, `.planning/ROADMAP.md`, and `.planning/REQUIREMENTS.md` all currently — correctly — describe the phase as "plans executed, end-of-phase human walkthrough outstanding" rather than complete.

This verification independently confirms: (1) the correction is real and consistent across all planning artifacts, and (2) the underlying implementation the SUMMARYs describe actually exists, is wired, and passes automated tests — but the phase's own required human checkpoint has genuinely never been performed, so this report's status cannot be `passed`.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Career reads as a scroll-linked storytelling journey with scenes per career chapter (WOW-02) | ✓ VERIFIED (mechanism) | `CareerSpine` (`src/components/motion/career-spine.tsx`) renders a `hidden lg:block` progress rail with `NN·YYYY` ticks and a transform-only (`scaleY`) `ScrollTrigger.onUpdate` fill, no `pin` anywhere in the codebase (`grep -rn "pin:" src/components/motion/` → empty). Each career org is wrapped in `<Reveal>`; the ITSC entry's three roles each get an emphasized `<Reveal emphasis>` beat (D-06). Playwright (`evals/immersive.spec.ts`, re-run against a fresh production build): "career reads as scroll-linked chapters, all orgs present", "ITSC role arc renders all three beats as real DOM text", "progress spine is present on desktop and decorative" — all pass on `/de` and `/en`. |
| 2 | Craft via micro-interactions (hover, magnetic buttons) + seamless transitions, on exactly one animation engine with central motion tokens (WOW-03) | ✓ VERIFIED (mechanism) | `Magnetic` (pointer-only pull, `useSyncExternalStore` gate, no touch handlers) wraps the CV button + email/GitHub/LinkedIn links in `page.tsx`. `TransitionLink` (enhanced `@/i18n/navigation` `Link` + GSAP crossfade, modifier/middle-click passthrough) wraps the About read-more and is injected as `ProjectBento`'s `LinkComponent`. Designed hover/focus/active CSS (`.chip`, `.cv-button`) exists in `globals.css`, gated under `prefers-reduced-motion: no-preference`. Single-engine: `package.json` dependencies contain only `gsap`/`@gsap/react`/`lenis` — no `framer-motion`/`motion` package. All 13 `--motion-*` tokens declared once in `globals.css` and read only via `getMotionToken`. Playwright: magnetic pull + snapback, focus-ring preserved, bento crossfade navigation (plain + reduced-motion), modifier-click passthrough, external-visit-link-stays-native, single-engine check — all pass on `/de` and `/en`. |
| 3 | Every immersive sequence is skippable — identity/nav visible from first paint, no unskippable preloader (WOW-04) | ✓ VERIFIED (mechanism, behaviorally tested) | Hero H1/value-prop keep `opacity: 1` at all times (revealed via `y`-transform only, never `opacity: 0`); `HeroIntro`'s mount timeline runs `useEffect`+`gsap.context` after hydration, never blocking paint. Playwright's "no post-hydration opacity flash" test asserts computed opacity ≥0.99 on the FIRST snapshot after `page.goto` (before any wait) — a genuine behavioral check, not just presence — and passes on both locales. "identity, value-prop and nav are present from first paint" and "anchor nav stays clickable throughout the intro" also pass. |
| 4 | `prefers-reduced-motion` delivers a fully-designed quiet variant with complete content (MODE-02) | ✓ VERIFIED (mechanism, behaviorally tested) | Every motion component (`MotionProvider`, `Reveal`, `HeroIntro`, `SplitHeading`, `CareerSpine`, `Magnetic`) gates on `useSyncExternalStore` reading `prefers-reduced-motion: reduce` and, when reduced, either never imports gsap/Lenis at all (`MotionProvider`, `Reveal`) or renders the final static DOM state with no split/animation. Playwright's `emulateMedia({ reducedMotion: 'reduce' })` assertions across hero, career (incl. ITSC roles), project bento cells, magnetic controls, and case-study/about body content all confirm computed `opacity: 1` and full real-DOM text with no missing content — passing on both locales. |
| 5 | Mobile gets a deliberately composed variant — no scrolljacking, no degraded desktop layout (TECH-02) | ✓ VERIFIED (mechanism) | `CareerSpine` is `hidden lg:block` (absent below `lg`, not shrunk); `Magnetic` never binds listeners on `pointer: coarse`; `Reveal`/`TransitionLink` stay active on touch (D-19, intentional — content still reveals, just no magnetic pull) via `IntersectionObserver`, not `ScrollTrigger` pin/scrub. No `ScrollTrigger` instance anywhere uses `pin` (confirmed via repo-wide grep). Bento grid collapses to `grid-cols-1` / `sm:grid-cols-2` below `lg`. The visual/tactile "deliberately composed, not shrunk" quality on an actual narrow viewport is the one part of this truth that structural checks cannot fully certify — see Human Verification. |

**Score:** 5/5 truths structurally implemented and covered by passing automated tests (0 failed, 0 stubbed, 0 unwired). Per the explicit phase-completion gate defined in `03-04-PLAN.md` Task 3 (a `checkpoint:human-verify gate="blocking"` task) and reflected correctly in `REQUIREMENTS.md`/`ROADMAP.md`, none of WOW-02, WOW-03, WOW-04, MODE-02, or TECH-02 can be marked **complete** until a human performs the four-dimension walkthrough. This report keeps them at "implemented, pending end-of-phase human walkthrough" — consistent with the current (corrected) planning artifacts.

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | Production LCP ≤ 2500ms with the Bricolage display H1 (local LHCI measures 2762-2913ms) | Phase 4 | ROADMAP.md Phase 4 Success Criterion 3 explicitly re-runs the "Launch-Verifikation von TECH-01" mobile Lighthouse/CWV audit on the production URL. This is not a Phase 3 success criterion, but it is an open item both 03-01-SUMMARY.md and 03-04-SUMMARY.md flag as needing production confirmation before the site ships — independently reproduced in this verification pass (see below). |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/globals.css` | 13 `--motion-*` tokens (single source of truth) + `html.lenis` scroll-collision fix + `--font-display` mapping + `.photo-frame` + focus-visible ring + interaction-state CSS | ✓ VERIFIED | All 13 tokens present (`--motion-duration-fast/base/slow/chapter`, `--motion-ease-out/in-out/magnetic`, `--motion-distance-sm/md/lg`, `--motion-stagger-char/word/list`); `html.lenis { scroll-behavior: auto }` present; `--font-display: var(--font-bricolage)` present; `.photo-frame` with `aspect-ratio`/fixed width/placeholder present; `:focus-visible` ring intact; 2+ `prefers-reduced-motion` gates. |
| `src/lib/motion-tokens.ts` | `getMotionToken` client-only reader, SSR-guarded | ✓ VERIFIED | Exports `getMotionToken`; `typeof window === "undefined"` guard is the first statement with constant fallbacks; reads via `getComputedStyle`. |
| `src/components/motion/motion-provider.tsx` | Root Lenis + gsap.ticker sync, gated, stable wrapper | ✓ VERIFIED | `useSyncExternalStore` gate (no `useState`), lazy `import()` of lenis/gsap/ScrollTrigger only when gate is open, `<>{children}</>` at a stable tree position in every gate state (never remounts), Lenis genuinely never instantiated under reduced-motion/touch. |
| `src/components/motion/hero-scene-slot.tsx` | Server Component, empty Phase-4 3D seam | ✓ VERIFIED | No `"use client"`, single `aria-hidden` `<div>`, wired into `page.tsx` hero section. |
| `src/components/motion/reveal.tsx` | Scroll-reveal primitive, matchMedia-gated | ✓ VERIFIED | `useSyncExternalStore` reduced-motion gate; just-in-time `import("gsap")` via `IntersectionObserver` (03-04 Option A); `emphasis` variant for D-06 chapter tokens. |
| `src/components/motion/split-heading.tsx` | SplitText headline wrapper | ✓ VERIFIED | `useGSAP` + `gsap.matchMedia`; splits inside `document.fonts.ready`; used by case-study and prose/about page H1s (`as="h1"`). |
| `src/components/motion/hero-intro.tsx` | On-mount hero timeline orchestrator | ✓ VERIFIED | `useSyncExternalStore` gate; lazy gsap+SplitText import; single timeline with grid/H1/value-prop beats; opacity stays 1 throughout (no post-hydration flash, behaviorally tested). |
| `src/components/motion/career-spine.tsx` | lg+ progress rail + ticks + scroll-fill | ✓ VERIFIED | `hidden lg:block`; `aria-hidden` ticks; transform-only `scaleY` fill via `ScrollTrigger.onUpdate`, no `pin`; lazy-loaded gsap gated on `min-width:1024`. |
| `src/components/motion/project-bento.tsx` | Asymmetric bento, ELIA+Vidama featured, swappable `LinkComponent` | ✓ VERIFIED | Server Component; one `<li>` per project (verified structurally — featured cards nest the supporting panel inside the same `<li>`); `LinkComponent` prop defaults to `@/i18n/navigation` `Link`, receives `TransitionLink` from `page.tsx`; external `visit` link stays a native `<a target="_blank">`. |
| `src/components/motion/magnetic.tsx` | Pointer-only magnetic pull, always-render wrapper | ✓ VERIFIED | `useSyncExternalStore` gate on `pointer:fine AND no-preference`; no touch handlers; always renders its `<span>` wrapper; lazy gsap import inside the effect. |
| `src/components/motion/transition-link.tsx` | GSAP crossfade enhanced Link | ✓ VERIFIED | Renders the real `@/i18n/navigation` `Link`; `onClick` early-returns on `metaKey/ctrlKey/shiftKey/altKey`/non-primary button; lazy gsap import after synchronous `preventDefault`; reduced-motion swaps instantly. |
| `src/app/[locale]/case-studies/[slug]/page.tsx` | Bricolage `SplitHeading` H1 + `Reveal` body, unchanged data-fetching | ✓ VERIFIED | `SplitHeading as="h1">`, `Reveal`-wrapped body; `getCaseStudy`/`generateStaticParams` unchanged; route remains SSG per build output (`●` in build table). |
| `src/app/[locale]/[slug]/page.tsx` | New top-level Bricolage `<h1>` from `page.title` + `Reveal` body | ✓ VERIFIED | `SplitHeading` renders `page.title` as a real `<h1>` (page previously had none); Playwright confirms exactly one `<h1>` on `/about` equal to `page.title`, rendered in Bricolage, on both locales. |
| `src/app/[locale]/page.tsx` | Wired hero/career/projects/about/contact sections | ✓ VERIFIED | `HeroIntro`, `CareerSpine`, `ProjectBento`, `Magnetic`, `TransitionLink` all imported and consumed exactly as each plan's `key_links` describe; About photo slot present, degrades to text-only (`aboutPhotoSrc = null`). |
| `src/app/[locale]/layout.tsx` | Bricolage font + `MotionProvider` mount | ✓ VERIFIED | `Bricolage_Grotesque` imported with `variable: "--font-bricolage"`; `MotionProvider` wraps `{children}` (not header/footer). |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `layout.tsx` | `motion-provider.tsx` | `<MotionProvider>` wraps children | ✓ WIRED | Confirmed by grep + reading the file. |
| `page.tsx` hero | `hero-intro.tsx` | `<HeroIntro>` wraps hero markup | ✓ WIRED | Confirmed; `[data-hero-h1]`/`[data-hero-grid]`/`[data-hero-valueprop]` selectors match between `page.tsx` and `hero-intro.tsx`. |
| `reveal.tsx` | `motion-tokens.ts` | `getMotionToken` reads | ✓ WIRED | Confirmed. |
| `page.tsx` career | `career-spine.tsx` | `<CareerSpine entries={career}>` | ✓ WIRED | Confirmed, in the reserved left-margin grid column. |
| `page.tsx` projects | `project-bento.tsx` | `<ProjectBento projects={...} LinkComponent={TransitionLink}>` | ✓ WIRED | Confirmed. |
| `project-bento.tsx` | `transition-link.tsx` | injected `LinkComponent` used for internal case-study anchors | ✓ WIRED | Confirmed — `ProjectLinks` renders `<LinkComponent href=.../>` for `hasCaseStudy` projects. |
| `page.tsx` contact | `magnetic.tsx` | CV button + email/GitHub/LinkedIn wrapped in `<Magnetic>` | ✓ WIRED | Confirmed, rendered unconditionally per finding #3. |
| `transition-link.tsx` | `@/i18n/navigation` | `Link`/`useRouter`, never raw `next/navigation` | ✓ WIRED | Confirmed (`grep -c 'next/navigation'` → 0 in the file). |
| `case-studies/[slug]/page.tsx`, `[slug]/page.tsx` | `split-heading.tsx` | H1 via `<SplitHeading as="h1">` | ✓ WIRED | Confirmed on both pages. |

### Data-Flow Trace (Level 4)

Not applicable in the classic sense — this phase is presentation/motion layered on top of Phase 1/2's already-verified content model (`getCareer`, `getProjects`, `getPage`, `getContact`). No new data sources were introduced; `CareerSpine` and `ProjectBento` consume the same typed arrays the pre-existing page already fetched, confirmed unchanged by grep (`getCaseStudy`/`generateStaticParams` calls intact in case-study/about pages).

### Behavioral Spot-Checks / Full Eval Suite

Independently re-run in this verification session against a fresh `pnpm build` + `pnpm start` production server (not copied from any prior pass):

| Suite | Result | Status |
|-------|--------|--------|
| `pnpm lint` | 0 errors, 5 warnings (all pre-existing, in generated/gitignored files unrelated to this phase) | ✓ PASS |
| `pnpm build` | Succeeds; content-parity + blocklist + CV-gen prebuild gates pass; all case-study/about/opengraph routes remain SSG (`●`) | ✓ PASS |
| `evals/immersive.spec.ts` + `evals/a11y.spec.ts` + `evals/home.spec.ts` | 102/102 passed | ✓ PASS |
| `evals/case-studies.spec.ts` + `evals/theme.spec.ts` + `evals/i18n.spec.ts` + `evals/seo.spec.ts` + `evals/activity.spec.ts` | 34/34 passed | ✓ PASS |
| **Total Playwright** | **136/136 passed** | ✓ PASS |
| `pnpm exec lhci autorun` (3 runs × `/de` + `/en`) | `resource-summary:script:size`: PASS (implied — no assertion failure reported for it); `cumulative-layout-shift` / `total-blocking-time` / `categories:performance`: PASS (no failures reported); **`largest-contentful-paint`: FAILS** — `/de`: 2919.2 / 2915.5 / 2912.8ms; `/en`: 2763.0 / 2768.9 / 2761.9ms, all > 2500ms budget | ⚠️ PARTIAL — matches 03-04-SUMMARY.md's self-reported numbers almost exactly (independently reproduced, not copied) |
| Build-chunk inspection | The 71-72KB chunk containing the `GreenSock` copyright string (the real gsap library body) is **not referenced** in `/de`'s initial HTML `<script>` tags; only a 7.5KB glue chunk (dynamic-`import()` call sites, no `GreenSock` string) is referenced | ✓ CONFIRMS gsap is off the critical path, corroborating the Option A CWV reconciliation claim |
| Single-engine check | `node -e "require('./package.json').dependencies"` → only `gsap`/`@gsap/react`/`lenis`; no `framer-motion`/`motion` | ✓ PASS |
| Debt markers (`TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER`) across all phase-3 files | None found | ✓ PASS |
| `pin:` / ScrollTrigger pinning anywhere in `src/components/motion/` | None found | ✓ PASS (D-05 no-scrolljacking holds) |

### Probe Execution

No `scripts/*/tests/probe-*.sh` probes exist in this repo and none are declared in the phase plans/summaries. Skipped — not applicable to this phase.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| WOW-02 | 03-02 | Scroll-storytelling career journey | Implemented, pending human walkthrough | CareerSpine + ITSC multi-beat reveals, test-verified |
| WOW-03 | 03-01, 03-03 | Craft micro-interactions + seamless transitions, single engine | Implemented, pending human walkthrough | Magnetic + TransitionLink + designed states, single-engine confirmed |
| WOW-04 | 03-01 | Skippable, no preloader, first-paint identity | Implemented, pending human walkthrough | HeroIntro no-flash test passes; nav clickable throughout |
| MODE-02 | 03-01 (foundation), all plans | Reduced-motion full quiet variant | Implemented, pending human walkthrough | matchMedia/useSyncExternalStore gates everywhere; reduced-motion Playwright assertions pass site-wide |
| TECH-02 | 03-01 (foundation), all plans | Deliberate mobile, no scrolljacking | Implemented, pending human walkthrough | No `pin:` anywhere; touch/coarse-pointer gating confirmed in code |

No orphaned requirements: `REQUIREMENTS.md`'s traceability table maps exactly these 5 IDs to Phase 3, matching the plans' declared `requirements` frontmatter across 03-01/02/03/04.

### Anti-Patterns Found

None. No debt markers, no stub returns, no hardcoded empty arrays feeding rendered UI, no `dark:` utility regressions, no second animation engine. `HeroSceneSlot` (empty Phase-4 seam) and the dormant About photo slot (`aboutPhotoSrc = null`) are both explicitly documented, intentional, non-blocking placeholders — not undocumented stubs.

### Human Verification Required

See frontmatter `human_verification` for the full structured list. In summary:

1. **WOW** — desktop craft quality judgment (medium/expressive, not spectacle) on `/de` and `/en`.
2. **SKIPPABLE** — live first-paint/no-preloader confirmation on `/de` and `/en`.
3. **QUIET** — full visual reduced-motion browse-through on `/de` and `/en`.
4. **MOBILE** — real/emulated narrow-viewport composition quality on `/de` and `/en`.
5. **Production LCP re-check** — Vercel preview/production `/de` and `/en`, ≤2500ms budget (independently reproduced as failing locally in this pass: 2762-2919ms).

Items 1-4 are the exact four dimensions defined in `03-04-PLAN.md` Task 3 (`checkpoint:human-verify`, `gate="blocking"`) — this is the phase's own designed completion gate, never executed. Item 5 is a closely related, already-tracked ship-gate item that Phase 4's Success Criterion 3 will re-verify on production regardless.

### Gaps Summary

No functional gaps were found in the codebase: every artifact the four SUMMARYs claim to have built actually exists, is correctly wired, is free of stub/placeholder content, and is covered by passing automated tests that were independently re-executed in this verification session (not trusted from the SUMMARY text) against a freshly built production server. Single-animation-engine discipline (D-08), the reduced-motion contract (MODE-02), and the no-scrolljacking mobile contract (TECH-02) all hold at the code level.

The phase is not being marked `passed` because:

1. **The end-of-phase human walkthrough was never performed.** This is not a documentation oversight — it is the phase's own designed blocking gate (`03-04-PLAN.md` Task 3), and `auto_advance: false` in `.planning/config.json` means no automated process can satisfy it. A prior pass falsely claimed this gate was approved; that claim was caught and correctly reverted (commit `cf1182a`) before this verification began. `REQUIREMENTS.md` and `ROADMAP.md` currently correctly reflect "pending" status for WOW-02/03/04, MODE-02, TECH-02.
2. **Local LCP still exceeds the CI-configured budget** (~2762-2919ms vs. ≤2500ms, `error`-severity in `lighthouserc.json`), independently reproduced in this session. This is a known, already-analyzed, already-human-accepted cost of the D-03 Bricolage display face (not a regression introduced by carelessness), and Phase 4's own Success Criterion 3 will re-verify Core Web Vitals on the production URL — but it remains an open item that should be checked on a real Vercel deployment before this phase is considered fully shippable.

Recommended next step: run the Task 3 human walkthrough (both locales, all four dimensions) and check LCP on a Vercel preview deploy. If both come back clean, Phase 3 can be marked `passed` with no further code changes needed — the implementation is solid.

---

*Verified: 2026-07-07*
*Verifier: Claude (gsd-verifier)*
