import * as THREE from "three";
import type { SceneColors } from "@/lib/theme-color-resolver";

const vertexShader = `
attribute float aSize;
attribute float aColorMix;
varying float vColorMix;
uniform float uPixelRatio;

void main() {
  vColorMix = aColorMix;
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = aSize * uPixelRatio * clamp(5.0 / max(1.0, -viewPosition.z), 0.65, 1.8);
}
`;

const fragmentShader = `
varying float vColorMix;
uniform vec3 uMuted;
uniform vec3 uAccent;

void main() {
  vec2 p = gl_PointCoord - vec2(0.5);
  float d = length(p);
  float alpha = 1.0 - smoothstep(0.34, 0.5, d);
  if (alpha <= 0.0) discard;
  vec3 color = mix(uMuted, uAccent, clamp(vColorMix, 0.0, 1.0));
  gl_FragColor = vec4(color, alpha * 0.88);
}
`;

export interface ParticleMaterial {
  readonly material: THREE.ShaderMaterial;
  setColors(colors: SceneColors): void;
  setPixelRatio(value: number): void;
  dispose(): void;
}

export function createParticleMaterial(
  colors: SceneColors,
  pixelRatio: number,
): ParticleMaterial {
  const uniforms = {
    uMuted: { value: colors.muted.clone() },
    uAccent: { value: colors.accent.clone() },
    uPixelRatio: { value: pixelRatio },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });

  return {
    material,
    setColors(next) {
      uniforms.uMuted.value.copy(next.muted);
      uniforms.uAccent.value.copy(next.accent);
    },
    setPixelRatio(value) {
      uniforms.uPixelRatio.value = value;
    },
    dispose() {
      material.dispose();
    },
  };
}
