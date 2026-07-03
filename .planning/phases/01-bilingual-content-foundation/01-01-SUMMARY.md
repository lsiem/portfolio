---
phase: 01-bilingual-content-foundation
plan: 01
subsystem: infra
tags: [nextjs, next-intl, content-collections, mdx, zod, i18n, tailwind, turbopack, ssg]

# Dependency graph
requires: []  # First plan of the project — greenfield after Vite teardown
provides:
  - "Next.js 16 (Turbopack) app scaffold replacing the discarded Vite SPA"
  - "Route-based DE/EN i18n via next-intl with localePrefix=always, defaultLocale=de, localeDetection=false"
  - "hreflang alternates (de/en/x-default) in both HTML head and Link response header"
  - "Content Collections pipeline (content-collections.ts) with Zod-validated MDX frontmatter"
  - "Shared content type contract (content/shared/types.ts) — Zod schemas + inferred TS types for career, projects, skills, contact"
  - "One real bilingual case study (Vidama-Mediathek) rendering fully static at /de and /en"
  - "Staged copy of the old Vite raw content in extracted/ (D-04)"
affects: [01-02, 01-03, 01-04]

# Tech tracking
tech-stack:
  added: [next@16.2.10, react@~19.2.0, next-intl@^4.13.1, "@content-collections/core", "@content-collections/next", "@content-collections/mdx", zod, tailwindcss@4]
  patterns:
    - "App Router with [locale] segment + generateStaticParams (full SSG)"
    - "next-intl middleware in src/proxy.ts (Next 16 filename) via createMiddleware(routing)"
    - "withContentCollections as outermost next.config plugin"
    - "Typed content accessors in src/lib/content.ts over content-collections generated output"

key-files:
  created:
    - "next.config.ts — withContentCollections wrapping next-intl plugin"
    - "content-collections.ts — caseStudies collection, Zod frontmatter schema (D-06)"
    - "content/shared/types.ts — shared Zod schemas + TS types (the contract 01-03/01-04 implement against)"
    - "content/de|en/case-studies/vidama-mediathek.mdx — thin real case study, both locales"
    - "src/i18n/routing.ts, navigation.ts, request.ts — next-intl config"
    - "src/proxy.ts — next-intl middleware + matcher"
    - "src/app/[locale]/layout.tsx — generateStaticParams + hasLocale guard + setRequestLocale + NextIntlClientProvider"
    - "src/app/[locale]/page.tsx, src/app/[locale]/case-studies/[slug]/page.tsx"
    - "src/components/locale-switcher.tsx"
    - "src/lib/content.ts — getCaseStudies(locale), getCaseStudy(locale, slug)"
    - "src/lib/seo.ts — localeAlternates(pathname), siteMetadataBase"
    - ".planning/phases/01-bilingual-content-foundation/extracted/ — staged old content (D-04)"
  modified:
    - ".gitignore, README.md, package.json, pnpm-lock.yaml, tsconfig.json"

key-decisions:
  - "D-07: deleted the entire Vite SPA tree (index.html, api/, e2e/, vite/vitest/playwright configs, package-lock.json) in one atomic teardown"
  - "D-04: staged the 10 old src/content/*.ts files into extracted/ before deletion so raw German material survives for 01-03/01-04"
  - "D-06: content model on Content Collections with Zod frontmatter validation rather than hand-rolled MDX parsing"
  - "D-09: German is the default locale; / issues a 307 to /de; localeDetection disabled for deterministic routing"

patterns-established:
  - "Full SSG per locale: every [locale] route prerendered via generateStaticParams — no dynamic rendering"
  - "hreflang emitted twice (head <link> + Link header) for crawler robustness"
  - "content-collections generated output consumed only through typed src/lib accessors, never imported raw in pages"

requirements-completed: [CONT-01, I18N-01]

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "Visiting / redirects (307) to /de — German is the default locale"
    requirement: "I18N-01"
    verification:
      - kind: e2e
        ref: "curl -sI http://localhost:3100/ => 307 Temporary Redirect, location: /de"
        status: pass
    human_judgment: false
  - id: D2
    description: "Vidama-Mediathek case study readable in German at /de and English at /en, switchable via a real link"
    requirement: "CONT-01"
    verification:
      - kind: e2e
        ref: "curl /de/.../vidama-mediathek => 200; /en/.../vidama-mediathek => 200 with EN h1 'Sales Partner Media Library for EWE & osnatel'"
        status: pass
    human_judgment: false
  - id: D3
    description: "Every [locale] route prerendered (SSG) at build time — no dynamic rendering"
    requirement: "I18N-01"
    verification:
      - kind: automated_ui
        ref: "pnpm build => 7 static pages (● SSG): /de, /en, /de|/en/case-studies/vidama-mediathek"
        status: pass
    human_judgment: false
  - id: D4
    description: "hreflang alternates for de, en, and x-default present in HTML head and Link response header"
    requirement: "I18N-01"
    verification:
      - kind: e2e
        ref: "curl -sI /de/.../vidama-mediathek Link header + <link rel=alternate hrefLang> in /de HTML head — de/en/x-default all present"
        status: pass
    human_judgment: false
  - id: D5
    description: "Old German raw content preserved in extracted/ before the Vite tree was deleted (D-04)"
    requirement: "CONT-01"
    verification:
      - kind: other
        ref: "ls extracted/ => about.ts content.test.ts experience.ts index.ts personal.ts projects.ts skills.ts types.ts ui.ts validate.ts"
        status: pass
    human_judgment: false

