---
phase: 01-bilingual-content-foundation
verified: 2026-07-03T17:10:00Z
status: human_needed
score: 4/4 must-haves verified
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Confirm the real Impressum postal address before the Phase-2 domain switch"
    expected: "The placeholder '[ADRESSE — vor dem Launch ergänzen]' / '[ADDRESS — to be added before launch]' in content/{de,en}/pages/impressum.mdx is replaced with a real, contactable postal address"
    why_human: "Legal/content decision — no address may be invented; this is explicitly flagged by the executor as a Phase-2-launch blocker, not a Phase-1 code defect. Confirmed present as a clearly-marked placeholder, not silently missing."
  - test: "Confirm the ITSC Software-Engineering role transition date"
    expected: "content/{de,en}/career.ts 'Software Engineering' role's from date is set to a real value (currently from: null, unconfirmed in any source), and confirm whether the Just Relate 'Software Engineer' station is still concurrently active"
    why_human: "Factual/biographical detail only the site owner can confirm — not discoverable from any repository source"
  - test: "Read both ELIA case-study versions (DE + EN) and the deep Vidama case study in full on the preview URL"
    expected: "Abstraction level (D-03), Product-Owner-perspective narrative (D-02), and flagship-vs-deep depth differentiation (D-01) feel correct to the site owner"
    why_human: "Subjective content-quality and narrative-tone judgment — not mechanically verifiable"
  - test: "Open the Vercel dashboard (project 'portfolio') -> Web Analytics and Speed Insights after visiting the preview URL a few times"
    expected: "Page-view / field-performance data appears (was reporting 'hasData: false' as of 01-02's completion, before traffic existed)"
    why_human: "Requires real visitor traffic and a logged-in Vercel dashboard view — not verifiable from the codebase or an anonymous HTTP request"
  - test: "Decide whether to reconcile ROADMAP/CONTEXT decision D-08 now that lsiem.de already serves an interim Next.js site (via a user-merged PR outside this GSD workflow)"
    expected: "Either amend D-08 to reflect that lsiem.de may serve an interim minimal version ahead of the full Phase-2 Recruiter site, or explicitly reaffirm the original plan"
    why_human: "Decision-log reconciliation flagged by two separate executors (01-02 and 01-04 SUMMARY) as a change of circumstance outside any plan's control — requires a human decision, not a code fix"
---

# Phase 1: Bilingual Content Foundation Verification Report

