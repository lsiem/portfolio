"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { Points, LineSegments, PointsMaterial, LineBasicMaterial } from "three";
import {
  buildConstellation,
  randomInRange,
  seededRandom,
  type ConstellationTier,
} from "./constellation-data";
import { resolveSceneColors, type SceneColors } from "@/lib/theme-color-resolver";
import { sceneBridge } from "./scene-bridge";
import { getMotionToken } from "@/lib/motion-tokens";

/**
 * The constellation scene interior (D-01 concept, D-02 hidden structure via
 * constellation-data.ts, D-03 material language, D-04 temporal behavior,
 * D-08 atmospheric composition). ALL temporal behavior lives in a SINGLE
 * `useFrame((state, delta) => ...)` loop that mutates BufferGeometry
 * attributes directly and sets `needsUpdate` — never React state per frame
 * (RESEARCH Anti-Patterns / R3F pitfalls.mdx). The loop early-returns
 * whole-sale when `sceneBridge.paused` (D-05 scroll-exit / tab-hidden).
 *
 * Rendering technique: nodes and edges SHARE one `position` BufferAttribute
 * (edges reference it via `setIndex`), so a single per-frame drift mutation
 * updates both point and line geometry in one pass. Node color uses a
 * per-vertex `color` attribute (task 2 also drives the D-09 boot-flash and
 * D-06 pointer-illumination blend through the same attribute).
 *
 * Colors are NEVER hardcoded (UI-SPEC hard rule) — every material color
 * flows from theme-color-resolver.ts (`--muted`/`--border`/`--accent`
 * tokens), re-read every frame so a theme flip is picked up for free.
 */

// --- UI-SPEC "Constellation Visual Spec" temporal-behavior table -------------
const RESTING_NODE_OPACITY = 0.55; // --muted, node dots (resting)
const RESTING_EDGE_OPACITY = 0.35; // --border, edge hairlines (resting)

// Drift (D-04): max screen-space velocity <= 8px/s, period 20-40s per node.
// World-unit amplitude derived conservatively from the working camera setup
// (position [0,0,8], fov 45deg): visible height ~= 2*8*tan(22.5deg) ~= 6.63
// units over a ~800px-tall hero => ~120.7 px/world-unit. At the SLOWEST
// period (40s, w~=0.157 rad/s) the 8px/s ceiling allows amplitude up to
// ~0.42 units; we stay well under that (0.05-0.14) so the motion always
// reads as "slow drift", never brushing the ceiling (Claude's discretion).
const DRIFT_PERIOD_MIN_S = 20;
const DRIFT_PERIOD_MAX_S = 40;
const DRIFT_AMPLITUDE_MIN = 0.05;
const DRIFT_AMPLITUDE_MAX = 0.14;

// Message pulses (D-04, D-03): one every 2-5s (irregular), <=2 in flight,
// ~800ms travel (--motion-duration-slow is the UI-SPEC "reference value").
const MAX_PULSES = 2;
const PULSE_MIN_GAP_S = 2;
const PULSE_MAX_GAP_S = 5;
const TRAIL_FRACTION = 0.18; // portion of the edge behind the dot that glows
const PARKED = 9999; // off-frustum position for inactive pulse slots

interface DriftParams {
  wx: number;
  wy: number;
  wz: number;
  phaseX: number;
  phaseY: number;
  phaseZ: number;
  ampX: number;
  ampY: number;
  ampZ: number;
}

interface ActivePulse {
  edgeIndex: number;
  startedAt: number;
}

type ConstellationProps = {
  tier: ConstellationTier;
};

