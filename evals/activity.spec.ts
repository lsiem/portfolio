import { test, expect } from "@playwright/test";

const locales = ["de", "en"] as const;

for (const locale of locales) {
  test.describe(`Activity section (/${locale})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${locale}`);
    });

    test("renders the #activity section with its heading", async ({
      page,
    }) => {
      const activity = page.locator("#activity");
      await expect(activity).toBeVisible();
      await expect(page.locator("#activity-heading")).toBeVisible();
    });

    // Token-agnostic: on preview builds (no GITHUB_TOKEN) getContributionCalendar
    // returns null and GitHubHeatmap renders the localized fallback line
    // instead of a grid; on production (token present) it renders the grid.
    // Both outcomes are valid — assert that at least one is visible.
    test("renders either the contribution grid or the localized fallback", async ({
      page,
    }) => {
      const activity = page.locator("#activity");
      const grid = activity.locator('[role="img"]');
      const fallback = activity.locator("p");
      await expect(grid.or(fallback)).toBeVisible();
    });
  });
}
