# Phase 4: Signature Moment & Launch Hardening — Research

**Researched:** 2026-07-08
**Domain:** Lazy R3F hero WebGL in Next.js 16 App Router / React 19 static site; device capability tiering; scroll-progress bridge to GSAP; production launch verification
**Confidence:** HIGH (package versions, peer ranges, Next.js dynamic-import pattern — npm registry + prior project STACK.md) / MEDIUM (device-tier heuristics, procedural-scene GPU budget — community sources, not field-tested on this hardware matrix yet)

<user_constraints>
## User Constraints (from CONTEXT.md — to be locked at planning)

### Locked Decisions (carried forward from Phase 3)

- **D-01 (Direction):** Engineered / systems art direction — mono-forward, grid & console motifs, precise structural lines, coordinate/tick annotations. Accent is a signal color, not decoration.
- **D-02 (Palette — LOCKED):** Warm-stone neutrals + single orange accent. 3D scene MUST read palette from the same CSS tokens — no ad-hoc hex in shaders.
- **D-08 (Single engine — LOCKED):** GSAP remains the ONLY animation engine for DOM motion. R3F `useFrame` is allowed ONLY inside the WebGL layer for GPU work — never a second scroll authority (no drei `ScrollControls`).
- **D-13 (Phase-4 3D seam):** `<HeroSceneSlot />` is the drop-in point — `absolute inset-0 -z-10 pointer-events-none`, `aria-hidden`, hero content stays above. No hero re-layout.
- **D-17 / WOW-04:** First-paint SSR HTML (name, role, value-prop, nav) is never gated behind 3D load. The canvas is pure enhancement after first paint.
- **D-18 / MODE-02:** `prefers-reduced-motion: reduce` → no WebGL canvas mounts; identical DOM to today.
- **D-19 / TECH-02:** `pointer: coarse` (touch) → no WebGL canvas mounts; mobile gets the deliberate single-column static experience, not a degraded 3D view.

### Phase-4 Locked Decisions (new — planner locks in CONTEXT.md)

- **D-20 (Scene concept — "Infrastructure Topology"):** ONE procedural hero scene: a sparse 3D lattice of nodes + directed edges (service-mesh / cluster-topology metaphor), echoing D-01 grid/console identity and Lasse's DevOps/SWE profile. Accent color travels as a single signal pulse along one edge path — not decoration everywhere. **No imported GLB/OBJ for v1** — fully procedural `BufferGeometry` keeps Draco/KTX2 out of scope and avoids asset-pipeline risk.
- **D-21 (Mount contract):** `next/dynamic({ ssr: false })` + `requestIdleCallback` (with `setTimeout` fallback) after hydration; three.js/R3F NEVER in the server bundle or the route's initial JS chunk. Loading state is invisible (empty `aria-hidden` layer — no spinner, no preloader).
- **D-22 (Scroll bridge):** Hero-section scroll progress (0→1 while `#hero` traverses the viewport) is written by GSAP `ScrollTrigger.onUpdate` into a **module-scope mutable ref** (`heroSceneProgress`). R3F `useFrame` reads the ref and calls `invalidate()` — no per-frame React `setState`, no Zustand subscription per frame.
- **D-23 (Capability tier — 3D gate):** WebGL mounts ONLY when ALL are true: `prefers-reduced-motion: no-preference`, `pointer: fine`, `navigator.hardwareConcurrency >= 4`, WebGL2 context creatable. Otherwise `<HeroSceneSlot />` renders the same empty layer as Phase 3. Gate reads via `useSyncExternalStore` (same convention as `MotionProvider` / `ThemeToggle` — never `useState`+`useEffect` for browser signals).
- **D-24 (Renderer discipline):** `<Canvas frameloop="demand" dpr={[1, 1.5]} gl={{ powerPreference: "low-power", antialias: false }}>` — demand loop + capped DPR. Target < 50 draw calls, < 1000 vertices for v1 procedural scene.
- **D-25 (Context-loss fallback):** On `webglcontextlost`, preventDefault, dispose geometries/materials, unmount the canvas (return to empty layer). Do NOT attempt `forceContextRestore()` loops — graceful degradation to the static hero is the product requirement (ROADMAP SC2).
- **D-26 (Launch verification scope):** Re-verify on **production** `https://lsiem.de` (both `/de` and `/en`): TECH-01 mobile LHCI with 3D active, MODE-01 30-second stopwatch, MODE-02 reduced-motion walkthrough. Mid-tier Android real-device test is a **human checklist item**, not automatable in CI.

