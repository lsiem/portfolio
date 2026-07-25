---
phase: quick-260725-tcn
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - src/components/scene/stage/progress.test.ts
  - src/components/scene/stage/kern-invariants.test.ts
  - .github/workflows/ci.yml
  - playwright.config.ts
  - lighthouserc.json
autonomous: true
requirements: []
must_haves:
  truths:
    - "`pnpm test:unit` runs both node:test files in one invocation and reports 17 passing, 0 failing"
    - "A push or PR runs, in order: content parity, unit tests, build, DSGVO stage-chunk tripwire, 159 Playwright chromium evals, LHCI budget"
    - "The CI Playwright run executes against the production build (`pnpm start`), not `next dev` — the same condition under which the v1.0 audit measured 159/159 green"
    - "The exclusion of the `stage-perf` project from CI is stated in a ci.yml comment and in the SUMMARY, not silent"
    - "`npx lhci autorun` measures the eager (tier `none`) condition explicitly via `?webgl=off`, on any machine, without depending on the runner's GL implementation"
    - "No asserted budget value, threshold, or severity changed anywhere"
  artifacts:
    - "package.json with a `test:unit` script"
    - ".github/workflows/ci.yml with Unit tests, DSGVO stage-chunk tripwire, Install Playwright chromium, and Playwright evals steps"
    - "playwright.config.ts webServer command branching on process.env.CI"
    - "lighthouserc.json with `?webgl=off` on both URLs"
  key_links:
    - "playwright.config.ts `webServer.command` reads process.env.CI — CI sets it automatically, so the production-server branch needs no workflow-side env wiring"
    - "check:stage-chunk reads .next/static/chunks, so its CI step must follow Build"
    - "src/lib/capability.ts:46 `?webgl=off` is a hard override to tier `none`, evaluated before the reduced-motion and detect-gpu branches — this is what makes the LHCI eager budget self-contained"
    - "pnpm runs scripts through sh, so the `*.test.ts` glob in test:unit is shell-expanded before tsx sees it"
---

<objective>
Close the "CI enforcement" tech-debt cluster from `.planning/v1.0-MILESTONE-AUDIT.md` (lines 100-106): the 159 Playwright evals, the DSGVO stage-chunk tripwire, and the two `node:test` unit files are all documented as CI gates but none of them run on push or PR. Also make the LHCI eager script budget self-contained rather than implicitly dependent on CI's SwiftShader resolving to tier `none`.

Purpose: the audit names this "the single largest regression exposure in the milestone" — two phases (05 Kontinuum, 06 KERN) rewrote the visual and 3D layer *after* the phases whose contracts those evals protect were verified. Right now nothing on push would catch a re-break.

Output: four gates wired into `.github/workflows/ci.yml`, a `test:unit` script, a CI-aware Playwright webServer, and `?webgl=off` on the LHCI URLs. Zero new dependencies, zero runtime code changes, zero budget changes.
</objective>

<context>
@.planning/v1.0-MILESTONE-AUDIT.md
@.github/workflows/ci.yml
@playwright.config.ts
@lighthouserc.json
@package.json
</context>

<ground_truth>
Verified during planning at `61c72b8` (clean tree). Do not re-discover these; do re-confirm anything you change.

| Fact | Evidence |
|------|----------|
| `tsx --test src/components/scene/stage/*.test.ts` resolves and runs BOTH files in one invocation | Ran it: `tests 17 / pass 17 / fail 0`, wall clock 0.64s. The glob form is confirmed — no need for the explicit-filenames fallback. |
| 3 kern-invariant tests + 14 progress tests = 17 | Same run; both files' test names appeared in one aggregated summary. |
| chromium project = 159 tests in 9 files | `pnpm exec playwright test --project=chromium --list` → `Total: 159 tests in 9 files`. Matches the audit's evidence base exactly. |
| Single-worker eval throughput ≈ 0.64 s/test against `pnpm start` | Ran `--project=chromium --workers=1` over theme+a11y+seo: `44 passed (28.3s)` on the production server. |
| Eager (`?webgl=off`) script transfer = **181165 bytes** on both `/de` and `/en` | `lighthouserc.webgl.json` `_kontinuum_rebaseline` (measured 05, local `pnpm start` build) and `_kern_rebaseline` (re-confirmed 06: "Eager (?webgl=off) is UNCHANGED at 181165 bytes"). Budget is 184643 → **3478 bytes / 1.9% headroom**. |
| Stage-loaded script transfer = 462909 bytes at 06 | `lighthouserc.webgl.json` `_kern_rebaseline`. This is why a *local* `npx lhci autorun` on a real-GPU machine fails today — see Task 3. |
| Node 26.5.0 local, Node 24 in CI; tsx 4.23.0, @playwright/test 1.61.1, @lhci/cli ^0.15.1 all already installed | `node --version`, `package.json` devDependencies. **No dependency additions are needed.** |
| Current ci.yml step order | Checkout → Setup pnpm → Setup Node.js → Install dependencies → Content parity check → Build → Lighthouse CI budget |
</ground_truth>

