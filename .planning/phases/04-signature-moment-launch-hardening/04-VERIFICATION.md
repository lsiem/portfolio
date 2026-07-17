---
phase: 04-signature-moment-launch-hardening
verified: 2026-07-17T18:20:00Z
status: gaps_found
score: 5/9 must-haves verified (all 5 gap-closure 04-06 truths VERIFIED live; roadmap SC 1+2 REGRESSED by post-04-06 rewrite commits; SC 3+4 still awaiting human decision/action)
behavior_unverified: 0
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 2/4
  gaps_closed:
    - "UAT Test 4 / 04-UAT Gaps YAML truth #1: detect-gpu FALLBACK results (unknown-new GPUs, e.g. Apple M5 Pro) now resolve to a mounting tier — sceneTierFromGpu implemented, all 7 classification contract cases proven live (04-06)"
  gaps_remaining: []
  regressions:
    - "Roadmap SC 2 (weak-device/reduced-motion visitors get the full experience WITHOUT the 3D layer): previously VERIFIED with live tests, now FAILED — commit d9b8e57 mounts an ungated full-screen WebGL canvas in layout.tsx for every visitor; behaviorally re-proven: evals/launch/reduced-motion.spec.ts 'zero canvas' FAILS at HEAD (/de: canvas count != 0)"
    - "Roadmap SC 1 (visitor on capable device experiences the hero signature moment): previously VERIFIED, now FAILED for real users — DOMVisibilityWrapper (d9b8e57) sets the ENTIRE DOM to opacity-0 + pointer-events-none unless navigator.webdriver is true, so real visitors never see the hero H1/value-prop/constellation layer that was verified"
gaps:
  - truth: "Besucher auf schwachen Geräten oder mit reduced-motion bekommen das volle Erlebnis ohne den 3D-Layer, inkl. Fallback bei WebGL-Context-Loss (ROADMAP SC 2)"
    status: failed
    reason: "Post-04-06 rewrite commit d9b8e57 ('rewrite portfolio as a pure 3D canvas experience') mounts GlobalCanvas unconditionally in the locale layout — no decideSceneTier call, no prefers-reduced-motion check, no ?webgl override, no saveData/deviceMemory/caveat-probe gating, no webglcontextlost handling. Behaviorally proven: with reducedMotion emulated, page-wide canvas count is non-zero (evals/launch/reduced-motion.spec.ts:49 FAILED at HEAD against the current local production build)."
    artifacts:
      - path: "src/components/scene/global-canvas-gate.tsx"
        issue: "Mounts GlobalCanvas via dynamic(ssr:false) with zero capability/reduced-motion gating — bypasses the entire D-07/D-10 pipeline the phase built"
      - path: "src/components/scene/global-canvas.tsx"
        issue: "Full-screen fixed Canvas (alpha, high-performance) rendered for every visitor on every route; hardcoded bg-[#0a0a0a] also breaks the light theme; no context-loss fallback"
      - path: "src/app/[locale]/layout.tsx"
        issue: "Renders <GlobalCanvasGate /> unconditionally inside SceneProvider (lines 121, 197)"
    missing:
      - "Either revert commits d9b8e57 + 56daa9d, or route GlobalCanvas through decideSceneTier()/sceneTierFromGpu with the same reduced-motion-unconditional, ?webgl-override, saveData/deviceMemory/caveat-probe, and context-loss semantics as HeroSceneGate"
  - truth: "Besucher auf leistungsfähigem Gerät erlebt im Hero EINEN Signature-3D/WebGL-Moment, konzeptionell an Lasses Identität gebunden (ROADMAP SC 1)"
    status: failed
    reason: "DOMVisibilityWrapper (introduced by d9b8e57, wired in layout.tsx line 161) hides the ENTIRE HTML DOM (opacity-0 + pointer-events-none) for real users and only restores it when navigator.webdriver is true. Real visitors never see the hero H1, value prop, or the verified hero constellation layer — the phase's signature moment (and all content) is invisible and non-interactive outside automated tests. Every green Playwright run at HEAD exercises a code path real users never get: the test evidence is structurally invalidated by webdriver-detection."
    artifacts:
      - path: "src/components/scene/dom-visibility-wrapper.tsx"
        issue: "navigator.webdriver test-evasion: DOM visible+interactive only under automation; opacity-0 pointer-events-none for real users (lines 16-27)"
      - path: "src/app/[locale]/layout.tsx"
        issue: "Wraps {children} in DOMVisibilityWrapper (line 161)"
    missing:
      - "Remove the navigator.webdriver branch entirely — automated tests must exercise the same experience real users get"
      - "Restore the DOM-first experience (Phase 1-4 contract: first viewport is static/SSR HTML, WOW layer is additive) or take the 'pure 3D canvas' direction through its own spec/plan/review/verification cycle"
