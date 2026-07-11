---
phase: 04-signature-moment-launch-hardening
verified: 2026-07-11T22:30:00Z
status: human_needed
score: 2/4 must-haves verified (2 code-verified, 2 require production deployment + human re-run)
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Deploy the current branch (phase/03-design-direction-immersive-experience, commit 98b6e48 or later) to a Vercel Preview, then promote to Production (https://lsiem.de)"
    expected: "The deployed HTML/JS reflects the full 04-04 constellation (three/@react-three/fiber lazy chunk present, capability gate wired) — confirm via network tab or `curl` chunk inspection that the constellation code is live"
    why_human: "Deployment is an infrastructure action outside the codebase; no verifier tool can push/promote a Vercel deployment"
  - test: "Re-run `pnpm lhci:webgl` (or an equivalent mobile Lighthouse/PSI audit with `?webgl=force`) against the production URL for /de and /en, and separately confirm a mid-tier-Android measurement (real device, WebPageTest, or BrowserStack — D-13's preferred proxy) now that quota/device access may differ from this sandboxed run"
    expected: "LCP <= 2500ms on production (TBT/CLS/script-size/perf already pass locally at 43-45ms/0.001/416KB/0.96 and are expected to hold or improve on production's edge network); if LCP still exceeds 2500ms on production, the D-11 exception path requires a fresh user decision on whether to escalate to `display: optional`"
    why_human: "ROADMAP success criterion 3 explicitly names the production URL, not a local proxy. 04-05's own evidence document (04-LAUNCH-EVIDENCE.md) states local LCP is ~2755-2758ms — a FAIL against the 2500ms budget — and explicitly defers the deciding measurement to production per D-11/D-12. This cannot be verified by re-reading source code; it requires a real network deploy and a live audit tool run against it (Lighthouse CI, PSI, or Vercel Speed Insights)."
  - test: "Re-run `LAUNCH_URL=https://lsiem.de pnpm test:launch` (the 30-second stopwatch test + reduced-motion walkthrough, evals/launch/*.spec.ts) against the production URL, and have at least one external tester manually perform the same 30-second stopwatch flow and reduced-motion walkthrough by hand"
    expected: "Both locales pass the scripted stopwatch assertion (name/role/value-prop visible with zero scroll, dense overview one click away, contact + CV reachable, all under 30s) and the reduced-motion walkthrough (zero `<canvas>` anywhere, full content in every section, no blocking overlay) — this time against the real production deployment, not the local build proxy"
    why_human: "ROADMAP success criterion 4 explicitly says 'Externe Tester ... auf Produktion' (external testers, on production). The agent-run Playwright specs verified here (and independently re-run by this verification, see below) only ever exercised the local production build (`pnpm build && pnpm start`) on `localhost:3000` — never the real production URL — and a scripted agent run is not a substitute for an actual external human tester's subjective pass/fail judgment on the 30-second test."
gaps: []
---

# Phase 4: Signature Moment & Launch Hardening Verification Report

**Phase Goal:** Der Hero liefert den einen identitätsgebundenen 3D/WebGL-Wow-Moment — lazy, capability-gated und jederzeit streichbar — und jede Zusage der Site ist vor dem Launch auf der Produktions-URL verifiziert.
**Verified:** 2026-07-11
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Besucher auf leistungsfähigem Gerät erlebt im Hero EINEN Signature-3D/WebGL-Moment, konzeptionell an Lasses Identität gebunden. | ✓ VERIFIED | `src/components/scene/constellation-data.ts` builds a deterministic orchestrator-hub + satellite-cluster graph (`buildConstellation()`) that explicitly mirrors "ELIA's real multi-agent shape" (code comment, lines 4-12) — not a generic particle field. `src/components/scene/constellation.tsx` (`useFrame`) + `scene-bridge.ts` drive drift/pulses/pointer-attraction. Re-ran `evals/scene.spec.ts` live against a local production build (`pnpm build && pnpm start`) — all 9 tests pass, including the `?webgl=force` mount test proving the canvas appears in `#hero` without displacing the H1/value-prop. |
| 2 | Der 3D-Layer lädt lazy nach First Paint und ist nie im Initial-Bundle; Besucher auf schwachen Geräten oder mit reduced-motion bekommen das volle Erlebnis ohne ihn, inkl. Fallback bei WebGL-Context-Loss. | ✓ VERIFIED | `hero-scene-gate.tsx` mounts `ConstellationCanvas` via `dynamic(() => import("./constellation-canvas"), { ssr: false })`, gated behind `document.readyState === "complete"` + `requestIdleCallback`. `decideSceneTier()` in `capability.ts` returns `"none"` unconditionally on `prefers-reduced-motion: reduce` (checked BEFORE the `?webgl=force` override, so force cannot bypass D-10) and on `?webgl=off`, `saveData`, low `deviceMemory`, failed WebGL2-caveat probe, or `detect-gpu` tier < 2. `constellation-canvas.tsx`'s `onCreated` registers a `webglcontextlost` listener that calls `setLost(true)` -> component returns `null` (no `preventDefault`, no restore UI, no toast). **Verified live, not just read**: re-ran `evals/scene.spec.ts` against a fresh local production build — `?webgl=off` never mounts a canvas, reduced-motion wins over `?webgl=force`, and the `webglcontextlost` dispatch test unmounts the canvas with no error surfaced (all pass). Independently confirmed the initial-bundle claim by fetching the built `/de` HTML, extracting all 10 referenced initial chunk files from `.next/static/chunks/`, and grepping each for `three`/`@react-three`/`detect-gpu` signatures — zero matches. The three/fiber code instead lives in a separate ~893KB chunk (`2n5syh1hkt84w.js`) that is NOT among the initial-page chunks — confirming it is genuinely async-only. |
| 3 | Produktions-URL besteht mit aktivem 3D-Moment den mobilen Lighthouse/CWV-Audit (Launch-Verifikation von TECH-01) — getestet auch auf einem echten Mid-Tier-Android. | ⚠️ HUMAN NEEDED | Cannot be verified from the codebase — this truth is defined in terms of the **production URL**, and no production/preview deployment currently reflects the 04-04 constellation (confirmed: `git rev-list` shows origin is 5 commits behind local HEAD; `vercel ls` in 04-LAUNCH-EVIDENCE.md shows the latest Preview predates 04-04). The best available evidence is 04-LAUNCH-EVIDENCE.md's **local-production proxy** run: TBT/CLS/script-size/performance all pass with the constellation forced active (`?webgl=force`), but **LCP is ~2757-2758ms — a documented FAIL against the 2500ms budget** (carried from the pre-existing 04-01 Bricolage-H1 font gap, not a 3D regression; CI assertion is intentionally `warn`, a user-approved D-11 exception). The mid-tier-Android requirement was proxied via Chrome DevTools calibrated throttling (4x CPU, 150ms RTT, mobile viewport) because no physical device or WebPageTest/BrowserStack account was available in that environment. See human-verification items below — this criterion needs a real deploy + a production audit before it can be marked true. |
| 4 | Externe Tester bestehen auf Produktion den 30-Sekunden-Stoppuhr-Test und den Reduced-Motion-Walkthrough (Launch-Verifikation von MODE-01/MODE-02). | ⚠️ HUMAN NEEDED | The Playwright specs (`evals/launch/stopwatch.spec.ts`, `evals/launch/reduced-motion.spec.ts`) exist and are substantive (assert first-fold name/role/value-prop with zero scroll, one-click reach to `#career`, mailto + CV-download reachability, total wall time `< 30_000`; zero `<canvas>` + full section content + no `[aria-modal]`/`[role=dialog]` for reduced-motion). **Independently re-ran them** against a freshly-built local production server (`pnpm build && pnpm start`) — 4/4 pass, matching 04-LAUNCH-EVIDENCE.md's recorded results. However, this is a **scripted agent run against `localhost:3000`, not "externe Tester ... auf Produktion"** as the criterion literally requires. No external human tester has performed either walkthrough, and no run has hit the real production URL. This criterion is present-and-tooled but not yet the thing the roadmap actually asks for. |

**Score:** 2/4 truths verified (criteria 1 and 2 hold today, in the codebase, independent of deployment status). Criteria 3 and 4 are blocked on deployment + a human/production re-run — not on missing code.

### Requirement Traceability — WOW-01

`.planning/REQUIREMENTS.md` line 21 defines WOW-01: "Besucher erlebt EINEN Signature-3D/WebGL-Moment im Hero, konzeptionell an Lasses Identität gebunden — lazy-loaded, capability-gated, nie im Initial-Bundle." Line 86 marks it `Complete` under Phase 4.

**Cross-check:** WOW-01's own wording (lazy-loaded, capability-gated, never-in-initial-bundle, identity-bound) maps 1:1 onto ROADMAP criteria 1 and 2, both ✓ VERIFIED above with independent live test evidence. **The REQUIREMENTS.md "Complete" marking is accurate for WOW-01's own text.** It does not, however, cover ROADMAP criteria 3/4 (production CWV + external-tester launch verification), which are separate phase-level success criteria layered on top of WOW-01 by the ROADMAP phase goal, tracked via 04-05's `requirements: [WOW-01, TECH-01, MODE-01, MODE-02]` frontmatter. Those remain open per the human-verification items below — the phase goal as a whole is not yet fully closeable even though the WOW-01 requirement text itself is satisfied.

No orphaned requirements found for this phase (TECH-01/MODE-01/MODE-02 are cross-referenced by 04-05 but owned/dated in earlier phases per REQUIREMENTS.md's table; 04-05 only adds the 3D-active production re-verification obligation for them, captured above).

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/capability.ts` | `decideSceneTier()` pure async gate pipeline | ✓ VERIFIED | Full pipeline present: off-override, reduced-motion (unconditional), force-override, saveData, deviceMemory, WebGL2 caveat probe, detect-gpu tier — matches 04-03 must_haves exactly |
| `src/components/scene/hero-scene-gate.tsx` | client gate: reduced-motion snapshot, idle mount, `next/dynamic` ssr:false, error boundary | ✓ VERIFIED | `useSyncExternalStore` for reduced-motion, `requestIdleCallback`/setTimeout fallback, `dynamic(..., {ssr:false})`, `SceneErrorBoundary` class present |
| `src/components/scene/constellation-canvas.tsx` | lazy chunk entry, dpr clamp, `webglcontextlost` fallback | ✓ VERIFIED | `dpr={tier==="mobile" ? [1,1.25] : [1,1.5]}`, `webglcontextlost` listener -> `setLost(true)` -> null render |
| `src/components/scene/constellation.tsx` | scene interior: `useFrame` drift/pulses/pointer | ✓ VERIFIED (existence + wiring confirmed; full frame-loop behavior not independently line-traced beyond passing tests) | present, 21KB, imported by constellation-canvas.tsx |
| `src/components/scene/constellation-data.ts` | D-02 hidden-structure graph, D-08 density mask | ✓ VERIFIED | `buildConstellation()` implements hub/satellite clusters, 30%-density center zone, deterministic seeded PRNG |
| `src/components/scene/scene-bridge.ts` | one-way GSAP->scene bridge | ✓ VERIFIED | imported and read every frame by constellation-canvas.tsx / constellation.tsx (`sceneBridge.scrollProgress`, `.paused`) |
| `src/lib/theme-color-resolver.ts` | CSS token -> THREE.Color + MutationObserver | ✓ VERIFIED | `resolveSceneColors()`, `observeThemeColors()` present, watches `data-theme` attribute + `prefers-color-scheme` |
| `evals/scene.spec.ts` | e2e proof: force/off/reduced-motion/context-loss | ✓ VERIFIED, RE-RUN LIVE | 9/9 tests pass against a freshly built local production server |
| `evals/launch/stopwatch.spec.ts`, `evals/launch/reduced-motion.spec.ts` | D-14 scripted launch checks | ✓ VERIFIED, RE-RUN LIVE | 4/4 pass against local production server; NOT yet run against the real production URL (see human verification) |
| `.planning/phases/04-signature-moment-launch-hardening/04-LAUNCH-EVIDENCE.md` | launch verification evidence document | ✓ VERIFIED | Present, substantive, matches independently-reproduced local test results; honestly documents the local-vs-production gap itself |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `src/app/[locale]/page.tsx` | `hero-scene-gate.tsx` | `<HeroSceneSlot><HeroSceneGate /></HeroSceneSlot>` | ✓ WIRED | Confirmed via grep: both imported and rendered at page.tsx lines 14-15, 101-103 |
| `hero-scene-gate.tsx` | `constellation-canvas.tsx` | `next/dynamic(..., {ssr:false})` | ✓ WIRED | Confirmed in source, line 36-38 |
| `capability.ts` | `public/benchmarks` | `getGPUTier({benchmarksURL: "/benchmarks"})` | ✓ WIRED | Confirmed in source, line 76 |
| `hero-intro.tsx` | `scene-bridge.ts` | `introBeatAt` write on timeline completion | ✓ WIRED (existence confirmed; not independently re-traced line-by-line beyond passing evals/scene.spec.ts's exit-pause test which depends on the same bridge object) | `sceneBridge` imported in constellation-canvas.tsx |
| `evals/launch/*.spec.ts` | production URL | `LAUNCH_URL` env-driven baseURL | ✓ WIRED in tooling, ✗ NOT YET EXERCISED against real production | `playwright.config.ts` correctly reads `LAUNCH_URL ?? "https://lsiem.de"` for the `launch` project — the mechanism is correct, but every run to date (04-05's and this verification's) used `LAUNCH_URL=http://localhost:3000` |

### Behavioral Spot-Checks (independently re-run, not trusted from SUMMARY)

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| WebGL context-loss silently unmounts canvas | `npx playwright test evals/scene.spec.ts -g "webglcontextlost unmounts the canvas with no error surfaced" --project=chromium` (against local `pnpm start`) | 1 passed | ✓ PASS |
| Full scene delivery-contract suite | `npx playwright test evals/scene.spec.ts --project=chromium` | 9 passed | ✓ PASS |
| 30s stopwatch + reduced-motion walkthrough | `LAUNCH_URL=http://localhost:3000 LAUNCH_ONLY=1 npx playwright test --project=launch` | 4 passed | ✓ PASS (local-production proxy only) |
| Three.js excluded from initial bundle | fetched built `/de` HTML, extracted the 10 referenced initial chunks, grepped each for `three`/`@react-three`/`detect-gpu` in `.next/static/chunks/` | 0 matches in initial chunks; found in a separate ~893KB chunk not referenced by the initial page | ✓ PASS |
| LCP assertion severity matches D-11 exception claim | `grep "largest-contentful-paint" lighthouserc.json lighthouserc.webgl.json` | both `"warn"`, not `"error"` | ✓ CONFIRMED (matches the documented, user-approved exception — not a silent regression) |

### Anti-Patterns Found

None. Searched `src/components/scene/`, `src/lib/capability.ts`, `src/lib/theme-color-resolver.ts`, `src/components/motion/hero-scene-slot.tsx`, `src/components/motion/hero-intro.tsx` for `TODO`/`FIXME`/`XXX`/`TBD`/`HACK`/`PLACEHOLDER`/"not yet implemented"/"coming soon" — zero matches.

### Human Verification Required

See frontmatter `human_verification` for the full items. Summary:

1. **Deploy** the current branch/commit to Vercel (Preview, then Production) so a live URL actually reflects the 04-04 constellation — today no deployed URL does.
2. **Re-run the mobile Lighthouse/CWV audit against production** with `?webgl=force`, and separately obtain a real mid-tier-Android measurement (physical device, WebPageTest, or BrowserStack) — the local proxy run shows LCP failing the 2500ms budget (~2757ms) under a documented, user-approved warn-level exception (D-11); production is the calibrated decision point per D-11/D-12 and may pass or may require revisiting the `display: optional` escalation.
3. **Re-run `pnpm test:launch` against `https://lsiem.de`** (not localhost) and have at least one actual external tester manually perform the 30-second stopwatch test and the reduced-motion walkthrough by hand, since ROADMAP criterion 4 explicitly requires external human testers on production, not a scripted agent run against a local build.

### Gaps Summary

No code gaps. All artifacts for WOW-01's own delivery (lazy load, capability gate, silent fallback, identity-bound constellation) exist, are substantive, are wired end-to-end, and — critically — were independently re-run live against a fresh local production build during this verification (not just trusted from SUMMARY.md), passing 9/9 scene tests and 4/4 launch tests. The gap is entirely in **deployment and production-scoped verification**: ROADMAP success criteria 3 and 4 are worded around the production URL and external human testers respectively, and neither has happened yet. This is accurately and honestly documented in the phase's own 04-LAUNCH-EVIDENCE.md, which this verification corroborates rather than contradicts. `.planning/REQUIREMENTS.md`'s "Complete" mark for WOW-01 is defensible on WOW-01's own text, but the phase-level ROADMAP goal (which layers production launch verification on top) should not be considered fully closed until the three human-verification items above are done.

---

_Verified: 2026-07-11_
_Verifier: Claude (gsd-verifier)_
