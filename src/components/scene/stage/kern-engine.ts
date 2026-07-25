/**
 * KERN transform engine (SOLID-3D v2 WP-B; DESIGN-SPEC §2.1 rigid-body
 * successor table, §2.4 settle/epsilon strategy, §4 route transitions). The
 * per-instance state machine that replaces the v1 `formation-engine.ts` pool
 * lerp: every proven v1 mechanism gets a rigid-body upgrade with IDENTICAL
 * bridge semantics, so the demand-frameloop still settles to epsilon and goes
 * silent at rest (R1). It owns everything transform-shaped between the bridge
 * numbers and the `InstancedMesh` matrices:
 *
 *   - per-instance POSITION lerp + QUATERNION slerp, both exponential-settle
 *     with the frozen POS_LERP_RATE/ROT_SLERP_RATE and snap-to-target below
 *     POS_SETTLE_EPS/ROT_SETTLE_EPS so `needsFrame` can go false (§2.4 R1);
 *   - MOST-RECENT-WRITER arbitration between the scroll-director boundary
 *     morph (`formation{from,to,t}`) and the route-level `routeFormation`
 *     (v1 `mode` machine, verbatim semantics);
 *   - route-transition VORTEX: seeded per-shard swirl scatter (the v1
 *     `SCATTER_DIST≈6` pattern kept byte-for-byte) plus a seeded angular
 *     TUMBLE, both scaled by `transitionT` — baked into the attractor so the
 *     conductor's IN decay is self-healing, no handshake (§4);
 *   - scroll-velocity TUMBLE impulse with IN-LOOP exponential decay (the v1
 *     rate-10 / floor-0.5 / cap-60 decay — the engine owns it and writes the
 *     decayed level back so a one-shot anchor-jump spike bleeds off instead of
 *     re-pinning `needsFrame`, the exact leak R1 exists to catch);
 *   - VELOCITY-AWARE stagger compression (STAGGER_SPAN 0.35 → 0.12 above
 *     VEL_STAGGER_THRESHOLD) so fast scrubbing reads as a tighter stream and
 *     the worst-case settle window shrinks (§2.4);
 *   - `travelingCohort` shared-element handoff (§4 VITRINE graft): a tagged
 *     shard subset is scatter/tumble-exempt so it flies its bento-cell pose
 *     straight to the halo centerpiece — object constancy across the route.
 *
 * Convergence math (mirrors the v1 header derivation): worst-case settle =
 * ln(startErr/eps)/rate. Position ln(6/0.003)/8 ≈ 0.95 s; rotation
 * ln(π/0.004)/8 ≈ 0.86 s; both + STAGGER_SPAN 0.35 of the boundary timeline →
 * ≈ 1.30 s < the 1500 ms R1 budget. `dt` arrives already loosely capped by the
 * caller (WP-D `dtSettle`); it only feeds the unconditionally-stable
 * exponentials below, so a degraded rAF COMPLETES the transition rather than
 * stretching it (§2.4 MAX_SETTLE_DT_S split).
 *
 * D-08 one-way surface: this engine only READS bridge-derived numbers (through
 * the `KernEngineInputs` snapshot the single `useFrame` hands it) and WRITES
 * shard poses into `out` — never a React re-render, never a DOM read. NOTHING
 * allocates per frame: every scratch Quaternion/Vector3 and every per-shard
 * seeded array is preallocated in the constructor; the per-frame body is pure
 * index math + in-place three ops (`slerpFlat` on the raw target arrays).
 *
 * Scope boundary (§6): presentation-layer modulations that need the live
 * camera or a DOM-rect→world conversion — pointer pull (D-06), bento
 * `hoverRect` lift, career `sectionProgress` knot pulse, the hero/contact
 * ambient bob, the camera rig and the hero skin's `uDissolve` — are WP-D's,
 * layered on top of this engine's settled pose and OR-ed into the composite
 * `needsFrame` in `kern-stage.tsx`. This engine's `needsFrame` covers ONLY the
 * shard-pool convergence, the velocity tumble floor and an active transition.
 * The `heatmapLevels` voxel heights are baked into the `grid` targets by WP-C,
 * so this engine stays formation-agnostic and never touches them either.
 */

