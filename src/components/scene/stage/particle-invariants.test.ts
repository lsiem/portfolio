import { test } from "node:test";
import assert from "node:assert/strict";
import type { FormationId } from "../scene-bridge";
import { ParticleEngine } from "./particle-engine";
import { buildParticleTargets } from "./particle-formations";
import {
  FLOATS_PER_PARTICLE,
  MOBILE_PARTICLES,
  type ParticleEngineInputs,
  type ParticleTargets,
} from "./particle-types";
import type { MeasuredLayout } from "./stage-types";

const ids: FormationId[] = [
  "constellation",
  "filament",
  "lattice",
  "orbits",
  "frame",
  "grid",
  "glyph",
  "halo",
  "rest",
];

function layout(): MeasuredLayout {
  const section = (top: number, height = 720) => ({
    left: 0,
    top,
    width: 1280,
    height,
  });
  return {
    sections: {
      hero: section(0),
      career: section(720, 1000),
      projects: section(1720, 900),
      skills: section(2620, 800),
      about: section(3420, 600),
      activity: section(4020, 600),
      contact: section(4620, 500),
    },
    bentoCells: [section(1720, 400), section(2120, 400)],
    spineX: 180,
    skillClusterRects: Array.from({ length: 4 }, (_, index) => ({
      left: 0,
      top: 2620 + index * 200,
      width: 1280,
      height: 200,
    })),
    heatmap: new Uint8Array(371).map((_, index) => index % 5),
    viewport: { w: 1280, h: 720 },
    worldPerPixel: 0.0092,
  };
}

test("all particle formations are finite, deterministic, and full-sized", () => {
  for (const id of ids) {
    const first = buildParticleTargets(id, layout(), MOBILE_PARTICLES, 3);
    const second = buildParticleTargets(id, layout(), MOBILE_PARTICLES, 3);
    assert.equal(first.data.length, MOBILE_PARTICLES * FLOATS_PER_PARTICLE);
    assert.equal(first.version, 3);
    assert.deepEqual(first.data, second.data);
    for (const value of first.data) assert.equal(Number.isFinite(value), true);
  }
});

test("particle engine settles and stops requesting frames", () => {
  const cache = new Map<FormationId, ParticleTargets>();
  const resolve = (id: FormationId): ParticleTargets => {
    let target = cache.get(id);
    if (!target) {
      target = buildParticleTargets(id, layout(), MOBILE_PARTICLES);
      cache.set(id, target);
    }
    return target;
  };
  const engine = new ParticleEngine(MOBILE_PARTICLES, resolve);
  const inputs: ParticleEngineInputs = {
    formation: { from: "constellation", to: "orbits", t: 1 },
    routeFormation: "constellation",
    transitionT: 1,
    scrollVelocity: 36,
  };
  const output = new Float32Array(MOBILE_PARTICLES * FLOATS_PER_PARTICLE);
  engine.setInputs(inputs);
  engine.step(1 / 60, 0, output);
  assert.equal(engine.needsFrame, true);

  inputs.transitionT = 0;
  for (let frame = 0; frame < 180; frame += 1) {
    engine.step(1 / 60, frame / 60, output);
  }
  assert.equal(engine.needsFrame, false);
  assert.equal(inputs.scrollVelocity, 0);
});
