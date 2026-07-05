---
phase: 02-recruiter-overview-live
plan: 03
subsystem: ui
tags: [dark-mode, tailwind4, accessibility, no-flash, react-compiler]

requires:
  - phase: 02-recruiter-overview-live
    provides: "02-01's layout.tsx header control cluster (logo | spacer | Contact | [ThemeToggle slot] | LocaleSwitcher) and globals.css token system"
provides:
  - "3-state System/Light/Dark theme toggle in the header cluster, persisted to localStorage, no-flash before paint"
  - ":root[data-theme=\"light|dark\"] attribute-driven token overrides in globals.css, winning over the @media(prefers-color-scheme) System default"
  - "viewport.themeColor media array + live <meta name=\"theme-color\"> updates on explicit toggle selection"
  - "evals/theme.spec.ts proving System default, Dark persistence across reload with no flash, and System reset"
affects: [02-04-og-seo, 02-06-build-verification, 02-07-cutover]

tech-stack:
  added: []
  patterns:
    - "Module-scope useSyncExternalStore pub/sub for reading/writing localStorage-backed UI state from a Client Component — avoids the eslint-plugin-react-hooks@7 (React Compiler) set-state-in-effect and immutability lint errors that a useState+useEffect read-on-mount pattern triggers in this codebase"
    - "Single consistent ARIA pattern per control: role=\"radiogroup\" + role=\"radio\" + aria-checked exclusively, never mixed with role=\"group\"/aria-pressed on the same control"
    - "Token-only dark mode: no @custom-variant dark registered because every surface reads color through the --background/--foreground/--muted/--accent/--border CSS custom properties — flipping those via :root[data-theme] overrides re-themes the whole page with zero dark: utilities"

key-files:
  created:
    - src/components/theme-toggle.tsx
    - evals/theme.spec.ts
  modified:
    - src/app/globals.css
    - src/app/[locale]/layout.tsx
    - messages/de.json
    - messages/en.json

key-decisions:
  - "ThemeToggle reads/writes theme state via a module-scope useSyncExternalStore store (localStorage + documentElement.dataset mutations live in a plain top-level function, not inside the component's render closure or a useEffect) rather than useState+useEffect, because eslint-plugin-react-hooks 7.1.1's React Compiler rules (set-state-in-effect, immutability) hard-error on the RESEARCH-suggested useEffect-read-on-mount pattern in this codebase's lint config"
  - "No @custom-variant dark registered — confirmed via grep that zero dark:-prefixed utilities exist anywhere in src/, so the :root[data-theme] token overrides alone satisfy TECH-04; documented in a globals.css comment per the plan's discretion clause"
  - "Each theme-toggle segment is an individually Tab-focusable <button role=\"radio\"> (not a roving-tabindex implementation) — satisfies the plan's 'implementer's choice, keep it fully keyboard-operable' allowance with the simpler of the two sanctioned WAI-ARIA radiogroup approaches"

requirements-completed: [TECH-04, TECH-03]

coverage:
  - id: D1
    description: "Visitor can choose System/Light/Dark from a keyboard-operable radiogroup toggle in the header cluster; the choice persists to localStorage and reapplies via the no-flash script before hydration"
    requirement: "TECH-04"
    verification:
      - kind: e2e
        ref: "evals/theme.spec.ts#selecting Dark sets data-theme and persists to localStorage"
        status: pass
      - kind: e2e
        ref: "evals/theme.spec.ts#Dark choice persists across reload with no flash"
        status: pass
      - kind: e2e
        ref: "evals/theme.spec.ts#selecting System clears data-theme and localStorage"
        status: pass
      - kind: e2e
        ref: "evals/theme.spec.ts#default load has no data-theme attribute (System)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The toggle uses exactly one ARIA pattern (radiogroup/radio/aria-checked) with no role=\"group\" or aria-pressed mixed in (REVIEW finding 9)"
    requirement: "TECH-03"
    verification:
      - kind: other
        ref: "node acceptance-criteria script asserting /radiogroup/ + /aria-checked/ present and /aria-pressed/ absent in theme-toggle.tsx"
        status: pass
    human_judgment: false
  - id: D3
    description: ":root[data-theme=\"light|dark\"] overrides win over @media(prefers-color-scheme), and pnpm build compiles the CSS with no Tailwind error"
    requirement: "TECH-04"
    verification:
      - kind: other
        ref: "node acceptance-criteria script asserting both [data-theme=\"dark\"] and [data-theme=\"light\"] blocks exist in globals.css"
        status: pass
      - kind: other
        ref: "pnpm build"
        status: pass
    human_judgment: false
  - id: D4
    description: "Muted-on-background AA contrast holds in both resolved themes and the toggle is keyboard-operable with a visible focus ring in both themes"
    requirement: "TECH-03"
    verification: []
    human_judgment: true
    rationale: "Contrast values were already computed and verified in the UI-SPEC (~4.9:1 light / ~6.9:1 dark) prior to this plan and the tokens are unchanged by this plan, but a visual re-check of the actual rendered toggle plus a keyboard-tab pass across System/Light/Dark is a human/visual judgment Playwright's DOM assertions don't cover — matches the plan's own manual-verification step."

