"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type {
  Group,
  LineBasicMaterial,
  PointsMaterial,
} from "three";
import { sceneBridge } from "../scene-bridge";
import {
  observeThemeColors,
  resolveSceneColors,
  type SceneColors,
} from "@/lib/theme-color-resolver";
import { getMotionToken } from "@/lib/motion-tokens";
import { constellationGraphForCount, POOL_COUNT } from "./formations";
import {
  randomInRange,
  type ConstellationTier,
} from "../constellation-data";
import { FormationEngine, interimLayout } from "./formation-engine";
import { createFrameMonitor } from "./frame-monitor";

/**
 * The particle stage interior (Kontinuum WP-B; DESIGN-SPEC §3) — ONE pool,
 * ONE `useFrame`, absorbing the shipped constellation scene (D-01..D-06,
 * D-08, D-09) as its `constellation` formation. Everything temporal happens
 * in the single loop below, mutating BufferGeometry attributes directly and
 * setting `needsUpdate` — never React state per frame (D-08 discipline,
 * unchanged from constellation.tsx). Per frame, in order:
 *
 *   1. Contract-3 counter: `data-scene-frames` increments once per RENDERED
 *      frame on the stage wrapper (WP-E's falsifiable at-rest probe).
 *   2. Engine step (formation-engine.ts): pool lerp toward the staggered
 *      morph target, §4 transition scatter, velocity-turbulence decay, drift.
 *   3. Scroll-offset group transform (§3 global rule): ONE translate maps the
 *      doc-space targets to the viewport — `+scrollY * worldPerPixel`
 *      (targets are unprojected y-UP in formations.ts, hence the sign).
 *   4. Camera spline (Weltlinie graft): CatmullRomCurve3 over smoothed
 *      `bridge.pageProgress`, lerped lookAt — slow dolly, never a cut.
 *   5. Constellation-weighted hero behaviors, all preserved verbatim from
 *      constellation.tsx and faded by `constellationWeight` as the field
 *      morphs away: D-06 pointer attraction/illumination (pointer:fine only),
 *      D-04 message pulses (spawn additionally gated on `ambientVisible` so
 *      they ride the hero/contact ambient frames and can never keep the
 *      demand loop awake mid-page — at-rest invariant R1), D-09 entrance.
 *   6. Colors: border→muted intensity ramp per particle (deep "reserve dust"
 *      sits near border = near-invisible on both themes), boot-flash toward
 *      foreground, pointer blend toward accent — all token-driven (D-08:
 *      theme tokens stay the single color source) through a cached
 *      SceneColors ref; the observeThemeColors() subscription refreshes it
 *      and pokes the demand loop on theme flips (RESEARCH Pattern 5), so a
 *      flip at rest still repaints under frameloop="demand".
 *   7. Demand-loop settling (§6.3): `state.invalidate()` is called at the end
 *      ONLY while something is actually converging (engine, entrance,
 *      camera smoothing, in-flight pulses). Everything snaps below epsilon
 *      and goes silent — no producer here ever invalidates at rest.
 *
 * Frame-monitor ladder (§6.3): sustained >24ms frames halve the pool once
 * (never below the graph) and clamp dpr to 1 — one rung, latched.
 */

// --- UI-SPEC resting opacities (unchanged from the shipped scene) -------------
const RESTING_NODE_OPACITY = 0.55;
const RESTING_EDGE_OPACITY = 0.35;

// Message pulses (D-04, D-03): one every 2-5s (irregular), <=2 in flight,
// ~800ms travel (--motion-duration-slow is the UI-SPEC "reference value").
const MAX_PULSES = 2;
const PULSE_MIN_GAP_S = 2;
const PULSE_MAX_GAP_S = 5;
const TRAIL_FRACTION = 0.18;
const PARKED = 9999;
/** Pulses only spawn while the field still reads as the hero constellation. */
const PULSE_MIN_CONSTELLATION_WEIGHT = 0.6;

