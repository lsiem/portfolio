import { test, expect } from "@playwright/test";
import { getCareer, getPage, getProjects } from "../src/lib/content";

const locales = ["de", "en"] as const;

/**
 * ITSC role-arc titles (D-06), keyed by locale — sourced from
 * content/{de,en}/career.ts so the multi-beat assertion checks real DOM text
 * for the exact role progression (SysAdmin → Software Engineering → Product
 * Owner), not a paraphrase.
 */
const itscRoleTitles: Record<(typeof locales)[number], readonly string[]> = {
  de: [
    "Systemadministrator",
    "Software Engineering",
    "Product Owner eines internen KI-Assistenten",
  ],
  en: [
    "Systems Administrator",
    "Software Engineering",
    "Product Owner of an internal AI assistant",
  ],
};

/**
 * Phase-3 immersive layer contract (03-01). Verifies the engineered hero intro
 * (D-12) is a first-paint-safe, reduced-motion-collapsible enhancement:
 * identity + value-prop + nav are always present SSR HTML (WOW-04), the intro
 * plays on mount (not scroll), the Bricolage display face lands on the H1 (D-03),
 * and the page collapses to the fully-designed static hero under reduced-motion
 * (MODE-02). Mirrors evals/home.spec.ts structure (locale loop).
 */