**Phase Goal:** Sämtliche Portfolio-Inhalte existieren fertig geschrieben und strukturiert in Deutsch und Englisch als Single Source of Truth — und rendern über eine deployte, performance-überwachte Foundation auf lsiem.de
**Verified:** 2026-07-03T17:10:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | All v1 content (career, 5–7 projects incl. 2–3 deep case studies, skills, about, contact) exists complete in DE AND EN in the typed content model — a reviewer can read each case study in both languages | ✓ VERIFIED | `pnpm build` → 15 static pages, all SSG. `content/de` and `content/en` file trees are byte-identical (`diff` empty). 6 projects (`elia`, `vidama-mediathek`, `openshift-platform`, `disy-one`, `sport-event-controller`, `immobilienbaukasten`) — within 5–7. Exactly 2 deep case studies (`elia`: flagship, `vidama-mediathek`: deep) — within 2–3. Both ELIA (30–31 KB rendered HTML per locale) and Vidama-Mediathek render fully at `/{de,en}/case-studies/{elia,vidama-mediathek}` — 200 on both the live preview and a local `next start`. Skills grouped by domain with years + `projectSlugs`, no percent bars (grep confirms zero `percent`/level-bar patterns). Contact (`info@lsiem.de`) renders on both locale home pages. |
| 2 | A visitor can see the same content per locale at /de and /en and switch language (route-based, hreflang incl. x-default set) | ✓ VERIFIED | `/` → 307 → `/de` (default locale, D-09). All 12 content URLs return 200 on the live preview (`https://portfolio-eo2r6l7e3-lsiems-projects.vercel.app`): `/de`, `/en`, both case studies, `/about`, `/impressum`, `/datenschutz` per locale. Unknown slug `/de/bogus` → 404 (`dynamicParams=false`). hreflang `de`/`en`/`x-default` present in both the `Link` response header and the HTML `<link rel="alternate" hrefLang=...>` head tags. `src/components/locale-switcher.tsx` is a real `<Link>` (full navigation, not a client-side string swap) to the same path in the other locale. Per **decision D-08** (documented in 01-CONTEXT.md *before* execution), this criterion is verified against the Vercel deployment URL rather than the literal `lsiem.de` domain — the domain switch is explicitly deferred to Phase 2. |
| 3 | Every deploy to lsiem.de runs through a pipeline that fails on exceeded performance budget (LCP, initial JS) | ✓ VERIFIED (scoped per D-08) | `.github/workflows/ci.yml` runs `check:content -> build -> lhci autorun` on every push. `lighthouserc.json` actively asserts `largest-contentful-paint <= 3000ms`, `resource-summary:script:size <= 184643 bytes`, `categories:performance >= 0.9` against a local `pnpm start` server (not the ephemeral preview URL — deterministic per plan). The gate is proven **live**, not theoretical: during 01-02 execution the budget was exceeded twice (framework JS baseline over the initial 150 KB assumption; LCP lab variance on GH Actions shared runners) and the assertions genuinely failed CI until the budgets were adjusted (never removed). Final CI run (28673681988, full content volume) is green. See "Anti-Patterns / Notes" below for one nuance (branch-protection gap) worth flagging, not blocking. |
| 4 | Site owner sees visitor counts in cookieless, GDPR-friendly analytics | ✓ VERIFIED (mechanism); field data ⏳ human check | `<Analytics/>` and `<SpeedInsights/>` from `@vercel/analytics/next` / `@vercel/speed-insights/next` are mounted in `src/app/[locale]/layout.tsx`. On the live preview, `/_vercel/insights/script.js` returns 200 (real Vercel script, not a stub). Locally the same path 404s because the script is injected client-side by the hydrated component (documented, expected Next.js behavior — not a bug). Datenschutzerklärung (both locales) documents the cookieless mechanism (24h hash discard, no consent banner). **Whether real visitor data actually appears in the Vercel dashboard requires a human to check post-traffic** — flagged by the executor and carried into Human Verification below. |

