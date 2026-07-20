/**
 * KERN formation builders (WP-C; DESIGN-SPEC §2.1, §3, §5, §6 WP-C). Nine pure,
 * deterministic `KernFormationBuilder`s — one per `FormationId` — that emit the
 * per-instance target arrays the engine (WP-B) settles the 384-shard pool
 * toward. Each is a function of (`MeasuredLayout`, `prev`) ONLY: no DOM reads,
 * no bridge reads, no `Math.random` (seeded sin-hash from `seeded.ts`), so
 * targets are reproducible across renders, re-measures and tests — the same
 * discipline as the v1 `formations.ts` this replaces.
 *
 * Target stride (frozen, `kern-types.ts`): FLOATS_PER_SHARD = 9 per shard —
 * `[px, py, pz, qx, qy, qz, qw, scale, colorMix]`. Positions are WORLD units,
 * doc-anchored exactly like v1 (`docToWorldX/Y` unproject once onto z=0 via
 * `layout.worldPerPixel`; the stage group compensates scroll per frame, so
 * targets track their DOM twins). Quaternions are unit orientation; `scale` is
 * the world-space instance scale; `colorMix` ∈ [0,1] is the theme-token blend
 * WP-D maps to `--border`/`--muted`/`--accent`/`--foreground`.
 *
 * QUATERNION HEMISPHERE-NORMALIZATION (CRITICAL, §2.4): every builder runs
 * `hemisphereNormalize` against `prev` before returning, negating any target
 * quat whose dot with the previous formation's quat is < 0. Slerp takes the
 * shortest arc, so this guarantees reverse scrubbing never produces a
 * 270°-wrong-way spin. Enforced by the §8.1 unit test.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * FROZEN VOCABULARY (§2.5, accepted debt): the `FormationId` names predate the
 * solid rewrite and are semantically misleading on shards, but are kept
 * unchanged so `section-config.ts`, both scroll producers and the
 * `StageFormation` markers need zero edits. The 1:1 KERN meaning + anchor:
 *
 *   FormationId    │ KERN meaning                    │ Anchor
 *   ───────────────┼─────────────────────────────────┼────────────────────
 *   constellation  │ LS monogram (hero)              │ hero rect
 *   filament       │ 7 career plinth-knots           │ spineX
 *   lattice        │ bento picture-frame slabs       │ bentoCells
 *   orbits         │ 4 gyroscope rings               │ skillClusterRects
 *   frame          │ 4 corner-bracket Ls             │ section rect
 *   grid           │ contribution voxel terrain      │ heatmap rect
 *   glyph          │ solid @-outline                 │ contact rect
 *   halo           │ elliptical slab ring            │ viewport upper third
 *   rest           │ near-invisible deep scatter     │ first viewport
 *
 * Renaming later touches 4 files atomically and is explicitly out of scope.
 * ─────────────────────────────────────────────────────────────────────────
 */

import type { FormationId } from "../scene-bridge";
import type { DocRect, MeasuredLayout } from "./stage-types";
import {
  FLOATS_PER_SHARD,
  POOL,
  type KernFormationBuilder,
  type KernTargets,
} from "./kern-types";
import { randomInRange, seededRandom } from "./seeded";
import monogramShards from "./monogram-shards.json";
import glyphShards from "./glyph-shards.json";

// --- Placement constants ------------------------------------------------------
/** lg breakpoint (Tailwind) — filament thread vs. background sheet (§3). */
const LG_BREAKPOINT_PX = 1024;
/** GitHub contribution matrix shape (§3 #activity; POOL floor 53×7 = 371). */
const GRID_WEEKS = 53;
const GRID_DAYS = 7;
const GRID_CELLS = GRID_WEEKS * GRID_DAYS;
/** Fixed gyroscope-ring count (§2.5; mirrors measure.ts SKILL_CLUSTER_COUNT). */
const RING_COUNT = 4;
/**
 * Nominal world-space size of one active shard. The chamfered prism footprint
 * is ~1 world unit (`kern-geometry.ts` hex circumradius 0.5), so this is the
 * per-instance scale that packs ~384 shards legibly across a section-sized
 * formation. Per-formation floors + JSON slot scales multiply this.
 */
