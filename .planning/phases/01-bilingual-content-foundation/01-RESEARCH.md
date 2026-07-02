# Phase 1: Bilingual Content Foundation - Research

**Researched:** 2026-07-02
**Domain:** Next.js 16 bilingual SSG foundation + typed Git-based content model (MDX + TS) + CI performance budget + cookieless analytics
**Confidence:** HIGH (all load-bearing claims verified against npm registry, official docs, or library source this session)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Case-Study-Auswahl & Gewichtung
- **D-01:** Drei Projekt-Schwerpunkte in dieser Gewichtung: **ELIA (Flaggschiff, tiefste Case Study) → Vidama (Mediathek-Entwicklung, tiefe Case Study) → OpenShift-Plattformarbeit (kürzere Projekt-Karte, kein volles Problem→Tradeoff-Format)**. Das aktualisiert REQUIREMENTS.md CONT-04, wo noch Vidama als Flaggschiff genannt ist — ELIA ist jetzt Flaggschiff.
- **D-02:** ELIA-Case-Study aus **Product-Owner-Perspektive** erzählen (Problem → Architektur-Entscheidungen → Tradeoffs → Stand), mit dem OpenShift/Engineering-Hintergrund als Einstieg. Karriere-Bogen bei ITSC: Systemadministrator (OpenShift) → Software Engineering → seit ~April 2026 Product Owner ELIA. Dieser Bogen gehört auch in die Werdegang-Timeline (Phase-2-Inhalt, aber Content entsteht jetzt).
- **D-03 (Vertraulichkeit):** ELIA-Inhalte **abstrahiert** schreiben: Architektur-Patterns und Rolle konkret (Multi-Agenten-Architektur, MCP-basiertes Tool-Calling statt klassischem RAG, Orchestrator-Migration auf ein aktuelles Agent-Framework, EU-Datenresidenz/DSGVO, Teams-Integration) — aber interne Systemnamen, Roadmap-Daten und konkrete Modellnamen verallgemeinern (Kategorie-Begriffe wie „ITSM-System"/„Wiki" statt Produktnamen). Die konkreten Namen stehen NUR im lokalen Referenz-PDF (nicht committet). **Dieses Repo ist öffentlich — interne Details dürfen weder in Content noch in Planungsdokumente.**

#### Content-Erstellung & Übersetzung
- **D-04:** Altes deutsches Material aus `src/content/` (personal, projects, experience, skills, about, ui) als Beispiel/Rohmaterial nehmen und verfeinern — nicht komplett neu schreiben. Vor dem Löschen des alten Codes (D-07) extrahieren.
- **D-05:** Claude schreibt die englische Fassung aller Inhalte (Übersetzung/Adaption aus dem Deutschen).

#### Content-Modell-Format
- **D-06:** **Hybrid-Format:** Lange Prosa (Case Studies, Über-mich) als MDX-Dateien mit Zod-validiertem Frontmatter; strukturierte Daten (Timeline, Skills, Kontakt, Projekt-Metadaten) als typisierte TS-Module. Sprachorganisation: **parallele Locale-Ordner** (`content/de/…`, `content/en/…`) mit identischer Struktur; ein Zod/TS-Vollständigkeits-Check erzwingt, dass jeder Inhalt in beiden Sprachen existiert (I18N-02).

#### Repo-Strategie & Deployment
- **D-07:** Altes Vite-Rewrite beim Next.js-Scaffold **löschen** — Git-History bewahrt alles; `src/content/`-Rohmaterial vorher extrahieren (siehe D-04).
- **D-08:** Phase 1 deployt **auf Vercel (Preview-/Deployment-URL)** mit kompletter Pipeline und CI-Performance-Budget. **lsiem.de zeigt weiterhin die alte Live-Seite** — der Domain-Switch erfolgt erst mit der fertigen Recruiter-Site (Phase 2). Das Phase-1-Erfolgskriterium „lsiem.de/de und lsiem.de/en" gilt entsprechend auf der Vercel-Deployment-URL (`/de`, `/en`).

#### Locale-Routing & Analytics
- **D-09:** **Default-Locale: Deutsch.** Root-URL leitet immer nach `/de` (keine Browser-Sprach-Weiche); Englisch über `/en` und den Sprach-Switcher. `x-default` im hreflang-Set zeigt auf die deutsche Default-Variante.
- **D-10:** **Vercel Analytics** als cookieless, DSGVO-freundliches Analytics (TECH-06) — plattformintegriert, kein Setup-Overhead.

### Claude's Discretion
- Genaue MDX-Tooling-Wahl (Content-Collections-Library vs. eigene Zod-Pipeline) beim Planning entscheiden — passend zu Next.js 16 und den Downstream-Nutzern (CV-PDF Phase 2, AI-Chat v2).
- Struktur/Schema-Details des Content-Modells (Feldnamen, Frontmatter-Shape), solange D-06 eingehalten wird.
- Auswahl und Zuschnitt der übrigen (nicht-tiefen) Projekte aus den ~7 Alt-Projekten.

