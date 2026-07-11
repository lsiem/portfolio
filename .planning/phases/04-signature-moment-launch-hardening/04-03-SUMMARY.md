---
phase: 04-signature-moment-launch-hardening
plan: 03
subsystem: ui
tags: [three, react-three-fiber, detect-gpu, webgl, capability-gate, next-dynamic, playwright, lazy-loading]

requires:
  - phase: 04-signature-moment-launch-hardening
    provides: "04-02 healthy 3D-free baseline + local-production CI gate; the HeroSceneSlot seam and MotionProvider lazy-import discipline from Phase 3"
provides:
  - "WOW-01 delivery infrastructure: capability gate (decideSceneTier), lazy next/dynamic canvas mount, silent D-10 fallback, ?webgl=off|force override"
  - "A live WebGL canvas in the hero background on capable devices (proof-of-life stub), byte-identical Phase-3 hero for everyone else"
  - "Proven bundle isolation: three/fiber never in the initial HTML; A1 chunk-size measurement for 04-04 budget math"
  - "evals/scene.spec.ts — 8 e2e assertions pinning mount / no-mount / reduced-motion / context-loss / no-third-party-fetch"
affects: [04-04, 04-05, performance, launch-verification]

tech-stack:
  added:
    - three@0.185.1
    - "@react-three/fiber@9.6.1"
    - detect-gpu@5.0.70
    - "@types/three (dev)"
  patterns:
    - "Capability gate: client component + next/dynamic ssr:false + async decideSceneTier() behind load+idle, all heavy deps dynamic-imported (never eager)"
    - "detect-gpu benchmarks self-hosted via a prebuild copy step (DSGVO), mirroring the CV-PDF/subset-font gitignored-build-artifact convention"

key-files:
  created:
    - src/lib/capability.ts
    - src/components/scene/hero-scene-gate.tsx
    - src/components/scene/constellation-canvas.tsx
    - scripts/copy-benchmarks.ts
    - evals/scene.spec.ts
  modified:
    - src/components/motion/hero-scene-slot.tsx
    - src/app/[locale]/page.tsx
    - package.json
    - pnpm-lock.yaml
    - .gitignore

key-decisions:
  - "3D delivery is fully gated + lazy: three/fiber (227KB gzip — exceeds the whole 180KB script budget alone) lives in an async-only chunk, proven absent from the /de and /en initial HTML; detect-gpu also dynamic-imported"
  - "?webgl=force skips the caveat probe + tiering so CI SwiftShader can exercise the 3D path; reduced-motion still wins over force (D-10 unconditional)"
  - "Gate composes ONLY reduced-motion from the motion story — capable touch devices are included (D-07, RESEARCH Pitfall 7); pointer-fineness gates the pointer FEATURE (04-04), not the mount"
  - "Silent D-10 fallback everywhere: excluded tier → null, WebGL context loss → unmount, Canvas throw → SceneErrorBoundary → null. No placeholder, spinner, or error ever surfaces"

patterns-established:
  - "Scene files live under src/components/scene/ + src/lib/capability.ts — the whole 3D layer is deletable as one unit (streichbar)"
  - "useSyncExternalStore for the reduced-motion read (repo hard convention); async tier via useEffect+setState is allowed, synchronous setState-in-effect is not (React-Compiler lint)"

requirements-completed: [WOW-01]

