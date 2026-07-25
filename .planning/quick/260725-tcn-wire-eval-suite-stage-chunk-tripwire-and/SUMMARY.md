---
phase: quick-260725-tcn
plan: 01
type: execute
status: complete
subsystem: ci
tags: [ci, playwright, lighthouse, dsgvo, unit-tests, regression-gates]
dependency_graph:
  requires: []
  provides:
    - "pnpm test:unit entrypoint (17 node:test assertions)"
    - "push/PR enforcement of the 159 cross-phase Playwright contract evals"
    - "push/PR enforcement of the DSGVO stage-chunk tripwire"
    - "self-contained LHCI eager-payload budget gate (?webgl=off)"
  affects:
    - ".github/workflows/ci.yml"
    - "playwright.config.ts"
    - "lighthouserc.json"
tech_stack:
  added: []
  patterns:
    - "CI-aware Playwright webServer: pnpm start under CI, pnpm dev locally"
    - "cheapest-gate-fails-first step ordering"
key_files:
  created: []
  modified:
    - package.json
    - src/components/scene/stage/progress.test.ts
    - src/components/scene/stage/kern-invariants.test.ts
    - .github/workflows/ci.yml
    - playwright.config.ts
    - lighthouserc.json
decisions:
  - "CI runs Playwright against the production build (pnpm start), matching the v1.0 audit's 159/159-green evidence base"
  - "CI runs --project=chromium only; stage-perf stays a local/manual gate (documented in ci.yml and below)"
  - "No budget, threshold or severity changed anywhere; lighthouserc.webgl.json untouched"
metrics:
  duration: "~35 min"
  completed: 2026-07-25
  tasks: 4
  commits: 4
---

# Quick Task 260725-tcn: Wire eval suite, stage-chunk tripwire and LHCI condition into CI — Summary

Closed the "CI enforcement" tech-debt cluster from `.planning/v1.0-MILESTONE-AUDIT.md` (lines 100-106): the 159 Playwright contract evals, the DSGVO stage-chunk tripwire and the two `node:test` files were all documented as gates but none ran on push or PR. All four now do, and the LHCI script budget measures the eager payload by construction rather than by accident of the runner's GL stack.

## Audit items closed → commit

| Audit item (v1.0-MILESTONE-AUDIT.md:104-106) | Commit |
|---|---|
| Add a `test:unit` script (`node --test` via tsx) for `progress.test.ts` + `kern-invariants.test.ts` | `b18b002` |
| Append `pnpm check:stage-chunk` to ci.yml after the Build step | `b18b002` |
| Append the eval suite to ci.yml (the audit says `pnpm test`; implemented as `--project=chromium` — see the stage-perf note below) | `d03da28` |
| Add `?webgl=off` to the LHCI URLs so the eager-budget gate is self-contained | `0eb6f0b` |
| Verification evidence (this file) | `docs(quick)` commit below |

## Resulting CI step order

Checkout → Setup pnpm → Setup Node.js → Install dependencies → Content parity check → **Unit tests** → Build → **DSGVO stage-chunk tripwire** → **Install Playwright chromium** → **Playwright evals (chromium)** → Lighthouse CI budget

Cheapest gate fails first (D-4): `test:unit` needs no build output and finishes in ~0.2s, so a broken invariant reds out in seconds rather than after a full Next build plus a browser download.

## Measured verification (local, clean tree, run in CI order)

| # | Gate | Command | Result |
|---|---|---|---|
| 1 | Unit tests | `pnpm test:unit` | exit 0 — `tests 17 / pass 17 / fail 0`, 163ms |
| 2 | Build | `pnpm build` | exit 0 |
| 3 | DSGVO tripwire | `pnpm check:stage-chunk` | exit 0 — `PASS — no gstatic/jsdelivr in any built JS chunk` |
| 4 | Contract evals | `CI=1 pnpm exec playwright test --project=chromium --reporter=list` | exit 0 — **159 passed (1.6m)**, single worker, against `pnpm start` |
| 5 | Perf budget | `npx lhci autorun` | exit 0 |

### LHCI script-size measurement

