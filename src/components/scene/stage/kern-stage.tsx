"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

import type { SceneTier } from "@/lib/capability";
import {
  observeThemeColors,
  resolveSceneColors,
  type SceneColors,
} from "@/lib/theme-color-resolver";
import { sceneBridge, type FormationId } from "../scene-bridge";
import {
  FLOATS_PER_SHARD,
  POOL,
  POS_SETTLE_EPS,
  type KernEngineInputs,
  type KernTargets,
} from "./kern-types";
import { KernEngine, type TargetResolver } from "./kern-engine";
import { buildKernTargets } from "./kern-formations";
import { buildPrism, buildPrismLOD } from "./kern-geometry";
import { CameraRig } from "./camera-rig";
import { STAGE_CAMERA } from "./camera";
import { createFrameMonitor } from "./frame-monitor";
import { buildKernSkin, type KernSkin } from "./kern-skin";
import { measureLayout } from "./measure";
import type { MeasuredLayout } from "./stage-types";

/**
 * The KERN stage interior (SOLID-3D v2 WP-D; DESIGN-SPEC §2.4, §7.3-§7.4) —
 * replaces `particle-stage.tsx`. ONE persistent canvas, TWO render objects (the
 * 384-instance shard `InstancedMesh` + the hero morph-skin), ONE `useFrame`
 * carrying the five CONTENT-AGNOSTIC obligations verbatim in behavior from the
 * v1 loop (§2.4):
 *
 *   1. `data-scene-frames` increment via setAttribute per RENDERED frame (never
 *      React state) — the falsifiable at-rest counter (Contract 3, R1/R2/R3).
 *   2. `bridge.paused` early-return (tab hidden; frameloop is already "never").
 *   3. frame-monitor sampling + one-way degrade rung (§7.4): latch → setDpr(1)
 *      → disable skin → swap the chamfered prism for the pre-built 8-tri LOD.
 *   4. `group.position.y = scrollY * worldPerPixel` — the single doc-space
 *      scroll compensation (§3 global rule; targets are y-up doc-anchored).
 *   5. camera-rig update (Weltlinie drift) + end-of-frame CONDITIONAL
 *      `state.invalidate()` only while the composite needsFrame holds (R1).
 *
 * Everything temporal is a PURE FUNCTION of the bridge numbers read here (D-08:
 * GSAP/DOM writes the bridge, `useFrame` reads it) → engine.step() → matrices.
 * The engine (WP-B) owns the shard pos/quat/scale/colorMix convergence, the
 * vortex transition and the velocity tumble; its `needsFrame` covers ONLY those.
 * WP-D layers the presentation overlays the engine has no branch for — camera
 * rig, hero skin + dissolve, D-06 pointer pull, bento `hoverRect` lift, the
 * boot/entrance beat, the IO-gated ambient bob — and ORs their settle terms
 * into the composite needsFrame (§2.4). The ambient bob rides the EXISTING
 * hero/contact IO rAF pump (stage-canvas) and is deliberately NOT a needsFrame
 * term, so it can never keep the demand loop awake mid-page (R1/R2).
 *
 * Nothing allocates per frame: every scratch three object + the persistent
 * `out`/`inputs` buffers live in refs/useMemo; the frame body is index math +
 * in-place three ops.
 */

// --- Delta caps (v1 parity; see particle-stage.tsx header) --------------------
/** Elapsed-accumulation clamp — drift/pulse phases must not teleport after idle. */
const MAX_DT_S = 0.25;
/** Wall-clock cap for the convergence exponentials (a big dt just COMPLETES). */
const MAX_SETTLE_DT_S = 2;

// --- D-06 pointer influence (v1 numbers, converted via live worldPerPixel) ----
const POINTER_RADIUS_PX = 120;
const POINTER_MAX_DISPLACEMENT_PX = 10;
const POINTER_MAX_BLEND = 0.6;

// --- D-09 boot / entrance beat (verbatim timings) -----------------------------
const BOOT_WATCHDOG_S = 3;
/** Assemble (fly-in from scatter) duration bound — also the mid-boot degrade cap. */
const ASSEMBLE_DURATION_S = 1.2;
/** Fraction of the assemble spent flashing toward --foreground. */
const ASSEMBLE_FLASH_FRACTION = 0.25;

// --- Ambient bob (§3 #hero/#contact; rides the IO pump, R2) -------------------
/** Tiny world-space bob amplitude — reads as breathing, never as travel. */
const BOB_AMPLITUDE = 0.03;
/** Bob angular frequency (rad/s). */
const BOB_FREQ = 1.1;
/** Skin breathing influence ceiling (morph target 0) while hero is in view. */
const SKIN_BREATHE_MAX = 0.6;