coverage:
  - id: D1
    description: "?webgl=force mounts a hero WebGL canvas after first paint without displacing hero text (WOW-01 first visible slice)"
    requirement: WOW-01
    verification:
      - kind: e2e
        ref: "evals/scene.spec.ts › ?webgl=force mounts a hero canvas (de+en)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Excluded visitors (reduced-motion / ?webgl=off / software GL) get the byte-identical Phase-3 hero — zero canvas, placeholder, or message (D-10)"
    requirement: WOW-01
    verification:
      - kind: e2e
        ref: "evals/scene.spec.ts › ?webgl=off never mounts; reduced-motion wins over force (de+en)"
        status: pass
    human_judgment: false
  - id: D3
    description: "WebGL context loss / Canvas failure silently unmounts to the Phase-3 hero, no error/dialog surfaced (D-10, success criterion 2)"
    requirement: WOW-01
    verification:
      - kind: e2e
        ref: "evals/scene.spec.ts › webglcontextlost unmounts the canvas with no error surfaced"
        status: pass
    human_judgment: false
  - id: D4
    description: "three/fiber never in the initial bundle: async-only chunk absent from /de + /en prerendered HTML; no third-party (unpkg) fetch on a forced run"
    requirement: WOW-01
    verification:
      - kind: other
        ref: "grep three chunk 1hgq14h7kmdzg.js absent from .next/server/app/{de,en}.html; scene.spec.ts no-cross-origin assertion"
        status: pass
    human_judgment: false
  - id: D5
    description: "CI budget stays green with the scene merged (gate closed on SwiftShader, no 3D chunk in the LHCI trace) — A2"
    requirement: WOW-01
    verification:
      - kind: other
        ref: "local lhci autorun: script:size 183237<184643, perf 0.96, TBT 1ms, CLS 0.0008; three chunk NONE in trace"
        status: pass
    human_judgment: false
  - id: D6
    description: "On a real capable desktop, faint points appear in the hero shortly after load; with OS reduced-motion the hero is exactly Phase-3 (no canvas)"
    requirement: WOW-01
    verification: []
    human_judgment: true
    rationale: "Real-GPU visual confirmation (points visible, correct timing/opacity) is a judgment check — CI runs SwiftShader; staged for the end-of-phase human walkthrough (04-05)"

duration: ~90min
completed: 2026-07-11
status: complete
---

# Phase 04 Plan 03: WOW-01 Delivery Infrastructure Summary

**Capability-gated, lazily-mounted WebGL hero canvas (three + @react-three/fiber behind next/dynamic ssr:false), with a deterministic ?webgl=off|force override and a silent D-10 fallback — a live proof-of-life scene on capable devices, byte-identical Phase-3 hero for everyone else, and the 227KB-gzip 3D chunk proven never in the initial bundle**

## Performance

- **Duration:** ~90 min (TDD: red spec → gate/canvas → bundle-isolation proof)
- **Completed:** 2026-07-11T18:53:45Z
- **Tasks:** 3
- **Files:** 5 created, 5 modified

## Accomplishments

- **The gate (D-07):** `decideSceneTier()` — a pure async pipeline resolving `none|mobile|desktop` from `?webgl` override → reduced-motion → saveData → deviceMemory → `failIfMajorPerformanceCaveat` webgl2 probe → detect-gpu tier. Capable phones included; software GL (SwiftShader) deterministically excluded.
- **Lazy mount (WOW-01):** `HeroSceneGate` (client) mounts `dynamic(() => import("./constellation-canvas"), { ssr: false })` after `load`+idle. three/@react-three/fiber and detect-gpu are dynamic-imported only — never static.
- **Silent fallback (D-10):** excluded tier → `null`; `webglcontextlost` → unmount; Canvas throw → `SceneErrorBoundary` → `null`. No placeholder/spinner/error, ever.
- **Proof-of-life scene:** 48 deterministic faint points in the theme `--muted` colour — a STUB marked for replacement by 04-04's full constellation.
- **Bundle isolation proven (A1):** the three/fiber chunk `1hgq14h7kmdzg.js` = **863 KB raw / 227 KB gzip** — larger than the entire 184,643-byte script budget on its own — and is **absent from the /de and /en prerendered initial HTML**.
- **Budget neutral (A2):** local LHCI with the scene merged stays green — script:size **183,237** (< 184,643), perf **0.96**, TBT **1 ms**, CLS **0.0008**, LCP ~2755 ms (warn, per 04-01). The gate stays closed on SwiftShader, so **no 3D chunk appears in the LHCI trace**.
- **DSGVO:** a forced 3D run issues **zero cross-origin requests** — detect-gpu benchmarks are self-hosted at `/benchmarks` (copied by `scripts/copy-benchmarks.ts` in prebuild; `public/benchmarks/` gitignored).
- **Tests:** all **8** `evals/scene.spec.ts` assertions green; full eval suite (149 tests) passes bar the pre-existing parallel-contention Lenis anchor flake (passes in isolation; CI uses `workers:1`+retries).

