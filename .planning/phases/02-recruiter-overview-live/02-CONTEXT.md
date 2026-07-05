# Phase 2: Recruiter Overview Live - Context

**Gathered:** 2026-07-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the complete, fast, accessible **functional recruiter layer** live on lsiem.de: hero (name/role/value-prop in the first viewport), career timeline, projects with deep case studies, domain-grouped skills, an About block, a persistent one-click contact affordance, a downloadable CV-PDF per locale, an explicit dark-mode toggle, SEO share cards (OG images + Person JSON-LD), and a build-time GitHub activity heatmap. All bilingual (DE default), Core-Web-Vitals "good" on mobile, keyboard-accessible.

Requirements: CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08, MODE-01, TECH-01, TECH-03, TECH-04, TECH-05, TECH-08.

**NOT in this phase (→ Phase 3):** signature visual identity, a new color world, bold/kinetic typography, decorative or scroll-driven motion, the immersive experience, and the full reduced-motion quiet-variant (MODE-02). Phase 2 ships a **neutral, disciplined, editorial/Swiss-minimal baseline** on the existing interim tokens — it formalizes and extends what is already shipped in `src/app/globals.css`. Every design decision that would commit signature identity is deferred to Phase 3.

</domain>

<decisions>
## Implementation Decisions

The approved **02-UI-SPEC.md is the binding design contract** for this phase. The decisions below resolve the five open decisions it surfaced (D-A–D-E) and add the behavioral/technical choices gathered in discussion (CTX-*). Where an ID like `D-A` appears, it maps 1:1 to the UI-SPEC's Open Decisions table.

### UI-SPEC open decisions — now LOCKED
- **D-A (Overview structure + contact):** Keep the single-scroll `/[locale]` overview (hero → career → projects → skills → about → contact) and add a compact `Contact` anchor to the sticky-header control cluster (logo `LS.` | spacer | `Contact` | Theme toggle | Locale switcher). Contact is one click from every section.
- **D-B (Dark-mode toggle):** **3-state System / Light / Dark.** Persisted to `localStorage` key `theme`, no-flash blocking inline `<head>` script (no external calls — DSGVO-safe), attribute-driven (`data-theme`) with `@media (prefers-color-scheme)` as the System fallback. Real DOM, keyboard-operable, styled with existing tokens (accent NOT used on the control).
- **D-C (CV placement):** CV download button lives in the **contact block only** — no header mirror (keeps the header cluster clean).
- **D-D (Photo shape):** `rounded-lg`, avatar scale (~96–160px). Signature treatment deferred → Phase 3. (Applies whenever the photo lands — see Deferred.)
- **D-E (CV document layout):** **One-column, ATS-friendly.** Two-column sidebar polish deferred → Phase 3.

### Recruiter overview behavior
- **CTX-01 (MODE-01 interpretation):** The single-scroll overview page **IS** the dense recruiter overview. The mono anchor-nav in the first fold is the "one click" to any facts block (Wer/Was/Skills/Timeline/Kontakt/CV). **No separate condensed TL;DR view** to maintain — everything is one accessible page, hero renders name+role+value-prop as static SSR HTML, never gated behind motion.
- **CTX-02 (Section order):** **Career-first** — hero → career → projects → skills → about → contact. Deliberately leads with the SysAdmin → Software Engineering → Product Owner arc (the D-02 narrative from Phase 1), with ELIA/Vidama deep case studies following.

### Profile photo (CONT-06)
- **CTX-03:** Ship the About section **text-first** now (degrades gracefully per UI-SPEC). The profile photo is an **owner-supplied asset that slots in later as a non-blocking follow-up** — it does NOT block Phase 2. The "About with photo" sub-criterion is carried as a deferred owner action, not a phase blocker.

### GitHub activity heatmap (TECH-08)
- **CTX-04:** Source the last-12-months contribution calendar from **GitHub's GraphQL API using a read-only personal access token stored as a Vercel environment variable**, fetched at **build time with daily ISR revalidation** (`revalidate` ~86400s). The shipped page makes **no runtime call to GitHub** (DSGVO hard constraint). Account: `github.com/lsiem` (from `content/{de,en}/contact.ts`). Monochrome `--foreground`-opacity intensity ramp (accent NOT used); graceful static fallback line on fetch failure.
- **Owner action:** create the read-only GitHub PAT and add it to the Vercel project env before execution.

