/**
 * Formation engine (Kontinuum WP-B; DESIGN-SPEC §3 morphing, §4 transitions,
 * §6.2 idle-sliced precompute). Owns everything position-shaped between the
 * bridge and the BufferAttribute:
 *
 *   - precomputed per-formation Float32Array targets (lazy + idle-sliced;
 *     cache invalidated whenever WP-C registers a fresh `MeasuredLayout`)
 *   - the morph state machine: scroll-director boundary morphs
 *     (`bridge.formation`) and route-formation retargets
 *     (`bridge.routeFormation`) resolved by MOST-RECENT WRITER, with
 *     index-hashed per-particle stagger (§3 "edge-first dissolve" pairs with
 *     the constellation-weighted edge fade in particle-stage.tsx)
 *   - route-transition scatter (§4): deterministic per-index scatter
 *     velocities from the seeded PRNG with a tangential (curl-ish) component,
 *     scaled by `bridge.transition.t`; the exponential pool lerp IS the
 *     self-healing decay the conductor relies on — the pool always falls
 *     toward whatever the current attractor says, no handshake
 *   - scroll-velocity turbulence with per-frame decay (§5.1: "useFrame
 *     decays" `scrollVelocity`)
 *   - ambient drift (the shipped D-04 parameters, verbatim ranges) scaled by
 *     the blended per-formation drift factor
 *
 * `step()` is called from the SINGLE `useFrame` in particle-stage.tsx and
 * reads the bridge directly (the D-08 one-way surface: producers write,
 * frame code reads). NOTHING here allocates per frame — every array is
 * preallocated in the constructor, and the per-frame body is pure index math
 * (§3 "Nothing allocates per frame").
 *
 * Demand-loop settling (§6.3 leak guard): `step()` reports `needsFrame` so
 * the caller keeps invalidating only while the pool is actually converging
 * (morph settling, transition active, velocity decaying). Once every
 * particle is within epsilon of its target the engine snaps and goes silent
 * — the at-rest invariant R1 depends on this.
 *
 * WP-C seam: `setStageLayout()` is the module-level registration point for
 * measure.ts (WP-C). Until it fires, `interimLayout()` (viewport-only, no
 * section rects) keeps the hero constellation and route formations valid —
 * builders fall back to viewport anchors per formations.ts.
 */

import { sceneBridge, type FormationId } from "../scene-bridge";
import type { MeasuredLayout } from "./stage-types";
import {
  buildFormationTargets,
  FORMATION_TUNING,
  VISIBLE_WORLD_HEIGHT,
  type FormationTargets,
} from "./formations";
import { randomInRange, seededRandom } from "../constellation-data";

// --- Tuning constants -----------------------------------------------------------
/**
 * Pool convergence rate (per second) for the exponential lerp toward targets.
 * Sized together with SETTLE_EPS so a worst-case full-field morph goes silent
 * comfortably inside R1's 1500 ms settle window (§7): from ~10 world units,
 * ln(10/0.003)/8 ≈ 1.0 s of frames, then zero. (6 gave 1.35 s — measured
 * ~1.7 s from the scroll landing, over the settle budget once the anchor-jump
 * offset is added; 8 restores real margin at a barely-perceptible snappier
 * catch-up, time constant 0.125 s vs 0.167 s.)
 */
const LERP_RATE = 8;
/** World-unit epsilon below which the pool counts as settled (~0.4 px). */
const SETTLE_EPS_SQ = 0.003 * 0.003;
/** Per-particle stagger span as a fraction of the morph timeline (§3). */
const STAGGER_SPAN = 0.35;
/** Full-scatter travel distance in world units (§4 OUT burst). */
const SCATTER_DIST = 6;
/**
 * Scroll-velocity decay rate (per second) and settle floor. Sized for R1's
 * 1500 ms settle window (§7): with the write capped at VELOCITY_CAP, the
 * worst-case decay is ln(VELOCITY_CAP / VELOCITY_EPS) / 10 ≈ 0.48 s of
 * frames — a slow decay here (or an uncapped Lenis jump velocity in the
 * thousands) keeps `needsFrame` true for seconds after an anchor jump and
 * IS the demand-loop leak R1 exists to catch.
 */
