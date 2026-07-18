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
      // Phase-5 WP-D: BentoHover (display:contents client boundary feeding
      // bridge.hoverRect) sits between #projects and the bento <ul> — the
      // one-<li>-per-project contract is unchanged, only the wrapper depth.
      const items = page.locator("#projects > div > ul > li");
      await expect(items.first()).toBeVisible();
    });

    test("case study link navigates to detail page", async ({ page }) => {
      const firstLink = page.locator("#projects ul li a").first();
      await firstLink.click();
      await expect(page).toHaveURL(
        new RegExp(`/${locale}/case-studies/[^/]+`),
      );
    });

    test("hero shows a one-sentence value proposition distinct from the role", async ({
      page,
    }) => {
      const hero = page.locator("#hero");
      await expect(hero).toBeVisible();
      const valueProp = hero.locator('[data-testid="hero-value-prop"]');
      await expect(valueProp).toBeVisible();
      await expect(valueProp).not.toBeEmpty();
    });

    test("about section is visible and links to the full about page", async ({
      page,
    }) => {
      const about = page.locator("#about");
      await expect(about).toBeVisible();
      await expect(
        about.locator(`a[href="/${locale}/about"]`),
      ).toBeVisible();
    });

    test("sticky header exposes a Contact affordance", async ({ page }) => {
      const headerContact = page.locator('header a[href$="#contact"]');
      await expect(headerContact).toBeVisible();
    });

    test("contact block has a CV download button", async ({ page }) => {
      const cvLink = page.locator("#contact a[download]");
      await expect(cvLink).toHaveAttribute(
        "href",
        `/Lasse-Siemoneit-CV-${locale}.pdf`,
      );
      const ariaLabel = await cvLink.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
    });

    test("first-fold anchor-nav includes an #about link", async ({
      page,
    }) => {
      const aboutNavLink = page.locator('nav a[href="#about"]').first();
      await expect(aboutNavLink).toBeVisible();
    });
  });
}
