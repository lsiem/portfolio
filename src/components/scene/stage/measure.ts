"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sceneBridge } from "../scene-bridge";
import { SECTION_SEQUENCE } from "./section-config";
import type { DocRect, MeasuredLayout } from "./stage-types";
import type { SectionAnchor } from "./progress";

/**
 * Document-space layout measurement (DESIGN-SPEC §3 global rule, §5.1
 * Contract 2 — WP-C). ONE measurement pass turns the live DOM into the
 * `MeasuredLayout` that WP-B's `buildFormation(id, layout, count)` consumes:
 * every rect is `getBoundingClientRect() + scroll offset` — document space —
 * so formation targets are scroll-invariant and the stage group's single
 * `-scrollY * worldPerPixel` transform tracks the DOM twins per frame with
 * zero re-measurement.
 *
 * Timing contract (§3): the first measure waits for `document.fonts.ready`
 * (Bricolage metrics move every rect), re-measures on debounced-200ms resize
 * and on locale/route change (`useMeasuredLayout`'s pathname dependency), and
 * runs sliced across idle callbacks (§6.2 — each slice is a handful of rect
 * reads, far under the 50ms slice budget; the EXPENSIVE Float32Array
 * precompute downstream of `onLayout` is WP-B's to slice).
 *
 * Contract 4 side effect: each completed pass mirrors the defensively-parsed
 * heatmap levels into `sceneBridge.heatmapLevels` (this module is the chunk's
 * designated "reads the DOM once" reader; malformed/absent cells → null → the
 * grid formation's neutral wave-sheet fallback).
 */

/** Debounce for resize-triggered re-measures (§3 global rule). */
const RESIZE_DEBOUNCE_MS = 200;
/**
 * Safari has no requestIdleCallback — a short timeout keeps the slices
 * spaced without stalling the first layout for seconds (the stage-gate's
 * 1500ms idle fallback is about DELAYING work; here the work is already
 * post-idle and merely sliced).
 */
const IDLE_FALLBACK_MS = 32;
/**
 * A route transition translates <main> (TransitionLink OUT/IN, §4) — rects
 * measured mid-tween would be offset by the tween's y. Re-check cadence while
 * waiting for the bridge to report idle.
 */
const TRANSITION_RETRY_MS = 300;

const SPINE_SELECTOR = '[data-testid="career-spine"]';
const BENTO_CELL_ROOT = "#projects";
const HEATMAP_CELL_SELECTOR = "#activity [data-level]";

/**
 * Perspective-camera intrinsics needed to unproject CSS px onto the z=0 scene
 * plane. Defaults mirror the shipped constellation camera
 * (`position: [0, 0, 8], fov: 45` — constellation-canvas.tsx); WP-B's
 * StageCanvas MUST pass its own values here if its camera differs, or doc-px
 * and world units silently diverge.
 */
export interface StageCameraIntrinsics {
  /** Vertical field of view in degrees. */
  fovDeg: number;
  /** Camera distance from the z=0 plane (world units). */
  distance: number;
}

export const DEFAULT_STAGE_CAMERA: StageCameraIntrinsics = {
  fovDeg: 45,
  distance: 8,
};

/**
 * World units per CSS px on the z=0 plane — the single doc-space →
 * scene-space conversion factor (§3: "unprojected once"). Pure pinhole math,
 * no three.js import needed: the plane's visible height at `distance` is
 * `2 · tan(fov/2) · distance`, spread over the viewport height.
 */
export function computeWorldPerPixel(
  viewportHeight: number,
  camera: StageCameraIntrinsics = DEFAULT_STAGE_CAMERA,
): number {
  if (viewportHeight <= 0) return 0;
  const visibleWorldHeight =
    2 * Math.tan((camera.fovDeg * Math.PI) / 360) * camera.distance;
  return visibleWorldHeight / viewportHeight;
}

function toDocRect(el: Element, scrollX: number, scrollY: number): DocRect {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + scrollX,
    top: rect.top + scrollY,
    width: rect.width,
    height: rect.height,
  };
}

