"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type {
  Group,
  Points,
  LineSegments,
  PointsMaterial,
  LineBasicMaterial,
} from "three";
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
 * D-05 scroll-linked exit, D-06 pointer influence, D-08 atmospheric
 * composition, D-09 boot-beat entrance). ALL temporal behavior lives in a
 * SINGLE `useFrame((state, delta) => ...)` loop that mutates BufferGeometry
 * attributes directly and sets `needsUpdate` — never React state per frame
 * (RESEARCH Anti-Patterns / R3F pitfalls.mdx). The loop early-returns
 * whole-sale when `sceneBridge.paused` (D-05 scroll-exit / tab-hidden, wired
 * by constellation-canvas.tsx).
 *
 * Rendering technique: nodes and edges SHARE one `position` BufferAttribute
 * (edges reference it via `setIndex`), so a single per-frame drift/pointer
 * mutation updates both point and line geometry in one pass. Node color uses
 * a per-vertex `color` attribute driving BOTH the D-09 boot-flash (foreground
 * -> muted) and the D-06 pointer-illumination blend (muted -> accent, capped
 * 60%) — computed once per node per frame, no per-node Color allocations.
 *
 * D-09 entrance (two cases, RESEARCH Pattern 4): if the DOM motion stack is
 * up (pointer:fine) and the hero-intro GSAP timeline has not yet signaled
 * completion (`sceneBridge.introBeatAt === 0`), the scene waits, invisible,
 * then assembles over `--motion-duration-chapter` (~1200ms) the instant the
 * handshake fires — a global two-phase reveal (nodes fade in 0-40% of the
 * beat, edges draw 40-100%) approximating "clusters wake sequentially"
 * without a second draw call per cluster (a deliberate scope simplification,
 * see 04-04 SUMMARY). Otherwise (chunk arrived late, or touch/no motion
 * stack) it runs the graceful 800ms fallback ramp instead — no second GSAP
 * timeline, no replayed intro (D-09).
 *
 * D-05 exit: `sceneBridge.scrollProgress` (written by constellation-canvas's
 * ScrollTrigger/scroll-listener producers) drives recede (-z, ~10% scale
 * down) and dissolve (opacity -> 0) on the wrapping group + all materials.
 *
 * D-06 pointer: a document-level `pointermove` listener — installed ONLY
 * when `pointer: fine` (a no-op on touch/keyboard) — unprojects the cursor
 * onto the scene's z=0 plane and writes `sceneBridge.pointer`. Nodes within
 * a 120-screen-px radius attract (<=10px) and illuminate (muted->accent,
 * <=60% blend).
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
const PX_PER_WORLD_UNIT = 120.7;
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

// D-09 entrance timings.
const ASSEMBLE_FLASH_FRACTION = 0.25; // <=300ms of the ~1200ms beat (UI-SPEC)
const FADE_DURATION_S = 0.8; // late-load graceful ramp — canvas-internal, not a DOM token
const BOOT_WATCHDOG_S = 3; // defensive: never wait forever for a handshake that won't come

// D-05 exit.
const RECEDE_DEPTH = 1.5; // world units
const EXIT_SCALE_REDUCTION = 0.1; // ~10% scale down at full exit

// D-06 pointer influence — 120 screen px radius, <=10px displacement, <=60% blend.
const POINTER_RADIUS_WORLD = 120 / PX_PER_WORLD_UNIT;
const POINTER_MAX_DISPLACEMENT_WORLD = 10 / PX_PER_WORLD_UNIT;
const POINTER_MAX_BLEND = 0.6;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(t: number): number {
  const inv = 1 - t;
  return 1 - inv * inv * inv;
}

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

type EntrancePhase = "waiting-boot" | "assembling" | "fading" | "settled";

interface EntranceState {
  phase: EntrancePhase;
  /** elapsed-seconds clock value when the current phase began (null = not yet stamped) */
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
  // Chunk arrived after the intro finished, OR the motion stack never ran
  // (capable phone) — graceful fallback ramp, never a replayed intro (D-09).
  return { phase: "fading", phaseStartedAt: null };
}

