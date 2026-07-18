"use client";

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { usePathname } from "next/navigation";
import type { SceneTier } from "@/lib/capability";
import { sceneBridge } from "./scene-bridge";
import { ParticleStage } from "./stage/particle-stage";
import { useTransitionConductor } from "./stage/transition-conductor";
import { setStageLayout } from "./stage/formation-engine";
import { formationForRoute } from "./stage/section-config";
import {
  useMeasuredLayout,
  type StageCameraIntrinsics,
} from "./stage/measure";
import { CAMERA_FOV_DEG, CAMERA_Z } from "./stage/formations";

// WP-C scroll producers (§3 "Scroll choreography wiring"), pointer-gated:
// scroll-director statically imports gsap/ScrollTrigger, so it may ONLY be
// reached through this pointer:fine-gated lazy() — a static import would pull
// GSAP into the touch download and break the mobile Lighthouse budget. Touch
// devices mount the GSAP-free touch producer instead.
const ScrollDirector = lazy(() => import("./stage/scroll-director"));
const TouchScrollProducer = lazy(() => import("./stage/touch-scroll-producer"));

// The measure.ts unprojection must use THIS canvas's camera pose (Contract 2:
// worldPerPixel diverges from doc px otherwise). Module-constant so the
// measurement lifecycle isn't restarted per render.
const STAGE_CAMERA: StageCameraIntrinsics = {
  fovDeg: CAMERA_FOV_DEG,
  distance: CAMERA_Z,
};

/**
 * Lazy chunk entry for the Kontinuum stage (WP-B; DESIGN-SPEC §2.1) — the
 * DEFAULT export StageGate pulls via `dynamic(() => import("./stage-canvas"),
 * { ssr: false })`, so three + @react-three/fiber live entirely in this
 * async-only chunk and never touch the eager route bundle (WOW-01).
 * Supersedes constellation-canvas.tsx: same gate contract, but the canvas is
 * now the layout-persistent stage — `frameloop="demand"` (§6.3) instead of a
 * binary run/pause, and the D-05 hero-exit producers are retired (the scroll
 * choreography lives in WP-C's producers + the formation engine).
 *
 * Frameloop policy (§6.3): "demand" is the ONLY steady value; "never" only
 * while the document is hidden (visibilitychange producer below, at-rest
 * invariant R3). dpr is [1, 1.25] mobile / [1, 1.5] desktop, snapped by R3F.
 * `failIfMajorPerformanceCaveat` is deliberately NOT set on the Canvas:
 * capability.ts already ran that probe pre-mount, and setting it here would
 * break the `?webgl=force` CI SwiftShader path (§2.1, Weltlinie finding).
 *
 * Context loss (D-10, §2.1): `webglcontextlost` → `preventDefault()` (we own
 * the no-restore decision) + silent unmount — the DOM site is the fallback,
 * no error/toast/dialog ever surfaces. `bridge.invalidate` reverts to the
 * dead-letter no-op so every later producer write costs nothing again.
 *
 * Contract 3 test hooks (§5.1, asserted by WP-E): the wrapper carries
 * `data-testid="stage-frameloop"`, `data-frameloop="demand"|"never"`, and
 * `data-scene-frames` — incremented once per rendered frame by the single
 * `useFrame` in particle-stage.tsx (the falsifiable at-rest counter).
 *
 * Producers mounted here (all §6.3-enumerated invalidation sources):
 *   - visibilitychange → frameloop "never" + `bridge.paused` (R3)
 *   - ambient IntersectionObserver + rAF pump, active ONLY while #hero or
 *     #contact intersects the viewport and the tab is visible (Vitrine
 *     graft; keeps the field breathing in hero/contact — R2 — while
 *     guaranteeing zero frames at rest mid-page — R1)
 *   - one-shot heatmap read (`#activity [data-level]`, Contract 4) —
 *     defensively parsed; malformed → null → wave-sheet fallback (§3)
 *   - the WP-D transition conductor (IN decay toward `routeFormation`, §4)
 */

