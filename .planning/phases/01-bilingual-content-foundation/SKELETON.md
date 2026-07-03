# Walking Skeleton — Portfolio Neubau lsiem.de

**Phase:** 1
**Generated:** 2026-07-02

## Capability Proven End-to-End

A visitor can read a real project case study in German at `<vercel-preview-url>/de/case-studies/vidama-mediathek`, switch the language, and read the same case study in English at `/en/case-studies/vidama-mediathek` — served as fully prerendered (SSG) HTML from a Vercel preview deployment, with every deploy gated by a CI performance budget.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16.2.x, App Router, Turbopack default, full SSG via `generateStaticParams` | Fixes the discarded Vite SPA's structural flaw (blank-shell LCP, no localized routes); first-class on Vercel (mandated host). Locked by `.planning/research/STACK.md` |
| React | `~19.2.0` (tilde pin) | R3F 9 peer range `>=19 <19.3` needed in Phase 4 — pin now to avoid a breaking 19.3 install later |
| Data layer | Git-based typed content model — **no database by design**. Content Collections (`@content-collections/core` + `mdx` + `next`) for MDX prose with Zod-4-validated frontmatter; per-locale typed TS modules for structured data (D-06) | Single Source of Truth (CONT-01) that also feeds Phase 2 CV-PDF and v2 AI chat: generated output in `.content-collections/generated` is plain JS/JSON importable without React. Adapter verified Turbopack-safe from source (not a webpack plugin) |
| i18n | next-intl 4.13.x — `[locale]` segment, `localePrefix: 'always'`, `localeDetection: false`, default locale `de`, `/` → 307 `/de` (D-09), hreflang incl. `x-default` via Link header + `alternates.languages` | Route-based i18n = indexable bilingual pages (I18N-01); no browser-language negotiation per D-09 |
| Locale organization | Parallel locale folders `content/de/**` and `content/en/**` with identical structure; parity enforced by CI script + shared TS types (D-06, I18N-02) | The compiler checks structured-data parity; a ~40-line script checks MDX file parity and doubles as the local confidentiality blocklist gate (D-03) |
| Auth | None — public static site, no sessions, no user input at runtime | ASVS L1: V2/V3/V4 not applicable; V5 handled at build time by Zod |
| Deployment target | Vercel **preview deployments only** on the existing project; production branch and lsiem.de untouched until Phase 2 (D-08). Never `vercel --prod` | The old live site must keep serving lsiem.de until the recruiter site is complete |
| Performance gate | GitHub Actions + `@lhci/cli` against a local prod build: LCP ≤ 2500 ms, initial script bytes ≤ 150 KB, perf score ≥ 0.9 (TECH-07) | Deterministic PR gate; real-user field data comes from `@vercel/speed-insights` |
| Analytics | Vercel Web Analytics (cookieless, GDPR-friendly, D-10 / TECH-06) | Platform-integrated, no consent banner needed per Vercel privacy docs |
| Package manager | pnpm, committed `pnpm-lock.yaml`, installs restricted to the RESEARCH.md Package Legitimacy Audit set | Supply-chain mitigation (T-01-SC) |
| Directory layout | `content/{de,en}` + `content/shared/types.ts` at repo root (outside `src/`); `src/app/[locale]/…`; `src/i18n/{routing,navigation,request}.ts`; `src/proxy.ts` (Next 16 name — NOT `middleware.ts`); `content-collections.ts`, `lighthouserc.json`, `scripts/` at root | `content/` outside the app tree is the load-bearing boundary: every later consumer (overview mode, immersive mode, CV-PDF, AI chat) imports the same typed data |

## Stack Touched in Phase 1

- [x] Project scaffold (Next.js 16 via create-next-app: TS, Tailwind 4, App Router, src-dir, ESLint, pnpm)
- [x] Routing — `/de`, `/en`, `/{locale}/case-studies/[slug]`, `/{locale}/[slug]` (prose pages), root redirect `/` → `/de`
- [x] Data layer — real content read: Content Collections build → typed accessors in `src/lib/content.ts` → SSG pages (no DB by design; the content model IS the data layer, write = authoring commits)
- [x] UI — language switcher (real `<a>` navigation via next-intl `Link`) wired to the routed locale variants
- [x] Deployment — Vercel preview URL with CI performance budget green; documented local full-stack run: `pnpm build && pnpm start`

## Out of Scope (Deferred to Later Slices)

- Any visual design, layout system, dark mode, typography work — Phase 2/3 (Phase 1 renders semantic, unstyled/minimally styled HTML)
- Recruiter overview UI, timeline UI, case-study presentation — Phase 2 (content exists now, presentation later)
- CV-PDF generation — Phase 2 (content model output is already machine-readable for it)
- Domain switch lsiem.de → new site — Phase 2 (D-08)
- OG images, Person JSON-LD, per-page SEO beyond hreflang — Phase 2 (TECH-05)
- GSAP/Lenis/animation stack, 3D/WebGL — Phases 3/4
- AI chat, terminal easter egg — v1.x

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- Phase 2: Complete recruiter site (timeline, case-study pages, skills, CV-PDF, dark mode, SEO) live on lsiem.de — consumes the Phase 1 content model unchanged
- Phase 3: Design direction + scroll-storytelling immersive mode (GSAP + Lenis) — same routes, same content, new presentation layer
- Phase 4: Lazy, capability-gated signature 3D hero moment + launch verification on the production URL
