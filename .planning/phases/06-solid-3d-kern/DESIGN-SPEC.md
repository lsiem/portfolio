# KERN — Object-Constancy Solid Stage (SOLID-3D v2)

**Final Design Spec — lsiem.de immersive stage rewrite**
Base concept: KERN (object-theater, top-scored). Grafts: VITRINE shared-element route handoff + drei-free typography discipline; EINSTELLUNG honest chunk re-baseline + camera-rig hygiene. All nine HARD CONSTRAINTS are preserved by construction; every runner-up weakness that applied to KERN is resolved inline (see §2.4 and §7).

---

## 1. Vision

One persistent cast of **384 instanced, beveled shard-prisms** — a single signature form, *der Kern* — assembles as the LS monogram in the hero, then physically disassembles and reassembles shard-by-shard into the centerpiece of every section as you scroll: career plinths, bento picture-frames, skill gyroscope rings, corner brackets, a GitHub contribution voxel terrain, the @-glyph. Route changes are the *same object* exploding along seeded vortex paths and re-forming as the destination shape — no unmount, no context loss, pure matrix retargeting. Everything is procedural (zero GLTF, zero loaders, zero drei, zero runtime font fetch), draws in **two calls** (one shard `InstancedMesh` + one hero morph-skin), and rides the shipped Kontinuum architecture unchanged: the gate decides, one canvas persists, the scene-bridge takes one-way writes, the demand frameloop settles to epsilon and goes silent. The server-rendered DOM remains the complete, byte-identical site for everyone the gate excludes; the canvas is always a visual double, never the content.

---

## 2. Scene architecture

### 2.1 What replaces the particle pool

Point sprites + line segments (2 draw calls, 3 floats/particle) → **rigid instanced solids** (2 draw calls, 9 floats/shard). Every proven v1 mechanism gets a rigid-body upgrade with **identical bridge semantics**:

| v1 particle mechanism | KERN rigid-body successor |
|---|---|
| Float32Array pool → formation targets (3 floats: pos) | Per-instance target arrays (9 floats: pos³ + quat⁴ + scale¹ + colorMix¹) |
| pool lerp w/ stagger (LERP_RATE 8, STAGGER_SPAN 0.35) | pos-lerp + **quat-slerp** w/ the same stagger + rate constants |
| transition scatter along seeded swirl × `transition.t` | **vortex explosion**: seeded swirl axis + seeded angular tumble ∝ t |
| scroll-velocity turbulence (in-loop decay rate 10 / floor 0.5 / cap 60) | velocity **tumble impulse** (identical in-loop decay — consumer owns it) |
| reserve-dust particles | scale-parked spare shards (scale → 0.05) |
| FORMATION_TUNING opacity/drift table | per-formation `scale` + `instanceColor` mix floors (Lambert instances get no per-instance opacity) |
| per-cell heatmap brightness | voxel bar **height + color** from `heatmapLevels` |

### 2.2 Two render objects on the one persistent canvas

**(1) THE SHARD POOL** — one `THREE.InstancedMesh`, `POOL = 384` (hard floor = `#activity` voxel grid 53×7 = 371 + 13 spares). Geometry = one procedurally chamfered hexagonal prism via `ExtrudeGeometry` (~180 tris; built once at init). Per-instance live state in `Float32Array`s: `pos(3)+quat(4)+scale(1)+colorMix(1)`; per-formation **target arrays** of identical shape cached per layout version. One `MeshLambertMaterial` with `instanceColor` (`setColorAt`). Colors flow **only** through `theme-color-resolver` tokens (`--border` base, `--muted` recede, `--accent` pointer/active, `--foreground` flash); `observeThemeColors` refreshes `instanceColor` + invalidates so theme flips repaint at rest. **Draw calls: 1.**

**(2) THE KERN SKIN** — one hero-local mesh: a procedurally displaced `IcosahedronGeometry` (detail 3, ~1.3k verts) with 2 `morphAttributes.position` targets (calm / pointer-agitated) and a `~0.8 kB` `onBeforeCompile` noise-dissolve uniform (`uDissolve`) used only during boot + route transitions. Floats inside the assembled monogram in `#hero`, dissolves to 0 outside the hero boundary. **Draw calls: 1.** Lights: 1 `AmbientLight` + 1 `DirectionalLight`, static.

Total: **2 draw calls + 2 static lights**, `frustumCulled = false` on both (they live at the moving scroll-group origin), zero per-frame allocation.

### 2.3 Module fate (explicit per-file table)