export function Constellation({ tier }: ConstellationProps) {
  const data = useMemo(() => buildConstellation(tier), [tier]);

  const { nodeGeometry, edgeGeometry, homePositions } = useMemo(() => {
    const positions = new Float32Array(data.positions); // mutable live copy
    const colors = new Float32Array(data.nodeCount * 3);

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    nodeGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const edgeGeo = new THREE.BufferGeometry();
    // Share the SAME position attribute object as the node geometry so one
    // per-frame drift mutation updates both points and lines at once.
    edgeGeo.setAttribute("position", nodeGeo.getAttribute("position"));
    edgeGeo.setIndex(new THREE.BufferAttribute(new Uint16Array(data.edges), 1));

    return {
      nodeGeometry: nodeGeo,
      edgeGeometry: edgeGeo,
      homePositions: data.positions, // never mutated — drift oscillates around this
    };
  }, [data]);

  const pulseGeometries = useMemo(() => {
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(MAX_PULSES * 3).fill(PARKED), 3),
    );
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array(MAX_PULSES * 2 * 3).fill(PARKED),
        3,
      ),
    );
    return { dotGeo, trailGeo };
  }, []);

  const driftParams = useMemo<DriftParams[]>(() => {
    const params: DriftParams[] = new Array(data.nodeCount);
    for (let i = 0; i < data.nodeCount; i += 1) {
      const s = i * 97 + 13;
      const periodX = randomInRange(s + 1, DRIFT_PERIOD_MIN_S, DRIFT_PERIOD_MAX_S);
      const periodY = randomInRange(s + 2, DRIFT_PERIOD_MIN_S, DRIFT_PERIOD_MAX_S);
      const periodZ = randomInRange(s + 3, DRIFT_PERIOD_MIN_S, DRIFT_PERIOD_MAX_S);
      params[i] = {
        wx: (2 * Math.PI) / periodX,
        wy: (2 * Math.PI) / periodY,
        wz: (2 * Math.PI) / periodZ,
        phaseX: randomInRange(s + 4, 0, 2 * Math.PI),
        phaseY: randomInRange(s + 5, 0, 2 * Math.PI),
        phaseZ: randomInRange(s + 6, 0, 2 * Math.PI),
        ampX: randomInRange(s + 7, DRIFT_AMPLITUDE_MIN, DRIFT_AMPLITUDE_MAX),
        ampY: randomInRange(s + 8, DRIFT_AMPLITUDE_MIN, DRIFT_AMPLITUDE_MAX),
        ampZ: randomInRange(
          s + 9,
          DRIFT_AMPLITUDE_MIN * 0.5,
          DRIFT_AMPLITUDE_MAX * 0.5,
        ),
      };
    }
    return params;
  }, [data]);

  const nodeMaterialRef = useRef<PointsMaterial>(null);
  const edgeMaterialRef = useRef<LineBasicMaterial>(null);
  const pulseDotMaterialRef = useRef<PointsMaterial>(null);
  const pulseTrailMaterialRef = useRef<LineBasicMaterial>(null);
  const pulseDotsRef = useRef<Points>(null);
  const pulseTrailRef = useRef<LineSegments>(null);

  // Theme colors: read once synchronously (client-only chunk, safe) and kept
  // in a ref — re-read every frame below, so a theme flip is picked up for
  // free without any extra subscription/effect (task 2 does not need to
  // touch this).
  const colorsRef = useRef<SceneColors>(resolveSceneColors());

  const elapsedRef = useRef(0);
  const pulsesRef = useRef<ActivePulse[]>([]);
  const nextSpawnAtRef = useRef(randomInRange(1, 0.5, PULSE_MAX_GAP_S));
  const spawnSeedRef = useRef(1);

  const pulseDurationS = useMemo(
    () => getMotionToken("--motion-duration-slow"), // UI-SPEC's stated reference value
    [],
  );

  useFrame((_state, delta) => {
    // D-05 (also tab-hidden, task 2 wiring): freeze everything, GPU work zero.
    if (sceneBridge.paused) return;

    // Refresh theme colors every frame (cheap; re-resolves on a theme flip
    // without a dedicated subscription — RESEARCH Pattern 5).
    colorsRef.current = resolveSceneColors();
    const { muted, border, accent } = colorsRef.current;

    elapsedRef.current += delta;
    const elapsed = elapsedRef.current;

    const posAttr = nodeGeometry.getAttribute("position") as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const colorAttr = nodeGeometry.getAttribute("color") as THREE.BufferAttribute;
    const colors = colorAttr.array as Float32Array;

    // --- Drift (D-04): delta-based oscillation around home positions --------
    for (let i = 0; i < data.nodeCount; i += 1) {
      const p = driftParams[i];
      const hx = homePositions[i * 3];
      const hy = homePositions[i * 3 + 1];
      const hz = homePositions[i * 3 + 2];
      positions[i * 3] = hx + p.ampX * Math.sin(elapsed * p.wx + p.phaseX);
      positions[i * 3 + 1] = hy + p.ampY * Math.sin(elapsed * p.wy + p.phaseY);
      positions[i * 3 + 2] = hz + p.ampZ * Math.sin(elapsed * p.wz + p.phaseZ);

      // Resting vertex color (task 2 overlays the boot-flash + pointer blend
      // on top of this same attribute).
      colors[i * 3] = muted.r;
      colors[i * 3 + 1] = muted.g;
      colors[i * 3 + 2] = muted.b;
    }
    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    // --- Message pulses (D-03, D-04) ----------------------------------------
    const pulses = pulsesRef.current;
    for (let i = pulses.length - 1; i >= 0; i -= 1) {
      const pulse = pulses[i];
      if (pulse && elapsed - pulse.startedAt >= pulseDurationS) {
        pulses.splice(i, 1);
      }
    }
    if (pulses.length < MAX_PULSES && elapsed >= nextSpawnAtRef.current) {
      const edgeIndex = Math.floor(
        seededRandom(spawnSeedRef.current) * data.edgeCount,
      );
      spawnSeedRef.current += 1;
      pulses.push({ edgeIndex, startedAt: elapsed });
      nextSpawnAtRef.current =
        elapsed + randomInRange(spawnSeedRef.current, PULSE_MIN_GAP_S, PULSE_MAX_GAP_S);
    }

    const dotAttr = pulseGeometries.dotGeo.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const dotPositions = dotAttr.array as Float32Array;
    const trailAttr = pulseGeometries.trailGeo.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const trailPositions = trailAttr.array as Float32Array;

    let newestProgress = 1;
    for (let slot = 0; slot < MAX_PULSES; slot += 1) {
      const pulse = pulses[slot];
      if (!pulse) {
        dotPositions[slot * 3] = PARKED;
        dotPositions[slot * 3 + 1] = PARKED;
        dotPositions[slot * 3 + 2] = PARKED;
        trailPositions[slot * 6] = PARKED;
        trailPositions[slot * 6 + 1] = PARKED;
        trailPositions[slot * 6 + 2] = PARKED;
        trailPositions[slot * 6 + 3] = PARKED;
        trailPositions[slot * 6 + 4] = PARKED;
        trailPositions[slot * 6 + 5] = PARKED;
        continue;
      }
      const t = (elapsed - pulse.startedAt) / pulseDurationS;
      newestProgress = t;
      const nodeA = data.edges[pulse.edgeIndex * 2] ?? 0;
      const nodeB = data.edges[pulse.edgeIndex * 2 + 1] ?? 0;
      const ax = positions[nodeA * 3] ?? 0;
      const ay = positions[nodeA * 3 + 1] ?? 0;
      const az = positions[nodeA * 3 + 2] ?? 0;
      const bx = positions[nodeB * 3] ?? 0;
      const by = positions[nodeB * 3 + 1] ?? 0;
      const bz = positions[nodeB * 3 + 2] ?? 0;

      const dx = ax + (bx - ax) * t;
      const dy = ay + (by - ay) * t;
      const dz = az + (bz - az) * t;
      dotPositions[slot * 3] = dx;
      dotPositions[slot * 3 + 1] = dy;
      dotPositions[slot * 3 + 2] = dz;

      const trailT = Math.max(0, t - TRAIL_FRACTION);
      trailPositions[slot * 6] = ax + (bx - ax) * trailT;
      trailPositions[slot * 6 + 1] = ay + (by - ay) * trailT;
      trailPositions[slot * 6 + 2] = az + (bz - az) * trailT;
      trailPositions[slot * 6 + 3] = dx;
      trailPositions[slot * 6 + 4] = dy;
      trailPositions[slot * 6 + 5] = dz;
    }
    dotAttr.needsUpdate = true;
    trailAttr.needsUpdate = true;

    // --- Material colors/opacity (token-driven, resting values) -------------
    if (nodeMaterialRef.current) {
      nodeMaterialRef.current.opacity = RESTING_NODE_OPACITY;
    }
    if (edgeMaterialRef.current) {
      edgeMaterialRef.current.opacity = RESTING_EDGE_OPACITY;
      edgeMaterialRef.current.color.copy(border);
    }
    if (pulseDotMaterialRef.current) {
      pulseDotMaterialRef.current.color.copy(accent);
    }
    if (pulseTrailMaterialRef.current) {
      // Trailing glow fades to 0 toward the end of the pulse's travel (D-04).
      pulseTrailMaterialRef.current.color.copy(accent);
      pulseTrailMaterialRef.current.opacity =
        pulses.length > 0 ? 0.6 * (1 - newestProgress) : 0;
    }
  });

  return (
    <group>
      <points geometry={nodeGeometry}>
        <pointsMaterial
          ref={nodeMaterialRef}
          vertexColors
          size={tier === "mobile" ? 0.05 : 0.065}
          sizeAttenuation
          transparent
          opacity={RESTING_NODE_OPACITY}
          depthWrite={false}
        />
      </points>
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial
          ref={edgeMaterialRef}
          transparent
          opacity={RESTING_EDGE_OPACITY}
          depthWrite={false}
        />
      </lineSegments>
      <points ref={pulseDotsRef} geometry={pulseGeometries.dotGeo}>
        <pointsMaterial
          ref={pulseDotMaterialRef}
          size={tier === "mobile" ? 0.07 : 0.09}
          sizeAttenuation
          transparent
          opacity={1}
          depthWrite={false}
        />
      </points>
      <lineSegments ref={pulseTrailRef} geometry={pulseGeometries.trailGeo}>
        <lineBasicMaterial
          ref={pulseTrailMaterialRef}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
