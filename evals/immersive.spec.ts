import { test, expect } from "@playwright/test";
import { getCareer } from "../src/lib/content";

const locales = ["de", "en"] as const;

/**
 * ITSC role-arc titles (D-06), keyed by locale — sourced from
 * content/{de,en}/career.ts so the multi-beat assertion checks real DOM text
 * for the exact role progression (SysAdmin → Software Engineering → Product
 * Owner), not a paraphrase.
 */
const itscRoleTitles: Record<(typeof locales)[number], readonly string[]> = {
  de: [
    "Systemadministrator",
    "Software Engineering",
    "Product Owner eines internen KI-Assistenten",
  ],
  en: [
    "Systems Administrator",
    "Software Engineering",
    "Product Owner of an internal AI assistant",
  ],
};

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
      // Lenis wraps the native anchor jump into a lerp; under heavy parallel
      // (7-worker) CPU contention its rAF is starved and the scroll settles far
      // slower than in isolation — allow a generous budget so this is not flaky.
      test.slow();
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`/${locale}`);
      await page.locator('#hero nav a[href="#career"]').click();
      // Poll the career section's viewport-top via getBoundingClientRect until it
      // reaches the top (scroll-mt-24 = 96px).
      await expect
        .poll(
          async () =>
            page
              .locator("#career")
              .evaluate((el) => el.getBoundingClientRect().top),
          { timeout: 20000 },
        )
        .toBeLessThan(200);
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    });
  });

  test.describe(`Immersive career (/${locale})`, () => {
    test("career reads as scroll-linked chapters, all orgs present (WOW-02)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator("#career")).toBeVisible();
      const orgItems = page.locator("#career > div > div > ol > li");
      await expect(orgItems.first()).toBeVisible();
      // Pinned to the actual content-model count (round-2 finding #5 discipline
      // applied here too) rather than a hardcoded literal.
      expect(await orgItems.count()).toBe(getCareer(locale).entries.length);
    });

    test("ITSC role arc renders all three beats as real DOM text (D-06)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      // ITSC is the first career entry; its inner role <ol> holds the
      // SysAdmin → Software Engineering → Product Owner beats.
      const itsc = page.locator("#career > div > div > ol > li").first();
      const roles = itsc.locator("ol > li");
      expect(await roles.count()).toBe(itscRoleTitles[locale].length);
      // Assert each beat in order — toContainText scopes to the specific role
      // <li>, avoiding cross-matches against sibling intro/description text.
      for (const [index, title] of itscRoleTitles[locale].entries()) {
        await expect(roles.nth(index)).toContainText(title);
      }
    });

    test("progress spine is present on desktop and decorative (D-07)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/${locale}`);
      const spine = page.locator('#career [data-testid="career-spine"]');
      await expect(spine).toHaveCount(1);
      await expect(spine).toHaveAttribute("aria-hidden", "true");
    });

    test("career content is fully present under reduced-motion (MODE-02)", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/${locale}`);
      const firstOrg = page.locator("#career > div > div > ol > li").first();
      await expect(firstOrg).toBeVisible();
      const opacity = await firstOrg.evaluate((el) => {
        // the reveal wrapper is the animated element; assert nothing is hidden
        const inner = el.querySelector("div,p") ?? el;
        return parseFloat(getComputedStyle(inner as Element).opacity);
      });
      expect(opacity).toBe(1);
      expect((await firstOrg.innerText()).trim().length).toBeGreaterThan(0);
    });
  });
}