const SHARD_BASE_SCALE = 0.14;
/** §3 "scale-parked spare shards (scale → 0.05)" — near-invisible reserve. */
const PARKED_SCALE = 0.05;
/** Deep dust shell depth (world units behind z=0) for parked shards. */
const DUST_Z_NEAR = -18;
const DUST_Z_FAR = -26;

/**
 * Per-formation scale + colorMix FLOOR table (§2.1 "per-formation scale +
 * instanceColor mix floors", §6.3). `scale` multiplies SHARD_BASE_SCALE for
 * active shards; `colorMix` is the base theme blend (recede for reading
 * beats, brighten for signature beats). Mirrors the v1 FORMATION_TUNING
 * opacity floors so the field recedes/advances the same way it shipped.
 */
export const FORMATION_FLOOR: Record<FormationId, { scale: number; colorMix: number }> = {
  constellation: { scale: 1.0, colorMix: 0.85 },
  filament: { scale: 0.95, colorMix: 0.7 },
  lattice: { scale: 0.9, colorMix: 0.6 },
  orbits: { scale: 0.75, colorMix: 0.4 },
  frame: { scale: 0.7, colorMix: 0.3 },
  grid: { scale: 0.85, colorMix: 0.5 },
  glyph: { scale: 0.95, colorMix: 0.9 },
  halo: { scale: 0.75, colorMix: 0.5 },
  rest: { scale: 1.0, colorMix: 0.08 },
};

export { SHARD_BASE_SCALE };

// --- Quaternion helpers (no three import — kern-formations stays pure math) ---
type Quat = readonly [number, number, number, number];

/** Unit quaternion from a (normalized) axis + angle. */
function quatFromAxisAngle(x: number, y: number, z: number, angle: number): Quat {
  const half = angle / 2;
  const s = Math.sin(half);
  return [x * s, y * s, z * s, Math.cos(half)];
}

