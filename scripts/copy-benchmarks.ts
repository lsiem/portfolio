#!/usr/bin/env tsx
/**
 * copy-benchmarks.ts — build-time copy of detect-gpu's benchmark JSONs into
 * public/ (Phase 4, D-07 / RESEARCH Pitfall 2).
 *
 * detect-gpu's getGPUTier() defaults to fetching its benchmark database from
 * https://unpkg.com/detect-gpu@<version>/dist/benchmarks at RUNTIME — a
 * third-party call from the shipped site, forbidden by AGENTS.md (DSGVO,
 * cookieless, self-hosted only). We copy the bundled benchmarks into
 * public/benchmarks/ at build time and call getGPUTier({ benchmarksURL:
 * "/benchmarks" }) so the lookup is same-origin and no external request ever
 * fires.
 *
 * public/benchmarks/ is a gitignored build artifact — regenerated on every
 * build via `prebuild` (after subset:font), mirroring the CV-PDF convention
 * (STATE.md decision [02-02]). Idempotent: rewrites only when a file's bytes
 * changed, so an unchanged detect-gpu version does not churn the artifact.
 *
 * Usage: tsx scripts/copy-benchmarks.ts  (invoked via `pnpm copy:benchmarks`)
 */

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const SOURCE_DIR = "node_modules/detect-gpu/dist/benchmarks";
const TARGET_DIR = "public/benchmarks";

async function main(): Promise<void> {
  const entries = await readdir(SOURCE_DIR).catch(() => {
    throw new Error(
      `copy-benchmarks: source ${SOURCE_DIR} not found — is detect-gpu installed?`,
    );
  });
  const jsonFiles = entries.filter((e) => e.endsWith(".json"));
  if (jsonFiles.length === 0) {
    throw new Error(`copy-benchmarks: no benchmark JSONs found in ${SOURCE_DIR}`);
  }

  await mkdir(TARGET_DIR, { recursive: true });

  let written = 0;
  for (const file of jsonFiles) {
    const src = await readFile(path.join(SOURCE_DIR, file));
    const dest = path.join(TARGET_DIR, file);
    const prev = await readFile(dest).catch(() => null);
    if (prev && prev.equals(src)) continue;
    await writeFile(dest, src);
    written += 1;
  }

  console.log(
    `copy-benchmarks: ${jsonFiles.length} benchmark file(s) in ${TARGET_DIR} (${written} written, ${jsonFiles.length - written} unchanged)`,
  );
}

main().catch((error: unknown) => {
  console.error("copy-benchmarks: failed", error);
  process.exit(1);
});
