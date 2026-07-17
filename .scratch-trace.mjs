import { chromium, devices } from "@playwright/test";

const target = process.argv[2]; // URL to load
const waitMs = Number(process.argv[3] || 6000);

const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices["Pixel 5"],
});
const page = await context.newPage();

const requests = [];
page.on("response", async (res) => {
  const req = res.request();
  const url = req.url();
  if (!url.includes("/_next/") && !url.match(/\.(js|css)(\?|$)/)) return;
  let size = 0;
  try {
    const buf = await res.body();
    size = buf.length; // decoded size; we also grab headers for transfer size
  } catch {
    size = -1;
  }
  const headers = res.headers();
  requests.push({
    url,
    resourceType: req.resourceType(),
    status: res.status(),
    decodedBodySize: size,
    contentEncoding: headers["content-encoding"] || "",
    contentLength: headers["content-length"] || "",
  });
});

await page.goto(target, { waitUntil: "load", timeout: 30000 });
await page.waitForTimeout(waitMs);

const scripts = requests.filter((r) => r.url.includes(".js"));
const total = scripts.reduce((sum, r) => sum + (r.decodedBodySize > 0 ? r.decodedBodySize : 0), 0);

console.log(`\n=== ${target} ===`);
console.log(`Total script requests: ${scripts.length}`);
for (const r of scripts) {
  console.log(`${String(r.decodedBodySize).padStart(8)}  ${r.status}  ${r.url.replace(/^https?:\/\/[^/]+/, "")}`);
}
console.log(`TOTAL decoded JS bytes: ${total}`);

await browser.close();
