# Phase 2: Recruiter Overview Live - Research

**Researched:** 2026-07-05
**Domain:** Static-first bilingual recruiter layer on Next.js 16 (App Router, SSG) — CV-PDF build generation, GitHub heatmap (build-time GraphQL), 3-state dark mode (Tailwind 4 CSS-first), OG images + Person JSON-LD, CWV/a11y hardening. All DSGVO-scoped (zero runtime third-party calls).
**Confidence:** HIGH for OG/metadata/caching/dark-mode/GitHub-query (verified against bundled Next 16 docs + official sources); MEDIUM-HIGH for the CV-PDF build wiring (library APIs verified; the exact pipeline is a recommended pattern, the flagged unknown).

## Summary

Every one of Phase 2's five research unknowns has a concrete, verified implementation path that stays inside the DSGVO hard constraint (no runtime third-party network calls) and the existing static-first architecture. Four of the five (OG images, dark mode, GitHub heatmap, JSON-LD) are standard, well-documented patterns that need no new runtime dependencies — `next/og` is built in, the GitHub fetch is a build-time `fetch` with `next.revalidate`, dark mode is a Tailwind 4 `@custom-variant` plus a tiny inline script, and JSON-LD is a server-rendered `<script>`. The one genuinely novel piece — CV-PDF generation (CTX-05, the roadmap-flagged unknown) — resolves cleanly to `@react-pdf/renderer` run in a standalone `prebuild` Node script that writes selectable-text, font-embedded PDFs into `public/`.

The single most useful discovery: the **`geist` npm package (v1.7.2) ships raw static `.ttf` files** (`Geist-Regular/Medium/SemiBold.ttf`, `GeistMono-Regular.ttf`) at `node_modules/geist/dist/fonts/`. These are the on-disk font source that BOTH `next/og` `ImageResponse` (needs ttf/otf, not the `next/font/google` runtime handles) AND `@react-pdf/renderer` (`Font.register`, ttf only) require. One dev dependency feeds both generators, all at build time, self-hosted, DSGVO-clean.

**Primary recommendation:** Add `@react-pdf/renderer` + `geist` + `tsx` as devDependencies. Generate the CV as a build step (`tsx scripts/generate-cv.tsx` chained into the existing `prebuild`) writing `public/Lasse-Siemoneit-CV-{de,en}.pdf` from the structured content modules. Do dark mode with a Tailwind 4 `@custom-variant` + attribute-driven tokens + a blocking inline theme script. Do OG via per-route `opengraph-image.tsx` using `ImageResponse` with `geist` ttf loaded from disk. Fetch GitHub contributions with a `read:user`-scoped PAT in a build-time `fetch` gated by `revalidate: 86400`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**UI-SPEC open decisions — now LOCKED:**
- **D-A (Overview structure + contact):** Keep the single-scroll `/[locale]` overview (hero → career → projects → skills → about → contact) and add a compact `Contact` anchor to the sticky-header control cluster (logo `LS.` | spacer | `Contact` | Theme toggle | Locale switcher). Contact is one click from every section.
- **D-B (Dark-mode toggle):** **3-state System / Light / Dark.** Persisted to `localStorage` key `theme`, no-flash blocking inline `<head>` script (no external calls — DSGVO-safe), attribute-driven (`data-theme`) with `@media (prefers-color-scheme)` as the System fallback. Real DOM, keyboard-operable, styled with existing tokens (accent NOT used on the control).
- **D-C (CV placement):** CV download button lives in the **contact block only** — no header mirror.
- **D-D (Photo shape):** `rounded-lg`, avatar scale (~96–160px). Signature treatment deferred → Phase 3.
- **D-E (CV document layout):** **One-column, ATS-friendly.** Two-column sidebar polish deferred → Phase 3.

**Recruiter overview behavior:**
- **CTX-01 (MODE-01):** The single-scroll overview page IS the dense recruiter overview. Mono anchor-nav in the first fold is the "one click" to any facts block. No separate condensed TL;DR view. Hero renders name+role+value-prop as static SSR HTML, never gated behind motion.
- **CTX-02 (Section order):** Career-first — hero → career → projects → skills → about → contact.

**Profile photo (CONT-06):**
- **CTX-03:** Ship the About section text-first now. Profile photo is an owner-supplied asset that slots in later as a non-blocking follow-up. Does NOT block Phase 2.

**GitHub activity heatmap (TECH-08):**
- **CTX-04:** Last-12-months contribution calendar from GitHub GraphQL API using a **read-only PAT stored as a Vercel environment variable**, fetched at BUILD time with daily ISR (`revalidate` ~86400s). Shipped page makes NO runtime call to GitHub. Account: `github.com/lsiem`. Monochrome `--foreground`-opacity intensity ramp (accent NOT used); graceful static fallback line on failure.
- **Owner action:** create the read-only GitHub PAT and add it to the Vercel project env before execution.

**CV-PDF (CONT-08):**
- **CTX-05:** Build-time static file, one per locale (`Lasse-Siemoneit-CV-de.pdf` / `-en.pdf`), sourced from the same content model, served as a static asset. Real selectable text (not an image), embedded/subset Geist Sans, locale-correct, "as of" date, no third-party runtime calls. Layout per D-E (one-column). Contact facts = email/GitHub/LinkedIn only (no phone/address).

**Production cutover & branching:**
- **CTX-06:** Promote at end of phase. Build on Vercel preview; flip `siteMetadataBase` to `https://lsiem.de` (one-line in `src/lib/seo.ts`) and promote to production only when Phase-2 verification passes.
- **CTX-07:** Commits land on branch `phase/02-recruiter-overview-live` (renamed from `fix/interim-portfolio-styling`). One PR to `main` at end of phase.