### Deferred Ideas (OUT OF SCOPE)
- Domain-Switch lsiem.de auf die neue Site → Phase 2 (Teil von „Recruiter Overview Live", D-08).
- Werdegang-Timeline-UI und Case-Study-Darstellung → Phase 2 (Inhalte entstehen in Phase 1, Präsentation in Phase 2).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONT-01 | Strukturiertes, Git-basiertes DE/EN-Content-Modell als Single Source of Truth (speist Site, Overview-Mode, CV-PDF, später AI-Chat) | Content Collections (MDX + Zod frontmatter) + typed TS modules; generated output (`.content-collections/generated`) is plain JS/JSON importable by non-React consumers (CV-PDF Phase 2, AI chat v2) — see "Standard Stack" and "Content Model Design" |
| I18N-01 | DE/EN-Wechsel (routen-basiertes i18n mit Switcher, hreflang, per-Locale-SEO) | next-intl 4.13.1 `[locale]` segment, `proxy.ts`, `localePrefix: 'always'`, `localeDetection: false`, hreflang via Link header + `alternates.languages` incl. `x-default` — see "Architecture Patterns" Pattern 2 |
| I18N-02 | Alle Inhalte inkl. Case Studies vollständig in beiden Sprachen | Parallel locale folders + content-parity check (slug-set comparison per collection, fails build) + shared TS types forcing both locale files to exist — see Pattern 3 |
| TECH-06 | Cookieless, DSGVO-freundliche Analytics | Vercel Web Analytics: cookieless, request-hash visitor ID discarded after 24h, verified from official privacy docs — see "Standard Stack" |
| TECH-07 | Live auf lsiem.de (Vercel), Performance-Budget im CI | Per D-08 interpreted as Vercel deployment URL in Phase 1. GitHub Actions + `@lhci/cli` assertions (LCP ≤ 2500ms, script bytes budget) against local prod build; Vercel Git integration for deploys — see Pattern 4 |
</phase_requirements>

## Summary

This phase has two very different halves that share one deliverable: (a) a **walking-skeleton Next.js 16 foundation** (scaffold → locale routing → content read → deploy → CI budget → analytics) and (b) a **content authoring effort** (all v1 content written in DE, adapted to EN, in a typed model). The technical half is low-risk — every integration point was verified this session. The content half is the actual center of gravity (PITFALLS.md Pitfall 1: effects-first/content-last is the documented root cause of rebuild #1's failure) and should get the majority of plan tasks.

The one genuinely open technical question — MDX tooling under Next 16/Turbopack — is now settled: **Content Collections** (`@content-collections/core` + `mdx` + `next`). Verified from adapter source code: it is *not* a webpack plugin (it spawns the content builder when `next.config` loads and explicitly handles Next 16's forked `next dev` process), so it is Turbopack-compatible by construction. Its Zod-validated, generated JS output doubles as the machine-readable seam for Phase 2's CV-PDF and v2's AI chat. Velite (the main alternative) works with Turbopack only via a documented config-side hack; a fully custom Zod pipeline would hand-roll watch mode, type generation, and MDX compilation for no benefit.

Two operational traps need explicit plan attention: (1) the existing `vercel.json` contains a Vite SPA rewrite (`/((?!api/).*) → /index.html`) that will break every Next.js route if it survives the scaffold — it must be deleted with the old code, and the Vercel project's framework preset re-verified; (2) production on the existing Vercel project serves the old live site on lsiem.de — Phase 1 work must stay on a non-production branch and ship via preview deployment URLs only (D-08). Merging to the production branch before Phase 2 would put an unfinished site on the live domain.

**Primary recommendation:** Scaffold Next.js 16.2 + next-intl 4.13 + Content Collections as the thinnest end-to-end slice (one case study rendering at `/de/...` and `/en/...` on a Vercel preview URL with LHCI budget green), then author all content into the proven schema.

## Project Constraints (from CLAUDE.md)

- **Hosting:** Vercel + domain lsiem.de — reuse existing infrastructure (Phase 1: preview URL only, per D-08).
- **Language:** All content bilingual DE/EN.
- **Performance:** Immersion must not ruin load time / Core Web Vitals — budgets enforced from day one (LCP < 2.5s, INP < 200ms per CLAUDE.md dev-tools table).
- **Stack (locked by prior research, verified versions):** Next.js 16.2.x, React `~19.2.0` (pin — R3F 9 peer range `<19.3`), TypeScript 6.0.x (fallback 5.9 if tooling rejects), Tailwind CSS 4.3.x, next-intl 4.13.x, zod 4.x, pnpm, ESLint 9 + eslint-config-next, Prettier + prettier-plugin-tailwindcss, @vercel/analytics + @vercel/speed-insights.
- **What NOT to use:** Vite SPA, Gatsby/CRA, two animation engines, `framer-motion` package name, Locomotive Scroll, R3F v8, heavy WebGL as LCP. (Animation/3D libs are NOT part of Phase 1 at all.)
- **GSD workflow enforcement:** file changes go through GSD commands.
- **User rule:** use `ctx7` CLI for library docs lookups (done this session for content-collections and next-intl).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Content model (MDX + TS, Zod validation) | Build time (content build) | — | Content Collections builder runs before/with `next build`; validation errors fail the build, never reach runtime |
| Content parity check DE↔EN (I18N-02) | Build/CI | — | Slug-set comparison script + TS typecheck; a runtime check would be too late |
| Locale routing `/de` `/en`, root redirect | Edge (proxy.ts) + static routing | — | next-intl middleware handles `/` → `/de` redirect; pages themselves are fully SSG |
| Page rendering (both locales) | Server, build time (SSG) | — | `generateStaticParams` + `setRequestLocale` → prerendered HTML per locale on Vercel CDN |
| hreflang (incl. x-default) | Server (metadata) + Edge (Link header) | — | HTML `<link rel="alternate">` via `generateMetadata`; middleware adds Link header automatically |
| Language switcher | Client (thin) | Server (Link) | next-intl `Link`/`usePathname` — a real `<a href>` to the same page in the other locale (full navigation, PITFALLS.md Pitfall 7) |
| Analytics | Client (drop-in) | Vercel platform | `<Analytics/>` component; data collection/aggregation is Vercel-side |
| Performance budget | CI (GitHub Actions) | Vercel (Speed Insights field data) | LHCI gates PRs deterministically against a local prod build; Speed Insights monitors real users post-deploy |
| Deployment | Vercel Git integration | — | Push to branch → preview deployment URL; production branch untouched until Phase 2 |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.10 | Framework, SSG, Turbopack | Locked by STACK.md `[VERIFIED: npm registry, 2026-07-02]` |
| react / react-dom | 19.2.7, pin `~19.2.0` | Runtime | R3F 9 peer range `>=19 <19.3` (Phase 4 dependency, pin now) `[VERIFIED: npm registry]` |
| next-intl | 4.13.1 | Locale routing, messages, hreflang | Peer `next ^16.0.0` verified; de-facto App Router i18n `[VERIFIED: npm registry + Context7 docs]` |
| @content-collections/core | 0.15.2 | Typed content build from MDX/frontmatter | Zod (Standard Schema) validation, type generation, watch mode `[VERIFIED: npm registry + Context7 docs]` |
| @content-collections/mdx | 0.2.2 | `compileMDX` at content-build time | Bundler-independent MDX compilation — no `@next/mdx`/Turbopack loader dependency `[VERIFIED: npm registry + Context7 docs]` |
| @content-collections/next | 0.2.11 | Next.js adapter (`withContentCollections`) | **Verified from source:** not a webpack plugin; runs builder+watcher on config load with explicit Next 16 `next dev` fork handling → Turbopack-safe `[VERIFIED: github.com/sdorra/content-collections packages/next/src/index.ts]` |
| zod | 4.4.3 | Frontmatter + TS-module schemas | Content Collections accepts Zod via Standard Schema (the old `schema-as-function` API is deprecated) `[VERIFIED: npm registry + Context7 docs]` |
| tailwindcss | 4.3.2 | Styling (scaffold default) | Locked by STACK.md `[VERIFIED: npm registry]` |
| typescript | 6.0.3 (fallback 5.9.x) | Types | Locked by STACK.md `[VERIFIED: npm registry]` |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vercel/analytics | 2.0.1 | Cookieless visitor analytics (TECH-06) | Root layout, from day one. **Enable in Vercel dashboard first** — enabling adds `/_vercel/insights/*` routes on next deploy `[VERIFIED: vercel.com/docs/analytics/quickstart]` |
| @vercel/speed-insights | 2.0.0 | Real-user CWV field data | Root layout, from day one `[VERIFIED: npm registry]` |
| @lhci/cli | 0.15.1 | CI performance budget gate (TECH-07) | GitHub Actions, dev dependency `[VERIFIED: npm registry]` |
| eslint 9 + eslint-config-next, prettier + prettier-plugin-tailwindcss | latest via scaffold | Lint/format | Scaffold defaults per CLAUDE.md `[CITED: CLAUDE.md]` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Content Collections | **Velite 0.4.0** | Also Zod-based with JSON output, but its webpack plugin explicitly does **not** work under Turbopack; official workaround is spawning `velite build` from inside `next.config` guarded by `process.argv` checks, or a parallel `velite --watch` process `[CITED: velite.js.org/guide/with-nextjs]`. Works, but hackier than content-collections' adapter, and the seam flagged the package SUS (recent release). |
| Content Collections | **contentlayer2 0.5.x** | Community fork of dead Contentlayer; lower momentum (~23k downloads/wk vs 96k), ships a `postinstall` script, no verified Next 16/Turbopack story `[VERIFIED: npm registry]`. |
| Content Collections | **Custom Zod pipeline** (gray-matter + next-mdx-remote-client) | Full control, no framework coupling — but hand-rolls watch mode, generated types, MDX compile caching, and error reporting. Don't Hand-Roll (see below). |
| `compileMDX` transform | `createDefaultImport` + `@next/mdx` static imports | Static imports let MDX use project components directly, but pull `@next/mdx`/remark config into the bundler path — an unnecessary Turbopack variable. `compileMDX` keeps MDX compilation entirely in the content build. |

**Installation:**
```bash
# scaffold first (see Pattern 1), then:
pnpm add next-intl @vercel/analytics @vercel/speed-insights
pnpm add -D @content-collections/core @content-collections/mdx @content-collections/next zod @lhci/cli
```

**Version verification:** all versions above confirmed via `npm view <pkg> version` on 2026-07-02 in this session.

## Package Legitimacy Audit

Seam: `gsd-tools package-legitimacy check --ecosystem npm` (run 2026-07-02).

| Package | Registry | Latest publish | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----------|-----------|-------------|---------|-------------|
| next | npm | 2026-07-01 | 39.6M/wk | vercel/next.js | [SUS: too-new] | Approved — "too-new" reflects a release published yesterday on the framework itself; false positive |
| next-intl | npm | 2026-06-30 | 3.9M/wk | amannn/next-intl | [SUS: too-new] | Approved — same false-positive pattern (recent release, massive adoption) |
| zod | npm | 2026-05-04 | 209M/wk | colinhacks/zod | [OK] | Approved |
| @vercel/analytics | npm | 2026-03-12 | 4.2M/wk | vercel/analytics | [OK] | Approved |
| @vercel/speed-insights | npm | 2026-03-10 | 2.7M/wk | vercel/speed-insights | [OK] | Approved |
| @content-collections/core | npm | 2026-06-16 | 96k/wk | sdorra/content-collections | [SUS: too-new] | Approved — recent release of an established package (repo active since 2024, docs verified via Context7) |
| @content-collections/mdx | npm | 2025-03-10 | 62k/wk | none in manifest | [SUS: no-repository] | Approved with note — it lives in the sdorra/content-collections monorepo (verified on GitHub); the package manifest merely omits the repo field |
| @content-collections/next | npm | 2026-02-14 | 49k/wk | sdorra/content-collections | [OK] | Approved — source inspected directly this session |
| @lhci/cli | npm | 2025-06-25 | 1.1M/wk | GoogleChrome/lighthouse-ci | [OK] | Approved |
| velite | npm | 2026-06-17 | 55k/wk | zce/velite | [SUS: too-new] | Not selected (alternative only) |
| contentlayer2 | npm | 2025-05-03 | 23k/wk | timlrx/contentlayer2 | [OK], has postinstall (`node ./bin/cli.cjs postinstall`) | Not selected (alternative only) |
| next-mdx-remote / next-mdx-remote-client / gray-matter / @next/mdx | npm | various | 0.3–6.8M/wk | verified repos | [OK]/[SUS: too-new for @next/mdx] | Not selected (alternatives only) |

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged [SUS] and kept:** `next`, `next-intl`, `@content-collections/core`, `@content-collections/mdx` — all four are seam false positives (recency heuristic on high-download packages / monorepo manifest gap), each cross-verified against its official GitHub repo and docs. Planner may treat these as approved without a `checkpoint:human-verify`, citing this audit.

## Architecture Patterns

### System Architecture Diagram

```
                        ┌─ CI (GitHub Actions, per PR) ─────────────────┐
                        │ pnpm build ──► content build (Zod validate,   │
                        │  ▲              parity check DE↔EN)           │
                        │  │              next build (SSG /de, /en)     │
                        │  └─ fail ◄── lhci autorun (LCP + JS budget)   │
                        └───────────────┬───────────────────────────────┘
                                        │ green → Vercel Git integration
                                        ▼
 content/de/**  content/en/**   ┌──────────────────────┐
 (MDX + TS) ──► Content         │ Vercel PREVIEW deploy │──► reviewer opens
 messages/{de,en}.json          │ (production branch     │    <url>/de, <url>/en
      │         Collections ──► │  untouched → lsiem.de  │
      │         builder         │  keeps old site, D-08) │
      │              │          └──────────┬─────────────┘
      │              ▼                     │ request
      │   .content-collections/generated  ▼
      │   (typed JS/JSON — also feeds   proxy.ts (next-intl middleware)
      │    CV-PDF Phase 2, AI chat v2)    │  "/" ──307──► "/de" (D-09)
      │              │                    │  Link header: hreflang de/en/x-default
      ▼              ▼                    ▼
 app/[locale]/layout.tsx ── hasLocale → setRequestLocale → generateStaticParams
      │                                                    (SSG both locales)
      ▼
 page.tsx renders content + <MDXContent code={...}/> + metadata alternates
      + <Analytics/> + <SpeedInsights/> (client, cookieless)
```

### Recommended Project Structure

```
(repo root — old Vite tree deleted per D-07)
├── content/                      # SINGLE SOURCE OF TRUTH (CONT-01)
│   ├── de/
│   │   ├── case-studies/        # elia.mdx, vidama-mediathek.mdx (deep)
│   │   ├── about.mdx
│   │   ├── career.ts            # typed timeline entries
│   │   ├── projects.ts          # metadata for all 5–7 projects (incl. card-only)
│   │   ├── skills.ts
│   │   └── contact.ts
│   └── en/                      # IDENTICAL structure (D-06); parity enforced
├── content/shared/types.ts      # shared TS types/Zod schemas for the TS modules
├── messages/
│   ├── de.json                  # UI strings (from old ui.ts)
│   └── en.json
├── src/
│   ├── app/
│   │   ├── layout.tsx           # root passthrough (or omit; locale layout owns <html>)
│   │   └── [locale]/
│   │       ├── layout.tsx       # hasLocale → setRequestLocale, providers, Analytics
│   │       └── page.tsx         # minimal content rendering (presentation = Phase 2)
│   ├── i18n/
│   │   ├── routing.ts           # defineRouting
│   │   ├── navigation.ts        # createNavigation (Link, usePathname, getPathname)
│   │   └── request.ts           # getRequestConfig (messages per locale)
│   ├── proxy.ts                 # next-intl middleware (Next 16 name)
│   └── lib/content.ts           # accessors over content-collections + TS modules
├── content-collections.ts       # collection definitions (case studies, about)
├── scripts/check-content-parity.ts  # I18N-02 gate (also checks local blocklist)
├── lighthouserc.json            # LHCI assertions
└── .github/workflows/ci.yml     # rewrite: pnpm, build, parity, LHCI
```

Structure rationale: `content/` outside `src/app` is the load-bearing boundary from ARCHITECTURE.md — every later consumer (overview mode, immersive mode, CV-PDF, AI chat) imports the same typed data. Per-locale TS modules (`content/de/career.ts` + `content/en/career.ts`) sharing one type from `content/shared/types.ts` make TS itself the completeness check for structured data; MDX parity is checked by script.

### Pattern 1: Walking Skeleton Scaffold (create-next-app on the existing repo)

**What:** Scaffold Next 16 into the repo after extracting `src/content/` raw material and deleting the Vite tree (D-04, D-07).
**How:** `create-next-app` 16.2.10 flags verified this session: `--ts --tailwind --app --src-dir --eslint --import-alias "@/*" --use-pnpm` (TS/Tailwind/App Router are defaults; **no `--turbopack` flag exists anymore — Turbopack IS the default**; `--agents-md` is default and adds an AGENTS.md). Scaffold into a temp dir and move files in, or run with `--yes` in a clean tree — create-next-app refuses non-empty directories, so the plan must sequence: extract content → delete old tree (git preserves) → scaffold → re-add `.planning/`, `.gitignore` entries, `CLAUDE.md`.
**Critical cleanup:** delete `vercel.json` (its SPA rewrite `/((?!api/).*) → /index.html` breaks all Next routes) and rewrite `.github/workflows/ci.yml` (currently npm + Vite + vitest + playwright). `[VERIFIED: local repo inspection]`

### Pattern 2: next-intl 4 fully-static locale routing (I18N-01, D-09)

```ts
// src/i18n/routing.ts  [CITED: next-intl docs via Context7 /amannn/next-intl]
import {defineRouting} from 'next-intl/routing';
export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de',
  localePrefix: 'always',     // /de and /en always prefixed
  localeDetection: false      // D-09: no accept-language negotiation; / → /de always
});
```

```ts
// src/proxy.ts — NOTE: Next 16 renamed middleware.ts → proxy.ts
// [CITED: next-intl routing/setup docs: "proxy.ts was called middleware.ts up until Next.js 16"]
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
export default createMiddleware(routing);
export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
```

```tsx
// src/app/[locale]/layout.tsx  [CITED: next-intl docs via Context7]
import {setRequestLocale} from 'next-intl/server';
import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({children, params}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);   // REQUIRED for static rendering — every layout AND page
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**hreflang (success criterion 2):** two complementary mechanisms, both needed:
1. The middleware automatically emits a `Link` response header with hreflang entries for `de`, `en` **and `x-default`** (x-default points at the unprefixed URL, which 307-redirects to `/de` per `localeDetection: false` — exactly D-09's "x-default → German default variant"). `[CITED: next-intl routing/configuration docs — alternateLinks section]`
2. HTML `<link rel="alternate">` tags via `generateMetadata` with `alternates.languages` (including a self-reference and `'x-default'`), building URLs with `getPathname` from `createNavigation`. Set `metadataBase` from `process.env.VERCEL_PROJECT_PRODUCTION_URL` (fallback for local dev) so hreflang URLs are absolute on the preview deployment now and switch to `https://lsiem.de` in Phase 2 with a one-line change. PITFALLS.md Pitfall 6 requires self-reference + x-default — verify with `curl -sI <url>/de | grep -i link` and page-source inspection.

**Language switcher:** `Link` from `createNavigation` with `locale={other}` on the current pathname — a real `<a href>`, full navigation (never a client-side string swap; Pitfall 7).

### Pattern 3: Content Collections as the typed content layer (CONT-01, D-06)

```ts
// content-collections.ts  [CITED: content-collections docs via Context7 /sdorra/content-collections]
import {defineCollection, defineConfig} from '@content-collections/core';
import {compileMDX} from '@content-collections/mdx';
import {z} from 'zod';

const caseStudies = defineCollection({
  name: 'caseStudies',
  directory: 'content',
  include: '*/case-studies/*.mdx',       // matches de/... and en/...
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    role: z.string(),
    period: z.string(),
    stack: z.array(z.string()),
    depth: z.enum(['flagship', 'deep']),  // D-01 weighting
    order: z.number(),
  }),
  transform: async (doc, ctx) => {
    const mdx = await compileMDX(ctx, doc);
    const [locale] = doc._meta.path.split('/');       // 'de' | 'en'
    const slug = doc._meta.fileName.replace(/\.mdx$/, '');
    return {...doc, mdx, locale, slug};
  },
});

export default defineConfig({content: [caseStudies /*, about */]});
```

```ts
// next.config.ts — withContentCollections must be the OUTERMOST plugin
import type {NextConfig} from 'next';
import {withContentCollections} from '@content-collections/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();
const nextConfig: NextConfig = {};
export default withContentCollections(withNextIntl(nextConfig));
```

Rendering: `<MDXContent code={caseStudy.mdx} />` from `@content-collections/mdx/react` in a server component. Add `"content-collections": ["./.content-collections/generated"]` to tsconfig `paths` and `.content-collections` to `.gitignore`.

**Turbopack compatibility — verified from source** (`packages/next/src/index.ts`): the adapter contains no webpack hooks at all; it runs `createBuilder(...).build()` (+ `.watch()` in dev) when the Next config file is loaded, and explicitly handles the Next 16 behavior where `next dev` no longer loads `next.config.js` in the parent process ("starting with v16 next dev doesn't load next.config.js — next-start loads next.config.js"). `[VERIFIED: github.com/sdorra/content-collections]`

**Parity check (I18N-02):** `scripts/check-content-parity.ts` imports the generated collections, groups by `slug`, and exits non-zero if any slug lacks a `de` or `en` variant (also compares `content/de` vs `content/en` file trees for TS modules). Run in CI before `next build` and as a `prebuild` script. Structured TS data is doubly covered: both locale files import the same types from `content/shared/types.ts`, so a missing field is a typecheck failure.

**Downstream consumers (why this satisfies CONT-01's "speist … CV-PDF und AI-Chat"):** the generated output is plain ESM/JSON in `.content-collections/generated` — a Node script (CV-PDF generator, Phase 2) or an API route (AI chat, v2) can import collections without React or the Next runtime. Keep raw MDX text available by retaining `doc.content` in the transform if Phase 2 needs prose, not just compiled MDX.

### Pattern 4: CI performance budget (TECH-07)

```jsonc
// lighthouserc.json  [CITED: googlechrome.github.io/lighthouse-ci + cross-checked web guides]
{
  "ci": {
    "collect": {
      "startServerCommand": "pnpm start",           // next start after next build
      "url": ["http://localhost:3000/de", "http://localhost:3000/en"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "resource-summary:script:size": ["error", {"maxNumericValue": 153600}],  // 150 KB — BYTES, not KB
        "categories:performance": ["error", {"minScore": 0.9}]
      }
    },
    "upload": {"target": "temporary-public-storage"}
  }
}
```

GitHub Actions job: `pnpm install` → `pnpm build` (runs content build + parity + next build) → `npx lhci autorun`. Gate against the **local production server**, not the Vercel preview URL: deterministic, no dependency on Vercel Deployment Protection or deploy timing. Field data on the real deployment comes from Speed Insights (that's its job). Watch the units trap: LHCI assertion sizes are bytes; the standalone `budgets.json` format documents KB. `[CITED: GoogleChrome/lighthouse-ci docs; cross-checked css-tricks.com and web guides — MEDIUM]`

### Pattern 5: Vercel deployment & analytics (TECH-06, D-08, D-10)

- **Deploys:** Vercel Git integration on the existing project. Every push to a non-production branch → preview deployment with a stable URL (`<project>-git-<branch>-<team>.vercel.app`). Production branch (lsiem.de) is **not touched** until Phase 2.
- **Project settings to verify at execution (checkpoint):** framework preset must become Next.js (auto-detected once `next` is in package.json, but the existing project may carry Vite-era overrides for build command/output dir); Deployment Protection on previews must be off or a shareable link created, otherwise the reviewer (success criterion 2) and any external check hit a Vercel login wall.
- **Analytics:** enable Web Analytics in the Vercel dashboard **first** (adds `/_vercel/insights/*` routes on next deploy), then `<Analytics/>` from `@vercel/analytics/next` + `<SpeedInsights/>` from `@vercel/speed-insights/next` in the locale layout. Cookieless: no cookies, visitor identified by a request hash discarded after 24h, aggregated data only — GDPR-friendly without a consent banner. `[VERIFIED: vercel.com/docs/analytics/privacy-policy, 2026-03-18 revision]`

### Anti-Patterns to Avoid

- **Client-side locale swap on one URL** — breaks SEO/hreflang/shared links (PITFALLS.md Pitfall 7). Locale switch is a navigation.
- **Forgetting `setRequestLocale` in any page/layout** — silently flips the route to dynamic rendering, killing SSG. Verify: `next build` output must show `●` (SSG) for all `[locale]` routes.
- **Keeping the Vite `vercel.json` rewrite** — rewrites every non-api path to `/index.html`; all Next routes 404/misroute.
- **`createDefaultImport` static-MDX variant** — reintroduces `@next/mdx` + remark config into the bundler path; use `compileMDX` instead.
- **Merging to the production branch "just to test"** — puts the skeleton on lsiem.de, violating D-08.
- **Copying internal reference details into content or committed docs** — D-03; this repo is public. Only abstracted terms (see Content Notes below).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MDX → typed data + compiled output | gray-matter + custom compiler + hand-written types | Content Collections | Watch mode, generated `.d.ts`, Zod errors with file context, MDX compile caching — all edge cases already solved |
| Locale routing/redirects | Custom middleware + cookie logic | next-intl `defineRouting` + `createMiddleware` | Handles prefixing, redirects, Link header alternates, static rendering interplay |
| hreflang set | Hand-built `<link>` tags per page | next-intl Link header + `getPathname`-based `alternates` | Self-reference + x-default correctness is exactly the part people get wrong (Pitfall 6) |
| Visitor analytics | Self-hosted counter/logging | Vercel Web Analytics | Cookieless + GDPR posture already documented by the vendor; zero maintenance (D-10 locks this anyway) |
| Perf budget enforcement | Custom Lighthouse scripts parsing JSON | `@lhci/cli` assertions | Median-of-3 runs, server lifecycle management, assertion DSL |
| DE↔EN completeness for TS data | Runtime checks | Shared TS types + per-locale modules | The compiler is the check; only the MDX slug-parity script is custom (and ~30 lines) |

**Key insight:** every infrastructure problem in this phase has a maintained, verified off-the-shelf solution — the only genuinely custom artifacts are the content schema, the ~30-line parity script, and the content itself. That is where the effort belongs.

## Runtime State Inventory

This phase deletes/replaces a deployed app (Vite → Next.js), so runtime state beyond the repo was audited:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — static site, no DB, no user data. Verified: no server code in old Vite tree. | none |
| Live service config | **Vercel project:** production deployment serves the old site on lsiem.de; possible Vite-era framework preset/build-command overrides in project settings (not in git); Deployment Protection setting unknown; Web Analytics enablement state unknown. **`vercel.json` in repo:** SPA rewrite that breaks Next. | Delete `vercel.json` with scaffold; checkpoint task: verify project settings (framework preset, deployment protection, analytics enabled) in Vercel dashboard; never merge to production branch (D-08) |
| OS-registered state | None (no cron, no scheduled tasks, no local services). | none |
| Secrets/env vars | None found in repo; no `.env` required by old or new code. Vercel project may hold legacy env vars — harmless to Next but worth a glance during the settings checkpoint. | optional cleanup |
| Build artifacts | `node_modules/`, Vite `dist/`, old CI workflow `.github/workflows/ci.yml` (npm + vitest + playwright — will fail against the new tree), old lockfile (npm) vs new pnpm. | Delete/replace with scaffold; rewrite CI workflow; commit `pnpm-lock.yaml` |
| Gitignored local files | `.planning/phases/*/reference/` (internal ELIA docs) — `.gitignore` line 83–84 confirmed present. **Must survive the scaffold cleanup** (both the files and the gitignore rule). | Preserve `.gitignore` entries when scaffold overwrites `.gitignore` |

## Common Pitfalls

### Pitfall 1: Turbopack-incompatible content tooling chosen by habit
**What goes wrong:** Velite's webpack plugin or `@next/mdx`-dependent patterns silently do nothing (or crash) under Next 16's default Turbopack dev server; content changes stop hot-reloading or the build diverges between dev and CI.
**Why it happens:** Most 2024-era Next+MDX tutorials assume webpack.
**How to avoid:** Content Collections adapter + `compileMDX` (both bundler-independent, verified from source).
**Warning signs:** content edits require dev-server restarts; "works locally with `--webpack`" comments.

### Pitfall 2: Dynamic rendering sneaks in and kills SSG
**What goes wrong:** A missed `setRequestLocale` (or use of `useTranslations` in an unwrapped async context) makes routes render per-request; CWV budget and CDN caching degrade.
**How to avoid:** `setRequestLocale(locale)` in **every** layout and page under `[locale]`; assert in verification that `next build` marks all routes `●` static.
**Warning signs:** build output shows `ƒ (Dynamic)` for portfolio pages.

### Pitfall 3: hreflang set incomplete or wrong host
**What goes wrong:** Missing self-reference or `x-default` makes Google ignore the whole hreflang set (PITFALLS.md Pitfall 6); or URLs point at `localhost`/wrong host because `metadataBase` is unset on preview deployments.
**How to avoid:** `metadataBase` from `VERCEL_PROJECT_PRODUCTION_URL` env with explicit fallback; hreflang entries for `de`, `en` (self-referencing) + `x-default` → default-locale variant (D-09). Verify with `curl` on the deployed preview.
**Warning signs:** relative alternate URLs in page source; Search Console hreflang errors (later).

### Pitfall 4: The old Vercel/CI plumbing poisons the new app
**What goes wrong:** Leftover `vercel.json` SPA rewrite 404s every route; old `ci.yml` (npm/vitest/playwright) fails all PRs; Vercel project build-command override builds with Vite.
**How to avoid:** Explicit teardown task in the scaffold plan (delete `vercel.json`, rewrite CI, checkpoint Vercel settings).
**Warning signs:** preview deployment shows blank page or old site; CI red on unrelated steps.

### Pitfall 5: Confidential details leak into a public repo (D-03)
**What goes wrong:** Internal system names, roadmap dates, or model names from the local reference document end up in MDX content, commit messages, or planning docs — in a public repo.
**How to avoid:** Authoring rule: only the abstracted terms whitelisted in D-03 (Multi-Agenten-Architektur, MCP-basiertes Tool-Calling statt klassischem RAG, Orchestrator-Migration auf ein aktuelles Agent-Framework, EU-Datenresidenz/DSGVO, Teams-Integration, „ITSM-System", „Wiki"). Add a **local-only blocklist check**: `scripts/check-content-parity.ts` additionally greps content for forbidden terms read from `.planning/phases/01-*/reference/blocklist.txt` (gitignored — the forbidden names themselves must never be committed, so the list lives only locally; CI skips the check when the file is absent).
**Warning signs:** any concrete vendor/product/model name in a case study that isn't on the public whitelist; any date tied to an internal roadmap.

### Pitfall 6: Content model designed around Phase 1's minimal rendering
**What goes wrong:** Schema fields chosen to fit the skeleton page, then Phase 2 (timeline UI, case-study layout, CV-PDF) needs restructuring — content churn in both languages.
**How to avoid:** Schema serves the *requirements*, not the page: case studies carry structured Problem → Architektur-Entscheidungen → Tradeoffs → Ergebnis/Stand fields or clearly delimited MDX sections; career entries carry from/to dates, role, org, highlights (CONT-03/CONT-04/CONT-08 shapes); skills carry domain grouping + years + project refs (CONT-05, no percent bars).
**Warning signs:** frontmatter with presentation words (`heroSize`, `panelColor`); Phase 2 planning reopens content files for structure (not wording).

### Pitfall 7: German/English drift during authoring
**What goes wrong:** DE gets refined late in the phase, EN silently stays on the old wording — reviewer finds mismatched claims between locales.
**How to avoid:** Parity script guarantees *existence*, not *equivalence*. Process rule: DE and EN of the same document are always edited in the same task/commit (D-05: Claude writes EN as adaptation of the final DE).
**Warning signs:** commits touching `content/de/**` without the `content/en/**` counterpart.

## Code Examples

Covered inline in Architecture Patterns 2–4 (all sourced from Context7 official docs or verified library source). One addition — the request config next-intl needs for messages:

```ts
// src/i18n/request.ts  [CITED: next-intl docs via Context7]
import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {locale, messages: (await import(`../../messages/${locale}.json`)).default};
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` | `proxy.ts` | Next.js 16 | next-intl docs updated; plan must use the new filename `[CITED: next-intl setup docs]` |
| `next dev --turbopack` flag | Turbopack is the default; no flag in create-next-app | Next.js 16 | Content tooling must be bundler-independent (drove the MDX tooling decision) |
| Contentlayer | Content Collections (or contentlayer2 fork) | 2024 | Contentlayer is unmaintained; Content Collections is its de-facto successor `[CITED: dub.co migration post; content-collections.dev]` |
| Zod-v3-only `schema` function in content-collections | Standard Schema objects (Zod 4 works directly) | content-collections deprecation of schema-as-function | Use `schema: z.object({...})` directly `[CITED: content-collections deprecations docs]` |
| GA + cookie banner | Cookieless platform analytics (Vercel/Plausible class) | established practice | TECH-06 satisfiable with zero consent UI `[VERIFIED: Vercel privacy docs]` |

**Deprecated/outdated:** Contentlayer (dead), `framer-motion` package name (irrelevant this phase), `middleware.ts` naming under Next 16.

## Content Model Design Notes (for the planner)

Raw material inventory from old `src/content/` (extract before D-07 deletion — all German):
- `personal.ts` — name, title, email (info@lsiem.de), GitHub, LinkedIn → `contact.ts`
- `experience.ts` — 5 stations (ITSC Systemadministrator seit 06/2024; Just Relate SE seit 01/2024; Vidama CTO 12/2021–01/2024; Freelance seit 04/2021; Heinsohn 05–12/2021) → `career.ts`. **Must be updated for the D-02 arc:** ITSC role progression Systemadministrator (OpenShift) → Software Engineering → Product Owner (seit ~04/2026); the flat "Systemadministrator, Juni 2024 – Heute" entry is stale.
- `projects.ts` — 7 projects with title/description/tags/problem/solution: EWE/osnatel Mediathek, Disy-One, Sport Event Controller, Ferrero Foto-Aktion, JR PurTec, Imke Folkerts Portal, Immobilienbaukasten. Note: **ELIA and OpenShift platform work are NOT in the old material** — the flagship case study and the OpenShift card are net-new writing (source: local reference doc, abstracted per D-03; user's specifics in CONTEXT.md).
- `skills.ts` — categorized skills (~145 lines) → regroup by domain with years + project refs (CONT-05 shape).
- `about.ts` — headline, tagline, bio, stats → seed for `about.mdx`.
- `ui.ts` — UI strings → seed for `messages/de.json`.
- `types.ts`/`validate.ts` — schema inspiration only (flat, single-locale; the new model is per-locale + richer case-study structure).

Deep case-study target structure (from CONT-04 + D-02): Problem/Kontext → Architektur-Entscheidungen → Tradeoffs → Ergebnis/Stand (mit Zahlen wo möglich), plus role narrative. Vidama case study focuses on **Mediathek-Entwicklung** (user-specified). Card-only projects need only the metadata shape (title, summary, tags, period, link).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Vercel Web Analytics also records data on **preview** deployments (dashboard filterable by environment), so success criterion 4 is checkable before the Phase-2 domain switch | Pattern 5 | If analytics were production-only, criterion 4 could only be *wired up* (component + enabled) in Phase 1 and verified after Phase 2's switch. Verify on the first preview deploy (Network tab: `/_vercel/insights/view` request + dashboard data). `[ASSUMED]` |
| A2 | The existing Vercel project can host the new Next.js app from a branch without settings conflicts (framework preset auto-detects Next) | Pattern 5 / Runtime State | Preview builds fail with Vite-era overrides; fixed in dashboard in minutes. Checkpoint task covers this. `[ASSUMED]` |
| A3 | 150 KB gzip initial-JS budget is achievable for the skeleton (React 19 + next-intl runtime, no animation libs) | Pattern 4 | If the App Router baseline exceeds it, raise the script budget with a documented rationale rather than dropping the gate. `[ASSUMED — verify with first `next build` output]` |
| A4 | TypeScript 6.0.3 is accepted by the whole chain (create-next-app template, content-collections typegen) | Standard Stack | STACK.md already defines the fallback: pin 5.9.x, zero code changes. `[ASSUMED]` |
| A5 | Deployment Protection on the existing project's previews is either off or can be turned off / bypassed with a shareable link | Pattern 5 | Reviewer and success criterion 2 blocked until the setting is changed — dashboard-only fix. `[ASSUMED]` |

## Open Questions

1. **Which branch is the Vercel production branch, and what does `main` currently deploy?**
   - What we know: lsiem.de serves the old live site; current work happens on `cursor/portfolio-rewrite-a2cc`; `main`'s deploy state wasn't probed.
   - What's unclear: whether `main` already contains the discarded rewrite (i.e., whether lsiem.de is deployed from `main` or from an older commit/project).
   - Recommendation: first execution task runs `vercel project inspect` / checks the dashboard; all Phase-1 work stays on a non-production branch regardless (D-08).
2. **Impressum/Datenschutzerklärung (German legal requirement per PITFALLS.md)** — not in Phase-1 requirements; site is only on a preview URL. Recommendation: author both as ordinary content documents in this phase (cheap, bilingual, feeds Phase 2's live launch), but treat as optional scope — flag to planner as a nice-to-have task, not a gate.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js ≥ 20 | Next 16 | ✓ | v26.4.0 | — |
| pnpm | package manager (CLAUDE.md) | ✓ | 11.1.2 | — |
| Vercel CLI | deploy inspection/linking | ✓ | 54.18.6 | Vercel dashboard |
| gh CLI | CI/PR operations | ✓ | 2.95.0 | — |
| Chrome (for LHCI) | local budget runs | ✓ (macOS dev machine; CI runners install their own) | — | LHCI's bundled Chromium handling in Actions |
| Vercel project + Git integration | deploys | ✓ (existing project, `vercel.json` present) | — | — |

**Missing dependencies with no fallback:** none.

## Security Domain

### Applicable ASVS Categories (Level 1; static public site — most categories N/A)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth surface in Phase 1 |
| V3 Session Management | no | No sessions; analytics visitor hash is Vercel-side and ephemeral |
| V4 Access Control | no | Public static content only |
| V5 Input Validation | yes (build-time) | Zod schemas validate all content at build; no runtime user input exists |
| V6 Cryptography | no | Nothing to encrypt; TLS is Vercel platform-level |
| V14 Configuration | yes | Public repo hygiene: gitignored `reference/` dir preserved through scaffold; no secrets in code (none needed); pnpm lockfile committed; local-only confidentiality blocklist check (Pitfall 5) |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Confidential-data disclosure via public repo (D-03) | Information Disclosure | Gitignore rule verified; local blocklist grep before commit; abstraction whitelist for ELIA content |
| Supply-chain (npm install) | Tampering | Package legitimacy audit above; pnpm strict resolution + committed lockfile; no packages with unexplained postinstall in the selected set |
| Over-publishing personal data (German CV habit) | Information Disclosure | Publish role-relevant facts only (PITFALLS.md security table); no birthdate/address/phone in `contact.ts` |
| PII in analytics URLs | Information Disclosure | Vercel Analytics collects filtered aggregate data; no dynamic user paths exist in this site |

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view`, 2026-07-02) — versions/downloads for all audited packages
- `gsd-tools package-legitimacy check` (2026-07-02) — registry signals table
- github.com/sdorra/content-collections — `packages/next/src/index.ts` source (Turbopack/Next-16 behavior), `docs/adapter/next.mdx`
- Context7 `/sdorra/content-collections` — collection/compileMDX/Zod setup
- Context7 `/amannn/next-intl` — routing setup, `proxy.ts` rename note, `setRequestLocale`, `localeDetection`, alternateLinks/x-default
- vercel.com/docs/analytics/privacy-policy + /docs/analytics/quickstart — cookieless mechanics, enablement flow
- Local repo inspection — `vercel.json`, `.github/workflows/ci.yml`, `src/content/*`, `.gitignore`
- `create-next-app@16.2.10 --help` — current scaffold flags
- Velite official docs (velite.js.org/guide/with-nextjs) — Turbopack limitation + workaround

### Secondary (MEDIUM confidence)
- [GoogleChrome/lighthouse-ci](https://github.com/GoogleChrome/lighthouse-ci) + [CSS-Tricks LHCI guide](https://css-tricks.com/continuous-performance-analysis-with-lighthouse-ci-and-github-actions/) + [Lighthouse CI Action](https://github.com/marketplace/actions/lighthouse-ci-action) + [trevorlasn.com LHCI post](https://www.trevorlasn.com/blog/lighthouse-ci) — assertion patterns, bytes-vs-KB trap
- [velite discussion #274](https://github.com/zce/velite/discussions/274) — Next 15/16 Turbopack reports
- [dub.co: Migrating from Contentlayer to Content Collections](https://dub.co/blog/content-collections) — ecosystem direction

### Tertiary (LOW confidence)
- None load-bearing.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version and peer range verified against npm this session; MDX-tooling decision verified from adapter source, not docs claims
- Architecture (next-intl/SSG/hreflang): HIGH — official docs via Context7, incl. the Next-16 `proxy.ts` rename
- CI budget mechanics: MEDIUM — LHCI patterns cross-checked across official repo + multiple guides, not executed yet
- Vercel project runtime state: MEDIUM — repo-side verified; dashboard-side settings are assumptions A1/A2/A5 with cheap checkpoints
- Content inventory: HIGH — read directly from `src/content/` this session

**Research date:** 2026-07-02
**Valid until:** ~2026-08-01 (stable stack; re-verify `react ~19.2` pin and content-collections version at scaffold time per STATE.md blocker note)