function measureSections(
  scrollX: number,
  scrollY: number,
): Record<string, DocRect> {
  const sections: Record<string, DocRect> = {};
  for (const step of SECTION_SEQUENCE) {
    const el = document.querySelector(step.el);
    if (!el) continue; // only sections present on the current route appear
    sections[step.el.replace(/^#/, "")] = toDocRect(el, scrollX, scrollY);
  }
  return sections;
}

/**
 * Doc-space x of the career rail (filament anchor). The spine is `hidden
 * lg:block` — below lg its rect collapses to zero, so fall back to the career
 * section's left edge, then the viewport center (stage-types contract).
 */
function measureSpineX(
  sections: Record<string, DocRect>,
  scrollX: number,
): number {
  const spine = document.querySelector(SPINE_SELECTOR);
  if (spine) {
    const rect = spine.getBoundingClientRect();
    if (rect.width > 0 || rect.height > 0) return rect.left + scrollX;
  }
  const career = sections["career"];
  if (career) return career.left;
  return scrollX + window.innerWidth / 2;
}

/**
 * The bento project cells: every `<li>` under #projects that is NOT nested
 * inside another `<li>` — the one-`<li>`-per-project a11y contract makes the
 * top-level `li`s exactly the cells, while the filter drops the TechChips
 * chip-`li`s nested inside them (structure-based, no class-name coupling).
 */
function measureBentoCells(scrollX: number, scrollY: number): DocRect[] {
  const root = document.querySelector(BENTO_CELL_ROOT);
  if (!root) return [];
  return Array.from(root.querySelectorAll("li"))
    .filter((cell) => !cell.parentElement?.closest("li"))
    .map((cell) => toDocRect(cell, scrollX, scrollY));
}

/**
 * Contract 4 read: the SSR heatmap's per-cell `data-level="0".."4"`, in DOM
 * order (week columns, days within). Defensive parse — ANY malformed cell
 * (or no cells at all) collapses to null so the grid formation falls back to
 * its neutral wave sheet rather than rendering garbage data.
 */
function readHeatmapLevels(): Uint8Array | null {
  const cells = document.querySelectorAll(HEATMAP_CELL_SELECTOR);
  if (cells.length === 0) return null;
  const levels = new Uint8Array(cells.length);
  for (let i = 0; i < cells.length; i++) {
    const parsed = Number(cells[i].getAttribute("data-level"));
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 4) return null;
    levels[i] = parsed;
  }
  return levels;
}

/**
 * Synchronous single-pass measurement (Contract 2). Prefer the managed
 * lifecycle (`initLayoutMeasurement` / `useMeasuredLayout`) — it owns
 * fonts.ready, idle slicing, resize, and route-change re-measures; call this
 * directly only when a caller needs an immediate ad-hoc snapshot.
 */
export function measureLayout(
  camera: StageCameraIntrinsics = DEFAULT_STAGE_CAMERA,
): MeasuredLayout {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const sections = measureSections(scrollX, scrollY);
  return {
    sections,
    bentoCells: measureBentoCells(scrollX, scrollY),
    spineX: measureSpineX(sections, scrollX),
    heatmap: readHeatmapLevels(),
    viewport: { w: window.innerWidth, h: window.innerHeight },
    worldPerPixel: computeWorldPerPixel(window.innerHeight, camera),
  };
}

/**
 * SECTION_SEQUENCE resolved against the live DOM as document-space anchors
 * for progress.ts — the shared station source for BOTH scroll producers
 * (seeding on desktop, the core loop on touch). Sections absent from the
 * current route are skipped; document order is SECTION_SEQUENCE order.
 */
export function resolveSectionAnchors(): SectionAnchor[] {
  const scrollY = window.scrollY;
  const anchors: SectionAnchor[] = [];
  for (const step of SECTION_SEQUENCE) {
    const el = document.querySelector(step.el);
    if (!el) continue;
    anchors.push({
      formation: step.formation,
      top: el.getBoundingClientRect().top + scrollY,
    });
  }
  return anchors;
}

/**
 * Upper bound on idle deferral per slice. Idle slicing is politeness, not a
 * correctness gate — each slice is a handful of rect reads. Without a
 * deadline, a starved main thread (CI contention, background tab churn) can
 * defer requestIdleCallback for SECONDS, landing the layout publish (and the
 * formation-target rebuild it triggers) long after the field settled — a
 * late one-shot re-convergence that violates the at-rest invariant R1 (§7).
 */
const IDLE_TIMEOUT_MS = 200;

function scheduleIdle(callback: () => void): () => void {
  // typeof probe, not `in` narrowing (lib.dom types the API non-optional, so
  // an `in` guard would narrow `window` to never on the Safari branch).
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(callback, {
      timeout: IDLE_TIMEOUT_MS,
    });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, IDLE_FALLBACK_MS);
  return () => window.clearTimeout(id);
}

