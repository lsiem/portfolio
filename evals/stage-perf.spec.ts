import { test, expect, type Page, type Locator } from "@playwright/test";

/**
 * Kontinuum at-rest invariants R1–R3 + long-task scroll smoke (WP-E;
 * DESIGN-SPEC §7 "Consciously rewritten"). The Phase-4 spec "scroll past
 * hero pauses canvas" (D-05 pause semantics, formerly in scene.spec.ts) is
 * SUPERSEDED here, not dropped: with `frameloop="demand"` there is no binary
 * run/pause state to flip mid-scroll — the equally falsifiable contract is
 * that the demand loop renders ZERO frames while nothing animates
 * (invalidation sources are enumerated exhaustively in §6.3). Decision log:
 * .planning/phases/05-threejs-kontinuum/DECISIONS.md.
 *
 * Contract 3 test hooks (rendered by WP-B in stage-canvas.tsx):
 *   - `[data-testid="stage-frameloop"]` mirrors the live Canvas frameloop as
 *     `data-frameloop="demand"|"never"` ("never" only while the tab is hidden)
 *   - `data-scene-frames="<int>"` increments once per RENDERED frame — the
 *     directly falsifiable counter (Weltlinie frame-counter eval graft).
 *
 * Fixed waits are deliberate in R1/R2 (contrast the no-fixed-sleeps rule in
 * scene.spec.ts): the at-rest claim IS about wall-clock time ("no frame
 * renders across 1000 ms of rest"), so the sleep is the measurement window
 * itself, not a wait-for-condition. Pointer stays parked (no page.mouse
 * moves) — pointer movement is a legitimate invalidation source and would
 * void the at-rest premise.
 */

// Generous: the idle-scheduled gate runs decideSceneTier() after load, and on
// a SwiftShader CI runner Canvas creation + first render is slow.
const MOUNT_TIMEOUT = 20_000;
// §7 R1 verbatim: settle 1500 ms after the scroll, then compare the frame
// counter across a 1000 ms rest window.
const SETTLE_MS = 1_500;
const REST_WINDOW_MS = 1_000;
// §7 long-task smoke: no long task above 200 ms attributable during scrub
// (matches the blocking TBT <= 200 ms Lighthouse error gate).
const LONG_TASK_BUDGET_MS = 200;

/** Mount the stage under ?webgl=force and return the Contract-3 hook node. */
async function mountStage(page: Page, path = "/de"): Promise<Locator> {
  await page.goto(`${path}?webgl=force`);
  await expect(page.locator("canvas")).toHaveCount(1, {
    timeout: MOUNT_TIMEOUT,
  });
  const frameloopNode = page.locator('[data-testid="stage-frameloop"]');
  await expect(frameloopNode).toHaveAttribute("data-frameloop", "demand", {
    timeout: MOUNT_TIMEOUT,
  });
  return frameloopNode;
}

/** Read the Contract-3 rendered-frame counter. */
async function readFrames(frameloopNode: Locator): Promise<number> {
  const raw = await frameloopNode.getAttribute("data-scene-frames");
  const frames = Number(raw);
  expect(
    Number.isFinite(frames),
    `data-scene-frames must be an integer, got ${JSON.stringify(raw)}`,
  ).toBe(true);
  return frames;
}

