"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { sceneBridge } from "../scene-bridge";

/**
 * Transition conductor (Phase-5 WP-D, DESIGN-SPEC §4 steps 3-4) — the IN half
 * of the route-transition mechanic. TransitionLink owns OUT (scatter, 300ms
 * cap, navigation watchdog) on the eager side; this hook subscribes to
 * `usePathname` INSIDE the lazy stage chunk and, on every committed
 * navigation, tweens `bridge.transition.t` back toward 0 (~500ms ease-out)
 * while the engine (WP-B) pulls the scattered pool into whatever formation
 * `bridge.routeFormation` currently names.
 *
 * Self-healing by construction (§4 step 4) — there is NO handshake with the
 * destination's `<StageFormation>` marker:
 *   - the decay always targets `bridge.routeFormation`; a marker write landing
 *     mid-decay simply retargets the attractor (React runs the destination
 *     page's mount effects before this subtree's pathname effect, so in
 *     practice the marker wins the race anyway);
 *   - navigations that never saw an OUT (back/forward, bfcache restore) start
 *     from t=0 and complete instantly — degrade to calm, never crash;
 *   - a cheap timer sweep force-completes ANY transition older than 900ms
 *     (same-path clicks, fast double-clicks, a starved rAF) so the field can
 *     never strand mid-scatter.
 *
 * BUNDLE CONTRACT: this module lives in the stage chunk and may only be
 * imported from `stage/` modules (StageCanvas mounts the hook). Importing it
 * from any eager module would pull the pathname subscription — and the rest of
 * this directory behind it — into the route bundle (§2.2 chunk strategy).
 *
 * Locale note: `usePathname` comes from `next/navigation` (NOT
 * `@/i18n/navigation`, which strips the locale prefix) so the DE↔EN switch is
 * a real pathname change and the field survives translation with the same
 * scatter→reassemble beat (§4 "DE↔EN").
 */

/** IN beat length (§4 step 3): scattered → destination formation. */
const IN_DURATION_MS = 500;
/** Transitions older than this are force-completed (§4 step 4). */
const STALE_TRANSITION_MS = 900;
/**
 * Sweep cadence for the stale check. A timer, deliberately not a rAF producer:
 * it fires exactly ONE invalidate when it actually force-completes, so it is
 * never an invalidation source at rest (§6.3 exhaustive-sources rule).
 */
const STALE_SWEEP_MS = 250;

export function useTransitionConductor(): void {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  // Stale force-complete sweep — installed once for the canvas lifetime.
  useEffect(() => {
    const sweep = window.setInterval(() => {
      const { phase, startedAt } = sceneBridge.transition;
      if (phase === "idle") return;
      if (performance.now() - startedAt <= STALE_TRANSITION_MS) return;
      sceneBridge.transition = { phase: "idle", t: 0, startedAt: 0 };
      sceneBridge.invalidate();
    }, STALE_SWEEP_MS);
    return () => window.clearInterval(sweep);
  }, []);

  // IN timeline — runs on every pathname change after the initial mount.
  useEffect(() => {
    if (isFirstRender.current) {
      // Canvas mount is not a navigation; leave a concurrent OUT (user clicked
      // while the chunk was still loading) to run its course — the pathname
      // change from its router.push lands here as a normal navigation.
      isFirstRender.current = false;
      return undefined;
    }

    // Decay from wherever OUT left the field (≈1 after a full scatter, 0 on
    // back/forward where no scatter ran) — never from an assumed value.
    const from = sceneBridge.transition.t;
    sceneBridge.transition = {
      phase: "in",
      t: from,
      startedAt: performance.now(),
    };

    let raf = 0;
    const t0 = performance.now();
    const step = (): void => {
      const k = Math.min((performance.now() - t0) / IN_DURATION_MS, 1);
      const eased = 1 - (1 - k) ** 3; // ease-out cubic
      sceneBridge.transition.t = from * (1 - eased);
      sceneBridge.invalidate();
      if (k >= 1) {
        sceneBridge.transition = { phase: "idle", t: 0, startedAt: 0 };
        return;
      }
      raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [pathname]);
}