## Task Commits

1. **Task 1 (RED): failing gate-contract spec** — `12ac537` (test)
2. **Task 2 (GREEN): capability gate + lazy canvas + fallback** — `de0bcc5` (feat)
3. **Task 3: no-third-party network assertion + isolation proof** — `ea4a6e2` (test)

**Plan metadata:** committed with this SUMMARY

## Files Created/Modified

- `src/lib/capability.ts` — pure `decideSceneTier()` pipeline (browser-only, ?webgl override, detect-gpu dynamic import)
- `src/components/scene/hero-scene-gate.tsx` — client gate: useSyncExternalStore reduced-motion, load+idle kickoff, next/dynamic ssr:false, SceneErrorBoundary
- `src/components/scene/constellation-canvas.tsx` — lazy chunk entry: Canvas config + context-loss unmount + StubPoints (04-04 replaces)
- `scripts/copy-benchmarks.ts` — prebuild copy of detect-gpu benchmarks into public/
- `evals/scene.spec.ts` — 8 e2e assertions
- `src/components/motion/hero-scene-slot.tsx` — now renders children (still a Server Component)
- `src/app/[locale]/page.tsx` — passes `<HeroSceneGate />` into the slot
- `package.json` / `pnpm-lock.yaml` — deps + `copy:benchmarks` prebuild step; `.gitignore` — `public/benchmarks/`

## Decisions Made

- **force skips caveat probe + tiering** (deliberate deviation from RESEARCH Code Example 1 ordering) so smoke tests exercise the 3D path on CI SwiftShader (Pattern 8 / Pitfall 3b). reduced-motion is checked BEFORE force so D-10 stays unconditional.
- **No drei** (RESEARCH): the stub (and 04-04's constellation) need only raw three primitives — keeps the lazy chunk smaller.
- Stub scene uses a deterministic pseudo-random scatter (pure `Math.sin` hash) — the React-Compiler purity lint forbids `Math.random()` in render.

## Deviations from Plan

**[Test-harness fix, not a behavior change]** Two `evals/scene.spec.ts` refinements during Task 2's GREEN step: (1) the context-loss dispatch is retried via `expect.poll` because the canvas DOM element exists before R3F's `onCreated` attaches the `webglcontextlost` listener (a dispatch timing race, not an app bug — verified the unmount works); (2) the "no error surfaced" check compares alert/status live-region text before/after instead of a DOM-wide text regex, which false-positived on Next.js RSC payload `<script>` tags and the always-present empty route announcer. Assertion intent unchanged.

**Total deviations:** 1 (test-harness robustness). **Impact:** none on app behavior.

## Issues Encountered

- pnpm store location had moved (`~/Library/pnpm/store` → `~/.local/share/pnpm`); installed with `--store-dir` pointing at the existing store to avoid a full reinstall.
- Dev-server EMFILE (file-watcher exhaustion) from orphaned `playwright-mcp` processes left by the earlier MCP disconnect; killed them and ran tests against `next start` (reuseExistingServer).
- **Budget headroom is now tight: ~1.4KB** (gate client code adds ~5.5KB eager vs 04-02's 177,680). 04-04 must avoid adding eager weight — its constellation code must stay inside the lazy chunk.

## Next Phase Readiness

- The delivery contract (lazy, capability-gated, never-in-initial-bundle, silent fallback) is landed and proven — 04-04 replaces `<StubPoints/>` with the full constellation (data graph, drift, orange pulses, pointer influence, boot entrance, scroll-linked exit) INSIDE this chunk, using the A1 size (227KB gzip) as its second-budget baseline.
- Watch the ~1.4KB eager-budget headroom in 04-04.
- 04-05 human-check: real-GPU visual confirmation of the scene (deferred — CI is SwiftShader).

---
*Phase: 04-signature-moment-launch-hardening*
*Completed: 2026-07-11*