### CV-PDF (CONT-08)
- **CTX-05:** Generated as a **build-time static file, one per locale** (`Lasse-Siemoneit-CV-de.pdf` / `-en.pdf`), sourced from the **same content model** (single source of truth), served as a static asset. Real selectable text (not an image), embedded/subset Geist Sans, locale-correct, "as of" date, no third-party runtime calls (DSGVO). Layout per D-E (one-column). Contact facts = email/GitHub/LinkedIn only (no phone/address — matches the schema's data-minimization).
- **RESEARCH FLAG (carried from ROADMAP):** the concrete **generation technique** is an unverified pattern — the phase researcher must resolve *how* to render the PDF at build time from the content model (candidate approaches: React-PDF / `@react-pdf/renderer`, a headless-print pipeline, a typesetting lib, or a print-CSS route captured at build). Constraint locked: **build-time**, not on-demand; must embed fonts; DSGVO-clean.

### Production cutover & branching
- **CTX-06:** **Promote at end of phase.** Build the full site on Vercel preview URLs; flip `siteMetadataBase` to `https://lsiem.de` (one-line in `src/lib/seo.ts`) and promote to production **only when Phase-2 verification passes.** Visitors never see half-built states. lsiem.de continues serving the interim minimal site until cutover.
- **CTX-07:** Phase 2 commits land on branch **`phase/02-recruiter-overview-live`** (renamed from `fix/interim-portfolio-styling`, which already held all Phase 1 + interim styling work). One PR to `main` at end of phase carries the full cutover.

### Claude's Discretion
- OG image template composition details (`next/og` / `ImageResponse` at build) within the UI-SPEC's neutral spec — exact layout of the 1200×630 card.
- Icon approach (inline SVG vs tree-shaken `lucide-react`) — keep minimal, monochrome, `currentColor`.
- Exact Tailwind 4 `@custom-variant dark (…)` syntax — confirm against current docs at implementation.
- CV-PDF library/tooling selection (bounded by the CTX-05 build-time constraint and the researcher's findings).
- MDX/content-loader plumbing details for feeding the CV and OG generators from the content model.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design contract (READ FIRST — binding for this phase)
- `.planning/phases/02-recruiter-overview-live/02-UI-SPEC.md` — the approved visual & interaction contract: layout shell (`max-w-3xl`), spacing scale, typography (Geist + mono-metadata), warm-stone monochrome + single orange accent, per-surface component inventory, interaction states, dark-mode mechanics, CV/OG/heatmap contracts, copywriting. The five Open Decisions it lists are resolved in this CONTEXT (D-A–D-E).

### Phase goal, requirements, prior decisions
- `.planning/ROADMAP.md` — Phase 2 goal + the 5 success criteria (30-second stopwatch test, timeline/case-studies/skills/about + one-click contact, CV-PDF, CWV-good + keyboard + dark mode, OG cards + Person JSON-LD + live GitHub activity).
- `.planning/REQUIREMENTS.md` — CONT-02…CONT-08, MODE-01, TECH-01/03/04/05/08 (Phase 2 scope); anti-features (no percent bars, no forms/login/comments, no unskippable intro).
- `.planning/phases/01-bilingual-content-foundation/01-CONTEXT.md` — D-01/D-02 (ELIA flagship + PO-perspective career arc; Vidama-Mediathek deep; OpenShift lighter card), **D-03 (ELIA confidentiality — public repo, abstract only)**, D-06 (content-model format), D-09 (German default locale, one CV per locale).

### Stack / architecture / pitfalls
- `.planning/research/STACK.md` — verified versions & integration rules (Next.js 16, next-intl 4, Tailwind 4 CSS-first, React `~19.2.0`).
- `.planning/research/ARCHITECTURE.md` — five-layer architecture; content-layer as single source of truth; `[locale]` + `generateStaticParams` → full SSG.
- `.planning/research/PITFALLS.md` — CWV budget in CI (TECH-01), routen-based i18n + full hreflang sets.

### Content model & existing helpers (the source everything renders from)
- `content/shared/types.ts` — Zod schemas (contact = email/github/linkedin only; skills have NO level field — enforces the no-percent-bars anti-feature).
- `content/{de,en}/{career,projects,skills,contact}.ts` + `content/{de,en}/case-studies/*.mdx` + `content/{de,en}/pages/{about,impressum,datenschutz}.mdx` — the bilingual content.
- `src/lib/content.ts` — content loader; `src/lib/seo.ts` — `siteMetadataBase` (flips to `https://lsiem.de`), `generateMetadata`, `localeAlternates`/hreflang.
- `src/app/globals.css` — the interim design tokens the UI-SPEC formalizes and extends.

### Confidential source (local only)
- `.planning/phases/01-bilingual-content-foundation/reference/ELIA-produktvision.{pdf,txt}` — **gitignored, local only.** Use only abstracted (D-03); no internal names/dates/models in content or committed docs.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Content model** (`content/{de,en}/*`, `content/shared/types.ts`): complete bilingual data + MDX; feeds the overview sections, the CV-PDF (CTX-05), and OG cards. Zod parity gate already enforces DE/EN completeness.
- **Routes already exist:** `src/app/[locale]/page.tsx` (overview), `src/app/[locale]/case-studies/[slug]/page.tsx` (deep case studies), `src/app/[locale]/[slug]/page.tsx` (prose pages incl. about/impressum/datenschutz), `src/app/[locale]/layout.tsx` (Geist fonts via `next/font`, header/main/footer landmarks).
- **`src/lib/seo.ts`:** `siteMetadataBase`, `generateMetadata`, `localeAlternates` — extend for OG images + Person JSON-LD (TECH-05); one-line domain flip (CTX-06).
- **`src/components/locale-switcher.tsx`:** real-anchor locale switcher (keep styling); the theme toggle joins it in the header cluster.
- **`src/app/globals.css`:** warm-stone monochrome tokens + orange accent, `@theme inline`, `::selection`, `scroll-behavior: smooth` — the baseline to formalize (dark-mode mechanics extend it).

### Established Patterns
- **Tailwind 4 CSS-first** (`@theme inline` in `globals.css`), **no component library** (standing project decision — hand-authored components).
- **next-intl** routen-based i18n, German default (D-09), full hreflang.
- **Content parity + confidentiality gates** run in CI (from Phase 1) — keep green.

### Integration Points
- **Dark mode:** move from pure media query to `data-theme` attribute + `@custom-variant dark`, plus the no-flash inline script in `<head>`; `<meta name="theme-color">` tracks active `--background`.
- **GitHub heatmap:** new build-time/ISR server fetch using a PAT env var (CTX-04) — the site's first authenticated build-time data source.
- **OG images:** `next/og` `ImageResponse` generated at build (no runtime third-party fetch).
- **CV-PDF:** new build-time generation step reading the content model (technique = research).
- **Production cutover:** `siteMetadataBase` flip + Vercel production promotion at end of phase (CTX-06).

</code_context>

<specifics>
## Specific Ideas

- **Career-first ordering is deliberate** (CTX-02): the SysAdmin → Software Engineering → Product Owner arc is the narrative the owner values; the hero + timeline carry it before the case studies.
- **Accent discipline is a feature:** orange stays ~10% (Case Study links, email, CV button, logo `.`, `::selection`, active anchor-nav). Reads as intentional, not decorative. Do not let accent leak onto external links, chips, borders, heatmap cells, or the controls.
- **No forms anywhere** — the overview is read-only; contact is `mailto:` + external links. (A contact form would be new capability / out of scope.)

</specifics>

<deferred>
## Deferred Ideas

- **Profile photo asset** (CONT-06 "with photo"): owner supplies later; slots into the About block (`rounded-lg`, avatar scale) post-Phase-2 without blocking. → non-blocking owner follow-up.
- **Signature visual identity** — color world, bold/kinetic typography, decorative & scroll-driven motion, immersive experience, heavier flagship-project treatment, signature photo treatment → **Phase 3 (Design Direction & Immersive Experience)**.
- **Full reduced-motion quiet-variant (MODE-02)** — Phase 2 meets reduced-motion trivially (static baseline); the designed quiet variant is Phase 3.
- **Two-column CV polish (D-E alternative)** — possible Phase 3 refinement once ATS-safe one-column ships.
- **shadcn / component library** — explicitly not adopted; if ever wanted, it's a Phase 3 identity concern.

None of the above blocks planning or execution of Phase 2.

</deferred>

---

*Phase: 2-Recruiter Overview Live*
*Context gathered: 2026-07-05*
