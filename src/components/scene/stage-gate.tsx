"use client";

import type React from "react";
import { Component, useEffect, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { decideSceneTier, type SceneTier } from "@/lib/capability";

/**
 * Stage gate (D-07, D-10, WOW-01; DESIGN-SPEC §2.1) — the ONLY mount decision
 * in the app. A direct generalization of the verified hero-scene-gate.tsx
 * with identical semantics, now hoisted to layout level via StageSlot.
 * Decides — after first paint, on idle — whether a capable device gets the
 * lazily-loaded WebGL stage, and renders NOTHING for everyone else
 * (reduced-motion, weak device, software GL, ?webgl=off, or a WebGL crash):
 * the DOM stays byte-render-identical, no placeholder, no spinner, no message.
 *
 * Bundle discipline (WOW-01 "nie im Initial-Bundle"): three/@react-three/fiber
 * enter ONLY through `dynamic(() => import(...), { ssr: false })` below, and
 * detect-gpu ONLY through the dynamic import inside decideSceneTier — none of
 * them is imported statically here, so the eager route bundle stays under the
 * 184,643-byte TECH-01 gate (mirrors motion-provider.tsx's lazy-import
 * discipline).
 *
 * SSR safety (RESEARCH Pitfall 6): reduced-motion is read via the repo's
 * mandatory useSyncExternalStore shape (setState-in-effect for media state
 * hard-errors under the React-Compiler lint); getServerSnapshot returns a
 * stable value and `tier` starts "none", so SSR and the first client render are
 * always null — no hydration mismatch. The tier itself resolves asynchronously
 * (idle -> decideSceneTier -> setState), which IS an allowed effect.
 * Reduced-motion is unconditional "none" — it beats ?webgl=force — and the
 * live matchMedia change listener unmounts the stage mid-session.
 *
 * NOT the motion gate (RESEARCH Pitfall 7): only reduced-motion composes here.
 * Pointer-fineness gates the pointer-influence FEATURE (D-06, in 04-04), never
 * the mount — capable touch devices are included (D-07).
 */

// ssr:false is illegal in a Server Component (RESEARCH Pattern 1) — this file
// is "use client", so the boundary is valid and makes the chunk async-only.
// Wave-1 interim stage: today's constellation, hoisted to layout level.
// WP-B swaps this import target for ./stage-canvas (the formation engine).
const StageCanvas = dynamic(() => import("./constellation-canvas"), {
  ssr: false,
});

// --- reduced-motion via useSyncExternalStore (repo hard convention) ----------
function subscribeReducedMotion(callback: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}
function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function getServerSnapshot(): boolean {
  // Stable SSR default: motion allowed. Combined with the "none" initial tier,
  // SSR + first client render are null regardless, so hydration never mismatches.
  return false;
}

/**
 * ~20-line error boundary (no in-repo analog). Any throw from Canvas creation
 * or the scene subtree collapses to null — the silent D-10 fallback = the
 * DOM-only site, never an error surfaced to the visitor (success criterion 2).
 */
class SceneErrorBoundary extends Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }
  render(): React.ReactNode {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export function StageGate() {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerSnapshot,
  );
  const [tier, setTier] = useState<SceneTier>("none");

  useEffect(() => {
    // Reactive D-10: if reduced-motion is on, don't decide/mount — the render
    // guard below already returns null, so an enabled preference unmounts the
    // scene without a synchronous setState in the effect body.
    if (reducedMotion) return;

    let cancelled = false;
    const runDecision = () => {
      const idle: (cb: () => void) => void =
        "requestIdleCallback" in window
          ? (cb) => {
              window.requestIdleCallback(cb);
            }
          : (cb) => {
              window.setTimeout(cb, 1500); // Safari fallback (RESEARCH A3)
            };
      idle(() => {
        void decideSceneTier()
          .then((resolved) => {
            if (!cancelled) setTier(resolved);
          })
          .catch(() => {
            // Silent D-10 fallback: a failed detect-gpu import or benchmark
            // fetch must not surface (no unhandled rejection, no console
            // noise) — tier stays "none", so the DOM-only site is unchanged.
          });
      });
    };

    // Mount after first paint: wait for load, or kick off now if already loaded.
    if (document.readyState === "complete") {
      runDecision();
      return () => {
        cancelled = true;
      };
    }
    window.addEventListener("load", runDecision, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", runDecision);
    };
  }, [reducedMotion]);

  if (reducedMotion || tier === "none") return null; // D-10: nothing missing
  return (
    <SceneErrorBoundary>
      <StageCanvas tier={tier} />
    </SceneErrorBoundary>
  );
}
