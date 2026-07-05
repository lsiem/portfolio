---
phase: 02-recruiter-overview-live
plan: 02
subsystem: build-tooling
tags: [cv-pdf, build-step, react-pdf, geist, dsgvo, prebuild]

requires:
  - phase: 02-recruiter-overview-live
    provides: "ContactInfo.valueProp content-model field (Plan 01, Wave 1) — the CV reads it, never re-authors it"
provides:
  - "Build-time CV-PDF generation: pnpm generate:cv renders public/Lasse-Siemoneit-CV-{de,en}.pdf from the content model"
  - "scripts/cv/CvDocument.tsx — reusable one-column ATS react-pdf <Document> (locale-agnostic, content passed as props)"
  - "scripts/cv/labels.ts — {de,en} CV chrome labels + as-of prefix"
  - "prebuild chain: check:content && generate:cv, so public/ holds both PDFs before next build collects static assets"
  - "server-only runtime dependency installed ahead of Plan 05's import-guard need"
affects: [02-06-build-verification, 02-07-cutover]

tech-stack:
  added: ["@react-pdf/renderer@4.5.1", "geist@1.7.2", "tsx@4.23.0", "server-only@^0.0.1"]
  patterns:
    - "Build-only devDependencies (react-pdf, geist, tsx) never imported under src/app/** — keeps them out of the client/runtime graph (DSGVO + bundle discipline)"
    - "Generated build artifacts (public/*.pdf) are gitignored, not committed — regenerated fresh on every pnpm build via prebuild, mirroring .next/ and .content-collections"
    - "CV content sourced by importing content/{de,en}/*.ts modules directly in the build script — the same modules src/lib/content.ts uses at runtime — single source of truth, no duplicate copy"
    - "Fail-loud build script: renderToFile failure exits non-zero so prebuild breaks next build rather than shipping a missing/stale PDF"

key-files:
  created:
    - scripts/generate-cv.tsx
    - scripts/cv/CvDocument.tsx
    - scripts/cv/labels.ts
  modified:
    - package.json
    - .gitignore

key-decisions:
  - "public/Lasse-Siemoneit-CV-{de,en}.pdf are build artifacts, not committed to git — gitignored alongside .next/ and .content-collections since prebuild regenerates them on every pnpm build (matches Vercel's build-time execution model)"
  - "CvDocument accepts locale/generatedAt/contact/career/projects/skillDomains as props rather than importing content itself, keeping the component locale-agnostic and testable independent of the loop in generate-cv.tsx"
  - "formatMonth in CvDocument mirrors page.tsx's implementation character-for-character (null → present-label fallback) so the CV and the web hero render identical career-date semantics, including the known from:null/to:null 'Software Engineering' role — this is existing accepted content-model behavior (STATE.md pending human check), not a Plan 02 defect"
  - "Section vertical rhythm was tightened after Task 3 verification measured 3 PDF pages for DE, exceeding RESEARCH's ~1-2 page guidance — no content was cut, only spacing"

requirements-completed: [CONT-08]

coverage:
  - id: D1
    description: "pnpm build (via prebuild) produces one selectable-text PDF per locale in public/ (Lasse-Siemoneit-CV-de.pdf, Lasse-Siemoneit-CV-en.pdf)"
    requirement: "CONT-08"
    verification:
      - kind: other
        ref: "pnpm generate:cv && node -e PDF magic-header + size check (both files begin %PDF-, >3KB)"
        status: pass
      - kind: other
        ref: "pnpm build (full prebuild -> next build chain)"
        status: pass
      - kind: other
        ref: "pdftotext extraction confirms real selectable text (not a rasterized image) for both locales"
        status: pass
    human_judgment: false
  - id: D2
    description: "CV is sourced from the same content model as the site (career, projects, skills, contact) — single source of truth, no duplicated copy"
    requirement: "CONT-08"
    verification:
      - kind: other
        ref: "scripts/generate-cv.tsx imports content/{de,en}/{career,contact,projects,skills}.ts directly — the same modules src/lib/content.ts uses"
        status: pass
    human_judgment: false
  - id: D3
    description: "The CV's one-sentence value proposition is read from ContactInfo.valueProp — identical to the hero, never duplicated into a message key (REVIEW finding 2)"
    requirement: "CONT-08"
    verification:
      - kind: other
        ref: "pdftotext output for both locale PDFs matches content/{de,en}/contact.ts valueProp string verbatim"
        status: pass
    human_judgment: false
  - id: D4
    description: "CV uses a one-column ATS-friendly layout with embedded/subset Geist Sans and an 'as of' date (D-E)"
    requirement: "CONT-08"
    verification:
      - kind: other
        ref: "pdffonts confirms Geist-{Regular,Medium,SemiBold} embedded (emb=yes) and subset (sub=yes) in both PDFs"
        status: pass
      - kind: other
        ref: "pdftotext confirms localized as-of footer (\"Stand: 5. Juli 2026\" / \"As of: ...\")"
        status: pass
      - kind: manual_procedural
        ref: "Opening the PDF visually to confirm one-column reading order and print polish"
        status: unknown
    human_judgment: true
    rationale: "Font embedding and as-of date are automatically proven; final visual polish of the one-column ATS layout (line wrapping, page-break placement) is a print-quality judgment the plan's own verification step calls for opening the PDF manually."
  - id: D5
    description: "The generator runs at build time only and makes no third-party runtime call; @react-pdf/renderer never enters the client/runtime graph"
    requirement: "CONT-08"
    verification:
      - kind: other
        ref: "grep confirms no file under src/app/** imports @react-pdf/renderer or scripts/cv"
        status: pass
      - kind: other
        ref: "@react-pdf/renderer, geist, tsx installed as devDependencies only (package.json)"
        status: pass
    human_judgment: false
  - id: D6
    description: "Contact facts in the CV are email/GitHub/LinkedIn only — no phone/address (schema data-minimization)"
    requirement: "CONT-08"
    verification:
      - kind: other
        ref: "pdftotext output shows only email/github/linkedin lines; ContactInfo schema has no phone/address fields to leak"
        status: pass
    human_judgment: false

