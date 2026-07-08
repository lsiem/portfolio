---
phase: 03-design-direction-immersive-experience
plan: 03
subsystem: craft-interactions-transitions
status: complete
tags: [gsap, magnetic, transition-link, hover-states, crossfade, wow-03, reduced-motion]
requires:
  - "src/lib/motion-tokens.ts (03-01 token reader)"
  - "src/components/motion/project-bento.tsx (03-02 bento with LinkComponent seam)"
  - "src/i18n/navigation.ts (locale-aware Link/useRouter)"
provides:
  - "Magnetic — pointer-only magnetic pull wrapper (useGSAP contextSafe), gated + always-render"
  - "TransitionLink — enhanced i18n-Link with GSAP crossfade + modifier/middle-click passthrough"
  - "designed hover/focus/active CSS (.chip, .cv-button) gated under prefers-reduced-motion"
  - "bento case-study links wired through TransitionLink (crossfade everywhere a case study opens)"
affects:
  - "src/app/[locale]/page.tsx (CV/contact Magnetic, About TransitionLink, bento LinkComponent)"
  - "src/app/globals.css (interaction-state rules)"
  - "src/components/motion/project-bento.tsx (chip class)"
tech_stack:
  added: []
  patterns:
    - "useGSAP contextSafe for event-handler tweens; handlers read event.currentTarget (React-Compiler forbids ref.current in render closures)"
    - "always-render Magnetic wrapper, gate listeners internally (no wrapper↔fragment remount)"
    - "TransitionLink = real anchor + onClick crossfade with metaKey/ctrlKey/shiftKey/altKey/non-primary early-return passthrough"
    - "designed states: instant color/border change, only transitions gated under prefers-reduced-motion"
key_files:
  created:
    - src/components/motion/magnetic.tsx
    - src/components/motion/transition-link.tsx
  modified:
    - src/app/globals.css
    - src/app/[locale]/page.tsx
    - src/components/motion/project-bento.tsx
    - evals/immersive.spec.ts
decisions:
  - "Magnetic gates on pointer:fine AND prefers-reduced-motion:no-preference — pull is absent on touch (D-19) and stripped under reduced-motion (MODE-02). Always renders its inline-block wrapper; only the mousemove/mouseleave listeners are conditionally bound, so a gate flip never remounts the wrapped control (finding #3)."
  - "Magnetic/TransitionLink handlers read the element via event.currentTarget, not ref.current — the repo's React-Compiler lint (react-hooks/refs) errors on ref access inside render-created closures. The ref is used only for useGSAP scope."
  - "TransitionLink renders the real @/i18n/navigation Link (true anchor, focusable, crawlable, ring applies) and layers the crossfade via onClick; it early-returns on metaKey/ctrlKey/shiftKey/altKey or non-primary button so Cmd/Ctrl/middle-click open a new tab natively (finding #3)."
  - "Reduced-motion gate in TransitionLink uses plain window.matchMedia (not gsap.matchMedia) to avoid leaking a matcher on every click; the reduce branch calls router.push immediately."
  - "gsap cubic-bezier motion tokens map to GSAP named eases (power2.out pull, elastic.out snapback, power2.inOut crossfade) since GSAP core can't parse raw cubic-bezier without CustomEase; durations/distances still come from getMotionToken."
  - "Bento already forwarded LinkComponent to internal case-study anchors (03-02), so wiring was just passing LinkComponent={TransitionLink} from page.tsx; external visit link stays a native <a target=_blank>."
metrics:
  duration: ~25min
  tasks: 2
  commits: 1
  files_created: 2
  files_modified: 4
  completed: 2026-07-07
---

# Phase 3 Plan 03: Craft Micro-Interactions & Seamless Transitions Summary

