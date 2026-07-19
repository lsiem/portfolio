# Kontinuum — Final Design Spec
## One Particle Field, Many Formations (lsiem.de Three.js extension)

**Base concept:** Kontinuum (winning score 8.33), hardened with the judges' objections resolved and the strongest verified ideas grafted from Weltlinie (camera spline + station registry, transition conductor with self-healing decay, frame-counter eval, route→formation registry derived from content slugs) and Vitrine (zero-visible ⇒ frameloop never culling, 700ms navigation watchdog, wave-based shipping with per-wave green evals).

---

## 1. Vision

The constellation stops being hero decoration and becomes the site's single persistent actor. One particle pool (~2,500 points + edges on desktop, ~900 on mobile — the exact shared-BufferAttribute architecture already shipped in `constellation.tsx`) lives in a fixed, full-viewport, pointer-events-none canvas mounted once at layout level, behind the DOM, only for visitors who pass the existing capability gate. As you scroll, the field recomposes: constellation in the hero, a condensing filament along the career rail, a rectangular lattice echoing the project bento, orbiting skill clusters, corner brackets framing the about section, a 53×7 grid built from the real GitHub contribution data, and an @-glyph convergence behind the contact CTA. Route changes scatter the field and reassemble it on the destination page — the visitor never sees a page load, only the same living material changing shape, even across the DE↔EN switch. The DOM stays byte-render-identical for excluded visitors; the field is pure additive atmosphere. Scroll itself becomes the navigation instrument, and absence (the about "frame", near-invisible legal pages) reads as intent.

---

## 2. Canvas architecture

### 2.1 Mounting strategy — layout renders a GATE, never a canvas

```
src/app/[locale]/layout.tsx
└── <StageSlot />                        ← Server Component, sibling AFTER footer, outside MotionProvider
    └── <StageGate />                    ← "use client" boundary, the ONLY mount decision in the app
        └── null                            (SSR, first client render, tier "none", reduced motion, context lost)
        └── <SceneErrorBoundary>            (otherwise, post idle decision)
            └── dynamic(ssr:false) <StageCanvas tier />   ← ALL three/R3F value imports live here
```