### Claude's Discretion (resolved by 04-UI-SPEC.md)

- Exact node count / edge layout → fixed in UI-SPEC §"Topology Scene Parameters" (12 nodes, 18 edges, seeded layout).
- Camera motion range → subtle Y-rotation ±8° + parallax drift driven by scroll progress, capped to stay behind hero text.
- Whether `@react-three/postprocessing` ships → **No** for v1 (bloom costs GPU budget; accent pulse on geometry is enough signal).

### Deferred Ideas (OUT OF SCOPE)

- Imported GLB models, Draco/KTX2 asset pipeline, texture atlases → v1.x only if procedural scene proves insufficient.
- `@react-three/postprocessing` bloom/grain → v1.x polish, not launch-blocking.
- CSP hardening → tracked Phase 2 follow-up, unchanged.
- AI chat, terminal easter-egg → v2 per REQUIREMENTS.md.
- Second 3D scene anywhere else on the site → explicitly one moment (WOW-01 wording).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WOW-01 | ONE signature 3D/WebGL hero moment, identity-bound, lazy, capability-gated, never in initial bundle | §Scene Concept D-20; §Architecture "Lazy mount stack"; §Standard Stack; §Pattern 1 Capability Gate |
| (re-verify) TECH-01 | CWV "good" on mobile WITH 3D active on production URL | §Launch Verification; §Pitfalls "Heavy WebGL as LCP"; D-21 mount-after-FP contract |
| (re-verify) MODE-01 | 30-second stopwatch on production | §Launch Verification checklist (inherits 02-07 pattern) |
| (re-verify) MODE-02 | Reduced-motion full-content walkthrough on production | D-18 gate → no canvas; same DOM contract as Phase 3 |
</phase_requirements>

## Summary

Phase 4 adds the last wow layer to a site that is already complete, live, and verified through Phase 3. The architectural seam (`HeroSceneSlot`) exists as an empty Server Component layer today; this phase converts it into a **small client gate** that conditionally lazy-loads an isolated R3F chunk without changing hero layout, z-index, or LCP element (still the Bricolage H1 in SSR HTML).

The verified integration recipe for Next.js 16 + R3F 9.6 + three 0.185 is well-established: mark the canvas tree `"use client"`, import it exclusively via `next/dynamic(() => import(...), { ssr: false })`, and never let `three` participate in the server compilation graph. The project's existing `MotionProvider` pattern — `useSyncExternalStore` gate + `dynamic import()` only when the gate is open — is the direct analog for the 3D gate; copy that shape, do not invent a parallel gating mechanism.

The scene itself should be **procedural, not asset-driven**: a topology lattice matches D-01 engineered identity, avoids the Draco/KTX2 research flag for v1, and keeps GPU memory predictable (no 4K textures). Scroll coupling uses the architecture research's "scroll progress bridge" — GSAP writes, R3F reads via ref — explicitly **not** drei `ScrollControls`, which would create a second scroll authority and conflict with Lenis + ScrollTrigger (PITFALLS + ARCHITECTURE anti-pattern).

The second half of the phase is launch hardening: production URL verification. Local LHCI already shows LCP ~2762–2919ms with Bricolage H1 (font-bound, accepted in Phase 3); production Vercel LCP remains the calibrated source of truth. The 3D layer must not worsen that — it loads after first paint into a behind-content layer, so LCP element should remain the H1. Still, Phase 4 Success Criterion 3 requires an explicit production re-run with 3D enabled.

