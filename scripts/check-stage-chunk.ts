/**
 * DSGVO CI grep tripwire: built JS chunks must contain NO third-party CDN
 * host string. Fonts are self-hosted via next/font, and the particle / WebGL
 * stage (the previous home of a detect-gpu unpkg URL) is gone, so gstatic,
 * jsdelivr, unpkg, and googleapis must not survive into a runtime chunk.
 *
 * Runs post-build in CI: `pnpm build && pnpm check:stage-chunk`. Exits non-zero
 * (fails the job) if any forbidden host appears in a built JS chunk.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const CHUNKS_DIR = join(process.cwd(), ".next", "static", "chunks");
const FORBIDDEN = ["gstatic", "jsdelivr", "unpkg", "googleapis"];

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
    "[check:stage-chunk] PASS — no gstatic/jsdelivr/unpkg/googleapis in any built JS chunk.",
  );
}

main();
