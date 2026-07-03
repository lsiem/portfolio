---
phase: 01-bilingual-content-foundation
plan: 03
subsystem: content
tags: [i18n, content, typescript, zod, next-intl, career, projects, skills, contact]

# Dependency graph
requires: [01-01]
provides:
  - "Structured bilingual v1 content as typed TS modules (career, projects, skills, contact) under content/de and content/en"
  - "Career timeline modeling the D-02 ITSC role arc (Systemadministrator/OpenShift -> Software Engineering -> Product Owner of an internal AI assistant) as a roles array"
  - "D-01-weighted project set: elia (flagship), vidama-mediathek (deep), openshift-platform (card) + 3 selected older cards"
  - "Domain-grouped skills with years + projectSlugs, no percent bars (CONT-05)"
  - "Complete UI message set (nav/common/home/career/projects/skills/contact/footer/accessibility) in DE and EN"
  - "Locale-keyed content accessors getCareer/getProjects/getSkillDomains/getContact in src/lib/content.ts"
  - "Home page rendering all four structured sections semantically per locale"
affects: [01-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "satisfies <Type>[] TS modules per locale — compiler is the DE/EN structured-parity check (D-06, I18N-02)"
    - "Locale-keyed static-import accessors (de/en record) in src/lib/content.ts — build-time only, SSG-safe"
    - "ELIA content restricted to the D-03 abstraction whitelist for a public repo"

key-files:
  created:
    - "content/de/career.ts, content/en/career.ts — 5 stations + careerIntro, ITSC roles array (D-02)"
    - "content/de/contact.ts, content/en/contact.ts — role-relevant contact facts only"
    - "content/de/projects.ts, content/en/projects.ts — 6 projects, D-01 weighting"
    - "content/de/skills.ts, content/en/skills.ts — 5 skill domains, years + projectSlugs"
  modified:
    - "messages/de.json, messages/en.json — full UI namespaces, dead keys dropped"
    - "src/lib/content.ts — getCareer/getProjects/getSkillDomains/getContact"
    - "src/app/[locale]/page.tsx — semantic career/projects/skills/contact sections"

key-decisions:
  - "Selected older project cards: disy-one, sport-event-controller, immobilienbaukasten (enterprise relevance + tech breadth); dropped ferrero-foto, jr-purtec, imke-folkerts (low signal); ewe-mediathek promoted to the vidama-mediathek deep case study"
  - "ITSC modeled as ONE career entry with a 3-role progression; the Software-Engineering middle role carries from: null (date unconfirmed in any source)"
  - "Contact role broadened to 'Software Engineer & Product Owner' per D-02 (was 'Full-Stack Software Entwickler')"

requirements-completed: [CONT-01, I18N-02]

# Metrics
duration: ~5min
completed: 2026-07-03
status: complete
---

# Phase 01 · Plan 03: Structured Bilingual Content Summary

**All structured v1 content — career, projects, skills, contact, and the full UI message set — now exists in German and English as typed modules against the plan-01-01 contract, rendering on the locale home pages and passing the content-parity gate.**

## Performance

- **Duration:** ~5 min (execution)
- **Tasks:** 2 completed
- **Files:** 8 created, 4 modified

## Accomplishments

- Authored the career timeline in both locales, modeling the D-02 ITSC role arc (Systemadministrator/OpenShift → Software Engineering → Product Owner of an internal AI assistant) as a single entry with a `roles` array — the stale flat ITSC entry is fixed.
- Delivered the D-01-weighted project set: ELIA (flagship), Vidama-Mediathek (deep, aligned with the existing case-study frontmatter), OpenShift-Plattform (net-new card), plus three selected older cards.
- Regrouped the skill inventory into 5 domains with years + real `projectSlugs`, dropping all percent/level bars (CONT-05) and icon coupling (presentation, Pitfall 6).
- Completed the UI message set (nav/common/home/career/projects/skills/contact/footer/accessibility) in DE and EN with identical key structure; dropped the dead `terminal`/`loading`/`typingRoles`/`flipHint` keys tied to the discarded UI.
- Added locale-keyed accessors to `src/lib/content.ts` and rendered every section semantically on the home page in both locales.

## Task Commits

1. **Task 1: Career timeline + contact, DE and EN (D-02, D-04, D-05)** — `07252b9` (feat)
2. **Task 2: Projects + skills + complete UI messages, rendered on the home page (D-01, D-03, D-05, CONT-05)** — `0788136` (feat)

## Decisions Made

### Selected older project cards (Claude's discretion, CONTEXT.md)
- **Kept as cards:** `disy-one` (Python digital-signage platform — monitoring + containerization breadth), `sport-event-controller` (real-time WebSocket orchestration — different tech surface), `immobilienbaukasten` (Java/Spring template builder — enterprise relevance).
- **Dropped:** `ferrero-foto` (marketing gimmick, low enterprise signal), `jr-purtec` (WordPress site, low technical signal), `imke-folkerts` (small client portal, redundant with the retained Java cards).
- **Promoted:** the old `ewe-mediathek` entry is represented by the `vidama-mediathek` deep case study (already scaffolded in plan 01-01), so it is not duplicated as a card.

### Assumed years-per-skill mapping
Estimated from the career dates (career start ~2021, ~5 years total; container platform since ITSC 2024; AI/agents since ~2024–2026):
- Java & Spring Boot 5 · Python (Flask/FastAPI) 4 · Vaadin 4 · TypeScript/JavaScript 5 · REST/WebSocket 5
- OpenShift & Kubernetes 2 · Docker 5 · Linux 5 · AWS & Azure 4
- PostgreSQL & MySQL 5 · MongoDB & Redis 3
- GitLab CI & Jenkins 5 · Prometheus & Grafana 3 · Ansible & shell 3
- Multi-agent architecture / MCP tool-calling / agent-framework orchestration 1 each

## Deviations from Plan

None for Rules 1–4. Two plan-permitted adjustments:
- The plan referenced `01-PATTERNS.md`, which does not exist in the phase directory; the D-03 whitelist in `01-CONTEXT.md` (the authoritative source the plan also cites) and `content/shared/types.ts` were sufficient. No schema widening was needed — the plan-01-01 contract already made `careerRoleSchema.from` nullable, so Task 1 required no changes to `content/shared/types.ts`.
- The `@content` alias implied by the plan does not exist in `tsconfig.json`; `src/lib/content.ts` imports the locale modules via relative paths (`../../content/...`) instead. No functional difference.

## Open Question for End-of-Phase Human Check

**ITSC Software-Engineering transition date is unconfirmed.** No source artifact records when the ITSC role moved from Systemadministrator into the Software-Engineering phase, so that middle role carries `from: null` (date-free) per the plan. The Product Owner role is dated `2026-04`. The user should confirm/correct: (a) the Software-Engineering start date, and (b) whether the Just Relate "Software Engineer" station (currently `to: null` / present) is still active alongside the ITSC Product Owner role.

## Verification

- `pnpm exec tsc --noEmit` → 0 (both locales satisfy the shared contract)
- `pnpm build` → green, 7 static pages (SSG) including `/de` and `/en`
- Live smoke test: `/de` renders ITSC, OpenShift, Werdegang, info@lsiem.de; `/en` renders Product Owner, Career, ELIA
- `content/de` and `content/en` file trees identical; message keys identical (32 each)
- projects: 6 entries, exactly 1 flagship (elia), 1 deep (vidama-mediathek), openshift-platform is a card
- every `projectSlugs` reference resolves to a real project slug; no percent/level bars in skills
- `node scripts/check-content-parity.ts` → PASS (parity OK; blocklist local-only, skipped in this run)

## Next Plan Readiness

Plan 01-04 (prose: case studies + about) can now write MDX against these structured slugs — the ELIA flagship slug exists and awaits its deep case study; the retroactive D-03 blocklist scan in 01-04 covers `content/` and `messages/`.

## Self-Check: PASSED

- content/de/career.ts — FOUND · content/en/career.ts — FOUND
- content/de/contact.ts — FOUND · content/en/contact.ts — FOUND
- content/de/projects.ts — FOUND · content/en/projects.ts — FOUND
- content/de/skills.ts — FOUND · content/en/skills.ts — FOUND
- Commit 07252b9 — FOUND · Commit 0788136 — FOUND

---
*Phase: 01-bilingual-content-foundation*
*Completed: 2026-07-03*
