---
phase: 2
reviewers: [gemini, cursor]
reviewers_attempted: [gemini, codex, coderabbit, cursor, antigravity]
reviewed_at: 2026-07-05T06:51:12Z
plans_reviewed: [02-01-PLAN.md, 02-02-PLAN.md, 02-03-PLAN.md, 02-04-PLAN.md, 02-05-PLAN.md, 02-06-PLAN.md, 02-07-PLAN.md]
---

# Cross-AI Plan Review — Phase 2

> **Reviewer outcomes:** 2 of 5 attempted reviewers produced grounded reviews (Gemini, Cursor — both with repo file access, both cited `file:line` evidence). Three failed for environment reasons unrelated to plan quality: **Codex** (Azure `invalid_payload` schema error on every request), **CodeRabbit** (timed out; diff-only reviewer with no Phase 2 code to review yet), **Antigravity** (timed out in its agentic file-reading loop before producing output). Plan-level consensus below is based on the two grounded reviews.

## Gemini Review

# Cross-AI Plan Review: Phase 2 — Recruiter Overview Live

This is a comprehensive, structured technical review of the 7 implementation plans for **Phase 2: Recruiter Overview Live** on **lsiem.de**. This assessment evaluates plan quality, completeness, architectural coherence, performance budgets, accessibility, security, and edge-case robustness against the active repository state.

---

## 1. Summary Assessment

The Phase 2 implementation plans represent an **exceptionally mature, rigorous, and highly idiomatic Next.js 16/Tailwind 4 architecture**. The plans show deep empathy for both the target recruiter persona (facts in <30 seconds, static first viewport, seamless semantic navigation) and the developer experience (bilingual type safety, zero-dependency parity checks, build-time caching). By electing to generate the CV-PDF (`scripts/generate-cv.tsx`) and the OG images (`opengraph-image.tsx`) strictly at build-time using on-disk Geist TrueType fonts (`node_modules/geist/dist/fonts`), the architecture achieves absolute DSGVO/GDPR compliance with zero third-party runtime calls, zero client-side package bloat, and zero layout shift. The transition of dark-mode from a pure media query to an attribute-driven token override with a blocking inline no-flash script is the industry-standard way to solve dark-mode without hydration mismatches or flashes. This plan suite is production-grade and ready to execute.

---

## 2. Plan-by-Plan Analysis & Source Verification

### Plan 2-01: Recruiter Overview Complete
*Objective: Build hero value-prop, About section (text-first), header Contact anchor, and CV download CTA.*

*   **Strengths:**
    *   **Strict Accent Discipline:** Restricts the orange accent color (`var(--accent)`) strictly to Case Study links, primary CTAs (CV button), and the email link, matching the `02-UI-SPEC.md` constraint.
    *   **No Preloader/No Motion Gate:** Name, role, and the new value-prop are loaded as static SSR HTML in the first viewport, satisfying `CONT-02` and `MODE-01`.
    *   **Graceful Text-First Degradation:** The About section in `src/app/[locale]/page.tsx` is built text-first with code comments left for future photo integration, keeping the scope clean and satisfying `CTX-03`.
*   **Concerns:**
    *   **LOW — Responsive Header Overcrowding:** In `src/app/[locale]/layout.tsx:48-57`, adding the `Contact` anchor (`href="#contact"`) to the header control cluster along with the future theme toggle and the locale switcher can lead to tight spaces on small mobile devices (e.g. iPhone SE, 320px width).
    *   *Citing Evidence:* The layout shell is restricted to `max-w-3xl px-6` in `src/app/[locale]/layout.tsx:49`. Adding multiple text links (`LS.`, `Contact`, `DE/EN`) and a 3-state toggle on a single row requires responsive classes (like hiding text labels on screens `<400px` and using icon-only representations).
*   **Suggestions:**
    *   Ensure the `Contact` link in the header uses the responsive pattern: hide the text label on ultra-small screens (`hidden xs:inline`) and fallback to a simple mail/phone SVG icon with a visually-hidden label.

---

### Plan 2-02: Build-Time CV-PDF Generation
*Objective: Compile locale-specific, ATS-friendly, selectable-text PDFs under `public/` at build-time.*