/**
 * Managed measurement lifecycle. Awaits `document.fonts.ready`, then runs the
 * pass sliced across idle callbacks (sections+spine / bento / heatmap+
 * assemble), calls `onLayout` with the finished `MeasuredLayout`, mirrors the
 * heatmap into `sceneBridge.heatmapLevels` (Contract 4), and re-measures on
 * debounced-200ms resize. Route-change re-measures are the hook variant's
 * job. Returns a dispose function.
 *
 * A pass that starts while a route transition is mid-flight (bridge
 * `transition.phase !== "idle"` — <main> is translated by the crossfade)
 * defers itself until the field is calm so rects are never captured offset.
 */
export function initLayoutMeasurement(
  onLayout: (layout: MeasuredLayout) => void,
  camera: StageCameraIntrinsics = DEFAULT_STAGE_CAMERA,
): () => void {
  let disposed = false;
  let generation = 0;
  let cancelPending: (() => void) | undefined;
  let retryTimer = 0;
  let debounceTimer = 0;

  const run = (): void => {
    const gen = ++generation;
    void document.fonts.ready.then(() => {
      if (disposed || gen !== generation) return;

      if (sceneBridge.transition.phase !== "idle") {
        // Mid-crossfade — try again once the conductor settles (its 900ms
        // stale sweep guarantees this terminates).
        retryTimer = window.setTimeout(run, TRANSITION_RETRY_MS);
        return;
      }

      // Slice 1: sections + spine.
      cancelPending = scheduleIdle(() => {
        if (disposed || gen !== generation) return;
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const sections = measureSections(scrollX, scrollY);
        const spineX = measureSpineX(sections, scrollX);

        // Slice 2: bento cells (doc space is scroll-invariant, so each slice
        // may safely read its own scroll offset).
        cancelPending = scheduleIdle(() => {
          if (disposed || gen !== generation) return;
          const bentoCells = measureBentoCells(window.scrollX, window.scrollY);

          // Slice 3: heatmap + assemble + publish.
          cancelPending = scheduleIdle(() => {
            if (disposed || gen !== generation) return;
            const heatmap = readHeatmapLevels();
            sceneBridge.heatmapLevels = heatmap;
            onLayout({
              sections,
              bentoCells,
              spineX,
              heatmap,
              viewport: { w: window.innerWidth, h: window.innerHeight },
              worldPerPixel: computeWorldPerPixel(window.innerHeight, camera),
            });
          });
        });
      });
    });
  };

  const onResize = (): void => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(run, RESIZE_DEBOUNCE_MS);
  };

  window.addEventListener("resize", onResize, { passive: true });
  run();

  return () => {
    disposed = true;
    generation++;
    cancelPending?.();
    window.clearTimeout(retryTimer);
    window.clearTimeout(debounceTimer);
    window.removeEventListener("resize", onResize);
  };
}

/**
 * React variant for StageCanvas (WP-B): one measurement lifecycle per route —
 * `usePathname()` (locale-prefixed) re-runs it on every navigation INCLUDING
 * the DE↔EN switch, satisfying the "re-measure on locale route change" rule.
 * Call it from the DOM-side canvas wrapper (NOT inside <Canvas> — R3F's
 * reconciler doesn't carry next/navigation context).
 *
 * Pass a stable `onLayout` (module fn or useCallback) and a module-constant
 * `camera`, or every render restarts the lifecycle.
 */
export function useMeasuredLayout(
  onLayout: (layout: MeasuredLayout) => void,
  camera: StageCameraIntrinsics = DEFAULT_STAGE_CAMERA,
): void {
  const pathname = usePathname();
  // pathname is deliberately an extra dependency — it IS the re-measure
  // trigger for locale/route changes (§3), same shape as transition-conductor.
  useEffect(
    () => initLayoutMeasurement(onLayout, camera),
    [pathname, onLayout, camera],
  );
}
