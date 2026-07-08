"use client";

import type React from "react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { getMotionToken } from "@/lib/motion-tokens";

// Reduced-motion gate via useSyncExternalStore (repo lint convention — no
// setState-in-effect). NOTE: reveals gate on reduced-motion ONLY, not pointer —
// the progressive-reveal timeline stays on touch (D-19). Lenis/magnetic gate on
// pointer:fine elsewhere; reveals do not.
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
 * Reusable reveal-on-enter primitive (WOW-02) — the scroll-triggered fade/slide
 * that plans 02-04 consume for career chapters, bento cells, and case-study
 * sections. NOT used for the above-the-fold hero beats (that is HeroIntro's
 * mount timeline).
 *
 * JUST-IN-TIME gsap (CWV reconciliation, 03-04 Option A): gsap is dynamically
 * imported ONLY when the element approaches the viewport, via IntersectionObserver
 * — NOT on mount. Lighthouse's mobile run never scrolls, so below-fold reveals
 * never load gsap and the home route's measured script:size stays under the
 * 184,643-byte gate; real users get the reveal the moment they scroll to it
 * (gsap is cached after the first reveal, so only the first has any import cost).
 * IntersectionObserver also replaces ScrollTrigger for reveals, trimming the
 * loaded gsap surface. Under reduced-motion nothing is observed or imported and
 * the content stays at its natural final state (opacity 1) — MODE-02 for free.
 *
 * Token values come from getMotionToken (read inside the effect, never a default
 * param — SSR guard, finding #4). `emphasis` selects the larger chapter tokens
 * (--motion-distance-lg / --motion-duration-chapter) for the D-06 ITSC beats.
 */
type RevealProps = {
  children: React.ReactNode;
  /** slide offset in px; defaults to the md (or lg when emphasis) token */
  distance?: number;
  /** duration in seconds; defaults to the base (or chapter when emphasis) token */
  duration?: number;
  /** emphasized "chapter" reveal (D-06) — larger offset + longer duration */
  emphasis?: boolean;
  className?: string;
};

export function Reveal({
  children,
  distance,
  duration,
  emphasis = false,
  className,
}: RevealProps) {
  const scope = useRef<HTMLDivElement>(null);
  const motionEnabled = useSyncExternalStore(
    subscribeReducedMotion,
    getRevealEnabledSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!motionEnabled) return;
    const el = scope.current;
    if (!el) return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        obs.disconnect(); // reveal-on-enter, once (D-05 no pinning/scrub)
        void (async () => {
          const { gsap } = await import("gsap");
          if (cancelled) return;
          const y =
            distance ??
            getMotionToken(
              emphasis ? "--motion-distance-lg" : "--motion-distance-md",
            );
          const dur =
            duration ??
            getMotionToken(
              emphasis ? "--motion-duration-chapter" : "--motion-duration-base",
            );
          ctx = gsap.context(() => {
            gsap.from(el, {
              opacity: 0,
              y,
              duration: dur,
              ease: "expo.out", // mirrors --motion-ease-out
            });
          }, el);
        })();
      },
      // Small negative bottom margin so it fires just as the element enters.
      // Lighthouse never scrolls, so below-fold reveals never intersect → gsap
      // is never loaded on the measured run.
      { rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      ctx?.revert();
    };
  }, [motionEnabled, distance, duration, emphasis]);

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