export default function StageCanvas({ tier }: { tier: SceneTier }) {
  const [lost, setLost] = useState(false);
  const [frameloop, setFrameloop] = useState<"demand" | "never">("demand");
  const frameHookRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  // pointer:fine decides the scroll-producer flavor once per canvas lifetime
  // (§3): fine ⇒ GSAP ScrollTrigger director, coarse ⇒ rAF touch producer.
  // ssr:false on this chunk guarantees window exists at first render.
  const [finePointer] = useState(
    () => window.matchMedia("(pointer: fine)").matches,
  );

  // §4 IN half: pathname-subscribed decay toward bridge.routeFormation.
  useTransitionConductor();

  // §3 Contract 2: WP-C's measurement lifecycle feeds the formation engine
  // (fonts.ready → idle-sliced pass → debounced resize → per-route re-measure).
  useMeasuredLayout(setStageLayout, STAGE_CAMERA);

  // Route→formation registry (Weltlinie graft, §5.2): keeps routeFormation
  // correct on marker-less routes (home ⇒ "constellation") and degrades
  // unknown routes to "rest". StageFormation markers write the same value for
  // their routes, so the double write never flips the engine's morph source.
  useEffect(() => {
    sceneBridge.routeFormation = formationForRoute(pathname);
  }, [pathname]);

  // --- visibilitychange producer (R3): hidden ⇒ "never" + paused ------------
  useEffect(() => {
    const sync = (): void => {
      const hidden = document.visibilityState !== "visible";
      sceneBridge.paused = hidden;
      setFrameloop(hidden ? "never" : "demand");
      // One repaint on return — resume from exactly where the field froze.
      if (!hidden) sceneBridge.invalidate();
    };
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      document.removeEventListener("visibilitychange", sync);
      sceneBridge.paused = false;
    };
  }, []);

  // --- Ambient producer (§3 #hero/#contact; §6.3): IO-gated rAF pump --------
  // Re-keyed on pathname because the observed sections are page-local DOM —
  // after a route change the old nodes are gone and the new page may not
  // have #hero/#contact at all (case studies/legal ⇒ ambient stays off).
  useEffect(() => {
    const targets = document.querySelectorAll("#hero, #contact");
    if (targets.length === 0) {
      sceneBridge.ambientVisible = false;
      return undefined;
    }

    const visible = new Set<Element>();
    let running = false;
    let raf = 0;
    const pump = (): void => {
      if (!running) return;
      sceneBridge.invalidate();
      raf = window.requestAnimationFrame(pump);
    };
    const syncRun = (): void => {
      sceneBridge.ambientVisible = visible.size > 0;
      const shouldRun =
        visible.size > 0 && document.visibilityState === "visible";
      if (shouldRun === running) return;
      running = shouldRun;
      if (running) raf = window.requestAnimationFrame(pump);
      else window.cancelAnimationFrame(raf);
    };

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      syncRun();
    });
    targets.forEach((target) => observer.observe(target));
    document.addEventListener("visibilitychange", syncRun);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncRun);
      running = false;
      window.cancelAnimationFrame(raf);
      sceneBridge.ambientVisible = false;
    };
  }, [pathname]);

  // --- Contract 4: one-shot defensive heatmap read ---------------------------
  // Re-attempted per route until the #activity cells are actually in the DOM
  // (only the home page has them); once parsed, never re-read.
  useEffect(() => {
    if (sceneBridge.heatmapLevels) return;
    const cells = document.querySelectorAll("#activity [data-level]");
    if (cells.length === 0) return;
    const levels = new Uint8Array(cells.length);
    let valid = true;
    cells.forEach((cell, index) => {
      const parsed = Number(cell.getAttribute("data-level"));
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 4) {
        valid = false;
        return;
      }
      levels[index] = parsed;
    });
    // Malformed cells ⇒ null ⇒ the grid formation's neutral wave sheet (§3).
    sceneBridge.heatmapLevels = valid ? levels : null;
  }, [pathname]);

  // --- Bridge lifecycle: invalidate reverts to the dead-letter no-op --------
  useEffect(() => {
    if (!lost) return;
    sceneBridge.invalidate = () => {};
  }, [lost]);
  useEffect(
    () => () => {
      sceneBridge.invalidate = () => {};
    },
    [],
  );

  if (lost) return null; // D-10: the DOM is the fallback — silent unmount
  if (tier === "none") return null; // defensive — the gate never passes "none"

  return (
    <div
      ref={frameHookRef}
      data-testid="stage-frameloop"
      data-frameloop={frameloop}
      data-scene-frames="0"
      className="contents"
    >
      {/* WP-C producers live DOM-side (usePathname doesn't cross the R3F
          reconciler), render null, and lazy-load their own chunk. */}
      <Suspense fallback={null}>
        {finePointer ? <ScrollDirector /> : <TouchScrollProducer />}
      </Suspense>
      <Canvas
        frameloop={frameloop}
        dpr={tier === "mobile" ? [1, 1.25] : [1, 1.5]}
        // NO failIfMajorPerformanceCaveat here — see file header (§2.1).
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV_DEG }}
        onCreated={(state) => {
          // The demand loop's poke — replaces the module-level no-op so every
          // producer write can now actually schedule a frame (§5.1 Contract 1).
          sceneBridge.invalidate = () => state.invalidate();
          // §2.1: preventDefault marks the loss as handled (no browser restore
          // attempt we'd ignore anyway), then the gate unmounts silently.
          // once:true — after the first loss this component returns null, so
          // the listener self-cleans and never re-fires.
          state.gl.domElement.addEventListener(
            "webglcontextlost",
            (event) => {
              event.preventDefault();
              setLost(true);
            },
            { once: true },
          );
        }}
      >
        <ParticleStage tier={tier} frameHookRef={frameHookRef} />
      </Canvas>
    </div>
  );
}