/** Hamilton product a·b (apply b, then a). */
function quatMul(a: Quat, b: Quat): Quat {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

/** Small seeded rotation about x, then y, then z — crystalline orientation variety. */
function seededTilt(seed: number, spread: number): Quat {
  const rx = quatFromAxisAngle(1, 0, 0, randomInRange(seed, -spread, spread));
  const ry = quatFromAxisAngle(0, 1, 0, randomInRange(seed + 1, -spread, spread));
  const rz = quatFromAxisAngle(0, 0, 1, randomInRange(seed + 2, -spread, spread));
  return quatMul(quatMul(rz, ry), rx);
}

// --- Coordinate + rect helpers (doc→world, matches v1 formations.ts) ----------
function docToWorldX(layout: MeasuredLayout, docX: number): number {
  return (docX - layout.viewport.w / 2) * layout.worldPerPixel;
}
function docToWorldY(layout: MeasuredLayout, docY: number): number {
  return (layout.viewport.h / 2 - docY) * layout.worldPerPixel;
}

/** Section rect with the §3 fallback: a viewport-sized rect at the doc top. */
function sectionRect(layout: MeasuredLayout, id: string): DocRect {
  return (
    layout.sections[id] ?? {
      left: 0,
      top: 0,
      width: layout.viewport.w,
      height: layout.viewport.h,
    }
  );
}

/** Deterministic gaussian-ish jitter in [-spread, spread], centered. */
function jitter(seed: number, spread: number): number {
  return (seededRandom(seed) + seededRandom(seed + 0.5) - 1) * spread;
}

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

// --- Shard writer + finalize --------------------------------------------------
function writeShard(
  data: Float32Array,
  i: number,
  x: number,
  y: number,
  z: number,
  q: Quat,
  scale: number,
  colorMix: number,
): void {
  const o = i * FLOATS_PER_SHARD;
  data[o] = x;
  data[o + 1] = y;
  data[o + 2] = z;
  data[o + 3] = q[0];
  data[o + 4] = q[1];
  data[o + 5] = q[2];
  data[o + 6] = q[3];
  data[o + 7] = scale;
  data[o + 8] = clamp01(colorMix);
}

/** Park shard `i` in the deep dust shell around world anchor (ax, ay). */
function placeParked(
  data: Float32Array,
  i: number,
  ax: number,
  ay: number,
  spreadX: number,
  spreadY: number,
  colorMix: number,
): void {
  const s = i * 31 + 7;
  writeShard(
    data,
    i,
    ax + jitter(s, spreadX),
    ay + jitter(s + 11, spreadY),
    randomInRange(s + 23, DUST_Z_FAR, DUST_Z_NEAR),
    seededTilt(s + 29, 0.6),
    PARKED_SCALE,
    colorMix,
  );
}

/**
 * Force every target quat to unit length (frozen contract: "Quaternions are
 * unit orientation", header §Target stride). `seededTilt` chains three float32
 * `quatMul`s and the monogram/glyph JSON quats are sampled, so raw target quats
 * drift to |q| ≈ 0.9999 — ~1e-4, three orders over float32 epsilon. That is
 * fatal to at-rest settling (R1): the engine measures rotation error as
 * `angleTo(unitState, target)`, whose floor is `2·acos(|q|)` ≈ 0.023 rad for a
 * 0.9999-length target — permanently above `ROT_SETTLE_EPS` (0.004), so the
 * demand loop never goes silent. Normalizing here (before hemisphere flipping,
 * which preserves length) collapses that floor to ~0.
 */
function normalizeQuats(data: Float32Array): void {
  for (let i = 0; i < POOL; i += 1) {
    const o = i * FLOATS_PER_SHARD + 3;
    const len = Math.hypot(data[o], data[o + 1], data[o + 2], data[o + 3]);
    if (len > 0) {
      const inv = 1 / len;
      data[o] *= inv;
      data[o + 1] *= inv;
      data[o + 2] *= inv;
      data[o + 3] *= inv;
    } else {
      data[o + 3] = 1; // degenerate → identity quaternion
    }
  }
}

/**
 * Hemisphere-normalize every target quat against `prev` (§2.4): if
 * dot(target_i, prev_i) < 0, negate target_i so slerp takes the short arc.
 * No-op on the very first build (`prev === null`).
 */
function hemisphereNormalize(data: Float32Array, prev: KernTargets | null): void {
  if (!prev) return;
  const p = prev.data;
  for (let i = 0; i < POOL; i += 1) {
    const o = i * FLOATS_PER_SHARD + 3;
    const dot =
      data[o] * p[o] +
      data[o + 1] * p[o + 1] +
      data[o + 2] * p[o + 2] +
      data[o + 3] * p[o + 3];
    if (dot < 0) {
      data[o] = -data[o];
      data[o + 1] = -data[o + 1];
      data[o + 2] = -data[o + 2];
      data[o + 3] = -data[o + 3];
    }
  }
}

/**
 * Wrap a raw per-shard fill into a `KernFormationBuilder`: allocate the target
 * array, fill it, hemisphere-normalize against `prev`, return.
 *
 * `version` is stamped 0 here — the builder is a pure function of the layout
 * and cannot see the caller's monotonic layout-version counter. WP-D re-stamps
 * `.version` with the live layout version when it caches the result (the field
 * is the cache key, owned by the caller; the builder only supplies `data`).
 */
function builder(
  fill: (layout: MeasuredLayout, data: Float32Array) => void,
): KernFormationBuilder {
  return (layout, prev) => {
    const data = new Float32Array(POOL * FLOATS_PER_SHARD);
    fill(layout, data);
    normalizeQuats(data);
    hemisphereNormalize(data, prev);
    return { version: 0, data };
  };
}

// --- Builders -----------------------------------------------------------------

/**
 * #hero `constellation` — the LS monogram (§3). All POOL shards take a
 * build-time slot from `monogram-shards.json` (y-up unit box), scaled +
 * translated into the hero rect. Slot carries position + orientation + a base
 * scale; colorMix is the signature-beat floor with slight per-shard variation.
 */
function fillConstellation(layout: MeasuredLayout, data: Float32Array): void {
  const floor = FORMATION_FLOOR.constellation;
  const hero = sectionRect(layout, "hero");
  const scalePx = Math.min(hero.width, hero.height) * 0.7;
  const cx = hero.left + hero.width / 2;
  const cy = hero.top + hero.height / 2;
  const wpp = layout.worldPerPixel;
  const slots = monogramShards.slots;
  for (let i = 0; i < POOL; i += 1) {
    const slot = slots[i % slots.length] as number[];
    const sx = slot[0] as number;
    const sy = slot[1] as number;
    const sz = slot[2] as number;
    const docX = cx + sx * scalePx;
    const docY = cy - sy * scalePx; // slot y-up → doc y-down
    writeShard(
      data,
      i,
      docToWorldX(layout, docX),
      docToWorldY(layout, docY),
      sz * scalePx * wpp,
      [slot[3] as number, slot[4] as number, slot[5] as number, slot[6] as number],
      (slot[7] as number) * floor.scale * SHARD_BASE_SCALE,
      floor.colorMix + jitter(i * 7 + 3, 0.1),
    );
  }
}

/**
 * #contact `glyph` — the solid @-outline (§3). Same slot pipeline as the
 * monogram, from `glyph-shards.json`, scaled to 62% of the contact rect's
 * shorter side; tangent-oriented shards, high colorMix.
 */
function fillGlyph(layout: MeasuredLayout, data: Float32Array): void {
  const floor = FORMATION_FLOOR.glyph;
  const rect = sectionRect(layout, "contact");
  const scalePx = Math.min(rect.width, rect.height) * 0.62;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const wpp = layout.worldPerPixel;
  const slots = glyphShards.slots;
  for (let i = 0; i < POOL; i += 1) {
    const slot = slots[i % slots.length] as number[];
    const sx = slot[0] as number;
    const sy = slot[1] as number;
    const sz = slot[2] as number;
    const docX = cx + sx * scalePx;
    const docY = cy - sy * scalePx;
    writeShard(
      data,
      i,
      docToWorldX(layout, docX),
      docToWorldY(layout, docY),
      sz * scalePx * wpp,
      [slot[3] as number, slot[4] as number, slot[5] as number, slot[6] as number],
      (slot[7] as number) * floor.scale * SHARD_BASE_SCALE,
      floor.colorMix + jitter(i * 11 + 5, 0.08),
    );
  }
}

/**
 * #career `filament` — 7 plinth-knots stacked at `spineX` with thin connector
 * shards between (§3). Below lg → a receded low-scale sheet over the section.
 * The knot 0 (ITSC) triple-weight and the sectionProgress pulse are ENGINE
 * concerns (WP-B/D reads `bridge.sectionProgress`); the builder places the
 * base filament only.
 */
function fillFilament(layout: MeasuredLayout, data: Float32Array): void {
  const floor = FORMATION_FLOOR.filament;
  const rect = sectionRect(layout, "career");
  const wpp = layout.worldPerPixel;

  if (layout.viewport.w < LG_BREAKPOINT_PX) {
    for (let i = 0; i < POOL; i += 1) {
      const s = i * 17 + 3;
      writeShard(
        data,
        i,
        docToWorldX(layout, rect.left + seededRandom(s) * rect.width),
        docToWorldY(layout, rect.top + seededRandom(s + 1) * rect.height),
        jitter(s + 2, 0.4),
        seededTilt(s + 4, 0.5),
        floor.scale * 0.7 * SHARD_BASE_SCALE,
        0.25 + jitter(s + 6, 0.06),
      );
    }
    return;
  }

  const knotCount = 7;
  const spineWorldX = docToWorldX(layout, layout.spineX);
  for (let i = 0; i < POOL; i += 1) {
    const s = i * 13 + 5;
    const onKnot = seededRandom(s) < 0.45;
    let docY: number;
    let bright: number;
    let scaleMul: number;
    if (onKnot) {
      // Weighted knot pick: knot 0 counts three times (ITSC triple-knot).
      const pick = Math.floor(seededRandom(s + 1) * (knotCount + 2));
      const knot = pick <= 2 ? 0 : pick - 2;
      const knotY = rect.top + ((knot + 0.5) / knotCount) * rect.height;
      docY = knotY + jitter(s + 2, 14);
      bright = floor.colorMix + 0.25;
      scaleMul = 1;
    } else {
      docY = rect.top + seededRandom(s + 3) * rect.height;
      bright = floor.colorMix - 0.2;
      scaleMul = 0.55; // thin connector shards
    }
    writeShard(
      data,
      i,
      spineWorldX + jitter(s + 4, 6) * wpp, // ~6px thread width
      docToWorldY(layout, docY),
      jitter(s + 5, 0.3),
      seededTilt(s + 7, 0.35),
      floor.scale * scaleMul * SHARD_BASE_SCALE,
      bright + jitter(s + 9, 0.05),
    );
  }
}

/**
 * #projects `lattice` — extruded picture-frame slabs on the perimeters of the
 * measured bento cells (§3), the two largest (featured ELIA/Vidama) at double
 * density, each frame given a slight per-cell z-tilt. No measured cells → a
 * synthesized 2×3 grid inside the projects rect.
 */
function fillLattice(layout: MeasuredLayout, data: Float32Array): void {
  const floor = FORMATION_FLOOR.lattice;
  const cells =
    layout.bentoCells.length > 0
      ? layout.bentoCells
      : synthesizeCells(sectionRect(layout, "projects"));

  const areas = cells.map((c) => c.width * c.height);
  const featured = [...areas.keys()]
    .sort((a, b) => (areas[b] ?? 0) - (areas[a] ?? 0))
    .slice(0, 2);
  const weights = cells.map(
    (c, index) => 2 * (c.width + c.height) * (featured.includes(index) ? 2 : 1),
  );
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  // Per-cell z-tilt: a stable seeded lean so each frame reads as a physical panel.
  const cellTilt = cells.map((_, index) => randomInRange(index * 53 + 7, -0.3, 0.3));
  const wpp = layout.worldPerPixel;

  for (let i = 0; i < POOL; i += 1) {
    const s = i * 19 + 9;
    let pick = seededRandom(s) * totalWeight;
    let cellIndex = 0;
    for (let c = 0; c < weights.length; c += 1) {
      pick -= weights[c] ?? 0;
      if (pick <= 0) {
        cellIndex = c;
        break;
      }
    }
    const cell = cells[cellIndex] as DocRect;
    const perimeter = 2 * (cell.width + cell.height);
    let along = seededRandom(s + 1) * perimeter;
    let docX = cell.left;
    let docY = cell.top;
    if (along < cell.width) {
      docX += along;
    } else if ((along -= cell.width) < cell.height) {
      docX += cell.width;
      docY += along;
    } else if ((along -= cell.height) < cell.width) {
      docX += cell.width - along;
      docY += cell.height;
    } else {
      docY += along - cell.width;
    }
    const tilt = cellTilt[cellIndex] ?? 0;
    writeShard(
      data,
      i,
      docToWorldX(layout, docX) + jitter(s + 2, 4) * wpp,
      docToWorldY(layout, docY) + jitter(s + 3, 4) * wpp,
      jitter(s + 4, 0.2),
      quatMul(quatFromAxisAngle(0, 1, 0, tilt), seededTilt(s + 6, 0.2)),
      floor.scale * SHARD_BASE_SCALE,
      floor.colorMix + jitter(s + 8, 0.08),
    );
  }
}

function synthesizeCells(rect: DocRect): DocRect[] {
  const cols = 2;
  const rows = 3;
  const gap = Math.min(rect.width, rect.height) * 0.04;
  const cellW = (rect.width - gap * (cols + 1)) / cols;
  const cellH = (rect.height - gap * (rows + 1)) / rows;
  const cells: DocRect[] = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      cells.push({
        left: rect.left + gap + c * (cellW + gap),
        top: rect.top + gap + r * (cellH + gap),
        width: cellW,
        height: cellH,
      });
    }
  }
  return cells;
}

