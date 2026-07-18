"use client";

import type { PointerEvent, ReactNode } from "react";
import { sceneBridge } from "@/components/scene/scene-bridge";

/**
 * Bento hover producer (Phase-5 WP-D, DESIGN-SPEC §3 #projects). ProjectBento
 * is a Server Component, so the pointer listener lives in this thin client
 * boundary: a boxless `display: contents` wrapper (the bento grid layout and
 * the one-<li>-per-project a11y contract are untouched) that delegates
 * pointerover/out from the project cells and writes the hovered cell's
 * DOCUMENT-space rect to `bridge.hoverRect` (frozen Contract 1). The consumer
 * — the lattice tighten toward the hovered frame (DESIGN-SPEC §3 #projects) —
 * is deliberately deferred: nothing reads `hoverRect` yet, so this producer
 * does NOT poke the demand loop; the `invalidate()` call returns together
 * with the consumer.
 *
 * Inert-safe (D-08): without a mounted canvas the writes are dead letters —
 * excluded visitors pay two no-op event handlers, nothing else. pointer:fine
 * only (D-06): on touch every event is a cheap early return, and the
 * out-handler bails before its write.
 */
export function BentoHover({ children }: { children: ReactNode }) {
  const handleOver = (event: PointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const cell = (event.target as Element).closest("li");
    if (!cell) return;
    const rect = cell.getBoundingClientRect();
    // Document space (§3 global rule): viewport rect + scroll offset, so the
    // scene's single scroll-compensating group transform tracks it exactly.
    sceneBridge.hoverRect = {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      w: rect.width,
      h: rect.height,
    };
  };

  const handleOut = () => {
    if (sceneBridge.hoverRect === null) return;
    sceneBridge.hoverRect = null;
  };

  return (
    <div
      style={{ display: "contents" }}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
    >
      {children}
    </div>
  );
}
