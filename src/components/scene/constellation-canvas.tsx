"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { SceneTier } from "@/lib/capability";
import { Constellation } from "./constellation";
import { sceneBridge } from "./scene-bridge";

/**
 * Lazy chunk entry for the hero WebGL scene (RESEARCH Code Example 3). This is
 * the DEFAULT export that `hero-scene-gate.tsx` pulls via
 * `dynamic(() => import("./constellation-canvas"), { ssr: false })`, so
 * three + @react-three/fiber live entirely in this async-only chunk and never
 * touch the eager route bundle (WOW-01 "nie im Initial-Bundle").
 *
 * Silent context-loss fallback (D-10, success criterion 2 / RESEARCH Pattern 6):
 * on `webglcontextlost` the component unmounts the <Canvas> (returns null) — no
 * preventDefault, no restore machinery, no error surfaced. The Phase-3 hero
 * remains.
 *
 * D-05 scroll-linked exit — BOTH progress sources write the same
 * `sceneBridge.scrollProgress` (RESEARCH Pitfall 8, since ScrollTrigger only
 * exists when the DOM motion stack is up, i.e. `pointer: fine`):
 *   - pointer:fine (desktop): a lazy ScrollTrigger over `#hero`
 *     (career-spine.tsx's pattern) with `onLeave`/`onEnterBack` flipping the
 *     run state exactly once per threshold crossing.
 *   - otherwise (capable touch device, no ScrollTrigger): a passive,
 *     rAF-throttled scroll/resize listener computing the same exit progress
 *     from `#hero`'s bounding rect (reveal.tsx's IntersectionObserver-touch
 *     precedent, adapted to a CONTINUOUS progress value).
 * Both paths funnel through `syncRunState()`, which is also the
 * `visibilitychange` handler — pause-first (RESEARCH Pattern 7): flips
 * `<Canvas frameloop>` to "never" and sets `sceneBridge.paused`, profiled to
 * be sufficient (a few hundred KB of retained buffers; see 04-04 SUMMARY) —
 * full unmount was NOT needed.
 *
 * Test hook (04-04 Task 2 acceptance): the wrapping `data-frameloop`
 * attribute on `[data-testid="constellation-frameloop"]` mirrors the live
 * `<Canvas frameloop>` value ("always" | "never") so evals/scene.spec.ts can
 * assert the exit-pause deterministically without reading WebGL state.
 */

const HERO_SELECTOR = "#hero";

export default function ConstellationCanvas({ tier }: { tier: SceneTier }) {
  const [lost, setLost] = useState(false);
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");
  const exitedRef = useRef(false);

  useEffect(() => {
    if (tier === "none") return undefined;
    const heroEl = document.querySelector<HTMLElement>(HERO_SELECTOR);
    if (!heroEl) return undefined;

    let cancelled = false;
    let cleanupScroll: (() => void) | undefined;

    function syncRunState(): void {
      const shouldRun =
        !exitedRef.current && document.visibilityState === "visible";
      sceneBridge.paused = !shouldRun;
      setFrameloop(shouldRun ? "always" : "never");
    }

    const pointerFine = window.matchMedia("(pointer: fine)").matches;

    if (pointerFine) {
      // Desktop: reuse the repo's canonical lazy ScrollTrigger progress scrub
      // (career-spine.tsx lines 81-105) — cancelled flag + teardown.
      void (async () => {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const trigger = ScrollTrigger.create({
          trigger: heroEl,
          start: "bottom bottom",
          end: "bottom top",
          onUpdate: (self) => {
            sceneBridge.scrollProgress = self.progress;
          },
          onLeave: () => {
            exitedRef.current = true;
            syncRunState();
          },
          onEnterBack: () => {
            exitedRef.current = false;
            syncRunState();
          },
        });
        cleanupScroll = () => trigger.kill();
      })();
    } else {
      // Touch fallback (RESEARCH Pitfall 8 — no ScrollTrigger without the
      // pointer:fine motion stack): passive, rAF-throttled scroll listener
      // computing the same continuous exit progress from the hero's
      // bounding rect (reveal.tsx's IntersectionObserver precedent, adapted
      // to a continuous value rather than a boolean trigger).
      let ticking = false;
      const computeProgress = (): number => {
        const rect = heroEl.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        if (rect.bottom <= 0) return 1; // fully scrolled past
        if (rect.bottom >= viewportHeight) return 0; // not yet exiting
        return 1 - rect.bottom / viewportHeight;
      };
      const onScroll = (): void => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          ticking = false;
          const progress = computeProgress();
          sceneBridge.scrollProgress = progress;
          const nowExited = progress >= 1;
          if (nowExited !== exitedRef.current) {
            exitedRef.current = nowExited;
            syncRunState();
          }
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      onScroll();
      cleanupScroll = () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }

    const onVisibilityChange = (): void => syncRunState();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      cleanupScroll?.();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [tier]);

  if (lost) return null; // D-10 fallback = Phase-3 hero
  if (tier === "none") return null; // defensive — gate should never pass "none" here

  return (
    <div
      data-testid="constellation-frameloop"
      data-frameloop={frameloop}
      className="contents"
    >
      <Canvas
        frameloop={frameloop}
        dpr={tier === "mobile" ? [1, 1.25] : [1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        camera={{ position: [0, 0, 8], fov: 45 }}
        onCreated={({ gl }) => {
          // No preventDefault / no restore — silent unmount only (Pattern 6).
          // once:true — after the first loss the component returns null and the
          // canvas unmounts, so the listener self-cleans and never re-fires.
          gl.domElement.addEventListener(
            "webglcontextlost",
            () => setLost(true),
            { once: true },
          );
        }}
      >
        <Constellation tier={tier} />
      </Canvas>
    </div>
  );
}