### Claude's Discretion
- OG image template composition details (`next/og` / `ImageResponse` at build) within the UI-SPEC's neutral spec — exact layout of the 1200×630 card.
- Icon approach (inline SVG vs tree-shaken `lucide-react`) — keep minimal, monochrome, `currentColor`.
- Exact Tailwind 4 `@custom-variant dark (…)` syntax — confirm against current docs at implementation.
- CV-PDF library/tooling selection (bounded by the CTX-05 build-time constraint and the researcher's findings).
- MDX/content-loader plumbing details for feeding the CV and OG generators from the content model.

### Deferred Ideas (OUT OF SCOPE)
- Profile photo asset (CONT-06 "with photo") — owner supplies later; slots into About post-Phase-2.
- Signature visual identity — color world, bold/kinetic typography, decorative/scroll motion, immersive experience, heavier flagship treatment, signature photo treatment → Phase 3.
- Full reduced-motion quiet-variant (MODE-02) → Phase 3.
- Two-column CV polish → possible Phase 3 refinement.
- shadcn / component library — not adopted; Phase 3 identity concern if ever.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONT-02 | Name/role/value-prop in first viewport, never behind intro | Already static SSR in `page.tsx` hero; formalize per UI-SPEC. No new tech. |
| CONT-03 | Career timeline (dates, roles, description) | Already rendered from `getCareer()`; content model + `careerEntrySchema` complete. |
| CONT-04 | 5–7 projects, 2–3 deep case studies | `getProjects()` + `getCaseStudy()` + `depth` weighting already wired; case-study routes exist. |
| CONT-05 | Skills domain-grouped, no percent bars | `getSkillDomains()`; schema has NO level field (anti-feature enforced). |
| CONT-06 | About-me (text-first now; photo deferred CTX-03) | Compact About block on overview + link to `/about` prose route (exists). `next/image` pattern documented for when photo lands. |
| CONT-07 | One-click contact from every section | Header `Contact` anchor (D-A) + contact block; `mailto:` + external links, no forms. |
| CONT-08 | Downloadable CV-PDF from content model | **PRIMARY UNKNOWN — resolved:** `@react-pdf/renderer` build script → `public/`. See §1. |
| MODE-01 | Dense overview reachable in one click, facts <30s | CTX-01: the overview IS the dense view; anchor-nav is the one click. |
| TECH-01 | CWV "good" on mobile, static first viewport | Keep heatmap/OG/CV generation off the client bundle; §5. |
| TECH-03 | Accessible: semantic HTML, keyboard, contrast, real DOM text | Focus rings, ARIA on toggle/heatmap, contrast verified in UI-SPEC; §3/§5. |
| TECH-04 | Dark mode (system + toggle) | 3-state System/Light/Dark; Tailwind 4 `@custom-variant` + inline script. See §3. |
| TECH-05 | OG images per page/locale + Person JSON-LD + meta | `next/og` `opengraph-image.tsx` + JSON-LD `<script>`; extend `seo.ts`. See §4. |
| TECH-08 | Live GitHub activity (build-time/cached fetch) | Build-time GraphQL fetch + `revalidate: 86400`. See §2. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Overview sections (hero/career/projects/skills/about/contact) | Rendering (RSC, SSG) | Content layer | Already server-rendered from typed content; pure static HTML — best for CWV + the 30s test. |
| CV-PDF generation | Build step (Node script) | Content layer | Build-time artifact into `public/`; must NOT touch client or request runtime (DSGVO + CWV). |
| GitHub contributions fetch | Rendering (RSC, build-time `fetch` + ISR) | External (GitHub GraphQL, build only) | Authenticated fetch with PAT is server-only; cached so the shipped page never calls GitHub. |
| OG image generation | Build step (`opengraph-image.tsx`, statically optimized) | Content layer | Prerendered PNG at build via `next/og`; no runtime third-party fetch. |
| Person JSON-LD | Rendering (RSC) | Content layer | Server-rendered `<script type="application/ld+json">` in the page. |
| Dark-mode token resolution | Browser (CSS `@custom-variant` + inline script) | — | Must resolve before paint (no-flash); attribute + media query, tiny client control for the toggle. |
| Theme toggle control | Browser (Client Component) | — | Needs `localStorage` + `matchMedia` + click handlers → `"use client"`. |

## Standard Stack

### Core (already installed — do not re-litigate)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.10 | App Router, SSG, `next/og`, metadata, ISR | `[CITED: node_modules/next/package.json]` — verified on disk |
| next-intl | ^4.13.1 | DE/EN routing, `getTranslations`, `setRequestLocale` | Already wired; `localePrefix: "always"`, `defaultLocale: "de"` |
| react / react-dom | ~19.2.0 | UI runtime | Pinned per STACK.md R3F constraint |
| tailwindcss + @tailwindcss/postcss | ^4 | CSS-first styling, `@theme inline`, `@custom-variant` | v4 in `globals.css` |
| zod | ^4.4.3 | Content schemas (`content/shared/types.ts`) | Already the source-of-truth validator |
| @content-collections/* | 0.15.x | MDX case-studies/pages compilation | Already wired; `content` raw field kept for CV/AI |

### Supporting (NEW — add for Phase 2)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@react-pdf/renderer** | 4.5.1 | Build-time CV-PDF: real text, embedded fonts, one-column layout | CV generation script (CONT-08). `[VERIFIED: npm registry — npm view, 2026-07-05; official docs react-pdf.org]` |
| **geist** | 1.7.2 | Raw Geist Sans/Mono `.ttf` files on disk for OG + PDF font embedding | Both `ImageResponse.fonts` and `Font.register` (TECH-05, CONT-08). `[VERIFIED: npm registry; Vercel official package]` |
| **tsx** | 4.23.0 | Run the TS+JSX CV build script under Node | `prebuild` step (Node type-stripping does not handle JSX). `[VERIFIED: npm registry]` |

### Alternatives Considered (CV-PDF technique — the flagged unknown)
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@react-pdf/renderer` (build script) | **Route Handler prerendered static** (`app/[locale]/cv/route.ts` + `renderToBuffer`, `dynamic = 'force-static'`) | Keeps everything in the Next pipeline (Next compiles TS/JSX; no `tsx`), and Next prerenders static GET route handlers at build → effectively build-time. **Risk:** react-pdf (fontkit/pdfkit native-ish deps) inside Turbopack server bundling has a history of ESM/bundler friction. Viable **fallback**; verify Turbopack build first. |
| `@react-pdf/renderer` | **Playwright/Puppeteer print of a hidden `/cv` print-CSS route** (`@sparticuz/chromium` 149 / `puppeteer` 25) | Reproduces *web layout* — but D-E mandates the PDF has its OWN clean document layout, NOT the printed web page, so this fidelity is unwanted. Also ~50MB+ chromium in CI, slow, flaky, needs a running server at build. **Rejected** unless pixel-fidelity to web ever becomes the goal. |
| `@react-pdf/renderer` | **pdfkit** (0.19.1) | Lower-level imperative layout; no React composition; far more manual code for the same one-column result. No benefit here. |
| build-time static file | **On-demand route handler at request time** | CTX-05 explicitly prefers build-time. On-demand adds a runtime server hop; only materially simpler if react-pdf can't be run in the build script (it can). Keep build-time. |

**Installation:**
```bash
pnpm add -D @react-pdf/renderer geist tsx
```
(`@react-pdf/renderer` and `geist` are only needed at build; keeping them in devDependencies keeps them out of the client/runtime graph — reinforces DSGVO + bundle discipline. `geist` is ALSO consumed by `opengraph-image.tsx` at build, which runs in the Next build — still build-only.)

## Package Legitimacy Audit

| Package | Registry | Age | Source Repo | Verdict | Disposition |
|---------|----------|-----|-------------|---------|-------------|
| @react-pdf/renderer | npm | created 2018-08-04 (v4.5.1, mod 2026-04-15) | github.com/diegomura/react-pdf | OK | Approved — de-facto React PDF library, millions of weekly downloads, official docs react-pdf.org |
| geist | npm | v1.7.2 (7.9MB unpacked, ships ttf/otf/woff2) | Vercel (github.com/vercel/geist-font) | OK | Approved — first-party Vercel font package |
| tsx | npm | v4.23.0 | github.com/privatenumber/tsx (esbuild-kit) | OK | Approved — standard TS/ESM/JSX Node runner |

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** none.

> Note: the `gsd-tools query package-legitimacy` seam was not invoked (standalone research run). Verdicts are from npm-registry verification (`npm view`) + authoritative source confirmation (react-pdf.org official docs; Vercel-owned `geist`; esbuild-kit `tsx`). No `postinstall` network scripts observed for these packages.

---

## §1. CV-PDF build-time generation (CONT-08 / CTX-05) — THE flagged unknown

**Recommendation:** `@react-pdf/renderer` v4.5.1, rendered by a standalone `tsx` build script chained into the existing `prebuild`, writing one PDF per locale into `public/`.

### Why this over the alternatives
- Produces **real selectable text** (not a rasterized image) — react-pdf lays out actual text runs. `[CITED: react-pdf.org/fonts]`
- **Embeds + subsets fonts** automatically; supports **TTF/OTF only** — which is exactly what the `geist` package ships. `[CITED: react-pdf.org/fonts]`
- The CV needs its OWN one-column document layout (D-E), NOT the web page — react-pdf's component model expresses that directly, whereas headless-print reproduces the web layout (wrong for D-E).
- Runs as **plain Node at build** → no Turbopack/bundler interaction, no runtime server, no third-party network call at request time (DSGVO).

### Content source (single source of truth — CTX-05)
The one-column ATS CV needs only structured content, all of which are **plain importable TS modules** (no dependency on the content-collections build output):
- `content/{de,en}/career.ts` (`career`, `careerIntro`) — timeline + D-02 role arc
- `content/{de,en}/projects.ts` — selected projects (filter/sort by `order`, take flagship/deep)
- `content/{de,en}/skills.ts` — domain-grouped skills (no levels)
- `content/{de,en}/contact.ts` — name, role, email, github, linkedin **only** (schema has no phone/address — data minimization already enforced)

The script can import these directly (same modules `src/lib/content.ts` uses). It does not need `next-intl` message JSON — static CV labels ("Lebenslauf", "Skills", "Stand:") can be a small inline `{de,en}` label map in the script.

### Font embedding (Geist Sans, subset)
```ts
import { Font } from "@react-pdf/renderer";
import { join } from "node:path";

const geistDir = join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans");
Font.register({
  family: "Geist",
  fonts: [
    { src: join(geistDir, "Geist-Regular.ttf"),  fontWeight: 400 },
    { src: join(geistDir, "Geist-Medium.ttf"),   fontWeight: 500 },
    { src: join(geistDir, "Geist-SemiBold.ttf"), fontWeight: 600 },
  ],
});
```
Verified on disk: `node_modules/geist/dist/fonts/geist-sans/Geist-{Regular,Medium,SemiBold}.ttf` exist `[VERIFIED: npm pack geist --dry-run, 2026-07-05]`. Use **local file `src` paths, not URLs** — this sidesteps the known react-pdf async-font race where `renderToBuffer` runs before a URL-fetched font finishes loading `[CITED: github.com/diegomura/react-pdf#2675]`.

### Render + write to disk
```ts
// scripts/generate-cv.tsx  (run with: tsx scripts/generate-cv.tsx)
import { renderToFile } from "@react-pdf/renderer";
import { CvDocument } from "./cv/CvDocument";           // react-pdf <Document>
import { mkdir } from "node:fs/promises";

for (const locale of ["de", "en"] as const) {
  await mkdir("public", { recursive: true });
  await renderToFile(
    <CvDocument locale={locale} generatedAt={new Date()} />,
    `public/Lasse-Siemoneit-CV-${locale}.pdf`,
  );
}
```
`renderToFile(element, filePath)` (Node-only) writes the PDF to disk and returns the stream. `renderToBuffer(element)` is the in-memory variant for a route handler. `[CITED: react-pdf.org — Node rendering API]`

### Wiring into the build pipeline
`public/` assets are copied into the Next build output, so the PDFs only need to **exist before `next build`**. Chain the generator into the existing prebuild:
```jsonc
// package.json scripts
"prebuild": "pnpm check:content && pnpm generate:cv",
"generate:cv": "tsx scripts/generate-cv.tsx"
```
The existing `prebuild` already runs `pnpm check:content` (`node scripts/check-content-parity.ts`). Node on this environment is v26 (strips TS types), but JSX is NOT stripped by Node — hence `tsx` for the CV script. `[VERIFIED: node --version = v26.4.0; scripts/check-content-parity.ts is dependency-free built-ins]`

### Linking from the overview
Static assets in `public/` serve at the site root. In the contact block, link the current locale's file:
```tsx
<a href={`/Lasse-Siemoneit-CV-${locale}.pdf`} download
   aria-label={t("cv.ariaLabel")}>{t("cv.label")}</a>
```
`download` triggers a save; the filename already encodes locale. This is a plain same-origin static link — no runtime generation, DSGVO-clean.

### Accessibility of the PDF (D-E, ATS)
- react-pdf output is **real, selectable, copyable text** in logical reading order → ATS-parseable and the D-E "not an image" requirement is met. `[CITED: react-pdf.org/fonts]`
- **Limitation:** react-pdf does not emit a full PDF/UA tagged structure tree (headings/landmarks tags). For ATS friendliness this is not required (ATS parses the text layer + reading order, which react-pdf provides). Set the document `title`/`author` via `<Document title author>` props for basic metadata. If full PDF/UA tagging ever becomes a requirement, that is a separate effort (flag, not a Phase 2 blocker).

### Pitfalls
- **JSX in the build script** needs `tsx` (or author with `React.createElement` to stay in plain `.ts`). Recommend `tsx`.
- **Font race** — use local `src` paths only (above).
- **`public/` write ordering** — must be `prebuild`, before `next build`, so the file is present when Next collects `public/`.
- **Do NOT** import `@react-pdf/renderer` anywhere under `src/app/**` client paths — keep it script-only so it never enters the client bundle.
- **Two locales, one script** — loop; keep the `<CvDocument>` layout locale-agnostic and pass content in, so both PDFs share one layout (DRY, matches single-source-of-truth intent).

**Confidence:** MEDIUM-HIGH. Library APIs (`Font.register`, `renderToFile`, TTF-only, selectable text) are verified against official docs + npm; the exact `prebuild` wiring is a recommended pattern (standard, but not copied verbatim from a single Next-16-specific source). The Route-Handler fallback is the hedge if the script approach hits any snag.

---

## §2. GitHub contribution heatmap (TECH-08 / CTX-04)

**Recommendation:** Server Component (or `lib/` server function) does a build-time `fetch` to `https://api.github.com/graphql` with a `read:user` PAT, cached via `next.revalidate: 86400`. No client call ever.

### The GraphQL query
```graphql
query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            weekday
          }
        }
      }
    }
  }
}
```
`contributionCalendar.weeks[].contributionDays[]` gives `{ date, contributionCount, weekday }`; `totalContributions` is the accessible summary total. `[CITED: docs.github.com/en/graphql/reference/users#object-contributioncalendar]` The calendar spans the last ~12 months by default (no date args needed for the default window).

### Token scopes (read-only)
- **Classic PAT:** `read:user` is the minimal scope for the contribution calendar. `[CITED: multiple — heilcheng.github.io GitHub-contribution-graph-guide; medium/@yuichkun]`
- **Fine-grained PAT:** read-only access to the user's profile metadata. Public-only contributions need no special scope for public repos; `read:user` also pulls private/internal contribution *counts* (not repo contents).
- Store as a **Vercel Environment Variable** (server-only, unprefixed — NOT `NEXT_PUBLIC_*`). Name suggestion: `GITHUB_TOKEN` or `GITHUB_READONLY_PAT`.

### Build-time fetch + ISR (project is on the "previous" caching model)
`next.config.ts` does **not** set `cacheComponents: true`, so use the previous model: `fetch` with `next.revalidate`. `[VERIFIED: node_modules/next/dist/docs/.../caching-without-cache-components.md]`
```ts
// src/lib/github.ts  (server-only)
import "server-only";

export async function getContributionCalendar(login: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;                     // graceful fallback (no token in preview)
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
      next: { revalidate: 86400, tags: ["github-contributions"] }, // daily ISR
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.user?.contributionsCollection?.contributionCalendar ?? null;
  } catch {
    return null;                                // never throw into the page
  }
}
```
Because this `fetch` sets a positive `revalidate` and no request-time API precedes it, the page stays statically prerendered and re-generates at most daily — the shipped HTML embeds baked data; the browser never contacts GitHub. `[VERIFIED: caching-without-cache-components.md — "Time-based revalidation" + route stays static]`

`login` = `lsiem` — read it from `content/{de,en}/contact.ts` `github` URL rather than hardcoding.

### Rendering (per UI-SPEC)
- Week × day grid of `~11px` `rounded-[2px]` cells, `gap-1`.
- **Monochrome `--foreground` opacity ramp**, NOT accent: empty → `--border`; then `foreground/20 → /40 → /70 → foreground` (4–5 buckets by `contributionCount`). Compute bucket thresholds from the max daily count (or fixed thresholds 1/3/6/9).
- Accessibility: grid `role`/`aria-label` = "GitHub contributions, last 12 months" (localized), a visually-hidden total (`totalContributions`), optional per-cell `title` = date + count. The grid must convey meaning without hover.
- **Empty/error state:** if `getContributionCalendar` returns `null`, render the static fallback line ("GitHub-Aktivität derzeit nicht verfügbar." / "GitHub activity is currently unavailable.") — never a broken grid, never a runtime retry.

### Pitfalls
- **PAT missing on preview builds** — the `if (!token) return null` path means preview URLs degrade gracefully to the fallback line; only production (with the env var) shows the grid. Document this so the empty grid on preview isn't mistaken for a bug.
- **Do not** put the token in a `NEXT_PUBLIC_*` var (would leak into the client bundle).
- **Rate limit** is a non-issue at build cadence (one call per build/revalidation).
- GitHub's default calendar window is a rolling year — no `from`/`to` needed; if a fixed 12-month window is wanted, pass `from`/`to` ISO datetimes to `contributionsCollection(from:, to:)`.

**Confidence:** HIGH for query shape, scope, and the caching mechanism (official GitHub docs + verified bundled Next docs).

---

## §3. Dark mode 3-state toggle (TECH-04 / D-B) — Tailwind 4 + Next 16

**Recommendation:** Attribute-driven tokens in `globals.css`, a Tailwind 4 `@custom-variant dark` that honors both `data-theme` and the system media query, a blocking inline no-flash script, and a small client toggle control.

### Token strategy in `globals.css` (extend the existing file)
Keep `:root { … }` light tokens and the existing `@media (prefers-color-scheme: dark) { :root { … } }` (this remains the **System** behavior). Add explicit attribute overrides that win over the media query:
```css
:root[data-theme="light"] { /* light tokens (same as :root) */ }
:root[data-theme="dark"]  { /* dark tokens */ }
```
Precedence: attribute selector `:root[data-theme=...]` has higher specificity than the media-query `:root`, so an explicit choice always overrides system. When `data-theme` is unset, the media query governs (= System). `[CITED: tailwindcss.com/docs/dark-mode]`

### Tailwind 4 `@custom-variant` (verified current syntax)
Register the `dark:` variant so utilities can target both the attribute and the system fallback:
```css
@custom-variant dark {
  &:where([data-theme="dark"], [data-theme="dark"] *) { @slot; }
  @media (prefers-color-scheme: dark) {
    &:where(:not([data-theme] *)) { @slot; }
  }
}
```
`:where(...)` keeps specificity at zero so it doesn't fight other utilities. The `@media` arm makes `dark:` utilities apply under System (no attribute) too. `[CITED: tailwindcss.com/docs/dark-mode; schoen.world/n/tailwind-dark-mode-custom-variant — cross-checked]`

> Simpler variant if only token CSS vars flip (no `dark:` utilities needed): since the design is token-driven, most components read `--foreground`/`--background` and need **no `dark:` classes at all** — the token overrides above already do the work. Register the `@custom-variant` only if `dark:`-prefixed utilities are actually used. Recommend the token-only approach first (least code, matches the CSS-first system); add the `@custom-variant` only where a utility genuinely needs it.

### No-flash blocking inline script (Next App Router)
Runs before paint, no external calls (DSGVO-safe). Place as the **first child of `<body>`** in `[locale]/layout.tsx` (parsed before body content paints), using `dangerouslySetInnerHTML` so it is a raw inline `<script>`, NOT a hydrated component:
```tsx
<body …>
  <script
    dangerouslySetInnerHTML={{
      __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}})();`,
    }}
  />
  …
</body>
```
- Reads `localStorage` key `theme` ∈ `{light,dark}` (System/unset → leave `data-theme` unset so the media query governs).
- No React state, so it runs synchronously before hydration → no FOUC, no hydration mismatch (it only mutates `documentElement.dataset`, which React does not own).
- This mirrors the proven `next-themes` inline-script approach without adding the dependency (project decision: no extra libs where a few lines suffice).

