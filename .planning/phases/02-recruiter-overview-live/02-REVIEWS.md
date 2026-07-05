---
phase: 2
reviewers: [cursor, coderabbit]
attempted_but_failed: [gemini, codex, antigravity]
reviewed_at: 2026-07-05T09:15:04Z
plans_reviewed: [02-01-PLAN.md, 02-02-PLAN.md, 02-03-PLAN.md, 02-04-PLAN.md, 02-05-PLAN.md, 02-06-PLAN.md, 02-07-PLAN.md]
---

# Cross-AI Plan Review — Phase 2

> **Reviewer availability (this run):** Cursor (grounded plan review) and CodeRabbit (diff-only) succeeded.
> Gemini (503 "high demand" on pro + both flash models), Codex (`invalid_payload` schema error from the Azure provider, both attempts), and Antigravity (`agy -p` hung in its Cascade loop past the 5-min timeout, no response written) all failed and are recorded below for transparency. Claude was skipped by design (this review runs inside Claude Code).
> CodeRabbit is a **diff-only** reviewer — it never received the source-grounding prompt and reviews the working tree/branch diff, not the plans in isolation. Its findings are folded in as diff observations; plan-level consensus is anchored on Cursor.

---

## Cursor Review

# Phase 2 Plan Review — Recruiter Overview Live

## Summary

The seven-plan wave structure is well aligned with the interim codebase and phase goal: it extends what already exists on `src/app/[locale]/page.tsx` rather than rewriting it, chains build-time artifacts correctly (`prebuild` → CV PDFs → `next build`), and keeps DSGVO constraints explicit (no runtime GitHub, script-only react-pdf, static OG images). Research, UI-SPEC, and PATTERNS are tightly integrated into task `read_first` blocks, and threat models are unusually concrete. Against the **current** repo, the plans accurately describe missing work (no `#about`, no value prop, no header Contact, no CV button, no theme toggle, no security headers, `siteMetadataBase` still on Vercel/localhost). Remaining gaps are mostly **single-source-of-truth drift** (value prop / about copy split across messages vs content model), **verification vs requirements mismatch** (LHCI LCP 3000ms vs TECH-01 “good” at 2500ms; no INP gate), and **operational dependencies** (GITHUB_TOKEN in CI/production, explicit `server-only` package). Overall the phase is executable with targeted fixes before Wave 1.

---

## Strengths

- **Accurate baseline read** — Plans correctly treat the interim overview as the extension point: hero/career/projects/skills/contact already exist (`src/app/[locale]/page.tsx:52-235`), depth-weighted case-study links work (`page.tsx:144-169`), and `getContact`/`getCareer`/etc. are the established accessors (`src/lib/content.ts:39-61`).
- **Wave ordering matches build mechanics** — CV generation in `prebuild` before `next build` is correct given `package.json:9` today only runs `check:content`; Pitfall 5 (postbuild too late) is addressed in 02-02.
- **02-01 RED→GREEN eval loop** — Extending `evals/home.spec.ts` before implementation matches existing per-locale structure (`evals/home.spec.ts:5-40`) and gives concrete acceptance for CONT-02, MODE-01, CONT-07, CONT-08 UI.
- **DSGVO posture is consistent** — Build-time GitHub fetch with `import "server-only"`, graceful `null` fallback, and “no client-side GitHub” (02-05) matches AGENTS constraints; analytics already cookieless in `layout.tsx:94-96`.
- **02-03 dark mode design is pragmatic** — Token-only overrides + inline pre-paint script avoids `next-themes`; mirrors proven FOUC prevention and fits `globals.css:3-29` token structure.
- **02-04 SEO approach matches Next 16** — `opengraph-image.tsx` convention, `params` as Promise, Geist ttf from disk (reusing `geist` from 02-02) aligns with bundled docs cited in RESEARCH; `localeAlternates` already correct (`src/lib/seo.ts:21-31`).
- **02-07 human gate is appropriate** — Blocking cutover until Plan 06 verification + PAT confirmation prevents half-built production (CTX-06/CTX-07).
- **Threat models per plan** — STRIDE entries (PAT leak, JSON-LD XSS, CSP vs inline theme script) show real boundary thinking, not checkbox security.

