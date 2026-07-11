"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { SceneTier } from "@/lib/capability";
import { Constellation } from "./constellation";

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
 * 04-04: the scene interior is now the full <Constellation/> (hidden-structure
 * graph, drift, orange message pulses — D-01...D-04, D-08). The Canvas config
 * here (DPR clamp, alpha, low-power, context-loss handling) is unchanged from
 * 04-03's stub (kept byte-compatible per the plan). The scroll-linked exit /
 * frameloop pausing (D-05) and pointer-influence wiring (D-06) land in this
 * file's next revision within the same plan (Task 2).
 */
export default function ConstellationCanvas({ tier }: { tier: SceneTier }) {
  const [lost, setLost] = useState(false);
  const [running] = useState(true);

  if (lost) return null; // D-10 fallback = Phase-3 hero
  if (tier === "none") return null; // defensive — gate should never pass "none" here

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
      <Constellation tier={tier} />
    </Canvas>
  );
}