type ConstellationProps = {
  tier: ConstellationTier;
};

export function Constellation({ tier }: ConstellationProps) {
  const { camera } = useThree();
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

  const groupRef = useRef<Group>(null);
  const nodeMaterialRef = useRef<PointsMaterial>(null);
  const edgeMaterialRef = useRef<LineBasicMaterial>(null);
  const pulseDotMaterialRef = useRef<PointsMaterial>(null);
  const pulseTrailMaterialRef = useRef<LineBasicMaterial>(null);
  const pulseDotsRef = useRef<Points>(null);
  const pulseTrailRef = useRef<LineSegments>(null);

  // Theme colors: read once synchronously (client-only chunk, safe) and kept
  // in a ref — re-read every frame below, so a theme flip is picked up for
  // free without any extra subscription/effect.
  const colorsRef = useRef<SceneColors>(resolveSceneColors());

  const elapsedRef = useRef(0);
  const pulsesRef = useRef<ActivePulse[]>([]);
  const nextSpawnAtRef = useRef(randomInRange(1, 0.5, PULSE_MAX_GAP_S));
  const spawnSeedRef = useRef(1);
  const entranceRef = useRef<EntranceState>(computeInitialEntrance());

  const pulseDurationS = useMemo(
    () => getMotionToken("--motion-duration-slow"), // UI-SPEC's stated reference value
    [],
  );
  const assembleDurationS = useMemo(
    () => getMotionToken("--motion-duration-chapter"), // ~1200ms boot-beat
    [],
  );

  // D-06 pointer influence — pointer:fine ONLY (no-op on touch/keyboard: the
  // listener is simply never installed there, RESEARCH Pitfall 7/D-06). The
  // canvas layer itself stays pointer-events-none (WOW-04) — this reads a
  // DOCUMENT-level listener, never canvas pointer events.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (!window.matchMedia("(pointer: fine)").matches) return undefined;

    const raycaster = new THREE.Raycaster();
    const scenePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();

    const handlePointerMove = (event: PointerEvent): void => {
      ndc.x = (event.clientX / window.innerWidth) * 2 - 1;
      ndc.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(scenePlane, hit)) {
        sceneBridge.pointer.x = hit.x;
        sceneBridge.pointer.y = hit.y;
        sceneBridge.pointer.active = true;
      }
    };
    const handlePointerLeave = (): void => {
      sceneBridge.pointer.active = false;
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerleave", handlePointerLeave);
      sceneBridge.pointer.active = false;
    };
  }, [camera]);

  useFrame((_state, delta) => {
    // D-05 (also tab-hidden): freeze everything, GPU work zero.
    if (sceneBridge.paused) return;

    // Refresh theme colors every frame (cheap; re-resolves on a theme flip
    // without a dedicated subscription — RESEARCH Pattern 5).
    colorsRef.current = resolveSceneColors();
    const { muted, border, accent, foreground } = colorsRef.current;

    elapsedRef.current += delta;
    const elapsed = elapsedRef.current;

    // --- D-09 entrance state machine ---------------------------------------
    const entrance = entranceRef.current;
    if (entrance.phase === "waiting-boot") {
      if (sceneBridge.introBeatAt > 0) {
        entrance.phase = "assembling";
        entrance.phaseStartedAt = elapsed;
      } else if (elapsed > BOOT_WATCHDOG_S) {
        // Defensive: the handshake should have fired by now — don't wait forever.
        entrance.phase = "fading";
        entrance.phaseStartedAt = elapsed;
      }
    } else if (entrance.phaseStartedAt === null) {
      entrance.phaseStartedAt = elapsed; // lazily stamp fading/assembling start
    }

    let revealNode = 1;
    let revealEdge = 1;
    let flashBlend = 0; // 1 = full boot-flash (foreground), 0 = settled (muted)

    if (entrance.phase === "waiting-boot") {
      revealNode = 0;
      revealEdge = 0;
    } else if (entrance.phase === "assembling") {
      const t = clamp01(
        (elapsed - (entrance.phaseStartedAt ?? elapsed)) / assembleDurationS,
      );
      // Two-phase reveal approximating "clusters wake, then edges draw"
      // (see file header — a deliberate single-draw-call simplification).
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

    // --- D-05 exit: recede + dissolve mapped to scroll progress ------------
    const progress = clamp01(sceneBridge.scrollProgress);
    const dissolve = 1 - easeOutCubic(progress);
    if (groupRef.current) {
      groupRef.current.position.z = -progress * RECEDE_DEPTH;
      const scale = 1 - EXIT_SCALE_REDUCTION * progress;
      groupRef.current.scale.setScalar(scale);
    }

    const posAttr = nodeGeometry.getAttribute("position") as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const colorAttr = nodeGeometry.getAttribute("color") as THREE.BufferAttribute;
    const colors = colorAttr.array as Float32Array;

    const pointer = sceneBridge.pointer;
    const baseR = muted.r + (foreground.r - muted.r) * flashBlend;
    const baseG = muted.g + (foreground.g - muted.g) * flashBlend;
    const baseB = muted.b + (foreground.b - muted.b) * flashBlend;

    // --- Drift (D-04) + pointer attraction/illumination (D-06) -------------
    for (let i = 0; i < data.nodeCount; i += 1) {
      const p = driftParams[i];
      const hx = homePositions[i * 3];
      const hy = homePositions[i * 3 + 1];
      const hz = homePositions[i * 3 + 2];
      let x = hx + p.ampX * Math.sin(elapsed * p.wx + p.phaseX);
      let y = hy + p.ampY * Math.sin(elapsed * p.wy + p.phaseY);
      const z = hz + p.ampZ * Math.sin(elapsed * p.wz + p.phaseZ);

      let pointerBlend = 0;
      if (pointer.active) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < POINTER_RADIUS_WORLD) {
          const influence = 1 - dist / POINTER_RADIUS_WORLD;
          const pull = influence * POINTER_MAX_DISPLACEMENT_WORLD;
          const invDist = dist > 0.0001 ? 1 / dist : 0;
          x -= dx * invDist * pull;
          y -= dy * invDist * pull;
          pointerBlend = influence * POINTER_MAX_BLEND;
        }
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      colors[i * 3] = baseR + (accent.r - baseR) * pointerBlend;
      colors[i * 3 + 1] = baseG + (accent.g - baseG) * pointerBlend;
      colors[i * 3 + 2] = baseB + (accent.b - baseB) * pointerBlend;
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
    if (
      entrance.phase === "settled" &&
      pulses.length < MAX_PULSES &&
      elapsed >= nextSpawnAtRef.current
    ) {
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

    // --- Material colors/opacity (token-driven, entrance/exit-modulated) ----
    if (nodeMaterialRef.current) {
      nodeMaterialRef.current.opacity = RESTING_NODE_OPACITY * revealNode * dissolve;
    }
    if (edgeMaterialRef.current) {
      edgeMaterialRef.current.opacity = RESTING_EDGE_OPACITY * revealEdge * dissolve;
      edgeMaterialRef.current.color.copy(border);
    }
    if (pulseDotMaterialRef.current) {
      pulseDotMaterialRef.current.color.copy(accent);
      pulseDotMaterialRef.current.opacity = revealNode * dissolve;
    }
    if (pulseTrailMaterialRef.current) {
      // Trailing glow fades to 0 toward the end of the pulse's travel (D-04).
      pulseTrailMaterialRef.current.color.copy(accent);
      pulseTrailMaterialRef.current.opacity =
        pulses.length > 0 ? 0.6 * (1 - newestProgress) * revealNode * dissolve : 0;
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={nodeGeometry}>
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
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial
          ref={edgeMaterialRef}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>
      <points ref={pulseDotsRef} geometry={pulseGeometries.dotGeo}>
        <pointsMaterial
          ref={pulseDotMaterialRef}
          size={tier === "mobile" ? 0.07 : 0.09}
          sizeAttenuation
          transparent
          opacity={0}
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
