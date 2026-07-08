"use client";

import type React from "react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { getMotionToken } from "@/lib/motion-tokens";

// Gate via useSyncExternalStore (repo lint convention — no setState-in-effect).
// Magnetic pull is a pointer-only affordance (D-11.1): absent, not degraded, on
// touch/keyboard (D-19), and stripped under prefers-reduced-motion (MODE-02).
function subscribeMagneticGates(callback: () => void): () => void {
  const coarse = window.matchMedia("(pointer: coarse)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  coarse.addEventListener("change", callback);
  reduced.addEventListener("change", callback);
  return () => {
    coarse.removeEventListener("change", callback);
    reduced.removeEventListener("change", callback);
  };
}

function getMagneticEnabledSnapshot(): boolean {
  return (
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches
  );
}

function getServerSnapshot(): boolean {
  return false;
}

const MAX_PULL_PX = 12; // clamp displacement (UI-SPEC D-11.1)
const PULL_FACTOR = 0.3;

/**
 * Pointer-only magnetic pull wrapper (D-11.1). The wrapped element eases toward
 * the cursor within a small radius on pointer:fine devices and snaps back on
 * leave. NO touch handlers (D-19: absent, not degraded); keyboard focus is
 * unaffected (the global :focus-visible ring still applies); stripped under
 * prefers-reduced-motion (MODE-02).
 *
 * Structural stability (finding #3): the inline-block wrapper span is ALWAYS
 * rendered; the mousemove/mouseleave listeners are attached only when enabled,
 * so a pointer-type flip never remounts the wrapped control.
 *
 * JUST-IN-TIME gsap (CWV reconciliation, 03-04 Option A): gsap is dynamically
 * imported inside the effect ONLY when the gate is open — and the gate is closed
 * on Lighthouse's mobile emulation (pointer:coarse), so gsap is never in the
 * home route's measured bundle. Listeners are attached natively (not via useGSAP)
 * so no static @gsap/react import pulls gsap eager; cleanup kills tweens and
 * clears the transform.
 */
type MagneticProps = {
  children: React.ReactNode;
  className?: string;
};

export function Magnetic({ children, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const magneticEnabled = useSyncExternalStore(
    subscribeMagneticGates,
    getMagneticEnabledSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!magneticEnabled) return;
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { gsap } = await import("gsap");
      if (cancelled) return;

      const fastDuration = getMotionToken("--motion-duration-fast") * 2;
      const baseDuration = getMotionToken("--motion-duration-base");

      const onMove = (event: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const relX = event.clientX - (rect.left + rect.width / 2);
        const relY = event.clientY - (rect.top + rect.height / 2);
        // --motion-ease-magnetic (cubic-bezier) maps to a named GSAP ease.
        gsap.to(el, {
          x: gsap.utils.clamp(-MAX_PULL_PX, MAX_PULL_PX, relX * PULL_FACTOR),
          y: gsap.utils.clamp(-MAX_PULL_PX, MAX_PULL_PX, relY * PULL_FACTOR),
          duration: fastDuration,
          ease: "power2.out",
        });
      };

      const onLeave = () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: baseDuration,
          ease: "elastic.out(1, 0.4)",
        });
      };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      cleanup = () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        gsap.killTweensOf(el);
        gsap.set(el, { clearProps: "transform" });
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [magneticEnabled]);

  return (
    <span ref={ref} className={`inline-block ${className ?? ""}`.trim()}>
      {children}
    </span>
  );
}
