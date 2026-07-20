import { test } from "node:test";
import assert from "node:assert/strict";

import { KERN_BUILDERS } from "./kern-formations";
import { KernEngine } from "./kern-engine";
import {
  FLOATS_PER_SHARD,
  POOL,
  type KernEngineInputs,
  type KernTargets,
} from "./kern-types";
import type { FormationId } from "../scene-bridge";
import type { DocRect, MeasuredLayout } from "./stage-types";

/**
 * Mesh-era invariant unit tests (DESIGN-SPEC §8 "New checks for mesh-era
 * invariants" 1/2/7). The repo has no unit-test runner wired (Playwright's
 * testDir is ./evals, so this file is never collected there) — run ad hoc via
 * node:test, same as progress.test.ts:
 *
 *   npx tsx --test src/components/scene/stage/kern-invariants.test.ts
 *
 * These are pure-math checks (no DOM, no WebGL): they exercise the shard-pool
 * geometry contract and the engine's settle-and-go-silent behavior directly,
 * so they run deterministically in CI without a browser.
 */

// --- Shard stride offsets (mirror kern-stage.tsx) -----------------------------
const QX = 3;
const QY = 4;
const QZ = 5;
const QW = 6;
const SCALE = 7;

// --- Representative layout (a settled 1440×900 homepage) ----------------------
function rect(left: number, top: number, width: number, height: number): DocRect {
  return { left, top, width, height };
}

function mockLayout(heatmap: Uint8Array | null = null): MeasuredLayout {
  return {
    sections: {
      hero: rect(0, 0, 1440, 900),
      career: rect(0, 900, 1440, 1200),
      projects: rect(0, 2100, 1440, 1000),
      skills: rect(0, 3100, 1440, 800),
      about: rect(0, 3900, 1440, 600),
      activity: rect(0, 4500, 1440, 700),
      contact: rect(0, 5200, 1440, 500),
    },
    bentoCells: Array.from({ length: 6 }, (_unused, i) =>
      rect((i % 3) * 480, 2100 + Math.floor(i / 3) * 500, 460, 480),
    ),
    spineX: 200,
    skillClusterRects: Array.from({ length: 4 }, (_unused, i) =>
      rect(0, 3100 + i * 200, 1440, 180),
    ),
    heatmap,
    viewport: { w: 1440, h: 900 },
    worldPerPixel: 0.01,
  };
}

/** Valid GitHub heatmap: 53×7 levels 0..4 (index = week*7 + day). */
function validHeatmap(): Uint8Array {
  const cells = new Uint8Array(53 * 7);
  for (let i = 0; i < cells.length; i += 1) cells[i] = i % 5;
  return cells;
}

/**
 * A target resolver backed by the real builders (WP-C), against one layout.
 * Memoized per id: the engine's `sameTargets = from === to` fast path relies on
 * stable reference identity per (id, version) — exactly what kern-stage's cache
 * guarantees — so the resolver must return the SAME object for a repeated id.
 */
function resolverFor(layout: MeasuredLayout): (id: FormationId) => KernTargets {
  const cache = new Map<FormationId, KernTargets>();
  return (id) => {
    let targets = cache.get(id);
    if (!targets) {
      targets = KERN_BUILDERS[id](layout, null);
      cache.set(id, targets);
    }
    return targets;
  };
}

function baseInputs(routeFormation: FormationId): KernEngineInputs {
  return {
    formation: null,
    routeFormation,
    transitionT: 0,
    scrollVelocity: 0,
    sectionProgress: 0,
    hoverRect: null,
    pointer: { x: 0, y: 0, active: false },
    heatmapLevels: null,
  };
}

function allFinite(data: Float32Array): boolean {
  for (let i = 0; i < data.length; i += 1) {
    if (!Number.isFinite(data[i])) return false;
  }
  return true;
}

// The homepage scroll stations the visitor actually scrubs through, in document
// order (section-config SECTION_SEQUENCE) — plus the two route formations. These
// are the adjacent pairs whose quats must stay in one hemisphere so a reverse
// scrub can never take the 270°-wrong-way arc.
const SCROLL_SEQUENCE: readonly FormationId[] = [
  "constellation",
  "filament",
  "lattice",
  "orbits",
  "frame",
  "grid",
  "glyph",
];
const ALL_FORMATIONS: readonly FormationId[] = [
  ...SCROLL_SEQUENCE,
  "halo",
  "rest",
];

