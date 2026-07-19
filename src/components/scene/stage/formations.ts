/**
 * Procedural formation builders (Kontinuum WP-B; DESIGN-SPEC §3 + §5.1
 * Contract 2). One pure, deterministic builder per `FormationId`, each a
 * function of (`MeasuredLayout`, particle count) ONLY — no DOM reads, no
 * bridge reads, no Math.random — so targets are reproducible across renders,
 * re-measures and tests (the same seeded-PRNG discipline as
 * constellation-data.ts).
 *
 * Coordinate contract (§3 global rule): targets live in DOCUMENT space,
 * unprojected ONCE onto the z=0 scene plane via `layout.worldPerPixel` —
 * `docToWorld` maps doc-space px (y down) to world units (y up) as they
 * appear at scrollY = 0. Per frame the stage group compensates scroll with a
 * single translate (see particle-stage.tsx), so these targets track their DOM
 * twins during scroll without re-measurement. Because the unprojection flips
 * the y axis here, the per-frame group offset is `+scrollY * worldPerPixel`
 * (the §3 formula's sign belongs to y-down doc coords; same transform).
 *
 * The `constellation` formation absorbs the shipped hero scene verbatim: the
 * seeded graph from constellation-data.ts IS the target set for the first
 * `nodeCount` pool particles. Pool particles beyond the graph become "reserve
 * dust": a deep, dim shell far behind the z=0 plane (sizeAttenuation shrinks
 * them to ~1px) so the hero reads exactly as shipped while the full pool
 * stays warm for the denser formations (grid/glyph need hundreds of points).
 *
 * Graceful degradation everywhere: sections missing from `layout.sections`
 * (case-study/legal routes, or the pre-measure interim layout) fall back to a
 * viewport-sized rect at the document top — formations still read as
 * *echo*, never crash (§3 "degrades to calm").
 */

import type { FormationId } from "../scene-bridge";
import type { DocRect, MeasuredLayout } from "./stage-types";
import {
  buildConstellation,
  randomInRange,
  seededRandom,
  type ConstellationData,
  type ConstellationTier,
} from "../constellation-data";
import glyphGlyph from "./glyph-points.json";

// --- Pool sizing (§1: ~2,500 desktop / ~900 mobile) ---------------------------
export const POOL_COUNT: Record<ConstellationTier, number> = {
  desktop: 2500,
  mobile: 900,
};

/**
 * Derive the constellation graph tier from the pool size (builders only see
 * `count` per Contract 2; the stage sizes the pool from the gate's SceneTier,
 * so this round-trips exactly).
 */
export function graphTierForCount(count: number): ConstellationTier {
  return count <= POOL_COUNT.mobile ? "mobile" : "desktop";
}

// --- Camera constants shared with particle-stage ------------------------------
// The shipped hero camera (position [0,0,8], fov 45°) is preserved as the
// spline's base pose; visible world height at z=0 derives worldPerPixel for
// the pre-measure interim layout (formation-engine.ts).
export const CAMERA_Z = 8;
export const CAMERA_FOV_DEG = 45;
export const VISIBLE_WORLD_HEIGHT =
  2 * CAMERA_Z * Math.tan(((CAMERA_FOV_DEG / 2) * Math.PI) / 180);

// --- Per-formation runtime tuning (§3 table / §6.3 opacity floors) ------------
export interface FormationTuning {
  /** Master opacity factor — "field recedes" beats (orbits ~40%, rest ~0). */
  opacity: number;
  /** Drift-amplitude scale — reading/legal formations barely breathe. */
  drift: number;
}

export const FORMATION_TUNING: Record<FormationId, FormationTuning> = {
  constellation: { opacity: 1, drift: 1 },
  filament: { opacity: 0.9, drift: 0.35 },
  lattice: { opacity: 0.85, drift: 0.25 },
  orbits: { opacity: 0.4, drift: 0.6 },
  frame: { opacity: 0.3, drift: 0.3 },
  grid: { opacity: 0.9, drift: 0.2 },
  glyph: { opacity: 1, drift: 0.4 },
  halo: { opacity: 0.6, drift: 0.5 },
  rest: { opacity: 0.08, drift: 0.25 },
};