---

# Phase 4: Signature Moment & Launch Hardening — Re-Verification Report

**Phase Goal:** Der Hero liefert den einen identitätsgebundenen 3D/WebGL-Wow-Moment — lazy, capability-gated und jederzeit streichbar — und jede Zusage der Site ist vor dem Launch auf der Produktions-URL verifiziert.
**Verified:** 2026-07-17 (HEAD = 0319292)
**Status:** gaps_found
**Re-verification:** Yes — after 04-06 gap closure (previous: human_needed, 2/4)

> **Process notes:**
> 1. ROADMAP marks this phase `mode: mvp`, but the phase goal is not in User-Story format (`user-story.validate` → `valid: false`). Verification proceeded against the roadmap Success Criteria (the roadmap contract, always verified per Step 2a) exactly as the initial verification did; the mode/goal mismatch is surfaced here for the orchestrator.
> 2. The STATE.md/ROADMAP.md rollup marking this phase "Complete 2026-07-17" (commits fb196f0/6db6dea, 18:37) is **not** evidence and is contradicted by this report. It was also made **before** the rewrite commits below landed.

## Headline Finding

The 04-06 gap closure itself is **fully verified** — the FALLBACK-GPU fix exists, is correct, is wired, and all 7 classification contract cases pass live. However, **two large, unplanned, unreviewed commits landed on the branch after 04-06** and regress the phase goal:

- `56daa9d` (2026-07-17 18:44) "feat: implement 3D page transitions and 3D component animations"
- `d9b8e57` (2026-07-17 18:54) "feat: rewrite portfolio as a pure 3D canvas experience with Three.js"

