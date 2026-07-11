import { test, expect } from "@playwright/test";

const locales = ["de", "en"] as const;

/**
 * WOW-01 delivery-contract spec (04-03). The scene is capability-gated (D-07)
 * and silently absent for excluded visitors (D-10). These properties are
 * provable independent of what the canvas draws, so this spec pins the GATE,
 * not the scene interior:
 *
 *   - ?webgl=force mounts a WebGL <canvas> inside the hero background layer
 *     after first paint, WITHOUT displacing the always-present hero text (D-08).
 *     force skips the performance-caveat probe so CI SwiftShader can exercise
 *     the 3D path (RESEARCH Pattern 8 / Pitfall 3b).
 *   - ?webgl=off never mounts a canvas — the Phase-3 hero is byte-identical,
 *     no placeholder, no spinner (D-10).
 *   - prefers-reduced-motion wins over ?webgl=force (D-10 is unconditional).
 *   - a WebGL context-loss silently unmounts the canvas — the Phase-3 hero
 *     remains and NO error/toast/dialog surfaces to the visitor (D-10).
 *
 * Mirrors immersive.spec.ts (locale loop, #hero / [data-testid="hero-value-prop"]
 * selectors). Retrying web-first assertions only — the mount is idle-scheduled,
 * so no fixed sleeps.
 */

// Generous: the idle-scheduled gate runs decideSceneTier() after load, and on a
// SwiftShader CI runner Canvas creation + first render is slow.
const MOUNT_TIMEOUT = 20_000;

for (const locale of locales) {
  test.describe(`Scene gate (/${locale})`, () => {
    test("?webgl=force mounts a hero canvas without displacing the hero text (WOW-01, D-08)", async ({
      page,
    }) => {
      await page.goto(`/${locale}?webgl=force`);
      // Hero text is present from first paint and never displaced by the canvas.
      await expect(page.locator("#hero h1")).toBeVisible();
      await expect(
        page.locator('#hero [data-testid="hero-value-prop"]'),
      ).toBeVisible();
      // The gate mounts a canvas into the hero background layer after load+idle.
      await expect(page.locator("#hero canvas")).toHaveCount(1, {
        timeout: MOUNT_TIMEOUT,
      });
      // Text still visible after the canvas is alive (background layer, no reflow).
      await expect(page.locator("#hero h1")).toBeVisible();
      await expect(
        page.locator('#hero [data-testid="hero-value-prop"]'),
      ).toBeVisible();
    });

    test("?webgl=off never mounts a canvas — Phase-3 hero unchanged (D-10)", async ({
      page,
    }) => {
      await page.goto(`/${locale}?webgl=off`);
      // Wait for the page to settle (hero hydrated) using a retrying assertion,
      // then assert the gate stayed closed — no canvas, no placeholder.
      await expect(page.locator("#hero h1")).toBeVisible();
      await expect(page.locator("#hero canvas")).toHaveCount(0, {
        timeout: MOUNT_TIMEOUT,
      });
    });

    test("reduced-motion wins over ?webgl=force — no canvas (D-10 unconditional)", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/${locale}?webgl=force`);
      await expect(page.locator("#hero h1")).toBeVisible();
      await expect(page.locator("#hero canvas")).toHaveCount(0, {
        timeout: MOUNT_TIMEOUT,
      });
    });
  });
}

test.describe("Scene gate — silent context-loss fallback (D-10)", () => {
  test("webglcontextlost unmounts the canvas with no error surfaced", async ({
    page,
  }) => {
    await page.goto(`/de?webgl=force`);
    const canvas = page.locator("#hero canvas");
    await expect(canvas).toHaveCount(1, { timeout: MOUNT_TIMEOUT });

    // Dispatch the real WebGL context-loss event on the live canvas.
    await canvas.first().dispatchEvent("webglcontextlost");

    // Canvas unmounts silently — the Phase-3 hero remains.
    await expect(page.locator("#hero canvas")).toHaveCount(0, {
      timeout: MOUNT_TIMEOUT,
    });
    await expect(page.locator("#hero h1")).toBeVisible();

    // No error/toast/dialog anywhere in the DOM (D-10: nothing surfaces).
    await expect(page.locator('[role="alert"]')).toHaveCount(0);
    await expect(page.getByText(/error|failed|unavailable/i)).toHaveCount(0);
  });
});