/**
 * #skills `orbits` — 4 tilted gyroscope rings anchored to the measured
 * `skillClusterRects` (§3, §2.5). Shards distribute round-robin onto the rings,
 * each an ellipse y-squashed 0.7, tangent-oriented with a ring tilt; the field
 * recedes (low scale + colorMix floor) for reading. Empty `skillClusterRects`
 * (routes without #skills) → fall back to bands of the skills section rect, so
 * the formation still reads as an echo (§3 "degrades to calm").
 *
 * Ring ROTATION is NOT baked here — it is scroll-scrubbed by the engine (§3
 * CRITICAL: the #skills at-rest R1 park must be a static sculpture). The builder
 * only supplies the resting ring geometry.
 */
function fillOrbits(layout: MeasuredLayout, data: Float32Array): void {
  const floor = FORMATION_FLOOR.orbits;
  const rings =
    layout.skillClusterRects.length >= RING_COUNT
      ? layout.skillClusterRects.slice(0, RING_COUNT)
      : fallbackRingBands(sectionRect(layout, "skills"));

  for (let i = 0; i < POOL; i += 1) {
    const s = i * 23 + 11;
    const ring = i % RING_COUNT;
    const band = rings[ring] as DocRect;
    const centerX = band.left + band.width / 2;
    const centerY = band.top + band.height / 2;
    const rx = Math.min(band.width / 2, band.height * 1.6) * randomInRange(s, 0.55, 0.95);
    const ry = rx * 0.7; // y-squash (§3)
    const angle = seededRandom(s + 1) * Math.PI * 2;
    const docX = centerX + Math.cos(angle) * rx;
    const docY = centerY + Math.sin(angle) * ry;
    // Tangent orientation about the viewer axis + a per-ring lean.
    const tangent = quatFromAxisAngle(0, 0, 1, angle + Math.PI / 2);
    const ringTilt = quatFromAxisAngle(1, 0, 0, 0.4 + ring * 0.12);
    writeShard(
      data,
      i,
      docToWorldX(layout, docX),
      docToWorldY(layout, docY),
      jitter(s + 2, 0.5),
      quatMul(ringTilt, quatMul(tangent, seededTilt(s + 4, 0.15))),
      floor.scale * SHARD_BASE_SCALE,
      floor.colorMix + jitter(s + 6, 0.06),
    );
  }
}