const VELOCITY_DECAY_RATE = 10;
const VELOCITY_EPS = 0.5;
/** Velocity normalization (Lenis |velocity| → 0..1 turbulence input). */
const VELOCITY_NORM = 40;
/**
 * Ceiling applied when reading `bridge.scrollVelocity`: turbulence saturates
 * at VELOCITY_NORM anyway, so anything above renders identically — capping
 * only bounds the decay time (page-jump velocities are unbounded).
 */
const VELOCITY_CAP = VELOCITY_NORM * 1.5;
/** Max turbulence displacement in world units at full velocity. */
const TURBULENCE_MAX = 0.5;
/** Turbulence oscillation speed multiplier over the drift frequencies. */
const TURBULENCE_FREQ = 6;

// Drift (D-04, verbatim from the shipped constellation): period 20–40s,
// amplitude 0.05–0.14 world units (x/y), half on z — always "slow drift".
const DRIFT_PERIOD_MIN_S = 20;
const DRIFT_PERIOD_MAX_S = 40;
const DRIFT_AMPLITUDE_MIN = 0.05;
const DRIFT_AMPLITUDE_MAX = 0.14;

// --- WP-C layout registration seam ----------------------------------------------
let registeredLayout: MeasuredLayout | null = null;
let layoutVersion = 0;

/**
 * Register a fresh measurement pass (WP-C measure.ts calls this after
 * fonts.ready / debounced resize / locale route change). Bumps a version the
 * engine picks up on its next frame and pokes the demand loop once so that
 * frame actually happens.
 */
export function setStageLayout(layout: MeasuredLayout): void {
  registeredLayout = layout;
  layoutVersion += 1;
  sceneBridge.invalidate();
}

/**
 * Pre-measure interim layout (viewport only): keeps the constellation and
 * route formations valid before WP-C's first measurement lands. worldPerPixel
 * derives from the shipped camera pose (z=8, fov 45°).
 */
export function interimLayout(
  viewportW: number,
  viewportH: number,
): MeasuredLayout {
  return {
    sections: {},
    bentoCells: [],
    spineX: viewportW / 2,
    heatmap: sceneBridge.heatmapLevels,
    viewport: { w: viewportW, h: viewportH },
    worldPerPixel: VISIBLE_WORLD_HEIGHT / viewportH,
  };
}

// --- Engine ----------------------------------------------------------------------
export interface StepResult {
  /** true while the pool is still converging — caller keeps invalidating. */
  needsFrame: boolean;
  /** Blended FORMATION_TUNING opacity factor for the materials. */
  opacity: number;
  /** How "constellation" the current state is (edge/pulse/pointer gate). */
  constellationWeight: number;
}

export class FormationEngine {
  readonly count: number;
  /** Draw/simulation budget — halved once by the frame-monitor ladder. */
  activeCount: number;

  private layout: MeasuredLayout;
  private layoutVersionSeen = layoutVersion;
  private targetCache = new Map<FormationId, FormationTargets>();

  /** Lerped pool state (positions the render output oscillates around). */
  private readonly base: Float32Array;
  private readonly baseIntensity: Float32Array;
  /** Per-particle morph stagger hash in [0,1). */
  private readonly stagger: Float32Array;
  /** Per-particle scatter direction ×3 (unit-ish, tangential bias baked in). */
  private readonly scatterDir: Float32Array;
  /** Per-particle drift params: ωx ωy ωz φx φy φz ax ay az (stride 9). */
  private readonly drift: Float32Array;

  /** Most-recent-writer tracking for the morph state machine. */
  private lastFormationRef = sceneBridge.formation;
  private lastRouteFormation = sceneBridge.routeFormation;
  private mode: "scroll" | "route" = "route";

  private idleHandle: number | null = null;
  /**
   * Epoch for the idle precompute chain: every chain carries the generation
   * it was scheduled under and stops itself once a newer schedulePrecompute()
   * (or dispose()) bumps it — a re-schedule mid-chain can never orphan a
   * still-self-rescheduling chain (StrictMode's double mount guarantees one).
   */
  private precomputeGeneration = 0;
  private readonly stepResult: StepResult = {
    needsFrame: false,
    opacity: 1,
    constellationWeight: 1,
  };

