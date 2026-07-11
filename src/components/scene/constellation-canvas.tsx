"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { SceneTier } from "@/lib/capability";

/**
 * Lazy chunk entry for the hero WebGL scene (RESEARCH Code Example 3). This is
 * the DEFAULT export that `hero-scene-gate.tsx` pulls via
 * `dynamic(() => import("./constellation-canvas"), { ssr: false })`, so
 * three + @react-three/fiber live entirely in this async-only chunk and never
 * touch the eager route bundle (WOW-01 "nie im Initial-Bundle").
 *
 * Silent context-loss fallback (D-10, success criterion 2 / RESEARCH Pattern 6):
 * on `webglcontextlost` the component unmounts the <Canvas> (returns null) — no
 * preventDefault, no restore machinery, no error surfaced. The Phase-3 hero
 * remains.
 *
 * NOTE (04-03 slice): the scene interior is a minimal proof-of-life STUB — a few
 * dozen faint static points in the theme's --muted colour. 04-04 REPLACES
 * <StubPoints/> with the full constellation (hidden-structure graph, drift,
 * orange message pulses, pointer influence, boot entrance, scroll-linked exit)
 * and wires the scene bridge + frameloop pausing. The Canvas config here (DPR
 * clamp, alpha, low-power, context-loss handling) is the permanent contract.
 */

const MUTED_FALLBACK = "#6b6560"; // mirrors globals.css --muted (light)

/** Read the resolved --muted token once at mount (client-only, ssr:false). */
function useMutedColor(): string {
  return useMemo(() => {
    const resolved = getComputedStyle(document.documentElement)
      .getPropertyValue("--muted")
      .trim();
    return resolved || MUTED_FALLBACK;
  }, []);
}

/**
 * Proof-of-life stub (replaced by 04-04's <Constellation/>): ~48 static points
 * scattered in a shallow slab, faint, theme-coloured. Transform/opacity only.
 */
function StubPoints({ color }: { color: string }) {
  const positions = useMemo(() => {
    const count = 48;
    const arr = new Float32Array(count * 3);
    // Deterministic pseudo-random scatter (pure — React-Compiler purity rule
    // forbids Math.random() in render). A stable stub; 04-04 supplies real data.
    const rand = (n: number) => {
      const x = Math.sin(n * 12.9898) * 43758.5453;
      return x - Math.floor(x); // fractional part in [0, 1)
    };
    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (rand(i + 1) - 0.5) * 12; // x
      arr[i * 3 + 1] = (rand(i + 101) - 0.5) * 7; // y
      arr[i * 3 + 2] = (rand(i + 211) - 0.5) * 2; // z (shallow slab)
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.09}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </points>
  );
}

export default function ConstellationCanvas({ tier }: { tier: SceneTier }) {
  const [lost, setLost] = useState(false);
  // 04-04 toggles this to "never" on the scroll-linked exit (D-05); the stub is
  // static, but the state-driven frameloop is the permanent contract.
  const [running] = useState(true);
  const color = useMutedColor();

  if (lost) return null; // D-10 fallback = Phase-3 hero

  return (
    <Canvas
      frameloop={running ? "always" : "never"}
      dpr={tier === "mobile" ? [1, 1.25] : [1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 8], fov: 45 }}
      onCreated={({ gl }) => {
        // No preventDefault / no restore — silent unmount only (Pattern 6).
        gl.domElement.addEventListener("webglcontextlost", () => setLost(true));
      }}
    >
      <StubPoints color={color} />
    </Canvas>
  );
}
