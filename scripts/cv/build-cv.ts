#!/usr/bin/env node
/**
 * build-cv.ts — renders the CV as PDF (German + English) into public/cv/.
 *
 * The CV is built from the same content modules as the website
 * (content/<locale>/*.ts), plus a few CV-only details from ./cv-extras.ts.
 * Rendering runs locally through Playwright's Chromium; nothing is fetched
 * from third parties. The Inter font must be installed on the machine
 * (falls back to the system sans-serif otherwise).
 *
 * Usage: pnpm build:cv
 */

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";

import * as deCareer from "../../content/de/career";
import * as deCerts from "../../content/de/certificates";
import * as deContact from "../../content/de/contact";
import * as deProjects from "../../content/de/projects";
import * as deSkills from "../../content/de/skills";
import * as enCareer from "../../content/en/career";
import * as enCerts from "../../content/en/certificates";
import * as enContact from "../../content/en/contact";
import * as enProjects from "../../content/en/projects";
import * as enSkills from "../../content/en/skills";
import type {
  CareerEntry,
  Certificate,
  ContactInfo,
  Project,
  SkillDomain,
  YearMonth,
} from "../../content/shared/types";
import { cvExtras, type CvExtras, type Locale } from "./cv-extras";

type CvContent = {
  careerIntro: string;
  career: CareerEntry[];
  certificates: Certificate[];
  methods: string[];
  contact: ContactInfo;
  projects: Project[];
  skillDomains: SkillDomain[];
};

const content: Record<Locale, CvContent> = {
  de: {
    careerIntro: deCareer.careerIntro,
    career: deCareer.career,
    certificates: deCerts.certificates,
    methods: deCerts.methods,
    contact: deContact.contact,
    projects: deProjects.projects,
    skillDomains: deSkills.skillDomains,
  },
  en: {
    careerIntro: enCareer.careerIntro,
    career: enCareer.career,
    certificates: enCerts.certificates,
    methods: enCerts.methods,
    contact: enContact.contact,
    projects: enProjects.projects,
    skillDomains: enSkills.skillDomains,
  },
};

/** Career entries shown on page 1; the rest continue on page 2. */
const PAGE_ONE_CAREER = ["itsc", "just-relate", "vidama"];

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const ym = (d: YearMonth) => {
  const [y, m] = d.split("-");
  return `${m.padStart(2, "0")}/${y}`;
};

const range = (from: YearMonth, to: YearMonth | null, x: CvExtras) =>
  `${ym(from)} – ${to ? ym(to) : x.labels.present}`;

const stripUrl = (u: string) =>
  u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

function careerHtml(entry: CareerEntry, x: CvExtras, compact = false) {
  const roles = entry.roles
    .map((role) => {
      const extra = x.extraPoints[`${entry.slug}:${role.from}`] ?? [];
      const points = [...role.points];
      for (const p of extra) points.splice(p.at, 0, p.text);
      return `
        <div class="role">
          <div class="row">
            <h4>${esc(role.title)}</h4>
            ${entry.roles.length > 1 ? `<span class="date">${range(role.from, role.to, x)}</span>` : ""}
          </div>
          <ul>${points.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
          <p class="stack"><b>${x.labels.stack}:</b> ${esc(role.stack.join(", "))}</p>
        </div>`;
    })
    .join("");

  const head = compact
    ? `<div class="row"><h3>${esc(entry.org)}</h3><span class="date">${range(entry.from, entry.to, x)}</span></div>
       <p class="loc">${esc(entry.location)}</p>`
    : `<div class="row"><h3>${esc(entry.org)} <span class="loc">${esc(entry.location)}</span></h3><span class="date">${range(entry.from, entry.to, x)}</span></div>`;

  return `<article class="job">${head}${roles}</article>`;
}

