import { chromium, devices } from "@playwright/test";

const target = process.argv[2];
const outFile = process.argv[3];

const browser = await chromium.launch();
const context = await browser.newContext({ ...devices["Pixel 5"] });
const page = await context.newPage();

let captured = null;
page.on("response", async (res) => {
  const url = res.request().url();
  if (url.includes("_rsc=") && !captured) {
    try {
      const body = await res.text();
      captured = { url, status: res.status(), headers: res.headers(), body };
    } catch (e) {
      captured = { url, error: String(e) };
    }
  }
});

await page.goto(target, { waitUntil: "load", timeout: 30000 });
await page.waitForTimeout(2500);

const fs = await import("node:fs");
fs.writeFileSync(outFile, JSON.stringify(captured, null, 2));
console.log("Captured:", captured?.url, captured?.status, "body length:", captured?.body?.length);
console.log("headers:", captured?.headers);

await browser.close();
