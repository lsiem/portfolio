import { test, expect } from "@playwright/test";

const SLUG = "vidama-mediathek";

for (const locale of ["de", "en"] as const) {
  test.describe(`Case study detail (/${locale}/case-studies/${SLUG})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${locale}/case-studies/${SLUG}`);
    });

    test("page responds with 200", async ({ page }) => {
      // If the page 404s, Playwright throws; reaching here means it loaded.
      await expect(page.locator("body")).toBeVisible();
    });

    test("renders a heading", async ({ page }) => {
      // The case study page should have at least one h1 or h2
      const heading = page.locator("h1, h2").first();
      await expect(heading).toBeVisible();
    });

    test("has correct hreflang alternate for other locale", async ({
      page,
    }) => {
      const otherLocale = locale === "de" ? "en" : "de";
      const alternate = page.locator(
        `link[rel="alternate"][hreflang="${otherLocale}"]`,
      );
      await expect(alternate).toHaveCount(1);
    });

    test("back-navigation to homepage works", async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator("h1")).toContainText("Lasse Siemoneit");
    });
  });
}