**Primary recommendation:** Ship in four vertical MVP slices: (1) capability gate + lazy empty canvas proof, (2) procedural topology scene + scroll bridge, (3) context-loss/disposal + Playwright gate tests, (4) production launch verification checkpoint.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Hero SSR content (name, role, value-prop) | Server (SSG HTML) | — | Unchanged; WOW-04 / D-17 — 3D never gates this |
| Capability tier detection | Client (`useSyncExternalStore`) | — | Browser-only signals; SSR default = tier 0 (no 3D) |
| R3F Canvas + procedural scene | Client lazy chunk (`next/dynamic`) | — | WebGL is client-only; must not ship in initial bundle |
| Scroll progress for 3D | Client — GSAP ScrollTrigger writes ref | Client — R3F `useFrame` reads ref | Single scroll authority (Lenis + ScrollTrigger) preserved |
| DOM animation (hero intro, reveals, etc.) | Client — existing GSAP stack | — | Unchanged; D-08 single engine |
| Launch verification (LHCI, UAT) | CI + human on production URL | — | TECH-01 / MODE-01 / MODE-02 re-check |

## Standard Stack

### Core (new this phase)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `three` | 0.185.1 [VERIFIED: npm registry 2026-07-08] | WebGL engine | STACK.md recommendation; procedural scene needs only core three |
| `@react-three/fiber` | 9.6.1 [VERIFIED: npm] | React renderer for three.js | React 19 line; peer `react >=19 <19.3` matches pin `~19.2.0` |
| `@react-three/drei` | 10.7.7 [VERIFIED: npm] | `Line`, `PerspectiveCamera` helpers | Avoid hand-rolling line primitives; tree-shake unused exports |
| `@types/three` | 0.185.x (dev) | TypeScript | Standard companion to three 0.185 |

### Explicitly NOT adding

| Library | Why |
|---------|-----|
| `@react-three/postprocessing` | GPU cost; v1 signal is geometry + accent pulse only (D-20) |
| `zustand` (for scroll bridge) | Module-scope ref is simpler and matches ARCHITECTURE.md bridge pattern without a new dependency |
| `leva` / GUI debug | Dev-only temptation; keep production bundle clean |

**Installation (gated behind package-legitimacy checkpoint in 04-01):**
```bash
pnpm add three@0.185.1 @react-three/fiber@9.6.1 @react-three/drei@10.7.7
pnpm add -D @types/three@0.185.0
```

**React pin check:** `react@~19.2.0` (currently 19.2.7) satisfies R3F 9.6.1 peer `<19.3`. Re-verify before install.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `three` | npm | created 2014; latest 0.185.1 | ~2M/wk | github.com/mrdoob/three.js | OK | Approved |
| `@react-three/fiber` | npm | pmndrs org; v9 current | ~1M/wk | github.com/pmndrs/react-three-fiber | OK | Approved |
| `@react-three/drei` | npm | pmndrs org; v10 current | ~1.5M/wk | github.com/pmndrs/drei | OK | Approved |
| `@types/three` | npm | DefinitelyTyped | — | github.com/DefinitelyTyped/DefinitelyTyped | OK | Approved (dev) |

**Packages flagged [SUS]:** none.

**`postinstall` audit (run at 04-01 checkpoint):** `npm view three scripts.postinstall`, same for fiber/drei — expect empty/undefined per Phase 3 motion-deps precedent.

## Architecture Patterns

### Pattern 1: Capability Gate (extends MotionProvider)

**What:** A `useCapabilityTier()` hook returning `"static" | "animated" | "animated+3d"` — but for this single-route hero, only the boolean `animated+3d` matters for mounting.

**When:** Once, inside `HeroSceneSlot` (converted to client boundary).

**Gate conditions (ALL required for 3D):**
```typescript
function getCanMount3d(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  if ((navigator.hardwareConcurrency ?? 0) < 4) return false;
  // WebGL2 probe — create canvas, get context, immediately lose
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2", { powerPreference: "low-power" });
    return gl !== null;
  } catch {
    return false;
  }
}
```