---

## Concerns

### Cross-cutting

- **HIGH — Value proposition breaks CONT-01 / CTX-05 SSOT** — Plan 01 adds `home.valueProp` to `messages/*.json`, but Plan 02 Task 2 requires the CV to render “name + role + one-sentence value prop” from **content modules only** (`content/{de,en}/*.ts`). `ContactInfo` has no `valueProp` field (`content/shared/types.ts:77-83`); only `role` exists in `content/de/contact.ts:9-15`. Site and PDF will diverge unless a content-model field is added or the CV imports messages (breaking the script-only content import pattern).
- **MEDIUM — About summary duplicates `/about` prose** — Plan 01 authors `about.summary` in messages, but full about content already lives in `content/de/pages/about.mdx` and is served via `getPage()` (`src/app/[locale]/[slug]/page.tsx:40-48`). Two sources will drift; prefer `page.description` or a short excerpt from the content model.
- **MEDIUM — TECH-01 vs LHCI budget mismatch** — ROADMAP criterion 4 requires CWV “good” (LCP **&lt; 2.5s**). `lighthouserc.json:10` allows LCP **3000ms**. Plan 06 only says “tighten if comfortable,” so TECH-01 can pass CI while failing the stated success criterion.
- **MEDIUM — No INP assertion** — TECH-01 explicitly includes INP &lt; 200ms; `lighthouserc.json` asserts LCP, performance score, and script size only — INP regressions (e.g. theme toggle) would not fail the gate.
- **MEDIUM — Production heatmap depends on env at build time** — Plan 05’s graceful fallback is correct for previews, but if `GITHUB_TOKEN` is missing on the **production** Vercel build, the live site ships the fallback line permanently until the next rebuild. Plan 07 documents this; Plan 05/06 should treat “token present in Production env” as a **blocking** pre-cutover check, not only manual step 7.
- **LOW — `server-only` not listed as dependency** — Plan 05 requires `import "server-only"` but no plan adds the `server-only` package to `package.json`. Next bundles a compiled copy, but explicit dependency avoids resolution surprises in the standalone `tsx` script context.
- **LOW — Plan 05 `depends_on: [02-03, 02-04]` is tighter than necessary** — Activity mount only needs 02-01’s page structure; coupling to theme/SEO increases merge contention without technical necessity.

### Per plan

**02-01**
- **MEDIUM** — Claims CONT-06 “text-first” but does not wire about copy from `getPage(locale, "about")` or `page.description`; new messages become a second SSOT.
- **LOW** — UI-SPEC active anchor-nav indicator (in-view section) is not scoped in any task.
- **LOW** — RED verify (`grep -Eiq "fail|expected"`) is brittle if Playwright output format changes.

**02-02**
- **HIGH** — Value-prop sourcing conflict (see cross-cutting); generator cannot satisfy Task 2 acceptance without Plan 01 also writing to content or Plan 02 importing labels from messages.
- **MEDIUM** — Task 2 typecheck verify runs project `tsc`; react-pdf JSX in `scripts/cv/` may need explicit tsconfig/`jsx` handling — not called out.
- **LOW** — Wave 1 parallel with 02-01 means CV link 404 until 02-02 completes (acknowledged in Plan 01; acceptable if same PR).

**02-03**
- **MEDIUM** — Assumption A6: Tailwind 4 `@custom-variant` block syntax is “confirm at implementation”; failure would block build with no fallback task.
- **LOW** — UI-SPEC mentions `localStorage` value `"system"`; implementation correctly uses `removeItem` — document the convention to avoid executor confusion.

**02-04**
- **LOW** — Per-case-study OG cards add build surface for every slug; only two deep case studies exist today (`content/de/projects.ts:26-38`) — cost is low but worth noting if slugs grow.
- **LOW** — `personJsonLd` includes `email` in structured data; already public on page — acceptable but increases scraper exposure slightly.

