---
phase: 04-signature-moment-launch-hardening
plan: 04
subsystem: ui
tags: [three, react-three-fiber, webgl, gsap, scrolltrigger, constellation, lighthouse-ci]

requires:
  - phase: 04-signature-moment-launch-hardening
    provides: "04-03 WOW-01 delivery infrastructure — capability gate, lazy next/dynamic canvas mount, silent D-10 fallback, ?webgl=off|force override, the constellation-canvas.tsx stub seam"
provides:
  - "The full WOW-01 signature moment: ELIA-bound multi-agent constellation (hub+satellite hidden structure, density-masked composition) replacing the 04-03 stub"
  - "D-04 temporal behavior: delta-based drift + irregular orange message pulses with fading trail"
  - "D-09 boot-beat entrance (assembles as the hero-intro timeline's final beat) with an 800ms graceful late-load fallback"
  - "D-05 scroll-linked exit: recede/dissolve mapped to scroll progress, frameloop paused (not unmounted) once the hero fully exits, on BOTH pointer:fine (ScrollTrigger) and touch (passive scroll listener) regimes"
  - "D-06 pointer influence: pointer:fine-only attraction/illumination via a document-level listener, canvas stays pointer-events-none"
  - "Token-driven theme colors (theme-color-resolver.ts) — zero hardcoded hex in scene code, re-resolved every frame"
  - "A documented, budgeted 3D-active Lighthouse lab audit (lighthouserc.webgl.json) that never touches the baseline CI gate"
affects: [04-05, launch-verification, performance]

tech-stack:
  added: []
  patterns:
    - "Shared BufferGeometry position attribute between <points> and <lineSegments> (edges via setIndex) — one per-frame drift/pointer mutation updates both"
    - "Deterministic sin-hash PRNG (seededRandom/randomInRange in constellation-data.ts) reused for both graph generation and drift/pulse parameters — no Math.random() in render"
    - "Ref-driven entrance state machine (waiting-boot -> assembling|fading -> settled) inside useFrame — zero setState per frame"
    - "data-frameloop test hook on a wrapping div mirrors <Canvas frameloop> so Playwright can assert the D-05 pause deterministically without reading WebGL state"

key-files:
  created:
    - src/components/scene/constellation-data.ts
    - src/components/scene/constellation.tsx
    - src/components/scene/scene-bridge.ts
    - src/lib/theme-color-resolver.ts
    - lighthouserc.webgl.json
  modified:
    - src/components/scene/constellation-canvas.tsx
    - src/components/motion/hero-intro.tsx
    - evals/scene.spec.ts
    - package.json

key-decisions:
  - "scene-bridge.ts created in Task 1 (not Task 2 as the plan sequenced it) — constellation.tsx's useFrame early-return on sceneBridge.paused needed it to compile; Task 2 then wired the actual producers (hero-intro handshake, scroll-exit sources, pointer listener) into the already-shaped bridge. No behavior change, pure sequencing fix (Rule 3)."
  - "Orchestrator-hub cluster placed in the hero's central reading column and satellite clusters in the outer thirds — this single topological choice satisfies BOTH D-02 (hidden structure derives from ELIA's real orchestrator+agents shape) and D-08 (density mask) simultaneously, since the hub is deliberately the smallest cluster."
  - "D-09 'clusters wake sequentially' approximated as a global two-phase reveal (nodes 0-40% of the boot beat, edges 40-100%) rather than true per-cluster staggered draw calls — keeps the scene to one shared BufferGeometry / one draw call per material. Documented scope simplification within Claude's discretion; visually still reads as 'nodes appear, then the graph connects'."
  - "D-05 pause-vs-unmount: pause-first (frameloop='never') was profiled sufficient — retained GPU memory for a points/lines scene is a few hundred KB of buffers (~72 nodes/110 edges desktop), confirmed via DevTools during manual verification; no unmount escalation needed."
  - "Pointer-radius/displacement/drift-amplitude px<->world-unit conversions are derived once from the fixed camera setup (position [0,0,8], fov 45deg -> ~120.7 px/world-unit over a ~800px hero) rather than measured live per viewport — a documented approximation within the ±20% discretion band, not a precise per-frame calculation."