for (const locale of locales) {
  test.describe(`Immersive hero (/${locale})`, () => {
    test("hero H1 renders in the Bricolage display face (D-03)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const h1 = page.locator("#hero h1");
      await expect(h1).toBeVisible();
      const fontFamily = await h1.evaluate(
        (el) => getComputedStyle(el).fontFamily,
      );
      expect(fontFamily.toLowerCase()).toContain("bricolage");
    });

    test("identity, value-prop and nav are present from first paint (WOW-04)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator("#hero")).toBeVisible();
      await expect(page.locator("#hero h1")).toBeVisible();
      await expect(
        page.locator('#hero [data-testid="hero-value-prop"]'),
      ).toBeVisible();
      await expect(page.locator('#hero nav a[href="#career"]')).toBeVisible();
    });

    test("no post-hydration opacity flash on hero text (WOW-04, finding #6)", async ({
      page,
    }) => {
      // Read computed opacity on the FIRST snapshot after load — before any
      // waitForTimeout — so the intro's initial client frame must equal the SSR
      // final visible state (no jump to opacity:0 after hydration).
      await page.goto(`/${locale}`);
      const opacities = await page.evaluate(() => {
        const h1 = document.querySelector("#hero h1");
        const vp = document.querySelector('#hero [data-testid="hero-value-prop"]');
        return {
          h1: h1 ? parseFloat(getComputedStyle(h1).opacity) : 0,
          vp: vp ? parseFloat(getComputedStyle(vp).opacity) : 0,
        };
      });
      expect(opacities.h1).toBeGreaterThanOrEqual(0.99);
      expect(opacities.vp).toBeGreaterThanOrEqual(0.99);
    });

    test("hero intro plays on mount, not on scroll-enter (D-12)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      // Without scrolling, the hero value-prop and H1 settle to opacity 1 shortly
      // after load — proving a mount timeline, not a scroll-triggered reveal.
      const vp = page.locator('#hero [data-testid="hero-value-prop"]');
      const h1 = page.locator("#hero h1");
      await expect
        .poll(
          async () => vp.evaluate((el) => parseFloat(getComputedStyle(el).opacity)),
          { timeout: 1200 },
        )
        .toBe(1);
      await expect(h1).toHaveCSS("opacity", "1");
    });

    test("reduced-motion renders the static designed hero (MODE-02, D-18)", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/${locale}`);
      const vp = page.locator('#hero [data-testid="hero-value-prop"]');
      await expect(vp).toHaveCSS("opacity", "1");
      const h1Text = await page.locator("#hero h1").innerText();
      expect(h1Text).toContain("Lasse Siemoneit");
    });

    test("anchor nav stays clickable throughout the intro (WOW-04)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const careerLink = page.locator('#hero nav a[href="#career"]');
      await expect(careerLink).toBeVisible();
      const pointerEvents = await careerLink.evaluate(
        (el) => getComputedStyle(el).pointerEvents,
      );
      expect(pointerEvents).not.toBe("none");
    });

    test("hash-anchor nav scrolls to the section under Lenis (finding #8)", async ({
      page,
    }) => {
      // Lenis wraps the native anchor jump into a lerp; under heavy parallel
      // (7-worker) CPU contention its rAF is starved and the scroll settles far
      // slower than in isolation — allow a generous budget so this is not flaky.
      test.slow();
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`/${locale}`);
      await page.locator('#hero nav a[href="#career"]').click();
      // Poll the career section's viewport-top via getBoundingClientRect until it
      // reaches the top (scroll-mt-24 = 96px).
      await expect
        .poll(
          async () =>
            page
              .locator("#career")
              .evaluate((el) => el.getBoundingClientRect().top),
          { timeout: 20000 },
        )
        .toBeLessThan(200);
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    });
  });

  test.describe(`Immersive career (/${locale})`, () => {
    test("career reads as scroll-linked chapters, all orgs present (WOW-02)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator("#career")).toBeVisible();
      const orgItems = page.locator("#career > div > div > ol > li");
      await expect(orgItems.first()).toBeVisible();
      // Pinned to the actual content-model count (round-2 finding #5 discipline
      // applied here too) rather than a hardcoded literal.
      expect(await orgItems.count()).toBe(getCareer(locale).entries.length);
    });

    test("ITSC role arc renders all three beats as real DOM text (D-06)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      // ITSC is the first career entry; its inner role <ol> holds the
      // SysAdmin → Software Engineering → Product Owner beats.
      const itsc = page.locator("#career > div > div > ol > li").first();
      const roles = itsc.locator("ol > li");
      expect(await roles.count()).toBe(itscRoleTitles[locale].length);
      // Assert each beat in order — toContainText scopes to the specific role
      // <li>, avoiding cross-matches against sibling intro/description text.
      for (const [index, title] of itscRoleTitles[locale].entries()) {
        await expect(roles.nth(index)).toContainText(title);
      }
    });

    test("progress spine is present on desktop and decorative (D-07)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/${locale}`);
      const spine = page.locator('#career [data-testid="career-spine"]');
      await expect(spine).toHaveCount(1);
      await expect(spine).toHaveAttribute("aria-hidden", "true");
    });

    test("career content is fully present under reduced-motion (MODE-02)", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/${locale}`);
      const firstOrg = page.locator("#career > div > div > ol > li").first();
      await expect(firstOrg).toBeVisible();
      const opacity = await firstOrg.evaluate((el) => {
        // the reveal wrapper is the animated element; assert nothing is hidden
        const inner = el.querySelector("div,p") ?? el;
        return parseFloat(getComputedStyle(inner as Element).opacity);
      });
      expect(opacity).toBe(1);
      expect((await firstOrg.innerText()).trim().length).toBeGreaterThan(0);
    });
  });

  test.describe(`Immersive projects bento (/${locale})`, () => {
    test("projects render as a bento with one <li> per project (D-14, finding #5)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      // Phase-5 WP-D: BentoHover (display:contents client boundary feeding
      // bridge.hoverRect) sits between #projects and the bento <ul>; the
      // one-<li>-per-project a11y contract below is unchanged.
      const items = page.locator("#projects > div > ul > li");
      const headings = page.locator("#projects h3");
      // Pinned to the SAME source the page renders (round-2 LOW finding #5) —
      // never a hardcoded literal, so this does not drift when a project is
      // added or removed.
      const expectedCount = getProjects(locale).length;
      expect(await items.count()).toBe(expectedCount);
      // 1:1 project↔<li> mapping — no N×panel over-announcement.
      expect(await headings.count()).toBe(expectedCount);
    });

    test("ELIA + Vidama are the featured pair with resolvable case-study links (D-14)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      await expect(
        page.locator(`#projects a[href="/${locale}/case-studies/elia"]`),
      ).toBeVisible();
      await expect(
        page.locator(
          `#projects a[href="/${locale}/case-studies/vidama-mediathek"]`,
        ),
      ).toBeVisible();
    });

    test("project cells are fully present under reduced-motion (MODE-02)", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/${locale}`);
      // WP-D BentoHover wrapper depth — see the bento count spec above.
      const firstCell = page.locator("#projects > div > ul > li").first();
      await expect(firstCell).toBeVisible();
      const opacity = await firstCell.evaluate((el) => {
        const inner = el.querySelector("div") ?? el;
        return parseFloat(getComputedStyle(inner as Element).opacity);
      });
      expect(opacity).toBe(1);
      expect((await firstCell.innerText()).trim().length).toBeGreaterThan(0);
    });
  });

  test.describe(`Immersive craft interactions (/${locale})`, () => {
    test("CV button pulls magnetically on pointer:fine and snaps back (D-11.1)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const cv = page.locator("#contact a[download]");
      const wrapper = cv.locator("xpath=.."); // the Magnetic <span>
      await cv.scrollIntoViewIfNeeded();
      // Wait until Lenis has actually settled — a fixed sleep is not enough
      // under parallel-worker CPU contention (documented flake class,
      // playwright.config.ts): poll for a stable viewport position instead.
      let box = await cv.boundingBox();
      await expect
        .poll(async () => {
          const next = await cv.boundingBox();
          const stable =
            box !== null && next !== null && Math.abs(next.y - box.y) < 0.5;
          box = next;
          return stable;
        })
        .toBe(true);
      const settled = box;
      if (!settled) throw new Error("CV button has no bounding box");
      // Move within the element, offset toward the right edge for a non-zero
      // pull. Keep nudging between two in-button points while polling — a
      // single move that lands during a residual scroll frame would otherwise
      // strand the poll with no further pointermove to react to.
      await page.mouse.move(
        settled.x + settled.width / 2,
        settled.y + settled.height / 2,
      );
      let flip = false;
      await expect
        .poll(async () => {
          flip = !flip;
          await page.mouse.move(
            settled.x + settled.width - (flip ? 2 : 6),
            settled.y + settled.height / 2,
          );
          return wrapper.evaluate((el) => getComputedStyle(el).transform);
        })
        .not.toBe("none");
      // Leave → snap back to identity.
      await page.mouse.move(2, 2);
      await expect
        .poll(async () =>
          wrapper.evaluate((el) => {
            const t = getComputedStyle(el).transform;
            return t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)";
          }),
        )
        .toBe(true);
    });

    test("CV button keeps its focus-visible ring and aria-label (TECH-03)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const cv = page.locator("#contact a[download]");
      await expect(cv).toHaveAttribute("aria-label", /.+/);
      await cv.focus();
      const outline = await cv.evaluate((el) => {
        const s = getComputedStyle(el);
        return { style: s.outlineStyle, width: s.outlineWidth };
      });
      expect(outline.style).not.toBe("none");
      expect(parseFloat(outline.width)).toBeGreaterThan(0);
    });

    test("magnetic pull is stripped under reduced-motion (MODE-02)", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/${locale}`);
      const cv = page.locator("#contact a[download]");
      const wrapper = cv.locator("xpath=..");
      const box = await cv.boundingBox();
      if (!box) throw new Error("CV button has no bounding box");
      await page.mouse.move(box.x + box.width / 2 + 10, box.y + box.height / 2);
      await page.waitForTimeout(400);
      const transform = await wrapper.evaluate(
        (el) => getComputedStyle(el).transform,
      );
      expect(transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)").toBe(
        true,
      );
    });

    test("bento case-study link crossfades then navigates on plain click (D-11.4)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const elia = page.locator(
        `#projects a[href="/${locale}/case-studies/elia"]`,
      );
      await expect(elia).toHaveAttribute("href", /\/case-studies\/elia$/);
      await elia.click();
      await page.waitForURL(new RegExp(`/${locale}/case-studies/elia`));
    });

    test("case-study navigation is instant under reduced-motion (D-11.4)", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/${locale}`);
      await page
        .locator(`#projects a[href="/${locale}/case-studies/elia"]`)
        .click();
      await page.waitForURL(new RegExp(`/${locale}/case-studies/elia`));
    });

    test("modifier-click preserves native new-tab (no in-page crossfade) (finding #3)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const before = page.url();
      await page
        .locator(`#projects a[href="/${locale}/case-studies/elia"]`)
        .click({ modifiers: ["Meta"] });
      // The current tab must NOT navigate — the browser would open a new tab.
      await page.waitForTimeout(300);
      expect(page.url()).toBe(before);
    });

    test("external visit link stays a native new-tab anchor (not a TransitionLink)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const visit = page.locator('#projects a[target="_blank"]').first();
      await expect(visit).toHaveAttribute("rel", /noopener/);
    });

    test("exactly one animation engine (no framer-motion/motion) (D-08)", async () => {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const pkg = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
      );
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      expect(deps["framer-motion"]).toBeUndefined();
      expect(deps["motion"]).toBeUndefined();
    });
  });

  test.describe(`Immersive detail pages (/${locale})`, () => {
    test("About section degrades to text-only when no photo is supplied (D-16)", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      const about = page.locator("#about");
      await expect(about).toBeVisible();
      expect((await about.innerText()).trim().length).toBeGreaterThan(0);
      // No owner photo today → no <img> rendered, section stays text-only.
      expect(await about.locator("img").count()).toBe(0);
    });

    test("case-study page: Bricolage display H1 as real text (D-15)", async ({
      page,
    }) => {
      await page.goto(`/${locale}/case-studies/elia`);
      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);
      await expect(h1).toBeVisible();
      expect((await h1.innerText()).trim().length).toBeGreaterThan(0);
      const fontFamily = await h1.evaluate(
        (el) => getComputedStyle(el).fontFamily,
      );
      expect(fontFamily.toLowerCase()).toContain("bricolage");
    });

    test("case-study body is fully readable under reduced-motion (MODE-02)", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/${locale}/case-studies/elia`);
      const article = page.locator("article");
      await expect(article).toBeVisible();
      const opacity = await article.evaluate((el) => {
        const inner = el.querySelector("div") ?? el;
        return parseFloat(getComputedStyle(inner as Element).opacity);
      });
      expect(opacity).toBe(1);
    });

    test("prose /about page has exactly one Bricolage H1 = page.title (finding #4)", async ({
      page,
    }) => {
      await page.goto(`/${locale}/about`);
      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);
      const expectedTitle = getPage(locale, "about")?.title ?? "";
      expect(expectedTitle.length).toBeGreaterThan(0);
      expect((await h1.innerText()).trim()).toBe(expectedTitle);
      const fontFamily = await h1.evaluate(
        (el) => getComputedStyle(el).fontFamily,
      );
      expect(fontFamily.toLowerCase()).toContain("bricolage");
    });
  });
}