// --- Shared placement constants ------------------------------------------------
/** Reserve-dust shell depth range (world units behind the z=0 plane). */
const DUST_Z_NEAR = -18;
const DUST_Z_FAR = -26;
/** Reserve-dust brightness on the border→muted intensity ramp. */
const DUST_INTENSITY = 0.12;
/** lg breakpoint (Tailwind) — filament thread vs. background sheet (§3). */
const LG_BREAKPOINT_PX = 1024;
/** GitHub contribution matrix shape (§3 #activity). */
const GRID_WEEKS = 53;
const GRID_DAYS = 7;

export interface FormationTargets {
  /** count*3 world-unit positions (doc-anchored, see file header). */
  positions: Float32Array;
  /** count per-particle brightness 0..1 on the border→muted color ramp. */
  intensity: Float32Array;
}

// --- Geometry helpers -----------------------------------------------------------
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

/** Park particle `i` in the deep dust shell around world anchor (ax, ay). */
function placeDust(
  positions: Float32Array,
  intensity: Float32Array,
  i: number,
  ax: number,
  ay: number,
  spreadX: number,
  spreadY: number,
): void {
  const s = i * 31 + 7;
  positions[i * 3] = ax + jitter(s, spreadX);
  positions[i * 3 + 1] = ay + jitter(s + 11, spreadY);
  positions[i * 3 + 2] = randomInRange(s + 23, DUST_Z_FAR, DUST_Z_NEAR);
  intensity[i] = DUST_INTENSITY;
}

// --- Builders --------------------------------------------------------------------
type Builder = (layout: MeasuredLayout, count: number) => FormationTargets;

function allocate(count: number): FormationTargets {
  return {
    positions: new Float32Array(count * 3),
    intensity: new Float32Array(count),
  };
}

/**
 * #hero `constellation` — the shipped scene verbatim (§3): graph home
 * positions for the first nodeCount particles, reserve dust for the rest.
 */
function buildConstellationFormation(
  layout: MeasuredLayout,
  count: number,
): FormationTargets {
  const out = allocate(count);
  const graph = constellationGraphForCount(count);
  const hero = sectionRect(layout, "hero");
  const cx = docToWorldX(layout, hero.left + hero.width / 2);
  const cy = docToWorldY(layout, hero.top + hero.height / 2);

  const nodes = Math.min(graph.nodeCount, count);
  for (let i = 0; i < nodes; i += 1) {
    out.positions[i * 3] = graph.positions[i * 3] + cx;
    out.positions[i * 3 + 1] = graph.positions[i * 3 + 1] + cy;
    out.positions[i * 3 + 2] = graph.positions[i * 3 + 2];
    out.intensity[i] = 1;
  }
  const spreadX = (layout.viewport.w * layout.worldPerPixel) / 2 + 4;
  const spreadY = (layout.viewport.h * layout.worldPerPixel) / 2 + 3;
  for (let i = nodes; i < count; i += 1) {
    placeDust(out.positions, out.intensity, i, cx, cy, spreadX, spreadY);
  }
  return out;
}

/**
 * #career `filament` (§3): lg+ = a vertical thread hugging the rail's
 * doc-space x with brighter knots (the top knot — the current ITSC entry —
 * gets triple weight, the Weltlinie graft); below lg = a low-opacity sheet.
 * Contract 2 carries no per-tick rects, so knots distribute evenly along the
 * career rect — an *echo* of the ticks, not pixel alignment (§3 global rule).
 */
