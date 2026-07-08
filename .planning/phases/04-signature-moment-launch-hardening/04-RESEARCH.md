# Phase 4: Signature Moment & Launch Hardening - Research

**Researched:** 2026-07-08
**Domain:** React Three Fiber points/lines scene in a Next.js 16 SSG app + capability gating + production CWV launch verification
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Scene Concept (WOW-01 — the creative anchor)**
- **D-01 (Concept):** **Multi-agent constellation** — a living node graph: agents/nodes connected by signal lines, quietly orchestrated. Conceptually bound to Lasse's *present* identity: Product Owner of ELIA, a multi-agent, MCP-based AI assistant. Reads as "systems that think together" and speaks the locked engineered/grid/signal-color language.
- **D-02 (Meaning):** **Abstract with hidden structure** — the graph's shape subtly derives from something real (e.g. the career graph or ELIA's agent topology), but carries **no labels, no legend**. Insiders might notice; everyone else sees a beautiful living system. Keeps the hero clean; avoids i18n in 3D.
- **D-03 (Material language):** **Precise points + hairlines** — small crisp dots, thin exact lines, occasional orange pulse traveling an edge; technical-drawing precision. Matches the engineered/tick/coordinate art direction, stays quiet behind text, and is the cheapest material to render (points/lines, no bloom/postprocessing required).
- **D-04 (Temporal behavior):** **Drift + message pulses** — nodes drift slowly in 3D; at irregular intervals an orange pulse travels along an edge like a message between agents. Event-driven activity IS the multi-agent metaphor. Not busy, never distracting.