**Score:** 4/4 truths verified (0 present-but-behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `content-collections.ts` | `caseStudies` + `pages` collections, Zod frontmatter | ✓ VERIFIED | Exists, both collections registered, build compiles 2 collections / 10 documents |
| `content/shared/types.ts` | Shared Zod schemas + TS types | ✓ VERIFIED | Exists, `career.ts`/`projects.ts`/`skills.ts` `satisfies` against it in both locales |
| `src/i18n/routing.ts`, `src/proxy.ts` | next-intl routing + middleware | ✓ VERIFIED | Present; `/` → 307 → `/de` confirmed live |
| `src/app/[locale]/layout.tsx` | generateStaticParams + Analytics/SpeedInsights | ✓ VERIFIED | Present; both analytics components mounted (grep-confirmed) |
| `content/{de,en}/case-studies/{vidama-mediathek,elia}.mdx` | Bilingual case studies | ✓ VERIFIED | All 4 files exist, 90–112 lines each, non-stub content, 200 on live preview |
| `content/{de,en}/pages/{about,impressum,datenschutz}.mdx` | Bilingual prose pages | ✓ VERIFIED | All 6 files exist, render as SSG at `/[locale]/[slug]`, 200 on live preview |
| `content/{de,en}/{career,projects,skills,contact}.ts` | Structured bilingual content | ✓ VERIFIED | All 8 files exist, render on locale home pages, DE/EN trees identical |
| `.planning/phases/01-bilingual-content-foundation/extracted/` | Staged old raw content (D-04) | ✓ VERIFIED | Present with 10 staged files |
| `scripts/check-content-parity.ts` | DE/EN parity + confidentiality gate | ✓ VERIFIED | Exists, runs, exits 0 against real content, prebuild-wired |
| `lighthouserc.json`, `.github/workflows/ci.yml` | CI performance budget pipeline | ✓ VERIFIED | Both exist, active assertions, wired `check:content -> build -> lhci autorun` |
| `src/app/[locale]/[slug]/page.tsx` | SSG prose-page route, `dynamicParams=false` | ✓ VERIFIED | Present; unknown slug 404-confirmed live |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `src/app/[locale]/case-studies/[slug]/page.tsx` | `content-collections.ts` | `src/lib/content.ts` typed accessors | ✓ WIRED | `getCaseStudies`/`getCaseStudy` consumed, not raw import |
| `src/proxy.ts` | `src/i18n/routing.ts` | `createMiddleware(routing)` | ✓ WIRED | Confirmed via live redirect + locale cookie behavior |
| `next.config.ts` | `content-collections.ts` | `withContentCollections` outermost plugin | ✓ WIRED | Build log shows "Starting content-collections" before Next.js compile |
| `.github/workflows/ci.yml` | `scripts/check-content-parity.ts` | `pnpm check:content` prebuild step | ✓ WIRED | Confirmed in workflow file and `package.json` prebuild hook |
| `.github/workflows/ci.yml` | `lighthouserc.json` | `npx lhci autorun` | ✓ WIRED | Confirmed in workflow; CI run 28673681988 green |
| `src/app/[locale]/layout.tsx` | `@vercel/analytics`, `@vercel/speed-insights` | Components mounted in body | ✓ WIRED | Grep-confirmed imports + JSX usage; live script 200 on preview |
| `src/app/[locale]/page.tsx` | `content/{de,en}/career.ts` etc. | `src/lib/content.ts` locale-keyed accessors | ✓ WIRED | Career/projects/skills/contact all render on both locale home pages |
| `src/components/locale-switcher.tsx` | `src/i18n/navigation.ts` | `Link`/`usePathname` from next-intl navigation | ✓ WIRED | Real anchor navigation confirmed (not client-side text swap) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Root redirects to default locale | `curl -sI localhost:3199/` | `307` → `location: /de` | ✓ PASS |
| Unknown slug 404s (dynamicParams=false) | `curl -o /dev/null -w "%{http_code}" preview/de/bogus` | `404` | ✓ PASS |
| hreflang set complete (de/en/x-default) | `curl -sI preview/de \| grep -i link:` | all 3 alternates present | ✓ PASS |
| DE/EN content trees identical | `diff <(find content/de) <(find content/en)` | empty diff | ✓ PASS |
| Confidentiality blocklist scan | `node scripts/check-content-parity.ts` | `[blocklist] OK — no forbidden terms found` (36 terms) | ✓ PASS |
| Production build (full content, all locales) | `pnpm build` | 15/15 static pages generated | ✓ PASS |
| Analytics component mounted + reachable | grep + `curl` `/_vercel/insights/script.js` on preview | import present; live 200 | ✓ PASS |
| No stub/debt markers in phase-authored content | `grep -rniE "TBD|FIXME|XXX|TODO|HACK|PLACEHOLDER|coming soon"` over `content/`, `messages/`, `src/` | 0 hits (the Impressum address uses a distinct, clearly-labeled bracket marker, separately confirmed and flagged) | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| CONT-01 | 01-01, 01-03, 01-04 | Git-based DE/EN content model as single source of truth | ✓ SATISFIED | Content Collections + typed TS modules across all 4 plans, parity-gated |
| I18N-01 | 01-01 | Route-based DE/EN i18n with switcher, hreflang, per-locale SEO | ✓ SATISFIED | `/de`, `/en`, switcher, hreflang all verified live |
| I18N-02 | 01-01, 01-02, 01-03, 01-04 | All content incl. case studies fully bilingual | ✓ SATISFIED | `check:content` parity gate passes; identical file trees |
| TECH-06 | 01-02 | Cookieless GDPR-friendly analytics visible to site owner | ✓ SATISFIED (mechanism); field data is a human-check item | Analytics/SpeedInsights mounted and live; dashboard data needs a human to confirm post-traffic |
| TECH-07 | 01-02 | Live on lsiem.de (Vercel), CI-checked performance budget | ✓ SATISFIED (scoped per D-08) | CI pipeline active and proven to fail on real budget violations; literal `lsiem.de` domain wiring is explicitly Phase-2 scope per D-08 |

**No orphaned requirements** — all 5 phase requirement IDs (CONT-01, I18N-01, I18N-02, TECH-06, TECH-07) are declared across the 4 plans and match REQUIREMENTS.md's Phase 1 traceability row exactly.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `content/{de,en}/pages/impressum.mdx` | 15/24 (DE), 16/25 (EN) | `[ADRESSE — vor dem Launch ergänzen]` / `[ADDRESS — to be added before launch]` | ℹ️ Info (explicitly flagged, referenced follow-up) | Legal-content placeholder, not a code defect — no address was invented, flagged as a Phase-2-launch blocker by the executor. Not a debt marker requiring a tracked issue reference per the debt-marker gate, since it is a content/legal decision item outside code, already surfaced to the user in the SUMMARY. |
| `content/{de,en}/career.ts` | 38 | `from: null` on the ITSC "Software Engineering" role | ℹ️ Info | Factual date genuinely unconfirmed in any source — carried forward from 01-03, explicitly flagged for human confirmation, not a code gap. |
| `.github` / Vercel project | n/a | `main` branch has no branch-protection rule requiring the CI check; Vercel's git integration auto-deploys pushes to `main` independent of GitHub Actions status | ℹ️ Info (not scored as a gap) | A future budget-violating commit merged directly to `main` would still auto-deploy to production even though CI would go red — the CI failure does not currently *block* a production deploy. This is consistent with D-08 (domain wiring is explicitly Phase-2 scope; this codebase is not yet on `main` at all), and the PLAN 01-02 must-have truth is scoped as "CI fails any push exceeding the budget" (proven), not "production deploy is blocked." Worth revisiting when Phase 2 wires the domain and merges this codebase to `main`. |

No blocking anti-patterns found. No unresolved `TBD`/`FIXME`/`XXX` debt markers exist in phase-authored code or content.

### Confidentiality Verification (D-03)

- Local-only blocklist (`.planning/phases/01-bilingual-content-foundation/reference/blocklist.txt`, 36 terms) confirmed **git-ignored and untracked**: `git status --porcelain --ignored=matching` reports `!! .planning/phases/01-bilingual-content-foundation/reference/` (whole directory ignored, including the PDF/txt source material).
- `node scripts/check-content-parity.ts` run fresh during this verification: `[blocklist] OK — no forbidden terms found` against the real `content/` + `messages/` trees.
- No blocklist term is echoed anywhere in this VERIFICATION.md, per the task's confidentiality instruction.

### Git / Branch State (informational)

All Phase 1 commits (01-01 through 01-04, including the 01-04 completion commit `c7ee602`) live on `fix/interim-portfolio-styling`. 15 of 16 phase-relevant commits are pushed to `origin/fix/interim-portfolio-styling`; none are ancestors of `origin/main`. This matches every SUMMARY's own D-08 self-check ("commits confirmed absent from origin/main") and the phase's explicit deferral of the domain/production merge to Phase 2. Not treated as a gap.

## Deferred Items

None — no gap was found that maps to explicit Phase 2/3/4 roadmap coverage beyond what D-08 already anticipated (domain wiring, which is Phase 2's "Recruiter Overview Live" scope).

## Human Verification Required

See frontmatter `human_verification` for the structured list. Summary:

1. **Impressum address** — replace the marked placeholder with a real postal address before the Phase-2 domain switch (§5 DDG requirement).
2. **ITSC transition date** — confirm the unconfirmed `from: null` date and the Just Relate role's concurrency.
3. **Content-quality read** — a subjective pass over ELIA (DE+EN) and the deep Vidama case study for abstraction level, PO-perspective narrative, and depth differentiation.
4. **Analytics field data** — confirm real visitor data appears in the Vercel dashboard after traffic.
5. **D-08 reconciliation** — decide how to formally amend the D-08 decision now that `lsiem.de` already serves an interim Next.js site via a user-merged PR outside this workflow (not a defect of any GSD plan — flagged by two independent executors as a changed circumstance).

## Gaps Summary

No gaps found. All 4 roadmap success criteria are observably true against the codebase and the live Vercel preview deployment (verified independently in this session, not taken from SUMMARY claims): the bilingual typed content model is complete and parity-gated, the site renders and locale-switches correctly with full hreflang, the CI performance-budget pipeline is proven active (it has already caught and forced two real budget adjustments), and cookieless analytics is wired and live. All items requiring further attention are either (a) explicit content/legal/factual decisions correctly flagged by the executors as needing a human — not code defects — or (b) one informational architecture nuance (branch-protection vs. CI status) that does not block Phase 1's own success criteria under the project's own D-08 scoping decision.

---
*Verified: 2026-07-03T17:10:00Z*
*Verifier: Claude (gsd-verifier)*