| Value | Bytes |
|---|---|
| **Measured** `resource-summary:script:size` (`?webgl=off`, both locales, all 6 runs identical) | **179673** |
| Expected from the 05/06 rebaseline | 181165 |
| Delta vs. expected | **−1492 bytes = −0.82%** (tolerance ±2% → within) |
| Asserted budget (unchanged) | 184643 |
| Headroom | 4970 bytes / 2.69% |

The measurement is deterministic — 179673 on all three runs of `/de?webgl=off` and all three of `/en?webgl=off`, 10 script requests each. It came in slightly *below* the 05/06 anchor rather than above, so no bundle-growth finding and no escalation was required. **No budget, threshold or severity was touched.**

Only assertion not passing: the pre-existing `largest-contentful-paint` **warn** (severity `warn`, non-blocking) — 2766.67ms on `/de`, 2615.41ms on `/en` against the 2500ms warn threshold. This matches the documented pre-existing state; no `error`-severity assertion fired.

Proof the change does something: before this edit, a local `npx lhci autorun` on this real-GPU machine loaded the lazy stage chunk (~462909 script bytes at 06) and **failed** the 184643 budget. After the edit it lands at 179673 and passes.

## stage-perf exclusion — deliberate, not an oversight

CI runs `pnpm exec playwright test --project=chromium` only. The **`stage-perf` project is excluded**, and this is a conscious scope boundary of this change:

- Its assertions are **wall-clock frame measurements** (R1 at-rest frame counting, long-task budget) that assume an uncontended machine.
- On a shared GitHub runner they would flake into red builds, which trains everyone to ignore CI — the exact failure mode the v1.0 audit penalised.
- It therefore stays a **local/manual gate**: run the full `pnpm test` (no `--project` filter) before touching the stage renderer.

The exclusion is stated in full in a comment above the `Playwright evals (chromium)` step in `.github/workflows/ci.yml`, and the `--project=chromium` filter is kept inline in the workflow rather than hidden behind a package script so a reader sees which project is skipped without opening another file.

## Follow-up filed, not acted on

`lighthouserc.webgl.json` was left untouched (D-8 — it is a documented lab audit, explicitly not a merge gate). Its `_budget_derivation` string now contains **two stale clauses**:

1. *"the representative CI gate's URLs carry no ?webgl param"* — false as of `0eb6f0b`; the CI URLs now carry `?webgl=off`.
2. *"The default lighthouserc.json stays byte-identical to its 04-02 state"* — also false now, though only by the URL change; every assertion in that file remains byte-identical.

The clause's **conclusion is still true**: `lighthouserc.webgl.json` never runs in the blocking CI job and remains a `pnpm lhci:webgl` lab audit. Someone should refresh the wording the next time that file is legitimately edited. No behavioural impact.

## Constraint compliance

- **No runtime code path changed.** The only source-file edits were two test-file *header comments* (`progress.test.ts`, `kern-invariants.test.ts`); no test body, assertion or import was touched. Everything else is config: `package.json` scripts, `ci.yml`, `playwright.config.ts`, `lighthouserc.json`.
- **No cross-origin call added** (AGENTS.md) — nothing here touches shipped code paths.
- **Zero dependencies added.** `tsx@4.23.0`, `@playwright/test@^1.61.1` and `@lhci/cli@^0.15.1` were all already present.
- **No budget, threshold or severity moved** anywhere in the repo. `git diff` on `lighthouserc.json` is confined to the `url` array; `lighthouserc.webgl.json` is unchanged.
- **ci.yml additions only** — the long Lighthouse local-vs-deployed rationale comment is preserved verbatim; the diff for that file shows zero deleted lines.
- Worked in a single agent lane (Claude Code), committed before any switch.

## Deviations from Plan

None — plan executed as written. One formatting note: the two LHCI URLs were reformatted onto separate lines because they exceed the single-line array width Prettier keeps; the change is still confined to the `url` array and no other key was touched.

## Self-Check: PASSED

- `.planning/quick/260725-tcn-wire-eval-suite-stage-chunk-tripwire-and/SUMMARY.md` — FOUND
- Commit `b18b002` — FOUND
- Commit `d03da28` — FOUND
- Commit `0eb6f0b` — FOUND
