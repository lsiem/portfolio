/**
 * Build-time @-glyph shard sampler (KERN WP-C, DESIGN-SPEC §3 #contact / §5).
 * Dev-only script — NEVER imported by app code and NEVER shipped: it writes the
 * static `src/components/scene/stage/glyph-shards.json` the lazy stage chunk
 * bundles, so the `glyph` formation costs zero network requests and zero
 * runtime path parsing (§5 "zero new network requests").
 *
 * Run once (and re-run only if GLYPH_PATH changes):
 *   npx tsx scripts/sample-glyph.ts
 *
 * KERN divergence from the v1 `glyph-points.json` (2-float outline points): the
 * @ is sampled into full shard SLOTS — position + tangent-orientation
 * quaternion + scale — by the shared `shard-sampler.ts`. The glyph is a
 * stylized "@" defined as an inline SVG path (a 100×100 y-DOWN viewBox) split
 * into its three subpaths; each subpath is arc-length sampled into a y-up
 * centreline STROKE, then handed to the sampler as the shard centrelines
 * (§5 procedural, no font). Output slots live in a y-up unit box centred on the
 * glyph so `kern-formations.ts#glyph` only scales + translates into the
 * contact rect.
 *
 * Hand-rolled SVG sampler on purpose (DESIGN-SPEC §5 devDependency note): only
 * the commands the path below uses (M, L, C, A) — not a general path engine.
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { sampleShards, type Point2, type ShardSlot } from "./shard-sampler";

// Stylized "@" (100×100 viewBox, y down, centre 50,50):
//   1. the inner ring (full circle, r=15) — two-arc idiom for a closed circle
//   2. the descender bar + tail hooking out of the ring toward lower-right
//   3. the outer sweep (r≈31), open on the right where the tail exits
const GLYPH_PATH = [
  "M65 50 A15 15 0 1 1 35 50 A15 15 0 1 1 65 50",
  "M65 36 L65 57 C65 67 73 70 80 65",
  "M80 65 A31 31 0 1 1 80 34",
].join(" ");

/** Approximate arc-length distance between consecutive samples (viewBox units). */
const SAMPLE_STEP = 0.55;
/** Subdivisions used to approximate each cubic segment's length before resampling. */
const CUBIC_SUBDIVISIONS = 64;
/** viewBox extent — used to flip y-down → y-up before sampling. */
const VIEWBOX = 100;

// --- KERN slot-sampling knobs (design-space = 100×100 viewBox) ---------------
/** Pool instances that converge onto the @ (the full pool forms the glyph). */
const SLOT_COUNT = 384;
/** Perpendicular half-thickness of the shard cloud around the @ outline. */
const STROKE_HALF_WIDTH = 2.4;
/** Shallow depth so the @ reads as a solid ribbon, not a flat decal. */
const DEPTH = 2.6;
const SCALE_MIN = 0.8;
const SCALE_MAX = 1.15;
const TILT_SPREAD = 0.34;
const TWIST_SPREAD = 0.5;
const SEED = 41;
const DECIMALS = 4;

interface Point {
  x: number;
  y: number;
}

// --- Minimal path tokenizer (M/L/C/A, absolute coordinates only) -------------
interface Command {
  op: "M" | "L" | "C" | "A";
  args: number[];
}

function parsePath(d: string): Command[] {
  const commands: Command[] = [];
  const matcher = /([MLCA])([^MLCA]*)/g;
  for (const match of d.matchAll(matcher)) {
    const op = match[1] as Command["op"];
    const args = (match[2] ?? "")
      .trim()
      .split(/[\s,]+/)
      .filter((token) => token !== "")
      .map(Number);
    if (args.some(Number.isNaN)) {
      throw new Error(`sample-glyph: malformed args in segment "${match[0]}"`);
    }
    commands.push({ op, args });
  }
  return commands;
}

// --- Segment samplers ---------------------------------------------------------
function sampleLine(from: Point, to: Point, out: Point[]): Point {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.round(length / SAMPLE_STEP));
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    out.push({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });
  }
  return out[out.length - 1] as Point;
}

function cubicAt(from: Point, c1: Point, c2: Point, to: Point, t: number): Point {
  const inv = 1 - t;
  const a = inv * inv * inv;
  const b = 3 * inv * inv * t;
  const c = 3 * inv * t * t;
  const d = t * t * t;
  return {
    x: a * from.x + b * c1.x + c * c2.x + d * to.x,
    y: a * from.y + b * c1.y + c * c2.y + d * to.y,
  };
}

