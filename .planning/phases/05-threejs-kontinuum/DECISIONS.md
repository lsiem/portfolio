# Phase 05 — Kontinuum Decision Log

Named deliverable per DESIGN-SPEC §7 "Consciously rewritten": the Phase-04
decisions D-05/D-07/D-08/D-10 migrate to the persistent-stage architecture
(layout-level gate, `frameloop="demand"`, at-rest invariant). This document
records each migration explicitly — same phase as the code, so eval changes
are decisions, not drift. Every entry names the eval that pins it.

Phase-04 originals: `.planning/phases/04-signature-moment-launch-hardening/04-CONTEXT.md`.

---

## D-05 (scroll behavior) — SUPERSEDED by the at-rest invariant

**Was (Phase 04):** scroll-linked exit — the constellation recedes/dissolves as
the hero leaves the viewport; after exit the canvas pauses
(`frameloop="never"`, 04-04: pause profiled sufficient over unmount) — the
rest of the visit is 3D-free. Pinned by the scene.spec.ts describe
"scroll-linked exit pauses rendering (D-05, 04-04)".

**Now (Phase 05):** the field is the site's persistent actor across the full
scroll (DESIGN-SPEC §3), so there is no binary run/pause state to flip
mid-scroll. `frameloop="demand"` with exhaustively enumerated invalidation
sources (§6.3) replaces the pause: rendering costs zero frames whenever
nothing animates, anywhere on the page — a strictly stronger idleness
guarantee than the hero-exit pause, at the honest cost of scroll-time frames
across the whole page (§6.3 ladder + mobile no-GSAP producer + real-device
UAT compensate).

**Equally falsifiable replacement (§7 R1–R3, `evals/stage-perf.spec.ts`):**
- **R1** — under `?webgl=force`, mid-page (#skills), after 1500 ms with no
  input, `data-scene-frames` is EQUAL across a 1000 ms window (zero frames at
  rest; a single frame is a demand-loop leak).
- **R2** — with #hero in view, the counter increments (the
  IntersectionObserver-gated ambient producer keeps the field alive — the
  pause never over-fires).
- **R3** — `data-frameloop="never"` only while the tab is hidden; "demand"
  restores on visibility. ("never" is now exclusively the hidden-tab state,
  not a scroll state.)

The old "scroll past hero pauses canvas" describe is deleted from
`evals/scene.spec.ts` (header there cross-references this file).

## D-07 (capability, not form factor) — UNCHANGED semantics, mount point moved

The gate still decides by measured capability: `decideSceneTier()` in
`src/lib/capability.ts` is untouched (`?webgl=off/force`, reduced-motion
precedence, saveData, deviceMemory, webgl2 caveat probe, detect-gpu with
self-hosted `/benchmarks`, and all seven `sceneTierFromGpu` contract cases
including the PR #21 FALLBACK/software-renderer rule). What moved is WHERE
the single decision runs: `StageGate` at layout level (StageSlot) instead of
the in-hero `HeroSceneGate`, so one decision now gates every route.

**Pinned by:** the unchanged GPU-tier contract block in `evals/scene.spec.ts`,
the new per-route gating describe (case-study + legal routes), and the new
zero-canvas-before-idle-decision spec — a structural guard that the mount
stays strictly post-load+idle (the "one review away from ungated" hazard
that produced the d9b8e57 revert).

## D-08 (atmospheric prominence) — UNCHANGED, generalized site-wide

Headline/value-prop remain the unambiguous focal point; the field is
additive atmosphere. Generalization: the canvas is now fixed,
full-viewport, `-z-10`, `pointer-events-none`, BEHIND the DOM on every
route — it can never displace or intercept content anywhere, not just in the
hero. The proven one-way `scene-bridge` write surface (04-04) extends to the
full `StageBridge` contract (DESIGN-SPEC §5.1); `invalidate` defaults to a
module-level no-op, so producer writes are dead letters for excluded
visitors and no setState exists on any scroll path.

**Pinned by:** `evals/scene.spec.ts` hero-text-never-displaced assertions
(before AND after mount) plus the `#hero canvas` count-0 assertion (the
canvas lives at layout level, never inside the hero).

## D-10 (fallback: nothing missing) — UNCHANGED, broadened to every route class

Excluded visitors (tier "none", `?webgl=off`, reduced motion, context loss,
chunk failure) still get the complete DOM site with no substitute artwork,
no placeholder, no error surface. Broadened: the guarantee is now asserted
per route class — the reduced-motion walkthrough covers home sections AND a
case-study route AND a legal route, both locales
(`evals/launch/reduced-motion.spec.ts`).

One conscious in-family change: `webglcontextlost` is now
`preventDefault()`ed before the silent gate unmount (DESIGN-SPEC §2.1) —
04-RESEARCH said don't preventDefault (to decline manual restore), but with
a layout-persistent canvas the default restore path could resurrect a
context the gate already abandoned; unmounting IS the restore policy. The
visitor-visible outcome is identical: DOM remains, nothing surfaces.

**Pinned by:** `evals/scene.spec.ts` context-loss describe (canvas unmounts,
no dialog, no new live-region text) and the reduced-motion specs above.

---

## Eval migration map (§7)

| Phase-04 spec | Phase-05 status |
|---|---|
| scene.spec.ts "hero canvas mounts under force" | Rewritten: layout-level single canvas + Contract-3 `data-frameloop="demand"` hook |
| scene.spec.ts "scroll past hero pauses canvas" (D-05) | **Superseded** → stage-perf.spec.ts R1–R3 (this log, D-05 entry) |
| scene.spec.ts `?webgl=off` / reduced-motion / zero-cross-origin / context-loss / 7-case tier contract | Unchanged semantics, ported |
| — (new) | scene.spec.ts per-route gating (case-study "halo", legal "rest") |
| — (new) | scene.spec.ts zero-canvas-before-idle-decision (MutationObserver readyState probe) |
| — (new) | stage-perf.spec.ts long-task scroll smoke (PerformanceObserver, budget 200 ms, blocking local pre-merge discipline) |
| launch/reduced-motion.spec.ts home walkthrough | Extended: + case-study + legal routes per locale |
| lighthouserc.webgl.json script-size budget | TODO marker added (`_kontinuum_rebaseline`) — integration measures the Wave-2 chunk and re-baselines to measured + 10% (D-11: lab audit, not a merge gate) |
