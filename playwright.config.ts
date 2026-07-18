import { defineConfig, devices, type Project } from "@playwright/test";

// D-14 launch verification (evals/launch/*.spec.ts) runs against a deployed
// URL, never the local dev server. `pnpm test:launch` sets LAUNCH_ONLY=1 so
// this config both (a) adds the `launch` project and (b) skips starting the
// local webServer — the default `pnpm test` run never sees this project or
// touches evals/launch at all.
const isLaunchOnly = process.env.LAUNCH_ONLY === "1";

const projects: Project[] = [
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
    // Never picked up by the default suite — launch specs hit a deployed URL.
    // stage-perf runs in its own dependent project (below): its R1 at-rest
    // frame counting and the long-task budget are WALL-CLOCK measurements,
    // and 7-worker CPU contention starves rAF exactly like the launch-project
    // flake documented above — isolation makes the measurement honest, the
    // asserted budgets are unchanged.
    testIgnore: ["**/launch/**", "**/stage-perf.spec.ts"],
  },
  {
    name: "stage-perf",
    testMatch: "**/stage-perf.spec.ts",
    use: { ...devices["Desktop Chrome"] },
    // Runs strictly AFTER the functional project so no parallel worker
    // competes for CPU during the measurement windows…
    dependencies: ["chromium"],
    // …and its own tests run sequentially in one worker (R1's rest window
    // must not overlap the long-task scrub's full-page GPU load).
    fullyParallel: false,
    // The budgets are wall-clock: the first attempt can still catch the
    // functional project's worker/browser teardown draining CPU. Retries do
    // NOT loosen the asserted budgets — a real regression fails all three.
    retries: 2,
  },
];

if (isLaunchOnly) {
  projects.push({
    name: "launch",
    testDir: "./evals/launch",
    use: {
      ...devices["Desktop Chrome"],
      baseURL: process.env.LAUNCH_URL ?? "https://lsiem.de",
    },
  });
}

export default defineConfig({
  testDir: "./evals",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Launch runs (D-14) execute single-worker: the stopwatch metric models one
  // external tester's real flow, and Lenis's rAF-driven scroll settle is
  // starved under multi-worker CPU contention on the local runner (the same
  // class of flake documented in 04-03/04-04 for evals/immersive.spec.ts).
  workers: process.env.CI || isLaunchOnly ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects,

  webServer: isLaunchOnly
    ? undefined
    : {
        command: "pnpm dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
