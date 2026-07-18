"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sceneBridge, type StageBridge } from "../scene-bridge";
import { createEpsilonGate, formationAt, pageProgress } from "./progress";
import { resolveSectionAnchors } from "./measure";

/**
 * Touch scroll producer (DESIGN-SPEC §3 "Scroll choreography wiring", mobile
 * path — WP-C). Tier "mobile" / pointer:coarse never fetches GSAP (the
 * Lighthouse mobile script-budget invariant): this module reuses the
 * constellation-canvas.tsx touch pattern — a passive, rAF-throttled scroll
 * listener over cached document-space section anchors — and computes the SAME
 * bridge fields the desktop scroll director produces, through the SAME pure
 * functions in progress.ts, so stations can't misalign between producers
 * (Weltlinie graft).
 *
 * LINT CONTRACT: no `gsap`, `gsap/ScrollTrigger`, or `@gsap/react` import may
 * ever appear in this file — adding one would pull GSAP into the mobile stage
 * path and break the §6.1/§6.3 budget story.
 *
 * Writes per throttled tick (one-way D-08 bridge, no React state):
 *   - `bridge.scrollY`       — px, the stage group's transform input
 *   - `bridge.pageProgress`  — 0..1, the camera-spline input
 *   - `bridge.scrollVelocity`— |px per 60fps frame| (matches the unit Lenis
 *     reports on desktop, so the useFrame decay treats both alike)
 *   - `bridge.formation`     — only when homepage sections exist; on other
 *     routes the route-formation registry owns the field
 * Invalidation is epsilon-gated on formation-t AND pageProgress (§6.3 demand
 * discipline) — momentum-settle ticks never force redundant GPU frames.
 */

/** Anchor re-resolution debounce on resize (mirrors measure.ts's cadence). */
const RESIZE_DEBOUNCE_MS = 200;
/** Velocity is expressed in px per 60fps frame — Lenis's reporting unit. */
const FRAME_MS = 1000 / 60;

/**
 * Imperative producer core. Returns a dispose function. Prefer the hook
 * (`useTouchScrollProducer`) or default component from StageCanvas — they add
 * the per-route anchor re-resolution.
 */
export function initTouchProducer(
  bridge: StageBridge = sceneBridge,
): () => void {
  let disposed = false;
  let anchors = resolveSectionAnchors();
  let ticking = false;
  let debounceTimer = 0;
  let lastY = window.scrollY;
  let lastTime = performance.now();

  const formationGate = createEpsilonGate(() => bridge.invalidate());
  const pageGate = createEpsilonGate(() => bridge.invalidate());

  const measureTick = (): void => {
    const scrollY = window.scrollY;
    const now = performance.now();
    const viewportHeight = window.innerHeight;

    const elapsedFrames = (now - lastTime) / FRAME_MS;
    bridge.scrollVelocity =
      elapsedFrames > 0 ? Math.abs((scrollY - lastY) / elapsedFrames) : 0;
    lastY = scrollY;
    lastTime = now;

    bridge.scrollY = scrollY;
    bridge.pageProgress = pageProgress(
      scrollY,
      document.documentElement.scrollHeight,
      viewportHeight,
    );
    pageGate(bridge.pageProgress);

    const state = formationAt(anchors, scrollY, viewportHeight);
    if (state) {
      bridge.formation = state;
      formationGate(state.t);
    }
  };

  const onScroll = (): void => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      if (disposed) return;
      measureTick();
    });
  };

  const onResize = (): void => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      if (disposed) return;
      anchors = resolveSectionAnchors();
      measureTick();
    }, RESIZE_DEBOUNCE_MS);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });

  // Late-loading Bricolage metrics move the anchors — refresh once settled
  // (the same fonts.ready rule measure.ts follows for formation targets).
  void document.fonts.ready.then(() => {
    if (disposed) return;
    anchors = resolveSectionAnchors();
  });

  measureTick(); // seed: the canvas mounts post-load+idle, possibly mid-page

  return () => {
    disposed = true;
    window.clearTimeout(debounceTimer);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onResize);
  };
}

/**
 * React variant for StageCanvas (WP-B). `usePathname()` re-initializes the
 * producer per navigation (incl. DE↔EN) so anchors are re-resolved against
 * the destination DOM. Call from the DOM-side canvas wrapper, not inside
 * <Canvas> (R3F's reconciler doesn't carry next/navigation context).
 */
export function useTouchScrollProducer(
  bridge: StageBridge = sceneBridge,
): void {
  const pathname = usePathname();
  // pathname is deliberately an extra dependency — it is the re-resolve
  // trigger for route changes (same shape as transition-conductor).
  useEffect(() => initTouchProducer(bridge), [pathname, bridge]);
}

/**
 * Render-null component wrapper so StageCanvas can mount the producer via a
 * pointer-gated `lazy(() => import("./touch-scroll-producer"))` without
 * touching hooks order.
 */
export default function TouchScrollProducer({
  bridge,
}: {
  bridge?: StageBridge;
}): null {
  useTouchScrollProducer(bridge);
  return null;
}