<settled_decisions>
These are decided. Implement them; do not relitigate.

- **D-1 — CI runs Playwright against the production build.** `playwright.config.ts` uses `pnpm start` when `process.env.CI` is set, `pnpm dev` locally. CI already builds before the eval step, and the 159-green evidence base was collected against `pnpm start`.
- **D-2 — CI runs `--project=chromium` only.** `stage-perf` asserts wall-clock frame budgets and is documented as needing an uncontended machine; on a shared runner it would flake into red builds that train the team to ignore CI. It stays a local/manual gate. **This exclusion must be visible** — a comment in ci.yml *and* a line in the SUMMARY. The audit specifically penalised silent gaps; do not create a new one.
- **D-3 — Browsers must be installed in CI.** `pnpm exec playwright install --with-deps chromium`. GitHub runners ship none.
- **D-4 — Cheapest gate fails first:** unit tests → stage-chunk tripwire → Playwright evals → LHCI. `test:unit` needs no build output and runs in <1s, so it goes *before* Build; `check:stage-chunk` and the evals both read `.next`, so they go after.
- **D-5 — `test:unit` uses the glob form.** Verified above.
- **D-6 — No budget, threshold, or severity changes.** The only `lighthouserc.json` edit is appending `?webgl=off` to the two URLs.
- **D-7 — Zero new dependencies**, runtime or dev.
- **D-8 — `lighthouserc.webgl.json` is untouched.** It is a documented lab audit, explicitly not a merge gate.
- **AGENTS.md** — no new runtime cross-origin call is introduced (nothing here touches shipped code paths); work this in one agent lane and commit before switching.
</settled_decisions>

<tasks>

<task type="auto">
  <name>Task 1: Add test:unit and wire the two cheap gates into CI</name>
  <files>package.json, src/components/scene/stage/progress.test.ts, src/components/scene/stage/kern-invariants.test.ts, .github/workflows/ci.yml</files>
  <action>
Closes audit items "Add a `test:unit` script" and the `pnpm check:stage-chunk` half of the CI append. These two ship together because they are the no-browser gates.

**package.json** — add one script directly after the existing `"test"` entry (keep `"test"` and `"test:launch"` unchanged):

`"test:unit": "tsx --test src/components/scene/stage/*.test.ts"`

pnpm invokes scripts through `sh`, so the glob is shell-expanded before tsx runs; a future third `*.test.ts` in that directory is picked up automatically, and if the pattern ever matches nothing the literal string reaches tsx and fails loudly rather than silently passing. Do not add a dev dependency — tsx 4.23.0 is already present.

**Both test files** — their header comments currently assert that the repo has no unit-test runner wired and give an ad-hoc `npx tsx --test <file>` invocation. That statement becomes false with this commit. Rewrite each of those header sentences to point at `pnpm test:unit` as the wired entrypoint, and keep the surrounding DESIGN-SPEC references (§7 producer parity in progress.test.ts, §8 mesh-era invariants in kern-invariants.test.ts) intact. Do not touch any test body, assertion, or import.

**.github/workflows/ci.yml** — add two steps.

(a) A `Unit tests` step running `pnpm test:unit`, placed **after** `Content parity check` and **before** `Build` (per D-4: it needs no build output and finishes in under a second, so an invariant break goes red in seconds instead of after a full Next build). Precede it with a comment naming what it covers: the DESIGN-SPEC §7 progress-module producer parity tests and the §8 mesh-era KERN invariants.

(b) A `DSGVO stage-chunk tripwire` step running `pnpm check:stage-chunk`, placed **immediately after** `Build`. Precede it with a comment noting it closes the TECH-06 / WOW-01 gap flagged in the v1.0 audit (the script is documented as CI-run but no workflow invoked it) and that it must follow Build because it reads `.next/static/chunks`.

Leave every existing step, and the long Lighthouse rationale comment, byte-identical.
  </action>
  <verify>
    <automated>pnpm test:unit</automated>
  </verify>
  <done>
