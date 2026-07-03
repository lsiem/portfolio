---
phase: quick-260703-flk
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - vercel.json
  - .github/CI-TROUBLESHOOTING.md
  - evals/case-studies.spec.ts
  - content-collections.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - CI "Lint & Build" job passes the Setup pnpm step (pnpm/action-setup@v4 resolves the version from package.json packageManager)
    - Vercel deploy uses the Next.js framework preset and no longer expects a dist output directory
    - The case-study Playwright spec asserts an actual HTTP 200 response for detail pages in both locales
  artifacts:
    - package.json with `"packageManager": "pnpm@11.1.2"`
    - vercel.json with `"framework": "nextjs"`
    - .github/CI-TROUBLESHOOTING.md documenting both real failure modes with symptom + resolution
  key_links:
    - pnpm/action-setup@v4 reads packageManager from package.json — the workflow intentionally has no `version` key, so package.json is the single source of truth
    - vercel.json framework field overrides the stale Vite preset in the Vercel project dashboard
---

<objective>
Fix the two failing checks on PR #1 (branch `cursor/portfolio-rewrite-a2cc`) and address the actionable ECC bot follow-up suggestions.

Purpose: Unblock the PR. CI fails at the Setup pnpm step (no pnpm version declared anywhere), and the Vercel deploy fails because the project dashboard still carries the Vite framework preset from the discarded SPA and looks for a `dist` output directory after a successful Next.js build.

Output: Green CI + green Vercel deploy on the PR, a short CI failure-modes doc capturing the two real failures as evidence, a tightened Playwright assertion, and (if trivially mechanical) silenced content-collections deprecation warnings.
</objective>

<execution_context>
@$HOME/.claude/gsd-core/workflows/execute-plan.md
@$HOME/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@package.json
@.github/workflows/ci.yml
@evals/case-studies.spec.ts
@content-collections.ts

Diagnosis is already done — do NOT re-investigate the failures:
1. CI: `pnpm/action-setup@v4` errors with "No pnpm version is specified..." — package.json has no `packageManager` field. Local pnpm is 11.1.2 (the lockfile was generated with it).
2. Vercel: "Error: No Output Directory named 'dist' found after the Build completed." — the dashboard framework preset is still Vite. A repo-level `vercel.json` with `"framework": "nextjs"` overrides the dashboard preset.
3. ECC bot suggestions: (a) CI failure-mode evidence doc → genuine, do it. (b) Browser coverage for locale pages → already covered by evals/home.spec.ts, i18n.spec.ts, case-studies.spec.ts; only tighten the one weak assertion (status-200 test that never checks the status). (c) "sync config templates" / "config quality evidence" → consciously skipped, record in SUMMARY.

All work lands on the currently checked-out branch `cursor/portfolio-rewrite-a2cc`.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Declare pnpm version in package.json and pin Vercel to the Next.js preset</name>
  <files>package.json, vercel.json</files>
  <action>
    1. In package.json, add a top-level `"packageManager": "pnpm@11.1.2"` field (place it after `"private": true`). This is the exact local pnpm version that generated pnpm-lock.yaml, and it is the value `pnpm/action-setup@v4` reads. Do NOT add a `version` key to .github/workflows/ci.yml — package.json stays the single source of truth so CI and local can never drift.
    2. Create `vercel.json` at the repo root with exactly:
       `{ "$schema": "https://openapi.vercel.sh/vercel.json", "framework": "nextjs" }`
       This overrides the stale Vite preset in the Vercel project dashboard, which currently makes the deploy look for a `dist` output directory after the (successful) Next.js build. Do not add `buildCommand`/`outputDirectory` overrides — the Next.js preset defaults are correct.
  </action>
  <verify>
    <automated>node -e "const p=require('./package.json'); if(p.packageManager!=='pnpm@11.1.2'){console.error('packageManager missing/wrong');process.exit(1)}" && node -e "const v=require('./vercel.json'); if(v.framework!=='nextjs'){console.error('vercel.json framework wrong');process.exit(1)}" && pnpm install --frozen-lockfile</automated>
  </verify>
  <done>package.json declares `packageManager: pnpm@11.1.2`, vercel.json exists with `framework: nextjs`, and `pnpm install --frozen-lockfile` still succeeds locally (proves the pinned version matches the lockfile).</done>
</task>

