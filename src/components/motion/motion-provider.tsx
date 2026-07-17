"use client";

import type React from "react";
import { useEffect, useSyncExternalStore } from "react";
import { setActiveLenis } from "@/lib/lenis-instance";

// --- Motion gate (reduced-motion + pointer) via useSyncExternalStore ---------
// This codebase forbids the state-hook-in-effect pattern for reading
// browser-only media state (eslint-plugin-react-hooks / React-Compiler
// hard-errors on setState-in-effect, see STATE.md + theme-toggle.tsx). Mirror
// theme-toggle's module-scope pub/sub + getSnapshot/getServerSnapshot shape
// verbatim (RESEARCH Pitfall 4).

function subscribeMotionGates(callback: () => void): () => void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = window.matchMedia("(pointer: coarse)");
  reduced.addEventListener("change", callback);
  coarse.addEventListener("change", callback);
  return () => {
    reduced.removeEventListener("change", callback);
    coarse.removeEventListener("change", callback);
  };
}

// true => full motion allowed (Lenis smooth-scroll + gsap.ticker driven).
// Lenis is active on pointer:fine only (D-09/D-19) and never under
// prefers-reduced-motion (D-18).
function getMotionGatesSnapshot(): boolean {
  return (
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches &&
    window.matchMedia("(pointer: fine)").matches
  );
}

// Stable, motion-off default on the server so the FIRST client render equals the
// SSR output before any animation logic runs (WOW-04 / RESEARCH Pitfall 2) —
// matches theme-toggle's getServerSnapshot convention so hydration never
// mismatches.
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Root-mounted motion coordinator: owns the single Lenis instance and the
 * gsap.ticker <-> ScrollTrigger sync (D-09), gated for reduced-motion + touch.
 *
 * Structural stability (finding #3, honored via a stronger mechanism): this
 * component ALWAYS returns `{children}` at the exact same tree position in every
 * gate state, so flipping the motion gate NEVER changes the element type and
 * NEVER remounts the children subtree (no state reset, no focus drop, no flash).
 * Lenis is attached as a pure side effect, not as a wrapping element.
 *
 * Bundle discipline (BLOCKING LHCI script budget, finding #1): gsap +
 * ScrollTrigger + lenis are loaded LAZILY via dynamic import() only when the
 * motion gate is open. On the reduced-motion / touch path (which is also
 * Lighthouse's mobile emulation, pointer:coarse) the motion stack is never
 * fetched at all — keeping the eager per-route bundle under the 184,643-byte
 * gate — and Lenis is genuinely never instantiated (D-18).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const motionEnabled = useSyncExternalStore(
    subscribeMotionGates,
    getMotionGatesSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!motionEnabled) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    void (async () => {
      // Dynamic imports keep gsap/ScrollTrigger/lenis out of the eager bundle;
      // ScrollTrigger is imported from its dedicated subpath (not a core barrel)
      // for tight tree-shaking (finding #1).
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] =
        await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
      if (cancelled) return;

      // Idempotent — safe under React Strict Mode's dev double-invoke.
      gsap.registerPlugin(ScrollTrigger);

      // autoRaf:false — Lenis does not self-drive; we feed it from gsap.ticker so
      // the two share one RAF loop (canonical Lenis <-> ScrollTrigger recipe).
      const lenis = new Lenis({ lerp: 0.1, duration: 1.2, autoRaf: false });
      // Publish the instance so AnchorLink drives Lenis directly (no native
      // anchor jump for Lenis to clobber mid-init — the scroll race).
      setActiveLenis(lenis);

      const onScroll = () => ScrollTrigger.update();
      lenis.on("scroll", onScroll);

      const raf = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.refresh();
      // Font swap reflows the fluid clamp() hero H1 after ScrollTrigger cached
      // its start/end positions (RESEARCH Pitfall 3) — refresh once fonts load.
      void document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });

      // Recover an anchor chosen before Lenis was ready (a click during this
      // lazy-init window, or a deep-link like /de#career): jump straight to it
      // so the intended target is honored instead of resting at the top.
      const hash = window.location.hash;
      if (hash.length > 1) {
        const target = document.getElementById(hash.slice(1));
        if (target) {
          const offset =
            parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
          lenis.scrollTo(target, { offset: -offset, immediate: true });
        }
      }

      teardown = () => {
        setActiveLenis(null);
        lenis.off("scroll", onScroll);
        gsap.ticker.remove(raf);
        lenis.destroy();
      };
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, [motionEnabled]);

  // Unconditional, stable structure — children are never re-parented (finding #3).
  return <>{children}</>;
}