**SSR:** `getServerSnapshot` returns `false` always — matches MotionProvider / WOW-04 first-paint contract.

### Pattern 2: Lazy Mount Stack (no preloader)

**What:** Three nested lazy boundaries:
1. `HeroSceneSlot` (client, tiny) — gate check only
2. `dynamic(() => import("./hero-scene-canvas"), { ssr: false })` — R3F chunk
3. Inside canvas mount effect: `requestIdleCallback(() => setReady(true), { timeout: 2000 })` — defer GPU work past first paint

**Loading UI:** `null` / empty — the slot stays visually empty until the scene renders; NO spinner (WOW-04 / unskippable preloader prohibition).

### Pattern 3: Scroll Progress Bridge (GSAP → R3F)

**What:** Module-scope ref written by ScrollTrigger, read by `useFrame`:

```typescript
// src/lib/hero-scene-progress.ts
export const heroSceneProgress = { current: 0 };

// In hero-intro.tsx or a tiny hero-scroll-bridge.tsx (client):
// ScrollTrigger.create({ trigger: "#hero", start: "top top", end: "bottom top",
//   onUpdate: (self) => { heroSceneProgress.current = self.progress; invalidate?.(); } });

// In hero-scene-topology.tsx useFrame:
// const p = heroSceneProgress.current;
// mesh.rotation.y = p * 0.14; // ±8° total
// invalidate() called from ScrollTrigger onUpdate via ref to R3F invalidate
```

**Anti-pattern:** drei `<ScrollControls />` — REJECTED (second scroll authority).

### Pattern 4: Context Loss → Graceful Degrade

**What:** `onCreated` on Canvas captures `gl`; add `webglcontextlost` listener → `event.preventDefault()`, dispose, set local `dead` state → unmount canvas, parent shows empty layer.