  constructor(count: number, initialLayout: MeasuredLayout) {
    this.count = count;
    this.activeCount = count;
    this.layout = registeredLayout ?? initialLayout;

    this.base = new Float32Array(count * 3);
    this.baseIntensity = new Float32Array(count);
    this.stagger = new Float32Array(count);
    this.scatterDir = new Float32Array(count * 3);
    this.drift = new Float32Array(count * 9);

    for (let i = 0; i < count; i += 1) {
      this.stagger[i] = seededRandom(i * 13.37 + 0.7);

      // §4: deterministic per-index scatter velocities — updated to a 3D swirling
      // vortex/wormhole warp (swirling tangentially and stretching along the Z-axis).
      const theta = seededRandom(i * 3.1 + 1) * Math.PI * 2;
      const zed = randomInRange(i * 3.1 + 2, -0.5, 0.5);
      const swirl = randomInRange(i * 3.1 + 3, 0.4, 1);
      const mag = randomInRange(i * 3.1 + 4, 0.6, 1.4);
      const rx = Math.cos(theta);
      const ry = Math.sin(theta);
      const spiralStrength = 2.0;
      this.scatterDir[i * 3] = (rx * 0.5 - ry * spiralStrength) * mag;
      this.scatterDir[i * 3 + 1] = (ry * 0.5 + rx * spiralStrength) * mag;
      this.scatterDir[i * 3 + 2] = (zed > 0 ? 1 : -1) * (3.5 + swirl * 2.5) * mag;

      // Drift params — the shipped per-node derivation, generalized to the pool.
      const s = i * 97 + 13;
      const d = i * 9;
      this.drift[d] = (2 * Math.PI) / randomInRange(s + 1, DRIFT_PERIOD_MIN_S, DRIFT_PERIOD_MAX_S);
      this.drift[d + 1] = (2 * Math.PI) / randomInRange(s + 2, DRIFT_PERIOD_MIN_S, DRIFT_PERIOD_MAX_S);
      this.drift[d + 2] = (2 * Math.PI) / randomInRange(s + 3, DRIFT_PERIOD_MIN_S, DRIFT_PERIOD_MAX_S);
      this.drift[d + 3] = randomInRange(s + 4, 0, 2 * Math.PI);
      this.drift[d + 4] = randomInRange(s + 5, 0, 2 * Math.PI);
      this.drift[d + 5] = randomInRange(s + 6, 0, 2 * Math.PI);
      this.drift[d + 6] = randomInRange(s + 7, DRIFT_AMPLITUDE_MIN, DRIFT_AMPLITUDE_MAX);
      this.drift[d + 7] = randomInRange(s + 8, DRIFT_AMPLITUDE_MIN, DRIFT_AMPLITUDE_MAX);
      this.drift[d + 8] = randomInRange(s + 9, DRIFT_AMPLITUDE_MIN * 0.5, DRIFT_AMPLITUDE_MAX * 0.5);
    }

    // Start the pool ON its initial formation (routeFormation at mount) so
    // the entrance reveal fades in a settled field, not a mid-flight morph.
    const initial = this.targetsFor(sceneBridge.routeFormation);
    this.base.set(initial.positions);
    this.baseIntensity.set(initial.intensity);
  }

  /**
   * Kick off the idle precompute chain (§6.2). Called from an effect — NOT
   * the constructor — so the useMemo construction in particle-stage.tsx stays
   * free of render-phase side effects (StrictMode double-invokes render).
   */
  start(): void {
    this.schedulePrecompute();
  }

  get worldPerPixel(): number {
    return this.layout.worldPerPixel;
  }

  /**
   * Frame-monitor ladder (§6.3): halve the simulated/drawn pool once, but
   * never below `minCount` (the constellation graph must survive intact).
   */
  halvePool(minCount: number): void {
    this.activeCount = Math.max(minCount, Math.floor(this.count / 2));
  }

  /** Drop the idle precompute chain (canvas unmount). */
  dispose(): void {
    this.precomputeGeneration += 1; // any in-flight chain sees itself stale
    if (this.idleHandle !== null && "cancelIdleCallback" in window) {
      window.cancelIdleCallback(this.idleHandle);
    }
    this.idleHandle = null;
  }

