/**
 * shard-sampler.ts — shared build-time shard-slot sampler for the two KERN
 * typography scripts (`sample-monogram.ts`, `sample-glyph.ts`). Dev-only: NEVER
 * imported by app code and NEVER shipped — it only feeds the two static JSON
 * assets the lazy stage chunk bundles, so both the LS monogram and the @-glyph
 * cost zero network requests and zero runtime path/font parsing (DESIGN-SPEC
 * §5 "100% procedural … zero runtime font fetch", constraint 7 DSGVO).
 *
 * PROCEDURAL, NOT font-sampled (documented divergence, DESIGN-SPEC §5): the
 * repo self-hosts Bricolage Grotesque only as woff2, and neither facetype.js
 * nor opentype.js is installed, so the spec's escape hatch applies — "if a
 * suitable self-hosted font is not present for sampling, generate the shape
 * procedurally and document it". Both glyphs are therefore defined as explicit
 * y-up centreline STROKES (polylines) in a design box; this sampler walks the
 * concatenated strokes by arc-length, places `count` shard slots along them
 * with a seeded perpendicular thickness + z jitter, orients each shard's hex
 * face toward the viewer with a tangent-aligned twist + seeded crystalline
 * tilt, and normalises the whole cloud into a y-up unit box centred on the
 * origin (x, y ∈ ~[-0.5, 0.5]) — exactly the space `kern-formations.ts`
 * expects (scale + translate into the section rect).
 *
 * Determinism: uses the same sin-hash PRNG as the runtime scene
 * (`stage/seeded.ts`), never `Math.random`, so re-running the scripts against
 * the pinned `three` reproduces byte-identical JSON (the §8.4 snapshot-diff
 * tripwire depends on this). `three` is imported ONLY for the well-tested
 * Euler→Quaternion + spline math and is a build-time dependency here — nothing
 * in this file reaches a shipped bundle.
 */

import * as THREE from "three";
import {
  randomInRange,
  seededRandom,
} from "../src/components/scene/stage/seeded";

/** A 2D design-space point (y-up). */
export interface Point2 {
  x: number;
  y: number;
}

/**
 * One emitted shard slot: `[px, py, pz, qx, qy, qz, qw, scale]` — position in
 * the normalised y-up unit box, an orientation quaternion, and a per-shard
 * base scale (relative; `kern-formations.ts` multiplies by the world scale).
 * `colorMix` (the 9th target float) is NOT sampled here — it is a per-formation
 * floor the builders apply, so the JSON stays formation-agnostic.
 */
export type ShardSlot = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface SampleOptions {
  /** Number of shard slots to emit (one per pool instance that forms the glyph). */
  count: number;
  /** Seeded perpendicular half-thickness around each stroke (design units). */
  strokeHalfWidth: number;
  /** Seeded z half-range giving the glyph shallow depth (design units). */
  depth: number;
  /** Per-shard base scale range (relative to the formation's world scale). */
  scaleMin: number;
  scaleMax: number;
  /** Seeded crystalline tilt about x and y (radians). */
  tiltSpread: number;
  /** Seeded twist about the viewer axis, added to the stroke tangent (radians). */
  twistSpread: number;
  /** Base PRNG seed — offset per shard so successive samples decorrelate. */
  seed: number;
  /** Output precision — 4 decimals keeps the JSON gzip-trivial. */
  decimals: number;
}

/** One straight segment of a stroke, with its precomputed length + tangent. */
interface Segment {
  ax: number;
  ay: number;
  tx: number; // unit tangent x
  ty: number; // unit tangent y
  length: number;
}

/** Flatten strokes (polylines) into arc-length-tagged segments (no inter-stroke joins). */
function toSegments(strokes: Point2[][]): { segments: Segment[]; total: number } {
  const segments: Segment[] = [];
  let total = 0;
  for (const stroke of strokes) {
    for (let i = 1; i < stroke.length; i += 1) {
      const a = stroke[i - 1] as Point2;
      const b = stroke[i] as Point2;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const length = Math.hypot(dx, dy);
      if (length < 1e-6) continue;
      segments.push({ ax: a.x, ay: a.y, tx: dx / length, ty: dy / length, length });
      total += length;
    }
  }
  return { segments, total };
}

/** Locate the segment + local parameter for an arc-length position `dist`. */
function walk(segments: Segment[], dist: number): { seg: Segment; t: number } {
  let remaining = dist;
  for (const seg of segments) {
    if (remaining <= seg.length) {
      return { seg, t: seg.length > 0 ? remaining / seg.length : 0 };
    }
    remaining -= seg.length;
  }
  const last = segments[segments.length - 1] as Segment;
  return { seg: last, t: 1 };
}

/**
 * Sample `count` shard slots along the given y-up strokes. Returns slots in a
 * normalised y-up unit box centred on the origin. Pure + deterministic in
 * (`strokes`, `opts`).
 */
export function sampleShards(
  strokes: Point2[][],
  opts: SampleOptions,
): ShardSlot[] {
  const { segments, total } = toSegments(strokes);
  if (segments.length === 0 || total <= 0) {
    throw new Error("shard-sampler: strokes produced zero total arc length");
  }

  // First pass: raw design-space positions + orientation, tracking bounds.
  const raw: {
    x: number;
    y: number;
    z: number;
    q: THREE.Quaternion;
    scale: number;
  }[] = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const euler = new THREE.Euler();
  for (let i = 0; i < opts.count; i += 1) {
    const base = opts.seed + i * 3.17;
    const { seg, t } = walk(segments, seededRandom(base) * total);
    const px = seg.ax + seg.tx * seg.length * t;
    const py = seg.ay + seg.ty * seg.length * t;
    // Perpendicular (left normal) offset gives the stroke its thickness.
    const off = randomInRange(base + 0.37, -opts.strokeHalfWidth, opts.strokeHalfWidth);
    const x = px + -seg.ty * off;
    const y = py + seg.tx * off;
    const z = randomInRange(base + 0.71, -opts.depth, opts.depth);

    // Orientation: hex face toward the viewer (+z), spun to the stroke tangent
    // plus a seeded twist, with a small crystalline tilt about x/y.
    const tangentAngle = Math.atan2(seg.ty, seg.tx);
    euler.set(
      randomInRange(base + 1.13, -opts.tiltSpread, opts.tiltSpread),
      randomInRange(base + 1.51, -opts.tiltSpread, opts.tiltSpread),
      tangentAngle + randomInRange(base + 1.97, -opts.twistSpread, opts.twistSpread),
      "XYZ",
    );
    const q = new THREE.Quaternion().setFromEuler(euler);
    const scale = randomInRange(base + 2.29, opts.scaleMin, opts.scaleMax);

    raw.push({ x, y, z, q, scale });
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  // Normalise: centre on the design bbox, scale so the longer axis spans 1.0.
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const round = (value: number): number => Number(value.toFixed(opts.decimals));

  return raw.map((s): ShardSlot => [
    round((s.x - cx) / span),
    round((s.y - cy) / span),
    round(s.z / span),
    round(s.q.x),
    round(s.q.y),
    round(s.q.z),
    round(s.q.w),
    round(s.scale),
  ]);
}

/** Densify control points into a smooth y-up polyline via a Catmull-Rom spline. */
export function splinePolyline(points: Point2[], divisions: number): Point2[] {
  const curve = new THREE.SplineCurve(
    points.map((p) => new THREE.Vector2(p.x, p.y)),
  );
  return curve.getPoints(divisions).map((v) => ({ x: v.x, y: v.y }));
}