### Toggle control (Client Component, header cluster)
- `"use client"`. Three-state segmented control or cycling button: System / Light / Dark.
- On select: write `localStorage.setItem('theme', value)` (or `removeItem` for System), then set/clear `document.documentElement.dataset.theme`. For System, read `window.matchMedia('(prefers-color-scheme: dark)')` only to update the `theme-color` meta (tokens already follow the media query via CSS).
- Read initial state from `localStorage` in a mount effect (guard against SSR — render a neutral state first to avoid mismatch, or use `useSyncExternalStore` for the stored value).
- Styling per UI-SPEC: `border border-border`, mono `text-xs`, active segment `text-foreground` (inactive `text-muted`), hover `border-foreground/40`. **Accent NOT used.** Keyboard-operable, `aria-label` "Darstellung"/"Theme", `aria-pressed`/`aria-checked` per option.

### `<meta name="theme-color">` per active theme
- For **System**, declare media-scoped colors via Next viewport export:
```ts
export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)",  color: "#0a0a0a" },
  ],
};
```
- For an explicit **toggle** override, the media-query meta won't track it — the client toggle must also update `<meta name="theme-color">` `content` via JS on change. Note this as a small enhancement; the media version covers the System case correctly. `[VERIFIED: Next generate-viewport supports themeColor media array]`