duration: ~20min
completed: 2026-07-05
status: complete
---

# Phase 2 Plan 3: Dark Mode Toggle Summary

**3-state System/Light/Dark theme toggle (radiogroup/radio/aria-checked, no mixed ARIA) built on attribute-driven `:root[data-theme]` CSS overrides and a blocking no-flash inline script, with the toggle's localStorage read/write implemented via a module-scope `useSyncExternalStore` store to satisfy this codebase's React Compiler lint rules.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-07-05T10:39:27Z (per prior plan's completion)
- **Completed:** 2026-07-05T10:47:16Z
- **Tasks:** 3
- **Files modified:** 6 (4 production/i18n files + 1 new component + 1 new eval file)

## Accomplishments

- `globals.css` gained `:root[data-theme="light"]` and `:root[data-theme="dark"]` override blocks that win over the existing `@media (prefers-color-scheme: dark)` System block via CSS specificity — the System behavior from Plan 01 is fully preserved
- No `@custom-variant dark` was registered: grepped the codebase and confirmed zero `dark:`-prefixed Tailwind utilities exist, so the token-only approach (RESEARCH §3's simpler recommended path) fully covers the design; the choice is documented inline in `globals.css`
- New `src/components/theme-toggle.tsx`: a `"use client"` 3-state segmented control using exactly one ARIA pattern — `role="radiogroup"` + `role="radio"` + `aria-checked` — with no `role="group"` or `aria-pressed` anywhere (resolves REVIEW finding 9)
- Theme state is read/written through a module-scope `useSyncExternalStore` pub/sub store rather than `useState`+`useEffect`, because `eslint-plugin-react-hooks@7.1.1`'s React Compiler lint rules (`set-state-in-effect`, `immutability`) hard-error on the RESEARCH-suggested "read localStorage in a mount effect" pattern when run against this codebase's `eslint-config-next` setup — see Deviations
- `layout.tsx` gained: a static-string no-flash `<script>` as the first child of `<body>` (reads `localStorage["theme"]`, sets `documentElement.dataset.theme` before hydration, no external call), `<ThemeToggle />` mounted between the header's Contact affordance and `<LocaleSwitcher />` (D-A order), and a `viewport.themeColor` media array (`light #fafaf9` / `dark #0a0a0a`)
- `theme.{label,system,light,dark}` added to both `messages/de.json` and `messages/en.json`
- `evals/theme.spec.ts`: 4 new per-locale assertions (8 total) — System is the default with no `data-theme` attribute, selecting Dark sets the attribute + localStorage, the Dark choice survives a reload with the attribute already present before the check (proving no-flash), and reselecting System clears both the attribute and the stored value
- Regression-verified: the full pre-existing `evals/home.spec.ts` suite (22 tests) still passes unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Attribute-driven tokens + @custom-variant dark in globals.css** - `d4d4997` (feat)
2. **Task 2: ThemeToggle client control (3-state, persisted, accessible)** - `327a0f3` (feat)
3. **Task 3: No-flash inline script, toggle mount, theme-color; theme eval** - `a546ec2` (feat)

**Plan metadata:** committed together with this SUMMARY (see final commit in this plan's history)

## Files Created/Modified

- `src/app/globals.css` - `:root[data-theme="light|dark"]` override blocks + comment documenting the token-only (no `@custom-variant`) decision
- `src/components/theme-toggle.tsx` - 3-state System/Light/Dark radiogroup control, `useSyncExternalStore`-backed
- `src/app/[locale]/layout.tsx` - no-flash inline script, `<ThemeToggle />` mount, `viewport.themeColor` export
- `messages/de.json` / `messages/en.json` - `theme.{label,system,light,dark}`
- `evals/theme.spec.ts` - System-default, Dark-persistence-with-no-flash, and System-reset assertions per locale

## Decisions Made

- Used `useSyncExternalStore` with a module-scope pub/sub store instead of the RESEARCH-suggested `useState`+mount-`useEffect` pattern, because the latter triggers hard lint errors (`react-hooks/set-state-in-effect` for calling `setTheme` in an effect body, `react-hooks/immutability` for mutating `document.documentElement.dataset` from within the component's render closure) under this project's `eslint-plugin-react-hooks@7.1.1` (React Compiler) configuration. The module-scope function performing the DOM/localStorage mutation is outside the component entirely, which the linter does not flag, and `useSyncExternalStore` is React's own supported mechanism for exactly this "read external mutable state, re-render on change" case — RESEARCH §3 explicitly listed it as an accepted alternative.
- No `@custom-variant dark` registered — the design is 100% token-driven (verified via grep: zero `dark:` utility usages in `src/`), so registering an unused variant would be dead code. Documented in a `globals.css` comment so a future author knows this was a deliberate choice, not an oversight.
- Each toggle segment is an individually Tab-focusable button rather than a roving-`tabIndex` radiogroup — the plan explicitly allows either as "implementer's choice", and this is the simpler option that still satisfies full keyboard operability (native Tab order + Enter/Space activation via `<button>`).
- The `<meta name="theme-color">` update on explicit toggle selection sets the same color on both the light-media and dark-media `<meta>` tags Next's `viewport.themeColor` array emits, so the browser shows the correct color regardless of the OS preference; reselecting System restores each tag's own media-scoped color.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Replaced useState+useEffect localStorage read with useSyncExternalStore**
- **Found during:** Task 2 (ThemeToggle client control)
- **Issue:** The plan's suggested implementation (`useState` + a mount `useEffect` reading `localStorage`, and an inline `selectTheme` handler mutating `document.documentElement.dataset`) failed `pnpm lint` with hard errors from `eslint-plugin-react-hooks@7.1.1`'s React Compiler rules: `react-hooks/set-state-in-effect` (calling `setTheme` synchronously inside the mount effect) and `react-hooks/immutability` (mutating `document.documentElement.dataset` from a function defined in the component's render closure). The plan's own acceptance criteria require `pnpm lint` to be clean, so this blocked Task 2.
- **Fix:** Rewrote the component to use `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` backed by a module-scope `Set` of listeners. The `applyTheme` function that mutates `localStorage`/`document.documentElement.dataset`/`<meta>` tags is defined at module scope (outside the component), and after mutating it notifies all listeners synchronously, triggering a re-render with the new snapshot. This was explicitly listed as an accepted alternative in RESEARCH §3 ("mount useEffect ... or useSyncExternalStore").
- **Files modified:** `src/components/theme-toggle.tsx`
- **Verification:** `pnpm lint` clean (0 errors); the Task 2 acceptance-criteria script (checks for `localStorage`, `dataset.theme`, `radiogroup`, `aria-checked`, absence of `aria-pressed`) passes; `evals/theme.spec.ts` (Task 3) proves the resulting behavior — reads/writes/reload-persistence all work correctly.
- **Committed in:** `327a0f3` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The fix changes only the internal state-management mechanism of `theme-toggle.tsx`, not its external behavior, ARIA contract, styling, or any other plan requirement — all `must_haves.truths` and `acceptance_criteria` for every task were verified against the final implementation. No scope creep.

## Issues Encountered

None beyond the lint-driven deviation documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- TECH-04 (system detection + toggle) and the TECH-03 keyboard/ARIA reinforcement for this control are both satisfied
- No theme library was added and no runtime third-party call was introduced (DSGVO-clean)
- `Lasse-Siemoneit-CV-{de,en}.pdf` links and downstream plans (02-04 OG/SEO, 02-06 build verification, 02-07 cutover) are unaffected by this plan's changes
- Manual verification still outstanding (owner/verifier, not blocking commit): keyboard-tab through System → Light → Dark to confirm each shows a visible focus ring in both resolved themes, and a visual spot-check that muted-on-background contrast still reads correctly in both themes (tokens are unchanged from Plan 01, so this is a low-risk re-confirmation). Captured as `human_judgment: true` coverage entry (D4) above.
- No blockers for the next plan in this phase.

## Self-Check: PASSED

All key files confirmed present on disk (src/app/globals.css, src/components/theme-toggle.tsx, src/app/[locale]/layout.tsx, messages/de.json, messages/en.json, evals/theme.spec.ts). All three task commits (d4d4997, 327a0f3, a546ec2) confirmed present in git history. All plan `<acceptance_criteria>` re-verified: `pnpm build` succeeds, `pnpm lint` clean (0 errors), `pnpm exec tsc --noEmit` clean, the Task 1/2 node acceptance-criteria scripts pass, and `pnpm exec playwright test evals/theme.spec.ts --project=chromium` (8/8) plus the pre-existing `evals/home.spec.ts` (22/22) both pass against a `pnpm build` + `next start` production server (same environment workaround documented in 02-01-SUMMARY.md — the sandboxed shell hits `EMFILE` on `pnpm dev`'s file watcher; `playwright.config.ts` was not modified).

---
*Phase: 02-recruiter-overview-live*
*Completed: 2026-07-05*