duration: ~25min
completed: 2026-07-05
status: complete
---

# Phase 2 Plan 2: CV-PDF Build Generation Summary

**Build-time CV-PDF generation resolving the roadmap-flagged CTX-05 unknown — `@react-pdf/renderer` v4.5.1 run by a standalone `tsx` script chained into `prebuild`, rendering one selectable-text, Geist-embedded, one-column ATS PDF per locale from the same content model the site renders from.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-07-05 (session start)
- **Completed:** 2026-07-05T10:36:54+02:00 (last task commit)
- **Tasks:** 3 (plus 1 auto-fixed deviation)
- **Files modified:** 5 (package.json, .gitignore, scripts/generate-cv.tsx, scripts/cv/CvDocument.tsx, scripts/cv/labels.ts)

## Accomplishments

- Installed `@react-pdf/renderer@4.5.1`, `geist@1.7.2`, `tsx@4.23.0` as devDependencies (build-only, out of the client/runtime graph) and `server-only` as a regular dependency for Plan 05's later import guard; verified installed versions and confirmed no unexpected postinstall scripts ran
- Wired `generate:cv` into `prebuild` (`check:content && generate:cv`) so `public/` holds both PDFs before `next build` collects static assets
- Authored `scripts/cv/CvDocument.tsx`: a locale-agnostic, one-column A4 react-pdf `<Document>` — Geist Sans registered from local `node_modules/geist/dist/fonts/geist-sans/*.ttf` paths (never URLs, avoiding the documented async-font race), rendering name/role/value-prop (from `contact.valueProp` — identical source to the hero), full career arc with role progressions, 3-5 project one-liners (flagship/deep favored via `depth`/`order`), domain-grouped skills (no levels), email/GitHub/LinkedIn contact only, and a localized "as of" footer date
- Authored `scripts/generate-cv.tsx`: imports content directly from `content/{de,en}/{career,contact,projects,skills}.ts` (the same modules `src/lib/content.ts` uses), loops `["de","en"]`, and calls `renderToFile` to write `public/Lasse-Siemoneit-CV-{locale}.pdf`; exits non-zero on any render failure so a broken CV fails the build loudly rather than shipping a missing/stale file
- `pnpm build` verified end-to-end: `prebuild` (content-parity gate → CV generation) runs cleanly before `next build`, which completes successfully across all 15 static routes
- Verified both PDFs contain real selectable text (via `pdftotext`), embedded+subset Geist fonts (via `pdffonts`), correct locale content, and the localized as-of date footer

## Task Commits

Each task was committed atomically:

