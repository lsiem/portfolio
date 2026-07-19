import { test, expect } from "@playwright/test";
import { getCaseStudies, getContact, getPages } from "../../src/lib/content";

const locales = ["de", "en"] as const;

/**
 * Every top-level home section, in document order. Walked in full under
 * reduced-motion to assert SSR-final content is visible everywhere and the
 * WOW-01 3D gate never mounts a canvas (D-10 — reduced-motion is composed
 * unconditionally by the capability gate, ahead of any tier/force override).
 */
const sectionIds = [
  "hero",
  "career",
  "projects",
  "skills",
  "about",
  "activity",
  "contact",
] as const;

/**
 * D-14 scripted reduced-motion walkthrough (ROADMAP success criterion 4,
 * MODE-02, D-10). Runs only against the `launch` Playwright project
 * (LAUNCH_URL env var, defaults to https://lsiem.de) via `pnpm test:launch`.
 */
for (const locale of locales) {
  test.describe(`Reduced-motion walkthrough (/${locale})`, () => {
    test("full content in every section, zero canvas, no blocking overlay", async ({
      page,
    }) => {
      // Matches the established repo convention (evals/immersive.spec.ts) —
      // this Playwright version resolved reducedMotion via runtime emulation
      // rather than a top-level test.use fixture.
      await page.emulateMedia({ reducedMotion: "reduce" });
      const contact = getContact(locale);
      await page.goto(`/${locale}`);

      await expect(page.locator("#hero h1")).toHaveText(contact.name);
      // D-10: the 3D gate is closed unconditionally under reduced-motion.
      await expect(page.locator("canvas")).toHaveCount(0);

      for (const id of sectionIds) {
        const section = page.locator(`#${id}`);
        await section.scrollIntoViewIfNeeded();
        await expect(section).toBeVisible();
        expect((await section.innerText()).trim().length).toBeGreaterThan(0);
        // The gate must stay closed for the entire walkthrough, not just on load.
        await expect(page.locator("canvas")).toHaveCount(0);
      }

      // WOW-04 anti-feature: no unskippable overlay/preloader ever blocks content.
      await expect(page.locator('[aria-modal="true"]')).toHaveCount(0);
      await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    });
  });
}

/**
 * Kontinuum extension (WP-E; DESIGN-SPEC §7): the stage canvas is mounted by
 * the [locale] LAYOUT, so the reduced-motion zero-canvas guarantee must hold
 * on every route class, not just the home walkthrough — a case-study route
 * (StageFormation "halo") and a legal route ("rest") are walked per locale.
 * Route paths derive from the content-model SSOT (src/lib/content.ts),
 * mirroring the per-route gating spec in evals/scene.spec.ts, so new slugs
 * are covered automatically.
 */
for (const locale of locales) {
  const caseStudyPath = `/${locale}/case-studies/${getCaseStudies(locale)[0].slug}`;
  // First non-about prose page = a legal page (impressum) — legal pages must
  // not perform (DESIGN-SPEC §3 "rest"), and under reduced motion they are
  // exactly as canvas-free as every other route (D-10 is unconditional).
  const legalSlug = getPages(locale).find(
    (prosePage) => prosePage.slug !== "about",
  )?.slug;
  const legalPath = `/${locale}/${legalSlug}`;

  for (const path of [caseStudyPath, legalPath]) {
    test.describe(`Reduced-motion walkthrough (${path})`, () => {
      test("full content top to bottom, zero canvas, no blocking overlay", async ({
        page,
      }) => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.goto(path);

        await expect(page.locator("main h1")).toBeVisible();
        expect(
          (await page.locator("main").innerText()).trim().length,
        ).toBeGreaterThan(0);
        // D-10: the layout-level stage gate is closed unconditionally.
        await expect(page.locator("canvas")).toHaveCount(0);

        // Walk to the end of the document — the gate must stay closed for
        // the whole route, matching the home-section walkthrough above.
        await page.locator("footer").scrollIntoViewIfNeeded();
        await expect(page.locator("footer")).toBeVisible();
        await expect(page.locator("canvas")).toHaveCount(0);

        // WOW-04 anti-feature: no unskippable overlay/preloader blocks content.
        await expect(page.locator('[aria-modal="true"]')).toHaveCount(0);
        await expect(page.locator('[role="dialog"]')).toHaveCount(0);
      });
    });
  }
}