// --- Bento hover lift (§3 #projects; self-terminating, epsilon-snapped) -------
const HOVER_LIFT_Z = 0.15;
const HOVER_RATE = 8;
const HOVER_ACCENT_BLEND = 0.7;

// --- Hero skin dissolve ease (§2.4 uDissolve ∉ {0,1} needsFrame term) ---------
const SKIN_DISSOLVE_RATE = 4;
const SKIN_DISSOLVE_EPS = 0.01;
/** Pointer proximity radius (world) that drives the skin's agitated morph. */
const SKIN_POINTER_RADIUS = 2.2;

// --- Directional light strength per tier (the only use of `tier`) -------------
const DIR_LIGHT_INTENSITY: Record<Exclude<SceneTier, "none">, number> = {
  mobile: 0.95,
  desktop: 1.15,
};

// --- Stride field offsets (per shard i, base o = i * FLOATS_PER_SHARD) ---------
const PX = 0;
const PY = 1;
const PZ = 2;
const QX = 3;
const QY = 4;
const QZ = 5;
const QW = 6;
const SCALE = 7;
const COLOR_MIX = 8;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(t: number): number {
  const inv = 1 - t;
  return 1 - inv * inv * inv;
}

/**
 * Live layout store (module scope, mirroring v1 `formation-engine.setStageLayout`).
 * WP-F points `useMeasuredLayout`'s `onLayout` at `setKernLayout`, so the single
 * shipped measurement lifecycle (fonts.ready → idle slices → resize → per-route
 * re-measure → Contract-4 heatmap writer) stays in stage-canvas and feeds the
 * KERN target cache here. A publish bumps the version (the resolver rebuilds all
 * cached formations on the next read) and pokes the demand loop ONCE — the
 * enumerated one-shot layout invalidation source (§2.4), never a rest leak.
 */
let currentLayout: MeasuredLayout | null = null;
let layoutVersion = 0;

export function setKernLayout(layout: MeasuredLayout): void {
  currentLayout = layout;
  layoutVersion += 1;
  sceneBridge.invalidate();
}

/** Interim layout before the first publish — one synchronous DOM read (v1 parity). */
function getLayout(): MeasuredLayout {
  if (currentLayout === null) {
    currentLayout = measureLayout(STAGE_CAMERA);
    layoutVersion += 1;
  }
  return currentLayout;
}

type EntrancePhase = "waiting-boot" | "assembling" | "settled";

interface EntranceState {
  phase: EntrancePhase;
  startedAt: number | null;
}

/** D-09: decide the entrance case once, at mount (fly-in only on the boot path). */
function computeInitialEntrance(): EntranceState {
  const pointerFine =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches;
  if (pointerFine && sceneBridge.introBeatAt === 0) {
    return { phase: "waiting-boot", startedAt: null };
  }
  return { phase: "settled", startedAt: null };
}

/** Idle-slice scheduler for the geometry builds (§7.3), mirroring measure.ts. */
function scheduleIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, { timeout: 200 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, 32);
  return () => window.clearTimeout(id);
}

type KernStageProps = {
  tier: Exclude<SceneTier, "none">;
  /** The Contract-3 wrapper node — receives the data-scene-frames counter. */
  frameHookRef: React.RefObject<HTMLDivElement | null>;
};