import * as THREE from "three";

import { seededRandom } from "./seeded";
import {
  FLOATS_PER_SHARD,
  POOL,
  POS_LERP_RATE,
  POS_SETTLE_EPS,
  ROT_SETTLE_EPS,
  ROT_SLERP_RATE,
  SCATTER_DIST,
  STAGGER_SPAN,
  STAGGER_SPAN_FAST,
  VEL_STAGGER_THRESHOLD,
  VELOCITY_CAP,
  VELOCITY_DECAY_RATE,
  VELOCITY_EPS,
  type KernEngineInputs,
  type KernTargets,
} from "./kern-types";
import type { FormationId } from "../scene-bridge";

// --- Stride field offsets (per shard i, base o = i * FLOATS_PER_SHARD) ----------
const PX = 0;
const PY = 1;
const PZ = 2;
const QX = 3;
const QY = 4;
const QZ = 5;
const QW = 6;
const SCALE = 7;
const COLOR_MIX = 8;

// --- Engine-local tuning (NOT frozen; documented, safe to retune) ---------------
/** Squared position epsilon — compared without a sqrt in the hot loop. */
const POS_SETTLE_EPS_SQ = POS_SETTLE_EPS * POS_SETTLE_EPS;
/** `transitionT` below this counts as fully-assembled (idle) — scatter = 0. */
const TRANSITION_EPS = 1e-4;
/** Velocity normalization: |velocity| → 0..1 tumble input (v1 VELOCITY_NORM). */
const VELOCITY_NORM = 40;
/** Max per-shard velocity-tumble spin at full velocity, radians. */
const VEL_TUMBLE_MAX_ANGLE = 0.5;
/** Velocity-tumble oscillation multiplier (v1 TURBULENCE_FREQ). */
const VEL_TUMBLE_FREQ = 6;
/** Seeded transition-tumble spin magnitude range (radians) applied at t = 1. */
const TUMBLE_ANGLE_MIN = Math.PI * 0.5;
const TUMBLE_ANGLE_MAX = Math.PI * 1.5;

/**
 * Resolve a `FormationId` to its cached 9-float targets. WP-D wraps WP-C's
 * `KernFormationBuilder`s with a per-layout-version cache and MUST return a
 * STABLE reference for a given (id, version) so the engine's `sameTargets`
 * reference check (skip-morph fast path) holds.
 */
export type TargetResolver = (id: FormationId) => KernTargets;

export class KernEngine {
  private readonly resolve: TargetResolver;

  /** Persistent lerped/slerped pose (POOL × 9); `out` = this + velocity tumble. */
  private readonly state: Float32Array;
  /** Per-shard morph stagger hash in [0,1) — v1 seed, byte-identical. */
  private readonly stagger: Float32Array;
  /** Per-shard vortex swirl direction ×3 (radial + tangential) — v1 seed. */
  private readonly scatterDir: Float32Array;
  /** Per-shard transition-tumble unit axis ×3. */
  private readonly tumbleAxis: Float32Array;
  /** Per-shard transition-tumble magnitude (radians at t = 1). */
  private readonly tumbleAngle: Float32Array;
  /** Per-shard velocity-tumble unit axis ×3. */
  private readonly velAxis: Float32Array;
  /** Per-shard velocity-tumble oscillation phase offset. */
  private readonly velPhase: Float32Array;

