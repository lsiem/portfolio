/**
 * Shard-prism geometry (KERN WP-A; DESIGN-SPEC §2.2, §5, §7.3-§7.4). Two pure,
 * build-once functions returning a `THREE.BufferGeometry` for the single
 * signature form — *der Kern* — instanced 384× on the one `InstancedMesh`.
 * 100% PROCEDURAL: hexagonal `ExtrudeGeometry`, core three only — zero GLTF,
 * zero loaders, zero decoders, zero cross-origin fetch (§5, constraint 7).
 *
 * NO module-level heavy work: nothing is built at import time. WP-D's stage
 * host calls these once inside the idle-sliced init window (§7.3 — geometry
 * builds are the sliced tasks; the single `gl.compile` pre-warm is not), and
 * keeps BOTH results alive so the frame-monitor degrade rung (§7.4 step 3) can
 * reassign `mesh.geometry` from the chamfered prism to the 8-tri LOD without
 * allocating anything mid-frame.
 *
 * Both prisms are centered on the origin and share a ~unit footprint (hexagon
 * circumradius 0.5, depth 0.55) so the LOD swap is drop-in: the per-instance
 * matrices computed for one apply unchanged to the other.
 */

import * as THREE from "three";

/** Hexagon circumradius + extrude depth — the shard's base footprint. */
const HEX_RADIUS = 0.5;
const PRISM_DEPTH = 0.55;

/** Regular n-gon `Shape` inscribed in `radius`, pointy edge up (offset 30°). */
function polygonShape(sides: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < sides; i += 1) {
    const angle = (Math.PI * 2 * i) / sides + Math.PI / 6;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

/**
 * The detailed shard: a chamfered hexagonal prism. ~176 tris (2 hexagon caps =
 * 8 + 2-step walls = 24 + 6-segment bevel ring both ends = 144) — the ~180-tri
 * class the §7.2 budget math assumes (384 × ~180 ≈ 70k tris). The bevel gives
 * the crystalline chamfer that catches the single DirectionalLight (§2.2).
 * Built once; the caller owns disposal on unmount.
 */
export function buildPrism(): THREE.BufferGeometry {
  const geometry = new THREE.ExtrudeGeometry(polygonShape(6, HEX_RADIUS), {
    depth: PRISM_DEPTH,
    steps: 2,
    bevelEnabled: true,
    bevelThickness: 0.09,
    bevelSize: 0.08,
    bevelSegments: 6,
  });
  // ExtrudeGeometry extrudes +z from the shape plane; recenter so per-instance
  // rotation/scale pivots on the shard's own centroid.
  geometry.center();
  return geometry;
}

/**
 * The degrade-rung LOD (§7.4 step 3): an 8-tri triangular prism (2 triangle
 * caps + 3 two-tri walls, no bevel). Cosmetic vs the dpr-1 / skin-off knobs
 * that actually move fill-rate, but a free latch-once swap since both prisms
 * are pre-built. Same footprint + centroid as `buildPrism()` so the swap needs
 * no matrix recompute.
 */
export function buildPrismLOD(): THREE.BufferGeometry {
  const geometry = new THREE.ExtrudeGeometry(polygonShape(3, HEX_RADIUS), {
    depth: PRISM_DEPTH,
    steps: 1,
    bevelEnabled: false,
  });
  geometry.center();
  return geometry;
}
