import { test, expect } from "@playwright/test";

const SLUG = "vidama-mediathek";

for (const locale of ["de", "en"] as const) {
  test.describe(`Case study detail (/${locale}/case-studies/${SLUG})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${locale}/case-studies/${SLUG}`);
    });

    test("page responds with 200", async ({ page }) => {
      const response = await page.goto(`/${locale}/case-studies/${SLUG}`);
      expect(response?.status()).toBe(200);
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

    test("provides project context and next-case-study navigation", async ({
      page,
    }) => {
      const backLabel =
        locale === "de" ? "Zurück zu den Projekten" : "Back to projects";
      await expect(page.getByRole("link", { name: backLabel })).toHaveAttribute(
        "href",
        new RegExp(`/${locale}/?#projects$`),
      );
      await expect(
        page.getByRole("link", { name: /ELIA/ }),
      ).toBeVisible();
    });

    test("emits case-study Open Graph metadata", async ({ page }) => {
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
        "content",
        "article",
      );
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
        "content",
        new RegExp(`/${locale}/case-studies/${SLUG}$`),
      );
    });

    test("unknown case studies return the localized 404", async ({ page }) => {
      const response = await page.goto(
        `/${locale}/case-studies/does-not-exist`,
      );
      expect(response?.status()).toBe(404);
      const expectedTitle =
        locale === "de"
          ? "Diese Seite gibt es nicht."
          : "This page does not exist.";
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        expectedTitle,
      );
    });

    test("back-navigation to homepage works", async ({ page }) => {
      const backLabel =
        locale === "de" ? "Zurück zu den Projekten" : "Back to projects";
      await page.getByRole("link", { name: backLabel }).click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/?#projects$`));
      await expect(page.locator("h1")).toContainText("Lasse Siemoneit");
    });
  });
}
