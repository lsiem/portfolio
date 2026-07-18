import { test, expect } from "@playwright/test";
import { sceneTierFromGpu } from "../src/lib/capability";
import { getCaseStudies, getPages } from "../src/lib/content";

const locales = ["de", "en"] as const;

/**
 * Kontinuum stage-gate delivery-contract spec (WP-E; DESIGN-SPEC §2.1/§7),
 * evolved from the 04-03 hero-gate spec. The scene is capability-gated (D-07)
 * and silently absent for excluded visitors (D-10) — those semantics are
 * UNCHANGED; what moved is the mount point: the canvas now lives in the
 * layout-level StageSlot (fixed, -z-10, aria-hidden), persistent across
 * routes, never inside #hero. These properties are provable independent of
 * what the canvas draws, so this spec pins the GATE, not the scene interior:
 *
 *   - ?webgl=force mounts exactly one WebGL <canvas> (layout level) after
 *     window load + idle, WITHOUT displacing the always-present hero text
 *     (D-08). force skips the performance-caveat probe so CI SwiftShader can
 *     exercise the 3D path (RESEARCH Pattern 8 / Pitfall 3b).
 *   - the mounted stage carries the Contract-3 hook
 *     `[data-testid="stage-frameloop"][data-frameloop="demand"]` — demand is
 *     the ONLY steady frameloop (§6.3); "never" appears only when hidden
 *     (asserted in stage-perf.spec.ts R3).
 *   - ?webgl=off never mounts a canvas — the DOM site is byte-identical,
 *     no placeholder, no spinner (D-10).
 *   - prefers-reduced-motion wins over ?webgl=force (D-10 is unconditional).
 *   - the gate applies on EVERY route class (per-route gating, §3): the
 *     case-study "halo" and prose/legal "rest" StageFormation markers must
 *     mount the same single canvas under force and nothing when excluded.
 *   - NO canvas exists before the idle decision (§7 new check): the gate is
 *     structurally post-load, guarding the "one review away from ungated"
 *     hazard that caused the d9b8e57 revert.
 *   - a WebGL context-loss silently unmounts the canvas — the DOM site
 *     remains and NO error/toast/dialog surfaces to the visitor (D-10).
 *
 * The Phase-4 "scroll past hero pauses canvas" describe (D-05) is NOT here
 * anymore — it is consciously superseded by the at-rest invariants R1–R3 in
 * evals/stage-perf.spec.ts (§7 "Consciously rewritten"; see
 * .planning/phases/05-threejs-kontinuum/DECISIONS.md).
 *
 * Retrying web-first assertions only — the mount is idle-scheduled, so no
 * fixed sleeps (stage-perf.spec.ts documents its own, different rule).
 */

// Generous: the idle-scheduled gate runs decideSceneTier() after load, and on a
// SwiftShader CI runner Canvas creation + first render is slow.
const MOUNT_TIMEOUT = 20_000;

