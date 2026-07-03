#!/usr/bin/env node
/**
 * check-content-parity.ts — I18N-02 locale parity gate + D-03 confidentiality blocklist.
 *
 * Dependency-free: uses only Node built-ins (node:fs, node:path, node:process) and
 * erasable TypeScript syntax so `node scripts/check-content-parity.ts` runs natively
 * on Node >= 22 with no tsx/ts-node/transpile step (supply-chain rule — no new deps).
 *
 * Behavior A — locale parity (I18N-02):
 *   Recursively compares the relative file trees under {root}/de and {root}/en.
 *   The two sorted path sets must be identical (covers MDX prose AND .ts modules).
 *   On any mismatch, prints one labeled line per missing counterpart and exits 1.
 *
 * Behavior B — confidentiality blocklist (D-03):
 *   Resolves the first existing .planning/phases/*\/reference/blocklist.txt.
 *   If absent (the CI case — the file is gitignored and local-only) prints a skip
 *   notice and continues (CI-safe, T-01-05). If present, scans every file under
 *   content/ and messages/ case-insensitively; any forbidden-term hit prints the
 *   offending path + line number and exits 1.
 *
 * Usage: node scripts/check-content-parity.ts [--root <dir>]   (root defaults to 'content')
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import process from "node:process";

type Failure = { locale: "de" | "en"; path: string; presentIn: "de" | "en" };

const CONTENT_ROOT_DEFAULT = "content";
const BLOCKLIST_SCAN_DIRS = ["content", "messages"];

/** Parse `--root <dir>`; default 'content'. */
function parseRoot(argv: string[]): string {
  const idx = argv.indexOf("--root");
  if (idx !== -1 && argv[idx + 1]) {
    return argv[idx + 1];
  }
  return CONTENT_ROOT_DEFAULT;
}

/** Recursively collect relative POSIX-style file paths under `dir` ('' if dir missing). */
function listFilesRelative(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const out: string[] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const abs = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
      } else if (entry.isFile()) {
        out.push(relative(dir, abs).split(sep).join("/"));
      }
    }
  };
  walk(dir);
  return out.sort();
}

/** Behavior A: compare de/en trees. Returns list of missing counterparts. */
function checkParity(root: string): Failure[] {
  const deDir = join(root, "de");
  const enDir = join(root, "en");
  const deFiles = new Set(listFilesRelative(deDir));
  const enFiles = new Set(listFilesRelative(enDir));

  const failures: Failure[] = [];
  for (const p of deFiles) {
    if (!enFiles.has(p)) {
      failures.push({ locale: "en", path: p, presentIn: "de" });
    }
  }
  for (const p of enFiles) {
    if (!deFiles.has(p)) {
      failures.push({ locale: "de", path: p, presentIn: "en" });
    }
  }
  return failures.sort((a, b) => a.path.localeCompare(b.path));
}

/** Resolve the first existing .planning/phases/*\/reference/blocklist.txt, or null. */
function findBlocklist(): string | null {
  const phasesDir = join(".planning", "phases");
  if (!existsSync(phasesDir)) {
    return null;
  }
  for (const phase of readdirSync(phasesDir, { withFileTypes: true })) {
    if (!phase.isDirectory()) {
      continue;
    }
    const candidate = join(phasesDir, phase.name, "reference", "blocklist.txt");
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

/** Read forbidden terms: non-empty, non-comment (#) trimmed lines. */
function readBlocklistTerms(file: string): string[] {
  return readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

type BlockHit = { file: string; line: number; term: string };

/** Behavior B: scan content/ + messages/ for any forbidden term (case-insensitive). */
function scanBlocklist(terms: string[]): BlockHit[] {
  const lowered = terms.map((t) => t.toLowerCase());
  const hits: BlockHit[] = [];
  for (const dir of BLOCKLIST_SCAN_DIRS) {
    for (const rel of listFilesRelative(dir)) {
      const abs = join(dir, rel);
      let contents: string;
      try {
        contents = readFileSync(abs, "utf8");
      } catch {
        continue; // non-text / unreadable file — skip
      }
      const lines = contents.split(/\r?\n/);
      lines.forEach((lineText, i) => {
        const haystack = lineText.toLowerCase();
        lowered.forEach((term, ti) => {
          if (haystack.includes(term)) {
            hits.push({ file: abs, line: i + 1, term: terms[ti] });
          }
        });
      });
    }
  }
  return hits;
}

function main(): void {
  const root = parseRoot(process.argv.slice(2));
  let failed = false;

  // --- Behavior A: locale parity ---
  const parityFailures = checkParity(root);
  if (parityFailures.length > 0) {
    failed = true;
    console.error(
      `[parity] Locale mismatch under "${root}/" — every content file must exist in both de/ and en/:`,
    );
    for (const f of parityFailures) {
      console.error(
        `  [parity] Missing in "${f.locale}": ${f.path}  (present in "${f.presentIn}")`,
      );
    }
  } else {
    console.log(`[parity] OK — de/ and en/ trees match under "${root}/".`);
  }

  // --- Behavior B: confidentiality blocklist (local-only, CI skips) ---
  const blocklistPath = findBlocklist();
  if (!blocklistPath) {
    console.log(
      "[blocklist] Skipped — no .planning/phases/*/reference/blocklist.txt found " +
        "(gitignored, local-only; expected absent in CI).",
    );
  } else {
    const terms = readBlocklistTerms(blocklistPath);
    console.log(
      `[blocklist] Scanning ${BLOCKLIST_SCAN_DIRS.join(", ")} against ${terms.length} term(s) from ${blocklistPath}.`,
    );
    const hits = scanBlocklist(terms);
    if (hits.length > 0) {
      failed = true;
      console.error("[blocklist] Confidential term(s) found in committed content:");
      for (const h of hits) {
        console.error(`  [blocklist] ${h.file}:${h.line} contains a forbidden term`);
      }
    } else {
      console.log("[blocklist] OK — no forbidden terms found.");
    }
  }

  if (failed) {
    process.exit(1);
  }
  console.log("[check:content] PASS");
}

main();