**02-05**
- **MEDIUM** — ISR + `revalidate: 86400` on a fully static page: behavior is correct per Next “previous model” docs, but first deploy after token add requires rebuild/revalidate to show grid — not stated in verification.
- **LOW** — `#activity` omitted from anchor-nav (Claude’s discretion) weakens MODE-01 “all facts one click” for GitHub activity.

**02-06**
- **MEDIUM** — CSP task allows shipping without CSP if hash/allowlist breaks analytics/theme script; acceptable fallback, but leaves a security gap unless STATE.md blocker is enforced.
- **MEDIUM** — `evals/a11y.spec.ts` Tab-order tests are fragile (focus order varies by browser/extensions); may flake in CI.
- **LOW** — LHCI runs against `localhost:3000` (`lighthouserc.json:5`), not Vercel preview — may differ from production CDN latency (Plan 07 manual mobile Lighthouse compensates).

**02-07**
- **LOW** — `siteMetadataBase` flip (`seo.ts:10-14`) hardcodes production origin; preview builds after flip will emit `lsiem.de` URLs even on preview URLs until cutover strategy is clear (usually desired only on merge to main).

---

## Suggestions

1. **Add `valueProp` to the content model** — Extend `contactInfoSchema` + `content/{de,en}/contact.ts`; use it in hero, CV (`CvDocument`), and optionally OG card. Keep messages for chrome only, or derive hero strings from content loaders.
2. **Source About teaser from existing prose** — Use `getPage(locale, "about")?.description` (already in frontmatter, `about.mdx:3`) for the overview `#about` summary instead of new `about.summary` messages.
3. **Tighten LHCI before Wave 4** — Set `largest-contentful-paint` max to **2500** and add an INP assertion (or `total-blocking-time` proxy) in `lighthouserc.json`; align Plan 06 acceptance criteria with ROADMAP criterion 4 verbatim.
4. **Add `server-only` to devDependencies** in Plan 02 or 05 (`pnpm add server-only`) alongside the `import "server-only"` line.
5. **Make GITHUB_TOKEN a Plan 06 gate** — Add automated check or documented CI step: production build must have token set, or cutover fails; avoids shipping fallback on lsiem.de.
6. **Resolve CV value prop in Plan 02 Task 1** — Either add content field in Task 1 of 02-02, or explicitly import `messages/{locale}.json` in `generate-cv.tsx` with a comment that value prop is i18n chrome (weaker SSOT).
7. **Plan 05 dependency** — Reduce to `depends_on: [02-01]` unless merge conflict history proves otherwise.
8. **Plan 06 a11y eval** — Prefer role/landmark/rel assertions over strict Tab sequence; use `:focus-visible` style check on a subset of controls only.
9. **Plan 01** — Add optional `#hero` to anchor-nav only if stopwatch testing shows recruiters need it; hero is already first viewport.

---

## Risk Assessment

**Overall: MEDIUM**

**Justification:** Architecture, wave sequencing, and DSGVO/build-time patterns are strong and match the repo’s actual interim state. The phase will likely ship a complete recruiter overview if executed as written. The main execution risks are **content drift** (value prop / about split across messages vs `content/`), **verification gaps** (LCP/INP vs TECH-01), and **operational cutover** (GITHUB_TOKEN on production build, human 30s test). None are structural rewrites; all are fixable with small plan amendments before or during Wave 1. Security and performance risk is moderate-low given static SSG, script-only PDF, and explicit header/CSP work in Plan 06.

---

### Plan-by-plan verdict

| Plan | Verdict | Notes |
|------|---------|-------|
| **02-01** | ✅ Proceed with SSOT fix | Solid slice; add content-model value prop + about teaser sourcing |
| **02-02** | ⚠️ Proceed after SSOT fix | Prebuild CV pattern is sound; resolve value prop source before Task 2 |
| **02-03** | ✅ Proceed | Standard attribute + inline-script approach; validate Tailwind variant early |
| **02-04** | ✅ Proceed | Fits Next 16 OG conventions; depends on `geist` from 02-02 |
| **02-05** | ⚠️ Proceed | Good DSGVO fetch design; add `server-only` dep + production token gate |
| **02-06** | ⚠️ Proceed | Tighten LHCI thresholds; soften Tab-order eval |
| **02-07** | ✅ Proceed | Appropriate human-only cutover; depends on 06 being truly green |