export function KernStage({ tier, frameHookRef }: KernStageProps) {
  // --- Per-layout-version target cache (STABLE ref per (id, version)) ---------
  // The engine's `sameTargets = fromTargets === toTargets` fast path relies on
  // reference identity, so a given (id, version) must always return the SAME
  // object. On a version bump the current cache becomes `prev` (passed to the
  // builder for quat hemisphere-continuity across re-measures), a fresh cache
  // is started, and `.version` is re-stamped (WP-C builders stamp 0).
  const cacheRef = useRef(new Map<FormationId, KernTargets>());
  const prevCacheRef = useRef(new Map<FormationId, KernTargets>());
  const cacheVersionRef = useRef(-1);

  const resolve = useCallback<TargetResolver>((id) => {
    const layout = getLayout();
    if (cacheVersionRef.current !== layoutVersion) {
      prevCacheRef.current = cacheRef.current;
      cacheRef.current = new Map();
      cacheVersionRef.current = layoutVersion;
    }
    let targets = cacheRef.current.get(id);
    if (!targets) {
      targets = buildKernTargets(id, layout, prevCacheRef.current.get(id) ?? null);
      targets.version = layoutVersion;
      cacheRef.current.set(id, targets);
    }
    return targets;
  }, []);

  const engine = useMemo(() => new KernEngine(resolve), [resolve]);

  // Persistent buffers — reused every frame (velocity write-back needs the SAME
  // inputs object, §2.1; `out` is the caller-owned upload buffer).
  const out = useMemo(() => new Float32Array(POOL * FLOATS_PER_SHARD), []);
  const inputsRef = useRef<KernEngineInputs>({
    formation: null,
    routeFormation: "constellation",
    transitionT: 0,
    scrollVelocity: 0,
    sectionProgress: 0,
    hoverRect: null,
    pointer: { x: 0, y: 0, active: false },
    heatmapLevels: null,
  });

  // Geometry (idle-sliced, §7.3) + the imperatively-built meshes. Both prisms
  // are kept alive so the degrade rung can reassign geometry allocation-free.
  const prismRef = useRef<THREE.BufferGeometry | null>(null);
  const lodPrismRef = useRef<THREE.BufferGeometry | null>(null);
  const [shardMesh, setShardMesh] = useState<THREE.InstancedMesh | null>(null);
  const [skin, setSkin] = useState<KernSkin | null>(null);

  const groupRef = useRef<Group>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const cameraRig = useMemo(() => new CameraRig(), []);
  const monitorRef = useRef(createFrameMonitor());
  const degradedRef = useRef(false);

  // Theme colors: resolved once, then kept fresh by the subscription (resolving
  // per frame would allocate Colors + parse CSS right after the counter write).
  const colorsRef = useRef<SceneColors>(resolveSceneColors());

  const elapsedRef = useRef(0);
  const framesRef = useRef(0);
  const entranceRef = useRef<EntranceState>(computeInitialEntrance());
  const hoverLiftRef = useRef(0);
  const hoverRectWorldRef = useRef<{
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } | null>(null);

  // Scratch three objects — the ONLY per-frame three touches (zero allocation).
  const scratch = useMemo(
    () => ({
      matrix: new THREE.Matrix4(),
      pos: new THREE.Vector3(),
      quat: new THREE.Quaternion(),
      scaleVec: new THREE.Vector3(),
      color: new THREE.Color(),
    }),
    [],
  );

  // --- Idle-sliced init (§7.3): prism → LOD prism → skin, then teardown -------
  // One effect owns the whole lifecycle so disposal reads closure-captured
  // locals on UNMOUNT ONLY — never on a state change (disposing the live shard
  // mesh the moment the skin arrives would be a use-after-free).
  useEffect(() => {
    let disposed = false;
    let builtMesh: THREE.InstancedMesh | null = null;
    let builtSkin: KernSkin | null = null;
    const material = new THREE.MeshLambertMaterial();
    const cancels: Array<() => void> = [];

    const buildSkinSlice = (): void => {
      if (disposed) return;
      builtSkin = buildKernSkin(colorsRef.current);
      setSkin(builtSkin);
    };
    const buildLodSlice = (): void => {
      if (disposed) return;
      lodPrismRef.current = buildPrismLOD();
      cancels.push(scheduleIdle(buildSkinSlice));
    };
    const buildPrismSlice = (): void => {
      if (disposed) return;
      const prism = buildPrism();
      prismRef.current = prism;
      const mesh = new THREE.InstancedMesh(prism, material, POOL);
      mesh.frustumCulled = false;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      // Seed instanceColor so the buffer exists before the first setColorAt.
      for (let i = 0; i < POOL; i += 1) mesh.setColorAt(i, scratch.color.setRGB(1, 1, 1));
      builtMesh = mesh;
      setShardMesh(mesh);
      cancels.push(scheduleIdle(buildLodSlice));
    };
    cancels.push(scheduleIdle(buildPrismSlice));

    return () => {
      disposed = true;
      cancels.forEach((cancel) => cancel());
      builtMesh?.dispose();
      builtSkin?.dispose();
      prismRef.current?.dispose();
      lodPrismRef.current?.dispose();
      material.dispose();
    };
  }, [scratch]);

  // Theme flip → refresh cached colors + repaint the skin + poke the loop once
  // (RESEARCH Pattern 5): a flip at rest still repaints under frameloop="demand".
  useEffect(
    () =>
      observeThemeColors((colors) => {
        colorsRef.current = colors;
        skin?.setColors(colors);
        sceneBridge.invalidate();
      }),
    [skin],
  );

  // D-06 pointer producer — pointer:fine ONLY, document-level, unproject against
  // the LIVE camera (captured in the frame loop). Each move is an enumerated
  // invalidation source (§2.4); the canvas stays pointer-events-none.
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
    // 1. Contract 3: count every RENDERED frame (even paused repaints) — if this
    // callback ran, R3F produced a frame. Never React state (D-08).
    framesRef.current += 1;
    frameHookRef.current?.setAttribute(
      "data-scene-frames",
      String(framesRef.current),
    );
    cameraRef.current = state.camera;

    // 2. Tab hidden (visibilitychange producer): freeze — frameloop is "never".
    if (sceneBridge.paused) return;

    const dt = Math.min(rawDelta, MAX_DT_S);
    const dtSettle = Math.min(rawDelta, MAX_SETTLE_DT_S);
    elapsedRef.current += dt;
    const elapsed = elapsedRef.current;

    // 3. Degrade rung (§7.4), latched once, allocation-free mid-frame.
    if (!degradedRef.current && monitorRef.current.sample(rawDelta)) {
      degradedRef.current = true;
      state.setDpr(1); // (1) the real fill-rate win
      if (skin) skin.mesh.visible = false; // (2) drop the second draw call
      const lod = lodPrismRef.current; // (3) cosmetic LOD swap
      if (lod && shardMesh) shardMesh.geometry = lod;
    }

    // --- Build the frozen engine inputs from the bridge (reused object) -------
    const inputs = inputsRef.current;
    const transition = sceneBridge.transition;
    const routeTransitionT =
      transition.phase === "idle" ? 0 : clamp01(transition.t);

    // --- Entrance beat: fly-in from seeded scatter, driven via transitionT ----
    const entrance = entranceRef.current;
    if (entrance.phase === "waiting-boot") {
      if (sceneBridge.introBeatAt > 0) {
        entrance.phase = "assembling";
        entrance.startedAt = elapsed;
      } else if (elapsed > BOOT_WATCHDOG_S) {
        entrance.phase = "assembling";
        entrance.startedAt = elapsed;
      }
    }
    let entranceScatter = 0;
    let flashBlend = 0;
    if (entrance.phase === "waiting-boot") {
      entranceScatter = 1; // held scattered until the boot beat / watchdog
    } else if (entrance.phase === "assembling") {
      const k = clamp01((elapsed - (entrance.startedAt ?? elapsed)) / ASSEMBLE_DURATION_S);
      entranceScatter = 1 - easeOutCubic(k);
      flashBlend = 1 - clamp01(k / ASSEMBLE_FLASH_FRACTION);
      if (k >= 1) entrance.phase = "settled";
    }
    // Scroll-away short-circuit (v1 parity): if the field morphs off the
    // monogram mid-boot, drop the held fly-in so the boot can never keep the
    // loop awake past a deep scroll (bounded regardless).
    if (
      entrance.phase !== "settled" &&
      sceneBridge.routeFormation === "constellation" &&
      sceneBridge.formation.to !== "constellation" &&
      sceneBridge.formation.t > 0.5
    ) {
      entrance.phase = "settled";
      entranceScatter = 0;
      flashBlend = 0;
    }

    inputs.formation = sceneBridge.formation; // SAME ref → engine writer arbitration
    inputs.routeFormation = sceneBridge.routeFormation;
    // Boot fly-in and route transition never overlap in practice; take the max
    // so whichever is active drives the engine's vortex scatter (§4, §3 boot).
    inputs.transitionT = Math.max(routeTransitionT, entranceScatter);
    inputs.scrollVelocity = sceneBridge.scrollVelocity;
    inputs.sectionProgress = sceneBridge.sectionProgress;
    inputs.pointer = sceneBridge.pointer;
    inputs.heatmapLevels = sceneBridge.heatmapLevels;
    const bridgeHover = sceneBridge.hoverRect;
    inputs.hoverRect = bridgeHover
      ? {
          left: bridgeHover.x,
          top: bridgeHover.y,
          width: bridgeHover.w,
          height: bridgeHover.h,
        }
      : null;

    // 4. Engine step + velocity write-back (§2.1: the engine decays it in place;
    // WP-D must reflect it back and must NOT separately decay the bridge — that
    // is the exact one-shot-spike leak R1 catches).
    engine.setInputs(inputs);
    engine.step(dtSettle, elapsed, out);
    sceneBridge.scrollVelocity = inputs.scrollVelocity;

    // 5. Doc-space scroll compensation (§3 global rule): the single transform.
    const layout = getLayout();
    const wpp = layout.worldPerPixel;
    const groupY = sceneBridge.scrollY * wpp;
    if (groupRef.current) groupRef.current.position.y = groupY;

    // 6. Camera-rig drift over smoothed pageProgress.
    const cameraSettling = cameraRig.update(
      state.camera,
      sceneBridge.pageProgress,
      dtSettle,
    );

    // --- Hover-lift ease (§3 #projects; self-terminating, epsilon-snapped) ----
    const hoverTarget = bridgeHover ? 1 : 0;
    const hoverDiff = hoverTarget - hoverLiftRef.current;
    let hoverSettling = false;
    if (Math.abs(hoverDiff) > POS_SETTLE_EPS) {
      hoverLiftRef.current += hoverDiff * Math.min(1, dtSettle * HOVER_RATE);
      hoverSettling = true;
    } else {
      hoverLiftRef.current = hoverTarget; // snap — cannot leak frames at rest
    }
    if (bridgeHover) {
      // Cache the hovered rect's WORLD bounds so a cleared hover still decays on
      // the same shards (doc-space frame — no groupY, both are pre-scroll).
      const minX = (bridgeHover.x - layout.viewport.w / 2) * wpp;
      const maxX = (bridgeHover.x + bridgeHover.w - layout.viewport.w / 2) * wpp;
      const topY = (layout.viewport.h / 2 - bridgeHover.y) * wpp;
      const botY = (layout.viewport.h / 2 - (bridgeHover.y + bridgeHover.h)) * wpp;
      hoverRectWorldRef.current = { minX, maxX, minY: botY, maxY: topY };
    }
    const hoverLift = hoverLiftRef.current;
    const hoverRectWorld = hoverRectWorldRef.current;

    // --- Colors + pointer + hero-presence context (v1 pipeline parity) --------
    const { border, muted, accent, foreground } = colorsRef.current;
    const home = sceneBridge.routeFormation === "constellation";
    // Monogram presence: 1 while the field reads as the hero monogram, 0 away.
    // Gated on the home route so the skin/pointer never fire on case-study/legal.
    const f = sceneBridge.formation;
    const presence = home
      ? clamp01(
          (f.from === "constellation" ? 1 - f.t : 0) +
            (f.to === "constellation" ? f.t : 0),
        )
      : 0;
    const pointer = sceneBridge.pointer;
    const pointerActive = pointer.active && presence > 0;
    const pointerRadius = POINTER_RADIUS_PX * wpp;
    const pointerMaxPull = POINTER_MAX_DISPLACEMENT_PX * wpp;
    const ambient = sceneBridge.ambientVisible;
    const flash = flashBlend * presence;

    // --- 8/9. Upload matrices + colors from the engine output -----------------
    if (shardMesh) {
      const { matrix, pos, quat, scaleVec, color } = scratch;
      for (let i = 0; i < POOL; i += 1) {
        const o = i * FLOATS_PER_SHARD;
        let x = out[o + PX];
        let y = out[o + PY];
        let z = out[o + PZ];

        // Ambient bob (§3): tiny elapsed sinusoid, ONLY while #hero/#contact is
        // in view — rides the IO pump, so it is never a needsFrame term (R1/R2).
        if (ambient) y += Math.sin(elapsed * BOB_FREQ + i * 0.7) * BOB_AMPLITUDE;

        // D-06 pointer pull toward the cursor (rendered-space y needs +groupY).
        let pointerBlend = 0;
        if (pointerActive) {
          const dx = x - pointer.x;
          const dy = y + groupY - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < pointerRadius) {
            const influence = (1 - dist / pointerRadius) * presence;
            const invDist = dist > 0.0001 ? 1 / dist : 0;
            const pull = influence * pointerMaxPull;
            x -= dx * invDist * pull;
            y -= dy * invDist * pull;
            pointerBlend = influence * POINTER_MAX_BLEND;
          }
        }

        // Bento hover lift: shards inside the hovered cell rise + blend --accent.
        let accentBlend = pointerBlend;
        if (
          hoverLift > 0 &&
          hoverRectWorld &&
          x >= hoverRectWorld.minX &&
          x <= hoverRectWorld.maxX &&
          y >= hoverRectWorld.minY &&
          y <= hoverRectWorld.maxY
        ) {
          z += HOVER_LIFT_Z * hoverLift;
          accentBlend = Math.max(accentBlend, HOVER_ACCENT_BLEND * hoverLift);
        }

        const s = out[o + SCALE];
        quat.set(out[o + QX], out[o + QY], out[o + QZ], out[o + QW]);
        matrix.compose(pos.set(x, y, z), quat, scaleVec.set(s, s, s));
        shardMesh.setMatrixAt(i, matrix);

        // border→muted by colorMix (deep dust ≈ border ≈ invisible), then
        // flash→foreground (boot), then pointer/hover→accent — v1 color pipeline.
        const mix = out[o + COLOR_MIX];
        let r = border.r + (muted.r - border.r) * mix;
        let g = border.g + (muted.g - border.g) * mix;
        let b = border.b + (muted.b - border.b) * mix;
        if (flash > 0) {
          r += (foreground.r - r) * flash;
          g += (foreground.g - g) * flash;
          b += (foreground.b - b) * flash;
        }
        if (accentBlend > 0) {
          r += (accent.r - r) * accentBlend;
          g += (accent.g - g) * accentBlend;
          b += (accent.b - b) * accentBlend;
        }
        shardMesh.setColorAt(i, color.setRGB(r, g, b));
      }
      shardMesh.instanceMatrix.needsUpdate = true;
      if (shardMesh.instanceColor) shardMesh.instanceColor.needsUpdate = true;
    }

    // --- 10. Hero skin: fit, breathe, agitate, dissolve (§2.2, §3) ------------
    let skinDissolveActive = false;
    if (skin && !degradedRef.current) {
      const hero = layout.sections["hero"];
      if (hero) {
        // Fit the skin inside the monogram (constellation uses 0.7 of the hero
        // min-dimension for the LS silhouette; the skin breathes just within it).
        const fitPx = Math.min(hero.width, hero.height) * 0.7 * 0.45;
        skin.mesh.scale.setScalar(Math.max(fitPx * wpp, 0.001));
        skin.mesh.position.set(
          (hero.left + hero.width / 2 - layout.viewport.w / 2) * wpp,
          (layout.viewport.h / 2 - (hero.top + hero.height / 2)) * wpp,
          0,
        );
      }

      // uDissolve target: solid only while the monogram is present and no
      // transition is running; fully dissolved when leaving home / off-hero.
      const dissolveTarget =
        !home || routeTransitionT > 0 ? 1 : clamp01(1 - presence);
      const d = skin.dissolve.uDissolve;
      const dDiff = dissolveTarget - d.value;
      if (Math.abs(dDiff) > SKIN_DISSOLVE_EPS) {
        d.value += dDiff * Math.min(1, dtSettle * SKIN_DISSOLVE_RATE);
        skinDissolveActive = true;
      } else {
        d.value = dissolveTarget; // snap to 0/1 so the term can settle (R1)
      }
      // Fully dissolved → drop the draw call entirely; otherwise it is visible.
      skin.mesh.visible = d.value < 1;

      // Breathing (morph 0) + pointer agitation (morph 1) ride the IO pump only
      // — held static at rest, so no time-driven motion keeps the loop awake.
      const influences = skin.mesh.morphTargetInfluences;
      if (influences) {
        influences[0] = ambient
          ? SKIN_BREATHE_MAX * (0.5 + 0.5 * Math.sin(elapsed * BOB_FREQ))
          : 0;
        let agitate = 0;
        if (pointerActive) {
          const dx = skin.mesh.position.x - pointer.x;
          const dy = skin.mesh.position.y + groupY - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          agitate = clamp01(1 - dist / SKIN_POINTER_RADIUS);
        }
        influences[1] = agitate;
      }
    }

    // --- 5b. Composite needsFrame (§2.4): engine + WP-D presentation terms ----
    // Ambient bob is deliberately EXCLUDED — it rides the existing IO pump, so
    // adding it here would re-pin the loop mid-page (R1). Pointer likewise pokes
    // via its own listener; its per-frame pull is transient (recomputed off the
    // settled state, never folded in), so it needs no continuous term.
    const needsFrame =
      engine.needsFrame ||
      cameraSettling ||
      entrance.phase !== "settled" ||
      hoverSettling ||
      skinDissolveActive;
    if (needsFrame) state.invalidate();
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 8]} intensity={DIR_LIGHT_INTENSITY[tier]} />
      <group ref={groupRef}>
        {shardMesh ? <primitive object={shardMesh} /> : null}
        {skin ? <primitive object={skin.mesh} /> : null}
      </group>
    </>
  );
}

export default KernStage;