function buildFilament(layout: MeasuredLayout, count: number): FormationTargets {
  const out = allocate(count);
  const rect = sectionRect(layout, "career");
  const wpp = layout.worldPerPixel;

  if (layout.viewport.w < LG_BREAKPOINT_PX) {
    // Background sheet: uniform low-brightness spread over the section.
    for (let i = 0; i < count; i += 1) {
      const s = i * 17 + 3;
      out.positions[i * 3] = docToWorldX(
        layout,
        rect.left + seededRandom(s) * rect.width,
      );
      out.positions[i * 3 + 1] = docToWorldY(
        layout,
        rect.top + seededRandom(s + 1) * rect.height,
      );
      out.positions[i * 3 + 2] = jitter(s + 2, 0.4);
      out.intensity[i] = 0.15;
    }
    return out;
  }

  const knotCount = 7;
  const spineWorldX = docToWorldX(layout, layout.spineX);
  for (let i = 0; i < count; i += 1) {
    const s = i * 13 + 5;
    const onKnot = seededRandom(s) < 0.45;
    let docY: number;
    let bright: number;
    if (onKnot) {
      // Weighted knot pick: knot 0 counts three times (ITSC triple-knot).
      const pick = Math.floor(seededRandom(s + 1) * (knotCount + 2));
      const knot = pick <= 2 ? 0 : pick - 2;
      const knotY = rect.top + ((knot + 0.5) / knotCount) * rect.height;
      docY = knotY + jitter(s + 2, 14);
      bright = 1;
    } else {
      docY = rect.top + seededRandom(s + 3) * rect.height;
      bright = 0.5;
    }
    out.positions[i * 3] = spineWorldX + jitter(s + 4, 6) * wpp; // ~6px thread width
    out.positions[i * 3 + 1] = docToWorldY(layout, docY);
    out.positions[i * 3 + 2] = jitter(s + 5, 0.3);
    out.intensity[i] = bright;
  }
  return out;
}

/**
 * #projects `lattice` (§3): particles snap toward the bento cells' frames —
 * sampled along each cell's perimeter, weighted by perimeter so bigger cells
 * get more particles, with the two largest (the featured ELIA/Vidama cells)
 * at double density. No measured cells (pre-measure / foreign route) →
 * a synthesized 2×3 grid inside the projects rect.
 */