---

## CodeRabbit Review

*(Diff-only: reviews `phase/02-recruiter-overview-live → main`, committed + uncommitted. 15 findings — 6 major, 9 minor.)*

```

(\(\
(• .•)  C*deR*bb*t: The uncensored bug hunter.


────────────────────────────────────────────────────────────────────────
  major [Security & Privacy]
  → content/en/pages/impressum.mdx:16

  Placeholder address must be filled before launch.

  The Impressum contains placeholder text instead of a real postal address.
  Under § 5 DDG, a complete and accurate provider address is a legal
  requirement for German-facing sites; shipping this to production as-is
  would leave the site non-compliant.

  Ensure this is tracked as a hard blocker in the launch checklist and
  resolved before the production cutover phase.





  Also applies to: 25-25


────────────────────────────────────────────────────────────────────────
  major [Data Integrity & Integration]
  → .github/workflows/ci.yml:41-43

  Lighthouse budget comment doesn't match lighthouserc.json thresholds.

  The inline comment states `LCP
  Suggested fix (pick whichever value is actually correct)

  -      # TECH-07 performance budget: LCP <= 2500ms, script bytes <= 153600, perf >= 0.9
  +      # TECH-07 performance budget: LCP <= 3000ms, script bytes <= 184643, perf >= 0.9


────────────────────────────────────────────────────────────────────────
  minor [Maintainability & Code Quality]
  → content/de/pages/about.mdx:26-28

  Tighten the closing clause.

  ... DSGVO-konform in der EU betrieben reads like a sentence fragment in
  the published bio. Rephrase that clause so the sentence finishes cleanly.


────────────────────────────────────────────────────────────────────────
  minor [Functional Correctness]
  → content/de/career.ts:37-42

  Give the middle role a real date range.

  The Software Engineering entry has both from and to set to null,
  so the timeline loses its chronology and may render as an ambiguous gap.
  Add the actual bounds or merge it into the adjacent role.


────────────────────────────────────────────────────────────────────────
  minor [Functional Correctness]
  → src/app/[locale]/page.tsx:27-32

  formatMonth doesn't guard against malformed "YYYY-MM" input.

  If value lacks a - (e.g. a year-only string), month is undefined
  and the function renders "undefined/YYYY" to users instead of falling
  back gracefully.


  🐛 Proposed fix

   function formatMonth(value: string | null, present: string): string {
     if (!value) return present;
     const [year, month] = value.split("-");
  +  if (!year || !month) return present;
     return `${month}/${year}`;
   }


────────────────────────────────────────────────────────────────────────
  major [Stability & Availability]
  → .planning/phases/01-bilingual-content-foundation/01-VERIFICATION.md:42-43

  Downgrade TECH-07 to “verified with a gap”.

  The report proves CI catches budget regressions, but it also says a direct
  merge to main can still auto-deploy to production. That means the
  production gate is not enforced end-to-end yet.


  Suggested adjustment

  -| 3 | Every deploy to lsiem.de runs through a pipeline that fails on exceeded performance budget (LCP, initial JS) | ✓ VERIFIED | ...
  +| 3 | CI enforces the performance budget, but production deploys still need branch protection to make the gate end-to-end | ⚠ VERIFIED WITH GAP | ...

  Also applies to: 101-109


