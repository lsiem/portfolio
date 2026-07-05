import { test, expect } from "@playwright/test";

const locales = ["de", "en"] as const;

/**
 * Phase-3 immersive layer contract (03-01). Verifies the engineered hero intro
 * (D-12) is a first-paint-safe, reduced-motion-collapsible enhancement:
 * identity + value-prop + nav are always present SSR HTML (WOW-04), the intro
 * plays on mount (not scroll), the Bricolage display face lands on the H1 (D-03),
 * and the page collapses to the fully-designed static hero under reduced-motion
 * (MODE-02). Mirrors evals/home.spec.ts structure (locale loop).
 */
for (const locale of locales) {
  test.describe(`Immersive hero (/${locale})`, () => {
    test("hero H1 renders in the Bricolage display face (D-03)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const h1 = page.locator("#hero h1");
      await expect(h1).toBeVisible();
      const fontFamily = await h1.evaluate(
        (el) => getComputedStyle(el).fontFamily,
      );
      expect(fontFamily.toLowerCase()).toContain("bricolage");
    });

    test("identity, value-prop and nav are present from first paint (WOW-04)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator("#hero")).toBeVisible();
      await expect(page.locator("#hero h1")).toBeVisible();
      await expect(
        page.locator('#hero [data-testid="hero-value-prop"]'),
      ).toBeVisible();
      await expect(page.locator('#hero nav a[href="#career"]')).toBeVisible();
    });

    test("no post-hydration opacity flash on hero text (WOW-04, finding #6)", async ({
      page,
    }) => {
      // Read computed opacity on the FIRST snapshot after load — before any
      // waitForTimeout — so the intro's initial client frame must equal the SSR
      // final visible state (no jump to opacity:0 after hydration).
      await page.goto(`/${locale}`);
      const opacities = await page.evaluate(() => {
        const h1 = document.querySelector("#hero h1");
        const vp = document.querySelector('#hero [data-testid="hero-value-prop"]');
        return {
          h1: h1 ? parseFloat(getComputedStyle(h1).opacity) : 0,
          vp: vp ? parseFloat(getComputedStyle(vp).opacity) : 0,
        };
      });
      expect(opacities.h1).toBeGreaterThanOrEqual(0.99);
      expect(opacities.vp).toBeGreaterThanOrEqual(0.99);
    });

    test("hero intro plays on mount, not on scroll-enter (D-12)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      // Without scrolling, the hero value-prop and H1 settle to opacity 1 shortly
      // after load — proving a mount timeline, not a scroll-triggered reveal.
      const vp = page.locator('#hero [data-testid="hero-value-prop"]');
      const h1 = page.locator("#hero h1");
      await expect
        .poll(
          async () => vp.evaluate((el) => parseFloat(getComputedStyle(el).opacity)),
          { timeout: 1200 },
        )
        .toBe(1);
      await expect(h1).toHaveCSS("opacity", "1");
    });

    test("reduced-motion renders the static designed hero (MODE-02, D-18)", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/${locale}`);
      const vp = page.locator('#hero [data-testid="hero-value-prop"]');
      await expect(vp).toHaveCSS("opacity", "1");
      const h1Text = await page.locator("#hero h1").innerText();
      expect(h1Text).toContain("Lasse Siemoneit");
    });

    test("anchor nav stays clickable throughout the intro (WOW-04)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const careerLink = page.locator('#hero nav a[href="#career"]');
      await expect(careerLink).toBeVisible();
      const pointerEvents = await careerLink.evaluate(
        (el) => getComputedStyle(el).pointerEvents,
      );
      expect(pointerEvents).not.toBe("none");
    });

    test("hash-anchor nav scrolls to the section under Lenis (finding #8)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`/${locale}`);
      await page.locator('#hero nav a[href="#career"]').click();
      // Lenis smooth-scrolls (~1.2s) — poll until the career section reaches the
      // top of the viewport (accounting for sticky header + scroll-mt).
      await expect
        .poll(
          async () => {
            const box = await page.locator("#career").boundingBox();
            return box ? box.y : Number.POSITIVE_INFINITY;
          },
          { timeout: 4000 },
        )
        .toBeLessThan(200);
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    });
  });
}
