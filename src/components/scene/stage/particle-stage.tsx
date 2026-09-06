"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import type { SceneTier } from "@/lib/capability";
import {
  observeThemeColors,
  resolveSceneColors,
} from "@/lib/theme-color-resolver";
import { sceneBridge, type FormationId } from "../scene-bridge";
import { CameraRig } from "./camera-rig";
import { STAGE_CAMERA } from "./camera";
import { createFrameMonitor } from "./frame-monitor";
import { IconCast } from "./icon-cast";
import { ParticleEngine } from "./particle-engine";
import { buildParticleTargets } from "./particle-formations";
import { createParticleMaterial } from "./particle-material";
import {
  COLOR_MIX,
  DESKTOP_PARTICLES,
  FLOATS_PER_PARTICLE,
  LAYER,
  MOBILE_PARTICLES,
  PX,
  PY,
  PZ,
  SIZE,
  type ParticleEngineInputs,
  type ParticleTargets,
} from "./particle-types";
import { measureLayout } from "./measure";
import type { MeasuredLayout } from "./stage-types";

let currentLayout: MeasuredLayout | null = null;
let layoutVersion = 0;

export function setParticleLayout(layout: MeasuredLayout): void {
  currentLayout = layout;
  layoutVersion += 1;
  sceneBridge.invalidate();
}

function getLayout(): MeasuredLayout {
  if (!currentLayout) {
    currentLayout = measureLayout(STAGE_CAMERA);
    layoutVersion += 1;
  }
  return currentLayout;
}

type Props = {
  tier: Exclude<SceneTier, "none">;
  frameHookRef: React.RefObject<HTMLDivElement | null>;
};

