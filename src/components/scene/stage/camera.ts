/**
 * Stage camera intrinsics (KERN WP-A; DESIGN-SPEC §2.3, §6 WP-A). The single
 * source of the shipped hero camera pose — position [0,0,8], fov 45° — read
 * by three consumers that must agree byte-for-byte or `worldPerPixel` diverges
 * from doc px (Contract 2):
 *   1. `measure.ts` unprojection (`STAGE_CAMERA` → `computeWorldPerPixel`);
 *   2. the `stage-canvas.tsx` `<Canvas camera>` prop;
 *   3. `kern-stage.tsx` pointer unprojection + `camera-rig.ts` base pose.
 *
 * These constants currently ALSO live in `formations.ts`; that copy stays on
 * `main` for the v1 particle stage (§2.3 keeps `formations.ts` untouched until
 * the atomic flip). WP-F repoints `stage-canvas.tsx`'s import here at flip time.
 * This module imports no three (VISIBLE_WORLD_HEIGHT is pure trig), so it is
 * safe to reach from `measure.ts` without pulling the WebGL chunk.
 */

import type { StageCameraIntrinsics } from "./measure";

/** Camera distance from the z=0 scene plane (world units). */
export const CAMERA_Z = 8;
/** Camera vertical field of view (degrees). */
export const CAMERA_FOV_DEG = 45;
/**
 * Visible world height at z=0: `2 · tan(fov/2) · distance`. Divided by the
 * viewport height in px it yields `worldPerPixel` — the one doc→scene factor
 * used for the pre-measure interim layout (kern-engine.ts) and measure.ts.
 */
export const VISIBLE_WORLD_HEIGHT =
  2 * CAMERA_Z * Math.tan(((CAMERA_FOV_DEG / 2) * Math.PI) / 180);

/**
 * Intrinsics object handed to `measure.ts` (Contract 2: the unprojection must
 * use THIS canvas's pose). Module constant so the measurement lifecycle isn't
 * restarted per render.
 */
export const STAGE_CAMERA: StageCameraIntrinsics = {
  fovDeg: CAMERA_FOV_DEG,
  distance: CAMERA_Z,
};
