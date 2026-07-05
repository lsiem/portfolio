import { test, expect } from "@playwright/test";

const locales = ["de", "en"] as const;

for (const locale of locales) {
  test.describe(`Theme toggle (/${locale})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${locale}`);
    });

    test("default load has no data-theme attribute (System)", async ({
      page,
    }) => {
      const dataTheme = await page.evaluate(
        () => document.documentElement.dataset.theme,
      );
      expect(dataTheme).toBeUndefined();
    });

    test("selecting Dark sets data-theme and persists to localStorage", async ({
      page,
    }) => {
      const toggle = page.getByRole("radiogroup");
      await expect(toggle).toBeVisible();

      const darkOption = toggle.getByRole("radio").nth(2);
      await darkOption.click();
      await expect(darkOption).toHaveAttribute("aria-checked", "true");

      const dataTheme = await page.evaluate(
        () => document.documentElement.dataset.theme,
      );
      expect(dataTheme).toBe("dark");

      const stored = await page.evaluate(() =>
        window.localStorage.getItem("theme"),
      );
      expect(stored).toBe("dark");
    });

    test("Dark choice persists across reload with no flash", async ({
      page,
    }) => {
      const toggle = page.getByRole("radiogroup");
      await toggle.getByRole("radio").nth(2).click();

      await page.reload();

      // The no-flash inline script runs before hydration, so the attribute
      // must already be present the moment the document is evaluated.
      const dataTheme = await page.evaluate(
        () => document.documentElement.dataset.theme,
      );
      expect(dataTheme).toBe("dark");

      const darkOption = page.getByRole("radiogroup").getByRole("radio").nth(2);
      await expect(darkOption).toHaveAttribute("aria-checked", "true");
    });

    test("selecting System clears data-theme and localStorage", async ({
      page,
    }) => {
      const toggle = page.getByRole("radiogroup");
      await toggle.getByRole("radio").nth(2).click(); // Dark first
      await toggle.getByRole("radio").nth(0).click(); // then System

      const dataTheme = await page.evaluate(
        () => document.documentElement.dataset.theme,
      );
      expect(dataTheme).toBeUndefined();

      const stored = await page.evaluate(() =>
        window.localStorage.getItem("theme"),
      );
      expect(stored).toBeNull();
    });
  });
}