/** Four evenly-spaced horizontal bands of a rect (measure.ts fallback shape). */
function fallbackRingBands(rect: DocRect): DocRect[] {
  const bandHeight = rect.height / RING_COUNT;
  const bands: DocRect[] = [];
  for (let i = 0; i < RING_COUNT; i += 1) {
    bands.push({
      left: rect.left,
      top: rect.top + i * bandHeight,
      width: rect.width,
      height: bandHeight,
    });
  }
  return bands;
}

/**
 * #about `frame` — ~40% of shards form four thin beveled corner-bracket Ls
 * (arm = 16% of the min rect dimension), the rest parked as deep low-scale dust
 * (§3). Near-monochrome — the restraint beat, low colorMix, no accent.
 */
function fillFrame(layout: MeasuredLayout, data: Float32Array): void {
  const floor = FORMATION_FLOOR.frame;
  const rect = sectionRect(layout, "about");
  const arm = Math.min(rect.width, rect.height) * 0.16;
  const wpp = layout.worldPerPixel;
  const cx = docToWorldX(layout, rect.left + rect.width / 2);
  const cy = docToWorldY(layout, rect.top + rect.height / 2);

  for (let i = 0; i < POOL; i += 1) {
    const s = i * 29 + 13;
    if (seededRandom(s) >= 0.4) {
      placeParked(
        data,
        i,
        cx,
        cy,
        (rect.width * wpp) / 2,
        (rect.height * wpp) / 2,
        0.05,
      );
      continue;
    }
    const corner = Math.floor(seededRandom(s + 1) * 4); // 0 TL, 1 TR, 2 BR, 3 BL
    const horizontal = seededRandom(s + 2) < 0.5;
    const along = seededRandom(s + 3) * arm;
    const cornerX = corner === 0 || corner === 3 ? rect.left : rect.left + rect.width;
    const cornerY = corner <= 1 ? rect.top : rect.top + rect.height;
    const dirX = corner === 0 || corner === 3 ? 1 : -1;
    const dirY = corner <= 1 ? 1 : -1;
    const docX = cornerX + (horizontal ? along * dirX : 0) + jitter(s + 4, 3);
    const docY = cornerY + (horizontal ? 0 : along * dirY) + jitter(s + 5, 3);
    // Bracket shards lie along their arm: horizontal arms flat, vertical spun 90°.
    const armSpin = quatFromAxisAngle(0, 0, 1, horizontal ? 0 : Math.PI / 2);
    writeShard(
      data,
      i,
      docToWorldX(layout, docX),
      docToWorldY(layout, docY),
      jitter(s + 6, 0.15),
      quatMul(armSpin, seededTilt(s + 7, 0.12)),
      floor.scale * SHARD_BASE_SCALE,
      floor.colorMix + jitter(s + 9, 0.05),
    );
  }
}

