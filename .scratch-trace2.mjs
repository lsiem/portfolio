import { chromium, devices } from "@playwright/test";

const target = process.argv[2];
const waitMs = Number(process.argv[3] || 10000);

const browser = await chromium.launch();
const context = await browser.newContext({
  ...devices["Pixel 5"],
});
const page = await context.newPage();

const start = Date.now();
const events = [];
page.on("request", (req) => {
  const url = req.url();
  if (url.includes("66e70216uiz") || url.includes("089s4quzywrjh") || url.includes("17ccavmp7q0jl")) {
    events.push({ t: Date.now() - start, url, type: "request" });
  }
});

await page.goto(target, { waitUntil: "load", timeout: 30000 });
const mq = await page.evaluate(() => ({
  pointerFine: window.matchMedia("(pointer: fine)").matches,
  pointerCoarse: window.matchMedia("(pointer: coarse)").matches,
  hover: window.matchMedia("(hover: hover)").matches,
  reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  maxTouchPoints: navigator.maxTouchPoints,
}));
console.log(`\n=== ${target} ===`);
console.log("matchMedia:", mq);
await page.waitForTimeout(waitMs);
console.log("gsap-chunk-related request events:", events);

await browser.close();