| File | Fate | Note |
|---|---|---|
| `scene/stage-slot.tsx` | **KEEP verbatim** | content-agnostic layout slot |
| `scene/stage-gate.tsx` | **KEEP verbatim** | mount decision; `capability.ts` untouched |
| `lib/capability.ts` | **KEEP verbatim** | HARD constraint 1 — 10 `sceneTierFromGpu` cases frozen |
| `scene/stage-formation.tsx` | **KEEP verbatim** | writes `routeFormation`; FormationId vocab frozen |
| `scene/scene-bridge.ts` | **KEEP / EXTEND** | **zero new fields required**; only the `invalidate` no-op-swap contract preserved |
| `scene/stage-canvas.tsx` | **KEEP shell / EDIT interior** | swap `<ParticleStage/>` → `<KernStage/>`; move `CAMERA_Z=8 / CAMERA_FOV_DEG=45 / VISIBLE_WORLD_HEIGHT` import from `formations.ts` → new `stage/camera.ts`; add a single one-shot `gl.compile(scene, camera)` pre-warm inside the existing post-mount idle window |
| `scene/stage/scroll-director.ts` | **KEEP verbatim** | writes `formation{from,to,t}`; FormationId vocab frozen |
| `scene/stage/touch-scroll-producer.ts` | **KEEP verbatim** | GSAP-free parity via `progress.ts` |
| `scene/stage/progress.ts` + `.test.ts` | **KEEP verbatim** | PROGRESS_EPSILON 0.001 gate; tests stay green |
| `scene/stage/section-config.ts` | **KEEP verbatim** | FormationId vocab (`constellation/filament/lattice/orbits/frame/grid/glyph/halo/rest`) **FROZEN** — see §2.5 |
| `scene/stage/transition-conductor.ts` | **KEEP verbatim** | IN decay t→0, 500 ms, 900 ms stale sweep |
| `scene/stage/frame-monitor.ts` | **KEEP** | latch wired to new degrade rung (§2.4) |
| `scene/stage/measure.ts` + `stage-types.ts` | **KEEP / EXTEND** | `MeasuredLayout` fields `sections/bentoCells/spineX/heatmap` already cover KERN; add `skillClusterRects: DocRect[4]` (measured in the existing slice 2) for gyroscope-ring anchoring |
| `lib/theme-color-resolver.ts` | **KEEP / EXTEND** | may add tokens to the `TOKENS` map; no-hex rule holds |
| `motion/transition-link.tsx` | **KEEP verbatim** | OUT beat, 300 ms cap + 700 ms watchdog |
| `motion/career-spine.tsx` | **KEEP verbatim** | writes `sectionProgress` — finally consumed |
| `motion/bento-hover.tsx` | **KEEP / ACTIVATE** | add the single deferred `bridge.invalidate()` on `hoverRect` write (~30 eager bytes — the **only** eager change) |
| `github-heatmap.tsx` | **KEEP verbatim** | SSR `data-level` cells = Contract-4 data source |
| `scene/stage/particle-stage.tsx` | **REPLACE** → `stage/kern-stage.tsx` | the single `useFrame` |
| `scene/stage/formation-engine.ts` | **REPLACE** → `stage/kern-engine.ts` | per-instance transform state machine |
| `scene/stage/formations.ts` | **REPLACE** → `stage/kern-formations.ts` | 9 builders emitting 9-float targets |
| `scene/stage/glyph-points.json` | **REPLACE** → `stage/glyph-shards.json` | regenerated at shard granularity |
| `scene/constellation-data.ts` | **REPLACE** | graph deleted; **first** extract `seededRandom/randomInRange/ConstellationTier` → `stage/seeded.ts` |

New files: `stage/camera.ts`, `stage/camera-rig.ts`, `stage/seeded.ts`, `stage/kern-stage.tsx`, `stage/kern-engine.ts`, `stage/kern-formations.ts`, `stage/kern-geometry.ts`, `stage/kern-skin.ts`, `stage/dissolve-material.ts`, `stage/monogram-shards.json`, `stage/glyph-shards.json`, `scripts/sample-monogram.ts`, `scripts/sample-glyph.ts` (rewritten).

### 2.4 GSAP + bridge + demand-frameloop → mesh animation with R1–R3 green

The five **content-agnostic obligations** transfer into `kern-stage.tsx`'s single `useFrame`, verbatim in behavior:

1. `data-scene-frames` increment via `setAttribute` per **rendered** frame (never React state).
2. `bridge.paused` early-return.
3. frame-monitor sampling + **degrade rung** (§7.4).
4. `group.position.y = scrollY * worldPerPixel` — the single doc-space scroll compensation.
5. end-of-frame **conditional** `state.invalidate()` only while `engine.needsFrame` — the R1 guarantee.