function projectHtml(p: Project, x: CvExtras) {
  const o = x.projectOverrides[p.slug];
  const title = o?.title ?? p.title;
  const summary = o?.summary ?? p.summary;
  const tags = o?.tags ?? p.tags;
  return `
    <article class="card ${p.size}">
      <h4>${esc(title)}</h4>
      <p class="ctx">${esc(p.context)}</p>
      <p>${esc(summary)}</p>
      ${tags.length ? `<div class="tags">${tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
    </article>`;
}

function render(locale: Locale) {
  const c = content[locale];
  const x = cvExtras[locale];
  const L = x.labels;
  const [first, ...rest] = c.contact.name.split(" ");

  const pageOneJobs = c.career.filter((e) => PAGE_ONE_CAREER.includes(e.slug));
  const pageTwoJobs = c.career.filter((e) => !PAGE_ONE_CAREER.includes(e.slug));
  const flagship = c.projects.filter((p) => p.size === "flagship");
  const feature = c.projects.filter((p) => p.size === "feature");
  const compact = c.projects.filter((p) => p.size === "compact");

  const contactItems = [
    c.contact.email,
    "lsiem.de",
    stripUrl(c.contact.github),
    stripUrl(c.contact.linkedin),
    c.contact.location,
  ];

  const footer = (page: number, withDate: boolean) => `
    <footer>
      <span>${esc(c.contact.name)} · ${L.cv}</span>
      <span>${withDate ? `${L.asOf} · ` : ""}${L.page} ${page} / 2</span>
    </footer>`;

  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<title>${esc(c.contact.name)} – ${L.cvTitle}</title>
<style>${CSS}</style>
</head>
<body>
<section class="page p1">
  <header class="hero">
    <h1>${esc(first)} <span>${esc(rest.join(" "))}</span></h1>
    <p class="role-line">${esc(c.contact.role)}</p>
    <p class="value">${esc(c.contact.valueProp)}</p>
    <ul class="contact">${contactItems.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
  </header>
  <div class="cols">
    <main>
      <h2>${L.profile}</h2>
      <p class="intro">${esc(c.careerIntro)}</p>
      <h2>${L.experience}</h2>
      ${pageOneJobs.map((e) => careerHtml(e, x)).join("")}
    </main>
    <aside>
      <h2>${L.skills}</h2>
      <p class="hint">${L.yearsHint}</p>
      ${c.skillDomains
        .map(
          (d) => `
        <h5>${esc(d.domain)}</h5>
        <dl>${d.skills.map((s) => `<div><dt>${esc(s.name)}</dt><dd>${L.years(s.years)}</dd></div>`).join("")}</dl>`,
        )
        .join("")}
      <h2>${L.certificates}</h2>
      ${c.certificates
        .map(
          (cert) => `
        <div class="cert">
          <p class="t">${esc(cert.title)} (${esc(cert.code)})</p>
          <p class="m">${esc(cert.issuer)} · ${ym(cert.date)}</p>
        </div>`,
        )
        .join("")}
      <h2>${L.personal}</h2>
      <dl class="personal">
        ${x.personal.map((p) => `<div><dt>${esc(p.label)}</dt><dd>${esc(p.value)}</dd></div>`).join("")}
      </dl>
    </aside>
  </div>
  ${footer(1, false)}
</section>

<section class="page p2">
  <header class="mini">
    <strong>${esc(c.contact.name)}</strong>
    <span>${esc(c.contact.role)}</span>
  </header>
  <h2>${L.experienceContinued}</h2>
  <div class="grid2 jobs2">${pageTwoJobs.map((e) => careerHtml(e, x, true)).join("")}</div>
  <h2>${L.projects}</h2>
  ${flagship.map((p) => projectHtml(p, x)).join("")}
  <div class="grid2">${feature.map((p) => projectHtml(p, x)).join("")}</div>
  <div class="grid3">${compact.map((p) => projectHtml(p, x)).join("")}</div>
  <h2>${L.methods}</h2>
  <div class="tags methods">${c.methods.map((m) => `<span>${esc(m)}</span>`).join("")}</div>
  <div class="grid2 facts">
    <div>
      <h2>${L.education}</h2>
      ${x.education.map((e) => `<p><b>${esc(e.title)}</b> · ${esc(e.detail)}</p>`).join("")}
    </div>
    <div>
      <h2>${L.languages}</h2>
      ${x.languages.map((l) => `<p><b>${esc(l.name)}</b> · ${esc(l.level)}</p>`).join("")}
    </div>
  </div>
  ${footer(2, true)}
</section>
</body>
</html>`;
}

const CSS = `
@page { size: A4; margin: 0; }
:root {
  --fg: #16212b; --accent: #0e5a6b; --muted: #5b6875; --faint: #676e75;
  --side: #f2f5f6; --line: #d9e0e4; --card: #e2e3e4;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: Inter, "Helvetica Neue", Arial, sans-serif; color: var(--fg); font-size: 8.6pt; line-height: 1.42; }
.page { width: 210mm; height: 297mm; position: relative; overflow: hidden; page-break-after: always; break-after: page; }
.page:last-child { page-break-after: auto; break-after: auto; }
h2 { font-size: 7pt; font-weight: 600; letter-spacing: .22em; text-transform: uppercase; color: var(--accent);
     display: flex; align-items: center; gap: 3mm; margin: 0 0 3mm; }
h2::after { content: ""; flex: 1; height: 1px; background: var(--line); }
.row { display: flex; justify-content: space-between; align-items: baseline; gap: 4mm; }
.date { font-weight: 600; font-size: 8pt; white-space: nowrap; }
footer { position: absolute; left: 13mm; right: 13mm; bottom: 7mm; display: flex; justify-content: space-between; font-size: 6.5pt; color: var(--faint); }

/* Page 1 */
.hero { padding: 13mm 13mm 6mm; border-bottom: 1px solid var(--fg); }
.hero h1 { font-family: "Inter Display", Inter, sans-serif; font-weight: 700; font-size: 26pt; line-height: 1.05; letter-spacing: -.01em; }
.hero h1 span { color: var(--accent); }
.role-line { color: var(--accent); font-weight: 600; font-size: 11pt; margin-top: 2mm; }
.value { color: var(--muted); font-size: 9pt; margin-top: 2.5mm; max-width: 150mm; letter-spacing: .01em; }
.contact { list-style: none; display: flex; flex-wrap: wrap; gap: 1mm 5.5mm; margin-top: 3mm; font-weight: 600; font-size: 7.6pt; }
.contact li::before { content: ""; display: inline-block; width: 1.3mm; height: 1.3mm; border-radius: 50%; background: var(--accent); margin-right: 1.8mm; vertical-align: middle; }
.cols { display: grid; grid-template-columns: 1fr 64mm; height: calc(297mm - 60mm); }
.p1 main { padding: 8mm 9mm 0 16mm; }
.p1 aside { background: var(--side); padding: 8mm 9mm 0 9mm; }
.intro { margin-bottom: 7mm; }
.job { margin-bottom: 4mm; }
.job h3 { font-size: 9.6pt; font-weight: 700; }
.job .loc { font-size: 7.4pt; font-weight: 400; color: var(--faint); margin-left: 1mm; }
.role { border-left: 1.5px solid var(--accent); padding-left: 3.5mm; margin: 2mm 0 0 0; }
.role h4 { color: var(--accent); font-size: 9pt; font-weight: 600; }
.role ul { list-style: none; margin-top: 1mm; }
.role li { padding-left: 3.5mm; position: relative; margin-bottom: .5mm; }
.role li::before { content: "–"; position: absolute; left: 0; }
.stack { font-size: 7.2pt; color: var(--muted); margin-top: 1.2mm; }
.stack b { color: var(--fg); font-weight: 600; }
aside .hint { font-size: 7pt; color: var(--faint); margin: -1mm 0 2.5mm; }
aside h5 { font-size: 8pt; font-weight: 700; margin: 2.6mm 0 1mm; }
aside dl > div { display: flex; justify-content: space-between; gap: 2mm; border-bottom: 1px solid var(--line); padding: .9mm 0; font-size: 7.6pt; }
aside dd { color: var(--accent); font-weight: 700; white-space: nowrap; }
aside h2 { margin-top: 5.5mm; }
aside h2:first-child { margin-top: 0; }
.cert { margin-bottom: 2mm; }
.cert .t { font-weight: 700; font-size: 7.8pt; line-height: 1.38; }
.cert .m { font-size: 7.2pt; color: var(--faint); }
dl.personal dd { color: var(--fg); font-weight: 600; }

/* Page 2 */
.p2 { padding: 10mm 13mm 0; }
.mini { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid var(--accent); padding-bottom: 3mm; margin-bottom: 5mm; }
.mini strong { font-size: 12pt; font-weight: 700; }
.mini span { font-size: 7.6pt; color: var(--muted); }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; margin-bottom: 3mm; }
.grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3mm; margin-bottom: 4.5mm; }
.jobs2 { gap: 8mm; margin-bottom: 4.5mm; }
.jobs2 .job { margin: 0; }
.jobs2 .loc { margin: .3mm 0 0; font-size: 7.4pt; color: var(--faint); }
.card { border: 1px solid var(--card); border-radius: 2mm; padding: 3mm 4mm; }
.card.flagship { background: var(--side); border-color: var(--side); margin-bottom: 3mm; }
.card h4 { font-size: 9pt; font-weight: 700; }
.card .ctx { color: var(--accent); font-size: 7pt; font-weight: 600; margin: .3mm 0 1.5mm; }
.tags { display: flex; flex-wrap: wrap; gap: 1.3mm; margin-top: 2mm; }
.tags span { border: 1px solid var(--card); background: #fff; border-radius: 99px; padding: .5mm 2.2mm; font-size: 6.4pt; }
.methods { margin-top: 0; margin-bottom: 4.5mm; }
.facts { gap: 8mm; }
.facts b { font-weight: 600; }
`;

async function main() {
  const out = join(process.cwd(), "public", "cv");
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const locale of ["de", "en"] as const) {
      const page = await browser.newPage();
      await page.setContent(render(locale), { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      // Guard against content outgrowing the fixed two-page layout.
      // Every content block must end above its page's footer.
      const overflow = await page.$$eval(".page", (pages) =>
        pages
          .map((p, i) => {
            const limit = p.querySelector("footer")!.getBoundingClientRect().top - 6;
            const bottom = Math.max(
              ...[...p.querySelectorAll("main > *, aside > *, .p2 > :not(footer)")].map(
                (el) => el.getBoundingClientRect().bottom,
              ),
            );
            return { i: i + 1, over: Math.ceil(bottom - limit) };
          })
          .filter((p) => p.over > 0),
      );
      if (overflow.length) {
        throw new Error(
          `[${locale}] content overflows: ${overflow.map((o) => `page ${o.i} by ${o.over}px`).join(", ")}`,
        );
      }
      const file = join(out, `Lasse-Siemoneit-CV-${locale}.pdf`);
      await page.pdf({ path: file, format: "A4", printBackground: true, preferCSSPageSize: true });
      console.log(`wrote ${file}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
