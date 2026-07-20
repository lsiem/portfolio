/**
 * DSGVO CI grep tripwire (DESIGN-SPEC §8.5): the built stage/webgl-lab chunk
 * must contain NO third-party CDN host string. KERN uses three 0.185 core only
 * (no drei, no loaders, no decoders) so nothing should ever reach for gstatic
 * or jsdelivr — this asserts that by construction against the shipped bundle.
 *
 * Runs post-build in CI: `pnpm build && pnpm check:stage-chunk`. Exits non-zero
 * (fails the job) if any forbidden host appears in a built JS chunk.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const CHUNKS_DIR = join(process.cwd(), ".next", "static", "chunks");
// Cross-origin CDN hosts that must never appear in a shipped chunk (constraint
// 7: zero new cross-origin; fonts self-hosted via next/font, §5).
const FORBIDDEN = ["gstatic", "jsdelivr"];

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
    const content = readFileSync(file, "utf8");
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