function sampleCubic(
  from: Point,
  c1: Point,
  c2: Point,
  to: Point,
  out: Point[],
): Point {
  // Approximate length via fine subdivision, then resample at SAMPLE_STEP.
  let length = 0;
  let prev = from;
  for (let i = 1; i <= CUBIC_SUBDIVISIONS; i += 1) {
    const p = cubicAt(from, c1, c2, to, i / CUBIC_SUBDIVISIONS);
    length += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  const steps = Math.max(1, Math.round(length / SAMPLE_STEP));
  for (let i = 1; i <= steps; i += 1) {
    out.push(cubicAt(from, c1, c2, to, i / steps));
  }
  return out[out.length - 1] as Point;
}

/**
 * Elliptical arc per the SVG endpoint→center parameterization
 * (W3C SVG 2 §B.2.4), restricted to xAxisRotation = 0 — all this glyph needs.
 */
function sampleArc(
  from: Point,
  rx: number,
  ry: number,
  largeArc: number,
  sweep: number,
  to: Point,
  out: Point[],
): Point {
  const dx = (from.x - to.x) / 2;
  const dy = (from.y - to.y) / 2;
  // Correct out-of-range radii (B.2.4 step 3).
  const lambda = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
  const scale = lambda > 1 ? Math.sqrt(lambda) : 1;
  const crx = rx * scale;
  const cry = ry * scale;

  const sign = largeArc !== sweep ? 1 : -1;
  const num = crx * crx * cry * cry - crx * crx * dy * dy - cry * cry * dx * dx;
  const den = crx * crx * dy * dy + cry * cry * dx * dx;
  const coef = sign * Math.sqrt(Math.max(0, num / den));
  const cxPrime = (coef * (crx * dy)) / cry;
  const cyPrime = (coef * -(cry * dx)) / crx;
  const cx = cxPrime + (from.x + to.x) / 2;
  const cy = cyPrime + (from.y + to.y) / 2;

  const angleOf = (px: number, py: number): number =>
    Math.atan2((py - cyPrime) / cry, (px - cxPrime) / crx);
  const startAngle = angleOf(dx, dy);
  let deltaAngle = angleOf(-dx, -dy) - startAngle;
  if (sweep === 0 && deltaAngle > 0) deltaAngle -= 2 * Math.PI;
  if (sweep === 1 && deltaAngle < 0) deltaAngle += 2 * Math.PI;

  const length = Math.abs(deltaAngle) * Math.max(crx, cry);
  const steps = Math.max(2, Math.round(length / SAMPLE_STEP));
  for (let i = 1; i <= steps; i += 1) {
    const angle = startAngle + deltaAngle * (i / steps);
    out.push({ x: cx + crx * Math.cos(angle), y: cy + cry * Math.sin(angle) });
  }
  return out[out.length - 1] as Point;
}

/**
 * Sample the path into one stroke (polyline) per subpath — each "M" starts a
 * fresh stroke, so the shard sampler never bridges the ring, the tail and the
 * outer sweep with a spurious segment.
 */
function samplePathStrokes(d: string): Point[][] {
  const strokes: Point[][] = [];
  let current: Point[] = [];
  let cursor: Point = { x: 0, y: 0 };
  for (const { op, args } of parsePath(d)) {
    if (op === "M") {
      if (current.length > 1) strokes.push(current);
      cursor = { x: args[0] as number, y: args[1] as number };
      current = [cursor];
    } else if (op === "L") {
      cursor = sampleLine(cursor, { x: args[0] as number, y: args[1] as number }, current);
    } else if (op === "C") {
      cursor = sampleCubic(
        cursor,
        { x: args[0] as number, y: args[1] as number },
        { x: args[2] as number, y: args[3] as number },
        { x: args[4] as number, y: args[5] as number },
        current,
      );
    } else {
      cursor = sampleArc(
        cursor,
        args[0] as number,
        args[1] as number,
        // args[2] is xAxisRotation — always 0 in GLYPH_PATH, ignored.
        args[3] as number,
        args[4] as number,
        { x: args[5] as number, y: args[6] as number },
        current,
      );
    }
  }
  if (current.length > 1) strokes.push(current);
  return strokes;
}

// Sample the @ into y-DOWN subpath strokes, then flip to y-UP for the sampler.
const strokes: Point2[][] = samplePathStrokes(GLYPH_PATH).map((stroke) =>
  stroke.map((p): Point2 => ({ x: p.x, y: VIEWBOX - p.y })),
);

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
  "src/components/scene/stage/glyph-shards.json",
);
writeFileSync(outPath, `${JSON.stringify({ slots })}\n`);
process.stdout.write(`sample-glyph: wrote ${slots.length} shard slots to ${outPath}\n`);
