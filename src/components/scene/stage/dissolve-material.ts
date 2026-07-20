/**
 * KERN dissolve shader (SOLID-3D v2 WP-D; DESIGN-SPEC §2.2, §5). The ~0.8 kB
 * `onBeforeCompile` patch that gives the hero morph-skin (`kern-skin.ts`) a
 * procedural noise-dissolve driven by ONE uniform, `uDissolve` ∈ [0,1]:
 *
 *   uDissolve = 0  → nothing discarded, the skin is fully solid;
 *   uDissolve = 1  → every fragment discarded, the skin is gone (0 pixels, but
 *                    the caller still flips `mesh.visible` off to drop the draw
 *                    call — this shader only decides WHICH fragments survive).
 *
 * Used ONLY during boot (skin fades in as uDissolve eases 1→0) and route
 * transitions (skin dissolves out as it eases 0→1 when leaving the homepage,
 * §4). At rest uDissolve is pinned to 0 or 1, so the term is settled and the
 * demand loop can go silent (the §2.4 `uDissolve ∉ {0,1}` needsFrame gate is
 * WP-D's; this module owns none of the loop).
 *
 * 100% PROCEDURAL (§5): the threshold is a sin-hash of the vertex's morphed
 * OBJECT-space position — the same PRNG lineage as `seeded.ts` — so the
 * dissolve pattern is stable per vertex and does not swim with the camera.
 * Core three only; no textures, no decoders, no cross-origin fetch.
 */

import type * as THREE from "three";

export interface DissolveUniforms {
  /** 0 = solid, 1 = fully dissolved. Eased by WP-D; never time-driven at rest. */
  uDissolve: { value: number };
}

/** Fresh uniform holder — starts fully dissolved so the skin can fade IN on boot. */
export function createDissolveUniforms(): DissolveUniforms {
  return { uDissolve: { value: 1 } };
}

/**
 * Patch `material` so it discards fragments below `uniforms.uDissolve`. The
 * uniform object is shared by reference (never reassigned), so WP-D mutates
 * `uniforms.uDissolve.value` each frame and the GPU picks it up with no shader
 * recompile. Call once per material at build time.
 */
export function applyDissolve(
  material: THREE.Material,
  uniforms: DissolveUniforms,
): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uDissolve = uniforms.uDissolve;

    // Vertex: capture the MORPHED object-space position (after
    // <morphtarget_vertex> mutates `transformed`) so the threshold tracks the
    // agitated skin rather than the calm rest pose.
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vKernDissolveP;",
      )
      .replace(
        "#include <morphtarget_vertex>",
        "#include <morphtarget_vertex>\n\tvKernDissolveP = transformed;",
      );

    // Fragment: sin-hash the captured position and discard below the threshold.
    // Injected right after <clipping_planes_fragment> (present at the top of
    // main() in every material shader) so discarded fragments skip all lighting.
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        [
          "#include <common>",
          "varying vec3 vKernDissolveP;",
          "uniform float uDissolve;",
          "float kernDissolveHash(vec3 p){",
          "\treturn fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453);",
          "}",
        ].join("\n"),
      )
      .replace(
        "#include <clipping_planes_fragment>",
        "#include <clipping_planes_fragment>\n\tif (kernDissolveHash(vKernDissolveP * 2.7) < uDissolve) discard;",
      );
  };
  material.needsUpdate = true;
}