Layered the "everything feels designed" surface of WOW-03 on the single GSAP engine: magnetic pull on the CV button + contact links (pointer-only, absent on touch, stripped under reduced-motion), designed hover/focus/active states across chips and the CV button, and a GSAP crossfade for sub-route navigation to case studies and /about — wired everywhere a case study opens (About read-more AND the bento's flagship/deep links via its `LinkComponent` seam). The `:focus-visible` ring and accent budget are intact, and no second animation engine was introduced (D-08).

## What Was Built

- **`Magnetic`** (`magnetic.tsx`): `useGSAP` + `contextSafe` pull toward the cursor (clamped 12px), gated on `pointer:fine AND no-preference` via `useSyncExternalStore`; always-render inline-block wrapper, listeners bound only when enabled; no touch handlers.
- **`TransitionLink`** (`transition-link.tsx`): enhanced `@/i18n/navigation` `Link` anchor + `onClick` GSAP crossfade of `<main>` (fade/rise → `router.push` in `onComplete`); mandatory early-return passthrough for modifier/middle/non-primary clicks; instant swap under reduced-motion.
- **`globals.css`**: `.chip` foreground-tint + border hover, `.cv-button` `scale(0.98)` press — instant state changes, transitions gated under `@media (prefers-reduced-motion: no-preference)`; `:focus-visible` untouched.
- **`page.tsx`**: CV button + email/GitHub/LinkedIn links wrapped in `<Magnetic>` (unconditional); About read-more via `<TransitionLink>`; `ProjectBento` receives `LinkComponent={TransitionLink}`; `chip` class on career tech chips.
- **`project-bento.tsx`**: `chip` class on bento tech chips (LinkComponent forwarding already present from 03-02).
- **`immersive.spec.ts`**: magnetic pull + snapback, focus-ring + aria-label intact, reduced-motion strip, bento crossfade navigation (plain + reduced-motion), modifier-click passthrough, external-visit native anchor, single-engine package check.

## Verification

- `pnpm lint`: 0 errors (pre-existing warnings only). `pnpm build`: succeeds, all routes SSG.
- Playwright: **94/94 green** at `--workers=2` (immersive 44 + home 36 + a11y 14).
- Single animation engine confirmed (no `framer-motion`/`motion` dep).
- LHCI (advisory): CLS 0, TBT 0 PASS; **script:size ~225KB > 184,643**, **LCP ~2.75–2.9s > 2500ms** — see Deferred Issues.

## Deviations from Plan

**1. [Rule 1 — lint] Handlers use `event.currentTarget`, not `ref.current`.**
The repo's React-Compiler `react-hooks/refs` rule errors on `ref.current` inside render-created `contextSafe` closures. Reading the element via `event.currentTarget` (the bound wrapper) is equivalent and lint-clean; the ref remains for `useGSAP` scope.
- **File:** magnetic.tsx — **Commit:** c7190fc

**2. [Rule 1 — GSAP core] cubic-bezier motion tokens map to named GSAP eases.**
GSAP core can't parse raw `cubic-bezier(...)` without the CustomEase plugin, so `--motion-ease-*` tokens map to named equivalents (`power2.out`, `elastic.out`, `power2.inOut`). Durations/distances still read from `getMotionToken`. Avoids shipping CustomEase.
- **Files:** magnetic.tsx, transition-link.tsx — **Commit:** c7190fc

**3. [minor] Magnetic also gates on reduced-motion.**
The plan gated Magnetic on `pointer:fine`; the eval + MODE-02 require no pull under reduced-motion, so the gate is `pointer:fine AND no-preference`.
- **File:** magnetic.tsx — **Commit:** c7190fc

## Deferred Issues

**ADVISORY bundle + LCP breach (per plan Task-2 finding #5 — not a hard stop; CI + the 03-04 checkpoint are authoritative).**

- `resource-summary:script:size` ≈ **225KB** vs the 184,643-byte gate — only ~+2KB over 03-02, because gsap was already on Lighthouse's mobile path via the reveals (D-19); Magnetic/TransitionLink added little net.
- `largest-contentful-paint` ≈ **2.75–2.9s** vs ≤2500ms — unchanged range from 03-02.

Root cause and reconciliation are unchanged from 03-02: the ~39KB gsap engine loads on mobile because reveals run on touch (D-19). **Reconcile at 03-04** (defer below-fold `GitHubHeatmap` client JS is the highest-leverage in-scope trim; or adjust the budget if production Vercel CWV holds). Also carried: verify production LCP ≤ 2500ms on the Vercel preview for `/de` and `/en`.

## Known Stubs

None.

## Notes for Future Plans

- WOW-03 micro-interaction + seamless-transition surface is complete. `Magnetic` and `TransitionLink` are reusable for any further controls/links.
- 03-04 is the designated bundle/LCP reconciliation point for the accumulated Phase-3 motion engine — see the STATE blocker.
- Native Back/forward (`popstate`) intentionally does NOT replay the crossfade (accepted MVP limitation, per plan reviews note).

## Self-Check: PASSED

Both created components + SUMMARY.md exist on disk; plan-03 commit `c7190fc` present in git history.
