/**
 * Build-time @-glyph point sampler (Kontinuum WP-B, DESIGN-SPEC §3 #contact /
 * §5.2). Dev-only script — NEVER imported by app code and NEVER shipped: it
 * writes the static `src/components/scene/stage/glyph-points.json` that the
 * lazy stage chunk bundles, so the `glyph` formation costs zero network
 * requests and zero runtime path parsing (§6.2 "zero new network requests").
 *
 * Run once (and re-run only if GLYPH_PATH changes):
 *   npx tsx scripts/sample-glyph.ts
 *
 * The glyph is a stylized "@" defined as an inline SVG path (§5.2: "@-glyph
 * sampled from an SVG path") in a 100×100 y-down viewBox and sampled at a
 * roughly uniform arc-length step. Points are emitted normalized to a
 * y-UP unit box (x,y ∈ [-0.5, 0.5]) so `formations.ts#buildGlyph` only has to
 * scale + translate into the contact section's document-space rect.
 *
 * Hand-rolled sampler on purpose (DESIGN-SPEC §8 devDependency note): only
 * the three commands the path below actually uses (M, L, A) plus C for
 * future-proofing — not a general SVG path engine.
 */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Stylized "@" (100×100 viewBox, y down, center 50,50):
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
/** Output precision — 4 decimals keeps the JSON gzip-trivial. */
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
  const num =
    crx * crx * cry * cry - crx * crx * dy * dy - cry * cry * dx * dx;
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
    out.push({
      x: cx + crx * Math.cos(angle),
      y: cy + cry * Math.sin(angle),
    });
  }
  return out[out.length - 1] as Point;
}

// --- Sample the whole path ------------------------------------------------------
function samplePath(d: string): Point[] {
  const points: Point[] = [];
  let cursor: Point = { x: 0, y: 0 };
  for (const { op, args } of parsePath(d)) {
    if (op === "M") {
      cursor = { x: args[0] as number, y: args[1] as number };
      points.push(cursor);
    } else if (op === "L") {
      cursor = sampleLine(cursor, { x: args[0] as number, y: args[1] as number }, points);
    } else if (op === "C") {
      cursor = sampleCubic(
        cursor,
        { x: args[0] as number, y: args[1] as number },
        { x: args[2] as number, y: args[3] as number },
        { x: args[4] as number, y: args[5] as number },
        points,
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
        points,
      );
    }
  }
  return points;
}

const sampled = samplePath(GLYPH_PATH);
const round = (value: number): number => Number(value.toFixed(DECIMALS));
// Normalize 100×100 y-down viewBox → y-up unit box centered on the glyph.
const flat: number[] = [];
for (const point of sampled) {
  flat.push(round((point.x - 50) / 100), round((50 - point.y) / 100));
}

const outPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src/components/scene/stage/glyph-points.json",
);
writeFileSync(
  outPath,
  `${JSON.stringify({ count: sampled.length, points: flat })}\n`,
);
process.stdout.write(
  `sample-glyph: wrote ${sampled.length} points to ${outPath}\n`,
);
