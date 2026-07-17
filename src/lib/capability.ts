/**
 * Scene capability gate (D-07). BROWSER-ONLY utility — never import from a
 * Server Component (mirrors the motion-tokens.ts header discipline). Decides
 * whether — and at what tier — the Phase-4 hero constellation is allowed to
 * mount, from MEASURED capability signals, NOT form factor: capable phones are
 * included, weak/software-GL machines excluded (D-07, RESEARCH Pitfall 7).
 *
 * The decision is a pure async pipeline so it is reproducible and testable. It
 * is the ONLY place the `?webgl=off|force` override is interpreted (RESEARCH
 * Pattern 8) — the deterministic hook every later audit and Playwright smoke
 * test relies on. The override value is string-compared against the literals
 * "off"/"force" only and never written into the DOM/HTML/attributes (ASVS V5,
 * T-04-03-01).
 *
 * detect-gpu is loaded via dynamic import() so it stays out of the eager route
 * bundle (WOW-01 "nie im Initial-Bundle"); its benchmark JSONs are self-hosted
 * under /benchmarks (DSGVO — no unpkg call, RESEARCH Pitfall 2 / T-04-03-02).
 */

export type SceneTier = "none" | "mobile" | "desktop";

import type { TierResult } from "detect-gpu";


/**
 * Resolve the scene tier from capability signals + the `?webgl` override.
 *
 * Pipeline order (RESEARCH Code Example 1, with the Pattern-8 force branch
 * placed AFTER reduced-motion so D-10 is unconditional):
 *   1. ?webgl=off                          -> none  (hard override)
 *   2. prefers-reduced-motion: reduce      -> none  (D-10, force does NOT bypass)
 *   3. ?webgl=force                        -> mobile|desktop by pointer, SKIPPING
 *      the caveat probe + tiering so smoke tests exercise the 3D path on the CI
 *      SwiftShader runner (RESEARCH Pitfall 3b / Pattern 8)
 *   4. navigator.connection.saveData       -> none
 *   5. navigator.deviceMemory < 4          -> none  (only when the API exists —
 *      absent != weak; Safari/Firefox never implement it)
 *   6. webgl2 + failIfMajorPerformanceCaveat probe fails -> none (excludes
 *      SwiftShader deterministically)
 *   7. detect-gpu classification: FALLBACK resolves to capable, BENCHMARK tier < 2 resolves to none, otherwise mobile|desktop
 */
export async function decideSceneTier(): Promise<SceneTier> {
  // SSR guard — the gate never runs server-side, but keep the pipeline pure.
  if (typeof window === "undefined") return "none";

  const override = new URLSearchParams(window.location.search).get("webgl");
  if (override === "off") return "none";

  // D-10 is unconditional — reduced-motion wins even over ?webgl=force.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "none";
  }

  const tierByPointer = (): Exclude<SceneTier, "none"> =>
    window.matchMedia("(pointer: coarse)").matches ? "mobile" : "desktop";

  // Pattern 8 / Pitfall 3b: force skips the caveat probe + tiering so the CI
  // SwiftShader runner (and any deliberate smoke test) can exercise the 3D path.
  if (override === "force") return tierByPointer();

  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  if (connection?.saveData === true) return "none";

  const deviceMemory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  if (typeof deviceMemory === "number" && deviceMemory < 4) return "none";

  // First software-GL barrier. NOT deterministic on its own: modern Chrome
  // (SwANGLE-era headless, e.g. the GitHub Actions LHCI runner) can hand out a
  // SwiftShader-backed webgl2 context WITHOUT flagging a major performance
  // caveat — proven by PR #21 CI, where the scene mounted on the runner and
  // blew the eager budget (script 421KB, TBT 358ms). The deterministic CI/
  // software exclusion is the renderer-string check inside sceneTierFromGpu.
  // The probe context is reused by detect-gpu below.
  const probe = document
    .createElement("canvas")
    .getContext("webgl2", { failIfMajorPerformanceCaveat: true });
  if (!probe) return "none";

  const { getGPUTier } = await import("detect-gpu");
  const gpu = await getGPUTier({
    benchmarksURL: "/benchmarks", // self-hosted (DSGVO) — never unpkg
    glContext: probe,
  });
  return sceneTierFromGpu(gpu);
}

/**
 * Identified software rasterizers. detect-gpu classifies these as FALLBACK
 * (they are absent from its benchmark data), so the FALLBACK-mounts path must
 * name-check them explicitly — the failIfMajorPerformanceCaveat probe does NOT
 * reliably exclude them on modern Chrome (see the probe comment above). This
 * string check is what keeps the CI runner (SwiftShader/SwANGLE) and other
 * software-GL environments on the Phase-3 hero without ?webgl=force.
 */
const SOFTWARE_RENDERER =
  /swiftshader|llvmpipe|softpipe|software rasterizer|microsoft basic render/i;

/**
 * Classifies a GPU tier result into a SceneTier (04-06).
 *
 * detect-gpu returns type "FALLBACK" for any renderer absent from its benchmark
 * snapshot. That population is (a) GPUs newer than the shipped data (e.g. Apple
 * M5 Pro — the 04-UAT Test 4 gap), (b) browsers that mask the renderer string
 * (Firefox skips WEBGL_debug_renderer_info), and (c) software rasterizers like
 * SwiftShader. (a) and (b) are treated as capable — hardware GL was already
 * proven by the caveat probe upstream, and excluding them silently starves the
 * newest hardware of the signature moment. (c) is excluded by renderer-string
 * match, because the caveat probe alone no longer catches SwANGLE-era software
 * GL (proven on the PR #21 CI runner). Genuinely measured weak GPUs (type
 * "BENCHMARK" with tier < 2) and exclusion classes (BLOCKLISTED /
 * WEBGL_UNSUPPORTED / SSR, all tier 0) still resolve to "none" — the D-07
 * weak-GPU exclusion is preserved.
 *
 * Reference: D-07, 04-UAT Test 4, PR #21 CI failure.
 */
export function sceneTierFromGpu(
  gpu: Pick<TierResult, "tier" | "type" | "isMobile" | "gpu">
): SceneTier {
  if (gpu.type === "FALLBACK") {
    if (gpu.gpu && SOFTWARE_RENDERER.test(gpu.gpu)) return "none";
    return gpu.isMobile ? "mobile" : "desktop";
  }

  // Trust measured benchmark/exclusion results.
  if (gpu.tier < 2) {
    return "none";
  }

  return gpu.isMobile ? "mobile" : "desktop";
}

