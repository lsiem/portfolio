"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { SplitText } from "gsap/SplitText";
import { getMotionToken } from "@/lib/motion-tokens";

// --- Motion gate (reduced-motion + pointer), mirrors MotionProvider ----------
// useSyncExternalStore (not setState-in-effect) per the repo lint convention
// (theme-toggle.tsx / RESEARCH Pitfall 4).

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

function getMotionGatesSnapshot(): boolean {
  return (
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches &&
    window.matchMedia("(pointer: fine)").matches
  );
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Hero intro ORCHESTRATOR (D-12, finding #6). Runs a single on-mount timeline
 * (NOT a ScrollTrigger, NOT the scroll Reveal primitive) over the hero's SSR
 * markup, reproducing the D-12 beats: grid/tick overlay draws in (0-400ms) ->
 * H1 words stagger in (200-900ms) -> value-prop rises (500-1000ms).
 *
 * WOW-04 / no post-hydration flash: the hero H1 and value-prop ELEMENTS keep
 * opacity 1 at all times — they are revealed via transform (y-rise) only, so the
 * SSR-visible text never blanks to opacity:0 after hydration. Only the decorative
 * aria-hidden grid overlay animates opacity. Under reduced-motion / touch the
 * timeline never runs and every element stays at its SSR final state (MODE-02).
 *
 * Bundle discipline (finding #1): gsap + SplitText are dynamically imported only
 * when the motion gate is open (desktop, pointer:fine). On the reduced-motion /
 * touch path (also Lighthouse's mobile emulation) they are never fetched, so the
 * home route's eager script bundle stays under the 184,643-byte gate. Because of
 * that lazy boundary this component uses useEffect + gsap.context (manual scoped
 * cleanup, the same guarantee useGSAP provides) rather than a static useGSAP
 * import that would pull gsap into the eager bundle.
 *
 * Single split owner: HeroIntro owns the hero H1 SplitText directly; the H1 is
 * NOT wrapped in <SplitHeading> (which would double-split it).
 */
type HeroIntroProps = {
  children: React.ReactNode;
  className?: string;
};

export function HeroIntro({ children, className }: HeroIntroProps) {
  const scope = useRef<HTMLDivElement>(null);
  const motionEnabled = useSyncExternalStore(
    subscribeMotionGates,
    getMotionGatesSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!motionEnabled) return;
    const root = scope.current;
    if (!root) return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;
    let split: SplitText | undefined;

    void (async () => {
      const [{ gsap }, splitMod] = await Promise.all([
        import("gsap"),
        import("gsap/SplitText"),
      ]);
      if (cancelled) return;
      const SplitTextRuntime = splitMod.SplitText;
      gsap.registerPlugin(SplitTextRuntime);

      const y = getMotionToken("--motion-distance-md");
      const durSlow = getMotionToken("--motion-duration-slow");
      const durBase = getMotionToken("--motion-duration-base");
      const stg = getMotionToken("--motion-stagger-word");

      // Wait for the display face so H1 word boundaries measure against Bricolage
      // (font-metric timing). Text opacity stays 1 throughout, so waiting never
      // blanks the hero (RESEARCH Pitfall 3 / round-2 LOW).
      await document.fonts.ready;
      if (cancelled) return;

      ctx = gsap.context(() => {
        const h1 = root.querySelector<HTMLElement>("[data-hero-h1]");
        const grid = root.querySelector<HTMLElement>("[data-hero-grid]");
        const valueProp = root.querySelector<HTMLElement>(
          "[data-hero-valueprop]",
        );

        const tl = gsap.timeline({
          defaults: { ease: "expo.out" }, // mirrors --motion-ease-out
        });

        // 0-400ms: decorative grid overlay draws in (opacity ok — aria-hidden).
        if (grid) {
          tl.from(
            grid,
            {
              opacity: 0,
              scaleX: 0,
              transformOrigin: "left center",
              duration: durSlow / 2,
            },
            0,
          );
        }

        // 200-900ms: H1 words rise in (transform only — element opacity stays 1).
        if (h1) {
          split = SplitTextRuntime.create(h1, { type: "words" });
          tl.from(split.words, { y, duration: durBase, stagger: stg }, 0.2);
        }

        // 500-1000ms: value-prop rises (transform only — element opacity stays 1).
        if (valueProp) {
          tl.from(valueProp, { y, duration: durBase }, 0.5);
        }
      }, root);
    })();

    return () => {
      cancelled = true;
      split?.revert();
      ctx?.revert();
    };
  }, [motionEnabled]);

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
