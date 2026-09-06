import type { FormationId } from "../scene-bridge";
import type { DocRect, MeasuredLayout } from "./stage-types";
import { randomInRange, seededRandom } from "./seeded";
import monogram from "./monogram-shards.json";
import glyph from "./glyph-shards.json";
import {
  COLOR_MIX,
  FLOATS_PER_PARTICLE,
  LAYER,
  PX,
  PY,
  PZ,
  SIZE,
  type ParticleTargets,
} from "./particle-types";

type Slot = readonly number[];

const FORMATION_INTENSITY: Record<FormationId, number> = {
  constellation: 0.92,
  filament: 0.72,
  lattice: 0.62,
  orbits: 0.4,
  frame: 0.3,
  grid: 0.58,
  glyph: 0.92,
  halo: 0.46,
  rest: 0.08,
};

export function buildParticleTargets(
  id: FormationId,
  layout: MeasuredLayout,
  count: number,
  version = 0,
): ParticleTargets {
  const data = new Float32Array(count * FLOATS_PER_PARTICLE);
  switch (id) {
    case "constellation":
      fillSampledShape(data, layout, count, "hero", monogram.slots, 0.72, id);
      break;
    case "filament":
      fillFilament(data, layout, count);
      break;
    case "lattice":
      fillLattice(data, layout, count);
      break;
    case "orbits":
      fillOrbits(data, layout, count);
      break;
    case "frame":
      fillFrame(data, layout, count);
      break;
    case "grid":
      fillGrid(data, layout, count);
      break;
    case "glyph":
      fillSampledShape(data, layout, count, "contact", glyph.slots, 0.68, id);
      break;
    case "halo":
      fillHalo(data, layout, count);
      break;
    case "rest":
      fillRest(data, layout, count);
      break;
  }
  return { version, data };
}

function write(
  data: Float32Array,
  i: number,
  x: number,
  y: number,
  z: number,
  size: number,
  colorMix: number,
  layer = particleLayerFor(i),
): void {
  const o = i * FLOATS_PER_PARTICLE;
  data[o + PX] = x;
  data[o + PY] = y;
  data[o + PZ] = z;
  data[o + SIZE] = size;
  data[o + COLOR_MIX] = clamp01(colorMix);
  data[o + LAYER] = layer;
}

function fillSampledShape(
  data: Float32Array,
  layout: MeasuredLayout,
  count: number,
  section: string,
  slots: Slot[],
  scaleRatio: number,
  id: FormationId,
): void {
  const rect = sectionRect(layout, section);
  const isHero = section === "hero";
  const scalePx =
    Math.min(rect.width, rect.height) * (isHero ? 0.48 : scaleRatio);
  const cx = rect.left + rect.width * (isHero ? 0.76 : 0.5);
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < count; i += 1) {
    const slot = slots[i % slots.length];
    const repeat = Math.floor(i / slots.length);
    const seed = i * 7.9 + 3;
    const spread = repeat === 0 ? 0 : Math.min(12, repeat * 1.8);
    write(
      data,
      i,
      worldX(layout, cx + slot[0] * scalePx + jitter(seed, spread)),
      worldY(layout, cy - slot[1] * scalePx + jitter(seed + 1, spread)),
      slot[2] * scalePx * layout.worldPerPixel + layerDepth(i),
      4.2 + seededRandom(seed + 2) * 5.2,
      FORMATION_INTENSITY[id] + jitter(seed + 3, 0.08),
    );
  }
}

function fillFilament(
  data: Float32Array,
  layout: MeasuredLayout,
  count: number,
): void {
  const rect = sectionRect(layout, "career");
  for (let i = 0; i < count; i += 1) {
    const seed = i * 13.3 + 2;
    const knot = i % 7;
    const inKnot = i % 5 !== 0;
    const y = inKnot
      ? rect.top + ((knot + 0.5) / 7) * rect.height + jitter(seed, 24)
      : rect.top + seededRandom(seed) * rect.height;
    const x = layout.spineX + (inKnot ? jitter(seed + 1, 22) : jitter(seed + 1, 5));
    write(
      data,
      i,
      worldX(layout, x),
      worldY(layout, y),
      layerDepth(i),
      inKnot ? 5.5 : 3.2,
      FORMATION_INTENSITY.filament + (inKnot ? 0.12 : -0.12),
    );
  }
}

function fillLattice(
  data: Float32Array,
  layout: MeasuredLayout,
  count: number,
): void {
  const fallback = sectionRect(layout, "projects");
  const cells = layout.bentoCells.length ? layout.bentoCells : [fallback];
  for (let i = 0; i < count; i += 1) {
    const cell = cells[i % cells.length];
    const seed = i * 17.1 + 4;
    const p = seededRandom(seed);
    const edge = i % 4;
    let x = cell.left;
    let y = cell.top;
    if (edge === 0 || edge === 2) {
      x += p * cell.width;
      y += edge === 2 ? cell.height : 0;
    } else {
      x += edge === 1 ? cell.width : 0;
      y += p * cell.height;
    }
    write(
      data,
      i,
      worldX(layout, x),
      worldY(layout, y),
      layerDepth(i),
      3.5 + seededRandom(seed + 1) * 3,
      FORMATION_INTENSITY.lattice,
    );
  }
}