  /**
   * Advance the pool one frame. Reads the bridge, writes world positions into
   * `out` (the live position BufferAttribute array) and brightness 0..1 into
   * `intensityOut` — the caller uploads and colors.
   *
   * `dt` is the caller's WALL-CLOCK settle delta (particle-stage `dtSettle`,
   * loosely capped): it only feeds the exponential lerp/decay below, which
   * are unconditionally stable — a large dt completes the transition, which
   * is the correct at-rest behavior under degraded rAF (§7 R1).
   */
  step(
    dt: number,
    elapsed: number,
    out: Float32Array,
    intensityOut: Float32Array,
  ): StepResult {
    // Fresh measurement from WP-C: swap layout, drop stale targets, rebuild
    // lazily/idle-sliced (§6.2 — never a synchronous 9-formation rebuild).
    if (this.layoutVersionSeen !== layoutVersion && registeredLayout) {
      this.layout = registeredLayout;
      this.layoutVersionSeen = layoutVersion;
      this.targetCache.clear();
      this.schedulePrecompute();
    }

    // --- Morph source: most-recent writer wins (scroll director vs. route) --
    const formation = sceneBridge.formation;
    if (formation !== this.lastFormationRef) {
      this.lastFormationRef = formation;
      this.mode = "scroll";
    }
    if (sceneBridge.routeFormation !== this.lastRouteFormation) {
      this.lastRouteFormation = sceneBridge.routeFormation;
      this.mode = "route";
    }
    const from = this.mode === "scroll" ? formation.from : this.lastRouteFormation;
    const to = this.mode === "scroll" ? formation.to : this.lastRouteFormation;
    const t = this.mode === "scroll" ? clamp01(formation.t) : 0;

    const fromTargets = this.targetsFor(from);
    const toTargets = this.targetsFor(to);
    const sameTargets = fromTargets === toTargets;

    // --- Blended per-formation tuning ---------------------------------------
    const tuneFrom = FORMATION_TUNING[from];
    const tuneTo = FORMATION_TUNING[to];
    const opacity = tuneFrom.opacity + (tuneTo.opacity - tuneFrom.opacity) * t;
    const driftScale = tuneFrom.drift + (tuneTo.drift - tuneFrom.drift) * t;
    const constellationWeight =
      (from === "constellation" ? 1 - t : 0) + (to === "constellation" ? t : 0);

    // --- Route-transition scatter (§4) + velocity turbulence -----------------
    const transition = sceneBridge.transition;
    const scatter = transition.phase === "idle" ? 0 : clamp01(transition.t) * SCATTER_DIST;

    let velocity = Math.min(sceneBridge.scrollVelocity, VELOCITY_CAP);
    if (velocity > VELOCITY_EPS) {
      velocity *= Math.exp(-VELOCITY_DECAY_RATE * dt);
      if (velocity <= VELOCITY_EPS) velocity = 0;
      sceneBridge.scrollVelocity = velocity;
    } else if (velocity !== 0) {
      velocity = 0;
      sceneBridge.scrollVelocity = 0;
    }
    const turbulence = Math.min(velocity / VELOCITY_NORM, 1) * TURBULENCE_MAX;

    // --- Pool lerp + drift/turbulence overlay --------------------------------
    const k = 1 - Math.exp(-LERP_RATE * dt);
    const staggerDen = 1 - STAGGER_SPAN;
    const fromPos = fromTargets.positions;
    const toPos = toTargets.positions;
    const fromInt = fromTargets.intensity;
    const toInt = toTargets.intensity;
    const base = this.base;
    const baseIntensity = this.baseIntensity;
    const drift = this.drift;
    const scatterDir = this.scatterDir;
    let maxDeltaSq = 0;

    for (let i = 0; i < this.activeCount; i += 1) {
      const st = sameTargets
        ? 0
        : clamp01((t - this.stagger[i] * STAGGER_SPAN) / staggerDen);
      const p = i * 3;

      let tx = fromPos[p] + (toPos[p] - fromPos[p]) * st;
      let ty = fromPos[p + 1] + (toPos[p + 1] - fromPos[p + 1]) * st;
      let tz = fromPos[p + 2] + (toPos[p + 2] - fromPos[p + 2]) * st;
      if (scatter > 0) {
        tx += scatterDir[p] * scatter;
        ty += scatterDir[p + 1] * scatter;
        tz += scatterDir[p + 2] * scatter;
      }

      const dx = tx - base[p];
      const dy = ty - base[p + 1];
      const dz = tz - base[p + 2];
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq > maxDeltaSq) maxDeltaSq = distSq;
      base[p] += dx * k;
      base[p + 1] += dy * k;
      base[p + 2] += dz * k;

      const ti = fromInt[i] + (toInt[i] - fromInt[i]) * st;
      baseIntensity[i] += (ti - baseIntensity[i]) * k;
      intensityOut[i] = baseIntensity[i];

      const d = i * 9;
      const phaseX = elapsed * drift[d] + drift[d + 3];
      const phaseY = elapsed * drift[d + 1] + drift[d + 4];
      const phaseZ = elapsed * drift[d + 2] + drift[d + 5];
      let ox = drift[d + 6] * driftScale * Math.sin(phaseX);
      let oy = drift[d + 7] * driftScale * Math.sin(phaseY);
      let oz = drift[d + 8] * driftScale * Math.sin(phaseZ);
      if (turbulence > 0) {
        ox += turbulence * Math.sin(phaseX * TURBULENCE_FREQ);
        oy += turbulence * Math.sin(phaseY * TURBULENCE_FREQ);
        oz += turbulence * 0.4 * Math.sin(phaseZ * TURBULENCE_FREQ);
      }
      out[p] = base[p] + ox;
      out[p + 1] = base[p + 1] + oy;
      out[p + 2] = base[p + 2] + oz;
    }