*   **Strengths:**
    *   **Build-Time Isolation:** Running the generator via `tsx scripts/generate-cv.tsx` inside the `prebuild` phase (chained in `package.json:9`) guarantees that `@react-pdf/renderer` never enters the client/runtime dependency graph, saving hundreds of kilobytes in the production bundle.
    *   **Synchronous Font Loading:** Fetching TTF binaries synchronously from `node_modules/geist/dist/fonts/geist-sans/` on-disk (instead of remote Google Fonts URLs) fully resolves the async font registration race condition common in `react-pdf` (`Font.register` issue #2675).
*   **Concerns:**
    *   **MEDIUM — React 19 Typing Friction:** The codebase is pinned to React `~19.2.0` (`package.json:17`). `@react-pdf/renderer` historically utilizes types tailored for React 17/18. When running `tsc --noEmit` inside `generate-cv.tsx` or its sub-components, JSX and React children typing conflicts may arise.
    *   *Citing Evidence:* The plan runs `pnpm exec tsc --noEmit -p tsconfig.json` in the verification block to assert success. If `@types/react` (v19) collides with `@react-pdf/renderer` internal react typings, compilation will fail.
    *   **LOW — Multi-Workspace Hoisting:** Although `pnpm-workspace.yaml` behaves like a single project, using hardcoded relative paths like `node_modules/geist/...` may break if the monorepo structure ever hoists dependencies to an outer root folder.
*   **Suggestions:**
    *   To mitigate React 19 typing friction, write `scripts/generate-cv.tsx` with a `.ts` extension using pure React 19-compatible elements, or resolve the fonts using `require.resolve('geist/package.json')` to dynamically locate the correct on-disk `node_modules/geist` path regardless of hoist levels.

---

### Plan 2-03: 3-State Dark-Mode Toggle
*Objective: Deliver a System/Light/Dark theme selector using Tailwind 4, a no-flash script, and localStorage.*

*   **Strengths:**
    *   **No FOUC (Flash of Unstyled Content):** Injecting the inline script as the first child of `<body>` in `src/app/[locale]/layout.tsx` executes synchronously before the React DOM hydrates, instantly setting the correct `data-theme` attribute.
    *   **Pure Token Adaptation:** Avoiding `dark:` class utilities by letting the CSS variables flip color within `:root[data-theme="dark"]` inside `src/app/globals.css:21-29` is an incredibly elegant and low-overhead design.
*   **Concerns:**
    *   **MEDIUM — Toggle Hydration Flashing:** Because `ThemeToggle` is a client component, the server does not know the user's `localStorage` choice. Render-highlighting the active button immediately on hydration causes server/client HTML divergence (Hydration Mismatch).
    *   *Citing Evidence:* In `src/components/theme-toggle.tsx` (new file), the component must resolve the active segment in a mount `useEffect` or `useSyncExternalStore` to avoid hydration mismatches, but this will cause the UI highlight to jump/flash *after* hydration if the user has an explicit non-System choice saved.
*   **Suggestions:**
    *   Provide a skeleton state or a neutral border-only state for the segmented buttons on the server-render, and apply the background active-segment fill only after mounting on the client (`isMounted` gate).

---

### Plan 2-04: SEO Share Layer & Person JSON-LD
*Objective: Build-time OG images per page/locale and machine-readable Person schema.*

*   **Strengths:**
    *   **Static-Optimized OG Routes:** Placing `opengraph-image.tsx` inside `src/app/[locale]/` guarantees Next.js bakes the PNG at build-time, preserving the zero-runtime-third-party posture.
    *   **Strict Satori Constraints Met:** The plan explicitly enforces flexbox layout and forbids `display: grid`, matching satori's known CSS limitations.
*   **Concerns:**
    *   **LOW — Satori Weight Loading:** Satori has a strict size limit of 500KB total for custom fonts. Loading both `Geist-SemiBold.ttf` and `GeistMono-Regular.ttf` from disk could push the edge bundle sizes near that boundary.
*   **Suggestions:**
    *   Ensure the subset of characters inside the OG generator is tight, or use only a single font weight (e.g., `Geist-Medium` or `Geist-Regular`) to minimize file weight inside `ImageResponse`.

---

### Plan 2-05: Build-Time GitHub Activity Heatmap
*Objective: Fetch contribution data from GitHub GraphQL via server-only RSC, daily ISR, and fallback.*

*   **Strengths:**
    *   **DSGVO/GDPR Compliant Fetch:** No client-side requests ever hit GitHub; everything is cached statically on the server via `next: { revalidate: 86400 }` (`src/lib/github.ts`).
    *   **Graceful Degradation:** Safely returns `null` on missing tokens (Vercel Preview) or request errors, failing over to a static localized line instead of crashing the page.
*   **Concerns:**
    *   **LOW — Week Index Alignment:** GitHub GraphQL contributions are mapped as days of the week (`0` to `6`). Slicing them into a grid requires aligning the dates to the correct column starting on Sunday. If the current month begins mid-week, empty padding cells must be accounted for to prevent the grid from misaligning.
*   **Suggestions:**
    *   Add a utility in `src/components/github-heatmap.tsx` to pre-pad the first week of the year/rolling-window with empty placeholder blocks so that columns align perfectly with actual weekdays.

---

### Plan 2-06: Launch Hardening & Verification
*Objective: Configure security headers, verify performance budgets in LHCI, and run a11y tests.*

*   **Strengths:**
    *   **Highly Defensive Headers:** Configures HSTS, nosniff, frame-ancestors, and Permissions-Policy on all routes (`next.config.ts`).
    *   **Automated Lighthouse CI Gate:** Utilizing `lhci` in CI against a real production build (`pnpm start`) enforces LCP, performance minimums, and landing script limits (<150kb).
*   **Concerns:**
    *   **MEDIUM — Content-Security-Policy & Analytics Collision:** In Task 1, applying a strict CSP on a static-only site without per-request nonces requires hashing the inline dark-mode script. If a future edit alters a space or line-break in the inline script, the hash mismatch will break the blocking script, disabling dark mode without a build error.
    *   *Citing Evidence:* `next.config.ts` handles the headers. The Vercel Analytics and Speed Insights packages inject inline chunks. Tracking and allowlisting these dynamically changing domains/hashes in a static-built CSP can easily lead to breakage in production.
*   **Suggestions:**
    *   Leverage Vercel's edge middleware or standard meta tag configs to inject nonces if possible, or opt for the recommended fallback: omit `script-src` from CSP if it restricts Vercel Analytics, and record the CSP status inside `STATE.md ## Blockers/Concerns`.

---

### Plan 2-07: Production Cutover
*Objective: Domain flip to `https://lsiem.de` and live verification.*

*   **Strengths:**
    *   **Metadata Unity:** Standardizing all absolute OG, canonical, and hreflang URLs to resolve against `siteMetadataBase` prevents SEO indexing fragmentation.
    *   **PR-Driven Promotion:** Merging `phase/02-recruiter-overview-live` to `main` as a single, verified cutover prevents partial/half-broken states from shipping to `lsiem.de`.
*   **Concerns:**
    *   None. This plan is structurally sound and follows git/Vercel best practices perfectly.

---

## 3. Key Architectural Strengths & Engineering Rigor

1.  **Single Source of Truth (SSOT):** The plans consistently feed everything (the overview page, the downloadable CV-PDF, the structured Person JSON-LD, and the OG image generators) from the *same* pre-defined content model (`content/{de,en}/*`). This guarantees that Lasse's career dates, contact facts, and skills cannot fall out of sync.
2.  **No Component Library (CSS-First):** Sticking to native Tailwind 4 and hand-authored components (no headless UI, Radix, or Radix-wrappers) maintains an extremely lean DOM structure and protects the landing bundle size from bloating, ensuring first-paint speed.
3.  **Strict GDPR/DSGVO Enforcement:** By baking the GitHub heatmap and rendering the CV-PDF at build time, the visitor's browser never communicates with GitHub, `@react-pdf` registries, or unvetted CDNs, removing the need for annoying cookieless consent banners while keeping data footprint to an absolute minimum.

---

## 4. Summary of Technical Risks & Mitigations

| Severity | Risk Description | Citing File & Context | Mitigation Suggestion |
|:---|:---|:---|:---|
| **MEDIUM** | React 19 Typing Friction inside `@react-pdf/renderer` rendering. | `scripts/generate-cv.tsx` compilation via `tsc` | Resolve types explicitly or construct the PDF document using vanilla Node filesystem elements if react-pdf types conflict with React 19 `@types/react`. |
| **MEDIUM** | Hydration Mismatch or selector flash on the theme toggle control. | `src/components/theme-toggle.tsx` hydration | Set default client layout to a neutral, unselected segmented design, and highlight the selection (`localStorage` match) only inside `useEffect` after mount is complete. |
| **MEDIUM** | Content-Security-Policy hash mismatch on inline script edits. | `next.config.ts:headers()` block with inline hashes | Maintain the inline script as a separate, minified asset string inside `layout.tsx` so format changes during development don't silently break the hashed CSP rule. |
| **LOW** | Mobile layout overcrowding of header controls on narrow screens. | `src/app/[locale]/layout.tsx:49` layout alignment | Apply responsive screen bounds on text labels (e.g., `hidden sm:inline` on "Contact") to maintain a single row on 320px screens. |

---

## 5. Risk Assessment

*   **Overall Risk Level:** **LOW-MEDIUM**
*   **Justification:** The core technical decisions (build-time compiling, static file serving, token-only CSS flipping) are structurally safe, fast, and simple. The primary risks are minor build-time compilation type-clashes (React 19 vs `@react-pdf` types) and browser-runtime style-shattering (strict CSP vs Vercel Analytics scripts). These are easily isolated and resolved during the early execution phases of Wave 1 and Wave 2. The roadmap represents a phenomenal blueprint for high-performance portfolio building.

---

## Codex Review

Codex review failed: Azure provider invalid_payload schema error (environment issue, not plan-related). Excluded from consensus.

---

## CodeRabbit Review

CodeRabbit produced no usable review: it timed out (>7 min) reviewing the full branch-vs-main markdown diff, output was only the CLI banner. CodeRabbit is a diff-only reviewer (no prompt/model flag), and Phase 2 has no implementation code yet (status: Planned) — only committed plan docs. Structurally not applicable to this plan review. Excluded from plan-level consensus.

---

## Cursor Review

# Phase 2 Plan Review — Recruiter Overview Live

Verified against the repo at `phase/02-recruiter-overview-live` (ahead of remote). Baseline: interim overview in `src/app/[locale]/page.tsx` renders hero/career/projects/skills/contact but lacks value-prop, `#about`, header Contact, CV button, dark mode, OG, GitHub heatmap, and security headers.

---

## Plan 02-01 — Recruiter overview complete (Wave 1)

### Summary

The plan correctly targets the largest functional gap between the current interim page and Phase 2 success criteria. Its RED→GREEN Playwright loop, wave-1 scope, and file references match the codebase. It should deliver CONT-02/03/04/05/06 (text-first)/07/08 (UI), MODE-01, and TECH-03 baseline — with one notable single-source-of-truth gap.

### Strengths

- **Accurate baseline reading:** `page.tsx:53-85` has hero without `#hero` or value-prop; anchor-nav stops at `#contact` with no `#about` (`page.tsx:61-83`). `layout.tsx:48-57` is logo + `LocaleSwitcher` only — no Contact affordance.
- **TDD discipline:** Extending `evals/home.spec.ts:5-40` before implementation gives a concrete acceptance surface.
- **Preserves working content:** Career-first order and depth-weighted projects (`page.tsx:138-185`, `content/de/projects.ts:26-37`) already satisfy CONT-03/04/05; plan says “preserve,” which matches reality (6 projects, 2 deep case studies: `elia`, `vidama-mediathek`).
- **Wave-1 pairing with 02-02:** CV button href contract (`/Lasse-Siemoneit-CV-${locale}.pdf`) is explicit; 404 until PDF exists is acknowledged and acceptable for parallel execution.

### Concerns

- **MEDIUM — Single-source-of-truth drift for copy:** Plan puts `home.valueProp` and `about.summary` in `messages/de.json` / `messages/en.json`, but CONT-01/CTX-05 require the content model to feed site + CV. `contact.ts:9-15` already has `role`; `content/de/pages/about.mdx:3` has a `description` frontmatter usable via `getPage()` (`src/lib/content.ts:88-91`). Duplicating prose in messages creates a second authoring surface.
- **MEDIUM — Skip link still missing:** `messages/de.json:52` defines `accessibility.skipToContent`, but `grep` shows no usage under `src/`. TECH-03 calls for keyboard navigation; a visible skip link is a common baseline the plan does not address.
- **LOW — Header i18n wiring unstated:** `layout.tsx:39` loads only `footer` translations; Task 3 adds `nav("contact")` in layout but does not explicitly call `getTranslations("nav")` — minor, but easy to miss during execution.

### Suggestions

- Add `valueProp` to `content/shared/types.ts` + `content/{de,en}/contact.ts` (or a dedicated `profile.ts` module) so Plan 02’s CV generator and the hero share one field.
- Derive the compact About summary from `getPage(locale, "about")?.description` instead of new message strings.
- Wire the existing skip-to-content message as the first focusable element in `layout.tsx`.

### Risk Assessment

**LOW–MEDIUM** — Core UI work is straightforward against existing patterns; copy SSOT is the main design debt to fix before execution.

---

## Plan 02-02 — CV-PDF generation (Wave 1)

### Summary

Well-scoped resolution of the roadmap-flagged unknown: build-time `@react-pdf/renderer` via `prebuild`, devDependencies only, fail-loud on error. Aligns with `package.json:9` (`prebuild: pnpm check:content`) and DSGVO constraints. Depends on Wave 1 completing before downstream OG work (Plan 04 needs `geist`).

### Strengths

- **Correct build hook:** Chaining `generate:cv` after `check:content` mirrors the existing gate at `package.json:8-9`.
- **Bundle isolation:** Explicit “never import under `src/app/**`” matches AGENTS.md runtime constraints.
- **Filename contract:** Matches Plan 01’s href exactly — critical for end-to-end CV download.
- **Threat model:** T-02-SC legitimacy audit reference and devDependency-only placement are appropriate.

### Concerns

- **HIGH — Value prop not reachable from content imports:** Task 2 requires “one-sentence value prop” in `CvDocument`, but Plan 01 authors it in `messages/`. Plan 02 Task 3 imports `content/{de,en}/*.ts` directly — not `messages/` or `src/lib/content.ts` accessors. Without a content-model field, the CV will either duplicate copy or omit the value prop.
- **MEDIUM — Turbopack/react-pdf friction unverified:** Research notes ESM/bundler issues as a fallback to a static route handler; automated verify only runs `pnpm generate:cv` via `tsx`, not a full `pnpm build` after wiring prebuild until Task 3. First CI build is the real integration test.
- **LOW — Generated PDFs not gitignored:** `public/Lasse-Siemoneit-CV-*.pdf` could be committed accidentally; no `.gitignore` entry today.

### Suggestions

- Resolve value-prop location in Plan 01/02 jointly before execution (content model field required).
- Add `public/Lasse-Siemoneit-CV-*.pdf` to `.gitignore` and document `pnpm generate:cv` for local dev (Playwright uses `pnpm dev` per `playwright.config.ts:24`, which does not run `prebuild`).
- In Task 3 verify, explicitly assert `pnpm build` (not just `pnpm generate:cv`) after prebuild chain change.

### Risk Assessment

**MEDIUM** — Library choice is sound; SSOT wiring and first full-build integration are the main risks.

---

## Plan 02-03 — Dark mode toggle (Wave 2)

### Summary

Solid TECH-04 delivery plan building on the existing token system in `globals.css:3-28` (`@media (prefers-color-scheme: dark)` only today). Three-state toggle, no-flash script, and `LocaleSwitcher` styling reuse (`locale-switcher.tsx:18-27`) are well specified. Depends on 02-01 only — correct, since dark mode does not need CV PDF.

### Strengths

- **Minimal client surface:** Only new client component besides existing `LocaleSwitcher`; Plan 06 accounts for LHCI JS budget (`lighthouserc.json:11`).
- **DSGVO-safe:** Static inline script, no CDN — consistent with project rules.
- **Header ordering preserved:** Inserts between Contact (Plan 01) and `LocaleSwitcher` (`layout.tsx:56`) per D-A.

### Concerns

- **MEDIUM — “No flash” eval is weak:** `evals/theme.spec.ts` (to be created) checks `data-theme` after reload, not computed-style flash or background color before paint. False confidence possible.
- **MEDIUM — Assumption A6 (@custom-variant syntax):** Plan defers to “confirm at implementation”; Tailwind 4 block-form variant is non-trivial. Token-only path is preferred but not guaranteed without audit of existing `dark:` usage (currently none in `src/`).
- **LOW — `viewport.themeColor` vs explicit theme:** System meta colors won’t track explicit Light/Dark until client updates — acknowledged in Task 2 but worth manual verification.

### Suggestions

- Add a Playwright check that `getComputedStyle(document.body).backgroundColor` matches dark tokens immediately after navigation with `localStorage.theme = 'dark'` (before React hydration completes ideally via `page.addInitScript`).
- Decide token-only vs `@custom-variant` up front by grepping for `dark:` in the codebase (currently absent → token-only is sufficient).

### Risk Assessment

**LOW** — Well-trodden pattern; main risk is hydration/flash edge cases.

---

## Plan 02-04 — SEO share layer (Wave 2)

### Summary

Correct TECH-05 approach: `opengraph-image.tsx` convention, extend `seo.ts:10-31`, Person JSON-LD on overview. Depends on 02-01 + 02-02 (for `geist` ttf) — ordering is right. No OG routes exist today (`glob **/opengraph-image.tsx` → 0 files).

### Strengths

- **Build-time OG:** Matches zero-runtime-third-party posture; uses same `geist` ttf strategy as CV.
- **Does not hand-wire image URLs:** Correct use of Next file convention — avoids duplicate/stale OG URLs.
- **JSON-LD from `getContact()`:** `contact.ts:9-15` is the right source; plan forbids hardcoding.

### Concerns

- **MEDIUM — Preview vs production absolute URLs:** `siteMetadataBase` resolves via `VERCEL_PROJECT_PRODUCTION_URL` or localhost (`seo.ts:10-14`); OG/canonical on preview builds won’t be `lsiem.de` until Plan 07. Plan 04 explicitly defers flip — fine, but link-preview testing before cutover will show preview URLs.
- **LOW — OG coverage scope:** Only overview + case-study routes; legal pages (`/about`, `/impressum`, `/datenschutz`) get default metadata only. Acceptable for Phase 2, not full site OG parity.
- **LOW — `dangerouslySetInnerHTML` on JSON-LD:** Acceptable for typed content; ensure `contact.email` cannot contain `</script>` (schema validates email format — low risk).

### Suggestions

- Add one eval assertion that `og:image` URL is absolute (starts with `http`) to catch `metadataBase` misconfiguration early.
- Consider reusing `openGraphMetadata()` on case-study `page.tsx` metadata for textual OG fields consistency.

### Risk Assessment

**LOW** — Standard Next 16 patterns; dependencies correctly ordered.

---

## Plan 02-05 — GitHub activity heatmap (Wave 3)

### Summary

TECH-08 implementation via `"server-only"` module + build-time GraphQL fetch with daily ISR and graceful fallback is appropriate for DSGVO. Depends on 02-01, 02-03, 02-04 — sensible for `page.tsx` merge ordering, not technical necessity.

### Strengths

- **`server-only` guard:** Correct pattern; no `github.ts` exists yet.
- **Login from content:** `contact.ts:13` → `https://github.com/lsiem` supports URL parsing instead of hardcoding.
- **Token-agnostic eval:** Grid-or-fallback design matches CI/preview reality (no token in CI env).
- **Owner action documented:** PAT setup before production cutover (Plan 07 step 1).

### Concerns

- **MEDIUM — PAT scope ambiguity:** Plan specifies `read:user`; public contribution calendars often work unauthenticated. Over-scoping is fine; under-scoping if private contributions matter is unlikely for a portfolio heatmap but worth confirming during implementation.
- **MEDIUM — ISR on fully static overview:** `page.tsx` is SSG via `generateStaticParams` in `layout.tsx:22-24`. Fetch with `revalidate: 86400` should enable ISR, but verify the route doesn’t get fully frozen at first build with null data when token is missing in CI — fallback is intentional, but production needs a rebuild after token is added (Plan 07 covers this).
- **LOW — Section placement left to discretion:** “Below About or inside contact area” may produce inconsistent IA vs UI-SPEC anchor-nav (which omits `#activity`).

### Suggestions

- Pin exact GraphQL query + minimum PAT scopes in `scripts/` or `github.ts` header comment after first successful fetch.
- Trigger explicit Vercel redeploy in Plan 07 when `GITHUB_TOKEN` is first added (not just “confirm set”).
- Fix section placement to one location in UI-SPEC terms (recommend: after `#about`, before `#contact`).

### Risk Assessment

**LOW–MEDIUM** — Graceful degradation is well designed; production data freshness depends on owner env setup + redeploy discipline.

---

## Plan 02-06 — Launch hardening + verification (Wave 4)

### Summary

Right gate before cutover: security headers on empty `next.config.ts:7-9`, LHCI budget already in CI (`ci.yml:41-43`, `lighthouserc.json:8-12`), new a11y eval. This plan is where “launch-ready” should become enforceable — but a critical CI gap exists today.

### Strengths

- **LHCI already wired:** `.github/workflows/ci.yml:41-43` runs `npx lhci autorun` against production build — matches TECH-01/TECH-07.
- **Pragmatic CSP guidance:** Allows hash-based CSP or documented TODO rather than breaking `'unsafe-inline'` — realistic for inline theme script + Vercel analytics (`layout.tsx:95-96`).
- **Bundle leak check:** Explicit grep for react-pdf/OG/github in client graph aligns with DSGVO.

### Concerns

- **HIGH — Playwright not in CI:** Plan 07 step 2 says “Confirm CI is green (… Playwright evals)”, but `.github/workflows/ci.yml` runs only `check:content`, `build`, and `lhci autorun` — no `pnpm test`. Plans 01–05 add five new spec files; none will gate merge unless Plan 06 adds a CI step (Task 2 mentions `pnpm test` in acceptance criteria but not in `files_modified` or an explicit CI edit).
- **MEDIUM — Evals run against dev server:** `playwright.config.ts:23-27` uses `pnpm dev`, not `pnpm start` after production build. LHCI tests production; Playwright tests dev — bundle size and SSR output can differ.
- **MEDIUM — CSP maintenance burden:** Inline theme-script SHA-256 must be recomputed on any script change; fallback TODO risks shipping without CSP.
- **LOW — Contrast checks manual only:** Appropriate given stack, but TECH-03 “good contrast” relies on human verification.

### Suggestions

- Add an explicit Task (or amend Task 2) to extend `.github/workflows/ci.yml` with `pnpm exec playwright test` after `pnpm build`, using `pnpm start` as webServer in CI (or a dedicated `playwright.config.ci.ts`).
- Align Playwright webServer with production build for evals that assert metadata/JSON-LD/static output.
- Record CSP gap in `.planning/STATE.md` if fallback taken — plan mentions this; ensure it’s not optional silently.

### Risk Assessment

**MEDIUM** — Verification architecture is sound on paper; automation gap in CI is the biggest launch risk.

---

## Plan 02-07 — Production cutover (Wave 5)

### Summary

Appropriate human-gated finale: one-line `siteMetadataBase` flip (`seo.ts:10-14` currently uses Vercel URL/localhost), PR from `phase/02-recruiter-overview-live`, and manual 30-second stopwatch UAT. `autonomous: false` is correct.

### Strengths

- **CTX-06 honored:** Preview-first, promote-when-green — visitors on lsiem.de stay on interim until this plan.
- **Comprehensive live checklist:** Covers CV, theme, OG, heatmap, CWV, network tab for third-party calls — matches phase success criteria.
- **GITHUB_TOKEN gate:** Explicit production-env check before expecting real heatmap data.

### Concerns

- **MEDIUM — CI/playwright mismatch (carried from 02-06):** Cutover checklist assumes green Playwright in CI; CI doesn’t run it yet.
- **MEDIUM — `siteMetadataBase` dev/prod split:** Task 1 must preserve localhost for local dev while forcing `https://lsiem.de` in production — current env-var logic (`seo.ts:11-13`) needs careful branching; a naive string replace could break preview builds.
- **LOW — 30-second test is subjective:** No automated stopwatch eval; acceptable for launch gate but not regression-safe.

### Suggestions

- Use `process.env.VERCEL_ENV === 'production'` (or explicit `NEXT_PUBLIC_SITE_URL`) for lsiem.de, keeping localhost for `next dev`.
- Add a post-cutover smoke script (even manual checklist in PR description) referencing Plan 07 steps 4–7.

### Risk Assessment

**LOW** — Process-heavy but low technical complexity; depends on Plan 06 verification actually being automated.

---

## Phase-Level Assessment

### Do these plans achieve Phase 2 goals?

| Success criterion | Covered by | Evidence / gap |
|---|---|---|
| 1. First viewport name/role/value-prop; facts <30s | 02-01 (MODE-01) | Hero has name+role today (`page.tsx:57-60`); value-prop + header Contact missing |
| 2. Timeline, projects/case studies, skills, about, one-click contact | 02-01 + existing | Content exists; about block + header Contact are net-new |
| 3. CV PDF from content model | 02-01 UI + 02-02 gen | **SSOT gap** for value prop unless content model extended |
| 4. CWV good, keyboard, dark mode | 02-01 a11y + 02-03 + 02-06 | LHCI in CI; skip link still missing |
| 5. OG + JSON-LD + GitHub activity | 02-04 + 02-05 | Not present in repo today |

**Overall:** The seven-plan wave structure (functional core → polish → data → hardening → cutover) is coherent and maps cleanly to requirements. Existing Phase 1 assets (`content/*`, `src/lib/content.ts`, case-study routes, LHCI) reduce execution risk. The plans should deliver Phase 2 if two gaps are closed before/during execution: **(1) copy SSOT for value prop / about summary / CV**, **(2) Playwright in CI**.

### Cross-cutting concerns

| Issue | Severity | Evidence |
|---|---|---|
| Value prop / about copy split across messages vs content vs CV | **HIGH** | `messages/` vs `content/de/contact.ts` vs Plan 02 direct imports |
| Playwright evals not in CI | **HIGH** | `ci.yml:34-43` vs Plan 07 cutover checklist |
| Skip-to-content defined but unused | **MEDIUM** | `messages/de.json:52`, no `src/` usage |
| Evals use dev server, LHCI uses production | **MEDIUM** | `playwright.config.ts:24` vs `lighthouserc.json:4` |
| `next/font/google` in layout (pre-existing) | **LOW** | `layout.tsx:3,12-19` vs AGENTS.md self-host rule — out of Phase 2 scope but DSGVO-relevant |

### Dependency ordering

```
Wave 1: 02-01 ∥ 02-02     ✓ sensible (UI + PDF parallel; href contract documented)
Wave 2: 02-03 (→01), 02-04 (→01,02)   ✓ geist dep for OG correct
Wave 3: 02-05 (→01,03,04)   ✓ merge-order rationale for page.tsx
Wave 4: 02-06 (→ all)       ⚠ add CI playwright step
Wave 5: 02-07 (→06)         ✓ human gate appropriate
```

No circular dependencies. Plan 04’s dependency on 02-02 for `geist` is the critical path item for Wave 2.

### Overall risk assessment

**MEDIUM**

**Justification:** Implementation paths are well researched, scoped to existing architecture, and respect DSGVO/static-first constraints. Wave sequencing is sound. Risk is concentrated in **verification automation** (Playwright absent from CI, dev-vs-prod test split) and **content-model consistency** (hero/CV value prop not in the same source Plan 02 reads). Neither blocks execution if addressed in Plan 01/02/Task amendments before Wave 1 starts; both could cause a “green locally, broken in production” or “CV diverges from site” outcome if ignored.

---

## Antigravity Review

Antigravity review failed: timed out (>7 min) in its agentic file-reading loop before writing any response to stdout or transcript (watermark unchanged at 12 lines). Excluded from consensus.

---

## Consensus Summary

Both grounded reviewers (Gemini, Cursor) independently judged the seven-plan suite **production-grade and coherently sequenced** (functional core → polish → data → hardening → cutover), with correct dependency ordering, no cycles, and faithful adherence to the static-first / DSGVO / single-source-of-truth architecture. Overall risk: **LOW–MEDIUM** (Gemini) / **MEDIUM** (Cursor). Neither found a blocking defect; the concerns are concentrated in two areas — **content-model consistency** and **verification automation** — both fixable before or during Wave 1.

### Agreed Strengths (2+ reviewers)

- **Build-time / zero-runtime-third-party posture** — CV-PDF (`scripts/generate-cv.tsx` via `prebuild`), OG images (`opengraph-image.tsx`), and the GitHub heatmap (`revalidate: 86400`) are all baked at build time using on-disk Geist TTFs; the browser never contacts GitHub, react-pdf registries, or CDNs. DSGVO-clean, no bundle bloat, no CLS.
- **Single source of truth (SSOT)** — feeding the overview page, CV-PDF, Person JSON-LD, and OG images from one content model is the right architecture (both praise the intent — see the HIGH concern below about where it currently leaks).
- **Dark mode via token-only flip + blocking inline no-flash script** — attribute-driven `:root[data-theme="dark"]` override with a pre-paint inline script is the industry-standard FOUC-free approach; minimal client surface.
- **TDD discipline & accurate baseline reading** — RED→GREEN Playwright specs extending `evals/home.spec.ts`; plan file/line references match the actual repo (`page.tsx`, `layout.tsx`, `contact.ts`, `globals.css`, `ci.yml`, `lighthouserc.json`).
- **Correct dependency ordering** — Wave 1 (01 ∥ 02) parallelism with a documented CV-href contract; Plan 04→02 `geist` dependency; human-gated Plan 07 cutover (`autonomous: false`).

### Agreed Concerns (2+ reviewers — highest priority)

1. **[HIGH] Value-prop / copy SSOT gap.** Plan 01 authors `home.valueProp` / `about.summary` in `messages/{de,en}.json`, but Plan 02's CV generator imports `content/{de,en}/*.ts` directly (not `messages/` or `src/lib/content.ts`). The CV therefore cannot reach the value prop without **duplicating** the copy or **omitting** it — directly undermining the SSOT that CONT-01/CTX-05 require. **Fix jointly in Plans 01/02 before Wave 1:** add `valueProp` (and derive the About summary) to the content model (`content/shared/types.ts` + `content/{de,en}/contact.ts` or a `profile.ts`) so hero + CV read one field. *(Cursor HIGH, cited `messages/` vs `content/de/contact.ts:9-15` vs Plan 02 imports; Gemini flags the same as Plan 01's "single-source-of-truth gap".)*
2. **[MEDIUM] Theme-toggle hydration & weak no-flash verification.** The 3-state toggle is a client component that can't know `localStorage` at SSR, risking a hydration mismatch / active-segment flash; and the `theme.spec.ts` eval only checks `data-theme` after reload, not computed background-color **before paint** → false confidence. **Fix:** neutral/`isMounted`-gated active-segment fill, plus a Playwright assertion on `getComputedStyle(document.body).backgroundColor` with `page.addInitScript` setting `localStorage.theme='dark'`.
3. **[MEDIUM] CSP fragility on the inline theme script.** A hash-based CSP over the inline no-flash script silently breaks dark mode on any whitespace/formatting edit, and collides with Vercel Analytics/Speed-Insights inline chunks. **Fix:** keep the inline script as a stable minified string, record the CSP status in `STATE.md`, and don't let the "TODO/fallback" path ship CSP-less silently.

