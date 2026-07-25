/**
 * DSGVO CI grep tripwire (DESIGN-SPEC §8.5): the built stage/webgl-lab chunk
 * must contain NO third-party CDN host string. KERN uses three 0.185 core only
 * (no drei, no loaders, no decoders) so nothing should ever reach for gstatic,
 * jsdelivr, unpkg or googleapis — this asserts that by construction against the
 * shipped bundle. The one known INERT occurrence (detect-gpu's default
 * `unpkg.com/detect-gpu` benchmarksURL, overridden to a same-origin path at the
 * call site) is stripped via INERT_ALLOWLIST so it cannot false-positive.
 *
 * Runs post-build in CI: `pnpm build && pnpm check:stage-chunk`. Exits non-zero
 * (fails the job) if any forbidden host appears in a built JS chunk.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const CHUNKS_DIR = join(process.cwd(), ".next", "static", "chunks");
// Cross-origin CDN hosts that must never appear in a shipped chunk (constraint
// 7: zero new cross-origin; fonts self-hosted via next/font, §5). `unpkg` +
// `googleapis` are defense-in-depth: KERN pulls no CDN glyphs/benchmarks and
// next/font self-hosts Google Fonts at build time, so neither host should ever
// survive into a runtime chunk.
const FORBIDDEN = ["gstatic", "jsdelivr", "unpkg", "googleapis"];

// Documented, narrowly-scoped allowlist of INERT occurrences that must not trip
// the grep. detect-gpu bakes a default `benchmarksURL` literal of
// "https://unpkg.com/detect-gpu@<version>/dist/benchmarks" into its bundle, so
// this substring is present in the stage chunk — but lib/capability.ts OVERRIDES
// it to the same-origin "/benchmarks" at the only call site, so it is dead config
// that is never fetched (no cross-origin request is made). We strip exactly this
// substring before grepping, so the newly-added `unpkg` tripwire still fires on
// any REAL unpkg reference while staying green on today's compliant build.
const INERT_ALLOWLIST = ["unpkg.com/detect-gpu"];

function collectJsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectJsFiles(full));
    else if (entry.name.endsWith(".js")) out.push(full);
  }
  return out;
}

function main(): void {
  if (!existsSync(CHUNKS_DIR)) {
    console.error(
      `[check:stage-chunk] ${CHUNKS_DIR} not found — run \`pnpm build\` first.`,
    );
    process.exit(1);
  }

  const offenders: string[] = [];
  for (const file of collectJsFiles(CHUNKS_DIR)) {
    let content = readFileSync(file, "utf8");
    // Neutralize the documented inert occurrences BEFORE grepping so they never
    // false-positive, without weakening detection of any other match.
    for (const inert of INERT_ALLOWLIST) content = content.split(inert).join("");
    for (const host of FORBIDDEN) {
      if (content.includes(host)) offenders.push(`${file} → "${host}"`);
    }
  }

  if (offenders.length > 0) {
    console.error(
      "[check:stage-chunk] DSGVO tripwire FAILED — forbidden CDN host(s) in built chunk(s):",
    );
    for (const o of offenders) console.error(`  ${o}`);
    process.exit(1);
  }

  console.log(
    "[check:stage-chunk] PASS — no gstatic/jsdelivr in any built JS chunk.",
  );
}

main();
