"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { getActiveLenis } from "@/lib/lenis-instance";
import {
  sceneBridge,
  type FormationId,
  type StageBridge,
} from "../scene-bridge";
import { SECTION_SEQUENCE } from "./section-config";
import {
  BOUNDARY_END,
  BOUNDARY_START,
  createEpsilonGate,
  formationAt,
  pageProgress,
} from "./progress";
import { resolveSectionAnchors } from "./measure";

/**
 * Scroll director (DESIGN-SPEC §3 "Scroll choreography wiring", desktop path
 * — WP-C). The pointer:fine choreography producer: resolves SECTION_SEQUENCE
 * against the live DOM and creates ONE scrubbed ScrollTrigger per adjacent
 * section pair — morphs in the boundary zones (`top 80%` → `top 20%`,
 * geometry shared with the touch producer via progress.ts), holds inside
 * sections. Entrance→hold→exit beats, scrubbed not timed; fast anchor jumps
 * (AnchorLink→Lenis) just scrub the morph quickly — no conductor involvement.
 *
 * Every write goes to the one-way D-08 bridge, never React state:
 *   - boundary triggers  → `bridge.formation = { from, to, t }`
 *   - Lenis scroll event → `bridge.scrollY`, `bridge.scrollVelocity` (|v|,
 *     px per 60fps frame), `bridge.pageProgress` (camera-spline input)
 * All invalidation is epsilon-gated (§6.3: no invalidate unless |Δprogress| >
 * 0.001) so Lenis settle ticks never force redundant GPU frames — the demand
 * frameloop's at-rest invariant (§7 R1) depends on this gate.
 *
 * BUNDLE CONTRACT: this module statically imports gsap + ScrollTrigger +
 * @gsap/react (per §3: "GSAP already loaded by MotionProvider" on
 * pointer:fine — same module instances, the bundler dedupes the specifiers
 * MotionProvider already dynamic-imports). StageCanvas (WP-B) must therefore
 * reach it ONLY through a pointer:fine-gated dynamic import (e.g.
 * `lazy(() => import("./scroll-director"))`); a static import from
 * stage-canvas would pull GSAP into the tier-"mobile" download and break the
 * Lighthouse mobile budget invariant — mobile mounts touch-scroll-producer
 * instead, which is GSAP-free by lint contract.
 */

gsap.registerPlugin(ScrollTrigger);

/**
 * Imperative director core: boundary triggers + the Lenis-fed page producer.
 * Returns a dispose function. Prefer `useScrollDirector` / the default
 * component — they re-run this per navigation so triggers always target the
 * destination DOM (App Router swaps the page subtree under the persistent
 * canvas). Falls back to a passive rAF-throttled native listener when Lenis
 * is absent (it initializes lazily; the stage mounts post-load+idle, so in
 * practice it exists — the fallback is defensive, not a second code path).
 */
export function initScrollDirector(
  bridge: StageBridge = sceneBridge,
): () => void {
  const disposers: Array<() => void> = [];

  // --- Boundary morph triggers (one per adjacent pair present in the DOM) --
  const steps: Array<{ formation: FormationId; element: HTMLElement }> = [];
  for (const step of SECTION_SEQUENCE) {
    const element = document.querySelector<HTMLElement>(step.el);
    if (element) steps.push({ formation: step.formation, element });
  }

  for (let i = 1; i < steps.length; i++) {
    const from = steps[i - 1].formation;
    const to = steps[i].formation;
    const gate = createEpsilonGate(() => bridge.invalidate());
    const trigger = ScrollTrigger.create({
      trigger: steps[i].element,
      start: `top ${BOUNDARY_START * 100}%`,
      end: `top ${BOUNDARY_END * 100}%`,
      scrub: true,
      onUpdate: (self) => {
        bridge.formation = { from, to, t: self.progress };
        gate(self.progress);
      },
    });
    disposers.push(() => trigger.kill());
  }

  // Seed once for mid-page mounts (the canvas arrives post-load+idle, the
  // visitor may already be at #skills): the shared pure function computes the
  // state stacked triggers would have left behind. Null ⇒ no homepage
  // sections on this route ⇒ the route-formation registry owns the field.
  const seeded = formationAt(
    resolveSectionAnchors(),
    window.scrollY,
    window.innerHeight,
  );
  if (seeded) bridge.formation = seeded;

  // --- pageProgress / scrollY / |velocity| producer ------------------------
  const pageGate = createEpsilonGate(() => bridge.invalidate());
  const writeScroll = (scrollY: number, velocity: number): void => {
    bridge.scrollY = scrollY;
    bridge.scrollVelocity = Math.abs(velocity);
    bridge.pageProgress = pageProgress(
      scrollY,
      document.documentElement.scrollHeight,
      window.innerHeight,
    );
    pageGate(bridge.pageProgress);
  };

  const lenis = getActiveLenis();
  if (lenis) {
    const onLenisScroll = (instance: Lenis): void =>
      writeScroll(instance.scroll, instance.velocity);
    lenis.on("scroll", onLenisScroll);
    disposers.push(() => lenis.off("scroll", onLenisScroll));
  } else {
    // Defensive fallback — same rAF-throttled shape as the touch producer,
    // velocity approximated in the same px-per-60fps-frame unit.
    let ticking = false;
    let lastY = window.scrollY;
    let lastTime = performance.now();
    const onScroll = (): void => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        const now = performance.now();
        const y = window.scrollY;
        const elapsedFrames = (now - lastTime) / (1000 / 60);
        writeScroll(y, elapsedFrames > 0 ? (y - lastY) / elapsedFrames : 0);
        lastY = y;
        lastTime = now;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    disposers.push(() => window.removeEventListener("scroll", onScroll));
  }
  writeScroll(window.scrollY, 0); // seed (first epsilon-gate call passes once)

  return () => {
    for (const dispose of disposers) dispose();
  };
}

/**
 * React variant for StageCanvas (WP-B): useGSAP owns the ScrollTrigger
 * lifecycle (gsap.context auto-revert, StrictMode-safe) and the returned
 * dispose cleans the non-GSAP listeners; `usePathname()` (locale-prefixed)
 * re-runs the director per navigation INCLUDING the DE↔EN switch. Call from
 * the DOM-side canvas wrapper, not inside <Canvas> (R3F's reconciler doesn't
 * carry next/navigation context).
 */
export function useScrollDirector(bridge: StageBridge = sceneBridge): void {
  const pathname = usePathname();
  useGSAP(
    () => initScrollDirector(bridge),
    // pathname is deliberately a dependency — it is the rebuild trigger for
    // route changes (same shape as transition-conductor).
    { dependencies: [pathname, bridge], revertOnUpdate: true },
  );
}

/**
 * Render-null component wrapper so StageCanvas can mount the director via the
 * mandated pointer:fine-gated `lazy(() => import("./scroll-director"))`
 * without touching hooks order.
 */
export default function ScrollDirector({
  bridge,
}: {
  bridge?: StageBridge;
}): null {
  useScrollDirector(bridge);
  return null;
}
