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
 * — the lattice hover-lift toward the hovered frame (DESIGN-SPEC §3 #projects)
 * — is live in KernStage (WP-D), so each hoverRect write pokes the demand loop
 * once via `bridge.invalidate()` so the lift receives frames on enter/exit
 * (KERN WP-F: the single eager change).
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
    sceneBridge.invalidate();
  };

  const handleOut = () => {
    if (sceneBridge.hoverRect === null) return;
    sceneBridge.hoverRect = null;
    sceneBridge.invalidate();
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