- **`StageSlot`** — Server Component: `aria-hidden`, `fixed inset-0 -z-10 pointer-events-none`. Zero client JS. Carries a lint-contract comment: *"This slot may only ever render StageGate. Hoisting a Canvas above the gate re-creates the reverted d9b8e57 architecture (04-VERIFICATION blocker 2)."*
- **`StageGate`** — a direct generalization of the verified `hero-scene-gate.tsx`, semantics identical: reduced-motion via `useSyncExternalStore` (getServerSnapshot()=false; unconditional "none", beats `?webgl=force`; live `matchMedia` change listener unmounts mid-session); window `load` + `requestIdleCallback` before calling `decideSceneTier()` from `src/lib/capability.ts` **unchanged** (`?webgl=off/force`, saveData, deviceMemory, webgl2 caveat probe, detect-gpu with self-hosted `/benchmarks`, all seven `sceneTierFromGpu` contract cases incl. the PR #21 FALLBACK/software-renderer rule); tier "none" renders null forever, no placeholder; silent `.catch` on the dynamic imports.
- Because App Router layouts never remount, the WebGL context persists across `/de ↔ /en` and page ↔ case-study navigations for free. This is the reverted attempt's one good idea done right: **the layout renders a gate, the gate renders null until proven capable.**
- **`StageCanvas`** (inside the lazy chunk): `<Canvas frameloop="demand" dpr={[1, tier==='mobile' ? 1.25 : 1.5]} gl={{ powerPreference: 'low-power' }}>`. **`failIfMajorPerformanceCaveat` is explicitly NOT set** — capability.ts already ran that probe pre-mount, and setting it on the Canvas would break the `?webgl=force` CI SwiftShader path (Weltlinie judge finding, resolved). `onCreated` captures `state.invalidate` into the bridge and wires `webglcontextlost` → `preventDefault()` + silent gate unmount (D-10: DOM is the fallback). `visibilitychange` hidden ⇒ frameloop flips to `"never"` + `bridge.paused = true`.
- **No drei.** One scene, one camera, no per-section viewports to scissor — `<View>`, ScrollControls, PerformanceMonitor are all unnecessary. Runtime quality is handled by a ~40-line frame-time self-monitor (§6.3) instead of drei PerformanceMonitor, which is architecturally mismatched with a demand frameloop (it infers quality from inter-frame deltas — pathological under sparse invalidation; Weltlinie judge finding, resolved by not using it).
- **Bridge:** all producers write to the extended `scene-bridge.ts` plain mutable module object (proven D-08 one-way surface). React state is never touched on any per-frame or per-scroll-tick path. Full contract in §5.1.

### 2.2 Chunk strategy

| Chunk | Contents | Loading |
|---|---|---|
| Eager (unchanged shape) | `StageGate` (replaces `HeroSceneGate` byte-for-byte in role), extended `scene-bridge.ts`, `StageFormation` marker, `TransitionLink` bridge writes | Route bundle; **measured** net delta budget ≤ +700 B gz (§6.1) |
| Stage chunk (`dynamic ssr:false`) | three 0.185, @react-three/fiber 9.6, particle stage, formation engine, formations, scroll director, transition conductor, glyph point JSON | Post window-load + idle + tier decision; never blocks LCP |
| — | No GLTF, no draco, no postprocessing, no drei | DSGVO decoder-CDN trap never arises |

---

## 3. Section-by-section plan

**Global rule (resolves the formation-drift dealbreaker):** formation targets are computed in **document space** (`rect.top + scrollY`, unprojected to the z=0 scene plane once, after `document.fonts.ready`, re-measured on debounced-200ms resize and on locale route change). Per frame, the single stage group applies `group.position.y = -bridge.scrollY * worldPerPixel` — one transform, zero re-measurement, so DOM-anchored formations track their DOM twins exactly during scroll. A camera CatmullRomCurve3 spline (from Weltlinie: one control point per station, `camera.position = curve.getPointAt(smoothed pageProgress)` with lerped lookAt) adds slow dolly/parallax on top. Formations still read as *echo*, not pixel-alignment, so residual 10px drift is invisible.

| Section | Formation & choreography | Evolves | Reduced-motion / tier-"none" / FALLBACK-software DOM equivalent |
|---|---|---|---|
| **#hero** (HeroIntro) | `constellation` — the shipped scene verbatim: seeded graph from `constellation-data.ts`, pointer attraction on pointer:fine, drift gated on `bridge.introBeatAt` (D-09 boot beat preserved). New: Lenis velocity → noise amplitude (scroll stirs the field). Ambient drift is a self-invalidating rAF producer active **only while #hero or #contact intersects the viewport and the tab is visible** (IntersectionObserver — Vitrine graft), so the at-rest invariant (§7) holds mid-page. | `HeroSceneSlot`/`HeroSceneGate` retired; `constellation.tsx` interior absorbed as the hero formation. Hero keeps a positioning/contrast div only. | Today's byte-identical DOM hero; HeroIntro transform-only reveals untouched (WOW-04). |
| **#career** (CareerSpine) | `filament` — particles condense into a vertical thread hugging the rail's document-space x (lg+), node knots at each `NN·YYYY` tick, ITSC gets a triple-knot (Weltlinie graft). CareerSpine's existing ScrollTrigger writes its progress to `bridge.sectionProgress`; a brightness pulse travels up the filament in sync with the DOM rail fill. Below lg: low-opacity background sheet. | `career-spine.tsx` gains one bridge write in its existing onUpdate. | Rail + Reveal exactly as shipped — the rail IS the filament's reduced-motion twin. |
| **#projects** (ProjectBento) | `lattice` — particles snap toward a sparse grid measured from the actual bento `<li>` rects (document space, scroll-compensated per the global rule). Featured cells (ELIA, Vidama) double density. pointer:fine hover writes `bridge.hoverRect`; nearby particles tighten toward the frame. | `project-bento.tsx` gains a 3-line hover producer that no-ops when the bridge is inert. | Bento border/typography hierarchy carries the design; one-`<li>`-per-project a11y contract untouched. |
| **#skills** | `orbits` — one loose radial cluster per domain (count = number of `h3` groups read at measure time, never localized strings), slow low-amplitude orbit, field recedes to ~40% opacity (reading section). | None (section stays static DOM). | Static skills column as shipped. |
| **#about** | `frame` — field thins to faint corner brackets echoing the photo-frame tick motif, then recedes to the opacity floor. The restraint beat. | None. | Identical DOM, TransitionLink to /about. |
| **#activity** (GitHubHeatmap) | `grid` — particles quantize into the 53×7 matrix; brightness maps the REAL build-time levels. Data path: the SSR heatmap renders `data-level="0–4"` per day cell (tiny, gzip-trivial HTML it can also use for styling — resolves the "dead JS bytes" objection: it's compressible markup, not script, and dual-purpose); the chunk reads cells once via `querySelectorAll`, defensively parses into `bridge.heatmapLevels`; malformed/null → neutral wave-sheet fallback. Zero new fetches. | `github-heatmap` component gains per-cell `data-level`. | The SSR heatmap itself — already a grid; the 3D grid is literally the DOM's shape lifted into the field. |
| **#contact** | `glyph` — pool converges into an @-outline (points sampled at build time from an SVG path via `scripts/sample-glyph.ts` into a static JSON in the chunk) behind the CV/contact buttons. Magnetic's pointer writes feed local repel; hover fires a radial ripple impulse (Cartier micro-gesture, from Weltlinie). Ambient producer active here (see hero). | None (Magnetic untouched). | Magnetic-wrapped buttons as shipped; reduced motion already strips Magnetic (MODE-02). |
| **Case studies** `/case-studies/[slug]` | `halo` — sparse orbital ring at ~25% density behind the SplitHeading h1, receding to near-zero past the fold. Route→formation registry derives keys from the same `content.ts` slugs that generate the routes; unknown route → `rest` (Weltlinie graft — degrades to calm, never crashes). | Page renders `<StageFormation id="halo" />`. | SplitHeading + Reveal MDX exactly as shipped. |
| **Prose/legal** `/about`, `/impressum`, `/datenschutz` | `rest` — near-invisible drift, amplitude ~0. Legal pages must not perform. | Pages render `<StageFormation id="rest" />`. | Unchanged. |

**Scroll choreography wiring.** Desktop (pointer:fine — GSAP already loaded by MotionProvider): a section config array is resolved against the live DOM; for each adjacent pair, `ScrollTrigger.create({ trigger, start:'top 80%', end:'top 20%', scrub:true, onUpdate: s => { bridge.formation = {from,to,t:s.progress}; maybeInvalidate(s.progress); }})` — morphs in boundary zones, holds inside sections (entrance→hold→exit beats, scrubbed not timed). `maybeInvalidate` applies the epsilon gate: **no invalidate unless |Δprogress| > 0.001** (Lenis settle ticks must not force redundant GPU frames). Mobile (tier "mobile"): GSAP stays unfetched on pointer:coarse (Lighthouse mobile budget invariant) — a passive rAF-throttled scroll listener reuses the `constellation-canvas.tsx` touch-producer pattern to compute the same bridge fields from cached offsetTops. Both paths share **one pure progress-computation function with unit tests** (Weltlinie graft) so stations can't misalign between producers. Fast anchor jumps (AnchorLink→Lenis) just scrub the morph quickly — reads as intentional, no conductor involvement.

Formation morphing: the single `useFrame` lerps the shared position BufferAttribute between precomputed from/to Float32Arrays with index-hashed per-particle stagger (edge-first dissolve), applies velocity turbulence, uploads once, draws twice (points + lines). **Nothing allocates per frame; no setState exists anywhere on the scroll path.** Measurement (~10 rects + ~2,500 × 8 formations ≈ 240 KB of Float32Arrays) runs sliced across idle callbacks after mount.

---

## 4. Route transitions

Choreographed around the **existing** `TransitionLink` GSAP crossfade — never the View Transitions API (it would bitmap-freeze the live canvas; the persistent canvas is simply never part of the DOM crossfade target).

**Canvas live (capable tier — including FALLBACK GPUs that are not software renderers, per PR #21):**
1. **OUT — hard-capped at 300ms** (`--motion-*` token): `transition-link.tsx` sets `bridge.transition = {phase:'out', startedAt: now}` and GSAP tweens `transition.t` 0→1 with `onUpdate: bridge.invalidate`. In-scene: deterministic per-index scatter velocities from the seeded PRNG + curl-noise turbulence — the field bursts apart while the DOM crossfades out.
2. **`router.push()` fires at the 300ms mark, never awaited on the flight** — navigation is not hostage to spectacle (30s-stopwatch protection; Weltlinie graft).
3. **IN — ~500ms:** the destination's `<StageFormation id>` marker writes `bridge.routeFormation` once on mount; a `usePathname` subscriber in the chunk (the transition conductor) tweens `t` 1→0, easing particles from scattered positions into the destination formation while the DOM fades in.
4. **Self-healing (resolves the race risk):** the conductor never waits on a handshake — the scene always decays toward `bridge.routeFormation`; any transition older than 900ms (`now - startedAt`) is force-completed, and a **700ms watchdog** (Vitrine graft) guarantees the out-state can never strand mid-scatter on fast double-clicks, back/forward, or bfcache restores.

**Canvas absent (tier "none", `?webgl=off`, context lost, chunk failed):** `TransitionLink` behaves **byte-identically to today** — the bridge writes are dead letters (invalidate is a module-level no-op until the canvas mounts, and no consumer exists). GSAP main-crossfade as shipped.

**Reduced motion:** instant navigation exactly as shipped — there is no canvas by construction, and TransitionLink's existing reduced-motion branch is untouched. Modifier-click passthrough untouched.

**DE↔EN:** LocaleSwitcher navigation flows through the same mechanic; the field survives translation. (Verify LocaleSwitcher uses client navigation in Wave 1; if it hard-navigates, route it through TransitionLink — a one-line change owned by WP-D.)

---

## 5. File plan — five non-overlapping work packages

### 5.1 Interface contracts (frozen before parallel work starts)

**Contract 1 — `StageBridge`** (owned by WP-A; all other packages import types only):

```ts
export type FormationId =
  | 'constellation' | 'filament' | 'lattice' | 'orbits' | 'frame'
  | 'grid' | 'glyph' | 'halo' | 'rest';

export interface StageBridge {
  formation: { from: FormationId; to: FormationId; t: number }; // scroll director writes
  routeFormation: FormationId;                                   // StageFormation writes on mount
  sectionProgress: number;                                       // career-spine writes 0..1
  pageProgress: number;                                          // scroll producers write 0..1 (camera spline)
  scrollY: number;                                               // scroll producers write, px
  scrollVelocity: number;                                        // Lenis listener writes |v|; useFrame decays
  pointer: { x: number; y: number; active: boolean };            // existing producer, unchanged semantics
  hoverRect: { x: number; y: number; w: number; h: number } | null; // project-bento writes (doc space, px)
  heatmapLevels: Uint8Array | null;                              // chunk reads DOM once, writes here
  transition: { phase: 'idle' | 'out' | 'in'; t: number; startedAt: number }; // transition-link writes
  ambientVisible: boolean;                                       // IntersectionObserver producer (chunk)
  introBeatAt: number;                                           // existing (hero-intro), unchanged
  paused: boolean;                                               // visibilitychange producer
  invalidate: () => void;                                        // no-op until StageCanvas onCreated replaces it
}
```

**Contract 2 — formation builder** (WP-B implements, WP-C supplies input): `buildFormation(id: FormationId, layout: MeasuredLayout, count: number): Float32Array` where `MeasuredLayout = { sections: Record<string, DocRect>; bentoCells: DocRect[]; spineX: number; heatmap: Uint8Array | null; viewport: {w,h}; worldPerPixel: number }` and `DocRect` is document-space px. WP-C exports `SECTION_SEQUENCE: ReadonlyArray<{ el: string; formation: FormationId }>` from `section-config.ts`.

**Contract 3 — test hooks** (WP-B renders, WP-E asserts): the canvas wrapper carries `data-testid="stage-frameloop"`, `data-frameloop="demand"|"never"`, and `data-scene-frames="<int>"` incremented once per rendered frame.

**Contract 4 — DOM data** (WP-D renders, WP-B consumes): heatmap day cells carry `data-level="0".."4"`; the chunk reads `#activity [data-level]` once, parses defensively, falls back to null.

### 5.2 Packages

**WP-A — Stage shell & eager surface** *(foundation; merges first, alone in Wave 1)*
| File | Responsibility |
|---|---|
| `src/components/scene/stage-slot.tsx` (new) | Server Component fixed slot in layout; lint-contract comment |
| `src/components/scene/stage-gate.tsx` (new) | The single gate: reduced-motion store, idle `decideSceneTier()`, error boundary, `dynamic(ssr:false)` |
| `src/components/scene/stage-formation.tsx` (new) | ~15-line client marker: writes `bridge.routeFormation` once on mount |
| `src/components/scene/scene-bridge.ts` (mod) | Extend to the full `StageBridge` contract; `invalidate` defaults to no-op |
| `src/app/[locale]/layout.tsx` (mod) | Render `<StageSlot/>` as sibling after footer |
| `src/app/[locale]/page.tsx` (mod) | Remove `HeroSceneSlot` mount; keep hero contrast div |
| `src/components/scene/hero-scene-gate.tsx`, `src/components/motion/hero-scene-slot.tsx` (delete) | Retired — StageGate supersedes |

**WP-B — Particle stage & formation engine** *(lazy chunk core)*
| File | Responsibility |
|---|---|
| `src/components/scene/stage-canvas.tsx` (new) | Canvas shell: demand frameloop, dpr policy, onCreated invalidate capture, context-loss/visibility producers, test hooks |
| `src/components/scene/stage/particle-stage.tsx` (new) | The single `useFrame`: pool lerp, scroll-offset group transform, camera spline, velocity turbulence, opacity floors, theme-token colors per frame |
| `src/components/scene/stage/formation-engine.ts` (new) | Precomputed Float32Array targets, stagger hashing, morph state machine, transition scatter/decay |
| `src/components/scene/stage/formations.ts` (new) | Procedural builders per `FormationId` (Contract 2); absorbs `constellation-data.ts` graph as `constellation` |
| `src/components/scene/stage/frame-monitor.ts` (new) | Rolling frame-time monitor: sustained >24ms ⇒ halve particle count once, clamp dpr to 1 (no drei) |
| `src/components/scene/stage/glyph-points.json` + `scripts/sample-glyph.ts` (new, dev-only) | Build-time @-glyph point sampling |
| `src/components/scene/constellation-canvas.tsx`, `constellation.tsx` (delete) | Absorbed into the stage |

**WP-C — Scroll choreography producers** *(lazy chunk)*
| File | Responsibility |
|---|---|
| `src/components/scene/stage/section-config.ts` (new) | `SECTION_SEQUENCE` + route→formation registry derived from `content.ts` slugs (unknown → `rest`) |
| `src/components/scene/stage/scroll-director.ts` (new) | Desktop: per-boundary scrubbed ScrollTriggers in `useGSAP`, epsilon-gated invalidate, pageProgress + velocity producers |
| `src/components/scene/stage/touch-scroll-producer.ts` (new) | pointer:coarse: rAF-throttled offsetTop producer (no GSAP fetch on mobile) |
| `src/components/scene/stage/measure.ts` (new) | Document-space rect measurement → `MeasuredLayout`; fonts.ready timing, debounced resize, idle-sliced |
| `src/components/scene/stage/progress.ts` (new) | The one pure shared progress function + unit tests (both producers import it) |

**WP-D — Route transitions & section producers** *(eager touches + lazy conductor)*
| File | Responsibility |
|---|---|
| `src/components/motion/transition-link.tsx` (mod) | ~200 B: transition bridge writes, 300ms OUT cap, watchdog timer; reduced-motion/modifier paths untouched |
| `src/components/scene/stage/transition-conductor.ts` (new) | usePathname subscriber: IN timeline, self-healing decay toward `routeFormation`, 900ms stale force-complete |
| `src/components/motion/project-bento.tsx` (mod) | 3-line pointer:fine hover → `bridge.hoverRect` (inert-safe) |
| `src/components/motion/career-spine.tsx` (mod) | One line: existing ScrollTrigger onUpdate also writes `bridge.sectionProgress` |
| GitHub heatmap component (mod) | Per-cell `data-level` attributes (Contract 4) |
| `src/app/[locale]/case-studies/[slug]/page.tsx`, `src/app/[locale]/[slug]/page.tsx` (mod) | Render `<StageFormation id="halo" / "rest" />` |
| LocaleSwitcher (mod, conditional) | Route through TransitionLink if it currently hard-navigates |

**WP-E — Evals, CI, decision log** *(no src/ overlap)*
| File | Responsibility |
|---|---|
| `evals/scene.spec.ts` (rewrite) | Port to stage semantics: `stage-frameloop` hook, per-route canvas gating, context-loss, zero-cross-origin, tier contract (unchanged), **zero-canvas-before-idle-decision** spec |
| `evals/stage-perf.spec.ts` (new) | At-rest frame-counter invariant (§7) + PerformanceObserver `longtask` scroll smoke under `?webgl=force` |
| `evals/launch/reduced-motion.spec.ts` (verify/extend) | Zero-canvas walkthrough now covers case-study + legal routes |
| `lighthouserc.webgl.json` (mod) | Re-baseline to measured chunk + 10% |
| `.planning/…` decision log (mod) | D-05/D-07/D-08/D-10 updates: pause contract migrates to demand + at-rest invariant, consciously |

Sequencing: WP-A alone is **Wave 1** ("stage parity" — constellation everywhere at hero, behaviorally today's site with the canvas hoisted; full eval suite green before anything else merges). WP-B/C/D/E then run in parallel. Formations ship incrementally (constellation → filament/grid → lattice/glyph/transitions → orbits/frame/halo); graceful abort path is "constellation everywhere at low opacity".

---

## 6. Perf plan

### 6.1 Eager budget — measured, not asserted (resolves judge objection)
- Error gate: 184,643 B (lighthouserc.json, blocking CI). Headroom ~1.4 KB.
- Itemized delta budget: StageGate replaces HeroSceneGate (~0), bridge fields (<200 B), StageFormation (~300 B), TransitionLink writes (~200 B). **Hard budget: ≤ +700 B gz net.**
- **Gating step, not footnote:** WP-A's merge checklist requires `next build` per-route output + `@next/bundle-analyzer` evidence for `/de`, `/en`, one case-study, and `/impressum` attached to the PR (the blocking gate only measures /de and /en — the manual check covers the routes CI is blind to). If over budget, trim by folding the reduced-motion store shared with motion-provider.
- LCP untouched: hero H1 stays the LCP element; the Bricolage subset/preload pipeline is not touched; nothing 3D executes before window load + idle.

### 6.2 Lazy chunk
- Baseline 227 KB gz (measured, 04-03). Estimated +10–18 KB (engine, builders, glyph JSON, conductor) — no drei, no GLTF, no postprocessing. Re-baseline `lighthouserc.webgl.json` to measured + 10% (documented audit, not a merge gate, per D-11).
- Formation precompute idle-sliced (<50ms slices) to keep TBT ≤ 200 ms error gate green.
- Zero new network requests of any kind (procedural + build-time-sampled geometry; benchmarks already same-origin) — the zero-cross-origin eval passes unchanged.

### 6.3 Frameloop / dpr policy
- `frameloop="demand"` always; `"never"` while document hidden. dpr `[1, 1.25]` mobile / `[1, 1.5]` desktop, snapped steps only.
- Invalidation sources, exhaustively: epsilon-gated scroll ticks; pointer moves near interactive formations; theme flips; transition timelines; ambient rAF producer **only** while #hero/#contact intersect and tab visible. Camera/velocity lerps snap below epsilon and stop invalidating (demand-loop leak guard).
- Runtime ladder: frame-monitor halves particle count once + clamps dpr to 1 on sustained >24ms frames. Honest note carried from the judges: active scrolling costs one frame per rAF tick across the full page — strictly more scroll-time GPU work than today's post-hero pause. The compensations are the at-rest zero-frame guarantee, the mobile no-GSAP producer, the ladder, and a real-device mid-tier Android profile before Wave-2 merge (named UAT item).

---

## 7. Test plan

**Must stay green (existing gates, unchanged semantics):**
- `evals/launch/reduced-motion.spec.ts` — zero canvas after scrolling every section, both locales (passes by construction: one gate, one place to fail; now also asserted on case-study + legal routes).
- `evals/launch/stopwatch.spec.ts` — 30s recruiter flow (canvas carries zero content; OUT cap 300ms).
- GPU tier classification (7 pure `sceneTierFromGpu` cases), `?webgl=off`, zero-cross-origin, context-lost silent unmount, WOW-04 no-flash, single-engine, MODE-02, a11y, i18n parity (`pnpm check:content`), SEO, theme specs.
- Blocking Lighthouse CI: script ≤ 184,643 B (error), TBT ≤ 200 ms (error), CLS ≤ 0.1 (error), perf ≥ 0.9 (error), LCP ≤ 2500 ms (warn).

**Consciously rewritten (same phase as the code, decision log updated — named deliverable, not drift):**
- "Scroll past hero pauses canvas" becomes the **at-rest invariant R1**, equally falsifiable: under `?webgl=force`, scroll to mid-page (#skills), wait 1500 ms with no input, read `data-scene-frames` twice 1000 ms apart ⇒ **equal**. R2: with #hero in view, the counter increments (ambient alive). R3: `data-frameloop="never"` when tab hidden.

**New checks:**
- **Zero-canvas-before-decision:** on load with `?webgl=force`, assert canvas count is 0 until after window load + idle (guards the "one review away from ungated" hazard structurally).
- **Long-task smoke (real, not theater):** Playwright scrolls the full page under `?webgl=force` with a `PerformanceObserver({type:'longtask'})` injected; assert no long task > 200 ms attributable during scrub. Blocking pre-merge discipline (Playwright isn't in CI; documented as required local gate like `pnpm test`).
- **Shared progress function unit tests** (desktop vs touch producer parity).
- **Two-theme contrast UAT:** axe + manual contrast pass at every formation state, light and dark, 320/768/1440 — per-formation opacity floors and the `--scene-alpha` per-theme token are the design mitigations; this UAT is a phase acceptance criterion.
- **`pnpm lhci:webgl`** re-run and attached per wave.

---

## 8. New dependencies

**None.** three 0.185 + @react-three/fiber 9.6 + GSAP 3.15 + Lenis 1.3 already in the tree carry everything: one scene, one particle pool, procedural formations means no drei (no View/ScrollControls/useGLTF — and no PerformanceMonitor, replaced by the bespoke frame monitor that actually works under demand frameloop), no postprocessing, no physics, no GLTF/draco toolchain.

- *Deferred, decide-late:* `@react-three/postprocessing@^3.0` for a single selective-bloom pass, desktop tier only, **only** if the un-bloomed field looks flat in design review — budget +~25 KB gz against the webgl lab ceiling and profile GPU cost first.
- *devDependency only:* nothing published — `scripts/sample-glyph.ts` is ~30 lines of hand-rolled SVG path sampling at build time. `r3f-perf` may be used locally, never shipped.
- React stays pinned `~19.2.0` (fiber peer `<19.3`); checked on every dependency PR.