export function ParticleStage({ tier, frameHookRef }: Props) {
  const count = tier === "mobile" ? MOBILE_PARTICLES : DESKTOP_PARTICLES;
  const { camera, gl, setDpr } = useThree();
  const targetCache = useRef(new Map<FormationId, ParticleTargets>());
  const cacheVersion = useRef(-1);

  const resolve = useCallback(
    (id: FormationId): ParticleTargets => {
      if (cacheVersion.current !== layoutVersion) {
        targetCache.current.clear();
        cacheVersion.current = layoutVersion;
      }
      let targets = targetCache.current.get(id);
      if (!targets) {
        targets = buildParticleTargets(id, getLayout(), count, layoutVersion);
        targetCache.current.set(id, targets);
      }
      return targets;
    },
    [count],
  );

  const engine = useMemo(() => new ParticleEngine(count, resolve), [count, resolve]);
  const output = useMemo(
    () => new Float32Array(count * FLOATS_PER_PARTICLE),
    [count],
  );
  const cameraRig = useMemo(() => new CameraRig(), []);
  const monitor = useMemo(() => createFrameMonitor(), []);
  const frameCount = useRef(0);
  const elapsed = useRef(0);
  const entrance = useRef({
    value: 1,
    waiting: true,
    mountedAt: 0,
  });
  const degraded = useRef(false);

  const sceneObjects = useMemo(() => {
    const colors = resolveSceneColors();
    const material = createParticleMaterial(colors, gl.getPixelRatio());
    const root = new THREE.Group();
    const layers: THREE.Group[] = [];
    const geometries: THREE.BufferGeometry[] = [];
    const positions: Float32Array[] = [];
    const sizes: Float32Array[] = [];
    const mixes: Float32Array[] = [];

    for (let layer = 0; layer < 3; layer += 1) {
      const geometry = new THREE.BufferGeometry();
      const position = new Float32Array(count * 3);
      const size = new Float32Array(count);
      const mix = new Float32Array(count);
      geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
      geometry.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
      geometry.setAttribute("aColorMix", new THREE.BufferAttribute(mix, 1));
      const points = new THREE.Points(geometry, material.material);
      points.frustumCulled = false;
      const group = new THREE.Group();
      group.add(points);
      root.add(group);
      layers.push(group);
      geometries.push(geometry);
      positions.push(position);
      sizes.push(size);
      mixes.push(mix);
    }

    const icons = new IconCast(colors);
    root.add(icons.group);
    return { root, layers, geometries, positions, sizes, mixes, material, icons };
  }, [count, gl]);

  const inputs = useMemo<ParticleEngineInputs>(
    () => ({
      formation: null,
      routeFormation: "constellation",
      transitionT: 0,
      scrollVelocity: 0,
    }),
    [],
  );

  useEffect(() => {
    const stop = observeThemeColors((colors) => {
      sceneObjects.material.setColors(colors);
      sceneObjects.icons.setColors(colors);
      sceneBridge.invalidate();
    });
    return stop;
  }, [sceneObjects]);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const hit = new THREE.Vector3();
    const onMove = (event: PointerEvent): void => {
      ndc.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(plane, hit)) {
        sceneBridge.pointer.x = hit.x;
        sceneBridge.pointer.y = hit.y;
        sceneBridge.pointer.active = true;
        sceneBridge.invalidate();
      }
    };
    const onLeave = (): void => {
      sceneBridge.pointer.active = false;
      sceneBridge.invalidate();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      sceneBridge.pointer.active = false;
    };
  }, [camera]);

  useEffect(
    () => () => {
      sceneObjects.geometries.forEach((geometry) => geometry.dispose());
      sceneObjects.material.dispose();
      sceneObjects.icons.dispose();
    },
    [sceneObjects],
  );

  useFrame((state, delta) => {
    if (sceneBridge.paused) return;
    frameCount.current += 1;
    frameHookRef.current?.setAttribute(
      "data-scene-frames",
      String(frameCount.current),
    );
    elapsed.current += Math.min(delta, 0.25);
    const dt = Math.min(delta, 2);
    const now = performance.now();
    if (entrance.current.mountedAt === 0) entrance.current.mountedAt = now;

    if (
      entrance.current.waiting &&
      (sceneBridge.introBeatAt > 0 || now - entrance.current.mountedAt > 3000)
    ) {
      entrance.current.waiting = false;
    }
    if (!entrance.current.waiting && entrance.current.value > 0) {
      entrance.current.value = Math.max(0, entrance.current.value - dt / 1.1);
    }

    inputs.formation = sceneBridge.formation;
    inputs.routeFormation = sceneBridge.routeFormation;
    inputs.transitionT = Math.max(
      sceneBridge.transition.t,
      entrance.current.value,
    );
    inputs.scrollVelocity = sceneBridge.scrollVelocity;
    engine.setInputs(inputs);
    engine.step(dt, elapsed.current, output);
    sceneBridge.scrollVelocity = inputs.scrollVelocity;

    for (let layer = 0; layer < 3; layer += 1) {
      const position = sceneObjects.positions[layer];
      const size = sceneObjects.sizes[layer];
      const mix = sceneObjects.mixes[layer];
      for (let i = 0; i < count; i += 1) {
        const source = i * FLOATS_PER_PARTICLE;
        const target = i * 3;
        position[target] = output[source + PX];
        position[target + 1] = output[source + PY];
        position[target + 2] = output[source + PZ];
        size[i] = output[source + LAYER] === layer ? output[source + SIZE] : 0;
        mix[i] = output[source + COLOR_MIX];
      }
      const geometry = sceneObjects.geometries[layer];
      geometry.getAttribute("position").needsUpdate = true;
      geometry.getAttribute("aSize").needsUpdate = true;
      geometry.getAttribute("aColorMix").needsUpdate = true;
    }

    const layout = getLayout();
    sceneObjects.root.position.y = sceneBridge.scrollY * layout.worldPerPixel;
    const pointerX = sceneBridge.pointer.active ? sceneBridge.pointer.x : 0;
    const pointerY = sceneBridge.pointer.active ? sceneBridge.pointer.y : 0;
    const scrollParallax = sceneBridge.pageProgress - 0.5;
    const layerFactors = [0.12, 0.28, 0.5];
    for (let layer = 0; layer < 3; layer += 1) {
      const factor = layerFactors[layer];
      sceneObjects.layers[layer].position.x = -pointerX * factor * 0.08;
      sceneObjects.layers[layer].position.y =
        -pointerY * factor * 0.06 + scrollParallax * (layer - 1) * 0.55;
    }

    const cameraNeedsFrame = cameraRig.update(
      state.camera,
      sceneBridge.pageProgress,
      dt,
      sceneBridge.pointer.x,
      sceneBridge.pointer.y,
      sceneBridge.pointer.active,
    );
    const iconsNeedFrame = sceneObjects.icons.update(
      layout,
      sceneBridge,
      elapsed.current,
      dt,
    );

    if (!degraded.current && monitor.sample(delta)) {
      degraded.current = true;
      setDpr(1);
      sceneObjects.layers[2].visible = false;
      sceneObjects.material.setPixelRatio(1);
    }

    if (
      engine.needsFrame ||
      cameraNeedsFrame ||
      iconsNeedFrame ||
      entrance.current.value > 0
    ) {
      state.invalidate();
    }
  });

  return (
    <>
      <primitive object={sceneObjects.root} />
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 8]} intensity={1.15} />
    </>
  );
}

export default ParticleStage;
