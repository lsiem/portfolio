"use client";

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
 * Bundle discipline (finding #1, mirrors HeroIntro): gsap + ScrollTrigger are
 * loaded LAZILY via dynamic import() only when motion is enabled, keeping the
 * home route's eager script bundle lean. Under reduced-motion the import never
 * fires and the content stays at its natural final state (opacity 1, no
 * transform) — which is exactly MODE-02 (same DOM, motion stripped), for free.
 * Because of the lazy boundary this uses useEffect + gsap.context (the same
 * scoped-cleanup guarantee useGSAP provides) rather than a static useGSAP import
 * that would pull gsap into the eager bundle.
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

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

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
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true, // reveal-on-enter, not scrub (D-05 no pinning)
          },
        });
      }, el);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [motionEnabled, distance, duration, emphasis]);

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