// D-09 entrance timings (verbatim).
const ASSEMBLE_FLASH_FRACTION = 0.25;
const FADE_DURATION_S = 0.8;
const BOOT_WATCHDOG_S = 3;

// D-06 pointer influence — 120 screen px radius, <=10px displacement, <=60%
// blend (converted per frame via the live worldPerPixel instead of the old
// fixed PX_PER_WORLD_UNIT constant — same numbers at the reference viewport).
const POINTER_RADIUS_PX = 120;
const POINTER_MAX_DISPLACEMENT_PX = 10;
const POINTER_MAX_BLEND = 0.6;

// Camera spline (§3): one gentle loop around the shipped base pose [0,0,8].
// Amplitudes stay well under half a world unit — dolly/parallax, not travel.
const CAMERA_SPLINE_POINTS: [number, number, number][] = [
  [0, 0, 8],
  [0.3, -0.22, 7.55],
  [-0.26, 0.18, 8.3],
  [0.24, -0.14, 7.7],
  [0, 0, 8],
];
/**
 * Smoothing rate toward bridge.pageProgress (per second). Sized with
 * CAMERA_EPS for R1's 1500 ms settle window (§7): worst case (full-page jump,
 * Δprogress = 1) is ln(1 / 0.005) / 6 ≈ 0.9 s of settling frames. The old
 * 3 / 0.0005 pairing took ~2.4 s and was the longest at-rest leak tail.
 */
const CAMERA_SMOOTH_RATE = 6;
/**
 * Below this progress delta the camera snaps and stops demanding frames.
 * 0.005 of the spline is well under a pixel of camera travel — the snap is
 * invisible; the epsilon exists purely as the demand-loop leak guard (§6.3).
 */
const CAMERA_EPS = 0.005;
/**
 * Clamp pathological first-frame/idle-gap deltas (demand loop) for ELAPSED
 * accumulation only — drift phases and pulse timelines must not teleport
 * after a long idle gap. Convergence math (pool lerp, velocity decay, camera
 * smoothing) deliberately uses the wall-clock delta instead (MAX_SETTLE_DT_S):
 * those are exponential approaches where a big dt just completes the
 * transition — exactly the correct at-rest behavior — and clamping them
 * stretches the settle window past R1's 1500 ms wall-clock budget (§7)
 * whenever rAF degrades (throttled/occluded headless, starved CI runners).
 */
const MAX_DT_S = 0.25;
/** Wall-clock delta cap for the convergence exponentials (sanity bound). */
const MAX_SETTLE_DT_S = 2;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(t: number): number {
  const inv = 1 - t;
  return 1 - inv * inv * inv;
}

interface ActivePulse {
  edgeIndex: number;
  startedAt: number;
}

type EntrancePhase = "waiting-boot" | "assembling" | "fading" | "settled";

interface EntranceState {
  phase: EntrancePhase;
  phaseStartedAt: number | null;
}

/** D-09: decide which of the two entrance cases applies, once, at mount. */
function computeInitialEntrance(): EntranceState {
  const pointerFine =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches;
  if (pointerFine && sceneBridge.introBeatAt === 0) {
    return { phase: "waiting-boot", phaseStartedAt: null };
  }
  return { phase: "fading", phaseStartedAt: null };
}

type ParticleStageProps = {
  tier: ConstellationTier;
  /** The Contract-3 wrapper node — receives the data-scene-frames counter. */
  frameHookRef: React.RefObject<HTMLDivElement | null>;
};

