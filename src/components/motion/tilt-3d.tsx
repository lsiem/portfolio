"use client";

import type React from "react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { getMotionToken } from "@/lib/motion-tokens";

// Motion gates (reduced-motion + pointer), matching Magnetic/Reveal.
// Only enabled on pointer:fine (desktop/mouse) and prefers-reduced-motion: no-preference.
function subscribeGates(callback: () => void): () => void {
  const coarse = window.matchMedia("(pointer: coarse)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  coarse.addEventListener("change", callback);
  reduced.addEventListener("change", callback);
  return () => {
    coarse.removeEventListener("change", callback);
    reduced.removeEventListener("change", callback);
  };
}

function getEnabledSnapshot(): boolean {
  return (
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches
  );
}

function getServerSnapshot(): boolean {
  return false;
}

type Tilt3DProps = {
  children: React.ReactNode;
  className?: string;
  maxRotate?: number; // max rotation degrees, default 8
  scale?: number;     // scale on hover, default 1.02
};

export function Tilt3D({
  children,
  className,
  maxRotate = 8,
  scale = 1.02,
}: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const enabled = useSyncExternalStore(subscribeGates, getEnabledSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { gsap } = await import("gsap");
      if (cancelled) return;

      const fastDuration = getMotionToken("--motion-duration-fast") * 2;
      const baseDuration = getMotionToken("--motion-duration-slow");

      const onMove = (event: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        
        // Calculate mouse relative coordinates from -0.5 to 0.5
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        
        // Rotate around X (vertical mouse motion rotates around horizontal axis)
        // Rotate around Y (horizontal mouse motion rotates around vertical axis)
        const rotationX = -y * maxRotate;
        const rotationY = x * maxRotate;

        gsap.to(el, {
          transformPerspective: 1000,
          rotationX,
          rotationY,
          scale,
          z: 15,
          duration: fastDuration,
          ease: "power2.out",
        });
      };

      const onLeave = () => {
        gsap.to(el, {
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          z: 0,
          duration: baseDuration,
          ease: "power2.out",
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
  }, [enabled, maxRotate, scale]);

  return (
    <div ref={ref} className={className} style={{ transformStyle: "preserve-3d" }}>
      {children}
    </div>
  );
}