**Invalidation-source discipline (the §6.3 audited list — KERN's net delta):**

- KEPT sources: epsilon-gated scroll (PROGRESS_EPSILON), pointer moves, theme flips (`observeThemeColors`), transition timelines (conductor + TransitionLink), ambient rAF **only while `#hero`/`#contact` intersect + tab visible**, one-shot layout publishes.
- **NEW source (must be added to the audited list or R1 review fails):** `bento-hover.tsx` `bridge.invalidate()` — pointer-event-driven, self-terminating; the hover-lift decay it feeds is epsilon-snapped (below).

**Settle / epsilon strategy — resolves the top-flagged risk (angular convergence + ~1.35 s worst-case).** `engine.needsFrame` is true iff **any** of:

```
needsFrame =
     maxPosError   > POS_SETTLE_EPS        // 0.003 world units (v1 SETTLE_EPS)
  || maxRotError   > ROT_SETTLE_EPS        // NEW: 0.004 rad (~0.23°)
  || velTumbleMag  > VELOCITY_EPS          // 0.5, in-loop decay rate 10 (v1)
  || cameraOffset  > CAMERA_EPS            // 0.005 (v1 CAMERA_SMOOTH_RATE 6)
  || uDissolve ∉ {0,1} (skin transition active)
  || entranceUnsettled
```

- `POS_LERP_RATE = 8`, `ROT_SLERP_RATE = 8`. Convergence math (documented in `kern-engine.ts` header, mirroring v1): worst-case settle = `ln(startErr/eps)/rate`. Position: `ln(6/0.003)/8 ≈ 0.95 s`. Rotation: `ln(π/0.004)/8 ≈ 0.86 s`. Both **plus** `STAGGER_SPAN 0.35` of the boundary timeline → worst-case ≈ **1.30 s < 1500 ms R1 budget**. Keep `MAX_DT_S 0.25` (elapsed accumulation) vs `MAX_SETTLE_DT_S 2` (convergence exponentials) split so a degraded rAF **completes** rather than stretches.
- **Velocity-aware stagger compression (resolves "mid-boundary chaos" aesthetic risk):** above `scrollVelocity > VEL_STAGGER_THRESHOLD (18)` collapse `STAGGER_SPAN 0.35 → 0.12` (lerped), so fast scrubbing reads as a tighter, more purposeful stream and the worst-case settle window shrinks further.
- **Quaternion hemisphere-normalization (resolves slerp-flip risk):** every formation's target quats are hemisphere-normalized against the **previous formation's** quats at cache-build time (dot < 0 → negate) so reverse scrubbing never produces a 270°-wrong-way spin. Enforced by a build-time invariant + unit test (§8).
- **No new continuous invalidation.** Ambient hero/contact bob rides the **existing** IO-gated rAF pump; ring rotation at `#skills` is **scroll-scrubbed only** (angle = f(boundary + pageProgress)), never time-driven — the R1 park location stays a static sculpture.

GSAP is not re-introduced into the scene loop: all scene motion is a **pure function of bridge numbers** read inside `useFrame` (D-08: GSAP/DOM writes the bridge, `useFrame` reads). The only GSAP in play is the already-shipped `TransitionLink` OUT tween and DOM motion components.

### 2.5 Vocabulary freeze (accepted debt)

`FormationId` names (`constellation/filament/lattice/orbits/frame/grid/glyph/halo/rest`) are **kept unchanged** so `section-config.ts`, both producers, and `StageFormation` markers need **zero edits**. The names are semantically misleading on solids (`constellation` = monogram, `orbits` = gyroscope rings). Documented in the `kern-formations.ts` header with the 1:1 mapping table below. Renaming later touches 4 files atomically and is explicitly out of scope.

| FormationId | KERN meaning | Anchor |
|---|---|---|
| `constellation` | LS monogram (hero) | hero rect |
| `filament` | 7 career plinth-knots | `spineX` |
| `lattice` | bento picture-frame slabs | `bentoCells` |
| `orbits` | 4 gyroscope rings | `skillClusterRects` |
| `frame` | 4 corner-bracket Ls | section rect |
| `grid` | contribution voxel terrain | `heatmap` rect |
| `glyph` | solid @-outline | contact rect |
| `halo` | elliptical slab ring | viewport upper third |
| `rest` | near-invisible deep scatter | first viewport |

---

## 3. Component-by-component plan

For each: **3D treatment**, **3D transition** (entrance/exit/hover), **scroll choreography**, **reduced-motion + tier-none DOM equivalent**. Every treatment decorates SSR DOM that is complete without it.

### `#hero` (HeroIntro, `hero-value-prop`) — `constellation`
- **Treatment:** all 384 shards assemble the LS monogram; per-shard slots sampled at **build time** from extruded `LS` `TextGeometry` (`monogram-shards.json`). The Kern skin breathes inside it. D-06 pointer (pointer:fine only): unproject cursor against the **live camera**, pull shards within a 120px-equivalent radius up to ~10px world toward the cursor, blend `instanceColor` toward `--accent`, drive skin `morphTargetInfluences[1]` (Hubtown-style material reveal).
- **Transition:** Entrance keeps the D-09 boot handshake — shards wait on `bridge.introBeatAt` (3 s watchdog), then fly from deep seeded scatter into monogram slots with per-index stagger while `uDissolve` fades the skin in (mid-boot degrade `FADE_DURATION_S 0.8` bound). Exit → `#career`: staggered per-shard disassembly flight scrubbed by boundary `t`. Hover: pointer pull + skin morph only.
- **Scroll:** ambient bob (tiny elapsed-time sinusoid on shards + skin breathing) runs **only** while the shipped `#hero` IO window intersects — satisfies R2; the pump already stops when hero leaves view.
- **RM / tier-none:** SSR `<h1>` + `hero-value-prop` are the LCP/content; monogram is a visual double. Zero canvas → complete hero.

### `#career` (CareerSpine, `data-testid=career-spine`) — `filament`
- **Treatment:** lg+ → 7 plinth-knots stacked at measured `spineX` (knot 0 ITSC = 3-shard cluster, triple-weighted), thin-scaled connector shards between. Below lg → a receded low-scale sheet over the section rect. **Consumes `bridge.sectionProgress`** (CareerSpine already writes it): the knot nearest the rail progress scales 1.4× and blends toward `--accent` — the brightness pulse v1 deferred.
- **Transition:** Entrance — shards slerp from monogram slots into the spine top-down (stagger keyed to slot y). Exit — plinths shear outward, re-target bento frame slots. No hover (rail is not pointer-targeted).
- **Scroll:** `sectionProgress` changes only during scroll, when frames are already produced → no new invalidation source.
- **RM / tier-none:** DOM career rail + its ScrollTrigger CSS fill; `data-testid` selector untouched (`measure.ts` `SPINE_SELECTOR` depends on it).

### `#projects` (ProjectBento in BentoHover) — `lattice`
- **Treatment:** shards become extruded picture-frame slabs on the perimeters of measured top-level bento cells (2 featured ELIA/Vidama cells = double density), each frame given a slight per-cell z-tilt (physical panels). **`hoverRect` consumer activated:** hovered cell's frame shards lift +0.15 world z, tilt 4° toward pointer, blend `--accent`.
- **Transition:** Entrance — frames "print" around cells in reading order (stagger by cell index). Hover — lift/tilt/blend, decays exponentially with `POS_SETTLE_EPS` snap when hover ends (cannot leak frames at rest). Exit — frames fold flat, stream into orbit-ring slots.
- **Scroll:** `bento-hover.tsx` adds the deferred `bridge.invalidate()`; the write is pointer-event-driven and self-terminating.
- **RM / tier-none:** SSR bento grid with its existing CSS hover states.

### `#skills` (static DOM — **R1's designated at-rest location**) — `orbits`
- **Treatment:** 4 tilted gyroscope rings (one per domain h3 cluster, anchored to new `skillClusterRects`), y-squashed 0.7, scale/colorMix floor receded (v1 opacity-0.4 analog) so the field recedes for reading.
- **Transition:** Entrance — shards spiral onto rings (quat-slerp gives natural tumbling-into-orbit for free). Exit — rings unwind into four corner-bracket streams. **No hover, no ambient source.**
- **Scroll:** **CRITICAL** — ring rotation is **scroll-scrubbed only** (angle = f(boundary progress + pageProgress)), never time-driven, because the R1 eval parks here 1,500 ms and demands zero frames across 1 s. At rest the rings are a static sculpture; convergence snaps below the epsilons and the loop goes silent.
- **RM / tier-none:** plain SSR skills lists.

### `#about` (TransitionLink teaser) — `frame`
- **Treatment:** ~40% of shards form four thin beveled corner-bracket Ls (arm = 16% of min rect dimension, v1 constant), remainder parked as deep low-scale dust (scale → 0.05). Near-monochrome `--border`, no accent — the restraint beat.
- **Transition:** Entrance — brackets slide in from corners with 4-group stagger. Exit — brackets dissolve rank-by-rank into the voxel terrain. No hover.
- **Scroll:** boundary-scrubbed only.
- **RM / tier-none:** SSR about teaser.

### `#activity` (GitHubHeatmap SSR, Contract-4 cells) — `grid`
- **Treatment:** the pool's raison d'être for `POOL=384` — 371 shards become a contribution **voxel bar terrain** fitted to the measured rect: per-instance `y-scale = 0.15 + level/4 * 0.85`, `colorMix` from `bridge.heatmapLevels` (`measure.ts` slice-3 single writer + last-known-good; malformed → flat neutral terrain fallback). One draw call.
- **Transition:** Entrance — bars rise column-by-column left→right (week order) scrubbed by boundary `t`. Exit — bars liquefy, stream into the @-glyph outline. No 3D hover (DOM cells own tooltips).
- **Scroll:** heights/colors re-published on layout-version pickup (one-shot invalidate).
- **RM / tier-none:** SSR heatmap **is** the data; `data-level` attributes intact.

### `#contact` (Magnetic CV/contact buttons) — `glyph`
- **Treatment:** shards converge onto the @-outline (`glyph-shards.json`, position + tangent-orientation quaternion per slot, scaled to 62% of min rect dimension), intensity high.
- **Transition:** Entrance — voxel terrain flows into the outline along seeded paths. Hover — pointer proximity to the glyph injects a radial per-shard offset impulse that decays under `POS_SETTLE_EPS` (the v1-unshipped ripple, cheap). Exit (route nav) — the @ explodes via the vortex transition (§4).
- **Scroll:** second ambient IO window kept — gentle elapsed-time shimmer **only** while `#contact` intersects (R2 partner).
- **RM / tier-none:** SSR contact section + Magnetic buttons (already reduced-motion-aware).

### `/case-studies/[slug]` (`StageFormation id='halo'`) — `halo`
- **Treatment:** 25% of shards as an elliptical ring of slightly tilted slabs at the viewport upper third (rx 34% vw, ry 0.35·rx), rest parked deep; restrained `--muted`. Scroll carries it past the fold via the scroll-group transform.
- **Transition:** Entrance — formed by the route-transition reassembly (conductor IN decay targets `halo`). **Grafted enhancement (VITRINE shared-element):** if the visitor arrived via a featured bento cell, the *same* shard sub-cluster that formed that cell's frame is the seed cohort that re-forms the halo centerpiece — object constancy carried across the route (see §4). Exit — vortex explosion on TransitionLink OUT.
- **RM / tier-none:** case-study SSR prose.

### `/about, /impressum, /datenschutz` (`StageFormation id='rest'`) — `rest`
- **Treatment:** wide sparse deep scatter, scale floor 0.05, `colorMix` pinned to `--border` at near-invisible mix (v1 "legal pages must not perform"). **Zero ambient sources** on these routes; settles and goes fully silent.
- **Transition:** Entrance — reassembly decay only. Exit — vortex OUT. Unknown routes fall back to `rest` via the untouched registry.
- **RM / tier-none:** plain legal DOM.

---

## 4. Route transitions

The signature beat: the **same 384-instance object** performs every navigation — no unmount, no context loss (constraint 9), pure matrix retargeting.

**OUT** — `TransitionLink` (unchanged) scrubs `bridge.transition.t` 0→1 over ≤300 ms with per-tick invalidate. `kern-engine` maps `t` to a per-shard explosion: each shard flies along its **seeded vortex direction** (`seededRandom(index)` swirl axis from `seeded.ts` — the v1 `SCATTER_DIST≈6` pattern kept verbatim) with an added seeded **angular tumble** (quat spin ∝ t). The hero skin's `uDissolve` rises to 1 if leaving the homepage. The 700 ms nav watchdog + same-path/modifier/reduced-motion guards are untouched.

**IN** — `transition-conductor` (unchanged) decays `t → 0` over 500 ms ease-out with the 900 ms stale sweep. As `t` falls, shards slerp out of the vortex into the **destination formation's** target array — `routeFormation` was already written by the `StageFormation` marker + pathname safety net, and the engine's **most-recent-writer** rule (scroll `formation` vs `routeFormation`) is preserved, so mid-transition scrolling on the destination page wins correctly. `phase==='idle'` is honored as **fully assembled**: scatter contribution is exactly 0, the engine converges under the epsilons and goes silent.

**Shared-element handoff (grafted from VITRINE, layered on the vortex — object constancy taken one step further):** when the OUT target is a case-study route AND the source is a featured project cell, `kern-engine` tags that cell's frame shard cohort as `travelingCohort`. Those shards are **exempt from full scatter**: instead of exploding to `SCATTER_DIST`, they take a direct seeded flight from their bento-cell pose to the `halo` centerpiece pose, arriving as the conductor's IN decay completes. Because the scene graph persists across App Router navigations, this is the *same instances* — the project frame literally becomes the case-study hero ring. On direct load (no source cohort) the halo forms via ordinary reassembly decay. Timing is bounded by the existing OUT cap (300 ms) + conductor tail (500 ms IN + 900 ms stale sweep) — no new timers.

**DE ↔ EN switch:** the layout-persistent canvas survives (App Router layouts never remount). KERN has **no runtime text meshes and no suspense resources** (monogram/glyph slots are locale-independent build-time JSON), so a locale switch is a pure route transition — vortex out, identical formation back in, **zero re-suspension, zero re-tessellation, zero context event**. `measure.ts`'s transition-deferred re-measure (`phase!=='idle'` guard) and per-pathname re-run are already correct for this flow.

**FALLBACK tier:** the transition machinery is tier-agnostic — it is pure matrix math on the same instances. On FALLBACK the degrade rung (§7.4) has already clamped dpr to 1 and disabled the skin, so OUT/IN run on the shard pool alone (the skin `uDissolve` beat is simply skipped when the skin is off). Reduced-motion / tier-none: no canvas ever mounts, so route changes are plain DOM navigations — the complete SSR site.

---

## 5. Asset & typography strategy

**100% PROCEDURAL — zero GLTF, zero loaders, zero decoders, zero drei, zero runtime font fetch, zero new network requests of any kind.** The DSGVO zero-cross-origin eval is green **by construction**. Both researched CDN landmines (drei `useGLTF`'s gstatic draco default; troika's jsDelivr glyph fallback) are avoided because neither library is imported. A CI grep for `gstatic` / `jsdelivr` in the built stage chunk is added as a defense-in-depth tripwire.

**Geometry:** shard prism = `ExtrudeGeometry` over a hexagonal profile with bevel (core three). Kern skin = `IcosahedronGeometry` + seeded vertex displacement + 2 procedural `morphAttributes`. Dissolve = `~0.8 kB` own `onBeforeCompile` shader (`dissolve-material.ts`).

**3D typography via BUILD-TIME sampling — NOT runtime `Text3D`.** This is KERN's deliberate divergence from the runner-ups (which added drei `Text3D` at 4.3 kB gz + a lazy same-origin typeface JSON). KERN needs **no drei, no `FontLoader`/`TextGeometry` in the chunk, no suspense, and locale-independence**:

- `scripts/sample-monogram.ts` (Node, build-time only): takes **Bricolage Grotesque** (the site's already-self-hosted display font, subset by the existing `scripts/subset-bricolage.ts` toolchain to just `L` and `S`), converts to typeface JSON via **facetype.js** (vendored into `scripts/`, devDependency-only, never shipped), extrudes `LS` with `TextGeometry` in the script, voxel-samples the solid into 384 shard slots (position + surface-tangent quaternion + scale), and emits `stage/monogram-shards.json` (~3–4 kB raw, ~1.5 kB gz in-chunk).
- `scripts/sample-glyph.ts` (rewritten): same pipeline from the `@` outline → `stage/glyph-shards.json` (~2 kB).
- **Result:** real extruded-type silhouette in 3D with **zero runtime typeface JSON**. Both JSON assets are snapshotted in git and diffed on regeneration (build-script coupling mitigation — the script's `three` import is pinned to the app version).
- **Deferred escape hatch (not in v2 scope):** if a future section needs *live* 3D headlines, the documented fallback is drei `Text3D` + `Center` (4.3 kB gz) + a facetype-converted Bricolage subset (incl. `ÄÖÜäöüß`, ~15–30 kB gz static asset served same-origin from `/public`, fetched lazily). Explicitly out of scope here.

**Textures:** none. No KTX2, no basis, no PNG. All color is token-driven `instanceColor` / vertex color per the UI-SPEC no-hex-literals rule.

---

## 6. File plan — 6 non-overlapping work packages

Frozen interface contracts between packages are stated so parallel agents never edit the same file. **Each existing file is owned by exactly one package.**

### Frozen contracts (all packages import, none may change without a coordinated bump)

```ts
// stage/kern-types.ts  (owned by WP-A; types-only, zero-byte)
export const POOL = 384;                 // hard floor: 53*7 + 13
export const FLOATS_PER_SHARD = 9;       // pos3 + quat4 + scale1 + colorMix1
export type KernTargets = {
  version: number;                       // layout-version stamp
  data: Float32Array;                    // length POOL * FLOATS_PER_SHARD
  // per shard i: [px,py,pz, qx,qy,qz,qw, scale, colorMix]
};
export interface KernFormationBuilder {
  (layout: MeasuredLayout, prev: KernTargets | null): KernTargets;
  // MUST hemisphere-normalize quats against `prev` before returning
}
export interface KernEngineInputs {      // what kern-stage passes engine.step()
  formation: { from: FormationId; to: FormationId; t: number } | null;
  routeFormation: FormationId;
  transitionT: number;                   // 0..1
  scrollVelocity: number;
  sectionProgress: number;
  hoverRect: DocRect | null;
  pointer: { x: number; y: number; active: boolean };
  heatmapLevels: Uint8Array | null;
}
// Engine settle constants (frozen; documented derivation in kern-engine.ts)
export const POS_LERP_RATE = 8, POS_SETTLE_EPS = 0.003;
export const ROT_SLERP_RATE = 8, ROT_SETTLE_EPS = 0.004;   // rad
export const VELOCITY_DECAY_RATE = 10, VELOCITY_EPS = 0.5, VELOCITY_CAP = 60;
export const STAGGER_SPAN = 0.35, STAGGER_SPAN_FAST = 0.12, VEL_STAGGER_THRESHOLD = 18;
export const SCATTER_DIST = 6;
```

**Bridge contract:** no new fields. The only bridge-adjacent edit is activating `bridge.invalidate()` in `bento-hover.tsx` (WP-F).

### WP-A — Foundation: extractions, camera, geometry, types
Owns: `stage/kern-types.ts` (new), `stage/seeded.ts` (new — `seededRandom/randomInRange/ConstellationTier` extracted from `constellation-data.ts`), `stage/camera.ts` (new — `STAGE_CAMERA`, `CAMERA_Z/CAMERA_FOV_DEG/VISIBLE_WORLD_HEIGHT`, single source for `measure.ts` + pointer unprojection), `stage/camera-rig.ts` (new — CatmullRom spline over smoothed pageProgress, `CAMERA_SMOOTH_RATE 6 / CAMERA_EPS 0.005` verbatim; gentle single-take drift, **not** a room-flythrough), `stage/kern-geometry.ts` (new — chamfered prism builder + 8-tri LOD prism, both pre-built at init), `constellation-data.ts` (**delete graph** after extraction).
Contract out: `kern-types.ts`, `STAGE_CAMERA`, `buildPrism()/buildPrismLOD()`, `seeded` helpers.

### WP-B — Engine: `stage/kern-engine.ts` (new)
Owns the transform state machine: per-instance pos-lerp + quat-slerp exponential settle, most-recent-writer scroll-vs-`routeFormation` attractor, transition vortex scatter + tumble driven by `transitionT`, velocity tumble impulse with in-loop decay, `travelingCohort` shared-element handling, `needsFrame` discipline (§2.4), velocity-aware stagger compression. Consumes `KernEngineInputs` + two `KernTargets` (from/to). Exposes `step(dt, elapsed, out: Float32Array): void` and `needsFrame: boolean`.
Depends on: WP-A (`kern-types`, `seeded`).

### WP-C — Formations + build scripts
Owns: `stage/kern-formations.ts` (new — 9 `KernFormationBuilder`s + per-formation `scale`/`colorMix` floor table incl. `rest`; **frozen-vocab header + mapping table**, quat hemisphere-normalization), `stage/monogram-shards.json` + `stage/glyph-shards.json` (new, git-snapshotted), `scripts/sample-monogram.ts` (new), `scripts/sample-glyph.ts` (rewrite), vendored facetype.js in `scripts/`.
Depends on: WP-A (`kern-types`, `MeasuredLayout` fields incl. new `skillClusterRects`).
Contract out: the 9 builders keyed by `FormationId`; the two JSON schemas (`{slots: [[px,py,pz,qx,qy,qz,qw,scale], ...]}`).

### WP-D — Stage host + skin + shader: `stage/kern-stage.tsx`, `stage/kern-skin.ts`, `stage/dissolve-material.ts` (all new)
Owns the single `useFrame` (five obligations), the `InstancedMesh` + `instanceColor` + `observeThemeColors` wiring, the hero morph-skin + dissolve shader, frame-monitor → degrade rung (§7.4), pointer unprojection against the live camera, ambient hero/contact bob gated on the existing IO pump.
Depends on: WP-A (camera, geometry, types), WP-B (engine), WP-C (formations + JSON).

### WP-E — Measurement + config extension
Owns: `stage/measure.ts` + `stage/stage-types.ts` (extend `MeasuredLayout` with `skillClusterRects: DocRect[4]`, measured in the existing slice 2; keep lifecycle verbatim), `lib/theme-color-resolver.ts` (add tokens if needed). **Does not touch** `section-config.ts` (vocab frozen → no edit needed).
Contract out: extended `MeasuredLayout` (consumed by WP-C builders + WP-D stage).

### WP-F — Integration + eager surface + tests
Owns: `stage/stage-canvas.tsx` (swap `<ParticleStage/>` → `<KernStage/>`, repoint camera-constant import to `stage/camera.ts`, add one-shot `gl.compile` pre-warm), `motion/bento-hover.tsx` (activate the single deferred `bridge.invalidate()`), all eval/test changes (§8), deletion of `particle-stage.tsx` / `formation-engine.ts` / `formations.ts` / `glyph-points.json` after WP-D lands.
Depends on: WP-D (the `<KernStage/>` component), WP-A (camera).
**This is the only package that touches the eager surface** (~30 bytes) and the only one that deletes v1 files.

**Big-bang sequencing note:** the canvas child renders nothing coherent until WP-A→D exist, so integration lands behind a branch/feature-flag with v1 on `main` until the atomic flip. The 163-spec suite is green *at the boundaries* (before flip = v1; after flip = KERN), not on every intermediate commit — `stage-perf.spec` and `scene.spec` churn red only inside the feature branch.

---

## 7. Perf plan

### 7.1 Eager budget — ZERO new eager bytes policy
Current eager: **183,590 B** (task-operative number) / measured 181,165 B on CI, against the **184,643 B** error gate (~1,050–3,400 B real headroom). KERN's **only** eager change is the `bridge.invalidate()` line in `bento-hover.tsx` (~30 B; the file already imports the bridge). No new bridge fields, gate untouched, markers untouched, `capability.ts` untouched. **Comfortably inside headroom.** All three/R3F/KERN code stays in the lazy chunk behind the gate's `dynamic(ssr:false)`.

### 7.2 Lazy webgl-lab chunk — honest itemized delta (resolves the "optimistic three delta" weakness)
Current: stage chunk **270,909 B** transfer / total **452,074 B** / ceiling **501,108 B** / slack **49,034 B**.

**Removed:** `formations.ts` 9 particle builders + FORMATION_TUNING (~6–8 kB), `glyph-points.json` (~4–6 kB), constellation graph builder (~3–4 kB), particle-stage pulse/dot/trail systems (~4–5 kB) → **−15 to −20 kB min / −5 to −8 kB transfer**.

**Added:** `kern-engine` (quat slerp + stagger + scatter + velocity, ~5 kB), `kern-formations` 9 builders (~7 kB), `kern-stage` (~6 kB), `camera.ts`/`camera-rig.ts`/`seeded.ts`/`kern-geometry.ts` (~2 kB, mostly moved code), dissolve shader (~1 kB), `monogram-shards.json` + `glyph-shards.json` (~6 kB raw, JSON gzips hard), LOD prism (negligible) → **~+27 kB min / ~+9–11 kB transfer**.

**three core delta (honestly higher than the winner's rosy figure):** switching Points/LineSegments → `MeshLambertMaterial` + `DirectionalLight`/`AmbientLight` pulls the full Lambert + lighting shader chunks; `ExtrudeGeometry` drags `Shape`/`ShapeUtils`/earcut triangulation; `IcosahedronGeometry` + morph-target plumbing added. three is already almost fully present, but budget **+10 to +20 kB transfer**, not +3–6.

**drei itemization: NONE — 0 B.** `Instances` rejected (raw `InstancedMesh` is 0 B, no declarative per-instance events needed), `View` rejected (manual groups + `measure.ts` fit the single-camera rig), `Float` rejected (ambient bob is engine-owned), `Text3D`/`CameraControls`/`useGLTF`/`MeshTransmissionMaterial` rejected. `@react-three/postprocessing` not added.

**Projected total:** stage chunk 270,909 → **~285–300 kB transfer** (+14–29 kB pessimistic), total **~466–481 kB** vs the **501,108 B** ceiling → **fits without a forced re-baseline** even in the pessimistic case (slack absorbs it).

**Conscious re-baseline (D-11, mandatory even at net-flat):** after integration run `pnpm lhci:webgl`, replace the `_kontinuum_rebaseline` note with a `_kern_rebaseline` (measured + 10%, documented, non-blocking), and **fail loudly if the transfer delta exceeds ~25 kB** (tree-shaking-regression tripwire). The drei full-barrel 548 kB failure mode cannot occur (drei not installed), but three/examples imports still warrant the check.

### 7.3 Frameloop / dpr / instancing policy
- `frameloop="demand"`, `dpr=[1, 1.25|1.5]` (existing policy). No unconditional per-rAF invalidation.
- One `InstancedMesh` (`setMatrixAt`/`setColorAt`, `instanceMatrix.needsUpdate` only when the engine writes), one skin mesh. Draw calls: 2. Lights: 2 static.
- `gl.compile(scene, camera)` pre-warm is a **single atomic call** (resolves EINSTELLUNG's "sliceable compile is incoherent" flag) — it is **not** idle-sliced; instead the **geometry builds** (prism, LOD prism, skin displacement, morph attributes) are idle-sliced (<50 ms/task) at init, and the one `gl.compile` runs once inside the existing post-mount idle window and is measured against TBT (§7.5).

### 7.4 Frame-monitor degrade rung (resolves "LOD swap oversold")
The v1 pool-halving is impossible above the 371-instance heatmap floor. The latch (30 consecutive plausible frames > 24 ms, deltas > 250 ms discarded) fires **once** and, in priority order:
1. **`setDpr(1)`** — the real fill-rate win on FALLBACK/Intel iGPUs (the actual bottleneck, not tri count).
2. **disable the hero skin** (skip the second draw call + morph + dissolve entirely).
3. **swap the chamfered prism → pre-built 8-tri LOD prism** — a cheap latch-once geometry reassign (both prisms built at init, so the swap allocates nothing mid-frame). Kept as a secondary knob; acknowledged as mostly cosmetic vs (1)/(2).

Latch is one-way, allocation-free mid-frame. If PBR-free `MeshLambert` + 2 lights at dpr 1 is *still* over budget on the weakest tier, the documented fallback knob is dropping the `DirectionalLight` to a `HemisphereLight` — but `MeshLambert` (not Standard) is already the cheap material choice, so this is unlikely.

### 7.5 FALLBACK-tier content decision
FALLBACK still renders the **full shard pool** (the 371-instance heatmap floor forbids reducing it) at dpr 1, skin off, LOD prism. `MeshLambert` + 384 chamfered-or-LOD prisms (~70k or ~3k tris) is trivial geometry; the risk is fill rate, addressed by dpr 1. The forced CI path (`?webgl=force`, SwiftShader, `failIfMajorPerformanceCaveat` deliberately unset) must render `InstancedMesh` + `instanceColor` + skin morphs within TBT ≤ 200 ms — **spiked early** (§8) before building out formations, since if SwiftShader chokes the entire forced-run suite goes red with no cheap fallback.

---

## 8. Test plan

### Existing gates that MUST stay green (named)
- `evals/scene.spec.ts` — gate contract per locale (one canvas at layout level, never inside `#hero`, `data-frameloop="demand"`); `?webgl=off` → zero canvas; reduced-motion beats `?webgl=force`; per-route gating (case-study + legal); zero-canvas-before-idle; **zero cross-origin requests** (DSGVO); silent context-loss; 10 `sceneTierFromGpu` cases. **KERN touches none of the gate/capability code, so these pass by construction** except the cross-origin case which stays green because zero fetches are introduced.
- `evals/stage-perf.spec.ts` — **R1** (scroll to `#skills`, 1,500 ms wait, `data-scene-frames` equal across 1,000 ms) — the most-guarded eval; the epsilon strategy (§2.4) + scroll-only ring rotation are designed to hold it. **R2** (`#hero` in view → counter increments) via the IO-gated ambient bob. **R3** (visibilitychange → `data-frameloop="never"`) via the kept mirror. **long-task scroll smoke** (zero tasks > 200 ms after mount) via idle-sliced geometry builds.
- `src/components/scene/stage/progress.test.ts` — unchanged; must stay green.
- `evals/launch/reduced-motion.spec.ts` — zero canvas after walking every section, both locales, incl. case-study + legal. Green by construction (gate untouched).
- `evals/launch/stopwatch.spec.ts` — 30 s recruiter flow; canvas carries zero content; TransitionLink OUT ≤ 300 ms. Unchanged.
- Blocking Lighthouse CI (`lighthouserc.json`): script ≤ 184,643 B, TBT ≤ 200 ms, CLS ≤ 0.1, perf ≥ 0.90, LCP ≤ 2,500 ms on `/de` `/en` (no webgl). Eager unchanged.
- `evals/a11y.spec.ts`, `theme.spec.ts`, `check:content` (i18n parity), `immersive.spec.ts`, `home.spec.ts` — DOM stays byte-identical; green by construction.

### Consciously ported v1 particle-specific specs
- Any spec asserting particle-pool internals (pool count, formation-target arrays, glyph-point sampling) is **rewritten** against the shard-pool equivalents: `POOL=384`, 9-float targets, `monogram-shards.json`/`glyph-shards.json` slot counts. The **behavioral** specs (R1–R3, gate, transition timing) are unchanged.
- `data-scene-frames`, `data-frameloop`, `data-testid=stage-frameloop`, `career-spine`, `#activity [data-level]`, section ids — all eval hooks kept rendering exactly.

### New checks for mesh-era invariants
1. **Quaternion hemisphere-normalization unit test** (alongside `progress.test.ts`, `npx tsx --test`): for each adjacent formation pair, assert `dot(prevQuat[i], targetQuat[i]) >= 0` for all i — reverse scrubbing never flips.
2. **Angular settle test:** simulate `kern-engine.step()` from a max-error start with a completed boundary; assert `needsFrame` becomes false within the derived worst-case window (~1.30 s) and `data-scene-frames` would freeze.
3. **SwiftShader forced-run spike (run EARLY):** `?webgl=force` renders `InstancedMesh` + `instanceColor` + skin morphs without a major-performance-caveat abort, TBT ≤ 200 ms, zero long tasks after mount. Gate all further formation work on this passing.
4. **JSON-snapshot diff check:** `sample-monogram.ts`/`sample-glyph.ts` re-run in CI (or a committed-hash check) proves the shipped JSON matches the pinned `three` + font — catches silent monogram reshapes.
5. **CI grep tripwire:** built stage chunk contains no `gstatic` / `jsdelivr` string.
6. **Chunk re-baseline assertion:** `pnpm lhci:webgl` transfer within `_kern_rebaseline` (measured + 10%); hard-fail on > 25 kB regression.
7. **Malformed-heatmap fallback test:** `heatmapLevels = null`/garbage → flat neutral terrain, no NaN matrices, engine still settles.

---

## 9. New dependencies

**Runtime: NONE.** No drei, no `@react-three/postprocessing`, no loaders, no decoders, no second animation engine. All new scene code uses **three 0.185 core** + the existing GSAP/fiber/Lenis stack. This is KERN's strongest compliance axis and the reason it beat the drei-based alternatives — constraint 7 (zero new cross-origin) and constraint 4 (eager budget) are green by construction, not by careful configuration.

**devDependency (build-script only, never shipped):**
- **facetype.js** converter for `scripts/sample-monogram.ts` / `sample-glyph.ts` — **vendored into `scripts/`** (preferred, zero package deps) so TTF → typeface JSON conversion runs at build time only. If vendoring proves fragile, the fallback is the `FontLoader`/`TextGeometry` path already available via the installed `three` package, used inside the script only. **~0 bytes** in any shipped bundle.

Itemized gz shipped cost of new deps: **0 kB.** (Contrast: the runner-up concepts each added drei `Text3D` + `Center` at **4.3 kB gz** plus a **15–45 kB gz** lazily-fetched typeface JSON asset — KERN eliminates both via build-time shard sampling.)