────────────────────────────────────────────────────────────────────────
  minor [Maintainability & Code Quality]
  → .planning/phases/01-bilingual-content-foundation/01-UAT.md:15-18

  Split the Impressum check into Phase 1 vs. Phase 2 criteria.

  The row currently passes while the expected state still says the real
  postal address is missing. That makes the test ambiguous and hides the
  actual blocker.


  Suggested wording

  - expected: The placeholder in content/{de,en}/pages/impressum.mdx is replaced with a real, contactable postal address before the Phase-2 domain switch. (Legal/content decision — flagged as a Phase-2-launch blocker, confirmed present as a clearly-marked placeholder, not silently missing.)
  - result: pass
  + expected: Phase 1: the Impressum placeholder is clearly marked; Phase 2: replace it with a real, contactable postal address before the domain switch.
  + result: pass


────────────────────────────────────────────────────────────────────────
  minor [Maintainability & Code Quality]
  → README.md:59-60

  Align the CI wording with the workflow trigger.

  The PR stack says .github/workflows/ci.yml triggers on pull_request,
  not on every push. Update the README so contributors know when the gate
  actually runs.




  ♻️ Proposed fix

  - CI (`.github/workflows/ci.yml`) runs `check:content` → `build` → Lighthouse CI budget on every push, failing on LCP / initial-JS / performance-score regressions.
  + CI (`.github/workflows/ci.yml`) runs `check:content` → `build` → Lighthouse CI budget on every pull request, failing on LCP / initial-JS / performance-score regressions.


────────────────────────────────────────────────────────────────────────
  minor [Maintainability & Code Quality]
  → .agents/skills/portfolio/SKILL.md:200

  Fix the markdown table row delimiter.

  The extra leading | makes this row render with an empty first cell and
  breaks the table layout.




  ♻️ Proposed fix

  -|| /add-test-suite  | Add or extend CI and automated test suites                   |
  +| /add-test-suite   | Add or extend CI and automated test suites                   |


────────────────────────────────────────────────────────────────────────
  major [Data Integrity & Integration]
  → .planning/phases/02-recruiter-overview-live/02-UI-SPEC.md:45-50

  Remove the optional header CV mirror.

  D-C is already locked to the contact block only in 02-CONTEXT.md, but
  this spec still allows a second placement. Keeping both reopens a settled
  decision and will make the header contract inconsistent.





  Also applies to: 207-211


────────────────────────────────────────────────────────────────────────
  minor [Maintainability & Code Quality]
  → .planning/phases/02-recruiter-overview-live/02-06-PLAN.md:71-72

  Add the CSP fallback follow-up to the declared scope.

  The fallback path requires a STATE.md blocker entry, but STATE.md is
  not in files_modified, so the plan cannot satisfy its own acceptance
  criteria as written. Please include that file here or drop the fallback
  bookkeeping requirement.


────────────────────────────────────────────────────────────────────────
  minor [Stability & Availability]
  → .planning/phases/02-recruiter-overview-live/02-01-PLAN.md:134-135

  Don't ship a 404ing CV CTA.

  This plan says the download link will 404 until Plan 02 lands. If the
  tasks are merged out of order, users get a broken button in the live page.
  Please make Plan 02 a hard prerequisite or gate the CTA until the PDFs
  exist.


────────────────────────────────────────────────────────────────────────
  minor [Functional Correctness]
  → .planning/phases/02-recruiter-overview-live/02-03-PLAN.md:98-99

  Use a single ARIA pattern for the theme toggle.
  role="group" should pair with aria-pressed, or radiogroup should
  pair with aria-checked. Mixing both in the same control produces invalid
  semantics, so choose one pattern and keep it consistent.


