"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { CareerEntry } from "../../../content/shared/types";

// Reduced-motion gate (reveals/spine stay on touch per D-19; gate on
// reduced-motion only). useSyncExternalStore per the repo lint convention.
function subscribeReducedMotion(callback: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSpineEnabledSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Progress spine (D-07) — a vertical coordinate rail with per-chapter tick
 * labels (`NN·YYYY`) that orients the reader through the career section on lg+
 * screens, plus an accent fill segment that grows with scroll progress.
 *
 * - lg+ only (`hidden lg:block`); below lg the chapter/year context already
 *   lives in the visible per-entry dates, so the spine is cleanly absent with no
 *   information loss (D-19).
 * - Tick marks are decorative and `aria-hidden` — the dates are already in the
 *   visible DOM (github-heatmap discipline).
 * - The fill is transform-only (`scaleY`, compositor-friendly) driven by a
 *   `ScrollTrigger` `onUpdate` over the career section's scroll range. NO
 *   pinning / no scrolljacking (D-05).
 * - Bundle discipline (finding #1, mirrors Reveal/HeroIntro): gsap +
 *   ScrollTrigger are lazily dynamic-imported only when motion is enabled, so
 *   they stay out of the eager bundle. Under reduced-motion nothing is imported
 *   and the rail + ticks render statically with the fill at rest (UI-SPEC
 *   Reduced-Motion Contract).
 * - Accent is limited to the fill segment (UI-SPEC exhaustive accent list #3).
 */
type CareerSpineProps = {
  entries: readonly CareerEntry[];
  /** id of the section whose scroll range drives the fill (default "career") */
  targetId?: string;
};

function startYear(entry: CareerEntry): string {
  return entry.from.split("-")[0] ?? "";
}

export function CareerSpine({
  entries,
  targetId = "career",
}: CareerSpineProps) {
  const fillRef = useRef<HTMLSpanElement>(null);
  const motionEnabled = useSyncExternalStore(
    subscribeReducedMotion,
    getSpineEnabledSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!motionEnabled) return;
    const fill = fillRef.current;
    if (!fill) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      gsap.set(fill, { scaleY: 0, transformOrigin: "top center" });
      const trigger = ScrollTrigger.create({
        trigger: `#${targetId}`,
        start: "top center",
        end: "bottom center",
        // Transform-only scrub via onUpdate — no `pin`, no scroll hijack (D-05).
        onUpdate: (self) => {
          gsap.set(fill, { scaleY: self.progress });
        },
      });
      cleanup = () => trigger.kill();
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [motionEnabled, targetId]);

  return (
    <div data-testid="career-spine" aria-hidden="true" className="hidden lg:block">
      <div className="sticky top-24 flex h-[70vh] flex-col">
        <div className="relative h-full w-px shrink-0 self-start bg-border">
          {/* Accent progress fill — grows top→bottom with scroll (transform). */}
          <span
            ref={fillRef}
            className="absolute inset-x-0 top-0 h-full origin-top bg-accent"
          />
        </div>
        {/* Coordinate ticks — one per career chapter, decorative. */}
        <ol className="pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-between py-1">
          {entries.map((entry, index) => {
            const label = `${String(index + 1).padStart(2, "0")}·${startYear(entry)}`;
            return (
              <li
                key={entry.slug}
                className="flex items-center gap-1.5 font-mono text-[0.625rem] leading-none text-muted"
              >
                <span className="block h-px w-2 bg-border" />
                <span className="whitespace-nowrap">{label}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
