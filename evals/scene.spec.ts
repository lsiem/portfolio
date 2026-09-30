import { test, expect, type Page } from "@playwright/test";
import { getCaseStudies, getPages } from "../src/lib/content";

const locales = ["de", "en"] as const;

/**
 * The particle / WebGL stage has been removed. Home, case-study, and prose
 * routes must keep their DOM content and never mount a canvas — including
 * under the old `?webgl=force` query, which no longer has a gate to honor.
 */
async function assertNoCanvas(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const idle =
          window.requestIdleCallback ??
          ((cb: IdleRequestCallback) => window.setTimeout(cb, 1500));
        idle(() => resolve());
      }),
  );
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator('[data-testid="stage-frameloop"]')).toHaveCount(0);
}

for (const locale of locales) {
  test.describe(`No particle canvas (/${locale})`, () => {
    test("home renders the hero and mounts no canvas", async ({ page }) => {
      await page.goto(`/${locale}?webgl=force`, { waitUntil: "load" });
      await expect(page.locator("#hero h1")).toBeVisible();
      await expect(
        page.locator('#hero [data-testid="hero-value-prop"]'),
      ).toBeVisible();
      await assertNoCanvas(page);
    });
  });
}

test.describe("No particle canvas — other route classes", () => {
  for (const locale of locales) {
    const caseStudyPath = `/${locale}/case-studies/${getCaseStudies(locale)[0].slug}`;
    const legalSlug = getPages(locale).find(
      (prosePage) => prosePage.slug !== "about",
    )?.slug;
    const legalPath = `/${locale}/${legalSlug}`;

    for (const path of [caseStudyPath, legalPath]) {
      test(`${path} renders its heading and mounts no canvas`, async ({
        page,
      }) => {
        await page.goto(`${path}?webgl=force`, { waitUntil: "load" });
        await expect(page.locator("main h1")).toBeVisible();
        await assertNoCanvas(page);
      });
    }
  }
});
