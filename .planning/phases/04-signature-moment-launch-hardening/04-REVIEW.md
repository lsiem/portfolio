---
phase: 04-signature-moment-launch-hardening
reviewed: 2026-07-17T18:20:00Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - src/lib/capability.ts
  - evals/scene.spec.ts
findings:
  critical: 0
  warning: 1
  info: 3
  total: 4
status: issues_found
---

# Phase 04: Code Review Report (04-06 gap-closure delta)

**Reviewed:** 2026-07-17T18:20:00Z
**Depth:** standard
**Files Reviewed:** 2 (`src/lib/capability.ts`, `evals/scene.spec.ts` — the delta since PR #16, commits `53cacff` + `e1f5336`)
**Status:** issues_found

## Summary

The 04-06 delta adds a pure classifier `sceneTierFromGpu` (FALLBACK → capable, otherwise tier < 2 → none) and 7 pure Playwright assertions. The classifier was verified against the **installed** detect-gpu 5.0.70 contract, not just its type surface:

- **All five `TierType` literals resolve safely.** `TierType = 'SSR' | 'WEBGL_UNSUPPORTED' | 'BLOCKLISTED' | 'FALLBACK' | 'BENCHMARK'`. The shipped ESM hard-codes `tier: 0` for SSR, WEBGL_UNSUPPORTED, and BLOCKLISTED, so all three fall into the `gpu.tier < 2 → "none"` branch. FALLBACK is always emitted with `tier: 1`. No literal can reach an unintended mount. Additionally, `type: "SSR"` is unreachable in the wired pipeline — `decideSceneTier`'s `typeof window === "undefined"` guard returns `"none"` before detect-gpu ever loads.
- **Bundle discipline holds (review focus #2).** `import type { TierResult } from "detect-gpu"` (capability.ts:22) is a standalone type-only import — erased at compile time. Verified in the fresh production build (post-`e1f5336`): the detect-gpu marker string `BLOCKLISTED` appears in exactly one client chunk (`.next/static/chunks/1b16kkc6hs3v1.js`, 6.8 KB, the dynamic-import target) and in no prerendered server HTML. No value import of detect-gpu exists anywhere in the delta (the spec imports `sceneTierFromGpu` from `../src/lib/capability`, which is Node-side test code, not bundled).
- **`decideSceneTier` upstream is byte-identical.** The diff touches only the step-7 doc comment and replaces the final two lines with `return sceneTierFromGpu(gpu)`. SSR guard, `?webgl=off`, reduced-motion, `?webgl=force`, saveData, deviceMemory, and the `failIfMajorPerformanceCaveat` probe are untouched — the CI SwiftShader runner still fails the probe before the classifier runs.
- **Security (review focus #5): clean.** `sceneTierFromGpu` is pure — no DOM reads/writes, no network, no new origins. Override parsing is untouched; `?webgl` values are still only string-compared against `"off"`/`"force"` and never written to the DOM (T-04-03-01/T-04-06-02 preserved).
- **`isMobile` optionality is handled acceptably.** `TierResult.isMobile` is optional; `gpu.isMobile ? "mobile" : "desktop"` coerces `undefined` → `"desktop"`. detect-gpu omits `isMobile` only on the SSR result (tier 0, resolves to `"none"` before the ternary), and always sets it on FALLBACK/BENCHMARK results, so no misclassification path exists.

One Warning (a load-bearing doc/threat-model premise that is factually incomplete) and three Info items below. Nothing blocks ship.

## Warnings

### WR-01: FALLBACK branch admits masked-renderer browsers, not only "newer/unknown GPUs" — the safety comment and threat-model premise are incomplete

**File:** `src/lib/capability.ts:100-103` (doc comment `src/lib/capability.ts:88-91`)
**Issue:** The comment ("GPU is newer/absent from benchmark snapshot") and the plan's threat disposition (T-04-06-01: "The relaxed set is unknown-new hardware with real GL — modern/capable by construction") understate the relaxed population. In the shipped detect-gpu 5.0.70, `type: "FALLBACK"` is also returned when the renderer string is **unobtainable or unmatchable**, not just when the GPU is new:
1. `WEBGL_debug_renderer_info` is deliberately skipped on Firefox (`isFirefox ? null : getExtension(...)`), so Firefox reports the masked `RENDERER` string; if it's empty → `P(1, "FALLBACK")`, if it matches no benchmark → `P(1, "FALLBACK")`.
2. Any browser with `privacy.resistFingerprinting` or similar renderer masking lands in the same branch.

On exactly these browsers the other capability signals are also absent (`navigator.deviceMemory` and `connection.saveData` are never implemented in Firefox/Safari — the code's own comment at line 37 says so), so for the masked-renderer population the `failIfMajorPerformanceCaveat` probe becomes the *sole* gate: an old-but-hardware-GL machine on Firefox now mounts the constellation, where it previously got `"none"`. This is plausibly the intended trade (the pre-fix behavior wrongly excluded *all* masked-renderer Firefox users, the same failure class as the M5 Pro; and the D-05/04-04 runtime mitigations — DPR clamp, frameloop pause on scroll-exit, context-loss unmount — bound the damage), but the decision comment that future maintainers will trust does not describe the actual population it admits.
**Fix:** Extend the doc comment so the accepted trade is explicit:

```typescript
if (gpu.type === "FALLBACK") {
  // FALLBACK = detect-gpu could not match the renderer to its benchmark
  // snapshot. That covers (a) GPUs newer than the shipped data (the M5 Pro
  // reproduction) AND (b) browsers that mask/withhold the renderer string
  // (Firefox skips WEBGL_debug_renderer_info entirely). For both, the caveat
  // probe above already proved hardware GL, and runtime budget controls
  // (DPR clamp, scroll-exit frameloop pause, context-loss unmount) bound the
  // cost — so unknown hardware is treated as capable rather than weak.
  return gpu.isMobile ? "mobile" : "desktop";
}
```

No logic change required unless the team decides the masked-renderer population should NOT mount — in that case a UA-independent signal would be needed, which is out of scope here.

## Info

### IN-01: `import type` inserted after the `SceneTier` export with a stray double blank line

**File:** `src/lib/capability.ts:20-24`
**Issue:** The new `import type { TierResult } from "detect-gpu";` sits *below* `export type SceneTier = ...` and is followed by two blank lines. Functionally harmless (type-only imports are erased and hoisting is irrelevant), but it violates the imports-first convention every other module in `src/` follows, and `import/first` will flag it once the currently broken repo-wide eslint (known, pre-existing, not re-flagged) is repaired.
**Fix:** Move line 22 above line 20 (directly under the header doc block) and collapse the double blank line to one.

### IN-02: `SSR` literal from the plan's must-have truth #3 is not pinned by a test

**File:** `evals/scene.spec.ts:194-236`
**Issue:** Plan truth #3 reads "BLOCKLISTED and WEBGL_UNSUPPORTED **(and SSR)** results still resolve to none", but the 7-case table (which the executor followed faithfully) contains no SSR assertion. Behavior is correct — detect-gpu emits `{ tier: 0, type: "SSR" }` (no `isMobile`), and `0 < 2 → "none"` — and the type is doubly unreachable in production via `decideSceneTier`'s window guard, but the stated contract is one assertion short of fully pinned.
**Fix:** One additional case (also exercises the optional-`isMobile` shape):

```typescript
test("classifies SSR result as none", () => {
  expect(sceneTierFromGpu({ tier: 0, type: "SSR" })).toBe("none");
});
```

### IN-03: BLOCKLISTED/WEBGL_UNSUPPORTED exclusion rests on detect-gpu's tier-0 invariant, not on the type literal

**File:** `src/lib/capability.ts:106-111`
**Issue:** For non-FALLBACK types the classifier trusts `gpu.tier` alone. detect-gpu 5.0.70 hard-codes `tier: 0` for BLOCKLISTED/WEBGL_UNSUPPORTED/SSR (verified in the shipped ESM), so behavior is correct today — but the pure unit tests feed literal objects, so a future detect-gpu upgrade that ever emitted, e.g., `BLOCKLISTED` with `tier >= 2` would mount a blocklisted GPU without any test failing. Low likelihood; the dependency is version-controlled.
**Fix (optional hardening):** Make the mount allowlist explicit instead of tier-implied:

```typescript
if (gpu.type !== "BENCHMARK") return "none"; // after the FALLBACK branch
if (gpu.tier < 2) return "none";
return gpu.isMobile ? "mobile" : "desktop";
```

---

_Reviewed: 2026-07-17T18:20:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