### Pitfalls
- **Hydration mismatch** if the toggle renders a stored-value-dependent UI on the server. Fix: render a stable default and reconcile in `useEffect`, or gate the active-segment highlight to post-mount.
- **Don't** animate the theme swap in Phase 2 (baseline restraint); a `transition-colors` on tokens is fine but keep it subtle.
- Contrast: re-verify muted-on-background AA in BOTH resolved themes (UI-SPEC already computed ≈4.9:1 light / ≈6.9:1 dark — passes).

**Confidence:** MEDIUM-HIGH. Tailwind 4 `@custom-variant` syntax cross-checked against the official dark-mode doc + a corroborating current write-up; the inline-script + attribute-override pattern is the industry-standard no-flash approach.

---

## §4. OG images + Person JSON-LD (TECH-05)

### OG images — `next/og` `ImageResponse`, statically optimized at build
Use the **file convention** `opengraph-image.tsx` per route segment. Generated images are **statically optimized (built at build time and cached) unless they use request-time APIs or uncached data** — so a content-driven card with no request-time API is baked at build → no runtime third-party fetch. `[VERIFIED: node_modules/next/dist/docs/.../opengraph-image.md]`

Place per locale-scoped route:
- `src/app/[locale]/opengraph-image.tsx` — the site/overview card (name, role, mono eyebrow, accent hairline, locale indicator)
- Optionally `src/app/[locale]/case-studies/[slug]/opengraph-image.tsx` — per-case-study card (receives `params` — **note Next 16 change: `params` is now a Promise**, `await params`). `[VERIFIED: opengraph-image.md Version History v16.0.0]`