1. **Task 1: Add build dependencies, CV labels, and prebuild wiring** - `c0afe0f` (feat)
2. **Task 2: Author the react-pdf CvDocument (one-column ATS layout, embedded Geist)** - `8cd1b0c` (feat)
3. **Task 3: Generator script — loop locales, write both PDFs to public/** - `48f3be9` (feat)
4. **Deviation fix: tighten CV vertical rhythm to hold the 1-2 page target** - `f74897e` (fix)

**Plan metadata:** committed together with this SUMMARY (see final commit in this plan's history)

## Files Created/Modified

- `scripts/generate-cv.tsx` - build entry; loops `["de","en"]`, imports content directly, `renderToFile` → `public/`
- `scripts/cv/CvDocument.tsx` - react-pdf `<Document>`, one-column ATS layout, `Font.register` for Geist ttf, all CV sections
- `scripts/cv/labels.ts` - `{de,en}` CV chrome labels + "as of" prefix
- `package.json` - `@react-pdf/renderer`/`geist`/`tsx` devDependencies, `server-only` dependency, `generate:cv` script, `prebuild` chain
- `.gitignore` - `public/Lasse-Siemoneit-CV-*.pdf` (generated build artifact, not committed)

## Decisions Made

- Generated PDFs (`public/Lasse-Siemoneit-CV-{de,en}.pdf`) are gitignored, not committed — they are pure build output regenerated by `prebuild` on every `pnpm build` (including Vercel's build), matching how `.next/` and `.content-collections` are already excluded. Committing them would create stale-artifact drift risk with no benefit since the build always regenerates them.
- `CvDocument` takes content as props (`contact`, `career`, `projects`, `skillDomains`) rather than importing content modules itself, keeping the component pure/testable and the locale loop entirely in `generate-cv.tsx`.
- `formatMonth` in the CV mirrors `src/app/[locale]/page.tsx`'s implementation exactly (null → present-label fallback), so the CV and the web hero render identical date semantics for the same career data — including the already-known, already-accepted `from: null` "Software Engineering" role at ITSC (tracked as a content data-quality item in STATE.md, not a Plan 02 defect).
- Contact line renders bare hostnames (`github.com/lsiem`, not the full `https://` URL) as visible link text while the `<Link src>` still points at the full URL — keeps the printed/ATS text compact without losing the clickable link in PDF viewers.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug/Quality] CV exceeded the RESEARCH ~1-2 page target**
- **Found during:** Task 3 (`pnpm build` verification — checked page count with `pdfinfo`)
- **Issue:** The DE CV rendered 3 pages against RESEARCH Open Q1's recommended ~1-2 page target for an ATS-friendly one-column CV. Five career stations (several with multi-role progressions), five projects, and five skill domains pushed the vertical rhythm past 2 pages.
- **Fix:** Tightened `sectionHeading`, `careerEntry`, `roleItem`, and `projectItem` vertical margins in `CvDocument.tsx`. No content was removed — same information density, less whitespace.
- **Files modified:** scripts/cv/CvDocument.tsx
- **Verification:** Regenerated both PDFs; `pdfinfo` confirms exactly 2 pages for both DE and EN; `pdftotext`/`pdffonts` re-run to confirm text/fonts still intact after the spacing change.
- **Committed in:** f74897e

---

**Total deviations:** 1 auto-fixed (1 Rule 1 — quality/bug)
**Impact on plan:** Cosmetic spacing fix only; no content, structure, or acceptance-criteria impact. All three plan tasks' acceptance criteria were already passing before this fix — it brings the output closer to the RESEARCH document's soft page-count guidance.

## Issues Encountered

None beyond the deviation documented above.

## User Setup Required

None - no external service configuration required. `server-only` was installed ahead of need for Plan 05 (Wave 4), per the plan's stated cross-plan dependency ordering.

## Next Phase Readiness

- CONT-08 is now satisfied end-to-end together with Plan 01's download button: `public/Lasse-Siemoneit-CV-{de,en}.pdf` exist after any `pnpm build`, and the filenames match Plan 01's button `href` contract exactly (`/Lasse-Siemoneit-CV-${locale}.pdf`).
- `prebuild` fails loudly if CV generation ever breaks (fail-fast exit code), so Plan 06's full build verification will catch a broken CV rather than silently shipping a 404 or stale PDF.
- `server-only` is installed and ready for Plan 05 (`src/lib/github.ts`) to `import "server-only"` for its client-bundle import guard.
- Outstanding manual/visual check (owner/verifier, not blocking commit): open both generated PDFs to visually confirm the one-column reading order and print polish match the D-E intent — captured as the `human_judgment: true` D4 coverage entry above.
- No blockers for the next plan in this phase.

## Self-Check: PASSED

All key files confirmed present on disk (scripts/generate-cv.tsx, scripts/cv/CvDocument.tsx, scripts/cv/labels.ts, package.json changes, .gitignore changes). All four commits (c0afe0f, 8cd1b0c, 48f3be9, f74897e) confirmed present in git history. All plan `<acceptance_criteria>` re-verified: `pnpm exec tsc --noEmit` clean for scripts/cv/, `pnpm generate:cv` writes both valid PDFs (%PDF- header, non-trivial size, both exactly 2 pages), `pnpm build` succeeds end-to-end (prebuild chain → next build), `pnpm lint` clean, and grep confirms no `src/app/**` file imports `@react-pdf/renderer` or `scripts/cv`.

---
*Phase: 02-recruiter-overview-live*
*Completed: 2026-07-05*
