#!/usr/bin/env tsx
/**
 * subset-bricolage.ts — build-time display-face subsetter (Phase 4, D-11
 * lever B).
 *
 * Subsets the committed OFL-licensed Bricolage Grotesque weight-700 latin
 * woff2 (the next/font/local source in src/app/fonts/) down to the UNION of
 * every glyph the display face (`font-display` utility) can render site-wide —
 * NOT just the hero. The display face renders the hero H1 (contact.name), the
 * case-study H1s (frontmatter `title`), and the prose-page H1s (frontmatter
 * `title`), across BOTH locales. The glyph union is COMPUTED from the content
 * model at build time (single source of truth, mirrors generate-cv.tsx) so a
 * content change can never orphan a glyph: this script re-runs on every build
 * via `prebuild` (after generate:cv). A missing display glyph would be a
 * UI-SPEC Typography contract violation (fallback-font flash on a real
 * heading), so on top of the computed union a conservative safety floor is
 * included (printable ASCII + German ä ö ü Ä Ö Ü ß + typographic punctuation)
 * — the floor guards future content, the computed union is authoritative for
 * today's.
 *
 * subset-font is a build-time devDependency (harfbuzz-WASM, no native code,
 * no postinstall — verified on the npm registry, T-04-01-SC); nothing here
 * ships to the client and no network call is ever made (DSGVO).
 *
 * Usage: tsx scripts/subset-bricolage.ts  (invoked via `pnpm subset:font`)
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import subsetFont from "subset-font";
import { contact as contactDe } from "../content/de/contact";
import { contact as contactEn } from "../content/en/contact";

const SOURCE_WOFF2 = "src/app/fonts/bricolage-grotesque-latin-700.woff2";
const TARGET_WOFF2 = "src/app/fonts/bricolage-grotesque-subset-700.woff2";

const CONTENT_GLOB_DIRS = [
  "content/de/case-studies",
  "content/en/case-studies",
  "content/de/pages",
  "content/en/pages",
] as const;

const MESSAGE_FILES = ["messages/de.json", "messages/en.json"] as const;

/**
 * Safety floor — NOT the authoritative set (that is computed from content
 * below), but a guard so future display-heading edits in either locale can
 * never fall outside the subset between content change and rebuild review:
 * printable ASCII (English punctuation included), German umlauts + eszett,
 * and the typographic punctuation range the latin subset shipped (dashes,
 * curly quotes, ellipsis, Euro).
 */
const SAFETY_FLOOR = [
  // Printable ASCII: U+0020..U+007E
  Array.from({ length: 0x7f - 0x20 }, (_, i) =>
    String.fromCharCode(0x20 + i),
  ).join(""),
  "äöüÄÖÜß",
  "–—‘’‚“”„…€•·",
].join("");

/** Extract the frontmatter `title` value from an MDX document. */
function extractFrontmatterTitle(mdx: string): string {
  const frontmatter = mdx.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) return "";
  const titleLine = frontmatter[1].match(/^title:\s*(.+)$/m);
  if (!titleLine) return "";
  const raw = titleLine[1].trim();
  // Frontmatter titles are JSON-style double-quoted strings; fall back to the
  // raw value for unquoted scalars.
  if (raw.startsWith('"')) {
    try {
      return JSON.parse(raw) as string;
    } catch {
      return raw;
    }
  }
  return raw;
}

/** Recursively collect every string value in a parsed JSON message tree. */
function collectStrings(node: unknown): string[] {
  if (typeof node === "string") return [node];
  if (Array.isArray(node)) return node.flatMap(collectStrings);
  if (node !== null && typeof node === "object") {
    return Object.values(node).flatMap(collectStrings);
  }
  return [];
}

async function computeGlyphUnion(): Promise<string> {
  const pieces: string[] = [SAFETY_FLOOR];

  // 1. Hero H1 — contact.name, both locales (content model, same import
  //    pattern as generate-cv.tsx).
  pieces.push(contactDe.name, contactEn.name);

  // 2. Case-study + prose-page H1s — frontmatter titles, both locales.
  for (const dir of CONTENT_GLOB_DIRS) {
    const entries = await readdir(dir);
    for (const entry of entries.filter((e) => e.endsWith(".mdx"))) {
      const mdx = await readFile(path.join(dir, entry), "utf8");
      pieces.push(extractFrontmatterTitle(mdx));
    }
  }

  // 3. Static UI strings (nav/headings/labels) from the next-intl message
  //    catalogs, both locales — none render in the display face today, but
  //    including them costs a handful of glyphs and makes a future
  //    display-styled static heading safe by construction.
  for (const file of MESSAGE_FILES) {
    const messages: unknown = JSON.parse(await readFile(file, "utf8"));
    pieces.push(...collectStrings(messages));
  }

  const union = [...new Set(pieces.join(""))].sort().join("");
  // Contract check (UI-SPEC Typography #2): the union MUST cover the German
  // display glyphs and English punctuation — fail the build loudly otherwise.
  for (const required of "äöüÄÖÜß—&'.") {
    if (!union.includes(required)) {
      throw new Error(
        `subset-bricolage: computed glyph union is missing required glyph "${required}"`,
      );
    }
  }
  return union;
}

async function main(): Promise<void> {
  const source = await readFile(SOURCE_WOFF2);
  const glyphs = await computeGlyphUnion();

  const subset = await subsetFont(source, glyphs, { targetFormat: "woff2" });

  // Only rewrite when the bytes changed, so unchanged content does not churn
  // the committed artifact (or invalidate next/font's build cache).
  const previous = await readFile(TARGET_WOFF2).catch(() => null);
  if (previous && previous.equals(subset)) {
    console.log(
      `subset-bricolage: unchanged (${subset.length} bytes, ${glyphs.length} chars)`,
    );
    return;
  }

  await writeFile(TARGET_WOFF2, subset);
  console.log(
    `subset-bricolage: wrote ${TARGET_WOFF2} — ${source.length} -> ${subset.length} bytes (${glyphs.length} chars)`,
  );
}

main().catch((error: unknown) => {
  console.error("subset-bricolage: failed", error);
  process.exit(1);
});
