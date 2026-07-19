/**
 * Rolling frame-time self-monitor (Kontinuum WP-B; DESIGN-SPEC §2.1 "no
 * drei" / §6.3 runtime ladder). Replaces drei's PerformanceMonitor, which is
 * architecturally mismatched with a demand frameloop: it infers quality from
 * inter-frame deltas, and under sparse invalidation a long *gap between*
 * frames is indistinguishable from a slow frame (the Weltlinie judge finding,
 * resolved by not using it).
 *
 * This monitor therefore only samples deltas that can plausibly BE a frame
 * time — consecutive rendered frames during active animation (delta below
 * `ignoreAboveMs`). A demand-loop idle gap of seconds is discarded, never
 * counted as jank. When `windowSize` CONSECUTIVE plausible samples all exceed
 * the budget ("sustained >24ms", §6.3), it latches and reports ONCE; the
 * caller then halves the particle pool and clamps dpr to 1. One rung, one
 * direction — no oscillating quality ladder.
 */

/** §6.3: sustained frame time above this ⇒ degrade (≈ missing 40 fps). */
const DEFAULT_BUDGET_MS = 24;
/** Consecutive over-budget frames required before degrading (~0.75s of jank). */
const DEFAULT_WINDOW_SIZE = 30;
/** Deltas above this are demand-loop idle gaps, not frame times — discarded. */
const DEFAULT_IGNORE_ABOVE_MS = 250;

export interface FrameMonitor {
  /**
   * Feed one `useFrame` delta (SECONDS, as R3F provides it). Returns true
   * exactly once — on the sample that trips the sustained-jank latch.
   */
  sample(deltaSeconds: number): boolean;
  /** Whether the ladder has already fired (the latch). */
  readonly degraded: boolean;
}

export function createFrameMonitor(
  options: {
    budgetMs?: number;
    windowSize?: number;
    ignoreAboveMs?: number;
  } = {},
): FrameMonitor {
  const budgetMs = options.budgetMs ?? DEFAULT_BUDGET_MS;
  const windowSize = options.windowSize ?? DEFAULT_WINDOW_SIZE;
  const ignoreAboveMs = options.ignoreAboveMs ?? DEFAULT_IGNORE_ABOVE_MS;

  let consecutiveOverBudget = 0;
  let degraded = false;

  return {
    get degraded(): boolean {
      return degraded;
    },
    sample(deltaSeconds: number): boolean {
      if (degraded) return false;
      const deltaMs = deltaSeconds * 1000;
      if (deltaMs > ignoreAboveMs) {
        // Idle gap between demand frames — not evidence of anything.
        consecutiveOverBudget = 0;
        return false;
      }
      if (deltaMs <= budgetMs) {
        consecutiveOverBudget = 0;
        return false;
      }
      consecutiveOverBudget += 1;
      if (consecutiveOverBudget < windowSize) return false;
      degraded = true;
      return true;
    },
  };
}
