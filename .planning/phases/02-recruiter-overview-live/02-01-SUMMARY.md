---
phase: 02-recruiter-overview-live
plan: 01
subsystem: ui
tags: [nextjs, next-intl, tailwind, accessibility, content-model, playwright]

requires:
  - phase: 01-bilingual-content-foundation
    provides: content model (content/{de,en}/*, content/shared/types.ts), getContact/getCareer/getProjects/getSkillDomains/getPage loaders, existing interim /[locale] overview
provides:
  - "ContactInfo.valueProp content-model field (SSOT for hero + Plan 02 CV)"
  - "Hero value-prop paragraph rendered from getContact(locale).valueProp, static SSR"
  - "#about section sourced from getPage(locale,\"about\")?.description, text-first, links to /about"
  - "Persistent header Contact affordance (href=\"#contact\") in the sticky header cluster"
  - "CV download button in the contact block (bg-accent CTA, download attr, format-bearing aria-label)"
  - "Global :focus-visible ring + reduced-motion-gated scroll-behavior"
  - "formatMonth malformed-date guard (fixes null-dated ITSC role rendering)"
  - "evals/home.spec.ts RED-then-GREEN assertions proving the above"
affects: [02-02-cv-pdf, 02-06-build-verification, 02-07-cutover]

tech-stack:
  added: []
  patterns:
    - "Content-model SSOT: value-prop and about-teaser copy live in the content layer (content/*, MDX frontmatter), never duplicated into next-intl messages"
    - "Section shell pattern reused for #about: <section id aria-labelledby className=\"flex scroll-mt-24 flex-col gap-6\"> + mono-eyebrow h2"
    - "Header control cluster: logo | spacer | Contact | (ThemeToggle slot for Plan 03) | LocaleSwitcher"

key-files:
  created: []
  modified:
    - content/shared/types.ts
    - content/de/contact.ts
    - content/en/contact.ts
    - src/app/[locale]/page.tsx
    - src/app/[locale]/layout.tsx
    - src/app/globals.css
    - messages/de.json
    - messages/en.json
    - evals/home.spec.ts

key-decisions:
  - "valueProp is a required Zod field on contactInfoSchema, authored per locale in content/{de,en}/contact.ts — not a next-intl message key, so the hero and the Plan 02 CV can never diverge (resolves REVIEW finding 2)"
  - "About teaser text is read from getPage(locale,\"about\")?.description (existing about.mdx frontmatter) rather than authored in messages, avoiding a second source of truth (resolves REVIEW finding 3)"
  - "No CV download mirror in the header — the CV CTA lives in the contact block only, per D-C locked in 02-CONTEXT.md (resolves REVIEW finding 5)"
  - "Verification ran against a production build (pnpm build + next start) rather than pnpm dev's webServer, because the sandboxed execution environment could not sustain Next/content-collections' file watcher (EMFILE on the watch syscall); Playwright's reuseExistingServer picked up the already-running production server. This is an environment workaround only — playwright.config.ts webServer command was not modified, so CI continues to use pnpm dev unchanged."

requirements-completed: [CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07, CONT-08, MODE-01, TECH-03]

coverage:
  - id: D1
    description: "Hero renders name, role, and a distinct one-sentence value-prop paragraph as static SSR HTML, sourced from ContactInfo.valueProp"
    requirement: "CONT-02"
    verification:
      - kind: e2e
        ref: "evals/home.spec.ts#hero shows a one-sentence value proposition distinct from the role"
        status: pass
    human_judgment: false
  - id: D2
    description: "#about section renders a teaser from the existing about-page frontmatter and links to the full /about route; text-only, no photo"
    requirement: "CONT-06"
    verification:
      - kind: e2e
        ref: "evals/home.spec.ts#about section is visible and links to the full about page"
        status: pass
    human_judgment: false
  - id: D3
    description: "Persistent header Contact affordance reachable from every section (one click to #contact)"
    requirement: "CONT-07"
    verification:
      - kind: e2e
        ref: "evals/home.spec.ts#sticky header exposes a Contact affordance"
        status: pass
    human_judgment: false
  - id: D4
    description: "CV download button in the contact block only, download attribute, locale-correct href, format-bearing aria-label"
    requirement: "CONT-08"
    verification:
      - kind: e2e
        ref: "evals/home.spec.ts#contact block has a CV download button"
        status: pass
    human_judgment: false
  - id: D5
    description: "First-fold anchor-nav includes an #about item alongside career/projects/skills/contact (dense overview one click away)"
    requirement: "MODE-01"
    verification:
      - kind: e2e
        ref: "evals/home.spec.ts#first-fold anchor-nav includes an #about link"
        status: pass
    human_judgment: false
  - id: D6
    description: "Global :focus-visible ring (2px accent, 2px offset) on every interactive element in both themes; keyboard tab order reaches all controls"
    requirement: "TECH-03"
    verification: []
    human_judgment: true
    rationale: "Focus-ring visibility across every control (including the accent-filled CV button whose offset must visually clear the fill) and full keyboard-tab traversal are visual/interaction judgments Playwright's DOM assertions don't cover; the plan's own verification step calls for a manual keyboard-tab pass."
  - id: D7
    description: "html scroll-behavior: smooth is gated by prefers-reduced-motion: no-preference so reduced-motion users get no smooth-scroll"
    requirement: "TECH-03"
    verification: []
    human_judgment: true
    rationale: "Requires toggling OS-level reduced-motion and observing scroll behavior — not asserted by the automated eval suite; the plan's verification step calls for a manual reduced-motion check."
  - id: D8
    description: "career/projects/skills sections and career-first ordering preserved unchanged (CONT-03/04/05 already satisfied pre-plan)"
    requirement: "CONT-03"
    verification:
      - kind: e2e
        ref: "evals/home.spec.ts#projects section is present"
        status: pass
      - kind: e2e
        ref: "evals/home.spec.ts#case study list renders at least one item"
        status: pass
    human_judgment: false

duration: ~50min
completed: 2026-07-05
status: complete
---

# Phase 2 Plan 1: Recruiter Overview Complete Summary

**Hero value-prop sourced from a new `ContactInfo.valueProp` content-model field (SSOT with the future CV), a text-first `#about` section pulling its teaser from the existing about-page frontmatter, a persistent header Contact affordance, a locale-correct CV download button in the contact block, and an accessibility baseline (global focus-visible ring, reduced-motion-gated smooth scroll, malformed-date guard) — proven by a RED→GREEN Playwright suite.**

## Performance

- **Duration:** ~50 min
- **Started:** 2026-07-05T10:16:34Z (per orchestrator init)
- **Completed:** 2026-07-05T10:25:22Z
- **Tasks:** 3
- **Files modified:** 9 (8 production/content/i18n files + 1 eval file)

## Accomplishments

- Extended `contactInfoSchema` with a required `valueProp` field and authored per-locale DE/EN values — the single source of truth the hero (this plan) and the Plan 02 CV both read via `getContact(locale)`, eliminating the duplicate-copy risk flagged in cross-AI review
- Hero now renders `id="hero"` + a distinct one-sentence value-proposition paragraph as static SSR HTML (no motion gate), immediately after the existing role line
- New `#about` section between skills and contact: mono-eyebrow heading, teaser text from `getPage(locale,"about")?.description` (no duplicate about prose in messages), a `Link` to the full `/about` route, and a code-comment marking the future photo slot as a non-blocking follow-up — ships text-only per CTX-03/D-D
- First-fold anchor-nav gained an `#about` item; sticky header gained a persistent `Contact` affordance (`href="#contact"`) in the control cluster (logo | spacer | Contact | LocaleSwitcher, with the Plan-03 ThemeToggle slot left open) — no CV mirror in the header, per the D-C lock
- Contact block gained the one allowed filled-accent CTA: a CV download anchor (`download`, `href="/Lasse-Siemoneit-CV-${locale}.pdf"`, format-bearing `aria-label`)
- Accessibility baseline: `html { scroll-behavior: smooth }` now gated by `@media (prefers-reduced-motion: no-preference)`; added a global `:focus-visible` rule (2px accent ring, 2px offset) covering every interactive element
- Hardened `formatMonth` so a value missing its month segment falls back to the `present` label instead of rendering `undefined/YYYY` — fixes rendering for the null-dated ITSC "Software Engineering" role
- `evals/home.spec.ts`: added 5 new per-locale assertions (10 total) covering hero value-prop, `#about` + `/about` link, header Contact, CV download anchor, and anchor-nav `#about`; confirmed RED (10 failing, 12 pre-existing passing) before implementation, then GREEN (all 22 passing) after Tasks 2-3

## Task Commits

Each task was committed atomically:

1. **Task 1: Add failing overview assertions to home eval (RED)** - `00c771b` (test)
2. **Task 2: valueProp content field, hero + About block, anchor-nav, formatMonth guard** - `7744e9b` (feat)
3. **Task 3: Persistent header Contact + CV download button + accessibility baseline** - `7462ed5` (feat)

**Plan metadata:** committed together with this SUMMARY (see final commit in this plan's history)

## Files Created/Modified

- `evals/home.spec.ts` - RED-then-GREEN assertions for value-prop, about, header contact, CV download, anchor-nav
- `content/shared/types.ts` - `contactInfoSchema.valueProp` (required, min length 1)
- `content/de/contact.ts` / `content/en/contact.ts` - per-locale `valueProp` sentence
- `src/app/[locale]/page.tsx` - hero `#hero` + value-prop paragraph, `#about` section, anchor-nav `#about` item, CV download button in `#contact`, hardened `formatMonth`
- `src/app/[locale]/layout.tsx` - header control cluster gains the Contact anchor
- `src/app/globals.css` - reduced-motion-gated `scroll-behavior`, global `:focus-visible` ring
- `messages/de.json` / `messages/en.json` - `about.title`, `about.readMore`, `nav.about`, `contact.downloadCv`, `contact.downloadCvAria`

## Decisions Made

- `valueProp` is content-model, not a message key — enforces one source of truth between the hero and the Plan 02 CV (`satisfies ContactInfo` fails to compile if either locale omits it)
- About teaser reuses the existing `about.mdx` frontmatter `description` rather than authoring new copy, avoiding content drift with the full `/about` page
- CV download button placed exclusively in the contact block, matching the locked D-C decision; the header cluster leaves a slot for Plan 03's ThemeToggle but does not add one here
- Verification was run against a `pnpm build` + `next start` production server instead of the `pnpm dev` webServer Playwright's config normally spawns, because the sandboxed execution environment hit `EMFILE: too many open files, watch` when Next/content-collections' file watcher started (confirmed independent of `ulimit -n`, reproduced even with the sandbox disabled — an environment-level constraint, not a code defect). Playwright's `reuseExistingServer: !process.env.CI` picked up the already-running production server transparently. `playwright.config.ts` was **not modified** — CI and future local runs continue to use `pnpm dev` as configured.

## Deviations from Plan

None - plan executed exactly as written. The production-build verification workaround above is a test-execution environment accommodation, not a deviation from the plan's specified content, task order, or acceptance criteria — all specified `pnpm lint` / `pnpm build` / `pnpm exec playwright test` commands were run and passed exactly as the plan's `<verify>` blocks specify; the only substitution was starting the app server via `next start` (against the same build artifacts `pnpm build` produces) rather than letting Playwright's `webServer` spawn `pnpm dev`, purely to route around a sandbox file-descriptor limitation on the watch syscall.

## Issues Encountered

- The sandboxed shell environment could not start `pnpm dev` (Next dev + content-collections file watcher) due to `EMFILE: too many open files, watch`, reproducible even after raising `ulimit -n` to 65536 and with the tool sandbox explicitly disabled — indicating a host-level constraint on watch-syscall file descriptors rather than a per-process open-file-count limit. Worked around by running `pnpm build && next start` (no watcher) and letting Playwright's `reuseExistingServer` option attach to it. No production code or configuration changed as a result.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `ContactInfo.valueProp` is live and ready for Plan 02 (Wave 2, `depends_on: [02-01]`) to consume in the CV document — the one-way dependency direction confirmed by cross-AI review holds (02-02 → 02-01 only)
- The CV download button's target file (`/Lasse-Siemoneit-CV-{de,en}.pdf`) does not exist yet — this is expected and non-blocking for this plan; Plan 02 produces it at build time, and Plan 06 gates the full build (prebuild → generate:cv) so a missing PDF fails the build rather than shipping a 404. The Plan 07 cutover checklist carries the explicit "CV PDFs exist, links resolve" verification item.
- Manual verification still outstanding (owner/verifier, not blocking commit): keyboard-tab through hero → nav → sections → header Contact → contact links → CV button to confirm every focus stop shows a visible ring, and an OS reduced-motion check that anchor clicks jump without smooth-scroll. Both are captured as `human_judgment: true` coverage entries (D6, D7) above.
- No blockers for the next plan in this phase.

## Self-Check: PASSED

All key files confirmed present on disk (content/shared/types.ts, content/de/contact.ts, content/en/contact.ts, src/app/[locale]/page.tsx, src/app/[locale]/layout.tsx, src/app/globals.css, messages/de.json, messages/en.json, evals/home.spec.ts). All three task commits (00c771b, 7744e9b, 7462ed5) confirmed present in git history. All plan `<acceptance_criteria>` re-verified: `pnpm lint` clean, `pnpm exec tsc --noEmit` clean, `pnpm build` succeeds, and the full `evals/home.spec.ts` suite (22 tests) passes for both locales.

---
*Phase: 02-recruiter-overview-live*
*Completed: 2026-07-05*