- `pnpm test:unit` exits 0 and prints `ℹ tests 17`, `ℹ pass 17`, `ℹ fail 0` in roughly 0.7s.
- `grep -c "pnpm test:unit" src/components/scene/stage/progress.test.ts src/components/scene/stage/kern-invariants.test.ts` reports at least 1 for each file.
- `grep -n "      - name:" .github/workflows/ci.yml` lists, in order: Checkout, Setup pnpm, Setup Node.js, Install dependencies, Content parity check, Unit tests, Build, DSGVO stage-chunk tripwire, Lighthouse CI budget.
- `pnpm build && pnpm check:stage-chunk` exits 0 (build 1-3 min including prebuild's CV/font/benchmark regeneration; the tripwire itself is 1-3s).
- Commit: `ci: wire unit tests and the DSGVO stage-chunk tripwire into CI`
  </done>
</task>

<task type="auto">
  <name>Task 2: Run the Playwright eval suite in CI against the production build</name>
  <files>playwright.config.ts, .github/workflows/ci.yml</files>
  <action>
Closes the audit's headline item: "the 159 Playwright evals that encode every P2-P6 cross-phase contract never run on push/PR".

**playwright.config.ts** — in the `webServer` object (the non-`isLaunchOnly` branch), change `command: "pnpm dev"` to branch on CI: `pnpm start` when `process.env.CI` is set, `pnpm dev` otherwise. Leave `url`, `reuseExistingServer: !process.env.CI`, and `timeout: 120_000` untouched, and leave the `isLaunchOnly ? undefined` guard untouched.

Add a comment above `command` explaining the branch (per D-1): the workflow already runs `pnpm build` before the eval step; the 159/159-green evidence base in the v1.0 milestone audit was collected against `pnpm start`, not the dev server; and dev-mode on-demand compilation distorts the timing-sensitive specs. Locally `pnpm dev` stays the default so the suite remains usable without a build.

**.github/workflows/ci.yml** — add two steps after the `DSGVO stage-chunk tripwire` step and before `Lighthouse CI budget`.

(a) `Install Playwright chromium` running `pnpm exec playwright install --with-deps chromium` (D-3 — the runner ships no browsers). Comment that it is placed here rather than earlier so the sub-second gates above fail first and the ~40s browser download is skipped on an early red.

(b) `Playwright evals (chromium)` running `pnpm exec playwright test --project=chromium`. The comment above it must state two things explicitly:
  - what the suite covers — the 159 cross-phase contract evals (MODE-02, WOW-01/04, TECH-03/05, D-10 gate semantics) — and that `playwright.config.ts` starts `pnpm start` under CI so they run against the build produced above;
  - the `stage-perf` exclusion in full (D-2), spelled out as a deliberate choice, not an oversight: that project's budgets are wall-clock frame measurements assuming an uncontended machine, a shared GitHub runner would flake them into red builds that train everyone to ignore CI, and it therefore stays a local/manual gate to be run via `pnpm test` (no `--project` filter) before touching the stage renderer.

Keep the `--project=chromium` filter inline in the workflow rather than hiding it behind a new package script — the point is that a reader of ci.yml sees which project is excluded without opening another file. Do not add a `test:ci` script.

Watch item, no action unless it bites: Playwright tears down its `webServer` process tree on exit, but LHCI then starts its own `pnpm start` on the same port 3000. If CI ever shows `EADDRINUSE` on the Lighthouse step, the fix is a port-release step between the two — do not pre-emptively add one.
  </action>
  <verify>
    <automated>pnpm exec playwright test --project=chromium --list</automated>
  </verify>
  <done>
- `pnpm exec playwright test --project=chromium --list` still ends with `Total: 159 tests in 9 files`.
- `grep -n "stage-perf" .github/workflows/ci.yml` returns at least one line (the exclusion is documented in the workflow, per D-2).
- `grep -n "      - name:" .github/workflows/ci.yml` lists, in order: Checkout, Setup pnpm, Setup Node.js, Install dependencies, Content parity check, Unit tests, Build, DSGVO stage-chunk tripwire, Install Playwright chromium, Playwright evals (chromium), Lighthouse CI budget.
- `node -e "process.env.CI='1';import('./playwright.config.ts')"` is not required; instead confirm by reading that `command` reads `process.env.CI` and yields `pnpm start` / `pnpm dev`.
- Full-suite proof is deferred to Task 4 — do not run the 159 here.
- Commit: `ci: run the Playwright eval suite against the production build`
  </done>
</task>

<task type="auto">
  <name>Task 3: Pin the LHCI budget gate to the explicit ?webgl=off condition</name>
  <files>lighthouserc.json</files>
  <action>
Closes the audit item "Add `?webgl=off` to the LHCI URLs so the eager-budget gate is self-contained".

Change the two entries in `ci.collect.url` to `http://localhost:3000/de?webgl=off` and `http://localhost:3000/en?webgl=off`. That is the **entire** edit to this file. Do not touch `startServerCommand`, `numberOfRuns`, `upload`, or any assertion — every threshold and severity stays byte-identical (D-6).

Why: `src/lib/capability.ts:46` reads the `?webgl` search param and `off` is a hard override to tier `none`, evaluated before the reduced-motion, save-data, deviceMemory, caveat-probe and detect-gpu branches. Today the gate reaches tier `none` only because GitHub's headless Chrome runs SwiftShader and trips the `failIfMajorPerformanceCaveat` probe — a property of the runner, not of the config. Making it explicit means the same bytes are measured on any machine.

Also extend the existing `Lighthouse CI budget` comment block in `.github/workflows/ci.yml` — **append only, preserve every existing sentence including the whole local-vs-deployed rationale** — with one short paragraph noting that the URLs now carry `?webgl=off` so the 184643 script budget measures the eager (no-3D) payload by construction instead of relying on the runner's software GL, and that the 3D-active counterpart lives in `lighthouserc.webgl.json` / `pnpm lhci:webgl` and remains a non-blocking lab audit.

**Expected measurement, and the stop rule.** The eager payload is already known: 181165 bytes on both locales, measured at 05 and re-confirmed unchanged at 06 (`lighthouserc.webgl.json` `_kern_rebaseline`). Against the 184643 budget that is 3478 bytes / 1.9% of headroom. CI's number should not move at all, because SwiftShader already resolved to `none`.

A *local* run is where the change is visible: before this edit, `npx lhci autorun` on a real-GPU machine loads the lazy stage chunk (~462909 total script bytes at 06) and **fails** the 184643 budget; after this edit it should land at ~181165 and pass. That flip is the proof the change works.

If the measured `resource-summary:script:size` is not ~181165 (say, outside ±2%), or if it exceeds 184643: **report the measured value and the delta versus 181165, and stop for a decision.** Do NOT adjust the budget, the severity, or the assertion — a moved eager payload is a finding about the bundle, not a number to be re-fitted.
  </action>
  <verify>
    <automated>grep -c "webgl=off" lighthouserc.json</automated>
  </verify>
  <done>
- `grep -c "webgl=off" lighthouserc.json` returns 2.
- `git diff --stat lighthouserc.json` shows a single changed line region confined to the `url` array; `git diff lighthouserc.json` contains no change to any number under `assertions`.
- `git diff lighthouserc.webgl.json` is empty (D-8).
- The appended ci.yml paragraph did not delete any pre-existing comment line: `git diff .github/workflows/ci.yml` shows additions only within the Lighthouse comment block.
- LHCI is executed in Task 4, not here.
- Commit: `ci: pin the LHCI budget gate to the explicit ?webgl=off condition`
  </done>
</task>

<task type="auto">
  <name>Task 4: Prove the whole chain locally and record the evidence</name>
  <files>.planning/quick/260725-tcn-wire-eval-suite-stage-chunk-tripwire-and/SUMMARY.md</files>
  <action>
Run the four gates in the same order CI will, on a clean tree, and record measured values. No source changes in this task — if a gate fails, fix it in the owning task's commit (amend or follow-up), then re-run from the top.

Run in this order. **Expected runtimes are given so a long-running step is not mistaken for a hang.**

1. `pnpm test:unit` — expect `tests 17 / pass 17 / fail 0`, exit 0. **~1s.**
2. `pnpm build` — expect exit 0. **1-3 min** (prebuild regenerates the CV PDF, subsets Bricolage, copies benchmarks before `next build`). A pre-existing `metadataBase` warning is known and logged in the audit as cosmetic — not a failure.
3. `pnpm check:stage-chunk` — expect exit 0, no forbidden CDN host reported. **1-3s.**
4. `CI=1 pnpm exec playwright test --project=chromium --reporter=list` — expect `159 passed`. **Budget 3-8 min, not a hang.** Anchor measured during planning: 44 tests ran in 28.3s single-worker against `pnpm start` (~0.64 s/test); the scroll/scene/immersive specs are slower per test than that subset, and `CI=1` forces `workers: 1` and `retries: 2`.
   - Override the reporter to `list` as shown: `CI=1` otherwise selects the `github` reporter, which streams almost nothing locally and makes a healthy run look stalled. CI itself keeps the `github` reporter.
   - `CI=1` also flips `reuseExistingServer` to false and the webServer command to `pnpm start`, so step 2 must have completed and **port 3000 must be free** — check with `lsof -i :3000` first and kill any stray `next-server`.
5. `npx lhci autorun` — expect exit 0 against the `?webgl=off` URLs. **2-5 min** (3 runs × 2 URLs plus server start). Capture the reported `resource-summary:script:size`.
   - Expected ~181165 bytes vs the 184643 budget. **If it is outside ±2% of 181165, or over budget: record the measured number and the delta, stop, and escalate for a decision. Do not modify the budget.**
   - Confirm no assertion other than the pre-existing LCP `warn` is triggered.

Then write `SUMMARY.md` in this directory containing:
- The four audit items closed, each mapped to its commit.
- The measured numbers from steps 1-5, including the LHCI `script:size` actual vs the 181165 expectation and the 184643 budget.
- **An explicit line recording the `stage-perf` exclusion** (D-2): CI runs `--project=chromium` only; `stage-perf`'s wall-clock frame budgets stay a local/manual gate run via `pnpm test`, and this is a deliberate scope boundary of this change, not an oversight.
- A follow-up note, filed but **not acted on** (D-8 keeps that file untouched): `lighthouserc.webgl.json`'s `_budget_derivation` string says "the representative CI gate's URLs carry no ?webgl param". After Task 3 that clause is stale — the CI URLs now carry `?webgl=off`. Its conclusion ("this config never runs in the blocking CI job") remains true. Someone should refresh the wording next time that file is legitimately edited.
- Confirmation that no runtime code path changed and no cross-origin call was added (AGENTS.md constraint).
  </action>
  <verify>
    <automated>pnpm test:unit && pnpm build && pnpm check:stage-chunk</automated>
  </verify>
  <done>
- All five commands above ran; steps 1-4 exited 0 and step 5 either exited 0 or was escalated with a measured delta.
- `pnpm exec playwright test --project=chromium` reported `159 passed`.
- LHCI `resource-summary:script:size` recorded as a number in SUMMARY.md, compared against both 181165 (expected) and 184643 (budget).
- SUMMARY.md contains the `stage-perf` exclusion line and the `lighthouserc.webgl.json` drift follow-up.
- `git status --porcelain` is clean apart from the SUMMARY.
- Commit: `docs(quick): record CI-gate wiring verification evidence`
  </done>
</task>

</tasks>

<risks>
| Risk | Likelihood | Handling |
|------|-----------|----------|
| `?webgl=off` shifts measured script bytes against the 184643 budget | Low — the eager condition is documented at 181165 bytes (05 and 06), and CI already resolves to tier `none` via SwiftShader, so the number should not move | **Executor must report the measured delta and stop.** Never silently re-fit the budget, severity, or assertion. Task 3 states the stop rule; Task 4 records the number. |
| Port 3000 contention between Playwright's `pnpm start` and LHCI's `startServerCommand` in the same job | Low — Playwright kills its webServer process tree on exit | Watch for `EADDRINUSE` on the Lighthouse step. Fix only if observed; do not pre-emptively add a teardown step. |
| CI wall-clock grows by browser install + 159 evals + build | Certain, ~4-8 min added | Accepted: this is the point of the change. D-4's cheapest-first ordering means a broken invariant reds out in seconds, before the expensive steps. |
| First CI run reveals eval flake that never appears locally | Medium — `workers: 1` and `retries: 2` are already configured for CI, and `stage-perf` (the genuinely timing-fragile project) is excluded by D-2 | If a chromium spec flakes on the runner, diagnose it as a real finding first. Do not widen retries or exclude specs without recording why. |
| The `*.test.ts` glob silently matches nothing after a future file move | Low | Non-issue: `sh` passes the unexpanded literal through and tsx fails loudly. Documented in Task 1. |
</risks>

<success_criteria>
- A push to any branch runs: content parity → unit tests → build → DSGVO stage-chunk tripwire → 159 chromium evals → LHCI budget, and fails on any of them.
- `pnpm test:unit` exists and covers both `node:test` files (17 tests).
- Playwright in CI targets the production build via `pnpm start`; local `pnpm test` still uses `pnpm dev`.
- The `stage-perf` exclusion is documented in ci.yml and in SUMMARY.md.
- `lighthouserc.json` differs from `61c72b8` only by `?webgl=off` on two URLs — no budget, threshold, or severity moved anywhere in the repo.
- `lighthouserc.webgl.json` is unchanged.
- No dependency added to `package.json`; no runtime source file modified.
- Four commits, each independently revertible.
</success_criteria>

<output>
Create `.planning/quick/260725-tcn-wire-eval-suite-stage-chunk-tripwire-and/SUMMARY.md` when done.
</output>
</content>
</invoke>