Load self-hosted Geist ttf from disk (NOT `next/font/google`, which gives runtime handles, not raw bytes):
```tsx
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Lasse Siemoneit — Portfolio";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const geistSemiBold = await readFile(
    join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf"),
  );
  const geistMono = await readFile(
    join(process.cwd(), "node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf"),
  );
  return new ImageResponse(
    (/* flexbox-only JSX card: --background field, mono eyebrow, name (SemiBold), role (muted), accent hairline */),
    { ...size, fonts: [
      { name: "Geist", data: geistSemiBold, weight: 600, style: "normal" },
      { name: "GeistMono", data: geistMono, weight: 400, style: "normal" },
    ] },
  );
}
```
Constraints to respect: **flexbox + a subset of CSS only** (no `display: grid`); **TTF/OTF preferred**; **≤500KB total bundle** including fonts. `[VERIFIED: image-response.md]` `process.cwd()` is the Next project dir. `[VERIFIED: image-response.md custom-fonts example]`

Wire the meta: the file convention auto-emits `og:image` / `twitter:image` tags — no manual `generateMetadata` change needed for the image URLs themselves. Still extend `generateMetadata` for `openGraph`/`twitter` textual fields (title, description, `type: "profile"`, `locale`).

### `src/lib/seo.ts` extensions
- Add an `openGraph` + `twitter` block to the metadata returned by `page.tsx`'s `generateMetadata` (title, description, `url`, `siteName`, `locale`, `type`). `metadataBase` (already `siteMetadataBase`) resolves relative OG URLs to absolute — and flips to `https://lsiem.de` via the existing one-line change (CTX-06). `[VERIFIED: src/lib/seo.ts on disk]`
- Keep `localeAlternates()` (hreflang) as-is — already correct (self + `x-default` → de).