  // Reused scratch — the ONLY three objects touched per frame (zero alloc).
  // Instance-method quaternion ops (slerpQuaternions/slerp/multiply) are used
  // over the static *Flat helpers because three types the latter as `number[]`,
  // which our target arrays (Float32Array) are not; the instance path is
  // equally allocation-free.
  private readonly qFrom = new THREE.Quaternion();
  private readonly qTo = new THREE.Quaternion();
  private readonly qTarget = new THREE.Quaternion();
  private readonly qState = new THREE.Quaternion();
  private readonly qSpin = new THREE.Quaternion();
  private readonly vAxis = new THREE.Vector3();

  // Most-recent-writer state machine (v1 semantics).
  private lastFormationRef: KernEngineInputs["formation"] = null;
  private lastRouteFormation: FormationId = "constellation";
  private mode: "scroll" | "route" = "route";

  private inputs: KernEngineInputs | null = null;
  private travelingCohort: Uint8Array | null = null;
  private initialized = false;
  /** Engine-owned decaying scroll-velocity tumble store (§2.1 in-loop decay). */
  private velTumble = 0;
  private needsFrameFlag = false;

  constructor(resolve: TargetResolver) {
    this.resolve = resolve;

    this.state = new Float32Array(POOL * FLOATS_PER_SHARD);
    this.stagger = new Float32Array(POOL);
    this.scatterDir = new Float32Array(POOL * 3);
    this.tumbleAxis = new Float32Array(POOL * 3);
    this.tumbleAngle = new Float32Array(POOL);
    this.velAxis = new Float32Array(POOL * 3);
    this.velPhase = new Float32Array(POOL);

    for (let i = 0; i < POOL; i += 1) {
      const s3 = i * 3;

      // Stagger hash — verbatim from the v1 formation-engine (visual parity).
      this.stagger[i] = seededRandom(i * 13.37 + 0.7);

      // §4 vortex swirl: a radial-ish unit direction plus a tangential
      // (curl-flavored) component so the burst swirls instead of exploding on
      // straight rays — the exact v1 `scatterDir` derivation kept byte-for-byte.
      const theta = seededRandom(i * 3.1 + 1) * Math.PI * 2;
      const zed = seededRandom(i * 3.1 + 2) - 0.5; // [-0.5, 0.5)
      const swirl = 0.4 + seededRandom(i * 3.1 + 3) * 0.6; // [0.4, 1)
      const mag = 0.6 + seededRandom(i * 3.1 + 4) * 0.8; // [0.6, 1.4)
      const rx = Math.cos(theta);
      const ry = Math.sin(theta);
      this.scatterDir[s3] = (rx - ry * swirl) * mag;
      this.scatterDir[s3 + 1] = (ry + rx * swirl) * mag;
      this.scatterDir[s3 + 2] = zed * mag;

      // Seeded unit axes for the angular tumbles (transition + velocity). New
      // seed lanes — the v1 pool carried no rotation, so nothing to match here.
      seededUnitAxis(i * 7.7 + 11, this.tumbleAxis, s3);
      this.tumbleAngle[i] =
        TUMBLE_ANGLE_MIN +
        seededRandom(i * 7.7 + 13) * (TUMBLE_ANGLE_MAX - TUMBLE_ANGLE_MIN);
      seededUnitAxis(i * 5.3 + 17, this.velAxis, s3);
      this.velPhase[i] = seededRandom(i * 5.3 + 19) * Math.PI * 2;
    }
  }

  /**
   * Snapshot the per-frame bridge inputs (called once per frame by the single
   * `useFrame` BEFORE `step()`). `step()` decays `inputs.scrollVelocity` in
   * place (v1 parity — see the class header), so the caller SHOULD reuse one
   * persistent inputs object and reflect its `scrollVelocity` back onto
   * `sceneBridge.scrollVelocity` so the Lenis listener's next write races the
   * decayed level correctly.
   */
  setInputs(inputs: KernEngineInputs): void {
    this.inputs = inputs;
  }

