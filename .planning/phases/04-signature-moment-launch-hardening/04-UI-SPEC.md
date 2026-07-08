# Phase 4: Signature Moment & Launch Hardening — UI Spec

**Phase:** 4
**Scope:** Hero background 3D layer only + launch verification UX contracts
**Art direction lock:** D-01, D-02, D-20 (inherits Phase 3 engineered identity)

---

## Hero 3D Layer Placement (D-13 — unchanged geometry)

| Property | Value |
|----------|-------|
| Container | `<HeroSceneSlot />` inside `#hero` `relative` wrapper |
| Position | `absolute inset-0 -z-10 pointer-events-none` |
| A11y | `aria-hidden="true"` always |
| Interaction | None — decorative background only |
| Content stack | Hero text/grid intro remains `relative` above the canvas |

**No layout change** from Phase 3: the 12-column hero grid, H1 clamp, and `HeroIntro` timeline are untouched.

---

## Capability Gate UX (D-23)

| Visitor context | What they see |
|-----------------|---------------|
| Desktop, `pointer: fine`, motion allowed, WebGL2, ≥4 cores | Topology scene fades in after idle (no spinner) |
| `prefers-reduced-motion: reduce` | Empty layer — identical to Phase 3 |
| Touch / `pointer: coarse` | Empty layer — mobile deliberate static hero |
| Low CPU (< 4 cores) or no WebGL2 | Empty layer |
| WebGL context lost mid-session | Canvas unmounts → empty layer; hero text unaffected |

**No user-facing toggle** for 3D — tiering is automatic (matches D-17 layered enhancement model).

---

## Topology Scene Parameters (D-20)

### Visual vocabulary

| Element | Spec |
|---------|------|
| Nodes | 12 instances, low-poly octahedron, uniform small scale (~0.08 world units) |
| Edges | 18 line segments, 1px equivalent, color from `--border` token (read via `getComputedStyle` on `document.documentElement`) |
| Accent pulse | ONE directed path (3 edges: node index 0→4→8→11), color `--accent`, animated dash offset or emissive intensity |
| Background | Transparent — page `--background` shows through |
| Fog | None |
| Postprocessing | None (v1) |

### Spatial layout

- Nodes arranged on a **flattened XZ grid** with slight Y jitter (±0.15) for depth.
- Seed positions (normalized −1…1, scaled by 2.2):

```
(−0.8,0,−0.6) (−0.3,0,−0.9) (0.2,0,−0.5) (0.7,0,−0.8)
(−0.9,0,0.0) (−0.2,0,0.1) (0.4,0,−0.1) (0.9,0,0.2)
(−0.6,0,0.7) (−0.1,0,0.8) (0.3,0,0.6) (0.8,0,0.9)
```

- Edge pairs (undirected, 18 total): connect each node to 1–2 nearest neighbors plus the accent path chain — exact list fixed in `hero-scene-topology.tsx` constants (planner discretion: executor wires the table from UI-SPEC seed).

### Camera & motion (D-22)

| Parameter | Value |
|-----------|-------|
| Camera | `PerspectiveCamera` fov 45, position `[0, 0.3, 4.5]`, lookAt origin |
| Scroll range | Hero `#hero` from `top top` to `bottom top` (ScrollTrigger) |
| Scroll effect | `rotation.y = progress * 0.14` (~8°), subtle `position.x = (progress - 0.5) * 0.2` |
| Intro | No separate 3D intro timeline — scene appears at opacity 0→1 over 600ms once mounted (CSS opacity on canvas wrapper OR R3F material opacity) |

### Performance budget (D-24)

| Constraint | Target |
|------------|--------|
| Draw calls | < 50 |
| Vertices | < 1000 total |
| DPR | `[1, 1.5]` |
| Frame loop | `demand` — only `invalidate()` on scroll progress change |
| Initial route JS | Must NOT include `three` (async chunk only) |

---

## Loading / Mount Choreography (D-21)

```
First paint (SSR)     → hero H1/value-prop/nav visible (unchanged)
Hydration             → HeroSceneSlot gate evaluates (sync, no flash)
Gate closed           → empty aria-hidden div (Phase 3 equivalent)
Gate open             → requestIdleCallback → dynamic import R3F chunk
Chunk loaded          → Canvas mount, scene fade-in 600ms
Scroll                → bridge ref updates, invalidate demand frames
```

**Forbidden:** full-screen loader, "Loading 3D…" copy, blocking overlay, preloader gate.

---

## Reduced-Motion & Mobile Contract (inherits Phase 3)

| Feature | Reduced-motion | Mobile (coarse) |
|---------|----------------|-----------------|
| WebGL canvas | Never mounts | Never mounts |
| Hero SSR content | Full | Full |
| HeroIntro GSAP | Skipped (Phase 3) | Skipped on touch (Phase 3) |
| Topology scene | N/A | N/A |

---

## Launch Verification UX Checklist (D-26 — human, production)

Document results in `04-UAT.md` at phase close (created during 04-04 execution).

| # | Dimension | Steps |
|---|-----------|-------|
| 1 | **3D wow (desktop)** | `/de` + `/en`, pointer:fine, motion on — topology visible behind hero, text readable |
| 2 | **Skippable** | 3D never blocks facts; first paint unchanged |
| 3 | **Quiet** | OS reduced-motion — no canvas, full content both locales |
| 4 | **Mobile** | Narrow viewport — no canvas, no scrolljacking, intentional layout |
| 5 | **30s stopwatch** | External tester, production, both locales |
| 6 | **Android device** | Mid-tier phone — either gated off cleanly OR stable 30s scroll without black canvas |
| 7 | **CWV** | Production LHCI or Vercel Speed Insights — LCP/TBT/CLS documented |

---

## Copywriting Contract

No new user-facing strings required for the 3D layer (decorative, `aria-hidden`). Launch UAT is operator-facing only.
