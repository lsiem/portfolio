"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import type { CareerEntry } from "../../../content/shared/types";

gsap.registerPlugin(ScrollTrigger);

/**
 * Progress spine (D-07) — a vertical coordinate rail with per-chapter tick
 * labels (`NN·YYYY`) that orients the reader through the career section on lg+
 * screens, plus an accent fill segment that grows with scroll progress.
 *
 * - lg+ only (`hidden lg:block`); below lg the chapter/year context already
 *   lives in the visible per-entry dates, so the spine is cleanly absent with no
 *   information loss (D-19).
 * - The tick marks are decorative and `aria-hidden` — the dates are already in
 *   the visible DOM, so no duplicate screen-reader text (github-heatmap
 *   discipline).
 * - The fill is transform-only (`scaleY`, compositor-friendly — never
 *   width/height) and driven by a `ScrollTrigger` `onUpdate` over the career
 *   section's scroll range. NO pinning / no scrolljacking (D-05).
 * - Reduced-motion: no ScrollTrigger is created; the rail + ticks render
 *   statically and the fill stays at rest (UI-SPEC Reduced-Motion Contract).
 * - Accent is limited to the fill segment + active-adjacent tick (UI-SPEC
 *   exhaustive accent list item 3).
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

  useGSAP(() => {
    const fill = fillRef.current;
    if (!fill) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
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
      return () => trigger.kill();
    });

    // Reduced-motion branch intentionally creates no ScrollTrigger — the rail +
    // ticks stay static and the fill rests at scaleY 0.

    return () => mm.revert();
  });

  return (
    <div
      data-testid="career-spine"
      aria-hidden="true"
      className="hidden lg:block"
    >
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