# Metrics
duration: ~6min
completed: 2026-07-02
status: complete
---

# Phase 01 · Plan 01: Walking Skeleton Summary

**Vite SPA replaced by a static-rendered Next.js 16 bilingual foundation — one real case study (Vidama-Mediathek) reads fully in German and English, with route-based i18n and hreflang wired end-to-end.**

## Performance

- **Duration:** ~6 min (execution)
- **Started:** 2026-07-02T21:04:13+02:00
- **Completed:** 2026-07-02T21:10:33+02:00
- **Tasks:** 3 completed
- **Files modified:** 118 files changed (+9,027 / −11,228) — bulk is create-next-app scaffold output and the mechanical Vite-tree teardown

> **Retroactive close-out (2026-07-03):** This plan was executed and committed via the merged `cursor/portfolio-rewrite` branch but the SUMMARY / STATE / ROADMAP updates were never written, so the safe-resume gate flagged it. Closed out after re-verifying against a fresh `pnpm build` (green) and a live `next start` smoke test (redirect, hreflang, and bilingual rendering all confirmed). No code was changed during close-out.

## Accomplishments
- Tore down the discarded Vite SPA and scaffolded a Next.js 16 (Turbopack) app on pnpm — clean architectural backbone every later slice builds on.
- Wired route-based DE/EN i18n (next-intl): `/` → 307 → `/de`, `localePrefix=always`, `localeDetection=false`, plus a working language switcher.
- Stood up the Content Collections pipeline with Zod-validated MDX frontmatter and a shared type contract (`content/shared/types.ts`) that 01-03/01-04 will implement against.
- Proved the whole pipeline with a real bilingual case study rendering as static HTML at `/de/case-studies/vidama-mediathek` and `/en/case-studies/vidama-mediathek`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract raw material, tear down Vite tree, scaffold Next.js 16 (D-04, D-07)** — `86e05c7` (feat)
2. **Task 2: Wire route-based DE/EN i18n with hreflang and language switcher (I18N-01, D-09)** — `2b5d2cf` (feat)
3. **Task 3: Typed content model with bilingual Vidama case study end-to-end (CONT-01, D-06)** — `b401fc4` (feat)

## Files Created/Modified

See `key-files` frontmatter. Highlights:
- `content-collections.ts`, `content/shared/types.ts` — content model + shared contract
- `src/i18n/*`, `src/proxy.ts` — i18n routing + middleware
- `src/app/[locale]/*` — SSG locale routes + case-study page
- `src/lib/content.ts`, `src/lib/seo.ts` — typed accessors + hreflang helpers
- `extracted/` — staged old Vite content (D-04)

## Decisions Made
None beyond the plan — D-04/D-06/D-07/D-09 executed as specified (see `key-decisions`).

## Deviations from Plan
None — plan executed as written. (Close-out note: SUMMARY/STATE/ROADMAP tracking was reconciled retroactively; the implementation itself matched the plan and required no changes.)

## Issues Encountered
Bookkeeping-only: the plan's commits landed via a merged branch without the corresponding SUMMARY/STATE/ROADMAP updates. Resolved by verifying the built + running app and writing this SUMMARY. A follow-up quick task (260703-flk) had already fixed CI Node/pnpm and the Vercel framework preset on top of this work.

## User Setup Required
None — no external service configuration introduced by this plan. (Vercel/analytics/LHCI wiring is 01-02's scope.)

## Next Phase Readiness
- **Ready for Wave 2:** the shared type contract (`content/shared/types.ts`) and content pipeline are in place for 01-03 (structured content), and the deployable app builds green for 01-02 (deploy pipeline + LHCI budget + analytics).
- **Carry-in note:** React is pinned `~19.2.0` for the R3F-9 peer range (`<19.3`) — re-verify at the Phase-4 3D scaffold.

---
*Phase: 01-bilingual-content-foundation*
*Completed: 2026-07-02 (closed out 2026-07-03)*
