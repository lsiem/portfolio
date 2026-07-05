#!/usr/bin/env tsx
/**
 * generate-cv.tsx — build-time CV-PDF generator (CONT-08 / CTX-05).
 *
 * Generates one selectable-text PDF per locale from the same content model
 * the site renders from (content/{de,en}/*.ts) — single source of truth
 * (CTX-05). Runs as a standalone `tsx` script chained into `prebuild`, so
 * `public/` holds both PDFs before `next build` collects static assets
 * (Pitfall 5 — must run before next build, not after). No third-party
 * runtime call is ever made: this is a pure build-time Node process, and
 * @react-pdf/renderer is a devDependency, never imported under src/app/**
 * (DSGVO — the shipped site makes no runtime network call).
 *
 * Usage: tsx scripts/generate-cv.tsx  (invoked via `pnpm generate:cv`)
 */

import { mkdir } from "node:fs/promises";
import process from "node:process";
import { renderToFile } from "@react-pdf/renderer";
import { career as careerDe } from "../content/de/career";
import { contact as contactDe } from "../content/de/contact";
import { projects as projectsDe } from "../content/de/projects";
import { skillDomains as skillDomainsDe } from "../content/de/skills";
import { career as careerEn } from "../content/en/career";
import { contact as contactEn } from "../content/en/contact";
import { projects as projectsEn } from "../content/en/projects";
import { skillDomains as skillDomainsEn } from "../content/en/skills";
import { CvDocument } from "./cv/CvDocument";
import type { CvLocale } from "./cv/labels";

const CONTENT = {
  de: { contact: contactDe, career: careerDe, projects: projectsDe, skillDomains: skillDomainsDe },
  en: { contact: contactEn, career: careerEn, projects: projectsEn, skillDomains: skillDomainsEn },
} as const satisfies Record<CvLocale, unknown>;

const LOCALES = ["de", "en"] as const satisfies readonly CvLocale[];

async function main(): Promise<void> {
  await mkdir("public", { recursive: true });

  for (const locale of LOCALES) {
    const content = CONTENT[locale];
    const outputPath = `public/Lasse-Siemoneit-CV-${locale}.pdf`;
    try {
      await renderToFile(
        <CvDocument
          locale={locale}
          generatedAt={new Date()}
          contact={content.contact}
          career={content.career}
          projects={content.projects}
          skillDomains={content.skillDomains}
        />,
        outputPath,
      );
      console.log(`[generate:cv] wrote ${outputPath}`);
    } catch (error) {
      // Fail loud — a missing/stale CV must break the build, not ship silently.
      console.error(`[generate:cv] failed to render CV for locale "${locale}":`, error);
      process.exit(1);
    }
  }

  console.log("[generate:cv] PASS");
}

main();
