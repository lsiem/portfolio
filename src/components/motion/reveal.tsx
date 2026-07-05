"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { getMotionToken } from "@/lib/motion-tokens";

gsap.registerPlugin(ScrollTrigger);

/**
 * Reusable reveal-on-enter primitive (WOW-02) — the scroll-triggered fade/slide
 * that plans 02-04 consume for career chapters, bento cells, and case-study
 * sections. NOT used for the above-the-fold hero beats (that is HeroIntro's
 * mount timeline — reveal-on-enter does not match the D-12 on-mount sequence).
 *
 * Token values (distance/duration/stagger) come from getMotionToken so the
 * numbers are never hardcoded — read INSIDE useGSAP (never as a default param,
 * which would run during SSR render; finding #4). The reduced-motion branch of
 * gsap.matchMedia creates NO ScrollTrigger and renders the final state
 * immediately — this is what makes MODE-02 "free" (same DOM, motion stripped).
 */
type RevealProps = {
  children: React.ReactNode;
  /** slide offset in px; defaults to --motion-distance-md */
  distance?: number;
  /** duration in seconds; defaults to --motion-duration-base */
  duration?: number;
  /** per-child stagger in seconds; defaults to --motion-stagger-list */
  stagger?: number;
  className?: string;
};

export function Reveal({
  children,
  distance,
  duration,
  stagger,
  className,
}: RevealProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const y = distance ?? getMotionToken("--motion-distance-md");
      const dur = duration ?? getMotionToken("--motion-duration-base");
      const stg = stagger ?? getMotionToken("--motion-stagger-list");

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(scope.current, { opacity: 1, y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(scope.current, {
          opacity: 0,
          y,
          duration: dur,
          stagger: stg,
          ease: "expo.out", // mirrors --motion-ease-out cubic-bezier(0.16,1,0.3,1)
          scrollTrigger: {
            trigger: scope.current,
            start: "top 85%",
            once: true, // reveal-on-enter, not scrub (D-05 no pinning)
          },
        });
      });

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
