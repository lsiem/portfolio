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
 *   7. detect-gpu tier < 2                 -> none, else mobile|desktop by isMobile
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

  // Exclude software rendering (SwiftShader) deterministically rather than by
  // benchmark luck. The probe context is reused by detect-gpu below.
  const probe = document
    .createElement("canvas")
    .getContext("webgl2", { failIfMajorPerformanceCaveat: true });
  if (!probe) return "none";

  const { getGPUTier } = await import("detect-gpu");
  const gpu = await getGPUTier({
    benchmarksURL: "/benchmarks", // self-hosted (DSGVO) — never unpkg
    glContext: probe,
  });
  if (gpu.tier < 2) return "none"; // tier 2 = >=30fps benchmark class (D-07)
  return gpu.isMobile ? "mobile" : "desktop";
}
