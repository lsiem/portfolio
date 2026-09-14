import { test, expect } from "@playwright/test";

const locales = ["de", "en"] as const;

for (const locale of locales) {
  test.describe(`SEO (/${locale})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${locale}`);
    });

    test("emits an og:image meta tag", async ({ page }) => {
      const ogImage = page.locator('meta[property="og:image"]');
      await expect(ogImage).toHaveCount(1);
      const content = await ogImage.getAttribute("content");
      expect(content).toBeTruthy();
    });

    test("emits a twitter:image meta tag", async ({ page }) => {
      const twitterImage = page.locator('meta[name="twitter:image"]');
      await expect(twitterImage).toHaveCount(1);
      const content = await twitterImage.getAttribute("content");
      expect(content).toBeTruthy();
    });

    test("emits openGraph textual metadata", async ({ page }) => {
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        "content",
        /Lasse Siemoneit/,
      );
      await expect(
        page.locator('meta[property="og:type"]'),
      ).toHaveAttribute("content", "profile");
    });

    test("emits Person JSON-LD with a non-empty sameAs array", async ({
      page,
    }) => {
      const script = page.locator('script[type="application/ld+json"]');
      await expect(script).toHaveCount(1);
      const raw = await script.textContent();
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw ?? "{}");
      expect(parsed["@type"]).toBe("Person");
      expect(parsed.name).toBeTruthy();
      expect(Array.isArray(parsed.sameAs)).toBe(true);
      expect(parsed.sameAs.length).toBeGreaterThan(0);
    });
  });
}

test("serves robots.txt with the production sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain("Allow: /");
  expect(body).toContain("Sitemap: https://lsiem.de/sitemap.xml");
});

test("sitemap lists localized pages with reciprocal alternates", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toContain("<loc>https://lsiem.de/de</loc>");
  expect(body).toContain("<loc>https://lsiem.de/en</loc>");
  expect(body).toContain('hreflang="de"');
  expect(body).toContain('hreflang="en"');
  expect(body).toContain('hreflang="x-default"');
});
