import { test, expect, type Locator } from "@playwright/test";

const locales = ["de", "en"] as const;

const namedSections = [
  "#career",
  "#projects",
  "#skills",
  "#about",
  "#contact",
  "#activity",
] as const;

/**
 * Assert a control exists, is individually keyboard-focusable, and shows a
 * visible :focus-visible ring (outline-style !== "none", outline-width > 0)
 * after being focused. Mirrors the global rule in globals.css rather than
 * asserting a rigid whole-page Tab-order sequence (which flakes across
 * browsers/extensions).
 */
async function expectFocusableWithVisibleRing(locator: Locator) {
  await expect(locator).toBeVisible();
  await locator.focus();
  await expect(locator).toBeFocused();
  const outline = await locator.evaluate((el) => {
    const style = window.getComputedStyle(el);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(outline.style).not.toBe("none");
  expect(parseFloat(outline.width)).toBeGreaterThan(0);
}

for (const locale of locales) {
  test.describe(`Accessibility baseline (/${locale})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${locale}`);
    });

    test("html lang matches the locale", async ({ page }) => {
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
    });

    test("exactly one main landmark, plus header and footer", async ({
      page,
    }) => {
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("header")).toHaveCount(1);
      await expect(page.locator("footer")).toHaveCount(1);
    });

    for (const sectionSelector of namedSections) {
      test(`${sectionSelector} section has an accessible name from its heading`, async ({
        page,
      }) => {
        const section = page.locator(sectionSelector);
        await expect(section).toBeVisible();
        const labelledBy = await section.getAttribute("aria-labelledby");
        expect(labelledBy).toBeTruthy();
        const heading = page.locator(`#${labelledBy}`);
        await expect(heading).toBeVisible();
        await expect(heading).not.toBeEmpty();
      });
    }

    test("header Contact affordance is keyboard-focusable with a visible ring", async ({
      page,
    }) => {
      await expectFocusableWithVisibleRing(
        page.locator('header a[href$="#contact"]'),
      );
    });

    test("theme toggle radiogroup exposes one keyboard tab stop", async ({
      page,
    }) => {
      const options = page.getByRole("radiogroup").getByRole("radio");
      await expect(options).toHaveCount(3);
      await expect(options.nth(0)).toHaveAttribute("tabindex", "0");
      await expect(options.nth(1)).toHaveAttribute("tabindex", "-1");
      await expect(options.nth(2)).toHaveAttribute("tabindex", "-1");
      await expectFocusableWithVisibleRing(options.nth(0));
    });

    test("locale switcher is keyboard-focusable with a visible ring", async ({
      page,
    }) => {
      const otherLocale = locale === "de" ? "en" : "de";
      await expectFocusableWithVisibleRing(
        page.locator(`header a[hreflang="${otherLocale}"]`),
      );
    });

    test("CV download button is keyboard-focusable with a visible ring", async ({
      page,
    }) => {
      await expectFocusableWithVisibleRing(
        page.locator("#contact a[download]"),
      );
    });

    test("first Tab press reveals the skip link and moves focus to main content", async ({
      page,
    }) => {
      await page.locator("body").evaluate((el) => el.focus());
      await page.keyboard.press("Tab");
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toBeFocused();
      await expect(skipLink).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(page.locator("#main-content")).toBeFocused();
    });

    test('every target="_blank" anchor carries rel="noopener noreferrer"', async ({
      page,
    }) => {
      const blankLinks = page.locator('a[target="_blank"]');
      const count = await blankLinks.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        await expect(blankLinks.nth(i)).toHaveAttribute(
          "rel",
          "noopener noreferrer",
        );
      }
    });
  });
}