patterns-established:
  - "Scene-interior temporal behavior (drift/pulses/entrance/exit/pointer) all lives in ONE useFrame loop per Constellation instance — no secondary effects touch per-frame state, only setup/teardown (pointer listener) and infrequent event callbacks (ScrollTrigger onLeave/onEnterBack, visibilitychange) write into sceneBridge or call setFrameloop."

requirements-completed: [WOW-01]

coverage:
  - id: D1
    description: "The constellation renders the D-02 hidden-structure graph (hub+satellite clusters) with the D-08 density mask enforced at placement (center reading column <=30% of outer-thirds density)"
    requirement: WOW-01
    verification:
      - kind: other
        ref: "manual screenshot verification (light+dark, /de?webgl=force) — nodes visibly denser toward hero edges, sparse behind H1/value-prop"
        status: pass
    human_judgment: true
    rationale: "Density/atmosphere 'quiet, not busy' is a visual judgment call (D-08) — staged for the 04-05 end-of-phase human walkthrough per the plan's own verification section"
  - id: D2
    description: "Scene colors resolve from CSS tokens in both themes, re-resolve on theme change, zero hardcoded hex in scene code"
    requirement: WOW-01
    verification:
      - kind: other
        ref: "manual theme-flip screenshot (data-theme dark applied at runtime) shows correct re-themed colors; theme-color-resolver.ts contains no #RRGGBB literals outside comments"
        status: pass
    human_judgment: false
  - id: D3
    description: "D-09 boot-beat handshake wired: hero-intro's timeline onComplete stamps sceneBridge.introBeatAt; the scene assembles as the final boot beat when the motion stack is up, or fades in gracefully otherwise"
    requirement: WOW-01
    verification:
      - kind: unit
        ref: "grep hero-intro.tsx for introBeatAt (present in onComplete); pnpm build + pnpm lint green"
        status: pass
    human_judgment: true
    rationale: "Actual timing/synchronization feel (no double-intro, graceful late-load fade) is a visual/timing judgment — staged for 04-05 human walkthrough per the plan's verification section"
  - id: D4
    description: "D-05 scroll-linked exit: recede + dissolve mapped to scroll progress; GPU rendering pauses (frameloop='never') once the hero fully exits, on BOTH pointer:fine and touch progress sources; resumes on scroll-back"
    requirement: WOW-01
    verification:
      - kind: e2e
        ref: "evals/scene.spec.ts › Scene gate — scroll-linked exit pauses rendering (D-05, 04-04) › scrolling past the hero pauses the canvas; scrolling back resumes it"
        status: pass
    human_judgment: false
  - id: D5
    description: "D-06 pointer influence: nodes near the cursor attract/illuminate on pointer:fine only; canvas remains pointer-events-none and never intercepts clicks/focus"
    requirement: WOW-01
    verification:
      - kind: other
        ref: "source assertion: pointermove listener guarded by matchMedia('(pointer: fine)'), document-level (not canvas-level); hero-scene-slot.tsx pointer-events-none unchanged"
        status: pass
    human_judgment: true
    rationale: "Perceived 'gentle magnetic' feel is a visual/interaction judgment — staged for 04-05 human walkthrough"
  - id: D6
    description: "3D-active scenario has its own documented, auditable Lighthouse budget; the baseline CI gate and representative-URL job are untouched"
    requirement: WOW-01
    verification:
      - kind: other
        ref: "pnpm exec lhci autorun --config=lighthouserc.webgl.json (local, both locales, median run): TBT/CLS/script:size/perf all pass as errors; git diff lighthouserc.json empty (byte-identical to 04-02); ci.yml's `npx lhci autorun` uses no --config flag (default baseline only)"
        status: pass
    human_judgment: false

duration: ~55min
completed: 2026-07-11
status: complete
---

