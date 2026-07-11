import { test, expect } from "@playwright/test";
import { getContact } from "../../src/lib/content";

const locales = ["de", "en"] as const;

/**
 * D-14 scripted 30-second stopwatch test (ROADMAP success criterion 4,
 * MODE-01). This spec IS the external tester: it walks exactly the flow a
 * hurried recruiter takes — name/role/value-prop visible on the first fold
 * with no scrolling, one click to the dense overview, then contact + CV
 * reachable in the same flow — and asserts the whole walkthrough completes
 * in under 30 seconds of wall-clock time.
 *
 * Runs only against the `launch` Playwright project (LAUNCH_URL env var,
 * defaults to https://lsiem.de) via `pnpm test:launch` — never part of the
 * default `pnpm test` run. Assertions import name/role/value-prop/CV
 * filename from the content-model SSOT (src/lib/content.ts) rather than
 * hardcoded strings, so they track content changes automatically.
 */
for (const locale of locales) {
  test(`30-second stopwatch test (/${locale})`, async ({ page }) => {
    const contact = getContact(locale);
    const start = Date.now();

    // 1. First fold (no scroll, no interaction): name, role, value-prop visible.
    await page.goto(`/${locale}`);
    await expect(page.locator("#hero h1")).toHaveText(contact.name);
    await expect(
      page.locator("#hero").getByText(contact.role, { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator('#hero [data-testid="hero-value-prop"]'),
    ).toHaveText(contact.valueProp);

    // 2. The dense overview is one click away from the first fold.
    const overviewLink = page.locator('#hero nav a[href="#career"]');
    await expect(overviewLink).toBeVisible();
    await overviewLink.click();
    await expect
      .poll(
        async () =>
          page.locator("#career").evaluate((el) => el.getBoundingClientRect().top),
        { timeout: 8_000 },
      )
      .toBeLessThan(200);
    await expect(page.locator("#career")).toBeVisible();

    // 3. Contact affordance (mailto) and the CV download are reachable in the
    // same flow, without leaving the page.
    const contactLink = page.locator(`#contact a[href="mailto:${contact.email}"]`);
    await contactLink.scrollIntoViewIfNeeded();
    await expect(contactLink).toBeVisible();

    const cvLink = page.locator("#contact a[download]");
    await expect(cvLink).toHaveAttribute(
      "href",
      `/Lasse-Siemoneit-CV-${locale}.pdf`,
    );
    await expect(cvLink).toBeVisible();

    // 4. Hard pass criterion (D-14): total elapsed wall time under 30 seconds.
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(30_000);
  });
}