    // Settle-and-go-silent (§6.3): converging pool, an active transition or
    // decaying velocity all demand another frame; a stable morph t does NOT
    // (its producer invalidates on every write anyway).
    this.stepResult.needsFrame =
      maxDeltaSq > SETTLE_EPS_SQ ||
      transition.phase !== "idle" ||
      velocity > 0;
    this.stepResult.opacity = opacity;
    this.stepResult.constellationWeight = constellationWeight;
    return this.stepResult;
  }

  /** Lazy per-formation targets — built on demand, cached per layout. */
  private targetsFor(id: FormationId): FormationTargets {
    // Contract-4 late bind: measure.ts (slice 3, the single bridge writer)
    // publishes the heatmap AFTER this engine (and possibly its interim
    // layout) already exists — patch the layout once so a lazily-built `grid`
    // sees the real levels instead of being stuck on the wave-sheet fallback
    // until the next measure pass.
    if (
      id === "grid" &&
      this.layout.heatmap === null &&
      sceneBridge.heatmapLevels
    ) {
      this.layout = { ...this.layout, heatmap: sceneBridge.heatmapLevels };
      this.targetCache.delete("grid");
    }
    let targets = this.targetCache.get(id);
    if (!targets) {
      targets = buildFormationTargets(id, this.layout, this.count);
      this.targetCache.set(id, targets);
    }
    return targets;
  }

  /**
   * §6.2: precompute the remaining formations across idle callbacks, ONE
   * builder per slice (each is a few ms for 2,500 particles — comfortably
   * under the 50 ms slice budget), so scroll morphs never hit a cold cache.
   */
  private schedulePrecompute(): void {
    if (!("requestIdleCallback" in window)) return; // lazy path still covers Safari
    const gen = ++this.precomputeGeneration;
    const pending: FormationId[] = (
      Object.keys(FORMATION_TUNING) as FormationId[]
    ).filter((id) => !this.targetCache.has(id));
    const buildNext = (): void => {
      if (gen !== this.precomputeGeneration) return; // superseded — stop
      const id = pending.shift();
      if (!id) {
        this.idleHandle = null;
        return;
      }
      // targetsFor caches; skip if a lazy build beat the idle chain to it.
      this.targetsFor(id);
      this.idleHandle = window.requestIdleCallback(buildNext);
    };
    this.idleHandle = window.requestIdleCallback(buildNext);
  }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
