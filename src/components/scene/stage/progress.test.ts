import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BOUNDARY_END,
  BOUNDARY_START,
  PROGRESS_EPSILON,
  boundaryProgress,
  clamp01,
  createEpsilonGate,
  formationAt,
  pageProgress,
  type SectionAnchor,
} from "./progress";

/**
 * Producer-parity unit tests for the ONE pure progress module (DESIGN-SPEC §7
 * "Shared progress function unit tests"). The repo has no unit-test runner
 * wired (only Playwright, whose testDir is ./evals, so this file is never
 * collected there) — run ad hoc via node:test:
 *
 *   npx tsx --test src/components/scene/stage/progress.test.ts
 */

// Shared fixture: three stations on a 1000px viewport. Boundary geometry:
// start at top 80% (viewportTop 800), end at top 20% (viewportTop 200).
const VH = 1000;
const ANCHORS: readonly SectionAnchor[] = [
  { formation: "constellation", top: 0 },
  { formation: "filament", top: 2000 },
  { formation: "lattice", top: 4000 },
];

void test("clamp01 clamps below, above, and passes through inside", () => {
  assert.equal(clamp01(-0.5), 0);
  assert.equal(clamp01(1.5), 1);
  assert.equal(clamp01(0.25), 0.25);
});

void test("boundaryProgress is 0 until the section top reaches BOUNDARY_START", () => {
  // top at exactly 80% of the viewport (2000 - 1200 = 800)
  assert.equal(boundaryProgress(2000, 1200, VH), 0);
  // far below the start line
  assert.equal(boundaryProgress(2000, 0, VH), 0);
});

void test("boundaryProgress is 1 once the section top reaches BOUNDARY_END", () => {
  // top at exactly 20% of the viewport (2000 - 1800 = 200)
  assert.equal(boundaryProgress(2000, 1800, VH), 1);
  // scrolled far past — clamped, never over 1
  assert.equal(boundaryProgress(2000, 3000, VH), 1);
});

void test("boundaryProgress scrubs linearly through the zone", () => {
  // midway between 80% and 20% (viewportTop 500)
  assert.equal(boundaryProgress(2000, 1500, VH), 0.5);
});

void test("boundary constants match the ScrollTrigger geometry contract", () => {
  // scroll-director derives `start: "top 80%"` / `end: "top 20%"` from these —
  // a change here MUST be a conscious choreography decision, not drift.
  assert.equal(BOUNDARY_START, 0.8);
  assert.equal(BOUNDARY_END, 0.2);
});

void test("pageProgress spans 0..1 over the scrollable range", () => {
  assert.equal(pageProgress(0, 5000, VH), 0);
  assert.equal(pageProgress(2000, 5000, VH), 0.5);
  assert.equal(pageProgress(4000, 5000, VH), 1);
  assert.equal(pageProgress(9999, 5000, VH), 1); // overscroll clamps
});

void test("pageProgress pins to 0 when the page cannot scroll", () => {
  assert.equal(pageProgress(0, VH, VH), 0);
  assert.equal(pageProgress(0, 500, VH), 0);
});

void test("formationAt returns null without anchors (route registry owns the field)", () => {
  assert.equal(formationAt([], 0, VH), null);
});

void test("formationAt rests in the first formation before any boundary", () => {
  assert.deepEqual(formationAt(ANCHORS, 0, VH), {
    from: "constellation",
    to: "constellation",
    t: 0,
  });
});

void test("formationAt scrubs the active boundary", () => {
  assert.deepEqual(formationAt(ANCHORS, 1500, VH), {
    from: "constellation",
    to: "filament",
    t: 0.5,
  });
  assert.deepEqual(formationAt(ANCHORS, 3500, VH), {
    from: "filament",
    to: "lattice",
    t: 0.5,
  });
});

void test("formationAt holds the previous boundary at t=1 inside a section", () => {
  // 2500: past #career's boundary end, before #projects' boundary start
  assert.deepEqual(formationAt(ANCHORS, 2500, VH), {
    from: "constellation",
    to: "filament",
    t: 1,
  });
});

void test("producer parity: formationAt t equals the per-boundary trigger progress", () => {
  // The desktop path writes each boundary's ScrollTrigger progress directly;
  // the touch path derives t through formationAt — same number, always.
  for (const scrollY of [1200, 1350, 1500, 1650, 1800]) {
    const state = formationAt(ANCHORS, scrollY, VH);
    assert.ok(state);
    assert.equal(state.t, boundaryProgress(2000, scrollY, VH));
  }
});

void test("epsilon gate passes the first value, swallows sub-epsilon steps", () => {
  let fired = 0;
  const gate = createEpsilonGate(() => {
    fired += 1;
  });
  gate(0.5);
  assert.equal(fired, 1); // first call always seeds a frame
  gate(0.5 + PROGRESS_EPSILON / 2);
  assert.equal(fired, 1); // settle tick — silent
  gate(0.5 + PROGRESS_EPSILON * 2);
  assert.equal(fired, 2); // real movement past the gate
});

void test("epsilon gate accumulates sub-epsilon steps instead of losing them", () => {
  let fired = 0;
  const gate = createEpsilonGate(() => {
    fired += 1;
  });
  gate(0);
  // Ten steps of epsilon*0.4 each: individually silent, but drift from the
  // last PASSED value crosses the gate on the way — slow scrubs still render.
  for (let i = 1; i <= 10; i++) {
    gate(i * PROGRESS_EPSILON * 0.4);
  }
  assert.ok(fired > 1);
});