test.describe("Stage at-rest invariants (§7 R1–R3, supersedes D-05 pause)", () => {
  test("R1: mid-page at rest, zero frames render across a 1000ms window", async ({
    page,
  }) => {
    const frameloopNode = await mountStage(page);

    // Mid-page = #skills (§7): outside the #hero/#contact ambient windows,
    // so the IntersectionObserver-gated ambient producer must be OFF and no
    // other invalidation source fires without input.
    await page.locator("#skills").scrollIntoViewIfNeeded();
    // Let the scroll-driven morph, Lenis settle ticks (epsilon-gated, §3) and
    // any decaying velocity lerps snap to rest — this is the "wait 1500 ms
    // with no input" precondition of the invariant, not a race hack.
    await page.waitForTimeout(SETTLE_MS);

    const framesBefore = await readFrames(frameloopNode);
    await page.waitForTimeout(REST_WINDOW_MS);
    const framesAfter = await readFrames(frameloopNode);
    // EQUAL, not "close": a single rendered frame at rest is a demand-loop
    // leak (a producer that never stops invalidating, §6.3 leak guard).
    expect(framesAfter).toBe(framesBefore);
  });

  test("R2: with #hero in view, the frame counter increments (ambient alive)", async ({
    page,
  }) => {
    const frameloopNode = await mountStage(page);
    // Load lands at the top: #hero intersects the viewport, so the ambient
    // drift producer (rAF, IntersectionObserver-gated) must keep the demand
    // loop breathing — the field is alive, not a frozen first frame.
    const baseline = await readFrames(frameloopNode);
    await expect
      .poll(async () => readFrames(frameloopNode), { timeout: MOUNT_TIMEOUT })
      .toBeGreaterThan(baseline);
  });

  test('R3: hiding the tab flips the frameloop to "never"; revealing restores "demand"', async ({
    page,
  }) => {
    const frameloopNode = await mountStage(page);

    // Playwright can't genuinely background a tab, so emulate the Page
    // Visibility API the way the visibilitychange producer consumes it:
    // override the readonly getters (configurable, instance-level) and fire
    // the event. The stage must flip frameloop to "never" + bridge.paused.
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "hidden",
      });
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(frameloopNode).toHaveAttribute("data-frameloop", "never", {
      timeout: MOUNT_TIMEOUT,
    });

    // Deleting the instance overrides restores the prototype getters —
    // the tab is "visible" again and the stage must resume demand rendering.
    await page.evaluate(() => {
      delete (document as { visibilityState?: unknown }).visibilityState;
      delete (document as { hidden?: unknown }).hidden;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(frameloopNode).toHaveAttribute("data-frameloop", "demand", {
      timeout: MOUNT_TIMEOUT,
    });
  });
});

test.describe("Stage long-task scroll smoke (§7 — real, not theater)", () => {
  test("a full-page scrub under ?webgl=force produces no long task > 200ms", async ({
    page,
  }) => {
    // Install the observer before ANY page script so nothing escapes it;
    // buffered:true also catches tasks between navigation and observe().
    await page.addInitScript(() => {
      const probe = window as Window & { __longTasks?: number[] };
      probe.__longTasks = [];
      if (
        typeof PerformanceObserver !== "undefined" &&
        PerformanceObserver.supportedEntryTypes?.includes("longtask")
      ) {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            probe.__longTasks?.push(entry.duration);
          }
        }).observe({ type: "longtask", buffered: true });
      }
    });

    const frameloopNode = await mountStage(page);
    const supported = await page.evaluate(() =>
      PerformanceObserver.supportedEntryTypes?.includes("longtask"),
    );
    test.skip(!supported, "longtask PerformanceObserver not supported");

    // Attribution boundary: boot work (hydration, chunk compile, formation
    // precompute — idle-sliced per §6.2 but not under this budget) is not
    // "during scrub". Reset the collector once the stage is idle-mounted.
    await page.evaluate(() => {
      (window as Window & { __longTasks?: number[] }).__longTasks = [];
    });

    // Scrub the full page with real wheel input (drives Lenis + the scroll
    // director exactly like a visitor), bounded so a broken page can't loop
    // forever. The short pauses pace the scrub across rAF ticks — they are
    // part of simulating a human scroll, not condition-waits.
    const maxSteps = 40;
    for (let step = 0; step < maxSteps; step += 1) {
      await page.mouse.wheel(0, 800);
      await page.waitForTimeout(100);
      const atBottom = await page.evaluate(
        () =>
          window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 2,
      );
      if (atBottom) break;
    }

    const longTasks = await page.evaluate(
      () => (window as Window & { __longTasks?: number[] }).__longTasks ?? [],
    );
    const overBudget = longTasks.filter(
      (duration) => duration > LONG_TASK_BUDGET_MS,
    );
    expect(
      overBudget,
      `long tasks over ${LONG_TASK_BUDGET_MS}ms during full-page scrub: ${overBudget
        .map((d) => `${Math.round(d)}ms`)
        .join(", ")}`,
    ).toEqual([]);

    // Sanity: the scrub actually exercised the render path (frames were
    // produced), so an empty long-task list can't be a dead-canvas artifact.
    expect(await readFrames(frameloopNode)).toBeGreaterThan(0);
  });
});