/**
 * #activity `grid` — the contribution voxel terrain (§2.1, §3): the pool's
 * raison d'être for POOL floor 371. Shards 0..370 map 1:1 to the 53×7 matrix
 * cells (GitHub week-column order, index = week*7 + day); the 13 spares park.
 * Each bar's SCALE and colorMix rise with the cell's level from
 * `layout.heatmap`; null/short levels → a flat neutral terrain fallback
 * (matches measure.ts's last-known-good/malformed → null contract).
 *
 * Uniform-scale note: KernTargets carries a single scalar `scale`, so voxel
 * "height" is expressed as a larger uniform shard (bigger cube reads as a
 * taller bar) plus a small z lift — per-axis stretch is not in the frozen
 * stride.
 */
function fillGrid(layout: MeasuredLayout, data: Float32Array): void {
  const floor = FORMATION_FLOOR.grid;
  const rect = sectionRect(layout, "activity");
  const levels =
    layout.heatmap && layout.heatmap.length >= GRID_CELLS - GRID_DAYS
      ? layout.heatmap
      : null;

  const gridW = rect.width * 0.92;
  const cell = Math.min(gridW / GRID_WEEKS, (rect.height * 0.8) / GRID_DAYS);
  const originX = rect.left + rect.width / 2 - (cell * GRID_WEEKS) / 2;
  const originY = rect.top + rect.height / 2 - (cell * GRID_DAYS) / 2;
  const parkX = docToWorldX(layout, rect.left + rect.width / 2);
  const parkY = docToWorldY(layout, rect.top + rect.height / 2);

  for (let i = 0; i < POOL; i += 1) {
    if (i >= GRID_CELLS) {
      placeParked(data, i, parkX, parkY, 1.5, 1.5, 0.05);
      continue;
    }
    const week = Math.floor(i / GRID_DAYS);
    const day = i % GRID_DAYS;
    const level = levels ? Number(levels[i] ?? 0) : 0;
    const norm = level / 4;
    const s = i * 37 + 17;
    const docX = originX + (week + 0.5) * cell;
    const docY = originY + (day + 0.5) * cell;
    // Bar height via uniform scale (0.5→1.35 of the floor) + a small z lift.
    const scaleMul = levels ? 0.5 + norm * 0.85 : 0.7;
    writeShard(
      data,
      i,
      docToWorldX(layout, docX),
      docToWorldY(layout, docY),
      levels ? norm * 0.6 : Math.sin(docX * 0.02 + docY * 0.035) * 0.3,
      seededTilt(s, 0.1),
      floor.scale * scaleMul * SHARD_BASE_SCALE,
      levels ? 0.2 + norm * 0.8 : floor.colorMix,
    );
  }
}