**Scroll & Interaction**
- **D-05 (Scroll behavior):** **Scroll-linked exit** — the constellation subtly parallaxes/recedes with scroll progress and dissolves as the hero leaves the viewport (the roadmap's "Scroll-Bridge", via the existing GSAP ScrollTrigger infrastructure). After exit the canvas **unmounts/pauses to free the GPU** — the rest of the visit is 3D-free.
- **D-06 (Pointer):** **Subtle pointer influence** — nodes near the cursor gently attract/illuminate; same "magnetic" language as the Phase-3 buttons. **Pointer-only, no-op on touch/keyboard** (consistent with Phase 3 D-11.1).
- **D-07 (Mobile):** **Capable phones included** — the gate decides by **measured capability** (GPU tier, device memory, data-saver, battery signals), not form factor. Flagship phones get a tuned-down constellation (fewer nodes, clamped DPR); mid/low-tier get none. The mobile Lighthouse audit (success criterion 3) must pass WITH the constellation active on capable devices.

**Presence & Intensity**
- **D-08 (Prominence):** **Atmospheric layer** — clearly present and alive, but headline/value-prop remain the unambiguous focal point. Constellation occupies depth behind/around the text: denser toward the edges, sparser behind copy. Wow = noticing the system is real, not spectacle. Protects the 30-second test (WOW-04 discipline).
- **D-09 (Entrance):** **Boot-sequence extension** — the constellation assembles as the **final beat of the existing "system booting" hero intro** (nodes wake and connect cluster by cluster, the grid comes alive). If lazy-load completes after the intro already finished (slow network), it **fades in gracefully instead** — no double intro, no waiting.
- **D-10 (Fallback):** **Phase-3 hero as-is** — visitors without the 3D layer (weak devices, `prefers-reduced-motion`, WebGL failure/context-loss) get the complete engineered hero with **no substitute artwork**. The cleanest proof of "full experience without it": nothing is missing. Zero extra assets, zero extra LCP surface.

**Launch Verification & Hardening**
- **D-11 (LCP = hard gate, optimize to green):** Phase 4 includes **explicit LCP optimization work** (hero render path, font loading, priority hints — research decides the levers). Launch check requires **LCP ≤ 2500ms on production mobile WITH the constellation active**, and the CI Lighthouse LCP assertion is **restored from `warn` to `error`** at phase end. This closes the Phase-3 deferral and honors TECH-01's original promise.
- **D-12 (Sequencing — harden first, then 3D):** First get production LCP green on the existing site (restores headroom + the CI error assertion), THEN build the constellation on the healthy baseline and verify it stays green. Clean attribution (any regression = the 3D), and if 3D were ever cut, launch hardening is already complete — matching "architektonisch jederzeit streichbar".
- **D-13 (Android device test — remote/emulated):** No physical mid-tier Android available. Use **Chrome DevTools CPU/GPU throttling + a real-device cloud (WebPageTest/BrowserStack or equivalent)** as the closest proxy for the "real mid-tier Android" criterion, and **document the proxy explicitly** in VERIFICATION.md.
- **D-14 (External testers — agent-assisted panel):** Browser-agent runs (Playwright / Antigravity browser agent) execute the scripted 30-second stopwatch test and the reduced-motion walkthrough on the production URL; the owner spot-checks the runs. The scripts + pass criteria live in the plan; results are recorded as launch verification evidence.

### Claude's Discretion
- Exact constellation geometry (node count per device tier, cluster layout, the "hidden structure" source data), drift speeds, pulse frequency — within D-01…D-04.
- Capability-gate implementation (which signals, thresholds) and device-tier boundaries — within D-07; research flag covers device-tiering.
- The LCP optimization levers (font strategy, preload hints, hero render path) — within D-11's hard target.
- R3F/three integration details: `next/dynamic` chunking, `frameloop` strategy, DPR clamp values, context-loss recovery — per STACK.md guidance + phase research (Draco/KTX2 likely unnecessary for points/lines — no meshes to compress; researcher confirms).
- Whether the scroll-exit unmounts or pauses the canvas (D-05) — whichever profiles better.

### Deferred Ideas (OUT OF SCOPE)
- **Persistent 3D companion** (constellation echo following into the career section / merging with the spine) — explicitly rejected for this phase (D-05 chose scroll-linked exit); a possible v2 evolution.
- **Readable/annotated constellation** (nodes labeled with skills/projects as 3D data-viz) — rejected for hero cleanliness (D-02); could inspire a future standalone "systems map" page.
- **Physical mid-tier Android acquisition** — if a real device becomes available later, re-run the D-13 proxy test on hardware and upgrade the verification evidence.
- **Sound design, terminal easter-egg, AI-chat** — unchanged: out of scope / v2 (REQUIREMENTS Out of Scope).
- **CSP hardening** — unchanged Phase-2 follow-up; the lazy 3D chunk is self-hosted, so a future `script-src 'self'` CSP stays viable.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WOW-01 | Besucher erlebt EINEN Signature-3D/WebGL-Moment im Hero, konzeptionell an Lasses Identität gebunden — lazy-loaded, capability-gated, nie im Initial-Bundle | Standard Stack (three + fiber, no drei, no Draco/KTX2), Architecture Patterns (gate → dynamic mount → scene → GSAP bridge), Pitfalls 1–8, Code Examples 1–6, capability-gate signal matrix, context-loss recovery pattern, Lighthouse budget interaction analysis |
</phase_requirements>

## Project Constraints (from CLAUDE.md / AGENTS.md)

Actionable directives extracted from `./CLAUDE.md` → `AGENTS.md` and `.claude/CLAUDE.md`:

1. **Read `node_modules/next/dist/docs/` before writing Next.js code** — this Next 16 build may differ from training data. (Done for this research: `lazy-loading.md`, `font.md`.)
2. **No runtime third-party calls on the shipped site (DSGVO)** — everything self-hosted. **Directly load-bearing here:** `detect-gpu` fetches its benchmark data from unpkg CDN by default — MUST be self-hosted (see Pitfall 2).
3. **Google Fonts self-hosted via `next/font`** — already the case; any font-strategy change must preserve this.
4. **One harness at a time; Antigravity is build-time only** — D-14 agent-assisted testing runs against the production URL and adds nothing to the shipped site (compliant).
5. **GSD workflow enforcement** — file changes go through GSD commands.
6. **STACK.md rules (embedded in `.claude/CLAUDE.md`):** React pinned `~19.2.0` (fiber peer `>=19 <19.3` — re-verified 2026-07-08, unchanged); `<Canvas frameloop="demand">` where possible; DPR clamp `[1, 1.5]`; 3D behind `next/dynamic` + lazy mount; "Heavy WebGL as LCP element" forbidden; GSAP is the single DOM animation engine.
7. **Web rules (user-global):** compositor-friendly properties only, CWV targets LCP < 2.5s / TBT < 200ms / CLS < 0.1, visual regression at key breakpoints, reduced-motion verification.

## Summary

Phase 4 is two independent workstreams with a locked order (D-12): **(A) launch hardening** — get production LCP ≤ 2500 ms and restore the CI `error` assertion — then **(B) the constellation** — a points/lines R3F scene mounted lazily into the existing `HeroSceneSlot`, gated by measured device capability.

For **(B)**, the stack is already sanctioned and verified: `three@0.185.1` + `@react-three/fiber@9.6.1` (React `~19.2.0` pin still required — fiber peer `>=19 <19.3` re-verified on npm 2026-07-08). Two research-flag questions resolve cleanly: **Draco/KTX2 asset pipeline is confirmed unnecessary** — the constellation is 100% procedural geometry (BufferGeometry positions computed in code, no glTF meshes to Draco-compress, no textures to KTX2-transcode), so the phase ships **zero 3D asset files**. **Device tiering** should use `detect-gpu@5.0.70` (pmndrs, same org as fiber) with its benchmark files **self-hosted under `public/`** — its default loads from unpkg CDN, which violates the project's DSGVO rule. **Context-loss handling** is a plain DOM listener on the canvas (`webglcontextlost` → unmount to the Phase-3 hero per D-10 — no restore attempt needed because the fallback is "nothing missing").

The single biggest planning hazard is not the 3D itself but its **interaction with the CI Lighthouse budget**: the lazy three.js chunk (~150–190 KB gzipped) exceeds the entire `resource-summary:script:size` budget (184,643 bytes) on its own, and `resource-summary` counts *every* script fetched during the trace, not just the eager bundle. In GitHub-Actions CI this resolves itself — headless Chrome renders WebGL via SwiftShader, which the recommended `failIfMajorPerformanceCaveat` + detect-gpu gate correctly classifies as "no 3D" — but the plan must make the gate **deterministically overridable** (URL param) so both scenarios (with/without 3D) are testable on purpose, and must define which scenario each assertion applies to (see Pitfall 1).

For **(A)**, production is the calibrated source of truth (~2.5–2.9 s today). The known cost is the Bricolage H1 font swap re-timing the LCP element (measured +~300 ms locally). The highest-leverage levers, in order: (1) measure the *actual* production LCP element and timing first (Vercel Speed Insights field data + WebPageTest on a real Moto-class Android), (2) switch Bricolage from build-fetched Google variable pipeline to a **hand-subsetted static woff2 via `next/font/local`** (hero H1 glyphs need only a fraction of the latin subset; Next 16's `next/font/google` has no `text` subsetting option — verified in bundled docs), (3) `preload: true` for that now-tiny file, (4) verify `adjustFontFallback` metric matching keeps the swap reflow from re-electing the LCP candidate. `display: 'optional'` is a stronger lever but conflicts with locked D-03 ("H1 always renders in Bricolage") — flag, don't apply.

**Primary recommendation:** Plan three plan-units in D-12 order — (1) LCP hardening + CI assertion restore, (2) capability gate + lazy canvas infrastructure with deterministic override, (3) constellation scene + boot-beat/scroll-bridge + launch verification suite — and treat the Lighthouse script-budget interaction as a first-class design constraint, not an afterthought.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Constellation rendering (points/lines/pulses) | Browser / Client (WebGL canvas) | — | Pure client-side GPU work; never SSR'd, never in initial bundle |
| Capability gate (GPU tier, memory, saveData, reduced-motion) | Browser / Client | — | All signals are client-only APIs; decision made at runtime before mount |
| Lazy chunking / bundle isolation | Build (Next/Turbopack) | Browser (dynamic import) | `next/dynamic` `ssr:false` inside a client component creates the async chunk |
| Boot-beat + scroll-exit choreography | Browser / Client (GSAP) | — | GSAP/ScrollTrigger owns DOM+timing; one-way bridge into scene state |
| Hero SSR markup + fallback experience | Frontend Server (SSG) | — | Phase-3 hero is static HTML; 3D layer adds zero LCP surface (D-10) |
| Font loading / LCP render path | Frontend Server (SSG) + Build | Browser (font swap) | `next/font` emits self-hosted files + `@font-face` at build; swap behavior is client |
| CI budget enforcement | CI (LHCI) | — | `lighthouserc.json` assertions on the built site |
| Launch verification (stopwatch, reduced-motion, Android proxy) | External tooling (Playwright, WebPageTest) against production URL | — | D-13/D-14; adds nothing to the shipped site |

## Standard Stack

### Core (new packages this phase)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `three` | 0.185.1 | WebGL engine (Points, LineSegments, BufferGeometry) | Already sanctioned in STACK.md; `[VERIFIED: npm registry 2026-07-08]` latest 0.185.1, published 2026-07-01 |
| `@react-three/fiber` | 9.6.1 | React renderer for three; `<Canvas>`, `useFrame`, `useThree` | STACK.md-sanctioned React-19 line; peer `react >=19 <19.3` re-verified — **React `~19.2.0` pin still mandatory** `[VERIFIED: npm registry 2026-07-08]` |
| `detect-gpu` | 5.0.70 | GPU tier benchmarking (tier 0–3 from real fps benchmark data) for the D-07 capability gate | pmndrs official (same org as fiber/drei); the de-facto standard for WebGL capability gating; handles Apple's masked "Apple GPU" strings `[VERIFIED: npm registry + github.com/pmndrs/detect-gpu README]` |

### Supporting (already installed — no additions)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `gsap` + ScrollTrigger | 3.15.0 (installed) | Boot-beat timing + scroll-linked exit progress | The one-way bridge INTO scene state (D-05/D-09); already lazy-loaded by MotionProvider |
| `@playwright/test` | 1.61.1 (installed) | D-14 scripted stopwatch + reduced-motion runs against production | `reducedMotion: 'reduce'` context option `[VERIFIED: installed playwright-core 1.61.1 types]` |
| `@lhci/cli` | 0.15.1 (installed) | D-11 CI assertion restore | Change `lighthouserc.json` LCP `"warn"` → `"error"` |
| `@vercel/speed-insights` | installed | Production field LCP data (the D-11 "source of truth" measurement) | Read before choosing LCP levers |

### Deliberately NOT added

| Candidate | Verdict | Why |
|-----------|---------|-----|
| `@react-three/drei` | **Skip for this phase** | STACK.md says "whenever R3F is used", but the constellation needs none of drei's staples: no OrbitControls, no loaders, no text, no environment. Points/lines/camera are raw three primitives. Skipping drei keeps the lazy chunk measurably smaller and the dependency surface minimal. Add later ONLY if a concrete need appears (e.g. `PerformanceMonitor` for runtime DPR adaptation — trivially hand-rollable, see Code Example 5). Deviation from STACK.md guidance is intentional and justified. |
| `@react-three/postprocessing` | **Skip** | D-03 locked "no bloom/postprocessing required" — points/lines material language explicitly avoids it. |
| Draco / KTX2 pipeline (`gltf-transform`, `three/examples/jsm/loaders/DRACOLoader`, KTX2 transcoder) | **Confirmed unnecessary** (answers the phase research flag) | Draco compresses **mesh geometry inside glTF files**; KTX2/Basis compresses **textures**. The constellation is procedural: node positions are computed in code into a `BufferGeometry` `Float32Array`; edges are index pairs; pulses are shader/CPU-lerped points. There are **no glTF assets and no textures** — nothing to compress, no loaders to ship, no decoder WASM to host. `[VERIFIED: by construction — D-03 material language + D-02 procedural hidden structure imply zero external 3D assets]` |
| `use-error-boundary` (R3F docs example) | **Skip** | React 19 + a ~20-line class ErrorBoundary covers Canvas-creation crashes without a dependency. |

**Installation:**
```bash
pnpm add three@0.185.1 @react-three/fiber@9.6.1 detect-gpu@5.0.70
pnpm add -D @types/three
# Self-host detect-gpu benchmarks (DSGVO — see Pitfall 2):
# copy node_modules/detect-gpu/dist/benchmarks → public/benchmarks/  (script it in package.json prebuild or a postinstall-free copy step)
```

**Version verification (performed 2026-07-08):**
- `three` 0.185.1 (modified 2026-07-01) `[VERIFIED: npm view]`
- `@react-three/fiber` 9.6.1 (modified 2026-07-08) — peer `react >=19 <19.3`, `three >=0.156` `[VERIFIED: npm view]`
- `detect-gpu` 5.0.70 (modified 2025-02-26 — mature/stable, benchmark-data-driven so low churn) `[VERIFIED: npm view]`
- `@types/three` — install matching 0.185.x line `[ASSUMED: standard DefinitelyTyped availability — verify exact version at install]`

## Package Legitimacy Audit

> Seam note: `gsd-tools query package-legitimacy` is not available in the installed gsd-tools build (command unknown) — audit performed manually via `npm view` (registry, repository, publish dates, postinstall scripts) per the ecosystem-verification protocol.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| three | npm | 10+ yrs, active (last publish 2026-07-01) | very high | github.com/mrdoob/three.js | OK | Approved (already in STACK.md) |
| @react-three/fiber | npm | 6+ yrs, active (last publish 2026-07-08) | very high | github.com/pmndrs/react-three-fiber | OK | Approved (already in STACK.md) |
| detect-gpu | npm | 6+ yrs (v5 line since 2021; last publish 2025-02) | high | github.com/pmndrs/detect-gpu | OK | Approved — pmndrs org, no postinstall script |
| @types/three | npm | DefinitelyTyped | high | github.com/DefinitelyTyped | OK | Approved (dev-only) |

**Postinstall scripts:** none on any of the four (`npm view <pkg> scripts.postinstall` → empty for all). `[VERIFIED: npm view 2026-07-08]`
**Packages removed due to SLOP verdict:** none
**Packages flagged as suspicious (SUS):** none

## Architecture Patterns

### System Architecture Diagram

```
                         ┌───────────────────────────── SSG HTML (Phase 3, unchanged) ─────────────────────────────┐
                         │  Hero (SSR text, H1, value-prop)   HeroSceneSlot (empty aria-hidden layer, -z-10)       │
                         └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                                                     │ Phase 4 fills children with ONE client component
                                                                     ▼
  First paint ──► hydration ──► window "load" + requestIdleCallback ──► [HeroSceneGate  "use client"]
                                                                     │
                                     ┌───────────────────────────────┴───────────────────────────────┐
                                     │ Gate pipeline (all client signals, short-circuit on first NO) │
                                     │  0. URL/localStorage override (?webgl=force|off) → for CI/QA  │
                                     │  1. prefers-reduced-motion: reduce ────────────► NO 3D (D-10) │
                                     │  2. saveData === true ─────────────────────────► NO 3D        │
                                     │  3. deviceMemory < 4 (only if API exists) ─────► NO 3D        │
                                     │  4. webgl2 ctx + failIfMajorPerformanceCaveat ─► NO 3D        │
                                     │     (excludes SwiftShader/software rendering)                 │
                                     │  5. detect-gpu tier (self-hosted benchmarks):                 │
                                     │       tier ≤ 1 ────────────────────────────────► NO 3D        │
                                     │       tier ≥ 2 && isMobile ────────► MOUNT (mobile config)    │
                                     │       tier ≥ 2 && desktop ─────────► MOUNT (desktop config)   │
                                     └───────────────────────────────┬───────────────────────────────┘
                                                                     │ MOUNT: next/dynamic(ssr:false) → lazy chunk
                                                                     ▼
   GSAP hero-intro timeline ──(boot beat done? assemble : fade-in)──► [ConstellationCanvas <Canvas>]
   GSAP ScrollTrigger progress ──(one-way bridge: mutable ref)──────►   useFrame: drift + pulses + pointer attract
   pointer:fine onPointerMove ──(unproject to plane)────────────────►   reads sceneBridge ref, writes BufferAttributes
   documentElement[data-theme] ──(MutationObserver + matchMedia)────►   material colors from CSS tokens (hex)
                                                                     │
   scroll past hero (ScrollTrigger onLeave) ─────────────────────────► frameloop 'never' (pause) or unmount (profile both, D-05)
   canvas "webglcontextlost" ────────────────────────────────────────► unmount canvas → Phase-3 hero remains (D-10)
   Canvas creation throw ────────────────────────────────────────────► ErrorBoundary → render null → Phase-3 hero remains
```

Primary use case traced: visitor on capable device → static hero paints (LCP unaffected) → idle → gate passes → chunk loads → constellation assembles as final boot beat → drifts/pulses behind text → recedes and pauses on scroll exit.

### Recommended Project Structure

```
src/
├── components/
│   ├── motion/
│   │   ├── hero-scene-slot.tsx        # unchanged Server Component; children ← <HeroSceneGate/>
│   │   ├── hero-intro.tsx             # + exposes/handshakes the boot-beat completion signal (D-09)
│   │   └── motion-provider.tsx        # unchanged (3D gate composes, does not duplicate, its signals)
│   └── scene/                          # ALL Phase-4 3D code — deletable as one directory ("streichbar")
│       ├── hero-scene-gate.tsx        # "use client"; capability gate + next/dynamic mount + ErrorBoundary
│       ├── constellation-canvas.tsx   # lazy chunk entry: <Canvas> config (dpr, frameloop, events)
│       ├── constellation.tsx          # nodes/edges/pulses; useFrame drift; pointer influence
│       ├── constellation-data.ts      # D-02 hidden structure: graph derived from career/agent topology
│       └── scene-bridge.ts            # mutable ref singleton: scrollProgress, introBeat, pointer, paused
├── lib/
│   ├── capability.ts                  # gate pipeline (pure, unit-testable): signals → tier decision
│   └── theme-color-resolver.ts        # CSS token (hex) → THREE.Color, MutationObserver on data-theme
public/
└── benchmarks/                        # self-hosted detect-gpu benchmark JSONs (DSGVO — Pitfall 2)
evals/
└── launch/                            # D-14: stopwatch.spec.ts, reduced-motion.spec.ts (production URL)
```

### Pattern 1: Client-component gate + `next/dynamic` `ssr:false` (bundle isolation)

**What:** `HeroSceneSlot` (Server Component) renders `<HeroSceneGate/>` (client). The gate holds the `next/dynamic(() => import('./constellation-canvas'), { ssr: false })` reference and only renders it after the async capability decision. `ssr: false` **must live inside a client component** — it errors in Server Components. `[VERIFIED: node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md — "ssr: false is not allowed with next/dynamic in Server Components. Please move it into a Client Component."]`
**When to use:** exactly once, at the slot boundary.
**Why it satisfies "never in the initial bundle":** the dynamic import creates a separate async chunk; the eager cost of `HeroSceneGate` itself is a few KB (gate logic only — keep `detect-gpu` behind the same dynamic boundary or its own `import()` so the eager bundle stays under the 184,643-byte gate).

```tsx
// Source: node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md (Next 16.2.10 bundled docs)
"use client";
import dynamic from "next/dynamic";

const ConstellationCanvas = dynamic(
  () => import("./constellation-canvas"),
  { ssr: false }, // client-only chunk; no prerender, no hydration mismatch
);
```

### Pattern 2: Mount trigger — after first paint, on idle

**What:** never mount (or even start the gate's async work) before the browser is idle: `window` `load` event → `requestIdleCallback` (with `setTimeout(..., ~1500ms)` fallback — Safari still lacks `requestIdleCallback` `[ASSUMED — verify at implementation]`). detect-gpu's benchmark fetch (a few KB JSON from `public/benchmarks/`) happens inside this idle window.
**When to use:** the gate's `useEffect`.
**Why:** guarantees zero LCP/FCP interference; the trace-window interaction with Lighthouse is then a *deliberate* choice via the override param (Pitfall 1).

### Pattern 3: One-way GSAP → scene bridge (single-engine discipline)

**What:** a module-scope mutable object (`scene-bridge.ts`) written by GSAP/ScrollTrigger callbacks and *read* every frame inside `useFrame`. No React state for per-frame values (re-render per scroll tick would be fatal); no GSAP tweens targeting three objects' DOM.
**When to use:** scroll progress (D-05 exit), intro-beat handshake (D-09), pointer position (D-06), pause flag.

```ts
// scene-bridge.ts — the ONLY shared surface between GSAP-land and canvas-land
export const sceneBridge = {
  scrollProgress: 0,   // 0..1, written by ScrollTrigger onUpdate
  introBeatAt: 0,      // timestamp when boot intro finished (0 = not yet) → assemble vs fade-in (D-09)
  pointer: { x: 0, y: 0, active: false }, // pointer:fine only (D-06)
  paused: false,       // scroll-exit / visibility pause
};
```

```tsx
// inside the Canvas subtree — reads bridge, never causes React re-renders
useFrame((state, delta) => {
  const p = sceneBridge.scrollProgress;
  groupRef.current.position.z = -p * RECEDE_DEPTH;      // parallax/recede (D-05)
  materialRef.current.opacity = 1 - easeIn(p);          // dissolve (D-05)
  driftNodes(positions, delta);                          // refresh-rate independent via delta
  geomRef.current.attributes.position.needsUpdate = true;
});
// Source: R3F pitfalls doc — mutate with useFrame + delta, never setState per frame
// [CITED: github.com/pmndrs/react-three-fiber/blob/master/docs/advanced/pitfalls.mdx via Context7]
```

### Pattern 4: D-09 boot-beat handshake (no double intro)

**What:** `hero-intro.tsx` records completion (`sceneBridge.introBeatAt = performance.now()` at timeline end, or exposes an `onComplete` the gate subscribes to). When the canvas mounts it checks: intro still running → GSAP adds the assembly beat to the *existing* timeline (`timeline.add(...)`); intro already done → scene runs its own graceful fade-in (a simple opacity ramp inside `useFrame`, NOT a second GSAP timeline).
**Why:** honors D-09's two cases and keeps GSAP ownership of DOM choreography while the canvas owns its interior.

### Pattern 5: Theme-token color resolution

**What:** tokens in `globals.css` are plain hex (`--accent: #c2410c` light / `#fb923c` dark — `[VERIFIED: src/app/globals.css]`), so `new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim())` works directly (no oklch parsing problem). Subscribe to theme changes via a `MutationObserver` on `documentElement`'s `data-theme` attribute + `matchMedia('(prefers-color-scheme: dark)')` change listener; update material colors imperatively (no remount).
**When to use:** canvas mount + theme flips. Both light and dark must look intentional (existing project pattern).

### Pattern 6: Context-loss → D-10 fallback (success criterion 2)

**What:** listen on the canvas element for `webglcontextlost`, then **unmount the canvas entirely** — the Phase-3 hero underneath is the complete experience (D-10: no substitute artwork). Do NOT `preventDefault()` (that opts into manual restore; we don't want restore — the fallback is already perfect). Wrap `<Canvas>` in an ErrorBoundary for context-*creation* crashes (R3F's documented safeguard). `[CITED: github.com/pmndrs/react-three-fiber/blob/master/docs/API/canvas.mdx via Context7]`
**Why the simple path is correct:** attempting `webglcontextrestored` recovery adds state-machine complexity for a scenario whose designed outcome ("hero without constellation") is already ideal.

### Pattern 7: frameloop lifecycle

**What:** drift + pulses are continuous animation, so `frameloop="demand"` (render only on prop changes) does not fit while the constellation is visible — running `invalidate()` every RAF just reimplements `always`. Recommended lifecycle: `frameloop` as React state on `<Canvas frameloop={visible ? "always" : "never"}>` — `"never"` when (a) ScrollTrigger reports the hero fully exited (D-05), (b) `document.visibilitychange` → hidden. `[CITED: R3F scaling-performance.mdx — frameloop='demand'/invalidate semantics, via Context7]`
**Pause vs unmount (D-05 discretion):** start with **pause** (`frameloop="never"`) — instant resume if the visitor scrolls back, GPU work drops to zero, and the retained GPU memory for a points/lines scene is trivial (a few hundred KB of buffers). Profile; switch to full unmount only if DevTools memory/GPU evidence demands it. Note STACK.md's `frameloop="demand"` guidance was written generically ("where possible") — for a continuously drifting scene, the visible-state loop must be `always`; the discipline is delivered by the `never` states instead.

### Pattern 8: Deterministic gate override (testability)

**What:** the gate checks `?webgl=off|force` (URL param, dev/audit affordance) before the signal pipeline. `off` → never mount; `force` → skip tiering (still respect reduced-motion). This gives D-13/D-14 scripts, local Lighthouse runs, and CI a way to pin the scenario under test instead of inheriting whatever GPU the runner has.
**Why:** without it, CI results depend on runner hardware (SwiftShader vs real GPU) and audits become non-reproducible (Pitfall 1/3).

### Anti-Patterns to Avoid

- **React state per frame** (`setState` in `useFrame`/scroll handlers): re-render storms; mutate refs/attributes with `needsUpdate` instead. `[CITED: R3F pitfalls.mdx]`
- **GSAP tweening three.js objects directly per scroll tick:** creates a second engine inside the canvas; write bridge values, consume in `useFrame`.
- **`preventDefault()` on `webglcontextlost` + restore machinery:** unnecessary given D-10.
- **detect-gpu with default `benchmarksURL`:** runtime unpkg CDN call — DSGVO violation (Pitfall 2).
- **Mounting the canvas before `load`+idle:** risks LCP/TBT interference and instantly breaches the script budget in any trace.
- **Importing `detect-gpu` (or anything three-adjacent) statically in `HeroSceneGate`:** leaks into the eager route bundle; keep everything heavy behind `import()`.
- **A second `<Canvas>` or scene anywhere outside the hero:** out of phase scope (deferred).
- **Uncapped DPR / `dpr={window.devicePixelRatio}`:** the #1 mobile GPU cost; clamp `[1, 1.5]` (STACK.md).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GPU performance classification | A homemade fps micro-benchmark or UA-string GPU table | `detect-gpu` (self-hosted benchmarks) | gfxbench-derived benchmark corpus, Apple GPU-string masking handled, Levenshtein renderer matching — years of accumulated edge cases `[CITED: github.com/pmndrs/detect-gpu README]` |
| React↔three lifecycle (canvas sizing, render loop, events, disposal) | Manual `WebGLRenderer` + `useEffect` plumbing | `@react-three/fiber` | Disposal on unmount, resize handling, pointer events, StrictMode safety are all subtle; fiber is the standard |
| Refresh-rate-independent animation | Fixed per-frame increments | `useFrame((state, delta) => ...)` | 60 Hz vs 120/144 Hz devices; delta-based motion is the documented pattern `[CITED: R3F pitfalls.mdx]` |
| Font fallback metric matching | Hand-written `size-adjust`/`ascent-override` values | `next/font`'s built-in `adjustFontFallback` (default on) | Next computes size-adjust/ascent/descent/line-gap overrides automatically `[VERIFIED: bundled Next 16 font.md]` |
| Reduced-motion emulation in tests | Injected CSS/media hacks | Playwright `reducedMotion: 'reduce'` context option / `page.emulateMedia` | First-class API `[VERIFIED: installed playwright-core 1.61.1 types]` |

**Key insight:** every hand-rolled piece here (GPU detection especially) looks trivial for the happy path and fails on exactly the devices the D-07 gate exists to protect.

## Common Pitfalls

### Pitfall 1: The lazy 3D chunk vs `resource-summary:script:size` (THE planning constraint)
**What goes wrong:** `lighthouserc.json` asserts `resource-summary:script:size ≤ 184,643` as `error`. `resource-summary` counts **all script transfer bytes observed during the trace**, not just the eager bundle. three.js alone is ~150–170 KB gzipped; three+fiber chunk realistically ~180–220 KB `[ASSUMED: bundlephobia-class estimate — MEASURE the real chunk at build time]`. If the constellation mounts during a Lighthouse run, the script budget fails **by design**, even though the initial bundle is untouched.
**Why it happens:** the budget was calibrated for the 3D-free site; success criterion 3 demands the audit pass "WITH the constellation active" — these two constraints collide inside one assertion.
**How to avoid:** decide explicitly in the plan, per scenario:
1. **CI (GitHub Actions, SwiftShader):** the honest gate (Pattern 8 + `failIfMajorPerformanceCaveat`) yields NO 3D → existing budget stays valid, assert `?webgl=off`-equivalent behavior implicitly. Optionally add a second LHCI URL with `?webgl=force` and a **separate, documented script budget** (e.g. eager budget + measured chunk size + margin) so "3D active" is *also* CI-audited — LHCI assertions are global per config, so this likely means a second `lighthouserc` file/run rather than per-URL assertions `[ASSUMED: LHCI assertion scoping — verify assertMatrix support at implementation]`.
2. **Production launch audit (criterion 3):** run PSI/WebPageTest on the production URL where capable devices mount 3D; judge LCP/TBT/CLS + perf ≥ 0.9 there, with the script-size carve-out documented in VERIFICATION.md.
**Warning signs:** CI suddenly failing script-size after the scene lands = the gate mounted 3D on the runner (check `?webgl` override and SwiftShader detection).

### Pitfall 2: detect-gpu phones home to unpkg (DSGVO violation)
**What goes wrong:** `getGPUTier()` defaults to fetching benchmark JSON from `https://unpkg.com/detect-gpu@{version}/dist/benchmarks` at runtime — a third-party call from the shipped site, forbidden by AGENTS.md. `[VERIFIED: github.com/pmndrs/detect-gpu README]`
**How to avoid:** copy `node_modules/detect-gpu/dist/benchmarks` into `public/benchmarks/` (build step, mirrors the CV-PDF prebuild pattern) and call `getGPUTier({ benchmarksURL: '/benchmarks' })`. Verify in the network tab that no unpkg request fires.
**Warning signs:** any `unpkg.com` entry in the production network waterfall.

### Pitfall 3: CI/headless GPU is SwiftShader — tier results are meaningless there
**What goes wrong:** headless Chrome on ubuntu runners renders WebGL in software (SwiftShader). detect-gpu will classify it as tier 0/blocklisted — correct behavior, but it means "CI never exercises the 3D path" silently.
**How to avoid:** treat this as a feature (weak "device" correctly excluded), but (a) request the context with `failIfMajorPerformanceCaveat: true` so software rendering is excluded deterministically rather than by benchmark luck, and (b) use the Pattern-8 override to *force* the 3D path in Playwright smoke tests (assert canvas mounts, context-loss fallback works) even on SwiftShader. `[ASSUMED: SwiftShader tier-0 classification — validate once in CI logs]`
**Warning signs:** "3D works in CI screenshots" claims without an explicit `?webgl=force`.

### Pitfall 4: TBT from parsing ~700 KB (uncompressed) of three.js on 4× CPU throttle
**What goes wrong:** even loaded lazily, the chunk's parse/compile can produce long tasks during a throttled trace, pushing `total-blocking-time` past the 200 ms `error` budget when the 3D scenario is audited.
**How to avoid:** mount after `load`+idle (Pattern 2) so parse lands after TTI in most traces; keep the chunk minimal (no drei, no postprocessing); measure TBT in the `?webgl=force` audit before declaring criterion 3 met.
**Warning signs:** TBT regressions only in 3D-active runs.

### Pitfall 5: The Bricolage H1 swap re-times the LCP element (the D-11 dragon)
**What goes wrong:** current production LCP is ~2.5–2.9 s; local bisection showed the D-03 display font adds a fixed ~300 ms because the H1 font swap re-times/reflows the LCP candidate (a Geist paragraph) `[VERIFIED: src/app/[locale]/layout.tsx comment + 03-VERIFICATION.md]`. A fallback-metrics mismatch can even reset the LCP candidate on reflow `[CITED: web.dev/articles/font-best-practices + DebugBear via websearch — MEDIUM]`.
**How to avoid (lever order for D-11):**
1. **Measure first:** identify the actual production LCP element + phase breakdown via Vercel Speed Insights field data, PageSpeed Insights, and a WebPageTest run (real Moto-class device) — production is the calibrated source of truth (Phase-2 precedent).
2. **Shrink the font to near-zero:** Next 16's `next/font/google` has **no `text` subsetting option** (options are `subsets`/`axes`/`weight`… `[VERIFIED: bundled Next 16 font.md]`), but `next/font/local` accepts any woff2 — hand-subset Bricolage Grotesque 700 to the hero-H1 glyph repertoire (both locales' H1 + nav strings) with `pyftsubset`/`glyphhanger`, likely **~3–6 KB** vs ~22 KB `[ASSUMED: subset size estimate]`. Set `preload: true` on the now-tiny file (currently `preload: false`), keep `display: 'swap'` (D-03) and `adjustFontFallback` for metric matching. Mind the Google Fonts license permits self-hosted subsetting (OFL) `[ASSUMED — confirm OFL license of Bricolage Grotesque]`.
3. **Priority hints:** confirm nothing else contends in the critical window (fonts are already self-hosted same-origin; hero has no image).
4. **Escalation lever (needs user sign-off — conflicts with locked D-03):** `display: 'optional'` would cap worst-case swap cost but can skip Bricolage entirely on slow loads — **do not apply without explicit user approval**.
**Warning signs:** local LHCI green but production red (or vice versa) — they were already shown to diverge; only production counts for launch.

### Pitfall 6: Hydration mismatch / SSR divergence from the gate
**What goes wrong:** the gate must render **nothing** on the server and on the first client render (this repo's `useSyncExternalStore` + `getServerSnapshot() => false` convention exists precisely for this; `setState`-in-effect patterns hard-error under the repo's React-Compiler lint).
**How to avoid:** gate resolution is async anyway (idle + detect-gpu fetch) — initial render is always `null`; follow `motion-provider.tsx`/`theme-toggle.tsx` conventions for any media-query signals. `[VERIFIED: src/components/motion/motion-provider.tsx comments + STATE.md]`

### Pitfall 7: The 3D gate is NOT the motion gate (touch is allowed!)
**What goes wrong:** copying `MotionProvider`'s gate (`pointer: fine` required) would exclude every phone — directly violating D-07 ("capable phones included").
**How to avoid:** the 3D gate composes only **reduced-motion** from the existing gating story; pointer-fineness gates **only the pointer-influence feature** (D-06), not the mount. Capability (tier/memory/saveData) decides the mount.
**Warning signs:** constellation never appearing on a flagship phone in QA.

### Pitfall 8: ScrollTrigger + Lenis only run on `pointer: fine` — but D-05's exit must also work on capable phones
**What goes wrong:** the existing GSAP/ScrollTrigger infra is instantiated by `MotionProvider` **only when `pointer:fine` && no reduced-motion** `[VERIFIED: motion-provider.tsx]`. On a capable phone (3D mounted, motion gate closed) there is **no ScrollTrigger** to drive the D-05 scroll-linked exit — the bridge's `scrollProgress` would stay 0 and the canvas would never pause.
**How to avoid:** the scene needs a scroll-progress source that works in both regimes: reuse ScrollTrigger when the motion stack is up (desktop), and fall back to a passive scroll/`IntersectionObserver` progress calculation on touch (mirrors Phase 3's `Reveal`-via-IntersectionObserver precedent). Keep both writing the same `sceneBridge.scrollProgress`.
**Warning signs:** GPU still busy after scrolling past the hero on a phone.

## Code Examples

### 1. Capability gate pipeline (pure, unit-testable)
```ts
// src/lib/capability.ts — signals verified against MDN/caniuse:
// deviceMemory: Chromium-only; Safari+Firefox deliberately unimplemented → ABSENT ≠ weak
// [CITED: developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory via websearch]
export type SceneTier = "none" | "mobile" | "desktop";

export async function decideSceneTier(): Promise<SceneTier> {
  const q = new URLSearchParams(location.search).get("webgl"); // Pattern 8
  if (q === "off") return "none";

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return "none"; // D-10
  const conn = (navigator as any).connection;
  if (conn?.saveData === true) return "none";
  const mem = (navigator as any).deviceMemory;              // only gate when API exists
  if (typeof mem === "number" && mem < 4) return "none";

  // Exclude software rendering (SwiftShader in CI) deterministically:
  const probe = document.createElement("canvas")
    .getContext("webgl2", { failIfMajorPerformanceCaveat: true });
  if (!probe) return "none";

  if (q === "force") return matchMedia("(pointer: coarse)").matches ? "mobile" : "desktop";

  const { getGPUTier } = await import("detect-gpu");         // stays out of eager bundle
  const gpu = await getGPUTier({ benchmarksURL: "/benchmarks", glContext: probe }); // Pitfall 2
  if (gpu.tier < 2) return "none";                           // tier 2 = ≥30fps benchmark class (D-07)
  return gpu.isMobile ? "mobile" : "desktop";
}
// [CITED: github.com/pmndrs/detect-gpu README — tiers 0-3, benchmarksURL, glContext option]
```

### 2. Gate component (mount after load + idle)
```tsx
// src/components/scene/hero-scene-gate.tsx
"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { decideSceneTier, type SceneTier } from "@/lib/capability";

const ConstellationCanvas = dynamic(() => import("./constellation-canvas"), { ssr: false });

export function HeroSceneGate() {
  const [tier, setTier] = useState<SceneTier>("none");
  useEffect(() => {
    let cancelled = false;
    const kickoff = () => {
      const idle = "requestIdleCallback" in window
        ? (cb: () => void) => requestIdleCallback(cb)
        : (cb: () => void) => setTimeout(cb, 1500);
      idle(() => { void decideSceneTier().then((t) => { if (!cancelled) setTier(t); }); });
    };
    if (document.readyState === "complete") kickoff();
    else { window.addEventListener("load", kickoff, { once: true }); }
    return () => { cancelled = true; window.removeEventListener("load", kickoff); };
  }, []);
  if (tier === "none") return null;                    // D-10: nothing missing without it
  return <SceneErrorBoundary><ConstellationCanvas tier={tier} /></SceneErrorBoundary>;
}
```

### 3. Canvas config + context-loss fallback
```tsx
// src/components/scene/constellation-canvas.tsx (the lazy chunk entry)
"use client";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";

export default function ConstellationCanvas({ tier }: { tier: "mobile" | "desktop" }) {
  const [lost, setLost] = useState(false);
  const [running, setRunning] = useState(true);        // Pattern 7: pause via frameloop state
  if (lost) return null;                                // D-10 fallback = Phase-3 hero
  return (
    <Canvas
      frameloop={running ? "always" : "never"}
      dpr={tier === "mobile" ? [1, 1.25] : [1, 1.5]}    // STACK.md clamp; tighter on mobile (D-07)
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 8], fov: 45 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", () => setLost(true)); // criterion 2
      }}
    >
      <Constellation tier={tier} onExitViewport={() => setRunning(false)}
                     onEnterViewport={() => setRunning(true)} />
    </Canvas>
  );
}
// [CITED: R3F canvas.mdx (ErrorBoundary safeguard) + scaling-performance.mdx (frameloop/dpr) via Context7]
```

### 4. Drift + bridge consumption (delta-based, no React state)
```tsx
// inside Constellation — R3F documented pattern
useFrame((state, delta) => {
  if (sceneBridge.paused) return;
  const pos = geomRef.current.attributes.position;
  for (let i = 0; i < nodeCount; i++) driftNode(pos.array, i, delta);   // slow 3D drift (D-04)
  advancePulses(delta);                                                  // orange edge pulses (D-04)
  applyPointerAttraction(pos.array, sceneBridge.pointer, delta);         // D-06, pointer:fine only
  pos.needsUpdate = true;
  groupRef.current.position.z = -sceneBridge.scrollProgress * 3;         // D-05 recede
});
// [CITED: github.com/pmndrs/react-three-fiber/blob/master/docs/advanced/pitfalls.mdx — useFrame+delta]
```

### 5. Runtime DPR adaptation without drei (optional polish)
```tsx
// Hand-rolled equivalent of drei's <PerformanceMonitor> pattern shown in R3F docs:
// sample gl.info/frame time over a window; step dpr down [1.5 → 1.25 → 1] on sustained misses.
// R3F docs version (with drei): <PerformanceMonitor onIncline={() => setDpr(2)} onDecline={() => setDpr(1)}>
// [CITED: R3F scaling-performance.mdx via Context7]
```

### 6. D-14 launch scripts (Playwright, production URL)
```ts
// evals/launch/reduced-motion.spec.ts
import { test, expect } from "@playwright/test";
test.use({ reducedMotion: "reduce", baseURL: "https://lsiem.de" }); // [VERIFIED: playwright-core 1.61.1 types]

test("reduced-motion walkthrough: full content, zero canvas", async ({ page }) => {
  await page.goto("/de");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);   // D-10: gate closed
  // ...walk every section, assert content visible at SSR-final state (MODE-02)
});

// evals/launch/stopwatch.spec.ts — 30s test: start timer at goto, assert name/role/value-prop
// visible on first fold, one click to overview, contact + CV reachable; total elapsed < 30_000ms.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| UA-sniffing / form-factor gating for WebGL | Measured capability: benchmark tiers (detect-gpu) + `failIfMajorPerformanceCaveat` + progressive signals | ~2020+, standard by 2023 | D-07's "capability, not form factor" is the established pattern, not an invention |
| `forwardRef`, R3F v8, React 18 line | R3F v9 (React 19 line), ref-as-prop | R3F 9 (2025) | Already mandated by STACK.md; v8 forbidden |
| Draco/KTX2 for every 3D site | Asset pipeline only when shipping glTF/textures; procedural scenes ship zero assets | — | Phase research flag resolved: not applicable here |
| Lighthouse simulated-only verification | Field data (CrUX/Speed Insights) + real-device WebPageTest as calibration | ongoing | WebPageTest's device lab (Moto G-class, real packet shaping) correlates better with CrUX p75 than simulated Lighthouse `[CITED: docs.webpagetest.org + webvitals.tools via websearch — MEDIUM]` |

**Deprecated/outdated:** `@react-three/fiber` v8 (pre-React-19, forbidden by STACK.md); Locomotive Scroll/ScrollMagic (already excluded); manual `@font-face` for Google fonts (next/font self-hosts).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | three+fiber lazy chunk ≈ 180–220 KB gzipped | Pitfall 1/4 | Budget carve-out mis-sized — **measure real chunk at first build** |
| A2 | SwiftShader (CI headless Chrome) is excluded by `failIfMajorPerformanceCaveat` and/or detect-gpu tier 0 | Pitfall 3 | CI could mount 3D and fail script budget — validate once in CI logs |
| A3 | Safari still lacks `requestIdleCallback` (fallback needed) | Pattern 2 | Minor — fallback timer covers it either way |
| A4 | Hand-subsetted Bricolage 700 (hero glyphs) ≈ 3–6 KB; OFL license permits subsetting | Pitfall 5 | LCP lever weaker than expected; license check is a 2-min task |
| A5 | LHCI per-scenario assertions need a second config/run (no per-URL assertion scoping) | Pitfall 1 | Plan structure of the CI job changes slightly — check `assertMatrix` in LHCI 0.15 docs |
| A6 | WebPageTest free tier still offers real Moto-G-class Android agents in 2026 | D-13 | Fall back to BrowserStack (paid) or DevTools calibrated throttling; D-13 already allows either |
| A7 | `@types/three` has a release matching 0.185.x | Standard Stack | Pin nearest available; type-only risk |
| A8 | Battery API skipped (Chrome-only, declining, low signal value) — deviation from D-07's example signal list, within discretion | Capability gate | If user insists, add `getBattery()` as an optional dimming signal, never a mount blocker |

## Open Questions

1. **Which exact script-size policy for the "3D active" audit?** (Pitfall 1)
   - What we know: existing 184,643-byte `error` assertion cannot survive a trace that loads the 3D chunk; CI's SwiftShader path avoids it by default.
   - What's unclear: whether the user prefers (a) a second CI audit with a documented higher budget for `?webgl=force`, or (b) 3D-active verification only on production tooling (PSI/WebPageTest) with the carve-out documented in VERIFICATION.md.
   - Recommendation: (a)+(b) — cheap to run both; planner should put the decision in the plan explicitly.
2. **`display: 'optional'` escalation** (Pitfall 5): only if levers 1–3 leave production LCP red; conflicts with locked D-03 — requires explicit user approval before use.
3. **Pause vs unmount on scroll exit** (D-05 discretion): recommendation is pause-first, profile, unmount only on evidence — planner should encode the profiling step, not pre-decide.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next 16 build | ✓ | 26.4.0 (≥20 required) | — |
| pnpm | package management | ✓ | 11.1.2 | — |
| @playwright/test | D-14 scripts | ✓ (installed) | 1.61.1 | — |
| @lhci/cli | D-11 CI assertion | ✓ (installed) | 0.15.1 | — |
| GitHub Actions CI (`ci.yml`: parity → build → LHCI) | budget enforcement | ✓ | — | — |
| Vercel Speed Insights (field LCP) | D-11 measurement | ✓ (shipped since Phase 1) | — | PageSpeed Insights (CrUX) |
| WebPageTest real-device Android | D-13 proxy | external service — account/quota unverified `[ASSUMED]` | — | BrowserStack trial, or Chrome DevTools calibrated throttling (D-13 allows) |
| Physical mid-tier Android | criterion 3 (ideal) | ✗ | — | D-13 proxy (locked decision) — document in VERIFICATION.md |
| Antigravity browser agent (`agy`) | D-14 alternative runner | per memory: works in this env | — | Playwright (primary) |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** physical Android (→ D-13 proxy), WebPageTest quota (→ BrowserStack/DevTools).

## Security Domain

Static SSG portfolio; no auth, no sessions, no server-side input processing. Phase 4 adds no forms, no APIs, no user input beyond pointer coordinates consumed client-side.

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | marginal | `?webgl=` param is read but only string-compared against literals (`"off"`/`"force"`) — never reflected into DOM/HTML; keep it that way |
| V6 Cryptography | no | — |
| V14 Configuration / Supply chain | **yes** | All Phase-4 packages audited (see Package Legitimacy Audit); detect-gpu benchmarks self-hosted (no runtime CDN); lazy chunk is same-origin `_next/static` — preserves the future `script-src 'self'` CSP path (STATE.md CSP follow-up) |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Supply-chain (slopsquatting/postinstall) | Tampering | Manual registry audit done; exact-pin new deps; no postinstall scripts present |
| Runtime third-party fetch (privacy/DSGVO) | Information Disclosure | Self-hosted benchmarks (Pitfall 2); verify zero external requests in production waterfall as a launch check |
| WebGL fingerprinting surface | Information Disclosure | detect-gpu reads renderer strings locally, sends nothing anywhere (with self-hosted benchmarks); no data leaves the client |

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view`, 2026-07-08) — three 0.185.1, @react-three/fiber 9.6.1 (+peer ranges), detect-gpu 5.0.70, postinstall checks
- `node_modules/next/dist/docs/` (bundled Next 16.2.10 docs) — `01-app/02-guides/lazy-loading.md` (`ssr:false` client-component rule), `01-app/03-api-reference/02-components/font.md` (font options; no `text` subsetting)
- Context7 `/pmndrs/react-three-fiber` — scaling-performance.mdx (frameloop/invalidate/DPR/PerformanceMonitor), pitfalls.mdx (useFrame+delta, no setState per frame), canvas.mdx (ErrorBoundary safeguard, Canvas props)
- github.com/pmndrs/detect-gpu README (via WebFetch) — default unpkg `benchmarksURL`, self-hosting, tiers, `failIfMajorPerformanceCaveat`, result fields
- Installed sources: `playwright-core@1.61.1` types (`reducedMotion`), `lighthouserc.json`, `motion-provider.tsx`, `hero-intro.tsx`, `hero-scene-slot.tsx`, `layout.tsx` (font comments + measured LCP tension), `globals.css` (hex tokens), `ci.yml`, `03-VERIFICATION.md`

### Secondary (MEDIUM confidence)
- [MDN Navigator.deviceMemory](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory) + [caniuse](https://caniuse.com/mdn-api_navigator_devicememory) via websearch — Chromium-only; Safari/Firefox intentionally unimplemented
- [web.dev font best practices](https://web.dev/articles/font-best-practices) + [DebugBear web-font layout shift](https://www.debugbear.com/blog/web-font-layout-shift) via websearch — swap/LCP re-timing, size-adjust metric matching
- [WebPageTest mobile device docs](https://docs.webpagetest.org/private-instances/mobile-devices/) + [webvitals.tools comparison](https://webvitals.tools/blog/lighthouse-vs-webpagetest/) via websearch — real Moto-G-class agents, packet-shaped network, better CrUX correlation than simulation

### Tertiary (LOW confidence — validate at implementation)
- three.js chunk gzip size estimate (A1); SwiftShader classification behavior in CI (A2); LHCI assertion scoping (A5); WebPageTest free quota (A6)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions/peers/postinstall verified on registry 2026-07-08; all packages pre-sanctioned or pmndrs-official
- Architecture: HIGH — patterns grounded in official R3F/Next docs + the repo's own established conventions (motion-provider, theme-toggle, lazy-gsap precedents)
- Capability gating: HIGH for mechanism (detect-gpu verified), MEDIUM for exact thresholds (tier ≥ 2, mem < 4 — tuning is Claude's discretion by CONTEXT)
- Pitfalls: HIGH for Pitfalls 1–2 and 5–8 (derived from verified budgets/code/docs); MEDIUM for 3–4 (CI GPU behavior + parse-cost estimates need one empirical confirmation)
- LCP levers: MEDIUM — the ranking is sound, but production measurement (lever 1) must precede commitment to any lever

**Research date:** 2026-07-08
**Valid until:** ~2026-08-08 (stable domain; re-verify fiber peer range if React 19.3 ships, and Assumptions A1/A2 at first build)