<task type="auto">
  <name>Task 2: Capture CI failure-mode evidence and tighten the case-study status assertion</name>
  <files>.github/CI-TROUBLESHOOTING.md, evals/case-studies.spec.ts</files>
  <action>
    1. Create `.github/CI-TROUBLESHOOTING.md` — a short, factual doc (aim for under ~60 lines) capturing the two REAL failures observed on PR #1 as evidence. For each: a heading, the exact symptom (error message quoted from the failed run), root cause, and resolution:
       - Failure 1 — "Setup pnpm" step: pnpm/action-setup@v4 fails with "No pnpm version is specified..." when neither the action config nor package.json declares a version. Root cause: missing `packageManager` field. Resolution: `"packageManager": "pnpm@11.1.2"` in package.json; the workflow intentionally omits a `version` key.
       - Failure 2 — Vercel deploy: "No Output Directory named 'dist' found after the Build completed" despite a successful `next build`. Root cause: Vercel dashboard framework preset was still Vite (leftover from the discarded SPA). Resolution: repo-level vercel.json with `"framework": "nextjs"` overrides the dashboard preset.
       Do not pad the doc with hypothetical failure modes — evidence only.
    2. In `evals/case-studies.spec.ts`, fix the "page responds with 200" test: it currently only asserts `body` is visible (and its comment wrongly claims Playwright throws on 404 — `page.goto` does not throw on 404). Replace the body of that test with its own `page.goto` capturing the response: `const response = await page.goto(\`/${locale}/case-studies/${SLUG}\`); expect(response?.status()).toBe(200);` and remove the misleading comment. Leave the other tests untouched — home.spec.ts, i18n.spec.ts, and the remaining case-study tests already cover both locale pages; do not add redundant specs.
  </action>
  <verify>
    <automated>test -f .github/CI-TROUBLESHOOTING.md && pnpm exec playwright test evals/case-studies.spec.ts</automated>
  </verify>
  <done>.github/CI-TROUBLESHOOTING.md exists documenting exactly the two observed failures with symptom + resolution; the case-study spec genuinely asserts HTTP 200 for both locales and the full case-studies spec passes.</done>
</task>

<task type="auto">
  <name>Task 3: Silence content-collections deprecation warnings (only if mechanical)</name>
  <files>content-collections.ts</files>
  <action>
    <!-- planner-discipline-allow: deprecat -->
    The Vercel build log shows two content-collections warnings for content-collections.ts: the `collections` property of `defineConfig` is superseded by `content`, and the implicit `content` property on documents is superseded by an explicit opt-in. Run `pnpm build` once and read the exact warning text, then apply ONLY the mechanical renames the warnings themselves prescribe (e.g. `defineConfig({ collections: [...] })` → `defineConfig({ content: [...] })`, and making the document `content` explicit in the transform return instead of relying on the `...doc` spread). Consult node_modules/@content-collections docs/types if the warning text is ambiguous.

    CRITICAL constraint: the transform's returned object must keep the raw MDX prose available (currently via `...doc` retaining `doc.content`) — Phase 2's CV-PDF generation and the v2 AI chat depend on it (CONT-01, per the existing comment in the file). Preserve that comment's intent.

    Bail-out rule: if the fix is anything more than a small config rename (API signature changes, schema changes, version bump needed), SKIP this task entirely, leave content-collections.ts untouched, and record the skip + reason in the SUMMARY. This task is opportunistic, not required for the PR to go green.
  </action>
  <verify>
    <automated>pnpm build > /tmp/cc-build.log 2>&1 && ! grep -qi "deprecat" /tmp/cc-build.log</automated>
  </verify>
  <done>Either: `pnpm build` succeeds with zero content-collections deprecation warnings and the transform still exposes raw MDX prose alongside compiled MDX, locale, and slug — or the task was skipped per the bail-out rule with the reason recorded in the SUMMARY.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| GitHub Actions runner | CI config changes alter what executes in the runner |
| Vercel build/deploy | vercel.json alters framework detection and deploy behavior |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-quick-01 | Tampering | package.json packageManager pin | low | mitigate | Pin exact version `pnpm@11.1.2` matching the committed lockfile; `pnpm install --frozen-lockfile` in Task 1 verify proves lockfile integrity |
| T-quick-02 | Tampering | vercel.json | low | accept | Config contains only `$schema` + `framework: nextjs`; no build command or output overrides that could redirect artifacts. No secrets involved. |
| T-quick-SC | Tampering | npm/pip/cargo installs | low | accept | No new packages are installed by this plan — all changes are config/doc/test edits against existing dependencies |
</threat_model>

<verification>
1. `pnpm install --frozen-lockfile && pnpm lint && pnpm exec tsc --noEmit && pnpm build` — the full local mirror of the CI job passes.
2. `pnpm exec playwright test evals/case-studies.spec.ts` passes with the strengthened 200-status assertion.
3. After push: PR #1's "Lint & Build" check reaches the install step (pnpm resolved from packageManager) and the Vercel deployment succeeds using the Next.js preset. Check with `gh pr checks 1`.
</verification>

<success_criteria>
- CI no longer fails at "Setup pnpm"; pnpm 11.1.2 is resolved from package.json.
- Vercel deploy no longer errors about a missing `dist` directory.
- .github/CI-TROUBLESHOOTING.md captures both real failures (evidence, not hypotheticals).
- Case-study spec asserts real HTTP 200 in both locales; no redundant tests added.
- ECC suggestions (c) — config template sync and harness config quality evidence — recorded in the SUMMARY as consciously skipped (low value for a solo portfolio).
- Content-collections deprecation warnings silenced, or skip reason recorded.
</success_criteria>

<output>
Create `.planning/quick/260703-flk-fix-pr-1-failing-checks-ci-pnpm-version-/260703-flk-SUMMARY.md` when done. Include the consciously-skipped ECC bot suggestions (config template sync, harness config quality evidence) with a one-line rationale each, and the Task 3 outcome (fixed vs skipped + reason).
</output>
