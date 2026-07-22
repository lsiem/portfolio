/**
 * KERN hero morph-skin (SOLID-3D v2 WP-D; DESIGN-SPEC §2.2 render object 2, §3
 * #hero). The SECOND (and only other) render object on the persistent canvas:
 * a procedurally displaced `IcosahedronGeometry` (detail 3, ~1.3k verts) that
 * floats inside the assembled LS monogram in `#hero`, breathes while the hero
 * IO window is in view, agitates toward the pointer (D-06), and dissolves out
 * past the hero boundary + on route transitions via the `dissolve-material.ts`
 * uniform. ONE draw call; lit by the stage's single Ambient + Directional pair.
 *
 * Two `morphAttributes.position` deltas (`morphTargetsRelative = true`, so the
 * shader adds `influence · delta` to the base pose — version-stable across
 * three releases, unlike the absolute-target convention):
 *   - target 0 "calm"   — a gentle radial breathing swell (ambient bob input);
 *   - target 1 "agitated" — sharp seeded spikes (pointer-proximity input).
 * WP-D owns both `morphTargetInfluences`; this module only shapes the geometry.
 *
 * 100% PROCEDURAL (§5): base displacement + both deltas come from `seeded.ts`'s
 * sin-hash, so the skin is reproducible and carries zero assets. Build is
 * idle-sliced by WP-D at init (§7.3). Caller owns disposal.
 */

import * as THREE from "three";

import type { SceneColors } from "@/lib/theme-color-resolver";
import { seededRandom } from "./seeded";
import {
  applyDissolve,
  createDissolveUniforms,
  type DissolveUniforms,
} from "./dissolve-material";

/** Icosphere subdivision — detail 3 ≈ 1.3k verts (§2.2). */
const SKIN_DETAIL = 3;
/** Base radius in local units; WP-D scales the mesh to fit the monogram. */
const SKIN_RADIUS = 1;
/** Amplitude of the seeded base displacement baked into the rest geometry. */
const BASE_DISPLACE = 0.16;
/** Calm breathing swell (morph target 0), radial. */
const CALM_DISPLACE = 0.14;
/** Pointer-agitated spike depth (morph target 1), seeded per vertex. */
const AGITATE_DISPLACE = 0.55;
/** Faint self-glow so the crystalline form reads even in shadow. */
const SKIN_EMISSIVE_INTENSITY = 0.12;

export interface KernSkin {
  /** The single hero-local mesh — mount via `<primitive>` inside the scroll group. */
  readonly mesh: THREE.Mesh;
  /** Shared dissolve uniform — WP-D eases `.value` and gates it into needsFrame. */
  readonly dissolve: DissolveUniforms;
  /** Repaint on theme flip (token-driven color, no hex — UI-SPEC rule). */
  setColors(colors: SceneColors): void;
  /** Free geometry + material on unmount / context loss. */
  dispose(): void;
}

/**
 * Build the morph-skin from the given theme colors. Pure aside from the three
 * allocations it owns; safe to run inside an idle slice. `morphTargetInfluences`
 * initialise to `[0, 0]` (calm, un-agitated); the dissolve uniform starts at 1
 * so WP-D can fade the skin in on boot.
 */
export function buildKernSkin(colors: SceneColors): KernSkin {
  const geometry = new THREE.IcosahedronGeometry(SKIN_RADIUS, SKIN_DETAIL);
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const count = position.count;

  const calm = new Float32Array(count * 3);
  const agitated = new Float32Array(count * 3);
  const scratch = new THREE.Vector3();

  for (let i = 0; i < count; i += 1) {
    scratch.fromBufferAttribute(position, i);
    // Unit normal of the icosphere == normalized position; displace radially.
    const len = scratch.length() || 1;
    const nx = scratch.x / len;
    const ny = scratch.y / len;
    const nz = scratch.z / len;
    const seed = i * 1.37 + 0.5;

    // Bake a seeded ridge into the rest pose so the skin is faceted, not a
    // smooth ball (catches the DirectionalLight like the shards do).
    const baseD = BASE_DISPLACE * (seededRandom(seed) - 0.5);
    position.setXYZ(
      i,
      scratch.x + nx * baseD,
      scratch.y + ny * baseD,
      scratch.z + nz * baseD,
    );

    // Morph 0 (calm): gentle outward swell, always positive → a breathing pulse.
    const calmD = CALM_DISPLACE * (0.5 + 0.5 * seededRandom(seed + 3.1));
    calm[i * 3] = nx * calmD;
    calm[i * 3 + 1] = ny * calmD;
    calm[i * 3 + 2] = nz * calmD;

    // Morph 1 (agitated): sharp seeded spikes, mostly outward.
    const spike = AGITATE_DISPLACE * seededRandom(seed + 7.7);
    agitated[i * 3] = nx * spike;
    agitated[i * 3 + 1] = ny * spike;
    agitated[i * 3 + 2] = nz * spike;
  }
  position.needsUpdate = true;

  geometry.morphTargetsRelative = true;
  geometry.morphAttributes.position = [
    new THREE.Float32BufferAttribute(calm, 3),
    new THREE.Float32BufferAttribute(agitated, 3),
  ];
  geometry.computeVertexNormals();

  const dissolve = createDissolveUniforms();
  // MeshLambert (not Standard): the cheap material choice for the FALLBACK tier
  // (§7.4) while still responding to the two lights. instanceColor is not in
  // play here — this is a single mesh, so color lives on the material.
  const material = new THREE.MeshLambertMaterial({
    color: colors.accent.clone(),
    emissive: colors.foreground.clone(),
    emissiveIntensity: SKIN_EMISSIVE_INTENSITY,
  });
  applyDissolve(material, dissolve);

  const mesh = new THREE.Mesh(geometry, material);
  // Lives at the moving scroll-group origin, spans the hero rect — culling buys
  // nothing and would pop it off at the boundary (§2.2 frustumCulled = false).
  mesh.frustumCulled = false;
  mesh.morphTargetInfluences = [0, 0];

  const setColors = (next: SceneColors): void => {
    material.color.copy(next.accent);
    material.emissive.copy(next.foreground);
  };
  const dispose = (): void => {
    geometry.dispose();
    material.dispose();
  };

  return { mesh, dissolve, setColors, dispose };
}
