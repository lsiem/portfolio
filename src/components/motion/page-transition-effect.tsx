"use client";

import { usePathname } from "@/i18n/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getMotionToken } from "@/lib/motion-tokens";

function subscribeReducedMotion(callback: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getRevealEnabledSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Orchestrates the entry 3D transition whenever the pathname changes.
 * Under prefers-reduced-motion, it renders instantly without animation.
 * The dynamic import keeps GSAP out of the critical rendering path.
 */
export function PageTransitionEffect({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const motionEnabled = useSyncExternalStore(
    subscribeReducedMotion,
    getRevealEnabledSnapshot,
    getServerSnapshot
  );

  // Sync children immediately to avoid delayed hydration mismatch or blank screens.
  useEffect(() => {
    setDisplayChildren(children);
  }, [children]);

  useEffect(() => {
    if (!motionEnabled) return;
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;

    void import("gsap").then(({ gsap }) => {
      if (cancelled) return;
      
      const dur = getMotionToken("--motion-duration-slow");

      // 3D swing entrance animation. Eases in from the opposite perspective of the exit animation.
      gsap.fromTo(
        el,
        {
          opacity: 0,
          transformPerspective: 1200,
          rotationY: -8, // subtle rotation angle
          z: -80,        // recede in 3D depth
          x: 20,         // offset horizontally
        },
        {
          opacity: 1,
          rotationY: 0,
          z: 0,
          x: 0,
          duration: dur,
          ease: "power2.out",
          // Clear transform properties so they don't break layout or scroll offsets.
          clearProps: "transform,opacity,transformPerspective,rotationY,z,x",
        }
      );
    });

    return () => {
      cancelled = true;
    };
  }, [pathname, motionEnabled]);

  return (
    <div ref={containerRef} className="flex flex-1 flex-col origin-center">
      {displayChildren}
    </div>
  );
}
