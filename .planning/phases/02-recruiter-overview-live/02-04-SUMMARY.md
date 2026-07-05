---
phase: 02-recruiter-overview-live
plan: 04
subsystem: seo
tags: [seo, opengraph, json-ld, next-og, ssg, next-intl]

# Dependency graph
requires:
  - phase: 02-recruiter-overview-live/02-01
    provides: "/[locale] overview page + content model (getContact, getCaseStudy)"
  - phase: 02-recruiter-overview-live/02-02
    provides: "geist npm package (raw ttf font bytes) installed as devDependency"
provides:
  - "openGraphMetadata() + personJsonLd() helpers in src/lib/seo.ts"
  - "Per-locale 1200x630 OG image via next/og (statically optimized)"
  - "Per-case-study OG image with title/summary from the content model"
  - "Server-rendered Person JSON-LD on the overview page"
  - "evals/seo.spec.ts asserting og:image/twitter:image + Person JSON-LD"
affects: [02-05, 02-06, 02-07, phase-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "opengraph-image.tsx file convention + next/og ImageResponse, self-hosted Geist ttf read via node:fs/promises from node_modules/geist/dist/fonts"
    - "generateStaticParams on the OG image route mirrors the sibling page.tsx's generateStaticParams so Next prerenders the image at build (SSG, not on-demand)"
    - "OG card color tokens are hardcoded hex literals duplicated from globals.css :root — Satori/ImageResponse cannot read CSS custom properties"
    - "openGraphMetadata()/twitter block spread into generateMetadata's return object; the opengraph-image.tsx file convention auto-emits the actual image URLs"

key-files:
  created:
    - src/app/[locale]/opengraph-image.tsx
    - src/app/[locale]/case-studies/[slug]/opengraph-image.tsx
    - evals/seo.spec.ts
    - .planning/phases/02-recruiter-overview-live/deferred-items.md
  modified:
    - src/lib/seo.ts
    - src/app/[locale]/page.tsx

key-decisions:
  - "openGraphMetadata()'s locale param is typed as plain string (page params are untyped strings), with the narrow (typeof routing.locales)[number] cast applied only internally where next-intl's getPathname requires it"
  - "Case-study OG card truncates title (70 chars) and summary (160 chars) to keep the fixed 630px canvas uncluttered regardless of future content length"
  - "OG image routes carry their own generateStaticParams (locale-only for the overview card, locale x slug for case studies) so next build statically optimizes them instead of falling back to on-demand dynamic rendering"

patterns-established:
  - "Any future opengraph-image.tsx under a dynamic segment must declare its own generateStaticParams mirroring the segment's page.tsx — without it, Next serves the route ƒ (dynamic) instead of ● (SSG) even with zero request-time APIs"

requirements-completed: [TECH-05]

coverage:
  - id: D1
    description: "openGraphMetadata() + personJsonLd() helpers added to src/lib/seo.ts, explicitly typed, siteMetadataBase/localeAlternates unchanged"
    requirement: TECH-05
    verification:
      - kind: unit
        ref: "pnpm exec tsc --noEmit -p tsconfig.json (seo.ts typechecks)"
        status: pass
    human_judgment: false
  - id: D2
    description: "generateMetadata emits openGraph/twitter textual fields; overview page renders server-side Person JSON-LD with sameAs = [GitHub, LinkedIn] from getContact(locale)"
    requirement: TECH-05
    verification:
      - kind: e2e
        ref: "evals/seo.spec.ts — 'emits openGraph textual metadata', 'emits Person JSON-LD with a non-empty sameAs array' (both locales)"
        status: pass
      - kind: e2e
        ref: "evals/home.spec.ts — full suite (22 tests) still passes after page.tsx changes"
        status: pass
    human_judgment: false
  - id: D3
    description: "Per-locale and per-case-study opengraph-image.tsx routes render a designed 1200x630 PNG via next/og, statically optimized at build with self-hosted Geist ttf, no runtime third-party fetch"
    requirement: TECH-05
    verification:
      - kind: e2e
        ref: "evals/seo.spec.ts — 'emits an og:image meta tag', 'emits a twitter:image meta tag' (both locales)"
        status: pass
      - kind: other
        ref: "pnpm build route table — /[locale]/opengraph-image and /[locale]/case-studies/[slug]/opengraph-image both listed ● (SSG), not ƒ (dynamic)"
        status: pass
      - kind: manual_procedural
        ref: "Read tool visual inspection of /de/opengraph-image and /de/case-studies/elia/opengraph-image PNG output (1200x630, Geist rendered, card composition legible)"
        status: pass
    human_judgment: true
    rationale: "Final visual polish of the OG card composition (typography scale, spacing, contrast against real social-preview rendering in Slack/Twitter/LinkedIn) is a design judgment call best confirmed by a human pasting a real share link, per the plan's own manual verification step."

# Metrics
duration: 10min
completed: 2026-07-05
status: complete
---

# Phase 2 Plan 4: OG images + Person JSON-LD Summary

**Per-locale and per-case-study 1200x630 OG cards via next/og (self-hosted Geist ttf, statically optimized, zero runtime fetch) plus server-rendered Person JSON-LD sourced from the typed content model**

## Performance

- **Duration:** 10 min
- **Started:** 2026-07-05T10:51:16Z
- **Completed:** 2026-07-05T11:01:30Z
- **Tasks:** 3
- **Files modified:** 6 (2 modified, 4 created)

## Accomplishments

- `src/lib/seo.ts` gained `openGraphMetadata()` (openGraph + twitter textual fields, no `images` key — the file convention owns those) and `personJsonLd()` (schema.org Person built from `ContactInfo`)
- The overview page's `generateMetadata` now spreads `openGraphMetadata(...)`, and the page body server-renders a Person JSON-LD `<script>` with `sameAs = [GitHub, LinkedIn]`, all sourced through `getContact(locale)` — never hardcoded
- `src/app/[locale]/opengraph-image.tsx`: a designed 1200x630 card (mono "Portfolio" eyebrow, Geist SemiBold name, muted role, accent hairline + locale indicator) rendered via `next/og` `ImageResponse`, fonts loaded from `node_modules/geist/dist/fonts` (~276KB total, well under the 500KB budget)
- `src/app/[locale]/case-studies/[slug]/opengraph-image.tsx`: sibling card titled from `getCaseStudy(locale, slug)`, falls back to the overview composition for an unknown slug, truncates long title/summary text
- Both OG routes carry their own `generateStaticParams` so `pnpm build` prerenders all locale × slug combinations as static PNGs (`●` in the route table) instead of rendering on demand
- `evals/seo.spec.ts` added: asserts `og:image`/`twitter:image` meta presence and a valid Person JSON-LD block with a non-empty `sameAs` array, per locale

## Task Commits

Each task was committed atomically:

1. **Task 1: seo.ts — openGraph/twitter builder + personJsonLd helper** - `da2d028` (feat)
2. **Task 2: Wire openGraph metadata + emit Person JSON-LD in the overview page** - `2eabd4a` (feat)
3. **Task 3: OG image routes (overview + per-case-study) via next/og** - `479da19` (feat)

_No TDD tasks in this plan — tdd_mode is off for this project._

## Files Created/Modified

- `src/lib/seo.ts` - Added `openGraphMetadata()` and `personJsonLd()` (+ their exported param/return types)
- `src/app/[locale]/page.tsx` - `generateMetadata` spreads `openGraphMetadata(...)`; page body emits Person JSON-LD `<script>`
- `src/app/[locale]/opengraph-image.tsx` - New: overview OG card (next/og, self-hosted Geist ttf)
- `src/app/[locale]/case-studies/[slug]/opengraph-image.tsx` - New: per-case-study OG card, same font/asset pipeline
- `evals/seo.spec.ts` - New: og:image/twitter:image meta + Person JSON-LD assertions, both locales
- `.planning/phases/02-recruiter-overview-live/deferred-items.md` - New: logs one out-of-scope build warning (see below)

## Decisions Made

- `openGraphMetadata()`'s `locale` param is typed as plain `string` (mirrors how page params arrive), with the cast to `(typeof routing.locales)[number]` applied only at the internal `getPathname()` call site — keeps the public helper signature simple for callers that already have a validated locale string.
- Case-study OG cards truncate `title` to 70 chars and `summary` to 160 chars before rendering. The two existing case studies (`elia`, `vidama-mediathek`) have summaries long enough to crowd the fixed 630px canvas untruncated; truncation keeps the card legible regardless of future case-study copy length.
- Both `opengraph-image.tsx` routes declare their own `generateStaticParams` (not inherited from the sibling `page.tsx`). Without it, Next serves these routes `ƒ` (on-demand dynamic) even though they use zero request-time APIs — declaring it explicitly gets `pnpm build` to prerender them `●` (SSG), matching the plan's "no runtime third-party fetch" / static-optimization requirement.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added `generateStaticParams` to both `opengraph-image.tsx` routes**
- **Found during:** Task 3 (OG image routes)
- **Issue:** The plan's code sketch (from RESEARCH §4) omitted `generateStaticParams`. Without it, `pnpm build` served both OG routes as `ƒ` (Dynamic) rather than `●` (SSG) — dynamic segments (`[locale]`, `[slug]`) can't be statically enumerated without it, which directly contradicts the plan's own acceptance criterion "`pnpm build` statically optimizes the OG routes."
- **Fix:** Added `generateStaticParams` returning `routing.locales.map((locale) => ({ locale }))` for the overview route, and the locale × slug cross product (mirroring `case-studies/[slug]/page.tsx`) for the case-study route.
- **Files modified:** `src/app/[locale]/opengraph-image.tsx`, `src/app/[locale]/case-studies/[slug]/opengraph-image.tsx`
- **Verification:** `pnpm build` route table shows both routes as `●` for all 6 combinations (2 locales × 1 overview + 2 locales × 2 case studies)
- **Committed in:** `479da19` (Task 3 commit)

**2. [Rule 1 - Bug] Narrowed `OpenGraphMetadataParams.locale` type to plain `string`**
- **Found during:** Task 2 (wiring `generateMetadata`)
- **Issue:** Task 1's initial `openGraphMetadata()` typed `locale` as `(typeof routing.locales)[number]`, but `page.tsx`'s `locale` comes from an untyped `Promise<{ locale: string }>` — passing it directly would have required an awkward cast at every call site (and an extra `routing` type import in `page.tsx`).
- **Fix:** Widened the param to `string`; the narrow union cast now happens once, internally, only where `next-intl`'s `getPathname()` requires it.
- **Files modified:** `src/lib/seo.ts`, `src/app/[locale]/page.tsx`
- **Verification:** `pnpm exec tsc --noEmit` clean; `pnpm build` succeeds
- **Committed in:** `2eabd4a` (Task 2 commit, alongside the page.tsx wiring)

**3. [Rule 3 - Blocking, out of scope] Reduced case-study OG card copy length**
- **Found during:** Task 3, manual visual verification
- **Issue:** The initial card composition rendered the full untruncated `caseStudy.summary` (up to ~350 chars for `elia`), producing a visually dense card where the summary nearly touched the bottom accent hairline.
- **Fix:** Added a `truncate()` helper capping title to 70 chars and summary to 160 chars with an ellipsis.
- **Files modified:** `src/app/[locale]/case-studies/[slug]/opengraph-image.tsx`
- **Verification:** Re-rendered PNG visually inspected (Read tool) — clean spacing, no crowding, still legible at 1200x630
- **Committed in:** `479da19` (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 bug)
**Impact on plan:** All three were necessary to actually meet the plan's own acceptance criteria (static optimization) and the UI-SPEC's implicit legibility bar. No scope creep — no files touched beyond the plan's declared `files_modified` plus one deferred-items log.

## Issues Encountered

- **Local eval environment: `next dev`'s file watcher hit `EMFILE: too many open files`** when Playwright's `webServer` tried to start `pnpm dev` (macOS soft fd-limit interaction with Turbopack's watcher over the pnpm `node_modules/.pnpm` tree — unrelated to any code in this plan). Worked around by building (`pnpm build`) and running the production server (`pnpm start`) directly, then invoking `pnpm exec playwright test` against it (Playwright's `reuseExistingServer` picked it up). All 52 evals across the whole suite (home, case-studies, i18n, theme, seo) passed against the production build. This is a local-shell/tooling quirk, not a project or plan issue — `playwright.config.ts`'s `webServer: { command: "pnpm dev" }` is unchanged and out of this plan's scope.
- **Stale background dev server masked the first eval run.** After the Task 3 build, a leftover `next-server` process from an earlier (pre-Task-3) build was still bound to port 3000, so the first `seo.spec.ts` run hit a build that had no OG routes yet (missing `og:image`/`twitter:image` meta, 404 on the image URL). Killed the stale process and restarted against the current build; all tests then passed. No code changes were needed — this was purely a local process-management issue on my end, logged here for transparency, not as a plan deviation.

## User Setup Required

None - no external service configuration required. Font assets are read from an existing devDependency (`geist`, installed in Plan 02); no new environment variables or secrets.

## Next Phase Readiness

- TECH-05 fully satisfied: shared links to `/de`, `/en`, and both case-study pages render designed OG previews; crawlers see server-rendered Person JSON-LD.
- Zero-runtime-third-party posture preserved — both OG routes are pure build-time reads of local `node_modules` font bytes plus the typed content model, statically optimized (confirmed via the `pnpm build` route table).
- One out-of-scope, non-blocking build warning logged to `deferred-items.md` (root `/_not-found` route lacks `metadataBase` in its metadata chain) — cosmetic, does not affect any locale-scoped route this plan touches.
- No blockers for 02-05/02-06/02-07.

---
*Phase: 02-recruiter-overview-live*
*Completed: 2026-07-05*

## Self-Check: PASSED

All created/modified files verified present on disk; all 4 commits (`da2d028`, `2eabd4a`, `479da19`, `808d1a2`) verified present in git history.