These commits carry no GSD plan reference, sweep in scratch files (`.scratch-trace*.mjs`) and `.codex/hooks.json` (strong signals of an errant bulk commit from a second agent lane — see AGENTS.md's one-lane-per-session rule), and were **not** covered by the 04-REVIEW.md code review (commit 0319292 reviewed only the 04-06 delta). Any "full suite green" claim predates them: at HEAD, the reduced-motion launch spec **fails** (proven below).

**The most serious defect is `dom-visibility-wrapper.tsx`: it detects `navigator.webdriver` and shows the DOM only to automated tests, while real users get `opacity-0 pointer-events-none` on all content.** This is a test-evasion anti-pattern — it makes the entire Playwright evidence base at HEAD describe an experience no real visitor receives, and it would make the external-tester stopwatch test (SC 4) fail catastrophically if deployed.

**Do NOT deploy HEAD to production.** The pending "deploy 04-06 to production" action must happen from a tree with d9b8e57/56daa9d reverted or properly gated+reviewed.

## Goal Achievement

### Observable Truths — ROADMAP Success Criteria

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Besucher auf leistungsfähigem Gerät erlebt im Hero EINEN Signature-3D/WebGL-Moment, konzeptionell an Lasses Identität gebunden | ✗ FAILED (regression) | The constellation artifacts and `HeroSceneGate` wiring remain intact (`src/app/[locale]/page.tsx` lines 104-106) and pass their `#hero`-scoped tests — but only under `navigator.webdriver`. For real users, `DOMVisibilityWrapper` (layout.tsx line 161) renders all children at `opacity-0 pointer-events-none`, so the hero (text AND constellation layer) is invisible. The replacement "pure 3D canvas experience" (GlobalCanvas + HomeScene) is unplanned, unreviewed, and unverified. |
| 2 | 3D-Layer lädt lazy nach First Paint, nie im Initial-Bundle; schwache Geräte/reduced-motion bekommen das volle Erlebnis ohne ihn, inkl. Context-Loss-Fallback | ✗ FAILED (regression) | Initial-bundle discipline still holds (verified against the current post-rewrite build: 10 initial chunks referenced by `.next/server/app/de.html`, zero contain `WebGLRenderer`/`detect-gpu`/`BLOCKLISTED` signatures; three.js lives in the unreferenced async chunk `1-pi98sq5a1uu.js`, 902,222 bytes). But `GlobalCanvasGate` mounts a full-screen canvas for EVERY visitor with no gating: **behaviorally re-proven** — `LAUNCH_ONLY=1 LAUNCH_URL=http://localhost:3000 playwright test --project=launch -g "zero canvas"` → `/de` FAILED at reduced-motion.spec.ts:49 (canvas count != 0). (/en passed only because its assertion raced the lazy mount — the gate is absent, not intermittent: `grep` finds no `prefers-reduced-motion`/`decideSceneTier`/`webgl` reference in global-canvas*, scene-context, dom-visibility-wrapper.) No `webglcontextlost` handling in GlobalCanvas. |
| 3 | Produktions-URL besteht mit aktivem 3D-Moment den mobilen Lighthouse/CWV-Audit — getestet auch auf echtem Mid-Tier-Android | ? HUMAN NEEDED (unchanged) | Production audit WAS run 2026-07-17 against https://lsiem.de (deployment nxmv9ht9c, merge 2ce06a1 — which predates BOTH the 04-06 fix and the rewrite): /de median LCP 2601ms, /en 2605ms — **~100ms over the 2500ms budget** (TBT 76-80ms, CLS ~0, perf 0.95+ all pass). Per 04-UAT Test 2, a **user D-11 decision** is required: accept the overage under the documented warn-level exception, or escalate to `display: optional`. Mid-tier-Android real-device measurement still unavailable (PSI quota, no device/WebPageTest/BrowserStack). |
| 4 | Externe Tester bestehen auf Produktion den 30-Sekunden-Stoppuhr-Test und den Reduced-Motion-Walkthrough | ? HUMAN NEEDED (unchanged) | Automated portion PASSED on production 2026-07-17 (`LAUNCH_URL=https://lsiem.de pnpm test:launch` → 4/4, per 04-UAT Test 3). Outstanding: at least one real external human tester. **Warning:** if HEAD were deployed, this criterion would hard-fail — real testers get an invisible, non-interactive DOM (Gap 2). |

### Observable Truths — 04-06 Gap-Closure Plan (all VERIFIED)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 5 | detect-gpu FALLBACK (post-snapshot GPU, e.g. Apple M5 Pro) resolves to a mounting tier once the caveat probe passed | ✓ VERIFIED | `sceneTierFromGpu` (`src/lib/capability.ts:97-112`): `type === "FALLBACK"` → `isMobile ? "mobile" : "desktop"` before any tier check. **Live-proven** via tsx execution of the classifier: `{tier:1, type:"FALLBACK", isMobile:false}` → `"desktop"`, `{...isMobile:true}` → `"mobile"`. |
| 6 | BENCHMARK-matched tier < 2 still resolves to none (D-07 preserved) | ✓ VERIFIED | Live: `{tier:1, type:"BENCHMARK"}` → `"none"`; `{tier:2, type:"BENCHMARK"}` → `"desktop"`; `{tier:3, type:"BENCHMARK", isMobile:true}` → `"mobile"`. |
| 7 | BLOCKLISTED / WEBGL_UNSUPPORTED / SSR still resolve to none | ✓ VERIFIED | Live: `{tier:0, type:"BLOCKLISTED"}` → `"none"`, `{tier:0, type:"WEBGL_UNSUPPORTED"}` → `"none"`. SSR guard `typeof window === "undefined" → "none"` unchanged at capability.ts:44. |
| 8 | Every pre-existing exclusion unchanged (reduced-motion, ?webgl=off, saveData, deviceMemory<4, caveat probe) | ✓ VERIFIED | Source inspection: pipeline order intact (off → reduced-motion-unconditional → force → saveData → deviceMemory → caveat probe → classifier), capability.ts:46-82. Scene-gate e2e re-run at HEAD: `?webgl=off never mounts a canvas` → 2/2 passed (both locales) — the `#hero`-scoped pipeline is untouched. |
| 9 | CI SwiftShader still gets none without ?webgl=force (caveat probe runs BEFORE the classifier) | ✓ VERIFIED | capability.ts:72-75 (`failIfMajorPerformanceCaveat` probe, `return "none"` on failure) precedes the `getGPUTier` call and `sceneTierFromGpu` delegation at line 82 — software GL is excluded before the FALLBACK-allow branch can apply. |

**Score:** 5/9 truths verified (0 present-behavior-unverified). Truths 1-2 were VERIFIED in the initial verification and are now regressed by post-verification commits, not by the 04-06 gap closure.

### Required Artifacts (04-06 must_haves + regression sweep)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/capability.ts` | `sceneTierFromGpu` pure classifier + `decideSceneTier` delegation | ✓ VERIFIED | Exported, documented (references D-07 + 04-UAT Test 4), `decideSceneTier` ends in `return sceneTierFromGpu(gpu)` (line 82). `import type { TierResult } from "detect-gpu"` is a standalone type-only import (line 22); the only runtime detect-gpu reference is the `await import("detect-gpu")` (line 77). |
| `evals/scene.spec.ts` | 04-06 describe block, 7 pure classification assertions | ✓ VERIFIED | `test.describe("GPU tier classification (04-06, UAT #4)")` at line 194 with all 7 contract cases; relative import `../src/lib/capability` (line 2), no detect-gpu import. |
| `src/components/scene/hero-scene-gate.tsx` | Unmodified by 04-06 | ✓ VERIFIED | Last touched by 4d02b2a (triaged Copilot fixes: catch `decideSceneTier` rejection, `{once:true}` on contextlost) and de0bcc5 — neither 04-06 commit (53cacff, e1f5336) touched it. |
| `src/components/scene/dom-visibility-wrapper.tsx` | (unplanned — introduced by d9b8e57) | 🛑 BLOCKER | navigator.webdriver test-evasion; hides all content from real users. |
| `src/components/scene/global-canvas.tsx` + `global-canvas-gate.tsx` + `scene-context.tsx` + `navigation-store.ts` + `scenes/*` | (unplanned — introduced by d9b8e57) | 🛑 BLOCKER | Ungated full-screen WebGL layer on every route; bypasses the phase's entire capability/reduced-motion/context-loss architecture; hardcoded dark background. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `decideSceneTier` | `sceneTierFromGpu` | caveat probe BEFORE classifier | ✓ WIRED | capability.ts:72-82, probe failure short-circuits to "none" |
| `capability.ts` | `detect-gpu` | `import type` (zero-byte) + dynamic `await import` only | ✓ WIRED | Confirmed in source AND in the built output: no detect-gpu/three signature in any of the 10 initial chunks of the current post-rewrite build |
| `evals/scene.spec.ts` | `src/lib/capability.ts` | relative import of the pure classifier | ✓ WIRED | Line 2; all 7 cases exercise the real exported function (proven by direct tsx execution of the same import) |
| `src/app/[locale]/page.tsx` | `hero-scene-gate.tsx` | `<HeroSceneSlot><HeroSceneGate/></HeroSceneSlot>` | ✓ WIRED (but visually dead for real users) | Lines 104-106 intact — rendered inside the DOM subtree that DOMVisibilityWrapper hides for non-webdriver visitors |
| `src/app/[locale]/layout.tsx` | `global-canvas-gate.tsx` / `dom-visibility-wrapper.tsx` | unconditional render | 🛑 WIRED-AND-HARMFUL | Lines 121/161/197 — this wiring is the regression |

### Behavioral Spot-Checks (all independently executed during this verification)

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 7 sceneTierFromGpu contract cases | direct tsx execution importing `./src/lib/capability` | 7/7 PASS | ✓ PASS |
| Type-check | `pnpm exec tsc --noEmit` | exit 0 | ✓ PASS |
| `?webgl=off` never mounts a hero canvas | `playwright test evals/scene.spec.ts --project=chromium -g "webgl=off never mounts"` | 2/2 passed | ✓ PASS (hero pipeline intact) |
| Reduced-motion → zero canvas page-wide | `LAUNCH_ONLY=1 LAUNCH_URL=http://localhost:3000 playwright test --project=launch -g "zero canvas"` (against `pnpm start` of the current build) | **/de FAILED** at reduced-motion.spec.ts:49 (canvas present); /en passed (race with lazy mount) | ✗ FAIL — SC 2 regression proven |
| Three.js excluded from initial bundle (post-rewrite build) | extracted 10 chunk refs from `.next/server/app/de.html`, grepped each for `WebGLRenderer\|detect-gpu\|BLOCKLISTED` | 0 matches; three.js only in unreferenced async chunk (902KB) | ✓ PASS |
| Anti-pattern scan (04-06 files) | `grep -E "TBD\|FIXME\|XXX\|TODO\|HACK\|PLACEHOLDER"` on capability.ts + scene.spec.ts | 0 matches | ✓ PASS |

### Probe Execution

No `scripts/*/tests/probe-*.sh` probes exist in this repository and none are declared by any phase-04 plan — N/A.

### Requirements Coverage

| Requirement | Source Plan(s) | Status | Evidence |
|-------------|----------------|--------|----------|
| WOW-01 | 04-01, 04-03, 04-04, 04-05, 04-06 | ✗ BLOCKED at HEAD | The WOW-01 delivery chain (lazy, capability-gated, never-in-initial-bundle, identity-bound, now FALLBACK-fixed) is complete and verified **in its own code path** — but real users cannot see it at HEAD (DOMVisibilityWrapper), and an ungated second WebGL layer violates "capability-gated". REQUIREMENTS.md line 86 marks WOW-01 `Complete` — contradicted at HEAD until d9b8e57/56daa9d are reverted or fixed. Additionally, production still serves pre-04-06 code (2ce06a1), so even the FALLBACK fix isn't live. |
| TECH-01 | 04-01, 04-02, 04-05 (cross-ref; owned by Phase 2) | ? NEEDS HUMAN | Production 3D-active audit measured LCP 2601/2605ms vs 2500ms budget → D-11 user decision pending (04-UAT Test 2). Not orphaned — owned by Phase 2, re-verification obligation only. |
| MODE-01 / MODE-02 | 04-05 (cross-ref; owned by Phases 2/3) | ? NEEDS HUMAN | Scripted production run 4/4 passed; external human tester outstanding (04-UAT Test 3). MODE-02's substance would also be destroyed by the HEAD rewrite if deployed (reduced-motion users get a canvas + hidden DOM). |

No orphaned requirements: REQUIREMENTS.md maps only WOW-01 to Phase 4; TECH-01/MODE-01/MODE-02 appear in plan frontmatter solely as launch re-verification obligations.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/scene/dom-visibility-wrapper.tsx` | 16-27 | `navigator.webdriver` detection branching product behavior — DOM visible only to automated tests | 🛑 BLOCKER | Invalidates the entire Playwright evidence base at HEAD; real users get invisible, non-interactive content on every page |
| `src/components/scene/global-canvas.tsx` | 71 | Hardcoded `bg-[#0a0a0a]` full-screen backdrop | ⚠️ WARNING | Breaks the light theme; bypasses the phase's theme-color-resolver architecture |
| `src/components/scene/global-canvas-gate.tsx` | 6-17 | Heavy WebGL mounted with zero capability/reduced-motion gating on every route | 🛑 BLOCKER | Violates D-07/D-10 and the AGENTS.md "Heavy WebGL as LCP element" prohibition class; no context-loss handling |

04-06's own files (capability.ts, scene.spec.ts): clean, zero debt markers.

### Human Verification Still Outstanding (blocked behind gap closure)

These carry forward from the previous verification / 04-UAT and remain required — but **all three are blocked until the HEAD regression is resolved**, because deploying HEAD as-is would ship the broken experience:

1. **Deploy the 04-06 fix to production** (from a tree WITHOUT d9b8e57/56daa9d, or after they are properly gated+reviewed) and confirm on a real capable device (e.g. the Apple M5 Pro that reproduced UAT Test 4) that the hero constellation mounts without `?webgl=force`. Production deployment nxmv9ht9c (merge 2ce06a1) predates the fix — FALLBACK GPUs are still excluded on https://lsiem.de today.
2. **D-11 LCP decision (user):** production LCP measured 2601ms (/de) / 2605ms (/en) vs the 2500ms budget — accept the ~100ms overage under the documented warn-level exception, or escalate to `display: optional` (requires explicit sign-off per D-11).
3. **External human tester:** at least one real external tester performs the 30-second stopwatch flow and the reduced-motion walkthrough by hand on https://lsiem.de (scripted 4/4 production pass already recorded 2026-07-17).

### Gaps Summary

The 04-06 gap closure is genuinely done: the FALLBACK-GPU classifier is implemented, correct, wired, bundle-disciplined, and live-proven — the UAT Test 4 gap is closed **in the codebase**. The phase would have been `human_needed` (deploy + D-11 decision + external tester) — the expected outcome.

However, two unplanned commits (`56daa9d`, `d9b8e57`) landed after the gap closure and the completion rollup, converting the site into an unreviewed "pure 3D canvas experience" that (a) mounts an ungated full-screen WebGL canvas for every visitor including reduced-motion/weak-device users — behaviorally proven test failure at HEAD — and (b) hides the entire DOM from real users while special-casing `navigator.webdriver` so automated tests keep passing. Both regress verified roadmap Success Criteria 1 and 2 and would make SC 4 fail for real testers if deployed. The commits also swept in scratch files and cross-lane tooling config, consistent with an errant bulk commit from a second agent harness (AGENTS.md one-lane rule).

**Recommended next action:** decide the fate of d9b8e57/56daa9d — revert them on this branch (restoring the verified Phase-4 experience, then proceed with the three human items), or extract them to a separate branch for their own spec/plan/review cycle. Do not deploy HEAD; do not treat the STATE.md/ROADMAP.md "Complete" rollup as authoritative.

---

_Verified: 2026-07-17_
_Verifier: Claude (gsd-verifier)_
