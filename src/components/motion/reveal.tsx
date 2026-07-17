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
 * TECHNIQUE SPLIT BY POINTER (04-02, D-11/D-19). Reveals stay on touch (D-19),
 * but the DELIVERY differs by pointer so the mobile initial load never pays for
 * GSAP:
 *   - pointer:coarse (touch / Lighthouse mobile) -> CSS-ONLY reveal: a
 *     compositor-friendly opacity+transform transition applied imperatively when
 *     the element enters the viewport. gsap is NEVER imported on this path, so
 *     the home route's mobile script payload stays the ~177KB core bundle (under
 *     the 184,643-byte TECH-01 gate). This closes the deployed-bundle overage
 *     root-caused in 04-02: the previous just-in-time gsap import fired via
 *     IntersectionObserver whenever a near-fold reveal entered the (tall) mobile
 *     viewport, pulling ~30KB of gsap into the initial load.
 *   - pointer:fine (desktop) -> JUST-IN-TIME gsap: dynamically imported only when
 *     the element approaches the viewport (03-04 Option A), giving desktop the
 *     eased expo-out reveal. gsap is cached after the first reveal.
 * Under reduced-motion nothing is observed, imported, or mutated and the content
 * stays at its natural final state (opacity 1) — MODE-02 for free.
 *
 * Both paths animate transform/opacity only (compositor-friendly). Token values
 * come from getMotionToken (read inside the effect, never a default param — SSR
 * guard, finding #4); durations are seconds, distances px. `emphasis` selects the
 * larger chapter tokens (--motion-distance-lg / --motion-duration-chapter) for the
 * D-06 ITSC beats. The initial hidden state is applied imperatively AFTER the
 * observer fires — never in SSR/CSS — so server-rendered content is visible
 * before hydration and there is no no-JS/pre-hydration flash (WOW-04).
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
    let onTransitionEnd: (() => void) | undefined;

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

    // Desktop (pointer:fine) gets the eased gsap reveal; touch/coarse (also
    // Lighthouse mobile) gets a CSS-only transition with NO gsap import so the
    // mobile initial-load bundle stays under the TECH-01 script gate (04-02).
    const usesGsap = window.matchMedia("(pointer: fine)").matches;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        obs.disconnect(); // reveal-on-enter, once (D-05 no pinning/scrub)

        if (usesGsap) {
          void (async () => {
            const { gsap } = await import("gsap");
            if (cancelled) return;
            ctx = gsap.context(() => {
              gsap.from(el, {
                opacity: 0,
                y,
                duration: dur,
                ease: "expo.out", // mirrors --motion-ease-out
              });
            }, el);
          })();
          return;
        }

        // CSS-only reveal (touch path) — set the hidden start state, force a
        // reflow so the browser registers it, then transition to the resting
        // state. transform/opacity only (compositor-friendly).
        const ease = getMotionToken("--motion-ease-out");
        el.style.willChange = "opacity, transform";
        el.style.opacity = "0";
        el.style.transform = `translateY(${y}px)`;
        void el.offsetHeight; // reflow — commit the hidden state before transition
        if (cancelled) return;
        el.style.transition = `opacity ${dur}s ${ease}, transform ${dur}s ${ease}`;
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
        onTransitionEnd = () => {
          el.style.willChange = "";
          el.style.transition = "";
          el.style.transform = "";
        };
        el.addEventListener("transitionend", onTransitionEnd, { once: true });
      },
      // Small negative bottom margin so it fires just as the element enters.
      // Below-fold reveals never intersect on a no-scroll audit.
      { rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      ctx?.revert();
      if (onTransitionEnd) el.removeEventListener("transitionend", onTransitionEnd);
    };
  }, [motionEnabled, distance, duration, emphasis]);

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