### Person JSON-LD (server-rendered)
Emit in the overview page (Server Component) — plain `<script type="application/ld+json">` with `dangerouslySetInnerHTML` of `JSON.stringify(...)`:
```tsx
const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: contact.name,
  jobTitle: contact.role,            // localized via getContact(locale)
  url: `${siteMetadataBase.origin}/${locale}`,
  email: `mailto:${contact.email}`,  // already public in the contact block
  sameAs: [contact.github, contact.linkedin],
};
// <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
```
`inLanguage` per locale can be added; `sameAs` = [GitHub, LinkedIn] from `content/{de,en}/contact.ts`. Server-rendered → present in initial HTML, crawlable. This is trusted first-party data (no user input) so `dangerouslySetInnerHTML` is safe here; still, `JSON.stringify` output should be escaped for `<` if any field could contain it (none do — controlled content).

**Confidence:** HIGH (verified against bundled Next 16 `image-response.md` + `opengraph-image.md`, including the v16 `params`-is-Promise change and static-optimization behavior).

---

## §5. CWV (TECH-01) + a11y (TECH-03) — phase-specific

- **Keep generators off the client bundle.** `@react-pdf/renderer` is script-only (devDep, never imported under `src/app`). `next/og` OG routes and the GitHub `fetch` are server/build-only. The only NEW client JS is the theme toggle (tiny) + the inline no-flash script (~150 bytes). Net client-bundle delta ≈ negligible → protects the 150KB landing budget from web/performance.md.
- **First viewport stays static SSR HTML** (hero already is) — LCP element is the `<h1>` name, not JS-injected. No preloader (Pitfall 3). No motion gate on hero (CONT-02/MODE-01).
- **CLS:** the GitHub grid and (future) photo must reserve space. Photo: `next/image` with explicit `width`/`height` (CTX-03 deferred, but document the pattern). Heatmap grid: fixed cell sizing so no reflow when data loads (it's baked at build, so no client shift anyway).
- **INP:** theme toggle handler is trivial; no scroll listeners in Phase 2 (motion deferred). Keep `transition-colors` only, ~150ms, compositor-friendly (color changes are cheap).
- **Reduced motion:** wrap `html { scroll-behavior: smooth }` in `@media (prefers-reduced-motion: no-preference)` (currently unconditional in `globals.css` line 31–33 — fix this). Baseline is otherwise static, so reduced-motion parity is trivially met.
- **Keyboard/focus (TECH-03):** every interactive element gets a visible `:focus-visible` ring (2px `--accent`, offset 2px; `--foreground` where accent clashes — e.g. on the accent CV button use foreground/offset). Theme toggle, locale switcher, CV link, anchor-nav, all links reachable in DOM order.
- **External links:** `target="_blank"` must carry `rel="noopener noreferrer"` (already present in `page.tsx`). Keep.
- **CI budget (Pitfall 3 / TECH-07):** `@lhci/cli` 0.15.1 is already a devDependency — ensure the LHCI budget (LCP<2.5s, INP<200ms mobile throttled) runs against a Vercel preview URL before cutover (CTX-06).

**Confidence:** HIGH — these are direct applications of the already-verified stack + the project's own web performance/testing rules.

## Architecture Patterns

### System data flow (build-time)
```
content/{de,en}/*.ts  (single source of truth: career, projects, skills, contact)
        │
        ├────────────────────────────► src/lib/content.ts ──► [locale]/page.tsx (RSC, SSG)
        │                                                          │  ├─ hero/career/projects/skills/about/contact (static HTML)
        │                                                          │  ├─ <script type=ld+json> Person  (TECH-05)
        │                                                          │  └─ GitHubHeatmap (RSC) ◄── lib/github.ts fetch (revalidate 86400, PAT) ◄── GitHub GraphQL  [BUILD/ISR ONLY]
        │
        ├──► scripts/generate-cv.tsx (tsx, prebuild) ──► @react-pdf/renderer + geist ttf ──► public/Lasse-Siemoneit-CV-{de,en}.pdf ──► linked from contact block
        │
        └──► [locale]/opengraph-image.tsx (next/og, static-optimized) ──► geist ttf ──► /[locale]/opengraph-image PNG ──► og:image meta

globals.css: :root tokens + @media(system) + :root[data-theme=light|dark] overrides + @custom-variant dark
[locale]/layout.tsx: inline no-flash <script> (reads localStorage 'theme' → data-theme)  +  <ThemeToggle> (client)  +  viewport.themeColor
                                                            Deployed as static output on Vercel → CDN
```

### Recommended new files
```
src/
├── components/
│   ├── theme-toggle.tsx        # "use client" 3-state control (System/Light/Dark)
│   ├── github-heatmap.tsx      # RSC grid renderer (monochrome ramp, a11y, fallback)
│   └── header-controls.tsx     # optional: cluster (Contact | ThemeToggle | LocaleSwitcher)
├── lib/
│   └── github.ts               # "server-only" getContributionCalendar(login) — build-time fetch
scripts/
├── generate-cv.tsx             # tsx entry: loops locales, renderToFile → public/
└── cv/
    ├── CvDocument.tsx          # react-pdf <Document> (one-column, D-E)
    └── labels.ts               # {de,en} static CV labels
src/app/[locale]/
├── opengraph-image.tsx         # next/og overview card
└── case-studies/[slug]/opengraph-image.tsx   # (optional) per-case-study card
```

### Anti-patterns to avoid
- **Client-side GitHub fetch** — violates DSGVO hard constraint. Build/ISR only.
- **`@react-pdf/renderer` imported into the app/client graph** — keep it script-only (devDep).
- **`next/font/google` handles fed to `ImageResponse`/`Font.register`** — they need raw ttf bytes; use the `geist` package files.
- **Accent color on heatmap cells / theme toggle / external links** — UI-SPEC forbids; accent stays ~10%.
- **Theme toggle as a hydrated component that gates first paint** — use the inline script for pre-paint, the component only for interaction.
- **Hardcoding `lsiem` / contact facts** — read from `content/{de,en}/contact.ts`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF text layout + font embedding/subsetting | Manual pdfkit drawing / HTML-to-PDF pipeline | `@react-pdf/renderer` | Handles text runs, wrapping, page breaks, font subsetting, selectable text |
| OG PNG rasterization | Canvas/sharp compositing | `next/og` `ImageResponse` | Built into Next 16, static-optimized, satori-based JSX→PNG |
| Raw Geist font files | Extracting from `next/font` cache / Google Fonts URLs | `geist` npm package ttf | First-party, on-disk ttf, one source for OG + PDF |
| No-flash theme + system detection | Full `next-themes` dependency | ~10-line inline script + CSS `@custom-variant` | A few lines suffice; project avoids extra libs; matches CSS-first token system |
| Contribution calendar aggregation | Scraping the GitHub profile HTML | GitHub GraphQL `contributionCalendar` | Official, structured, one authenticated call |
| ISR/build caching of the fetch | Manual file cache / cron | `fetch` `next.revalidate` | Next's native previous-model time revalidation |

## Common Pitfalls

### Pitfall 1: react-pdf async font race
**What goes wrong:** `Font.register` with a URL `src` starts an async download; `renderToFile`/`renderToBuffer` may run before it finishes → blank/fallback glyphs. **Avoid:** register with **local file paths** (the `geist` package files) — synchronous enough in Node that the race doesn't occur. `[CITED: github.com/diegomura/react-pdf#2675, #2223]`

### Pitfall 2: OG image uses unsupported CSS
**What goes wrong:** `display: grid` or advanced CSS silently fails in satori. **Avoid:** flexbox + absolute positioning only; keep total assets (fonts + JSX) ≤500KB. `[VERIFIED: image-response.md]`

### Pitfall 3: Theme flash / hydration mismatch
**What goes wrong:** reading `localStorage` in a component on first render → server/client HTML differ, or a flash of the wrong theme. **Avoid:** inline pre-paint script sets `data-theme` before React; the toggle reconciles state in `useEffect` after mount.

### Pitfall 4: PAT leaks or missing on preview
**What goes wrong:** `NEXT_PUBLIC_` prefix leaks the token into the client bundle; or preview builds have no token and the grid looks "broken." **Avoid:** unprefixed env var (`GITHUB_TOKEN`); `if(!token) return null` → graceful fallback line on token-less builds. Document that the grid only appears on production builds with the env set.

### Pitfall 5: CV PDF not present at build
**What goes wrong:** generating in `postbuild` (after `next build`) means the static asset misses the build output. **Avoid:** generate in `prebuild` (before `next build`) so `public/` already holds the files when Next collects them.

### Pitfall 6: scroll-behavior ignores reduced-motion
**What goes wrong:** `globals.css` sets `html { scroll-behavior: smooth }` unconditionally (line 31–33). **Avoid:** wrap in `@media (prefers-reduced-motion: no-preference)` (TECH-03).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | build + CV script | ✓ | v26.4.0 (local) / Vercel default ≥20 | — |
| pnpm | package manager | ✓ | 11.1.2 (pinned) | — |
| next / next/og | OG + build | ✓ | 16.2.10 (on disk) | — |
| geist ttf files | OG + CV fonts | ✗ (not yet installed) | 1.7.2 (verified on npm) | none needed — `pnpm add -D geist` |
| @react-pdf/renderer | CV generation | ✗ (not yet installed) | 4.5.1 | Route-Handler variant (still react-pdf) |
| tsx | run CV script | ✗ (not yet installed) | 4.23.0 | author script with `React.createElement` (no JSX) → run with `node` |
| GitHub read-only PAT | heatmap fetch | ✗ (owner action) | — | grid degrades to static fallback line until PAT set |

**Missing dependencies with no fallback:** none blocking — all are `pnpm add -D` installs or an owner env-var action.
**Missing dependencies with fallback:** GitHub PAT (heatmap degrades gracefully); tsx (createElement fallback).

**Owner actions before/at execution:**
1. Create a GitHub **read-only PAT** (`read:user` scope) for `lsiem` and add it to the Vercel project env (e.g. `GITHUB_TOKEN`), plus `.env.local` for local builds. (CTX-04)
2. (Deferred, non-blocking) supply the profile photo asset (CONT-06 / CTX-03).
3. At cutover: flip `siteMetadataBase` to `https://lsiem.de` and promote to production only when verification passes (CTX-06).

## State of the Art / Next 16 gotchas

| Old Approach (training data) | Current (Next 16.2 verified) | Impact |
|------------------------------|------------------------------|--------|
| `opengraph-image` `params` is a plain object | **`params` is a `Promise`** (`await params`) | v16.0.0 change — verified in `opengraph-image.md` Version History |
| `ImageResponse` from `next/server` | `import { ImageResponse } from "next/og"` | since v14; `next/server` import removed path |
| `export const revalidate` always available | Two models now: default (previous model, what THIS project uses) vs `cacheComponents: true` (`use cache`/`cacheLife`) | Project has NO `cacheComponents` → use `fetch` `next.revalidate` + segment `revalidate` |
| Tailwind `darkMode: 'class'` in JS config | Tailwind 4 CSS-first: `@custom-variant dark (…)` in CSS | No `tailwind.config.js` darkMode key; it's a CSS directive |

**Deprecated/avoid:** `next/font/google` handles as font *bytes* (they're not); Google Fonts WOFF2 URLs for react-pdf (WOFF2 poorly supported — use ttf); `display:grid` in `ImageResponse`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `renderToFile(element, path)` exists in `@react-pdf/renderer` v4 Node API | §1 | LOW — well-documented; fallback `renderToBuffer` + `fs.writeFile` is equivalent |
| A2 | Running react-pdf in a plain `tsx` Node script (outside Next bundler) avoids ESM/bundler friction | §1 | LOW-MED — the whole reason to prefer the script over the route handler; if wrong, use the route-handler fallback |
| A3 | The one-column CV needs only structured TS content (career/projects/skills/contact), not compiled MDX case-study bodies | §1 | LOW — D-E is a concise CV; if deep case-study prose is wanted, the raw `content` field is available from content-collections |
| A4 | Vercel build runs the `prebuild` script (npm lifecycle) and `public/` files written there land in the output | §1 | LOW — standard npm/Next behavior; verify in first preview build |
| A5 | `read:user` classic-PAT scope is sufficient for the public contribution calendar of `lsiem` | §2 | LOW — GitHub docs + multiple guides; public contributions may need no private scope at all |
| A6 | Tailwind 4 `@custom-variant dark { … @slot … }` block form is accepted by the installed v4.x | §3 | LOW-MED — cross-checked to official doc; confirm against installed tailwind version at implementation |
| A7 | Placing the inline theme script as first child of `<body>` runs before paint with no hydration mismatch | §3 | LOW — the next-themes-proven pattern; it only mutates `documentElement.dataset` |

**Note:** package names (`@react-pdf/renderer`, `geist`, `tsx`) were verified against the npm registry AND authoritative sources (react-pdf.org, Vercel, esbuild-kit) — treated as verified, not `[ASSUMED]`. The build-pipeline wiring and the Tailwind block-form variant are the items most worth confirming at implementation time.

## Open Questions (RESOLVED)

1. **CV depth of content** — Does the one-column CV include short project blurbs + full career arc only, or also condensed case-study outcomes?
   - What we know: D-E = one-column ATS; all structured content is available.
   - Recommendation: career arc + domain skills + 3–5 project one-liners + contact; keep to ~1–2 pages.
   - **RESOLVED → Plan 02-02 Task 2:** name/role/value-prop + career arc + 3–5 project one-liners + domain skills (no levels) + email/GitHub/LinkedIn, ~1–2 pages.

2. **Per-case-study OG cards** — required now or overview-card only?
   - What we know: TECH-05 says "per page + per locale"; case-study routes exist.
   - Recommendation: ship the overview card for all routes first (inherited), add per-case-study cards if budget allows.
   - **RESOLVED → Plan 02-04 Task 3:** ships the overview `opengraph-image.tsx` plus the sibling per-case-study card.

3. **Toggle UI shape** — segmented 3-button vs cycling single button?
   - Recommendation: segmented (System/Light/Dark) — clearer `aria-checked` semantics.
   - **RESOLVED → Plan 02-03:** segmented 3-state System/Light/Dark control.

## Sources

### Primary (HIGH confidence — verified this session)
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/image-response.md` — `ImageResponse` API, custom fonts, ≤500KB, ttf/otf, flexbox-only
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md` — file convention, static optimization, v16 `params` Promise, local-asset/font loading
- `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md` — `fetch` `next.revalidate`, route segment `revalidate`, `unstable_cache` (project is on the previous model)
- `node_modules/next/dist/docs/01-app/01-getting-started/09-revalidating.md` — `cacheLife`/`revalidateTag` (Cache Components model — NOT used here)
- `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` — `generateMetadata` server-only, fetch memoization
- npm registry (`npm view` / `npm pack --dry-run`, 2026-07-05): `@react-pdf/renderer@4.5.1` (react ^19 peer), `geist@1.7.2` (ships `Geist-{Regular,Medium,SemiBold}.ttf`, `GeistMono-Regular.ttf`), `tsx@4.23.0`
- Codebase on disk: `content/shared/types.ts`, `src/lib/content.ts`, `src/lib/seo.ts`, `src/app/[locale]/{layout,page}.tsx`, `src/app/globals.css`, `content-collections.ts`, `src/i18n/{routing,navigation}.ts`, `package.json`, `next.config.ts`
- [docs.github.com/en/graphql/reference/users — contributionCalendar object](https://docs.github.com/en/graphql/reference/users#object-contributioncalendar)
- [tailwindcss.com/docs/dark-mode](https://tailwindcss.com/docs/dark-mode) — `@custom-variant` data-attribute + system fallback
- [react-pdf.org/fonts](https://react-pdf.org/fonts) — `Font.register`, ttf/woff only, selectable text

### Secondary (MEDIUM confidence — cross-checked web)
- [schoen.world — Tailwind v4 dark mode custom variant](https://schoen.world/n/tailwind-dark-mode-custom-variant) — `@custom-variant` block form with system fallback
- [heilcheng.github.io — GitHub contribution graph guide](https://heilcheng.github.io/blog/github-contribution-graph-guide/) + [medium/@yuichkun](https://medium.com/@yuichkun/how-to-retrieve-contribution-graph-data-from-the-github-api-dc3a151b4af) — PAT `read:user` scope, query shape
- [github.com/diegomura/react-pdf#2675, #2223](https://github.com/diegomura/react-pdf/issues/2675) — async font-load race with `Font.register`

### Project references
- `.planning/research/{STACK,ARCHITECTURE,PITFALLS}.md`, `.planning/phases/02-recruiter-overview-live/{02-CONTEXT,02-UI-SPEC}.md`, `.planning/REQUIREMENTS.md`
- `~/.claude/rules/ecc/web/{performance,testing,security}.md` (CWV budgets, self-hosted fonts, CSP), `AGENTS.md` (DSGVO zero-runtime-third-party, self-hosted fonts)

## Metadata

**Confidence breakdown:**
- OG images + JSON-LD + metadata: HIGH — verified against bundled Next 16 docs incl. v16 changes
- GitHub heatmap (query + scope + ISR): HIGH — official GitHub + verified Next caching docs
- Dark mode (Tailwind 4 + no-flash): MEDIUM-HIGH — official dark-mode doc + corroborating source; confirm block-form variant against installed version
- CV-PDF (the flagged unknown): MEDIUM-HIGH — library APIs verified; build wiring is a recommended pattern with a documented fallback
- CWV/a11y: HIGH — direct application of verified stack + project rules

**Research date:** 2026-07-05
**Valid until:** ~2026-08-05 (Next 16.x and Tailwind 4.x are moving; re-verify `@custom-variant` syntax and the v16 caching model at implementation if the minor versions advance)