function fillOrbits(
  data: Float32Array,
  layout: MeasuredLayout,
  count: number,
): void {
  const fallback = sectionRect(layout, "skills");
  const rings = layout.skillClusterRects.length
    ? layout.skillClusterRects
    : splitIntoBands(fallback, 4);
  for (let i = 0; i < count; i += 1) {
    const ring = rings[i % rings.length];
    const angle = seededRandom(i * 5.7 + 1) * Math.PI * 2;
    const rx = Math.min(ring.width * 0.12, 85);
    const ry = Math.min(ring.height * 0.34, 70);
    write(
      data,
      i,
      worldX(layout, ring.left + ring.width * 0.87 + Math.cos(angle) * rx),
      worldY(layout, ring.top + ring.height / 2 + Math.sin(angle) * ry),
      layerDepth(i) + Math.sin(angle * 2) * 0.3,
      3.2 + seededRandom(i * 3.2) * 2.8,
      FORMATION_INTENSITY.orbits,
    );
  }
}

function fillFrame(
  data: Float32Array,
  layout: MeasuredLayout,
  count: number,
): void {
  const rect = sectionRect(layout, "about");
  const arm = Math.min(rect.width, rect.height) * 0.18;
  for (let i = 0; i < count; i += 1) {
    const corner = i % 4;
    const alongX = Math.floor(i / 4) % 2 === 0;
    const t = seededRandom(i * 8.3 + 2);
    const right = corner === 1 || corner === 3;
    const bottom = corner >= 2;
    const x = rect.left + (right ? rect.width : 0) + (alongX ? (right ? -1 : 1) * t * arm : 0);
    const y = rect.top + (bottom ? rect.height : 0) + (!alongX ? (bottom ? -1 : 1) * t * arm : 0);
    write(data, i, worldX(layout, x), worldY(layout, y), layerDepth(i), 3.2, FORMATION_INTENSITY.frame);
  }
}

function fillGrid(
  data: Float32Array,
  layout: MeasuredLayout,
  count: number,
): void {
  const rect = sectionRect(layout, "activity");
  for (let i = 0; i < count; i += 1) {
    const cell = i % 371;
    const week = Math.floor(cell / 7);
    const day = cell % 7;
    const level = layout.heatmap?.[cell] ?? 0;
    write(
      data,
      i,
      worldX(layout, rect.left + ((week + 0.5) / 53) * rect.width),
      worldY(layout, rect.top + ((day + 0.5) / 7) * rect.height),
      layerDepth(i) + level * 0.08,
      3.2 + level * 1.1,
      FORMATION_INTENSITY.grid + level * 0.08,
    );
  }
}

function fillHalo(
  data: Float32Array,
  layout: MeasuredLayout,
  count: number,
): void {
  const cx = layout.viewport.w * 0.86;
  const cy = layout.viewport.h * 0.34;
  for (let i = 0; i < count; i += 1) {
    const angle = seededRandom(i * 7.3 + 2) * Math.PI * 2;
    const radius = 0.88 + seededRandom(i * 7.3 + 3) * 0.24;
    write(
      data,
      i,
      worldX(layout, cx + Math.cos(angle) * layout.viewport.w * 0.13 * radius),
      worldY(layout, cy + Math.sin(angle) * layout.viewport.w * 0.1 * radius),
      layerDepth(i),
      2.4 + seededRandom(i) * 2.2,
      0.32,
    );
  }
}

function fillRest(
  data: Float32Array,
  layout: MeasuredLayout,
  count: number,
): void {
  for (let i = 0; i < count; i += 1) {
    const seed = i * 19.7 + 4;
    write(
      data,
      i,
      randomInRange(seed, -5, 5),
      randomInRange(seed + 1, -4, 4),
      randomInRange(seed + 2, -16, -7),
      1.5,
      FORMATION_INTENSITY.rest,
    );
  }
}

function worldX(layout: MeasuredLayout, docX: number): number {
  return (docX - layout.viewport.w / 2) * layout.worldPerPixel;
}

function worldY(layout: MeasuredLayout, docY: number): number {
  return (layout.viewport.h / 2 - docY) * layout.worldPerPixel;
}

function sectionRect(layout: MeasuredLayout, id: string): DocRect {
  return layout.sections[id] ?? {
    left: 0,
    top: 0,
    width: layout.viewport.w,
    height: layout.viewport.h,
  };
}

function splitIntoBands(rect: DocRect, count: number): DocRect[] {
  return Array.from({ length: count }, (_, index) => ({
    left: rect.left,
    top: rect.top + (rect.height / count) * index,
    width: rect.width,
    height: rect.height / count,
  }));
}

export function particleLayerFor(index: number): number {
  const n = seededRandom(index * 4.1 + 6);
  return n < 0.28 ? 0 : n < 0.78 ? 1 : 2;
}

function layerDepth(index: number): number {
  const layer = particleLayerFor(index);
  return layer === 0 ? -3.8 : layer === 1 ? -1.4 : 0.2;
}

function jitter(seed: number, spread: number): number {
  return (seededRandom(seed) + seededRandom(seed + 0.5) - 1) * spread;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