  /**
   * Tag the shared-element handoff cohort (§4). A `mask[i] === 1` shard is
   * scatter- and tumble-EXEMPT during a transition: instead of exploding to
   * `SCATTER_DIST` it flies its current pose straight to the `to` target — the
   * *same instance* carrying identity across the explode/reform. `null` clears
   * the cohort (ordinary reassembly). Mask length must be `POOL`.
   */
  setTravelingCohort(mask: Uint8Array | null): void {
    this.travelingCohort = mask;
  }

  /** true while any shard is unsettled, velocity is above floor, or a transition is active. */
  get needsFrame(): boolean {
    return this.needsFrameFlag;
  }

  /**
   * Advance the pool one frame. Reads the snapshot set by `setInputs`, converges
   * the persistent `state`, and writes POOL × FLOATS_PER_SHARD floats into `out`
   * (the live per-instance buffer the stage host uploads via
   * `setMatrixAt`/`setColorAt`). Zero heap allocation.
   */
  step(dt: number, elapsed: number, out: Float32Array): void {
    const inputs = this.inputs;
    if (!inputs) {
      this.needsFrameFlag = false;
      return;
    }
    this.ensureInit(inputs);

    // --- Morph source: most-recent writer wins (scroll director vs. route) ---
    const formation = inputs.formation;
    if (formation !== null && formation !== this.lastFormationRef) {
      this.lastFormationRef = formation;
      this.mode = "scroll";
    }
    if (inputs.routeFormation !== this.lastRouteFormation) {
      this.lastRouteFormation = inputs.routeFormation;
      this.mode = "route";
    }
    const scroll = this.mode === "scroll" && formation !== null;
    const fromId = scroll ? formation.from : this.lastRouteFormation;
    const toId = scroll ? formation.to : this.lastRouteFormation;
    const morphT = scroll ? clamp01(formation.t) : 0;

    const fromTargets = this.resolve(fromId);
    const toTargets = this.resolve(toId);
    const fromData = fromTargets.data;
    const toData = toTargets.data;
    const sameTargets = fromTargets === toTargets;

    // --- Scroll-velocity decay (engine-owned, v1 parity + write-back) --------
    let velocity = Math.min(Math.max(inputs.scrollVelocity, 0), VELOCITY_CAP);
    if (velocity > VELOCITY_EPS) {
      velocity *= Math.exp(-VELOCITY_DECAY_RATE * dt);
      if (velocity <= VELOCITY_EPS) velocity = 0;
    } else {
      velocity = 0;
    }
    inputs.scrollVelocity = velocity;
    this.velTumble = velocity;
    const velNorm = velocity > 0 ? Math.min(velocity / VELOCITY_NORM, 1) : 0;

    // --- Route-transition vortex magnitude (§4; 0 when idle) -----------------
    const transitionT = clamp01(inputs.transitionT);
    const scatterMag = transitionT * SCATTER_DIST;
    const transitionActive = transitionT > TRANSITION_EPS;

    // --- Velocity-aware stagger compression (§2.4) ---------------------------
    // Above VEL_STAGGER_THRESHOLD the span lerps 0.35 → 0.12, tightening the
    // stream and shrinking the worst-case settle window as scrubbing speeds up.
    const spanEff =
      STAGGER_SPAN +
      (STAGGER_SPAN_FAST - STAGGER_SPAN) *
        clamp01((velocity - VEL_STAGGER_THRESHOLD) / VEL_STAGGER_THRESHOLD);
    const staggerDen = 1 - spanEff;

    // Exponential convergence factors — unconditionally stable for any dt.
    const kp = 1 - Math.exp(-POS_LERP_RATE * dt);
    const kr = 1 - Math.exp(-ROT_SLERP_RATE * dt);

    const state = this.state;
    const stagger = this.stagger;
    const scatterDir = this.scatterDir;
    const tumbleAxis = this.tumbleAxis;
    const tumbleAngle = this.tumbleAngle;
    const velAxis = this.velAxis;
    const velPhase = this.velPhase;
    const cohort = this.travelingCohort;
    const qFrom = this.qFrom;
    const qTo = this.qTo;
    const qTarget = this.qTarget;
    const qState = this.qState;
    const qSpin = this.qSpin;
    const vAxis = this.vAxis;

    let maxPosErrSq = 0;
    let maxRotErr = 0;
    let maxScalarErr = 0;

    for (let i = 0; i < POOL; i += 1) {
      const o = i * FLOATS_PER_SHARD;
      const s3 = i * 3;
      const exempt = cohort !== null && cohort[i] === 1;
      const vortex = scatterMag > 0 && !exempt;

      const st = sameTargets
        ? 0
        : clamp01((morphT - stagger[i] * spanEff) / staggerDen);

      // ---- Target position: staggered morph + vortex scatter ----
      let tx = fromData[o + PX] + (toData[o + PX] - fromData[o + PX]) * st;
      let ty = fromData[o + PY] + (toData[o + PY] - fromData[o + PY]) * st;
      let tz = fromData[o + PZ] + (toData[o + PZ] - fromData[o + PZ]) * st;
      if (vortex) {
        tx += scatterDir[s3] * scatterMag;
        ty += scatterDir[s3 + 1] * scatterMag;
        tz += scatterDir[s3 + 2] * scatterMag;
      }

      const dx = tx - state[o + PX];
      const dy = ty - state[o + PY];
      const dz = tz - state[o + PZ];
      const posErrSq = dx * dx + dy * dy + dz * dz;
      if (posErrSq > maxPosErrSq) maxPosErrSq = posErrSq;
      // Snap only against a STATIONARY attractor; during a transition the
      // target is moving and `transitionActive` keeps the loop alive anyway.
      if (posErrSq <= POS_SETTLE_EPS_SQ && !transitionActive) {
        state[o + PX] = tx;
        state[o + PY] = ty;
        state[o + PZ] = tz;
      } else {
        state[o + PX] += dx * kp;
        state[o + PY] += dy * kp;
        state[o + PZ] += dz * kp;
      }

      // ---- Target quaternion: shortest-path morph slerp + vortex tumble ----
      // Builders hemisphere-normalize adjacent formations, and slerp itself
      // takes the shorter arc, so reverse scrubbing never spins the wrong way
      // (§2.4 slerp-flip guard).
      qFrom.set(
        fromData[o + QX],
        fromData[o + QY],
        fromData[o + QZ],
        fromData[o + QW],
      );
      if (sameTargets) {
        qTarget.copy(qFrom);
      } else {
        qTo.set(
          toData[o + QX],
          toData[o + QY],
          toData[o + QZ],
          toData[o + QW],
        );
        qTarget.slerpQuaternions(qFrom, qTo, st);
      }
      if (vortex) {
        vAxis.set(tumbleAxis[s3], tumbleAxis[s3 + 1], tumbleAxis[s3 + 2]);
        qSpin.setFromAxisAngle(vAxis, tumbleAngle[i] * transitionT);
        qTarget.multiply(qSpin); // effective attractor = morph ∘ tumble
      }
      qState.set(state[o + QX], state[o + QY], state[o + QZ], state[o + QW]);
      const rotErr = qState.angleTo(qTarget);
      if (rotErr > maxRotErr) maxRotErr = rotErr;
      if (rotErr <= ROT_SETTLE_EPS && !transitionActive) {
        state[o + QX] = qTarget.x;
        state[o + QY] = qTarget.y;
        state[o + QZ] = qTarget.z;
        state[o + QW] = qTarget.w;
      } else {
        qState.slerp(qTarget, kr);
        state[o + QX] = qState.x;
        state[o + QY] = qState.y;
        state[o + QZ] = qState.z;
        state[o + QW] = qState.w;
      }

      // ---- Scale + colorMix (plain exponential lerp, no overlay) ----
      const tsc =
        fromData[o + SCALE] + (toData[o + SCALE] - fromData[o + SCALE]) * st;
      const tcm =
        fromData[o + COLOR_MIX] +
        (toData[o + COLOR_MIX] - fromData[o + COLOR_MIX]) * st;
      const dsc = tsc - state[o + SCALE];
      const dcm = tcm - state[o + COLOR_MIX];
      const scalarErr = Math.max(Math.abs(dsc), Math.abs(dcm));
      if (scalarErr > maxScalarErr) maxScalarErr = scalarErr;
      state[o + SCALE] += dsc * kp;
      state[o + COLOR_MIX] += dcm * kp;

      // ---- Write render pose: state + velocity-tumble overlay on rotation ----
      // The overlay is transient (never folded into `state`) and rides `elapsed`
      // ONLY while velTumble > 0 — at rest velNorm is 0, the overlay vanishes,
      // and the loop can go silent (R1 no time-driven at-rest motion).
      out[o + PX] = state[o + PX];
      out[o + PY] = state[o + PY];
      out[o + PZ] = state[o + PZ];
      if (velNorm > 0) {
        const ang =
          velNorm *
          VEL_TUMBLE_MAX_ANGLE *
          Math.sin(elapsed * VEL_TUMBLE_FREQ + velPhase[i]);
        vAxis.set(velAxis[s3], velAxis[s3 + 1], velAxis[s3 + 2]);
        qSpin.setFromAxisAngle(vAxis, ang);
        qState.set(state[o + QX], state[o + QY], state[o + QZ], state[o + QW]);
        qState.multiply(qSpin);
        out[o + QX] = qState.x;
        out[o + QY] = qState.y;
        out[o + QZ] = qState.z;
        out[o + QW] = qState.w;
      } else {
        out[o + QX] = state[o + QX];
        out[o + QY] = state[o + QY];
        out[o + QZ] = state[o + QZ];
        out[o + QW] = state[o + QW];
      }
      out[o + SCALE] = state[o + SCALE];
      out[o + COLOR_MIX] = state[o + COLOR_MIX];
    }

    // Settle-and-go-silent (§2.4): a converging pose, a decaying velocity
    // tumble or an active transition each demand another frame. WP-D OR-s in
    // the camera rig, skin dissolve, hover-lift and ambient-bob terms.
    this.needsFrameFlag =
      maxPosErrSq > POS_SETTLE_EPS_SQ ||
      maxRotErr > ROT_SETTLE_EPS ||
      maxScalarErr > POS_SETTLE_EPS ||
      this.velTumble > 0 ||
      transitionActive;
  }

  /**
   * First-frame init: capture the current writer refs WITHOUT tripping the
   * arbitration (so frame 1 stays in `route` mode) and snap `state` onto the
   * route formation, so the entrance reveal fades in a SETTLED field rather
   * than a mid-flight morph (v1 constructor parity). WP-D drives the boot
   * fly-in via `transitionT` + `introBeatAt`; the engine needs no entrance
   * branch of its own.
   */
  private ensureInit(inputs: KernEngineInputs): void {
    if (this.initialized) return;
    this.lastFormationRef = inputs.formation;
    this.lastRouteFormation = inputs.routeFormation;
    this.mode = "route";
    this.state.set(this.resolve(inputs.routeFormation).data);
    this.initialized = true;
  }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Deterministic unit vector on the sphere from a seed (pure `seededRandom`),
 * written in place into `out[offset..offset+2]` — zero allocation.
 */
function seededUnitAxis(seed: number, out: Float32Array, offset: number): void {
  const theta = seededRandom(seed) * Math.PI * 2;
  const z = seededRandom(seed + 0.5) * 2 - 1;
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  out[offset] = Math.cos(theta) * r;
  out[offset + 1] = Math.sin(theta) * r;
  out[offset + 2] = z;
}
