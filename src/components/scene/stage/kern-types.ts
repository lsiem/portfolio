/**
 * KERN shared contract (SOLID-3D v2, DESIGN-SPEC §6 "Frozen contracts").
 * Types + `const` exports ONLY — no runtime allocation, no three import — so
 * importing from anywhere (eager or lazy) costs zero bytes beyond the numeric
 * constants themselves. WP-B/C/D program against exactly these shapes; the
 * block below is FROZEN and may not change without a coordinated version bump
 * across every work package that imports it.
 *
 * FormationId is the frozen vocabulary from scene-bridge.ts (§2.5) — imported
 * type-only, never re-declared here, so the 1:1 rename debt stays in one place.
 * MeasuredLayout comes from the shipped Contract-2 stage-types.ts (WP-E extends
 * `MeasuredLayout` with `skillClusterRects`; this file stays agnostic to that
 * addition — it only forwards the type).
 */

import type { FormationId } from "../scene-bridge";
import type { MeasuredLayout } from "./stage-types";

/** Pool size (§2.2 hard floor: 53×7 `#activity` voxel grid = 371 + 13 spares). */
export const POOL = 384;
/** Per-instance live/target stride: pos³ + quat⁴ + scale¹ + colorMix¹. */
export const FLOATS_PER_SHARD = 9;

export type KernTargets = {
  version: number; // layout-version stamp
  data: Float32Array; // length POOL * FLOATS_PER_SHARD
  // per shard i: [px,py,pz, qx,qy,qz,qw, scale, colorMix]
};

export interface KernFormationBuilder {
  (layout: MeasuredLayout, prev: KernTargets | null): KernTargets;
  // MUST hemisphere-normalize quats against `prev` before returning
}

export interface KernEngineInputs {
  // what kern-stage passes engine.step()
  formation: { from: FormationId; to: FormationId; t: number } | null;
  routeFormation: FormationId;
  transitionT: number; // 0..1
  scrollVelocity: number;
  sectionProgress: number;
  pointer: { x: number; y: number; active: boolean };
  heatmapLevels: Uint8Array | null;
}

// Engine settle constants (frozen; documented derivation in kern-engine.ts).
export const POS_LERP_RATE = 8,
  POS_SETTLE_EPS = 0.003;
export const ROT_SLERP_RATE = 8,
  ROT_SETTLE_EPS = 0.004; // rad
export const VELOCITY_DECAY_RATE = 10,
  VELOCITY_EPS = 0.5,
  VELOCITY_CAP = 60;
export const STAGGER_SPAN = 0.35,
  STAGGER_SPAN_FAST = 0.12,
  VEL_STAGGER_THRESHOLD = 18;
export const SCATTER_DIST = 6;
