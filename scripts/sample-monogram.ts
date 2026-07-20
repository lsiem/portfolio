/**
 * Build-time LS-monogram shard sampler (KERN WP-C, DESIGN-SPEC §3 #hero / §5).
 * Dev-only script — NEVER imported by app code and NEVER shipped: it writes the
 * static `src/components/scene/stage/monogram-shards.json` the lazy stage chunk
 * bundles, so the hero `constellation` formation (the LS monogram all 384
 * shards assemble into) costs zero network requests and zero runtime font
 * parsing (§5 "100% procedural … zero runtime font fetch", constraint 7).
 *
 * Run once (and re-run only if the letterform strokes change):
 *   npx tsx scripts/sample-monogram.ts
 *
 * PROCEDURAL, NOT font-sampled (documented divergence, DESIGN-SPEC §5): the
 * repo self-hosts Bricolage Grotesque only as woff2, and neither facetype.js
 * nor opentype.js is installed, so the spec's escape hatch applies — generate
 * the shape procedurally and document it. The monogram is defined as explicit
 * y-up centreline STROKES: the "L" as a two-segment corner polyline, the "S"
 * as a Catmull-Rom spline through nine control points (densified via the shared
 * sampler's `splinePolyline`). The shared `shard-sampler.ts` walks those
 * strokes by arc-length, seeds a perpendicular thickness + depth, orients each
 * shard's hex face toward the viewer with a tangent-aligned twist, and
 * normalises the cloud into a y-up unit box centred on the origin — the space
 * `kern-formations.ts#constellation` scales + translates into the hero rect.
 *
 * Determinism: same sin-hash PRNG as the runtime scene, no `Math.random`, so
 * re-runs reproduce byte-identical JSON (the §8.4 snapshot-diff tripwire).
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { POOL } from "../src/components/scene/stage/kern-types";
import {
  sampleShards,
  splinePolyline,
  type Point2,
  type ShardSlot,
} from "./shard-sampler";

// --- Letterform strokes (y-UP design box, ~0..100 tall) ----------------------
// "L": stem top → corner → foot end, one connected polyline.
const L_STROKE: Point2[] = [
  { x: 14, y: 96 },
  { x: 14, y: 8 },
  { x: 52, y: 8 },
];

// "S": nine control points tracing the double curve, offset to sit right of L.
const S_OFFSET_X = 58;
const S_CONTROL: Point2[] = [
  { x: 44, y: 82 },
  { x: 24, y: 96 },
  { x: 6, y: 80 },
  { x: 18, y: 60 },
  { x: 28, y: 51 },
  { x: 40, y: 42 },
  { x: 42, y: 22 },
  { x: 24, y: 6 },
  { x: 6, y: 20 },
].map((p): Point2 => ({ x: p.x + S_OFFSET_X, y: p.y }));

/** Spline divisions for the "S" — dense enough that arc-length walking is smooth. */
const S_DIVISIONS = 96;

// --- KERN slot-sampling knobs (design-space ≈ 100 tall) ----------------------
/** Every pool instance assembles the monogram (§3 "all 384 shards"). */
const SLOT_COUNT = POOL;
/** Perpendicular half-thickness giving each stroke its letterform weight. */
const STROKE_HALF_WIDTH = 6.5;
/** Shallow depth so the monogram reads as a solid slab, not a flat decal. */
const DEPTH = 5;
const SCALE_MIN = 0.85;
const SCALE_MAX = 1.25;
const TILT_SPREAD = 0.4;
const TWIST_SPREAD = 0.55;
const SEED = 17;
const DECIMALS = 4;

const strokes: Point2[][] = [L_STROKE, splinePolyline(S_CONTROL, S_DIVISIONS)];

const slots: ShardSlot[] = sampleShards(strokes, {
  count: SLOT_COUNT,
  strokeHalfWidth: STROKE_HALF_WIDTH,
  depth: DEPTH,
  scaleMin: SCALE_MIN,
  scaleMax: SCALE_MAX,
  tiltSpread: TILT_SPREAD,
  twistSpread: TWIST_SPREAD,
  seed: SEED,
  decimals: DECIMALS,
});

const outPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/components/scene/stage/monogram-shards.json",
);
writeFileSync(outPath, `${JSON.stringify({ slots })}\n`);
process.stdout.write(`sample-monogram: wrote ${slots.length} shard slots to ${outPath}\n`);