**Anti-pattern:** `gl.forceContextRestore()` retry loops — unreliable on mobile (R3F discussion #723); product requirement is fallback, not recovery.

### Pattern 5: Disposal Discipline

**What:** All `BufferGeometry` + `Material` created in `useMemo` with cleanup in `useEffect` return; on context loss, traverse and dispose.

**Target:** `renderer.info.memory.geometries` stable across 5 min idle on desktop devtools.

## Scene Concept: Infrastructure Topology (D-20)

**Metaphor:** The hero background is a **living cluster topology** — nodes as service instances, edges as dependencies — echoing OpenShift/K8s/DevOps work without literal brand icons. Visual vocabulary matches Phase 3: thin lines (`--border` tone), mono-coordinate spacing, one `--accent` pulse.

**Composition:**
- 12 nodes: instanced `octahedronGeometry` (low poly) at seeded grid positions
- 18 edges: `drei` `<Line>` segments between node pairs
- 1 accent pulse: `shaderMaterial` or animated `lineDashOffset` on a single highlighted path (A→B→C)
- Camera: fixed perspective, subtle scroll-driven yaw
- Lighting: `<ambientLight intensity={0.6} />` + single `<directionalLight />` — no environment map (no HDR fetch)

**Why not generic blob/sphere:** FEATURES.md + SUMMARY.md explicitly warn against awwwards-clone tropes; procedural topology is identity-specific to "engineer who operates systems."

## Launch Verification Matrix (D-26)

| Check | Method | Pass criteria | Owner |
|-------|--------|---------------|-------|
| LCP ≤ 2500ms mobile (TECH-01) | `pnpm exec lhci autorun` against **production** `https://lsiem.de/de` + `/en` OR Vercel production deployment URL with 3D gate forced open on desktop audit | LCP assertion passes; script:size initial route still ≤ 184643 | Automated + human confirms production URL |
| 30-second stopwatch (MODE-01) | Human on production, both locales | Name, role, skills, contact found < 30s | Human checkpoint (04-04) |
| Reduced-motion walkthrough (MODE-02) | Playwright `emulateMedia` + human OS setting on production | Full content, no canvas, no errors | Automated + human |
| Mid-tier Android | Real device (e.g. Pixel 6a class) | No context loss in 30s hero scroll; if gated off, site still "feels intentional" | Human checklist |
| 3D visible desktop | Human pointer:fine, no reduced-motion | Topology scene visible behind hero, does not obscure text | Human |
| WOW-01 complete | Above + evals | Signature moment present on capable tier only | Phase close |

**LCP note:** Bricolage H1 was ~2755ms locally in Phase 3 (font-bound). Production Vercel may differ. If production LCP still > 2500ms **without** 3D regression, escalate per STATE.md — do not blame 3D for a pre-existing font cost. Phase 4 must prove 3D did not **add** regression beyond baseline.

## Common Pitfalls

### Pitfall 1: three.js in the initial bundle

**Symptom:** LHCI `resource-summary:script:size` fails after Phase 4.

**Avoid:** Static analysis after `pnpm build`: homepage initial chunk must not contain `three` string. Use Next build output + optional `grep -r "three"` on the specific page chunk. Only the async chunk may reference three.

### Pitfall 2: Canvas as LCP element

**Symptom:** LCP becomes WebGL framebuffer.

**Avoid:** Canvas mounts after idle, `aria-hidden`, `-z-10`, no `fetchpriority`, no `loading=eager` on canvas. LCP stays H1.

### Pitfall 3: Shipping 3D to mobile

**Symptom:** Context loss, battery drain, jank.

**Avoid:** D-23 gate excludes `pointer: coarse` entirely — mobile never downloads the R3F chunk.

### Pitfall 4: ScrollControls conflict

**Symptom:** Scroll jitter, Lenis desync.

**Avoid:** Bridge ref only. GSAP remains scroll authority.

### Pitfall 5: Context-loss infinite retry

**Symptom:** Console spam, broken page.

**Avoid:** D-25 — unmount to empty layer, log once in dev.

## Don't Hand-Roll

| Need | Don't build | Use instead |
|------|-------------|-------------|
| 3D lines between points | Raw `THREE.Line` boilerplate | `drei` `<Line>` |
| WebGL in Next.js | Import Canvas in Server Component | `next/dynamic` + `"use client"` |
| Device capability | User-agent sniffing | `matchMedia` + `hardwareConcurrency` + WebGL2 probe |
| Scroll-linked 3D | drei ScrollControls | GSAP ScrollTrigger → ref → `useFrame` |
| Per-frame React updates | `setState` in `useFrame` | Mutate refs + `invalidate()` |

## Recommended Project Structure (additions)

```
src/
├── components/motion/
│   ├── hero-scene-slot.tsx          # MODIFIED — client gate + lazy mount
│   ├── hero-scene-canvas.tsx        # NEW — dynamic import target, <Canvas>
│   ├── hero-scene-topology.tsx      # NEW — procedural scene graph
│   └── hero-scroll-bridge.tsx       # NEW — ScrollTrigger → heroSceneProgress
├── lib/
│   └── hero-scene-progress.ts       # NEW — module-scope progress ref
evals/
└── hero-3d.spec.ts                  # NEW — gate + fallback contracts
```

## Sources

- npm registry (`npm view`, 2026-07-08) — three@0.185.1, @react-three/fiber@9.6.1, @react-three/drei@10.7.7 peer ranges — HIGH
- `.planning/research/STACK.md`, `ARCHITECTURE.md`, `PITFALLS.md` — project baseline — HIGH
- `.planning/phases/03-design-direction-immersive-experience/03-RESEARCH.md` — D-13 seam, motion gate patterns — HIGH
- [R3F + Next.js dynamic import pattern](https://noqta.tn/en/tutorials/react-three-fiber-nextjs-3d-interactive-web-2026) — MEDIUM
- [R3F context loss discussion #723](https://github.com/pmndrs/react-three-fiber/discussions/723) — MEDIUM
- [Utsubo Three.js performance tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips) — frameloop demand, disposal — MEDIUM
