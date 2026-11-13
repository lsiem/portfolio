import { expect, test } from "@playwright/test";

const ROUTES = [
  "/de",
  "/en",
  "/de/skills",
  "/en/skills",
  "/de/case-studies/vidama-mediathek",
  "/en/case-studies/vidama-mediathek",
  "/de/about",
  "/de/impressum",
  "/en/datenschutz",
];

for (const route of ROUTES) {
  test(`${route} renders without console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(errors).toEqual([]);
  });
}

test("root redirects to the German default", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/de$/);
});

test("unknown pages return 404", async ({ page }) => {
  const response = await page.goto("/de/gibt-es-nicht");
  expect(response?.status()).toBe(404);
});

test("withdrawn case studies stay gone", async ({ page }) => {
  for (const route of ["/de/case-studies/elia", "/en/case-studies/elia"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(404);
  }
});

test("deep unknown URLs render the localized 404", async ({ page }) => {
  const response = await page.goto("/en/does/not/exist");
  expect(response?.status()).toBe(404);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("banner")).toBeVisible();
});

test("sub-pages carry a share image", async ({ page }) => {
  for (const route of ["/de", "/de/skills", "/en/case-studies/vidama-mediathek", "/de/impressum"]) {
    await page.goto(route);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /\/(de|en)\/opengraph-image$/,
    );
  }
});

test("theme toggle updates and restores the browser chrome colour", async ({ page }) => {
  await page.goto("/de");
  const themeColor = page.locator('meta[name="theme-color"]');
  await expect(themeColor).toHaveAttribute("content", "#07090b");
  await page.getByRole("button", { name: "Helles Design aktivieren" }).click();
  await expect(themeColor).toHaveAttribute("content", "#f5f8f8");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(themeColor).toHaveAttribute("content", "#f5f8f8");
});

test("locale switcher keeps the current page", async ({ page }) => {
  await page.goto("/de/skills");
  await page.getByRole("link", { name: "Switch to English" }).click();
  await expect(page).toHaveURL(/\/en\/skills$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("career dates follow the CV", async ({ page }) => {
  await page.goto("/de");
  const career = page.locator("#career");
  await expect(career).toContainText("Product Owner Agent Services");
  await expect(career).toContainText("04/2026 – heute");
  await expect(career).toContainText("01/2024 – 06/2024");
});

test("career shows the reference quote, not a reference PDF", async ({ page }) => {
  await page.goto("/de");
  const quote = page.locator("#career figure");
  await expect(quote).toContainText("stets uneingeschränkt unsere volle Anerkennung");
  await expect(quote.getByRole("link", { name: "Vollständiges Zeugnis auf Anfrage" })).toHaveAttribute("href", "#contact");
  // The CV is the only PDF the page may link to.
  await expect(page.locator('a[href$=".pdf"]:not([href*="-CV-"])')).toHaveCount(0);
});

test("skill matrix filters by search and level", async ({ page }) => {
  await page.goto("/de/skills");
  const search = page.getByRole("searchbox");
  await search.fill("spring");
  await expect(page.getByText("2 Einträge")).toBeVisible();
  await search.fill("kein-treffer");
  await expect(page.getByText("Keine Treffer.")).toBeVisible();
  await page.getByRole("button", { name: "Filter zurücksetzen" }).click();
  await page.getByRole("button", { name: "Kenntnisgrad 4 von 4" }).click();
  await expect(page.getByText("Go", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Spring Boot", { exact: true })).toBeVisible();
});

test("CV download is served", async ({ request }) => {
  const response = await request.get("/cv/Lasse-Siemoneit-CV-de.pdf");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("pdf");
});