────────────────────────────────────────────────────────────────────────
  major [Security & Privacy]
  → scripts/check-content-parity.ts:83-99

  Only the first blocklist.txt found is scanned; siblings are silently
  ignored.

  findBlocklist stops at the first
  .planning/phases/*/reference/blocklist.txt it finds (in readdirSync
  order, which is not guaranteed sorted). If two phase folders each maintain
  their own confidentiality blocklist, terms in the non-first file are never
  checked — a silent gap in the D-03 confidentiality gate this script exists
  to enforce.





  🛡️ Proposed fix: merge terms from all blocklist files

  -/** Resolve the first existing .planning/phases/*\/reference/blocklist.txt, or null. */
  -function findBlocklist(): string | null {
  +/** Resolve every existing .planning/phases/*\/reference/blocklist.txt. */
  +function findBlocklists(): string[] {
     const phasesDir = join(".planning", "phases");
     if (!existsSync(phasesDir)) {
  -    return null;
  +    return [];
     }
  +  const found: string[] = [];
     for (const phase of readdirSync(phasesDir, { withFileTypes: true })) {
       if (!phase.isDirectory()) {
         continue;
       }
       const candidate = join(phasesDir, phase.name, "reference", "blocklist.txt");
       if (existsSync(candidate)) {
  -      return candidate;
  +      found.push(candidate);
       }
     }
  -  return null;
  +  return found;
   }

  And update main() to merge terms from all findBlocklists() results
  before calling scanBlocklist.


────────────────────────────────────────────────────────────────────────
  major [Functional Correctness]
  → scripts/check-content-parity.ts:63-81

  Parity check silently "passes" if both locale roots are missing.

  If {root}/de and {root}/en both don't exist (wrong --root, renamed
  directory, misconfig), listFilesRelative returns [] for both,
  parityFailures is empty, and the script prints "[parity] OK" even
  though nothing was actually verified. This defeats the purpose of the
  I18N-02 gate in exactly the failure mode it should catch.





  🛡️ Proposed fix

   function checkParity(root: string): Failure[] {
     const deDir = join(root, "de");
     const enDir = join(root, "en");
  +  if (!existsSync(deDir) || !existsSync(enDir)) {
  +    throw new Error(
  +      `[parity] Expected locale directories not found: ${deDir} and/or ${enDir}.`,
  +    );
  +  }
     const deFiles = new Set(listFilesRelative(deDir));
     const enFiles = new Set(listFilesRelative(enDir));


────────────────────────────────────────
Review complete
15 findings ✔

Major    6
Minor    9
────────────────────────────────────────

Print all AI prompts: coderabbit review --show-prompts
```

---

## Gemini Review

**FAILED** — Gemini API returned HTTP 503 ("This model is currently experiencing high demand") on every attempt: default pro model (2 tries) and `gemini-flash-latest` / `gemini-2.5-flash` fallbacks. No review produced. Retry when Google's capacity recovers.

---

## Codex Review

**FAILED** — `codex exec` (model `gpt-5.4-pro` via Azure provider) errored with `invalid_payload` / "The provided data does not match the expected schema" after loading the repo and starting the review, on both attempts. Looks like a provider-side payload/schema issue, not a prompt problem. No review produced.

---

## Antigravity Review

**FAILED** — `agy --print-timeout 300s -p` hung in its agentic Cascade phase (code_search/grep loop) well past the 5-minute cap and never wrote a `PLANNER_RESPONSE` to its transcript (watermark stayed at 12 lines). This is the documented failure mode on large, file-path-rich prompts. Process terminated; no review produced.

---

## Consensus Summary

Only two reviewers ran this round: **Cursor** (full source-grounded plan review) and **CodeRabbit** (diff-only). Where they overlap, agreement is strong; the deep plan-level judgment comes from Cursor, and CodeRabbit independently corroborates several of its concerns from the actual diff.

### Agreed Strengths

- **Architecture matches the real repo.** Cursor verified the plans extend `src/app/[locale]/page.tsx` and reuse established content accessors (`src/lib/content.ts:39-61`) rather than rewriting; wave ordering (`prebuild` CV → `next build`) matches `package.json`. CodeRabbit raised no structural objections to the plan design — its findings are localized fixes, which is consistent with a sound overall approach.
- **DSGVO posture is disciplined** — build-time-only GitHub fetch with `server-only` + graceful fallback, cookieless analytics, script-only react-pdf, static OG images (Cursor).
- **Concrete per-plan threat models and a real human cutover gate** (02-07) rather than checkbox security (Cursor).

### Agreed Concerns (highest priority — raised by both, or high-severity)

1. **Performance budget contradicts the phase's own success criterion (both reviewers).** `lighthouserc.json` allows LCP **3000ms** while ROADMAP criterion 4 / TECH-01 require CWV "good" (LCP **< 2500ms**), and the CI comment in `.github/workflows/ci.yml:41` is out of sync with the actual thresholds. Plans can pass CI while failing the stated goal. **Fix before Wave 4:** set LCP max to 2500 and add an INP (or TBT proxy) assertion; align 02-06 acceptance with the ROADMAP wording verbatim.
2. **HIGH — Value-prop single-source-of-truth conflict (Cursor).** Plan 01 writes `home.valueProp` to `messages/*.json`, but Plan 02 requires the CV to render the value prop from **content modules only** (`ContactInfo` has no `valueProp` field — `content/shared/types.ts:77-83`). Site and PDF will diverge. **Fix:** add `valueProp` to the content model (schema + `content/{de,en}/contact.ts`) and consume it in hero + CV, or explicitly accept messages as i18n chrome.
3. **CV CTA can 404 if merged out of order (both reviewers).** Plan 01 ships the download button while Plan 02 produces the PDF; CodeRabbit flags `02-01-PLAN.md:134` explicitly. **Fix:** make Plan 02 a hard prerequisite or gate the CTA until the PDF exists (not just "same PR" by convention).
4. **UI-SPEC reopens a locked decision (CodeRabbit).** `02-UI-SPEC.md:45` still allows an optional header CV mirror, but D-C is locked to the contact block only in `02-CONTEXT.md`. **Fix:** remove the optional placement from the spec.
5. **Production `GITHUB_TOKEN` dependency (Cursor).** If the token is absent on the production Vercel build, lsiem.de ships the fallback activity line until the next rebuild. **Fix:** make "token present in Production env" a blocking Plan 06 pre-cutover check, not only a manual step-7 note.
6. **02-06 plan cannot satisfy its own acceptance (CodeRabbit).** The CSP fallback path requires a `STATE.md` blocker entry, but `STATE.md` is not in `files_modified`. **Fix:** add the file to scope or drop the bookkeeping requirement.

### Lower-priority / mechanical (mostly CodeRabbit diff findings, worth folding into execution)

- **Legal launch blocker:** Impressum still contains placeholder address (`content/en/pages/impressum.mdx:16`) — required under § 5 DDG before cutover.
- `formatMonth` in `page.tsx:27` doesn't guard malformed `YYYY-MM` input (renders `undefined/YYYY`).
- `career.ts:37` middle role has `from`/`to` both `null` — breaks timeline chronology.
- 02-03 theme toggle mixes `role="group"`+`aria-pressed` with `radiogroup`+`aria-checked` — pick one ARIA pattern.
- `check-content-parity.ts`: only the first `blocklist.txt` is scanned; parity check silently "passes" if both locale roots are missing (Phase 1 code, but it's the confidentiality/i18n gate this phase relies on).
- Cursor LOW items: add `server-only` to deps; loosen Plan 05 `depends_on` to `[02-01]`; brittle RED-verify greps; per-slug OG build surface; a11y Tab-order eval fragility.

### Divergent Views

- **No direct contradictions.** The two reviewers operate at different altitudes (Cursor = plan/architecture, CodeRabbit = line-level diff), so they complement rather than conflict. The one thing to weigh: CodeRabbit's finding to "remove the optional header CV mirror" (treating the locked decision as authoritative) vs. the UI-SPEC still offering it — resolve by editing the spec, not by reopening D-C.
- **Coverage gap, not disagreement:** three of five reviewers failed this run. If a stronger second grounded opinion is wanted before execution, re-run `/gsd-review --phase 2 --gemini --codex` once those providers recover — the current consensus rests primarily on Cursor.

### Overall Risk: **MEDIUM**

Cursor's assessment stands: architecture and sequencing are strong and repo-accurate; the real risks are content-model drift (value prop / about copy), verification gaps (LCP/INP thresholds), and operational cutover (production token, Impressum). None require structural rewrites — all are small plan amendments best made before or during Wave 1.