/**
 * Case studies `halo` — 25% of shards as an elliptical ring of tilted slabs at
 * the viewport upper third (rx 34% vw, ry 0.35·rx), rest parked deep (§3).
 * Restrained `--muted` (colorMix floor). Case-study routes have no measured
 * home sections, so the ring anchors to the viewport; scroll carries it past
 * the fold via the group transform.
 */
function fillHalo(layout: MeasuredLayout, data: Float32Array): void {
  const floor = FORMATION_FLOOR.halo;
  const cxDoc = layout.viewport.w / 2;
  const cyDoc = layout.viewport.h * 0.35;
  const rx = layout.viewport.w * 0.34;
  const ry = rx * 0.35;
  const cx = docToWorldX(layout, cxDoc);
  const cy = docToWorldY(layout, cyDoc);
  const wpp = layout.worldPerPixel;

  for (let i = 0; i < POOL; i += 1) {
    const s = i * 43 + 21;
    if (seededRandom(s) >= 0.25) {
      placeParked(
        data,
        i,
        cx,
        cy,
        (layout.viewport.w * wpp) / 2 + 3,
        (layout.viewport.h * wpp) / 2 + 3,
        0.06,
      );
      continue;
    }
    const angle = seededRandom(s + 1) * Math.PI * 2;
    const docX = cxDoc + Math.cos(angle) * rx + jitter(s + 2, 5);
    const docY = cyDoc + Math.sin(angle) * ry + jitter(s + 3, 5);
    const tangent = quatFromAxisAngle(0, 0, 1, angle + Math.PI / 2);
    writeShard(
      data,
      i,
      docToWorldX(layout, docX),
      docToWorldY(layout, docY),
      jitter(s + 4, 0.5),
      quatMul(tangent, seededTilt(s + 6, 0.2)),
      floor.scale * SHARD_BASE_SCALE,
      floor.colorMix + jitter(s + 8, 0.06),
    );
  }
}

