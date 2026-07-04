import { test, expect } from "@playwright/test";

const locales = ["de", "en"] as const;

for (const locale of locales) {
  test.describe(`Homepage (/${locale})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${locale}`);
    });

    test("renders h1 with name", async ({ page }) => {
      await expect(page.locator("h1")).toContainText("Lasse Siemoneit");
    });

    test("page title is set", async ({ page }) => {
      await expect(page).toHaveTitle(/Lasse Siemoneit/);
    });

    test("navigation is present", async ({ page }) => {
      const nav = page.getByRole("navigation").first();
      await expect(nav).toBeVisible();
    });

    test("projects section is present", async ({ page }) => {
      await expect(page.locator("#projects")).toBeVisible();
    });

    test("case study list renders at least one item", async ({ page }) => {
      const items = page.locator("#projects > ul > li");
      await expect(items.first()).toBeVisible();
    });

    test("case study link navigates to detail page", async ({ page }) => {
      const firstLink = page.locator("#projects ul li a").first();
      await firstLink.click();
      await expect(page).toHaveURL(
        new RegExp(`/${locale}/case-studies/[^/]+`),
      );
    });
  });
}