// --- §8.1: quaternion hemisphere-normalization --------------------------------
void test("§8.1 hemisphere-normalization: adjacent formation quats keep dot >= 0", () => {
  const layout = mockLayout(validHeatmap());

  // Build the chain in adjacent order, each normalized against its predecessor
  // (the `prev` the builder hemisphere-normalizes against, §2.4). For every
  // adjacent pair, EVERY shard's target quat must share a hemisphere with the
  // previous formation's — dot >= 0 — so slerp always takes the shortest arc.
  let prev: KernTargets | null = null;
  for (const id of ALL_FORMATIONS) {
    const targets = KERN_BUILDERS[id](layout, prev);
    assert.equal(
      targets.data.length,
      POOL * FLOATS_PER_SHARD,
      `${id} target array must be POOL*stride`,
    );
    if (prev) {
      const a = prev.data;
      const b = targets.data;
      for (let i = 0; i < POOL; i += 1) {
        const o = i * FLOATS_PER_SHARD;
        const dot =
          a[o + QX] * b[o + QX] +
          a[o + QY] * b[o + QY] +
          a[o + QZ] * b[o + QZ] +
          a[o + QW] * b[o + QW];
        assert.ok(
          dot >= -1e-6,
          `shard ${i} flips hemisphere across → ${id} (dot=${dot.toFixed(4)})`,
        );
      }
    }
    prev = targets;
  }
});

// --- §8.2: angular settle window ----------------------------------------------
void test("§8.2 angular settle: a completed max-error boundary goes silent within the worst-case window", () => {
  const layout = mockLayout(validHeatmap());
  const engine = new KernEngine(resolverFor(layout));
  const out = new Float32Array(POOL * FLOATS_PER_SHARD);
  const inputs = baseInputs("constellation");

  // Frame 1: init snaps the pool onto `constellation` (a settled field, §ensureInit).
  engine.setInputs(inputs);
  engine.step(1 / 60, 0, out);
  assert.equal(engine.needsFrame, false, "a settled route field must not demand frames");

  // Flip the route to `orbits` (gyroscope tilts — a large angular error vs. the
  // monogram): a COMPLETED boundary at maximum error. The pool must converge and
  // go silent within the derived worst-case window (~1.30 s, class header).
  inputs.routeFormation = "orbits";
  engine.setInputs(inputs);
  const dt = 1 / 60;
  let elapsed = 0;
  engine.step(dt, elapsed, out);
  assert.equal(engine.needsFrame, true, "a fresh max-error boundary must demand frames");

  const MAX_STEPS = 300; // 5 s hard cap — a non-settling engine fails loudly
  let steps = 0;
  while (engine.needsFrame && steps < MAX_STEPS) {
    elapsed += dt;
    engine.step(dt, elapsed, out);
    steps += 1;
  }
  const settleS = steps * dt;
  assert.equal(engine.needsFrame, false, "engine never settled within the cap");
  assert.ok(allFinite(out), "settled pose must contain no NaN/Infinity");
  // ~1.30 s worst case; assert it lands strictly under R1's 1500 ms rest budget
  // (the whole reason the settle math was derived) with a small margin.
  assert.ok(
    settleS <= 1.45,
    `settle took ${settleS.toFixed(3)}s, over the ~1.30s worst-case window`,
  );
  // And that it genuinely converged over time rather than snapping in one frame.
  assert.ok(settleS >= 0.3, `settle was implausibly instant (${settleS.toFixed(3)}s)`);
});

// --- §8.7: malformed-heatmap fallback -----------------------------------------
void test("§8.7 malformed heatmap → flat neutral grid, no NaN, engine still settles", () => {
  const malformed: Array<Uint8Array | null> = [
    null, // Contract-4 last-known-good/malformed → null
    new Uint8Array(10), // too short (< 53×7 − 7) → fallback
  ];

  for (const heatmap of malformed) {
    const layout = mockLayout(heatmap);
    const grid = KERN_BUILDERS.grid(layout, null);

    assert.equal(grid.data.length, POOL * FLOATS_PER_SHARD);
    assert.ok(allFinite(grid.data), "grid fallback produced NaN/Infinity");

    // Flat neutral terrain: the 371 active voxel cells all collapse to the SAME
    // uniform scale (no per-cell height), which is the falsifiable signature of
    // the null/short fallback path (vs. a real level-driven terrain).
    const GRID_CELLS = 53 * 7;
    const firstScale = grid.data[SCALE];
    for (let i = 1; i < GRID_CELLS; i += 1) {
      assert.ok(
        Math.abs(grid.data[i * FLOATS_PER_SHARD + SCALE] - firstScale) < 1e-6,
        `cell ${i} scale ${grid.data[i * FLOATS_PER_SHARD + SCALE]} ≠ neutral ${firstScale}`,
      );
    }

    // The engine must still converge onto the fallback grid and go silent.
    const engine = new KernEngine(resolverFor(layout));
    const out = new Float32Array(POOL * FLOATS_PER_SHARD);
    const inputs = baseInputs("rest");
    engine.setInputs(inputs);
    engine.step(1 / 60, 0, out);
    inputs.routeFormation = "grid";
    engine.setInputs(inputs);
    let elapsed = 0;
    let steps = 0;
    do {
      elapsed += 1 / 60;
      engine.step(1 / 60, elapsed, out);
      steps += 1;
    } while (engine.needsFrame && steps < 300);
    assert.equal(engine.needsFrame, false, "engine never settled on the fallback grid");
    assert.ok(allFinite(out), "settled fallback pose contained NaN/Infinity");
  }
});