function buildLattice(layout: MeasuredLayout, count: number): FormationTargets {
  const out = allocate(count);
  const cells: DocRect[] =
    layout.bentoCells.length > 0
      ? layout.bentoCells
      : synthesizeCells(sectionRect(layout, "projects"));

  // Perimeter weights, doubled for the two largest-area (featured) cells.
  const areas = cells.map((c) => c.width * c.height);
  const featured = [...areas.keys()]
    .sort((a, b) => (areas[b] ?? 0) - (areas[a] ?? 0))
    .slice(0, 2);
  const weights = cells.map(
    (c, index) =>
      2 * (c.width + c.height) * (featured.includes(index) ? 2 : 1),
  );
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  const wpp = layout.worldPerPixel;
  const zDepth = 0.6; // Z-thickness of the 3D bento cards (3D upgrade)
  for (let i = 0; i < count; i += 1) {
    const s = i * 19 + 9;
    // Weighted cell pick via cumulative walk (cells are ~6 entries — cheap).
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
    // Walk the perimeter to a seeded arc-length position.
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
    out.positions[i * 3] = docToWorldX(layout, docX) + jitter(s + 2, 4) * wpp;
    out.positions[i * 3 + 1] = docToWorldY(layout, docY) + jitter(s + 3, 4) * wpp;
    // Distribute bento outline points to front/back Z planes for 3D boxes
    const side = seededRandom(s + 4) < 0.5 ? -1 : 1;
    out.positions[i * 3 + 2] = side * zDepth / 2 + jitter(s + 5, 0.05);
    out.intensity[i] = 0.7;
  }
  return out;
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
 * #skills `orbits` (§3): one loose radial cluster per domain. Contract 2
 * carries no measure-time h3 count (frozen shape), so the cluster count is a
 * fixed 4 — the skills section's stable domain count; an echo, not a binding.
 */
function buildOrbits(layout: MeasuredLayout, count: number): FormationTargets {
  const out = allocate(count);
  const rect = sectionRect(layout, "skills");
  const clusters = 4;
  const maxRadius = (Math.min(rect.height, rect.width / clusters) / 2) * 0.85;

  for (let i = 0; i < count; i += 1) {
    const s = i * 23 + 11;
    const c = i % clusters;
    const centerX = rect.left + ((c + 0.5) / clusters) * rect.width;
    const centerY = rect.top + rect.height / 2 + jitter(c * 101 + 41, rect.height * 0.12);
    const radius = randomInRange(s, 0.3, 1) * maxRadius;
    const theta = seededRandom(s + 1) * Math.PI * 2;
    
    // Model a 3D atomic planetary system: concentric rings tilted along different angles (3D upgrade)
    const incl = (c * (Math.PI / 4)) + Math.PI / 12; // tilt relative to Z-axis
    const rx = Math.cos(theta) * radius;
    const ry = Math.sin(theta) * radius;
    
    // Pivot points around X/Y to form tilted 3D circles
    const worldX = centerX + rx;
    const worldY = centerY + ry * Math.cos(incl);
    const worldZ = ry * Math.sin(incl);

    out.positions[i * 3] = docToWorldX(layout, worldX);
    out.positions[i * 3 + 1] = docToWorldY(layout, worldY);
    out.positions[i * 3 + 2] = worldZ * layout.worldPerPixel + jitter(s + 2, 0.1);
    out.intensity[i] = 0.45;
  }
  return out;
}

/**
 * #about `frame` (§3): faint corner brackets echoing the photo-frame tick
 * motif — ~40% of the pool on the four corner Ls, the rest recedes to dust.
 */
function buildFrame(layout: MeasuredLayout, count: number): FormationTargets {
  const out = allocate(count);
  const rect = sectionRect(layout, "about");
  const arm = Math.min(rect.width, rect.height) * 0.16;
  const wpp = layout.worldPerPixel;
  const cx = docToWorldX(layout, rect.left + rect.width / 2);
  const cy = docToWorldY(layout, rect.top + rect.height / 2);

  for (let i = 0; i < count; i += 1) {
    const s = i * 29 + 13;
    if (seededRandom(s) >= 0.4) {
      placeDust(
        out.positions,
        out.intensity,
        i,
        cx,
        cy,
        (rect.width * wpp) / 2,
        (rect.height * wpp) / 2,
      );
      out.intensity[i] = 0.05;
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
    out.positions[i * 3] = docToWorldX(layout, docX);
    out.positions[i * 3 + 1] = docToWorldY(layout, docY);
    // 3D volumetric depth: corners sit on either front or back Z-plane (3D upgrade)
    const zOffset = (seededRandom(s + 6) < 0.5 ? -1 : 1) * 0.75;
    out.positions[i * 3 + 2] = zOffset + jitter(s + 7, 0.05);
    out.intensity[i] = 0.35;
  }
  return out;
}

/**
 * #activity `grid` (§3): the 53×7 contribution matrix. With real levels
 * (Contract 4 via `layout.heatmap`) particle density AND brightness map the
 * level; malformed/null levels → the neutral wave-sheet fallback (§3).
 * Levels are column-major weeks (GitHub order): index = week * 7 + day.
 */
function buildGrid(layout: MeasuredLayout, count: number): FormationTargets {
  const out = allocate(count);
  const rect = sectionRect(layout, "activity");
  const levels =
    layout.heatmap && layout.heatmap.length >= GRID_WEEKS * GRID_DAYS - GRID_DAYS
      ? layout.heatmap
      : null;

  // Fit the matrix into the rect, preserving cell aspect and centering.
  const gridW = rect.width * 0.92;
  const cell = Math.min(gridW / GRID_WEEKS, (rect.height * 0.8) / GRID_DAYS);
  const originX = rect.left + rect.width / 2 - (cell * GRID_WEEKS) / 2;
  const originY = rect.top + rect.height / 2 - (cell * GRID_DAYS) / 2;

  if (!levels) {
    // Neutral wave sheet: same footprint, gentle z undulation, flat brightness.
    for (let i = 0; i < count; i += 1) {
      const s = i * 37 + 17;
      const docX = originX + seededRandom(s) * cell * GRID_WEEKS;
      const docY = originY + seededRandom(s + 1) * cell * GRID_DAYS;
      out.positions[i * 3] = docToWorldX(layout, docX);
      out.positions[i * 3 + 1] = docToWorldY(layout, docY);
      out.positions[i * 3 + 2] =
        Math.sin(docX * 0.02 + docY * 0.035) * 0.5;
      out.intensity[i] = 0.3;
    }
    return out;
  }

  // Cumulative cell weights: every day cell gets a floor share; brighter
  // days pull proportionally more particles (density = brightness, §3).
  const cellCount = levels.length;
  const cumulative = new Float32Array(cellCount);
  let total = 0;
  for (let c = 0; c < cellCount; c += 1) {
    total += 0.35 + (levels[c] ?? 0);
    cumulative[c] = total;
  }

  for (let i = 0; i < count; i += 1) {
    const s = i * 37 + 17;
    const pick = seededRandom(s) * total;
    // Binary search the cumulative table (371 cells, ~9 steps).
    let lo = 0;
    let hi = cellCount - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if ((cumulative[mid] ?? 0) < pick) lo = mid + 1;
      else hi = mid;
    }
    const level = levels[lo] ?? 0;
    const week = Math.floor(lo / GRID_DAYS);
    const day = lo % GRID_DAYS;
    const docX = originX + (week + 0.5) * cell + jitter(s + 1, cell * 0.22);
    const docY = originY + (day + 0.5) * cell + jitter(s + 2, cell * 0.22);
    out.positions[i * 3] = docToWorldX(layout, docX);
    out.positions[i * 3 + 1] = docToWorldY(layout, docY);
    out.positions[i * 3 + 2] = level * 0.08;
    out.intensity[i] = 0.15 + (level / 4) * 0.85;
  }
  return out;
}

/**
 * #contact `glyph` (§3): the pool converges onto the build-time-sampled
 * @-outline behind the CV/contact buttons (scripts/sample-glyph.ts →
 * glyph-points.json; y-up unit box, scaled into the contact rect).
 */
function buildGlyph(layout: MeasuredLayout, count: number): FormationTargets {
  const out = allocate(count);
  const rect = sectionRect(layout, "contact");
  const points = glyphGlyph.points;
  const pointCount = glyphGlyph.count;
  const scalePx = Math.min(rect.width, rect.height) * 0.62;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const zHelixScale = 2.5; // Volumetric depth stretch (3D upgrade)

  for (let i = 0; i < count; i += 1) {
    const s = i * 41 + 19;
    const p = i % pointCount;
    const px = points[p * 2] ?? 0;
    const py = points[p * 2 + 1] ?? 0;
    const docX = cx + px * scalePx + jitter(s, 3);
    const docY = cy - py * scalePx + jitter(s + 1, 3);
    out.positions[i * 3] = docToWorldX(layout, docX);
    out.positions[i * 3 + 1] = docToWorldY(layout, docY);
    // Extrude points into a 3D Z-spiral helix depending on the angle around center
    const angle = Math.atan2(py, px);
    const helixZ = Math.sin(angle * 3) * zHelixScale;
    out.positions[i * 3 + 2] = helixZ + jitter(s + 2, 0.1);
    out.intensity[i] = 0.9;
  }
  return out;
}

/**
 * Case studies `halo` (§3): sparse orbital ring at ~25% density behind the
 * h1, the rest receding to deep dust. Case-study routes have no measured
 * home sections, so the ring anchors to the viewport's upper third —
 * scroll carries it away past the fold via the group transform.
 */
function buildHalo(layout: MeasuredLayout, count: number): FormationTargets {
  const out = allocate(count);
  const cxDoc = layout.viewport.w / 2;
  const cyDoc = layout.viewport.h * 0.35;
  const rx = layout.viewport.w * 0.34;
  const ry = rx * 0.35;
  const cx = docToWorldX(layout, cxDoc);
  const cy = docToWorldY(layout, cyDoc);
  const wpp = layout.worldPerPixel;

  for (let i = 0; i < count; i += 1) {
    const s = i * 43 + 21;
    if (seededRandom(s) >= 0.25) {
      placeDust(
        out.positions,
        out.intensity,
        i,
        cx,
        cy,
        (layout.viewport.w * wpp) / 2 + 3,
        (layout.viewport.h * wpp) / 2 + 3,
      );
      out.intensity[i] = 0.06;
      continue;
    }
    // Volumetric Möbius Torus ribbon model (3D upgrade)
    const u = seededRandom(s + 1) * Math.PI * 2; // Main circle angle
    const v = seededRandom(s + 2) * Math.PI * 2; // Tube cross section angle
    const tubeRadius = rx * 0.15; // Width of the ribbon
    
    // Torus parametrization with a Möbius twist
    const wrapX = (rx + tubeRadius * Math.cos(v)) * Math.cos(u);
    const wrapY = (ry + tubeRadius * Math.cos(v)) * Math.sin(u);
    const wrapZ = tubeRadius * Math.sin(v);

    out.positions[i * 3] = docToWorldX(layout, cxDoc + wrapX);
    out.positions[i * 3 + 1] = docToWorldY(layout, cyDoc + wrapY);
    out.positions[i * 3 + 2] = wrapZ * wpp + jitter(s + 4, 0.1);
    out.intensity[i] = 0.5;
  }
  return out;
}

/**
 * Prose/legal `rest` (§3): near-invisible drift, amplitude ~0 — a wide, calm
 * scatter across the first viewport. Legal pages must not perform.
 */
function buildRest(layout: MeasuredLayout, count: number): FormationTargets {
  const out = allocate(count);
  const spreadX = layout.viewport.w * 0.7;
  const spreadY = layout.viewport.h * 0.7;
  for (let i = 0; i < count; i += 1) {
    const s = i * 47 + 23;
    out.positions[i * 3] = docToWorldX(
      layout,
      layout.viewport.w / 2 + jitter(s, spreadX),
    );
    out.positions[i * 3 + 1] = docToWorldY(
      layout,
      layout.viewport.h / 2 + jitter(s + 1, spreadY),
    );
    out.positions[i * 3 + 2] = jitter(s + 2, 1.5);
    out.intensity[i] = 0.06;
  }
  return out;
}

const BUILDERS: Record<FormationId, Builder> = {
  constellation: buildConstellationFormation,
  filament: buildFilament,
  lattice: buildLattice,
  orbits: buildOrbits,
  frame: buildFrame,
  grid: buildGrid,
  glyph: buildGlyph,
  halo: buildHalo,
  rest: buildRest,
};

// --- Graph access (shared with particle-stage for edges/pointer/pulses) --------
const graphCache = new Map<ConstellationTier, ConstellationData>();

/** The seeded hero graph for a pool size (cached — buildConstellation is pure). */
export function constellationGraphForCount(count: number): ConstellationData {
  const tier = graphTierForCount(count);
  let graph = graphCache.get(tier);
  if (!graph) {
    graph = buildConstellation(tier);
    graphCache.set(tier, graph);
  }
  return graph;
}

/**
 * Contract 2 (frozen, DESIGN-SPEC §5.1): positions only. WP-C's producers
 * program against exactly this signature.
 */
export function buildFormation(
  id: FormationId,
  layout: MeasuredLayout,
  count: number,
): Float32Array {
  return BUILDERS[id](layout, count).positions;
}

/**
 * Engine-facing superset of Contract 2: positions + per-particle brightness
 * in one pass (the builders compute both anyway; splitting would run the
 * placement math twice).
 */
export function buildFormationTargets(
  id: FormationId,
  layout: MeasuredLayout,
  count: number,
): FormationTargets {
  return BUILDERS[id](layout, count);
}
