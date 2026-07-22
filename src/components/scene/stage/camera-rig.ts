/**
 * Camera rig (KERN WP-A; DESIGN-SPEC §2.4, §6 WP-A). The Weltlinie camera
 * dolly extracted from `particle-stage.tsx`'s useFrame block 4, VERBATIM in
 * behavior: a CatmullRom spline over SMOOTHED `bridge.pageProgress`, a slight
 * counter-look so the field pivots around the viewport center — a gentle
 * single-take drift, NOT a room flythrough. Amplitudes stay well under half a
 * world unit around the shipped base pose [0,0,8]: dolly/parallax, not travel.
 *
 * DEMAND-LOOP DISCIPLINE (§2.4, R1): `update()` is the pure per-frame call the
 * stage useFrame invokes; it returns whether the camera still needs frames.
 * Above CAMERA_EPS the smoothed progress eases toward the target and the call
 * reports `true`; within CAMERA_EPS it snaps and reports `false`, so the demand
 * loop can go silent at rest (the §6.3 leak guard). Convergence: worst case
 * (full-page jump, Δprogress = 1) is ln(1 / 0.005) / 6 ≈ 0.9 s of settling —
 * inside R1's 1,500 ms budget. Sized for the `dtSettle` (wall-clock,
 * MAX_SETTLE_DT_S-capped) delta the stage passes, not the elapsed clamp.
 */

import * as THREE from "three";

/**
 * Smoothing rate toward `bridge.pageProgress` (per second). Paired with
 * CAMERA_EPS for R1's settle window (see header). Lives here — the rig owns
 * the camera-smoothing knobs (kern-types.ts owns the shard-engine constants).
 */
export const CAMERA_SMOOTH_RATE = 6;
/**
 * Below this progress delta the camera snaps and stops demanding frames.
 * 0.005 of the spline is well under a pixel of camera travel — the snap is
 * invisible; the epsilon exists purely as the demand-loop leak guard (§6.3).
 */
export const CAMERA_EPS = 0.005;

/**
 * One gentle loop around the shipped base pose [0,0,8] (§3). Amplitudes stay
 * under half a world unit — the drift reads as breathing depth, never a cut.
 */
export const CAMERA_SPLINE_POINTS: ReadonlyArray<[number, number, number]> = [
  [0, 0, 8],
  [0.3, -0.22, 7.55],
  [-0.26, 0.18, 8.3],
  [0.24, -0.14, 7.7],
  [0, 0, 8],
];

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Stateful-but-pure camera drift. Construct once (spline + scratch vectors
 * allocated at init, zero per-frame allocation); call `update` each rendered
 * frame with the live `pageProgress` and the convergence delta.
 */
export class CameraRig {
  private readonly spline: THREE.CatmullRomCurve3;
  private readonly cameraPos = new THREE.Vector3(0, 0, 8);
  private readonly lookTarget = new THREE.Vector3(0, 0, 0);
  private readonly scratchLook = new THREE.Vector3();
  private smoothedProgress = 0;

  constructor() {
    this.spline = new THREE.CatmullRomCurve3(
      CAMERA_SPLINE_POINTS.map(
        ([x, y, z]) => new THREE.Vector3(x, y, z),
      ),
    );
  }

  /**
   * Ease the camera toward `targetProgress` along the spline and apply the
   * counter-look. `dtSettle` is the wall-clock (convergence-capped) delta.
   * Returns `true` while the smoothed progress is still converging (frames
   * needed), `false` once it snaps within CAMERA_EPS (loop may go silent).
   */
  update(
    camera: THREE.Camera,
    targetProgress: number,
    dtSettle: number,
  ): boolean {
    const target = clamp01(targetProgress);
    const diff = target - this.smoothedProgress;
    let settling = false;
    if (Math.abs(diff) > CAMERA_EPS) {
      this.smoothedProgress += diff * Math.min(1, dtSettle * CAMERA_SMOOTH_RATE);
      settling = true;
    } else if (diff !== 0) {
      this.smoothedProgress = target; // snap — stop invalidating (§6.3)
    }

    this.spline.getPointAt(this.smoothedProgress, this.cameraPos);
    camera.position.copy(this.cameraPos);
    // Slight counter-look keeps the field pivoting around the viewport center
    // instead of sliding with the dolly.
    this.lookTarget.lerp(
      this.scratchLook.set(
        this.cameraPos.x * 0.3,
        this.cameraPos.y * 0.3,
        0,
      ),
      Math.min(1, dtSettle * CAMERA_SMOOTH_RATE),
    );
    camera.lookAt(this.lookTarget);
    return settling;
  }
}
