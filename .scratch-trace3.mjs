import { chromium, devices } from "@playwright/test";

const target = process.argv[2];
const waitMs = Number(process.argv[3] || 8000);

const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices["Pixel 5"],
});
const page = await context.newPage();

const start = Date.now();
const events = [];
page.on("request", (req) => {
  events.push({ t: Date.now() - start, url: req.url() });
});
page.on("load", () => events.push({ t: Date.now() - start, url: "***LOAD EVENT***" }));

// Track any DOM mutations / resize during window
await page.addInitScript(() => {
  window.__resizeCount = 0;
  window.addEventListener("resize", () => { window.__resizeCount++; });
});

await page.goto(target, { waitUntil: "load", timeout: 30000 });
await page.waitForTimeout(waitMs);

console.log(`\n=== ${target} ===`);
for (const e of events) {
  console.log(`${String(e.t).padStart(6)}ms  ${e.url.replace(/^https?:\/\/[^/]+/, "")}`);
}
const resizeCount = await page.evaluate(() => window.__resizeCount);
const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
const viewportH = await page.evaluate(() => window.innerHeight);
console.log("resizeCount:", resizeCount, "bodyScrollHeight:", bodyHeight, "innerHeight:", viewportH);

await browser.close();