/**
 * Prose/legal `rest` — a wide sparse deep scatter at the scale floor 0.05,
 * colorMix pinned near-invisible (§3 "legal pages must not perform"). Near-
 * identity seeded orientation; nothing performs, the loop settles silent.
 */
function fillRest(layout: MeasuredLayout, data: Float32Array): void {
  const floor = FORMATION_FLOOR.rest;
  const spreadX = layout.viewport.w * 0.7;
  const spreadY = layout.viewport.h * 0.7;
  for (let i = 0; i < POOL; i += 1) {
    const s = i * 47 + 23;
    writeShard(
      data,
      i,
      docToWorldX(layout, layout.viewport.w / 2 + jitter(s, spreadX)),
      docToWorldY(layout, layout.viewport.h / 2 + jitter(s + 1, spreadY)),
      jitter(s + 2, 1.5),
      seededTilt(s + 4, 0.5),
      PARKED_SCALE,
      floor.colorMix + jitter(s + 6, 0.02),
    );
  }
}

/**
 * The nine builders keyed by the frozen `FormationId` vocab. WP-D looks up a
 * builder here, calls it with the current layout + previous targets, and caches
 * the result per layout version.
 */
export const KERN_BUILDERS: Record<FormationId, KernFormationBuilder> = {
  constellation: builder(fillConstellation),
  filament: builder(fillFilament),
  lattice: builder(fillLattice),
  orbits: builder(fillOrbits),
  frame: builder(fillFrame),
  grid: builder(fillGrid),
  glyph: builder(fillGlyph),
  halo: builder(fillHalo),
  rest: builder(fillRest),
};

/**
 * Convenience wrapper (mirrors v1 `buildFormation`): build the target array for
 * `id`, hemisphere-normalized against `prev`. WP-D re-stamps `.version`.
 */
export function buildKernTargets(
  id: FormationId,
  layout: MeasuredLayout,
  prev: KernTargets | null,
): KernTargets {
  return KERN_BUILDERS[id](layout, prev);
}