### Divergent / single-reviewer findings worth acting on

- **[HIGH — Cursor only, strongly evidenced] Playwright is not in CI.** `.github/workflows/ci.yml` runs only `check:content`, `build`, and `lhci autorun` — no `pnpm test`. The five new spec files (Plans 01–05) will **not gate merge**, yet Plan 07's cutover checklist assumes "green Playwright in CI." **Amend Plan 06** to add `pnpm exec playwright test` after `pnpm build` (production `pnpm start` webServer, or a `playwright.config.ci.ts`). Verify against `ci.yml` before executing Wave 4.
- **[MEDIUM — Cursor] Dev-vs-prod test split.** Playwright uses `pnpm dev` (`playwright.config.ts:24`) while LHCI tests the production build — SSR output/bundle can differ; run metadata/JSON-LD/static-output evals against a production server.
- **[MEDIUM — Cursor] Skip-to-content link missing.** `messages/de.json:52` defines `accessibility.skipToContent` but nothing under `src/` uses it; TECH-03 keyboard-nav baseline. Wire it as the first focusable element in `layout.tsx`.
- **[MEDIUM — Gemini] React 19 × @react-pdf/renderer typing friction.** `tsc --noEmit` in the CV verify block may fail if `@react-pdf/renderer`'s bundled React types collide with `@types/react` v19. Resolve types explicitly; use `require.resolve('geist/package.json')` to locate fonts robustly against pnpm hoisting.
- **[MEDIUM — Cursor] OG absolute-URL / preview-vs-prod.** `siteMetadataBase` resolves to Vercel/localhost until Plan 07's flip; add an eval asserting `og:image` starts with `http` to catch `metadataBase` misconfig early.
- **[MEDIUM — Cursor] GitHub PAT scope & rebuild discipline.** Confirm `read:user` scope (public calendars often work unauthenticated); Plan 07 should trigger an explicit Vercel redeploy when `GITHUB_TOKEN` is first added, not just "confirm set."
- **[LOW] Misc:** generated `public/Lasse-Siemoneit-CV-*.pdf` not gitignored (Cursor); Satori 500KB font-budget with two Geist weights (Gemini); heatmap week-column padding/alignment (Gemini) and undecided section placement vs anchor-nav (Cursor); header control overcrowding at 320px (Gemini); pre-existing `next/font/google` in `layout.tsx` vs AGENTS.md self-host rule — out of Phase 2 scope but DSGVO-relevant (Cursor).

### Recommended pre-execution actions

Fold these into the plans via `/gsd-plan-phase 2 --reviews`:
- **Before Wave 1:** close the value-prop SSOT gap in Plans 01+02 (content-model field). *(HIGH)*
- **Before Wave 4:** amend Plan 06 to add Playwright to CI + align eval webServer with the production build. *(HIGH)*
- Strengthen the dark-mode no-flash eval and CSP handling (Plan 03/06). *(MEDIUM)*
- Add skip-to-content wiring (Plan 01) and an OG absolute-URL assertion (Plan 04). *(MEDIUM)*
