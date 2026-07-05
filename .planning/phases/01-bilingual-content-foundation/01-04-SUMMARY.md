---
phase: 01-bilingual-content-foundation
plan: 04
subsystem: content
tags: [content, mdx, i18n, next-intl, content-collections, legal, confidentiality, vercel, deploy]

# Dependency graph
requires: [01-01, 01-02, 01-03]
provides:
  - "ELIA flagship case study (DE + EN) — Product-Owner perspective, abstracted per D-03"
  - "Vidama-Mediathek expanded to a full deep case study (DE + EN)"
  - "about / impressum / datenschutz prose pages in both locales"
  - "'pages' Content Collection + getPages/getPage accessors"
  - "SSG prose-page route [locale]/[slug] (dynamicParams=false, unknown slugs 404)"
  - "Site-wide footer legal links + footer.legal messages (DE/EN)"
  - "Active confidentiality blocklist gate (local-only) over all committed content"
  - "Fresh full-content Vercel preview deployment, end-to-end verified"
affects: []

# Tech tracking
tech-stack:
  added: []  # zero new packages (T-01-SC: lockfile unchanged)
  patterns:
    - "Second Content Collection ('pages') mirrors caseStudies incl. raw content retention (CONT-01)"
    - "dynamicParams=false on the prose route → only generated slugs render, everything else 404"
    - "Impressum reachable site-wide via the shared layout footer (§5 DDG 'ständig verfügbar')"

key-files:
  created:
    - "content/de/case-studies/elia.mdx, content/en/case-studies/elia.mdx"
    - "content/de/pages/about.mdx, content/en/pages/about.mdx"
    - "content/de/pages/impressum.mdx, content/en/pages/impressum.mdx"
    - "content/de/pages/datenschutz.mdx, content/en/pages/datenschutz.mdx"
    - "src/app/[locale]/[slug]/page.tsx — SSG prose-page route"
  modified:
    - "content/de/case-studies/vidama-mediathek.mdx, content/en/case-studies/vidama-mediathek.mdx — expanded to deep case study"
    - "content-collections.ts — added 'pages' collection"
    - "src/lib/content.ts — getPages/getPage + Page type"
    - "src/app/[locale]/layout.tsx — footer legal links"
    - "messages/de.json, messages/en.json — footer.legal keys"
    - "README.md — full rewrite"

key-decisions:
  - "Footer legal links placed in the shared layout footer (site-wide) rather than only the home page — the Impressum must be reachable from every page under §5 DDG (Rule 2 correctness)"
  - "Prose route uses dynamicParams=false for deterministic 404 on unknown slugs"
  - "Impressum street address left as a clearly-marked placeholder (no address invented); flagged for human input before the Phase-2 launch"

requirements-completed: [CONT-01, I18N-02]

# Metrics
duration: ~45min
completed: 2026-07-03
status: complete
---

# Phase 01 · Plan 04: Case studies, about & legal prose — full bilingual content on the preview URL

**The prose half of the content model is complete: the ELIA flagship case study (Product-Owner perspective, abstracted), the deep Vidama-Mediathek case study, and the about / Impressum / Datenschutz pages all exist in German and English, render as static routes, and are verified end-to-end on a fresh Vercel preview — with the confidentiality blocklist active and provably leak-free across the whole repo.**

## Accomplishments

- **ELIA flagship case study (DE + EN)** told from the Product-Owner perspective with the engineering→operations→product arc as the entry point. Four sections (Problem/Kontext, Architektur-Entscheidungen, Tradeoffs, Ergebnis/Stand) cover the three permitted architecture moments — live-data tool-calling over a classic index approach, the feature-flagged orchestrator migration in parallel operation, and EU data residency / DSGVO as a platform decision — plus the multi-agent architecture and Teams integration, using only category terms for connected systems.
- **Confidentiality gate is now ACTIVE for real.** Created the local-only blocklist (36 terms) *before* authoring; `pnpm check:content` scans all of `content/` + `messages/` and reports zero leaks. The blocklist stays gitignored and untracked (verified via `git check-ignore` + `git status --porcelain`).
- **Vidama-Mediathek** expanded from a thin stub into a full deep case study in both locales (role model, template-based content creation, shop/point-of-sale integration, sole-CTO tradeoffs).
- **Legal + about prose:** about (D-02 arc), Impressum (§5 DDG shape, contact email reused, address placeholder), and Datenschutzerklärung (Vercel hosting + server logs, cookieless Web Analytics/Speed Insights with 24h hash discard and no consent banner, email contact, DSGVO rights) — all DE + EN.
- **Wiring:** new `pages` Content Collection, `getPages`/`getPage` accessors, a static `[locale]/[slug]` route (`dynamicParams=false`), and site-wide footer legal links driven by new `footer.legal` message keys.
- **Fresh preview deployment** (full content) verified end-to-end; CI green including the Lighthouse budget at full content volume.

## Task Commits

1. **Task 1 — ELIA flagship case study (DE + EN) + local confidentiality blocklist** — `1ae84a4` (feat)
2. **Task 2 — deep Vidama case study, about + legal pages, pages collection + route + footer** — `abfc72e` (feat)
3. **Task 3 — README rewrite** — `d1dd0af` (docs)

