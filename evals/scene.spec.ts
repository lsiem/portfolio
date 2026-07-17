import { test, expect } from "@playwright/test";
import { sceneTierFromGpu } from "../src/lib/capability";

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

test.describe("Scene delivery — no third-party fetch (WOW-01, DSGVO)", () => {
  test("a forced 3D run issues zero cross-origin requests (detect-gpu benchmarks are same-origin)", async ({
    page,
    baseURL,
  }) => {
    const foreign: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (!/^https?:/.test(url)) return; // ignore data:/blob:
      if (baseURL && url.startsWith(baseURL)) return; // same-origin app
      foreign.push(url);
    });
    await page.goto(`/de?webgl=force`);
    await expect(page.locator("#hero canvas")).toHaveCount(1, {
      timeout: MOUNT_TIMEOUT,
    });
    // No unpkg (detect-gpu default CDN) and nothing else off-origin — the
    // benchmarks are served from /benchmarks (AGENTS.md DSGVO, T-04-03-02).
    expect(foreign.filter((u) => /unpkg\.com/.test(u))).toEqual([]);
    expect(
      foreign,
      `unexpected cross-origin requests during forced 3D run: ${foreign.join(", ")}`,
    ).toEqual([]);
  });
});

test.describe("Scene gate — silent context-loss fallback (D-10)", () => {
  test("webglcontextlost unmounts the canvas with no error surfaced", async ({
    page,
  }) => {
    // A native dialog would be an error surface — fail if one ever opens.
    let dialogOpened = false;
    page.on("dialog", (d) => {
      dialogOpened = true;
      void d.dismiss();
    });
    await page.goto(`/de?webgl=force`);
    const canvas = page.locator("#hero canvas");
    await expect(canvas).toHaveCount(1, { timeout: MOUNT_TIMEOUT });

    // Baseline: any alert/status text present BEFORE the loss (framework
    // elements like Next's route announcer are always-present and empty).
    const liveRegions = page.locator('[role="alert"], [role="status"]');
    const announcedBefore = (await liveRegions.allInnerTexts()).join("|");

    // Dispatch the real WebGL context-loss event on the live canvas, retrying:
    // the canvas element is in the DOM before R3F's onCreated attaches the
    // webglcontextlost listener, so re-dispatch (idempotent) until the gate
    // unmounts. No fixed sleep — the poll IS the wait for the listener.
    await expect
      .poll(
        async () => {
          await canvas
            .first()
            .dispatchEvent("webglcontextlost")
            .catch(() => {}); // element gone once it unmounts — that's success
          return page.locator("#hero canvas").count();
        },
        { timeout: MOUNT_TIMEOUT },
      )
      .toBe(0);
    await expect(page.locator("#hero h1")).toBeVisible();

    // Nothing surfaces to the visitor (D-10): the context loss announced no NEW
    // alert/status text and opened no native dialog. (Comparing before/after
    // tolerates always-present empty framework live-regions; a DOM-wide text
    // regex is the wrong tool — it false-positives on RSC payload <script>s.)
    const announcedAfter = (await liveRegions.allInnerTexts()).join("|");
    expect(announcedAfter).toBe(announcedBefore);
    expect(dialogOpened).toBe(false);
  });
});

test.describe("Scene gate — scroll-linked exit pauses rendering (D-05, 04-04)", () => {
  /**
   * Deterministic test hook (04-04 Task 2 acceptance): constellation-canvas.tsx
   * mirrors its live `<Canvas frameloop>` value onto a
   * `data-frameloop="always"|"never"` attribute on
   * `[data-testid="constellation-frameloop"]` — WebGL render state itself
   * isn't directly assertable from Playwright, so this DOM attribute is the
   * chosen, documented hook.
   */
  test("scrolling past the hero pauses the canvas; scrolling back resumes it", async ({
    page,
  }) => {
    await page.goto(`/de?webgl=force`);
    const canvas = page.locator("#hero canvas");
    await expect(canvas).toHaveCount(1, { timeout: MOUNT_TIMEOUT });
    const frameloopNode = page.locator(
      '[data-testid="constellation-frameloop"]',
    );
    await expect(frameloopNode).toHaveAttribute(
      "data-frameloop",
      "always",
      { timeout: MOUNT_TIMEOUT },
    );

    // Scroll well past the hero (bottom of the document) — the exit must
    // work whether the ScrollTrigger (pointer:fine) or the passive
    // scroll-listener fallback (touch) is the active progress source.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(frameloopNode).toHaveAttribute("data-frameloop", "never", {
      timeout: MOUNT_TIMEOUT,
    });
    // The canvas element itself stays mounted (pause, not unmount — D-05
    // pause-first) — the Phase-3 hero text is unaffected either way.
    await expect(canvas).toHaveCount(1);

    // Scrolling back resumes rendering.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(frameloopNode).toHaveAttribute("data-frameloop", "always", {
      timeout: MOUNT_TIMEOUT,
    });
  });
});

test.describe("GPU tier classification (04-06, UAT #4)", () => {
  test("classifies FALLBACK desktop GPU as desktop (M5 Pro reproduction)", () => {
    expect(
      sceneTierFromGpu({ tier: 1, type: "FALLBACK", isMobile: false })
    ).toBe("desktop");
  });

  test("classifies FALLBACK mobile GPU as mobile", () => {
    expect(
      sceneTierFromGpu({ tier: 1, type: "FALLBACK", isMobile: true })
    ).toBe("mobile");
  });

  test("classifies BENCHMARK tier < 2 GPU as none (exclusion preserved)", () => {
    expect(
      sceneTierFromGpu({ tier: 1, type: "BENCHMARK", isMobile: false })
    ).toBe("none");
  });

  test("classifies BENCHMARK tier >= 2 desktop GPU as desktop", () => {
    expect(
      sceneTierFromGpu({ tier: 2, type: "BENCHMARK", isMobile: false })
    ).toBe("desktop");
  });

  test("classifies BENCHMARK tier >= 2 mobile GPU as mobile", () => {
    expect(
      sceneTierFromGpu({ tier: 3, type: "BENCHMARK", isMobile: true })
    ).toBe("mobile");
  });

  test("classifies BLOCKLISTED GPU as none", () => {
    expect(
      sceneTierFromGpu({ tier: 0, type: "BLOCKLISTED", isMobile: false })
    ).toBe("none");
  });

  test("classifies WEBGL_UNSUPPORTED GPU as none", () => {
    expect(
      sceneTierFromGpu({ tier: 0, type: "WEBGL_UNSUPPORTED", isMobile: false })
    ).toBe("none");
  });
});
