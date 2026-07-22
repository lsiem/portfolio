/**
 * Deterministic seeding primitives (KERN WP-A; DESIGN-SPEC §2.3, §4).
 * Extracted VERBATIM from `constellation-data.ts` — the sin-hash PRNG that
 * the shipped hero constellation used — so KERN's transition swirl axes and
 * per-shard stagger stay reproducible across renders, re-measures and tests
 * (React-Compiler purity: pure function of the seed, never `Math.random()`).
 *
 * `constellation-data.ts` still holds its own copy for the v1 particle stage
 * that ships on `main`; this module is the KERN-era home. Both are byte-equal
 * by intent — WP-F deletes `constellation-data.ts` after the atomic flip, at
 * which point this file is the sole source (§2.3 module-fate table).
 */

export type ConstellationTier = "mobile" | "desktop";

// --- Deterministic seeded PRNG (sin-hash, NOT Math.random) -------------------
// Mirrors constellation-canvas.tsx's 04-03 stub technique: a pure function of
// its seed, so repeated calls (across renders/tests) are reproducible.
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x); // fractional part in [0, 1)
}

/** Deterministic value in [min, max) from a seed (see `seededRandom`). */
export function randomInRange(seed: number, min: number, max: number): number {
  return min + seededRandom(seed) * (max - min);
}