for (const locale of locales) {
  test.describe(`Stage gate (/${locale})`, () => {
    test("?webgl=force mounts the layout-level stage canvas without displacing the hero text (WOW-01, D-08)", async ({
      page,
    }) => {
      await page.goto(`/${locale}?webgl=force`);
      // Hero text is present from first paint and never displaced by the canvas.
      await expect(page.locator("#hero h1")).toBeVisible();
      await expect(
        page.locator('#hero [data-testid="hero-value-prop"]'),
      ).toBeVisible();
      // The gate mounts exactly ONE canvas after load+idle — layout-level
      // StageSlot, never inside the hero (the Phase-4 in-hero slot is retired).
      await expect(page.locator("canvas")).toHaveCount(1, {
        timeout: MOUNT_TIMEOUT,
      });
      await expect(page.locator("#hero canvas")).toHaveCount(0);
      // Contract 3: the stage wrapper mirrors the live frameloop; "demand" is
      // the only steady value (§6.3) — "always" would be the reverted
      // architecture leaking back in.
      await expect(
        page.locator('[data-testid="stage-frameloop"]'),
      ).toHaveAttribute("data-frameloop", "demand", { timeout: MOUNT_TIMEOUT });
      // Text still visible after the canvas is alive (background layer, no reflow).
      await expect(page.locator("#hero h1")).toBeVisible();
      await expect(
        page.locator('#hero [data-testid="hero-value-prop"]'),
      ).toBeVisible();
    });

    test("?webgl=off never mounts a canvas — DOM site unchanged (D-10)", async ({
      page,
    }) => {
      await page.goto(`/${locale}?webgl=off`);
      // Wait for the page to settle (hero hydrated) using a retrying assertion,
      // then assert the gate stayed closed — no canvas, no placeholder.
      await expect(page.locator("#hero h1")).toBeVisible();
      await expect(page.locator("canvas")).toHaveCount(0, {
        timeout: MOUNT_TIMEOUT,
      });
    });

    test("reduced-motion wins over ?webgl=force — no canvas (D-10 unconditional)", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/${locale}?webgl=force`);
      await expect(page.locator("#hero h1")).toBeVisible();
      await expect(page.locator("canvas")).toHaveCount(0, {
        timeout: MOUNT_TIMEOUT,
      });
    });
  });
}

test.describe("Stage gate — per-route canvas gating (§3 route registry)", () => {
  /**
   * The stage is mounted by the [locale] layout, so EVERY route class must
   * obey the same gate: case studies (StageFormation "halo") and prose/legal
   * pages (StageFormation "rest") mount the single canvas under force and
   * nothing when excluded. Routes derive from the content-model SSOT
   * (src/lib/content.ts) like evals/launch/stopwatch.spec.ts, so new slugs
   * are covered automatically.
   */
  for (const locale of locales) {
    const caseStudyPath = `/${locale}/case-studies/${getCaseStudies(locale)[0].slug}`;
    // First non-about prose page = a legal page (impressum) — legal pages
    // must not perform (§3 "rest"), but the GATE semantics are identical.
    const legalSlug = getPages(locale).find(
      (prosePage) => prosePage.slug !== "about",
    )?.slug;
    const legalPath = `/${locale}/${legalSlug}`;

    for (const path of [caseStudyPath, legalPath]) {
      test(`?webgl=force mounts one canvas on ${path}; ?webgl=off mounts none`, async ({
        page,
      }) => {
        await page.goto(`${path}?webgl=force`);
        await expect(page.locator("main h1")).toBeVisible();
        await expect(page.locator("canvas")).toHaveCount(1, {
          timeout: MOUNT_TIMEOUT,
        });
        await expect(
          page.locator('[data-testid="stage-frameloop"]'),
        ).toHaveAttribute("data-frameloop", "demand", {
          timeout: MOUNT_TIMEOUT,
        });

        await page.goto(`${path}?webgl=off`);
        await expect(page.locator("main h1")).toBeVisible();
        await expect(page.locator("canvas")).toHaveCount(0, {
          timeout: MOUNT_TIMEOUT,
        });
      });
    }
  }
});

test.describe("Stage gate — zero canvas before the idle decision (§7 new check)", () => {
  test("no canvas ever exists before window load — the mount is strictly post-load+idle", async ({
    page,
  }) => {
    // A MutationObserver installed before ANY page script records
    // document.readyState at the moment the first <canvas> enters the DOM.
    // This is the structural guard against the reverted d9b8e57 architecture
    // (a Canvas hoisted above the gate renders during hydration, i.e. before
    // readyState === "complete") — an after-the-fact count can't catch that.
    await page.addInitScript(() => {
      const probe = window as Window & {
        __canvasReadyStateAtInsert?: string | null;
      };
      probe.__canvasReadyStateAtInsert = null;
      const observer = new MutationObserver(() => {
        if (
          probe.__canvasReadyStateAtInsert === null &&
          document.querySelector("canvas")
        ) {
          probe.__canvasReadyStateAtInsert = document.readyState;
          observer.disconnect();
        }
      });
      observer.observe(document, { childList: true, subtree: true });
    });

    // goto resolves at the window load event — at that instant the decision
    // (idle callback -> decideSceneTier -> dynamic chunk fetch) has not run,
    // so the canvas count must still be 0. Non-retrying on purpose: this is
    // a point-in-time claim, not a wait-for-condition.
    await page.goto(`/de?webgl=force`);
    expect(await page.locator("canvas").count()).toBe(0);

    // The gate then opens normally…
    await expect(page.locator("canvas")).toHaveCount(1, {
      timeout: MOUNT_TIMEOUT,
    });

    // …and the observer proves the first canvas insertion happened strictly
    // after load ("complete"), never during parse/hydration.
    const readyStateAtInsert = await page.evaluate(
      () =>
        (window as Window & { __canvasReadyStateAtInsert?: string | null })
          .__canvasReadyStateAtInsert,
    );
    expect(readyStateAtInsert).toBe("complete");
  });
});

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
    await expect(page.locator("canvas")).toHaveCount(1, {
      timeout: MOUNT_TIMEOUT,
    });
    // No unpkg (detect-gpu default CDN) and nothing else off-origin — the
    // benchmarks are served from /benchmarks (AGENTS.md DSGVO, T-04-03-02),
    // and the Kontinuum stage adds zero new network requests of any kind
    // (procedural + build-time-sampled geometry, DESIGN-SPEC §6.2).
    expect(foreign.filter((u) => /unpkg\.com/.test(u))).toEqual([]);
    expect(
      foreign,
      `unexpected cross-origin requests during forced 3D run: ${foreign.join(", ")}`,
    ).toEqual([]);
  });
});

test.describe("Stage gate — silent context-loss fallback (D-10)", () => {
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
    const canvas = page.locator("canvas");
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
          return page.locator("canvas").count();
        },
        { timeout: MOUNT_TIMEOUT },
      )
      .toBe(0);
    // The DOM site remains — context loss costs the visitor nothing (D-10:
    // the DOM is the fallback).
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

  test("classifies FALLBACK software renderer as none (CI/SwiftShader — PR #21 regression)", () => {
    expect(
      sceneTierFromGpu({
        tier: 1,
        type: "FALLBACK",
        isMobile: false,
        gpu: "google swiftshader",
      })
    ).toBe("none");
    expect(
      sceneTierFromGpu({
        tier: 1,
        type: "FALLBACK",
        isMobile: false,
        gpu: "angle (google, vulkan 1.3.0 (swiftshader device (subzero)), swiftshader driver)",
      })
    ).toBe("none");
    expect(
      sceneTierFromGpu({
        tier: 1,
        type: "FALLBACK",
        isMobile: false,
        gpu: "mesa llvmpipe (llvm 15.0.7, 256 bits)",
      })
    ).toBe("none");
  });

  test("classifies FALLBACK hardware GPU with known string as capable (M5 Pro string)", () => {
    expect(
      sceneTierFromGpu({
        tier: 1,
        type: "FALLBACK",
        isMobile: false,
        gpu: "apple, angle metal renderer: apple m5 pro, unspecified version",
      })
    ).toBe("desktop");
  });

  test("classifies FALLBACK with masked/absent renderer string as capable (Firefox-masked population)", () => {
    expect(
      sceneTierFromGpu({ tier: 1, type: "FALLBACK", isMobile: false, gpu: undefined })
    ).toBe("desktop");
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