(Task 3's deploy + verification produced no code changes beyond the README.)

## Preview Deployment & Verification Matrix

- **Fresh preview URL (this plan's own deploy):** `https://portfolio-eo2r6l7e3-lsiems-projects.vercel.app` (written to `/tmp/vercel-preview-url.txt`, overwriting 01-02's stale URL). Deploy was `target: null` (preview) — **not** `--prod`.
- **Root redirect:** `/` → 307 → `/de` ✓
- **12 content URLs → 200** on the fresh preview: `/de`, `/en`, `/{de,en}/case-studies/elia`, `/{de,en}/case-studies/vidama-mediathek`, `/{de,en}/about`, `/{de,en}/impressum`, `/{de,en}/datenschutz` ✓
- **Unknown slug** (`/de/bogus`) → 404 ✓
- **hreflang:** home and case-study pages carry `de` / `en` / `x-default` alternates both in the HTML head (`<link rel="alternate" hrefLang=...>`) and the `Link` response header ✓
- **Analytics:** `/_vercel/insights/script.js` → 200; client insights reference present in the served HTML ✓
- **Production untouched (D-08 / T-01-14):** all three commits confirmed absent from `origin/main`; no `vercel --prod` invoked.
- **CI green** on the final push (run 28673681988) — "Parity, build & performance budget" job passed (criterion 3 holds at full content volume).

## Deviations from Plan

### [Rule 2 — Missing critical functionality] Footer legal links placed site-wide, not only on the home page
The plan listed `src/app/[locale]/page.tsx` for the footer links. The actual footer element lives in the shared `layout.tsx`, and under §5 DDG the Impressum must be reachable from **every** page ("ständig verfügbar"). I therefore added the legal links (about/impressum/datenschutz) to the layout footer so they appear site-wide, and added a `footer.legal.label` key for the nav's accessible label. `page.tsx` was left unchanged. Files: `src/app/[locale]/layout.tsx`, `messages/{de,en}.json`. Commit `abfc72e`.

### [Plan expectation vs. framework behavior] hreflang attribute casing and host in the HTML head
The plan's automated check greps the home HTML for `hreflang="x-default"` (lowercase). Next 16 / React serialize the JSX attribute as `hrefLang` (camelCase), so a case-sensitive grep returns 0 while a case-insensitive one finds all three alternates. Additionally, the head alternates resolve to the **canonical production host** (`https://lsiem.de/...`, from `VERCEL_PROJECT_PRODUCTION_URL`) rather than the ephemeral preview host — correct SEO behavior. The `Link` **response header** uses the request/preview host. All three alternates (de/en/x-default) are present in both places; the hreflang requirement (criterion 2) is fully met. No code change made — this is expected behavior, documented for the verifier.

## Confidentiality Confirmation (D-03)

No term from the local reference material appears in any committed artifact — not in the MDX, frontmatter, commit messages, or this SUMMARY. Public ELIA content uses only the D-03 abstraction whitelist (multi-agent architecture, MCP-based tool-calling, "a current agent framework", EU data residency / DSGVO, Teams integration, category terms "ITSM-System" / "Wiki"). The blocklist scan over `content/` + `messages/` reports zero hits; nothing under `reference/` is tracked.

## Known Stubs / Intentional Placeholders

- **Impressum street address** is a clearly-marked placeholder (`[ADRESSE — vor dem Launch ergänzen]` / `[ADDRESS — to be added before launch]`) in both locales. No address was invented (T-01-13). This is a **required human input before the Phase-2 live launch** — see below.

## Items Needing User Input (for the end-of-phase human check)

1. **Impressum address (blocking for Phase-2 launch):** §5 DDG requires a contactable postal address. Supply the real address to replace the placeholder before switching the domain.
2. **ITSC Software-Engineering transition date:** the middle ITSC role still carries `from: null` (unconfirmed in any source — carried over from 01-03). Confirm the start date, and whether the Just Relate "Software Engineer" station is still active alongside the ITSC Product Owner role.
3. **Content-quality read (D-03):** read both ELIA versions and the deep Vidama case study in full on the preview URL and confirm the abstraction level, the PO-perspective narrative, and flagship-vs-deep depth feel right.
4. **Analytics field data (criterion 4):** confirm Web Analytics page views + Speed Insights data appear in the Vercel dashboard after visiting the preview.

## D-08 Reconciliation Note

`lsiem.de` currently serves the **interim Next.js site** (returns "Lasse Siemoneit" + `_next/static`, no `vite.svg`), not the old Vite site the plan's D-08 marker assumed. Per the 01-02 SUMMARY this is a **pre-existing user action** (the user merged the interim-live PR to `main` before this phase), not anything this plan did — my deploy was preview-only and all commits are absent from `origin/main`. The plan's `vite.svg` positive marker is therefore obsolete; the substantive D-08 invariant (this workflow does not touch production) held.

## Self-Check: PASSED

- content/de/case-studies/elia.mdx — FOUND · content/en/case-studies/elia.mdx — FOUND
- content/{de,en}/pages/{about,impressum,datenschutz}.mdx — all FOUND
- src/app/[locale]/[slug]/page.tsx — FOUND
- Commits 1ae84a4, abfc72e, d1dd0af — all present in git history
- blocklist.txt — gitignored + untracked (correctly NOT committed)

---
*Phase: 01-bilingual-content-foundation · Plan 04*
*Completed: 2026-07-03*
