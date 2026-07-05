---
phase: 02-recruiter-overview-live
plan: 05
subsystem: ui
tags: [github, heatmap, build-time-fetch, isr, dsgvo, accessibility, nextjs]

# Dependency graph
requires:
  - phase: 02-recruiter-overview-live/02-01
    provides: "/[locale] overview page + content model (getContact, section shell pattern)"
  - phase: 02-recruiter-overview-live/02-03
    provides: "attribute-driven dark-mode tokens (--foreground/--border opacity ramp reads correctly in both themes)"
  - phase: 02-recruiter-overview-live/02-04
    provides: "openGraphMetadata/personJsonLd wiring already present in page.tsx (no merge conflict on shared edits)"
provides:
  - "src/lib/github.ts — server-only getContributionCalendar(login) build-time GraphQL fetch with daily ISR"
  - "githubLoginFromUrl() helper deriving the GitHub login from a profile URL"
  - "src/components/github-heatmap.tsx — RSC contribution grid with monochrome foreground-opacity ramp + fallback line"
  - "#activity section mounted in the overview between About and Contact"
  - "messages/{de,en}.json activity namespace (title, ariaSummary, unavailable)"
  - "evals/activity.spec.ts — token-agnostic grid-or-fallback assertions"
affects: [02-06-build-verification, 02-07-cutover]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server-only build-time fetch (import \"server-only\" + fetch with next.revalidate) that resolves to null on any failure instead of throwing — matches the codebase's existing 'degrade to fallback line' contract"
    - "Monochrome foreground-opacity ramp (bg-border -> bg-foreground/20 -> /40 -> /70 -> bg-foreground) for data visualization, keeping the reserved accent color out of the heatmap per UI-SPEC"

key-files:
  created:
    - src/lib/github.ts
    - src/components/github-heatmap.tsx
    - evals/activity.spec.ts
  modified:
    - src/app/[locale]/page.tsx
    - messages/de.json
    - messages/en.json

key-decisions:
  - "GitHubHeatmap takes only { ariaSummary, unavailable } as labels — the section heading (activity.title) is rendered by the page's own <h2>, mirroring how every other section (about, career, etc.) renders its own mono-eyebrow heading outside the child component"
  - "Grid uses role=\"img\" + aria-label (not role=\"table\"/\"grid\") — the heatmap is a non-interactive visual summary; a visually-hidden <span> carries the numeric total, satisfying the 'convey meaning without hover' requirement without inventing a full ARIA grid pattern"
  - "Intensity buckets use fixed thresholds (0 / <3 / <6 / <9 / >=9) per RESEARCH §2's suggested fallback, rather than computing thresholds from the max daily count — simpler, deterministic, and matches typical contribution-graph conventions"
  - "Activity section placed between About and Contact (its own section, not nested inside Contact) — reads cleanest with the existing section-shell pattern and keeps the fallback line from crowding the contact block"

requirements-completed: [TECH-08]

coverage:
  - id: D1
    description: "A visitor sees a monochrome GitHub contribution heatmap (last ~12 months) as proof of active development"
    requirement: TECH-08
    verification:
      - kind: e2e
        ref: "evals/activity.spec.ts#renders the #activity section with its heading"
        status: pass
      - kind: e2e
        ref: "evals/activity.spec.ts#renders either the contribution grid or the localized fallback"
        status: pass
    human_judgment: false
  - id: D2
    description: "Contribution data is fetched at build time with daily ISR (revalidate 86400); the shipped page makes no runtime call to GitHub"
    requirement: TECH-08
    verification:
      - kind: unit
        ref: "node -e guard script asserting src/lib/github.ts contains next.revalidate: 86400 and no NEXT_PUBLIC_ prefix"
        status: pass
      - kind: other
        ref: "pnpm build route table — /[locale] remains ● (SSG) with GITHUB_TOKEN unset (null-token path never issues a fetch)"
        status: pass
      - kind: other
        ref: "grep -rl GITHUB_TOKEN .next/static (empty result — token never reaches the client bundle)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The read-only PAT lives only in a server-only env var, never NEXT_PUBLIC_, never committed"
    requirement: TECH-08
    verification:
      - kind: unit
        ref: "src/lib/github.ts starts with import \"server-only\"; process.env.GITHUB_TOKEN read (unprefixed)"
        status: pass
    human_judgment: false
  - id: D4
    description: "If the token is absent or the fetch fails, the section degrades to a static localized fallback line — never a broken grid or a runtime retry"
    requirement: TECH-08
    verification:
      - kind: e2e
        ref: "evals/activity.spec.ts (run against this build with GITHUB_TOKEN unset — fallback path exercised for both locales)"
        status: pass
    human_judgment: false
  - id: D5
    description: "The heatmap is accessible (grid aria-label + visually-hidden total) and uses a foreground-opacity ramp, not the accent color"
    requirement: TECH-08
    verification:
      - kind: unit
        ref: "node -e guard script asserting github-heatmap.tsx has no 'use client' directive and contains aria-label/role="
        status: pass
    human_judgment: true
    rationale: "Automated checks confirm the a11y attributes and the absence of the accent class are present in source; whether the opacity ramp actually reads as clearly graduated and is legible in both light and dark themes (with real contribution data once GITHUB_TOKEN is set) is a visual judgment the plan's own verification step calls out as manual."

# Metrics
duration: ~20min
completed: 2026-07-05
status: complete
---

# Phase 2 Plan 5: GitHub Activity Heatmap Summary

**Build-time-only GitHub contribution heatmap (`src/lib/github.ts` + `GitHubHeatmap` RSC) fetched via authenticated GraphQL with daily ISR (`revalidate: 86400`), rendered as a monochrome foreground-opacity grid or a graceful fallback line — the shipped page never calls GitHub at runtime.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-07-05T13:04:00Z (approx, per commit timestamps)
- **Completed:** 2026-07-05T13:09:14Z
- **Tasks:** 3
- **Files modified:** 6 (3 created, 3 modified)

## Accomplishments

- `src/lib/github.ts`: `import "server-only"` guard + `getContributionCalendar(login)` — POSTs the RESEARCH §2 GraphQL query to `api.github.com/graphql` with `next: { revalidate: 86400, tags: ["github-contributions"] }` (daily ISR); missing `GITHUB_TOKEN`, non-OK responses, and thrown errors all resolve to `null` (never throw into the page); `githubLoginFromUrl()` derives the login from a profile URL so the caller never hardcodes it
- `src/components/github-heatmap.tsx`: Server Component rendering a week x day grid with a 5-step monochrome `--foreground`-opacity ramp (`bg-border` → `/20` → `/40` → `/70` → `bg-foreground`, accent never used), `role="img"` + `aria-label` + a visually-hidden total, fixed `11px` cells (no CLS); renders ONLY the localized fallback line when data is `null`
- `messages/de.json` / `messages/en.json` gained the `activity.{title,ariaSummary,unavailable}` namespace per the UI-SPEC Copywriting Contract
- `src/app/[locale]/page.tsx`: derives the login from `getContact(locale).github`, `await`s `getContributionCalendar` at render time, and mounts a new `#activity` section (mono-eyebrow `<h2>` + `<GitHubHeatmap>`) between About and Contact
- `evals/activity.spec.ts`: token-agnostic per-locale assertions — the `#activity` section and its heading are visible, and either the grid (`[role="img"]`) or the fallback paragraph is visible; verified passing with `GITHUB_TOKEN` unset (fallback path exercised) for both locales
- `pnpm build` confirms `/[locale]` remains `●` (SSG) even with the new build-time fetch (the null-token early return means no network call happens, so the route stays statically prerendered); the full 56-test Playwright suite (all prior evals + the new activity evals) passes

## Task Commits

Each task was committed atomically:

1. **Task 1: server-only getContributionCalendar build-time fetch** - `e43b110` (feat)
2. **Task 2: GitHubHeatmap RSC — monochrome grid, a11y, fallback** - `aed6136` (feat)
3. **Task 3: Mount the Activity section in the overview + activity eval** - `b6711a0` (feat)

_No TDD tasks in this plan — tdd_mode is off for this project._

**Plan metadata:** committed together with this SUMMARY (see final commit in this plan's history)

## Files Created/Modified

- `src/lib/github.ts` - server-only GraphQL contribution-calendar fetch + login-from-URL helper
- `src/components/github-heatmap.tsx` - RSC grid (monochrome ramp, a11y) + fallback line
- `src/app/[locale]/page.tsx` - `#activity` section mount, login derivation, awaited fetch
- `messages/de.json` / `messages/en.json` - `activity.{title,ariaSummary,unavailable}`
- `evals/activity.spec.ts` - grid-or-fallback assertions, both locales

## Decisions Made

- `GitHubHeatmap` receives only `{ ariaSummary, unavailable }` as labels — the section `<h2>` (heading) is rendered by the page itself, mirroring the existing pattern for every other section (career, projects, skills, about)
- Grid uses `role="img"` rather than a full ARIA `table`/`grid` role tree — the heatmap has no interactive cells, so a single labeled image-role summary plus a visually-hidden total text satisfies "convey meaning without hover" without inventing extra ARIA machinery the individual cells don't need
- Fixed intensity-bucket thresholds (`0 / <3 / <6 / <9 / >=9`) were used instead of computing thresholds from the max daily count in the fetched data — simpler, deterministic, and matches the RESEARCH §2 suggested fallback
- The Activity section is its own `<section id="activity">` between About and Contact (not nested inside Contact) — keeps the contact block uncluttered and reuses the exact section-shell pattern already established

## Deviations from Plan

None - plan executed exactly as written. All three tasks, their `<read_first>` files, `<action>` specs, and `<verify>`/`<acceptance_criteria>` blocks were followed as specified; the only interpretive choice (label prop shape, `role="img"` vs `role="table"`) fell within the plan's "Claude's discretion" latitude for the component's exact rendering (RESEARCH §2 specifies the ramp/thresholds/a11y contract but not a literal ARIA role, and the UI-SPEC's requirement — "grid role/aria-label + visually-hidden total, conveys meaning without hover" — is satisfied by the implementation).

## Issues Encountered

- The local eval environment previously hit `EMFILE: too many open files, watch` when Playwright's `webServer` tries to start `pnpm dev` (documented in 02-01/02-04 summaries as a sandboxed-shell/Turbopack-watcher interaction unrelated to any code in this plan). Worked around identically: ran `pnpm build && pnpm start` directly and let Playwright's `reuseExistingServer` attach to the already-running production server. `playwright.config.ts` was not modified.

## User Setup Required

**External service requires manual configuration — GITHUB_TOKEN.** This plan's frontmatter carries a `user_setup` block:

- Generate a read-only GitHub Personal Access Token (`read:user` scope, classic PAT or fine-grained equivalent) for the `lsiem` account: GitHub → Settings → Developer settings → Personal access tokens.
- Add it as `GITHUB_TOKEN` (unprefixed, server-only) to Vercel → Project → Settings → Environment Variables (all environments, but **Production is the blocking one**), and to local `.env.local` for local verification.
- **Blocking for real data on first live render:** because the fetch is cached with `revalidate: 86400`, the FIRST production build after `GITHUB_TOKEN` is set is what bakes the grid. If the token is added AFTER a token-less production build ships, the live site keeps the fallback line until the next build/revalidation. Plan 06 (build verification) and Plan 07 (cutover) carry this as an explicit pre-cutover gate — this plan does not block on it; the section degrades gracefully in the meantime.

## Next Phase Readiness

- TECH-08 satisfied via the build-time/ISR fetch pattern; the DSGVO zero-runtime-third-party constraint holds — confirmed no `GITHUB_TOKEN` reference in `.next/static` and the `/[locale]` route stays statically prerendered.
- The Activity section renders the graceful fallback line in this environment (no `GITHUB_TOKEN` configured locally or in this build) — this is expected, not a bug, per the plan's own "Pitfalls" note (RESEARCH §2).
- Manual verification still outstanding (owner/verifier, not blocking commit): once `GITHUB_TOKEN` is set, visually confirm the grid's opacity ramp reads clearly in both light and dark themes, and confirm via a browser network tab that no request to `api.github.com` fires on the shipped page. Both are captured as the `human_judgment: true` D5 coverage entry above.
- No blockers for 02-06 (build verification) or 02-07 (cutover).

## Self-Check: PASSED

All key files confirmed present on disk (`src/lib/github.ts`, `src/components/github-heatmap.tsx`, `src/app/[locale]/page.tsx`, `messages/de.json`, `messages/en.json`, `evals/activity.spec.ts`). All three task commits (`e43b110`, `aed6136`, `b6711a0`) confirmed present in `git log`. All plan `<acceptance_criteria>` re-verified: the `github.ts` guard script, the `github-heatmap.tsx` a11y/RSC guard script, `pnpm lint` (clean, pre-existing warnings only), `pnpm exec tsc --noEmit` (clean), `pnpm build` (succeeds, `/[locale]` stays `●`), and `pnpm exec playwright test evals/activity.spec.ts --project=chromium` (4/4 passing) plus the full suite (56/56 passing) all pass.

---
*Phase: 02-recruiter-overview-live*
*Completed: 2026-07-05*
