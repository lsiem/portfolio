/**
 * D-02 hidden-structure graph + D-08 density mask (04-04 Task 1).
 *
 * TOPOLOGY (D-02 — no labels, no legend, no i18n surface anywhere here): a
 * small "orchestrator hub" cluster sits in the hero's CENTRAL reading column
 * (where the H1/value-prop text lives) while larger "satellite agent"
 * clusters occupy the outer thirds. This directly mirrors ELIA's real
 * multi-agent shape — one orchestrator process coordinating several
 * specialist agents — and simultaneously implements the D-08 density mask,
 * because the hub cluster is deliberately the SMALLEST cluster. Insiders
 * might notice the orchestrator/satellite shape; everyone else sees a living
 * system. No node/edge ever carries a label or identifier string.
 *
 * DENSITY MASK (D-08, UI-SPEC "Composition"): the hero width is split into
 * three equal-width zones (left outer / center reading column / right
 * outer). Node-count weights are center=0.3, each outer=1.0 (sum 2.3), so the
 * center zone's per-unit-width density is EXACTLY 30% of an outer zone's —
 * enforced here at placement time, never filtered post-hoc.
 *
 * GEOMETRY (UI-SPEC table, ±20% discretion): desktop 72 nodes / ~110 edges
 * (avg degree ~3.06), mobile 36 nodes / ~54 edges (avg degree ~3.0). The
 * graph is deliberately sparse and never fully connected.
 *
 * DETERMINISM (React-Compiler purity — mirrors the 04-03 stub's technique):
 * `buildConstellation()` runs inside a `useMemo` during render, so it must be
 * a pure function of `tier`. A seeded sin-hash PRNG (NOT `Math.random()`)
 * keeps every call deterministic and reproducible across renders and tests.
 */

export type ConstellationTier = "mobile" | "desktop";

export interface ClusterMeta {
  /** index into the node arrays where this cluster's nodes start */
  start: number;
  /** number of nodes in this cluster */
  count: number;
  /** the small, central "orchestrator" cluster vs. an outer "satellite" cluster */
  isHub: boolean;
  /** horizontal zone this cluster was placed in (drives the density mask) */
  zone: "left" | "center" | "right";
}

export interface ConstellationData {
  /** node count */
  nodeCount: number;
  /** edge count (pairs), i.e. `edges.length / 2` */
  edgeCount: number;
  /** Float32Array, length nodeCount*3 — x,y,z HOME position per node */
  positions: Float32Array;
  /** Uint16Array, length edgeCount*2 — index pairs into `positions` */
  edges: Uint16Array;
  /** owning cluster index per edge (bridge edges are tagged with the satellite side) */
  edgeClusters: Uint8Array;
  /** per-cluster metadata (contiguous node ranges, by construction) */
  clusters: ClusterMeta[];
  /** index of the hub cluster inside `clusters` */
  hubClusterIndex: number;
}

// --- Deterministic seeded PRNG (sin-hash, NOT Math.random) -------------------
// Mirrors constellation-canvas.tsx's 04-03 stub technique: a pure function of
// its seed, so repeated calls (across renders/tests) are reproducible.
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x); // fractional part in [0, 1)
}

/** Deterministic value in [min, max) from a seed (see `seededRandom`). */
export function randomInRange(seed: number, min: number, max: number): number {
  return min + seededRandom(seed) * (max - min);
}

// --- Per-tier geometry table (UI-SPEC, ±20% discretion band) -----------------
interface TierGeometry {
  nodeCount: number;
  edgeCount: number;
  /** hub + satellite node counts; must sum to nodeCount */
  clusterSizes: number[];
  /** how many of clusterSizes (after the hub) go on the LEFT outer zone */
  leftSatellites: number;
  /** half-width of the hero's horizontal placement extent, world units */
  extentX: number;
  /** half-height of the vertical placement extent, world units */
  extentY: number;
  /** half-depth (z) of the shallow slab nodes live in */
  extentZ: number;
}

const GEOMETRY: Record<ConstellationTier, TierGeometry> = {
  // 8 (hub) + 16*4 (satellites) = 72 nodes; 4 satellite clusters, 2 per side.
  desktop: {
    nodeCount: 72,
    edgeCount: 110,
    clusterSizes: [8, 16, 16, 16, 16],
    leftSatellites: 2,
    extentX: 7,
    extentY: 3.2,
    extentZ: 0.9,
  },
  // 6 (hub) + 10*3 (satellites) = 36 nodes; 3 satellite clusters, 2 left / 1 right.
  mobile: {
    nodeCount: 36,
    edgeCount: 54,
    clusterSizes: [6, 10, 10, 10],
    leftSatellites: 2,
    extentX: 3.4,
    extentY: 2.6,
    extentZ: 0.7,
  },
};

interface Zones {
  left: [number, number];
  center: [number, number];
  right: [number, number];
}

function buildZones(extentX: number): Zones {
  const third = (extentX * 2) / 3;
  return {
    left: [-extentX, -extentX + third],
    center: [-extentX + third, extentX - third],
    right: [extentX - third, extentX],
  };
}

