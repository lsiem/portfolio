import { test, expect } from "@playwright/test";

test.describe("i18n routing", () => {
  test("root / redirects to default locale /de", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/de(\/|$)/);
  });

  test("/de serves the German homepage", async ({ page }) => {
    await page.goto("/de");
    await expect(page).toHaveURL("/de");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("/en serves the English homepage", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveURL("/en");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("locale switcher is present on the homepage", async ({ page }) => {
    await page.goto("/de");
    // The locale-switcher component should render a link to /en
    const switcher = page.locator("a[href='/en'], a[href*='/en']").first();
    await expect(switcher).toBeVisible();
  });

  test("hreflang x-default points to /de on homepage", async ({ page }) => {
    await page.goto("/de");
    const xDefault = page.locator(
      'link[rel="alternate"][hreflang="x-default"]',
    );
    const href = await xDefault.getAttribute("href");
    expect(href).toMatch(/\/de(\/|$)/);
  });

  test("hreflang de and en alternates are present on homepage", async ({
    page,
  }) => {
    await page.goto("/de");
    await expect(
      page.locator('link[rel="alternate"][hreflang="de"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]'),
    ).toHaveCount(1);
  });
});