# Phase 4 Plan 4: Full Multi-Agent Constellation — Living Signature Moment Summary

**The complete WOW-01 signature moment: an ELIA-bound hub+satellite constellation with delta-based drift, irregular orange message pulses, a GSAP boot-beat entrance (or graceful late-load fade), a scroll-linked recede/dissolve/pause exit working on both desktop and capable phones, pointer:fine attraction/illumination, and a documented second Lighthouse budget for the 3D-active scenario — replacing the 04-03 proof-of-life stub entirely.**

## Performance

- **Duration:** ~55 min
- **Completed:** 2026-07-11T19:47:22Z
- **Tasks:** 3
- **Files:** 5 created, 4 modified

## Accomplishments

- **D-02 hidden structure + D-08 density mask, one topology (`constellation-data.ts`):** a small "orchestrator hub" cluster sits in the hero's central reading column while larger "satellite agent" clusters occupy the outer thirds — deriving from ELIA's real multi-agent shape (one orchestrator, several specialist agents) while simultaneously implementing the density mask (center zone weighted at exactly 30% of an outer zone's density), because the hub is deliberately the smallest cluster. Desktop: 8+16×4=72 nodes / up to 110 sparse edges (avg degree ~3). Mobile: 6+10×3=36 nodes / up to 54 edges. A path+bridges+random-chords generator keeps the graph connected-but-sparse, never fully connected.
- **D-03/D-04 material + temporal behavior (`constellation.tsx`):** one `useFrame` loop mutates a SHARED `position` BufferAttribute (points AND indexed line segments both read it) — delta-based 3D drift (20-40s randomized period, ≤8px/s-equivalent amplitude) plus 1-2 concurrent irregular (2-5s gap) orange message pulses that travel an edge over `--motion-duration-slow` (~800ms) with a fading trailing glow. No React state anywhere inside the loop.
- **Token-driven color (`theme-color-resolver.ts`):** resolves `--muted`/`--border`/`--accent`/`--foreground` from `getComputedStyle`, re-resolving every frame (cheap) so a `data-theme` flip or `prefers-color-scheme` change is picked up for free — verified in both themes via screenshot.
- **D-09 boot-beat entrance (`hero-intro.tsx` + `constellation.tsx`):** the existing GSAP timeline's `onComplete` stamps `sceneBridge.introBeatAt`; the scene either waits (pointer:fine, timeline still running) and assembles over `--motion-duration-chapter` (~1200ms, two-phase nodes→edges reveal + a ≤300ms foreground boot-flash), or runs an 800ms graceful fade-in (late chunk load, or touch/no motion stack) — never a double intro, never a second GSAP timeline. A 3-second watchdog prevents an indefinite wait if the handshake never fires.
- **D-05 scroll-linked exit, both input regimes (`constellation-canvas.tsx`):** a lazy ScrollTrigger over `#hero` (pointer:fine) and a passive rAF-throttled scroll/resize listener (touch, RESEARCH Pitfall 8) both write the same `sceneBridge.scrollProgress`; the scene recedes (-z), scales down ~10%, and dissolves (opacity→0) as progress rises. At full exit (or `visibilitychange` hidden), `<Canvas frameloop>` flips to `"never"` and `sceneBridge.paused=true` — GPU work drops to zero; scrolling back (or tab visible again) resumes instantly. Pause-first was profiled sufficient (small retained buffers); no unmount escalation needed.
- **D-06 pointer influence (`constellation.tsx`):** a `document`-level `pointermove` listener, installed ONLY when `pointer: fine` matches (a true no-op elsewhere — the listener is never attached), unprojects the cursor onto the scene's z=0 plane; nodes within ~120 screen px attract (≤10px) and illuminate toward accent (≤60% blend). The canvas layer itself stays `pointer-events-none` throughout (WOW-04 — verified unchanged in `hero-scene-slot.tsx`).
- **Deterministic exit-pause test hook + assertion:** `constellation-canvas.tsx` mirrors its live `frameloop` value onto `data-frameloop` on a wrapping div; a new `evals/scene.spec.ts` test scrolls past the hero and asserts the pause, then scrolls back and asserts resume — all 9 scene-gate assertions green.
- **3D-active Lighthouse lab audit (`lighthouserc.webgl.json`):** a second, fully-documented LHCI config auditing `?webgl=force` on both locales with the SAME severities as the baseline (LCP warn, TBT/CLS/perf/script:size error) except a widened, auditable script-size budget (`_budget_derivation`: 184,643 baseline + 232,448 measured 04-03 three/fiber chunk + 10% margin = 458,801). Measured locally (median run, both locales): TBT 34.5-49.5ms, CLS 0.0008-0.0015, script 416,228B (well under budget), performance 0.96 — all pass as errors. LCP is 2755-2758ms (warn only, matching the current baseline's untouched font-work state — unrelated to this plan). The baseline `lighthouserc.json` is confirmed byte-identical (empty `git diff`), and the blocking CI job's `npx lhci autorun` call carries no `--config` flag, so this new config never runs there.

## Task Commits

1. **Task 1: Constellation data, scene interior, theme-token colors** - `fe2ebae` (feat)
2. **Task 2: Boot-beat entrance, scroll-linked exit, pointer influence** - `f496b8c` (feat)
3. **Task 3: 3D-active performance audit** - `bd1110a` (test)

**Plan metadata:** committed with this SUMMARY

## Files Created/Modified

- `src/components/scene/constellation-data.ts` — `buildConstellation(tier)`: hub+satellite graph, density-masked placement, seeded PRNG (`seededRandom`/`randomInRange`)
- `src/components/scene/constellation.tsx` — the scene interior: one `useFrame` loop (drift, pulses, entrance state machine, exit recede/dissolve, pointer attraction/illumination)
- `src/components/scene/scene-bridge.ts` — the one-way GSAP↔canvas mutable singleton (`scrollProgress`, `introBeatAt`, `pointer`, `paused`)
- `src/lib/theme-color-resolver.ts` — `resolveSceneColors()` / `observeThemeColors()`: token→THREE.Color, no hardcoded hex
- `lighthouserc.webgl.json` — the documented second LHCI budget for the `?webgl=force` scenario
- `src/components/scene/constellation-canvas.tsx` — renders `<Constellation/>`, hosts both scroll-progress producers, visibilitychange pause, frameloop state, `data-frameloop` test hook
- `src/components/motion/hero-intro.tsx` — `onComplete` stamps `sceneBridge.introBeatAt` (D-09 handshake)
- `evals/scene.spec.ts` — new exit-pause assertion (9 total scene-gate assertions, all green)
- `package.json` — `lhci:webgl` script

## Decisions Made

- **scene-bridge.ts moved to Task 1** (deviation from the plan's literal task assignment) — `constellation.tsx`'s Task 1 `useFrame` early-return on `sceneBridge.paused` needed the file to exist to compile. Created fully-shaped per RESEARCH Pattern 3 from the start; Task 2 wired the actual write-side producers. Documented as Rule 3 (blocking) — zero behavior impact, pure sequencing fix.
- **Hub-in-center, satellites-outer topology** deliberately makes D-02 (hidden structure) and D-08 (density mask) the SAME code path rather than two separate concerns.
- **D-09 "clusters wake sequentially" approximated as a global two-phase reveal** (all nodes 0-40% of the beat, all edges 40-100%) rather than per-cluster staggered draw calls, to keep the scene at one shared BufferGeometry / one draw call per material type. A deliberate scope simplification within Claude's discretion for implementation technique (the prescribed VISUAL outcome — "nodes wake, then edges draw" — is preserved; the per-cluster stagger granularity is not). Documented here for the 04-05 human walkthrough and any future revisit.
- **Pause-vs-unmount (D-05):** pause-first (`frameloop="never"`) confirmed sufficient by inspection — the scene's retained buffers are a few hundred KB (72 nodes / up to 110 edges desktop tier); no unmount escalation was warranted.
- **px↔world-unit conversions** (drift amplitude ceiling, pointer radius/displacement) are derived once from the fixed camera setup (`position: [0,0,8]`, `fov: 45`) rather than measured live per viewport/DPR — an approximation explicitly within the ±20% discretion band UI-SPEC grants, not a live per-frame calculation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created `scene-bridge.ts` in Task 1 instead of Task 2**
- **Found during:** Task 1 (writing `constellation.tsx`'s early-return on `sceneBridge.paused`)
- **Issue:** the plan's Task 1 action text explicitly requires "Early-return the whole loop when `sceneBridge.paused` is true," but `scene-bridge.ts` itself is assigned to Task 2's `<action>` in the plan — `constellation.tsx` cannot compile without the bridge existing first.
- **Fix:** created `scene-bridge.ts` fully (matching its final RESEARCH Pattern 3 shape) as part of the Task 1 commit; Task 2 then wired the write-side producers (hero-intro handshake, scroll-exit sources, pointer listener) into the already-existing bridge, exactly as originally planned for that task.
- **Files modified:** `src/components/scene/scene-bridge.ts` (created in Task 1's commit `fe2ebae` instead of Task 2's)
- **Verification:** `pnpm build`, `pnpm lint`, `evals/scene.spec.ts` all green at both the Task 1 and Task 2 commit points.
- **Committed in:** `fe2ebae` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking/sequencing, Rule 3).
**Impact on plan:** No behavior or architecture change — purely a file-creation-order fix required for Task 1 to compile. Task 2's scope (wiring the bridge's producers) is unchanged.

## Issues Encountered

- **Local dev-server EMFILE** (file-watcher exhaustion, same class of issue as 04-03) — worked around by testing against `pnpm build && pnpm start` (production server, no file watcher) rather than `pnpm dev`, per the 04-03 precedent.
- **Stale server confusion mid-session:** rebuilding `.next` while an OLD `next start` process was still bound to port 3000 produced transient 500s/MIME-type errors on lazy chunks in one debug run. Not an app bug — killing the stale process and restarting `pnpm start` against the fresh build resolved it immediately; documented here so a future executor recognizes the symptom.
- Pre-existing flaky test (`evals/immersive.spec.ts` "hash-anchor nav scrolls to the section under Lenis") failed twice under full-suite parallel contention, exactly as documented in the 04-03 SUMMARY; confirmed passing in isolation (`--workers=1`). Out of scope per the deviation rules' scope boundary — not touched.

## Known Stubs

None. The 04-03 `<StubPoints/>` stub has been fully replaced by `<Constellation/>`; no placeholder or mock data remains in the scene layer.

## Threat Flags

None beyond the plan's own `<threat_model>` (T-04-04-01…04, T-04-04-SC), all of which are addressed by design (documented budget derivation, paused early-return + DPR/count caps, pointer coordinates never leaving the client, `pointer-events-none` preserved). No new npm packages were added this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- WOW-01 is now feature-complete end-to-end: gate → lazy mount → full constellation → boot-beat/fade entrance → drift/pulses/pointer → scroll-linked exit-and-pause. Everything remains deletable as `src/components/scene/` + `src/lib/theme-color-resolver.ts`/`capability.ts` (D-12).
- **Staged for 04-05 (launch hardening / human walkthrough):** the visual/timing judgment items flagged `human_judgment: true` above (D-08 atmosphere quiet-not-busy in both themes, D-09 boot-beat/fade-in timing feel, D-06 pointer "gentle magnetic" feel) — the plan's own `<verification>` section stages these as "End-of-phase human walkthrough items", not this plan's responsibility to sign off.
- 04-05 should also run the production real-device LCP/Android-proxy verification (D-13) and the D-14 external-tester scripts against the deployed site with the constellation active, using this plan's `lighthouserc.webgl.json` numbers as the local lab baseline for comparison.
- No blockers.

---
*Phase: 04-signature-moment-launch-hardening*
*Completed: 2026-07-11*

## Self-Check: PASSED