function placeNode(
  seedBase: number,
  zoneRange: [number, number],
  geo: TierGeometry,
): [number, number, number] {
  const x = randomInRange(seedBase, zoneRange[0], zoneRange[1]);
  const y = randomInRange(seedBase + 1000, -geo.extentY, geo.extentY);
  const z = randomInRange(seedBase + 2000, -geo.extentZ, geo.extentZ);
  return [x, y, z];
}

/**
 * Build a sparse "path + random chords + hub bridges" graph per cluster. Never
 * fully connected; targets ~avg-degree-3 (UI-SPEC), always leaves room under
 * the requested edgeCount if random chords collide (dedup via a Set).
 */
function buildEdges(
  clusters: ClusterMeta[],
  hubClusterIndex: number,
  targetEdgeCount: number,
): { edges: Uint16Array; edgeClusters: Uint8Array } {
  const pairs: [number, number][] = [];
  const owners: number[] = [];
  const seen = new Set<string>();

  const addEdge = (a: number, b: number, owner: number): boolean => {
    if (a === b) return false;
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(key)) return false;
    seen.add(key);
    pairs.push([a, b]);
    owners.push(owner);
    return true;
  };

  // 1. Internal path per cluster — guarantees each cluster reads as a
  // connected chain of agents (an org-chart-like chain, not a random cloud).
  clusters.forEach((cluster, clusterIndex) => {
    for (let i = 0; i < cluster.count - 1; i += 1) {
      addEdge(cluster.start + i, cluster.start + i + 1, clusterIndex);
    }
  });

  // 2. Bridge edges: each satellite cluster's first node connects to a hub
  // node (the orchestrator <-> agent communication line).
  const hub = clusters[hubClusterIndex];
  clusters.forEach((cluster, clusterIndex) => {
    if (clusterIndex === hubClusterIndex || !hub) return;
    const hubOffset = Math.floor(seededRandom(clusterIndex + 500) * hub.count);
    addEdge(cluster.start, hub.start + hubOffset, clusterIndex);
  });

  // 3. Remaining budget: random intra-cluster chords (avoid duplicates, cap
  // attempts so a saturated small cluster cannot spin forever).
  let attempts = 0;
  const maxAttempts = targetEdgeCount * 40;
  let seed = 7919; // arbitrary odd seed, advanced per attempt
  while (pairs.length < targetEdgeCount && attempts < maxAttempts) {
    attempts += 1;
    seed += 17;
    const clusterIndex = Math.floor(
      seededRandom(seed) * clusters.length,
    );
    const cluster = clusters[clusterIndex];
    if (!cluster || cluster.count < 3) continue;
    const a =
      cluster.start + Math.floor(seededRandom(seed + 1) * cluster.count);
    const b =
      cluster.start + Math.floor(seededRandom(seed + 2) * cluster.count);
    addEdge(a, b, clusterIndex);
  }

  const edges = new Uint16Array(pairs.length * 2);
  const edgeClusters = new Uint8Array(pairs.length);
  pairs.forEach(([a, b], i) => {
    edges[i * 2] = a;
    edges[i * 2 + 1] = b;
    edgeClusters[i] = owners[i] ?? 0;
  });
  return { edges, edgeClusters };
}

/**
 * Build the tier-parameterized constellation graph (D-02, D-08). Pure and
 * deterministic — safe to call from a `useMemo` during render.
 */
export function buildConstellation(tier: ConstellationTier): ConstellationData {
  const geo = GEOMETRY[tier];
  const zones = buildZones(geo.extentX);

  const positions = new Float32Array(geo.nodeCount * 3);
  const clusters: ClusterMeta[] = [];
  let cursor = 0;
  let satelliteIndex = 0;
  let hubClusterIndex = 0;

  geo.clusterSizes.forEach((count, clusterIndex) => {
    const isHub = clusterIndex === 0;
    const zone: ClusterMeta["zone"] = isHub
      ? "center"
      : satelliteIndex < geo.leftSatellites
        ? "left"
        : "right";
    if (isHub) hubClusterIndex = clusterIndex;
    if (!isHub) satelliteIndex += 1;

    const zoneRange = zones[zone];
    for (let i = 0; i < count; i += 1) {
      const [x, y, z] = placeNode(
        (clusterIndex + 1) * 10_000 + i * 3,
        zoneRange,
        geo,
      );
      positions[(cursor + i) * 3] = x;
      positions[(cursor + i) * 3 + 1] = y;
      positions[(cursor + i) * 3 + 2] = z;
    }

    clusters.push({ start: cursor, count, isHub, zone });
    cursor += count;
  });

  const { edges, edgeClusters } = buildEdges(
    clusters,
    hubClusterIndex,
    geo.edgeCount,
  );

  return {
    nodeCount: geo.nodeCount,
    edgeCount: edges.length / 2,
    positions,
    edges,
    edgeClusters,
    clusters,
    hubClusterIndex,
  };
}