export function ParticleStage({ tier, frameHookRef }: ParticleStageProps) {
  const count = POOL_COUNT[tier];
  const graph = useMemo(() => constellationGraphForCount(count), [count]);

  const engine = useMemo(
    () =>
      new FormationEngine(
        count,
        interimLayout(window.innerWidth, window.innerHeight),
      ),
    [count],
  );
  // Idle precompute kickoff lives here — not in the constructor — so the
  // useMemo above has no render-phase side effect; dispose stales the chain
  // via the engine's precompute epoch (StrictMode-safe).
  useEffect(() => {
    engine.start();
    return () => engine.dispose();
  }, [engine]);

  const { nodeGeometry, edgeGeometry } = useMemo(() => {
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(count * 3), 3),
    );
    nodeGeo.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(count * 3), 3),
    );
    // Deep dust lives far outside the default bounding sphere — disable
    // culling instead of recomputing bounds per frame (one fixed fullscreen
    // layer; frustum checks buy nothing here).
    const edgeGeo = new THREE.BufferGeometry();
    // Edges SHARE the pool's position attribute (shipped architecture): one
    // per-frame upload updates points and lines in a single pass.
    edgeGeo.setAttribute("position", nodeGeo.getAttribute("position"));
    edgeGeo.setIndex(new THREE.BufferAttribute(graph.edges, 1));
    return { nodeGeometry: nodeGeo, edgeGeometry: edgeGeo };
  }, [count, graph]);

  const intensity = useMemo(() => new Float32Array(count), [count]);

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

  const cameraSpline = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        CAMERA_SPLINE_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
      ),
    [],
  );

  const groupRef = useRef<Group>(null);
  const nodeMaterialRef = useRef<PointsMaterial>(null);
  const edgeMaterialRef = useRef<LineBasicMaterial>(null);
  const pulseDotMaterialRef = useRef<PointsMaterial>(null);
  const pulseTrailMaterialRef = useRef<LineBasicMaterial>(null);

  // Theme colors: resolved once synchronously (client-only chunk, safe), then
  // kept fresh by the observeThemeColors subscription below — resolving per
  // frame would allocate 4 THREE.Colors + 4 getComputedStyle parses right
  // after the data-scene-frames write, and a flip at rest would never repaint
  // under frameloop="demand". The subscription updates the ref and pokes the
  // demand loop instead; tokens remain the single color source (D-08).
  const colorsRef = useRef<SceneColors>(resolveSceneColors());
  useEffect(
    () =>
      observeThemeColors((colors) => {
        colorsRef.current = colors;
        sceneBridge.invalidate();
      }),
    [],
  );

  const elapsedRef = useRef(0);
  const framesRef = useRef(0);
  const pulsesRef = useRef<ActivePulse[]>([]);
  const nextSpawnAtRef = useRef(randomInRange(1, 0.5, PULSE_MAX_GAP_S));
  const spawnSeedRef = useRef(1);
  const entranceRef = useRef<EntranceState>(computeInitialEntrance());
  const smoothedProgressRef = useRef(0);
  const lookTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const cameraPosRef = useRef(new THREE.Vector3());
  const monitorRef = useRef(createFrameMonitor());

  const pulseDurationS = useMemo(
    () => getMotionToken("--motion-duration-slow"),
    [],
  );
  const assembleDurationS = useMemo(
    () => getMotionToken("--motion-duration-chapter"),
    [],
  );

  // The pointer unprojection needs the live camera; captured from the frame
  // loop (avoids a useThree subscription re-render on camera swaps).
  const cameraRef = useRef<THREE.Camera | null>(null);

  // D-06 pointer influence — pointer:fine ONLY (the listener is never
  // installed on touch/keyboard); document-level, the canvas itself stays
  // pointer-events-none (WOW-04). Each move pokes the demand loop — pointer
  // motion is an enumerated invalidation source (§6.3).
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;

    const raycaster = new THREE.Raycaster();
    const scenePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();

    const handlePointerMove = (event: PointerEvent): void => {
      const camera = cameraRef.current;
      if (!camera) return;
      ndc.x = (event.clientX / window.innerWidth) * 2 - 1;
      ndc.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(scenePlane, hit)) {
        sceneBridge.pointer.x = hit.x;
        sceneBridge.pointer.y = hit.y;
        sceneBridge.pointer.active = true;
        sceneBridge.invalidate();
      }
    };
    const handlePointerLeave = (): void => {
      sceneBridge.pointer.active = false;
      sceneBridge.invalidate();
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      sceneBridge.pointer.active = false;
    };
  }, []);

  useFrame((state, rawDelta) => {
    // 1. Contract 3: count every RENDERED frame, even paused repaints —
    // if this callback ran, R3F is producing a frame.
    framesRef.current += 1;
    frameHookRef.current?.setAttribute(
      "data-scene-frames",
      String(framesRef.current),
    );

    cameraRef.current = state.camera;

    // Tab hidden (visibilitychange producer in stage-canvas.tsx): freeze
    // everything — frameloop is "never", this only covers a straggler frame.
    if (sceneBridge.paused) return;

    const dt = Math.min(rawDelta, MAX_DT_S);
    // Wall-clock delta for the convergence exponentials — see MAX_DT_S note.
    const dtSettle = Math.min(rawDelta, MAX_SETTLE_DT_S);
    elapsedRef.current += dt;
    const elapsed = elapsedRef.current;

    // Runtime ladder (§6.3): halve pool once + clamp dpr to 1, latched.
    if (monitorRef.current.sample(rawDelta)) {
      engine.halvePool(graph.nodeCount);
      nodeGeometry.setDrawRange(0, engine.activeCount);
      state.setDpr(1);
    }

    // Theme colors come from the cached ref — refreshed only by the
    // observeThemeColors subscription above, never per frame.
    const { muted, border, accent, foreground } = colorsRef.current;

    // --- D-09 entrance state machine (verbatim from constellation.tsx) -----
    const entrance = entranceRef.current;
    if (entrance.phase === "waiting-boot") {
      if (sceneBridge.introBeatAt > 0) {
        entrance.phase = "assembling";
        entrance.phaseStartedAt = elapsed;
      } else if (elapsed > BOOT_WATCHDOG_S) {
        entrance.phase = "fading";
        entrance.phaseStartedAt = elapsed;
      }
    } else if (entrance.phaseStartedAt === null) {
      entrance.phaseStartedAt = elapsed;
    }

    let revealNode = 1;
    let revealEdge = 1;
    let flashBlend = 0;

    if (entrance.phase === "waiting-boot") {
      revealNode = 0;
      revealEdge = 0;
    } else if (entrance.phase === "assembling") {
      const t = clamp01(
        (elapsed - (entrance.phaseStartedAt ?? elapsed)) / assembleDurationS,
      );
      revealNode = easeOutCubic(clamp01(t / 0.4));
      revealEdge = easeOutCubic(clamp01((t - 0.4) / 0.6));
      flashBlend = 1 - clamp01(t / ASSEMBLE_FLASH_FRACTION);
      if (t >= 1) entrance.phase = "settled";
    } else if (entrance.phase === "fading") {
      const t = clamp01(
        (elapsed - (entrance.phaseStartedAt ?? elapsed)) / FADE_DURATION_S,
      );
      revealNode = t;
      revealEdge = t;
      if (t >= 1) entrance.phase = "settled";
    }

    // --- 2. Engine step: pool lerp, morph stagger, scatter, turbulence ------
    const posAttr = nodeGeometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const engineResult = engine.step(dtSettle, elapsed, positions, intensity);
    const wConst = engineResult.constellationWeight;

    // D-09 is hero furniture: if the visitor scrolls away mid-boot (the field
    // has morphed off the constellation), do NOT keep the demand loop awake
    // holding for the boot beat / staging the assemble — degrade to the plain
    // fade, resumed from the current reveal level so nothing pops. Bounded at
    // FADE_DURATION_S, which keeps the one-shot boot cost inside R1's 1500 ms
    // settle window (§7) even for a deep scroll during boot. Takes effect on
    // the next frame — this frame's reveal values are already computed.
    if (
      wConst < 0.5 &&
      (entrance.phase === "waiting-boot" || entrance.phase === "assembling")
    ) {
      entrance.phase = "fading";
      entrance.phaseStartedAt = elapsed - revealNode * FADE_DURATION_S;
    }

    // --- 3. Scroll-offset group transform (§3 global rule) ------------------
    const wpp = engine.worldPerPixel;
    if (groupRef.current) {
      groupRef.current.position.y = sceneBridge.scrollY * wpp;
    }

    // --- 4. Camera spline over smoothed pageProgress ------------------------
    let cameraSettling = false;
    {
      const target = clamp01(sceneBridge.pageProgress);
      const diff = target - smoothedProgressRef.current;
      if (Math.abs(diff) > CAMERA_EPS) {
        smoothedProgressRef.current +=
          diff * Math.min(1, dtSettle * CAMERA_SMOOTH_RATE);
        cameraSettling = true;
      } else if (diff !== 0) {
        smoothedProgressRef.current = target; // snap — stop invalidating (§6.3)
      }
      cameraSpline.getPointAt(smoothedProgressRef.current, cameraPosRef.current);
      state.camera.position.copy(cameraPosRef.current);
      lookTargetRef.current.lerp(
        // Slight counter-look keeps the field pivoting around the viewport
        // center instead of sliding with the dolly.
        hitLookTarget.set(
          cameraPosRef.current.x * 0.3,
          cameraPosRef.current.y * 0.3,
          0,
        ),
        Math.min(1, dtSettle * CAMERA_SMOOTH_RATE),
      );
      state.camera.lookAt(lookTargetRef.current);
    }

    // --- 5. Pointer attraction/illumination on the graph nodes (D-06) -------
    const colorAttr = nodeGeometry.getAttribute(
      "color",
    ) as THREE.BufferAttribute;
    const colors = colorAttr.array as Float32Array;
    const pointer = sceneBridge.pointer;
    const pointerActive = pointer.active && wConst > 0;
    const pointerRadius = POINTER_RADIUS_PX * wpp;
    const pointerMaxPull = POINTER_MAX_DISPLACEMENT_PX * wpp;
    // Pointer coords are on the z=0 plane in CAMERA view space; the group is
    // scroll-translated, so compare against the rendered (translated) y.
    const groupY = groupRef.current?.position.y ?? 0;

    // --- 6. Colors: border→muted ramp × intensity, flash, pointer blend -----
    const flash = flashBlend * wConst;
    for (let i = 0; i < engine.activeCount; i += 1) {
      const p = i * 3;
      const isGraphNode = i < graph.nodeCount;

      let pointerBlend = 0;
      if (pointerActive && isGraphNode) {
        const dx = positions[p] - pointer.x;
        const dy = positions[p + 1] + groupY - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < pointerRadius) {
          const influence = (1 - dist / pointerRadius) * wConst;
          const pull = influence * pointerMaxPull;
          const invDist = dist > 0.0001 ? 1 / dist : 0;
          positions[p] -= dx * invDist * pull;
          positions[p + 1] -= dy * invDist * pull;
          pointerBlend = influence * POINTER_MAX_BLEND;
        }
      }

      // border→muted by per-particle intensity (deep dust ≈ border ≈ invisible
      // against the page on both themes), then flash→foreground, then
      // pointer→accent — mirrors the shipped color pipeline.
      const level = intensity[i];
      let r = border.r + (muted.r - border.r) * level;
      let g = border.g + (muted.g - border.g) * level;
      let b = border.b + (muted.b - border.b) * level;
      if (flash > 0) {
        r += (foreground.r - r) * flash;
        g += (foreground.g - g) * flash;
        b += (foreground.b - b) * flash;
      }
      if (pointerBlend > 0) {
        r += (accent.r - r) * pointerBlend;
        g += (accent.g - g) * pointerBlend;
        b += (accent.b - b) * pointerBlend;
      }
      colors[p] = r;
      colors[p + 1] = g;
      colors[p + 2] = b;
    }
    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    // --- Message pulses (D-03/D-04), constellation-weighted -----------------
    const pulses = pulsesRef.current;
    for (let i = pulses.length - 1; i >= 0; i -= 1) {
      const pulse = pulses[i];
      if (pulse && elapsed - pulse.startedAt >= pulseDurationS) {
        pulses.splice(i, 1);
      }
    }
    if (
      entrance.phase === "settled" &&
      wConst > PULSE_MIN_CONSTELLATION_WEIGHT &&
      // Spawns ride the hero/contact ambient frames ONLY — otherwise a pulse
      // chain would keep the demand loop awake mid-page (R1 leak guard).
      sceneBridge.ambientVisible &&
      pulses.length < MAX_PULSES &&
      elapsed >= nextSpawnAtRef.current
    ) {
      const edgeIndex = Math.floor(
        randomInRange(spawnSeedRef.current, 0, 1) * graph.edgeCount,
      );
      spawnSeedRef.current += 1;
      pulses.push({ edgeIndex, startedAt: elapsed });
      nextSpawnAtRef.current =
        elapsed +
        randomInRange(spawnSeedRef.current, PULSE_MIN_GAP_S, PULSE_MAX_GAP_S);
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
      const nodeA = graph.edges[pulse.edgeIndex * 2] ?? 0;
      const nodeB = graph.edges[pulse.edgeIndex * 2 + 1] ?? 0;
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

    // --- Material opacities (token-driven, formation/entrance-modulated) ----
    const formationOpacity = engineResult.opacity;
    if (nodeMaterialRef.current) {
      nodeMaterialRef.current.opacity =
        RESTING_NODE_OPACITY * revealNode * formationOpacity;
    }
    if (edgeMaterialRef.current) {
      // Edge-first dissolve (§3): edges are constellation furniture — they
      // fade with a steeper curve than the points as the field morphs away.
      edgeMaterialRef.current.opacity =
        RESTING_EDGE_OPACITY * revealEdge * formationOpacity * wConst * wConst;
      edgeMaterialRef.current.color.copy(border);
    }
    if (pulseDotMaterialRef.current) {
      pulseDotMaterialRef.current.color.copy(accent);
      pulseDotMaterialRef.current.opacity = revealNode * formationOpacity * wConst;
    }
    if (pulseTrailMaterialRef.current) {
      pulseTrailMaterialRef.current.color.copy(accent);
      pulseTrailMaterialRef.current.opacity =
        pulses.length > 0
          ? 0.6 * (1 - newestProgress) * revealNode * formationOpacity * wConst
          : 0;
    }

    // --- 7. Demand-loop settling (§6.3 leak guard) ---------------------------
    const needsFrame =
      engineResult.needsFrame ||
      entrance.phase !== "settled" ||
      cameraSettling ||
      pulses.length > 0;
    if (needsFrame) state.invalidate();
  });

  return (
    <group ref={groupRef}>
      <points geometry={nodeGeometry} frustumCulled={false}>
        <pointsMaterial
          ref={nodeMaterialRef}
          vertexColors
          size={tier === "mobile" ? 0.05 : 0.065}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
        />
      </points>
      <lineSegments geometry={edgeGeometry} frustumCulled={false}>
        <lineBasicMaterial
          ref={edgeMaterialRef}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>
      <points geometry={pulseGeometries.dotGeo} frustumCulled={false}>
        <pointsMaterial
          ref={pulseDotMaterialRef}
          size={tier === "mobile" ? 0.07 : 0.09}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
        />
      </points>
      <lineSegments geometry={pulseGeometries.trailGeo} frustumCulled={false}>
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

// Scratch vector for the per-frame lookAt lerp target — module-scope so the
// frame body never allocates (§3 "Nothing allocates per frame").
const hitLookTarget = new THREE.Vector3();
