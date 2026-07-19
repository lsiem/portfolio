import type { FormationId } from "../scene-bridge";

/**
 * The ONE pure scroll-progress module (DESIGN-SPEC §3 "Scroll choreography
 * wiring", Weltlinie graft). Both scroll producers import THESE functions —
 * scroll-director.ts (pointer:fine, per-boundary ScrollTriggers) and
 * touch-scroll-producer.ts (pointer:coarse, rAF-throttled listener) — so
 * section stations can never misalign between the two paths: the desktop
 * trigger geometry (`start: "top 80%"`, `end: "top 20%"`) and the touch math
 * are both derived from BOUNDARY_START/BOUNDARY_END below.
 *
 * Deliberately DOM-free, GSAP-free, and side-effect-free: every function is a
 * pure map from numbers to numbers, unit-testable without a browser (see the
 * colocated progress.test.ts — `npx tsx --test src/components/scene/stage/progress.test.ts`;
 * the repo has no unit-runner script, only Playwright, so the test is wired to
 * node:test and run ad hoc).
 */

/**
 * A section's morph boundary starts when its top edge crosses this viewport
 * fraction (ScrollTrigger `start: "top 80%"`).
 */
export const BOUNDARY_START = 0.8;
/**
 * ...and completes when the top edge reaches this fraction
 * (ScrollTrigger `end: "top 20%"`). Between BOUNDARY_END and the next
 * section's BOUNDARY_START the formation HOLDS — entrance→hold→exit beats,
 * scrubbed not timed (§3).
 */
export const BOUNDARY_END = 0.2;
/**
 * Demand-frameloop discipline (§3, §6.3): no `bridge.invalidate()` unless the
 * gated progress value moved by more than this — Lenis settle ticks must not
 * force redundant GPU frames.
 */
export const PROGRESS_EPSILON = 0.001;

/** A section station: its formation and its document-space top edge (px). */
export interface SectionAnchor {
  formation: FormationId;
  /** `rect.top + scrollY` at measure time — see measure.ts. */
  top: number;
}

/** The `bridge.formation` write shape (Contract 1). */
export interface ScrollFormationState {
  from: FormationId;
  to: FormationId;
  t: number;
}

export function clamp01(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

/**
 * Morph progress 0..1 of ONE section boundary — identical math to the desktop
 * ScrollTrigger (`start: "top ${BOUNDARY_START*100}%"`,
 * `end: "top ${BOUNDARY_END*100}%"`, scrubbed): 0 while the section top is
 * below 80% of the viewport, 1 once it has risen past 20%.
 */
export function boundaryProgress(
  anchorTop: number,
  scrollY: number,
  viewportHeight: number,
): number {
  const viewportTop = anchorTop - scrollY;
  const start = viewportHeight * BOUNDARY_START;
  const end = viewportHeight * BOUNDARY_END;
  if (start === end) return viewportTop <= end ? 1 : 0;
  return clamp01((start - viewportTop) / (start - end));
}

/**
 * Whole-page progress 0..1 (`bridge.pageProgress`, the camera-spline input).
 * Pages shorter than the viewport can't scroll — progress pins to 0.
 */
export function pageProgress(
  scrollY: number,
  documentHeight: number,
  viewportHeight: number,
): number {
  const scrollable = documentHeight - viewportHeight;
  if (scrollable <= 0) return 0;
  return clamp01(scrollY / scrollable);
}

/**
 * The full `bridge.formation` state for a scroll position: the deepest
 * boundary that has started owns the morph (last-writer-wins — exactly what
 * the desktop path's stacked per-boundary ScrollTriggers produce, so the two
 * producers agree by construction). Before the first boundary the field rests
 * in the first anchor's formation at t=0; inside a hold zone the previous
 * boundary stays fully applied at t=1.
 *
 * `anchors` must be in document order (SECTION_SEQUENCE order — measure.ts's
 * resolveSectionAnchors guarantees this). Returns null when no anchors exist
 * (non-home routes): the route formation registry owns the field there, and
 * the producer must not write `bridge.formation` at all.
 */
export function formationAt(
  anchors: readonly SectionAnchor[],
  scrollY: number,
  viewportHeight: number,
): ScrollFormationState | null {
  const first = anchors[0];
  if (!first) return null;

  let from = first.formation;
  let to = first.formation;
  let t = 0;

  for (let i = 1; i < anchors.length; i++) {
    const progress = boundaryProgress(anchors[i].top, scrollY, viewportHeight);
    // Anchors are in document order: once a boundary hasn't started, none
    // further down has either.
    if (progress <= 0) break;
    from = anchors[i - 1].formation;
    to = anchors[i].formation;
    t = progress;
  }

  return { from, to, t };
}

/**
 * The `maybeInvalidate` epsilon gate (§3): returns a function that calls
 * `onPass` (i.e. `bridge.invalidate`) only when the observed value moved more
 * than `epsilon` since the LAST value that passed — sub-epsilon steps
 * accumulate rather than getting lost, so slow scrubs still invalidate
 * eventually while Lenis settle ticks stay silent. The first call always
 * passes (seeds one frame).
 */
export function createEpsilonGate(
  onPass: () => void,
  epsilon: number = PROGRESS_EPSILON,
): (value: number) => void {
  let lastPassed = Number.NaN;
  return (value: number) => {
    if (Math.abs(value - lastPassed) <= epsilon) return; // NaN compare = false → first call passes
    lastPassed = value;
    onPass();
  };
}
